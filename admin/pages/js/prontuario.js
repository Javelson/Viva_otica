// ============================================
// PRONTUÁRIO DIGITAL - Viva Óptica Admin
// Versão: 1.0
// Descrição: Gestão completa de prontuários médicos
// ============================================

let currentProntuario = null;
let selectedCliente = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Prontuário Digital - Carregando...');
    await loadProntuarios();

    // Set data atual como padrão
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('data-exame').value = now.slice(0, 16);
});

// ============================================
// CARREGAR PRONTUÁRIOS
// ============================================
async function loadProntuarios() {
    const loading = document.getElementById('loading');
    const list = document.getElementById('prontuarios-list');
    const empty = document.getElementById('empty-state');

    loading.classList.remove('hidden');
    list.innerHTML = '';
    empty.classList.add('hidden');

    try {
        const supabase = await window.getSupabase();
        if (!supabase) {
            showToast('Erro: Supabase não disponível', 'error');
            return;
        }

        const { data, error } = await supabase
            .from('view_prontuarios_completos')
            .select('*')
            .order('data_exame', { ascending: false });

        loading.classList.add('hidden');

        if (error) {
            console.error('Erro ao carregar prontuários:', error);
            showToast('Erro ao carregar prontuários', 'error');
            empty.classList.remove('hidden');
            return;
        }

        if (!data || data.length === 0) {
            empty.classList.remove('hidden');
            return;
        }

        // Renderizar lista
        data.forEach(prontuario => {
            const card = createProntuarioCard(prontuario);
            list.appendChild(card);
        });

    } catch (error) {
        console.error('Erro inesperado:', error);
        showToast('Erro inesperado ao carregar prontuários', 'error');
        loading.classList.add('hidden');
    }
}

// ============================================
// CRIAR CARD DE PRONTUÁRIO
// ============================================
function createProntuarioCard(prontuario) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-sm p-6 border-l-4 border-cyan hover:shadow-md transition-shadow';

    const dataFormatada = new Date(prontuario.data_exame).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Formatar receita
    const receitaText = formatReceita(prontuario);

    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-bold text-navy">
                        <i class="fa-solid fa-user mr-2 text-cyan"></i>
                        ${prontuario.cliente_nome || 'Cliente não identificado'}
                    </h3>
                    <span class="px-3 py-1 bg-cyan/10 text-cyan rounded-full text-xs font-medium">
                        ${prontuario.tipo_exame || 'Exame'}
                    </span>
                    ${prontuario.proximo_exame ? `
                        <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            <i class="fa-solid fa-calendar-check mr-1"></i>
 Próximo: ${new Date(prontuario.proximo_exame).toLocaleDateString('pt-PT')}
                        </span>
                    ` : ''}
                </div>
                <p class="text-sm text-gray-500">
                    <i class="fa-solid fa-calendar mr-1"></i>
                    ${dataFormatada}
                    ${prontuario.optometrista ? `• ${prontuario.optometrista}` : ''}
                </p>
            </div>
            <div class="flex gap-2">
                <button onclick="editProntuario('${prontuario.id}')"
                    class="px-4 py-2 bg-cyan/10 text-cyan rounded-lg hover:bg-cyan/20 transition-colors">
                    <i class="fa-solid fa-edit"></i>
                </button>
                <button onclick="deleteProntuario('${prontuario.id}')"
                    class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-blue-50 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-full bg-cyan text-white flex items-center justify-center font-bold text-sm">OD</div>
                    <span class="font-semibold text-navy">Olho Direito</span>
                </div>
                <div class="text-sm text-gray-700">
                    ${prontuario.od_esferico !== null ? `<span class="font-medium">SPH: ${prontuario.od_esferico}</span>` : ''}
                    ${prontuario.od_cilindrico !== null ? ` • CYL: ${prontuario.od_cilindrico}` : ''}
                    ${prontuario.od_eixo !== null ? ` • AXIS: ${prontuario.od_eixo}°` : ''}
                </div>
            </div>
            <div class="bg-pink-50 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-full bg-magenta text-white flex items-center justify-center font-bold text-sm">OE</div>
                    <span class="font-semibold text-navy">Olho Esquerdo</span>
                </div>
                <div class="text-sm text-gray-700">
                    ${prontuario.oe_esferico !== null ? `<span class="font-medium">SPH: ${prontuario.oe_esferico}</span>` : ''}
                    ${prontuario.oe_cilindrico !== null ? ` • CYL: ${prontuario.oe_cilindrico}` : ''}
                    ${prontuario.oe_eixo !== null ? ` • AXIS: ${prontuario.oe_eixo}°` : ''}
                </div>
            </div>
        </div>

        ${prontuario.dnp ? `
            <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <i class="fa-solid fa-ruler-horizontal text-cyan"></i>
                <span>DNP: <strong>${prontuario.dnp} mm</strong></span>
            </div>
        ` : ''}

        ${prontuario.observacoes ? `
            <div class="bg-gray-50 rounded-lg p-3 mt-3">
                <p class="text-xs text-gray-500 mb-1">Observações:</p>
                <p class="text-sm text-gray-700">${prontuario.observacoes}</p>
            </div>
        ` : ''}
    `;

    return card;
}

// ============================================
// FORMATAR RECEITA
// ============================================
function formatReceita(p) {
    const parts = [];
    if (p.od_esferico !== null) parts.push(`OD: SPH ${p.od_esferico}`);
    if (p.od_cilindrico !== null) parts.push(`CYL ${p.od_cilindrico}`);
    if (p.od_eixo !== null) parts.push(`AXIS ${p.od_eixo}°`);
    return parts.join(' | ');
}

// ============================================
// ABRIR MODAL
// ============================================
function openModal(prontuarioId = null) {
    const modal = document.getElementById('prontuario-modal');
    modal.classList.remove('hidden');

    if (prontuarioId) {
        document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-edit mr-2"></i>Editar Prontuário';
        loadProntuarioData(prontuarioId);
    } else {
        document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-plus mr-2"></i>Novo Prontuário';
        resetForm();
    }
}

// ============================================
// FECHAR MODAL
// ============================================
function closeModal() {
    const modal = document.getElementById('prontuario-modal');
    modal.classList.add('hidden');
    resetForm();
    selectedCliente = null;
}

// ============================================
// RESETAR FORMULÁRIO
// ============================================
function resetForm() {
    document.getElementById('prontuario-form').reset();
    document.getElementById('prontuario-id').value = '';
    document.getElementById('cliente-id').value = '';
    document.getElementById('cliente-info').classList.add('hidden');
    document.getElementById('cliente-results').classList.add('hidden');

    // Set data atual
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('data-exame').value = now.slice(0, 16);
}

// ============================================
// BUSCAR CLIENTES
// ============================================
async function searchClientes(event) {
    const searchTerm = event.target.value.trim();
    const resultsDiv = document.getElementById('cliente-results');

    if (searchTerm.length < 2) {
        resultsDiv.classList.add('hidden');
        return;
    }

    try {
        const supabase = await window.getSupabase();
        if (!supabase) return;

        const { data, error } = await supabase
            .from('clientes')
            .select('id, nome, telefone, email')
            .or(`nome.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%`)
            .limit(10);

        if (error) {
            console.error('Erro ao buscar clientes:', error);
            return;
        }

        if (!data || data.length === 0) {
            resultsDiv.classList.add('hidden');
            return;
        }

        resultsDiv.innerHTML = data.map(cliente => `
            <div onclick="selectCliente('${cliente.id}', '${cliente.nome}', '${cliente.telefone || ''}')"
                class="px-4 py-3 hover:bg-cyan-50 cursor-pointer border-b border-gray-100 last:border-0">
                <div class="font-medium text-navy">${cliente.nome}</div>
                <div class="text-sm text-gray-500">${cliente.telefone || 'Sem telefone'}</div>
            </div>
        `).join('');

        resultsDiv.classList.remove('hidden');

    } catch (error) {
        console.error('Erro:', error);
    }
}

// ============================================
// SELECIONAR CLIENTE
// ============================================
function selectCliente(id, nome, telefone) {
    selectedCliente = { id, nome, telefone };
    document.getElementById('cliente-search').value = nome;
    document.getElementById('cliente-id').value = id;
    document.getElementById('cliente-info').textContent = `Cliente selecionado: ${nome} ${telefone ? `(${telefone})` : ''}`;
    document.getElementById('cliente-info').classList.remove('hidden');
    document.getElementById('cliente-results').classList.add('hidden');
}

// ============================================
// CARREGAR DADOS DO PRONTUÁRIO
// ============================================
async function loadProntuarioData(id) {
    try {
        const supabase = await window.getSupabase();
        if (!supabase) {
            showToast('Erro: Supabase não disponível', 'error');
            return;
        }

        const { data, error } = await supabase
            .from('prontuarios')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Erro ao carregar prontuário:', error);
            showToast('Erro ao carregar dados', 'error');
            return;
        }

        currentProntuario = data;

        // Preencher formulário
        document.getElementById('prontuario-id').value = data.id;
        document.getElementById('cliente-id').value = data.cliente_id;
        document.getElementById('data-exame').value = data.data_exame.slice(0, 16);
        document.getElementById('tipo-exame').value = data.tipo_exame || 'refracao';
        document.getElementById('optometrista').value = data.optometrista || '';

        // Olho Direito
        document.getElementById('od_esferico').value = data.od_esferico || '';
        document.getElementById('od_cilindrico').value = data.od_cilindrico || '';
        document.getElementById('od_eixo').value = data.od_eixo || '';
        document.getElementById('od_adicao').value = data.od_adicao || '';

        // Olho Esquerdo
        document.getElementById('oe_esferico').value = data.oe_esferico || '';
        document.getElementById('oe_cilindrico').value = data.oe_cilindrico || '';
        document.getElementById('oe_eixo').value = data.oe_eixo || '';
        document.getElementById('oe_adicao').value = data.oe_adicao || '';

        document.getElementById('dnp').value = data.dnp || data.dnp_dual || '';
        document.getElementById('proximo_exame').value = data.proximo_exame || '';
        document.getElementById('observacoes').value = data.observacoes || '';

        // Buscar nome do cliente
        if (data.cliente_id) {
            const { data: cliente } = await supabase
                .from('clientes')
                .select('nome, telefone')
                .eq('id', data.cliente_id)
                .single();

            if (cliente) {
                document.getElementById('cliente-search').value = cliente.nome;
                document.getElementById('cliente-info').textContent =
                    `Cliente selecionado: ${cliente.nome} ${cliente.telefone ? `(${cliente.telefone})` : ''}`;
                document.getElementById('cliente-info').classList.remove('hidden');
            }
        }

    } catch (error) {
        console.error('Erro inesperado:', error);
        showToast('Erro ao carregar dados', 'error');
    }
}

// ============================================
// SALVAR PRONTUÁRIO
// ============================================
document.getElementById('prontuario-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Salvando...';

    try {
        const supabase = await window.getSupabase();
        if (!supabase) {
            showToast('Erro: Supabase não disponível', 'error');
            return;
        }

        const prontuarioId = document.getElementById('prontuario-id').value;
        const clienteId = document.getElementById('cliente-id').value;

        if (!clienteId) {
            showToast('Selecione um cliente', 'error');
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-save mr-2"></i>Salvar Prontuário';
            return;
        }

        const formData = {
            cliente_id: clienteId,
            data_exame: document.getElementById('data-exame').value,
            tipo_exame: document.getElementById('tipo-exame').value,
            optometrista: document.getElementById('optometrista').value,

            // Olho Direito
            od_esferico: parseFloat(document.getElementById('od_esferico').value) || null,
            od_cilindrico: parseFloat(document.getElementById('od_cilindrico').value) || null,
            od_eixo: parseFloat(document.getElementById('od_eixo').value) || null,
            od_adicao: parseFloat(document.getElementById('od_adicao').value) || null,

            // Olho Esquerdo
            oe_esferico: parseFloat(document.getElementById('oe_esferico').value) || null,
            oe_cilindrico: parseFloat(document.getElementById('oe_cilindrico').value) || null,
            oe_eixo: parseFloat(document.getElementById('oe_eixo').value) || null,
            oe_adicao: parseFloat(document.getElementById('oe_adicao').value) || null,

            dnp: parseFloat(document.getElementById('dnp').value) || null,
            proximo_exame: document.getElementById('proximo_exame').value || null,
            observacoes: document.getElementById('observacoes').value || null,
            ativo: true
        };

        let error;

        if (prontuarioId) {
            // Atualizar
            const result = await supabase
                .from('prontuarios')
                .update(formData)
                .eq('id', prontuarioId);
            error = result.error;
            showToast('Prontuário atualizado com sucesso!', 'success');
        } else {
            // Criar novo
            const result = await supabase
                .from('prontuarios')
                .insert([formData]);
            error = result.error;
            showToast('Prontuário criado com sucesso!', 'success');
        }

        if (error) {
            console.error('Erro ao salvar:', error);
            showToast('Erro ao salvar prontuário', 'error');
        } else {
            closeModal();
            await loadProntuarios();
        }

    } catch (error) {
        console.error('Erro inesperado:', error);
        showToast('Erro inesperado ao salvar', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-save mr-2"></i>Salvar Prontuário';
    }
});

// ============================================
// EDITAR PRONTUÁRIO
// ============================================
async function editProntuario(id) {
    openModal(id);
}

// ============================================
// DELETAR PRONTUÁRIO
// ============================================
async function deleteProntuario(id) {
    if (!confirm('Tem certeza que deseja excluir este prontuário? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        const supabase = await window.getSupabase();
        if (!supabase) {
            showToast('Erro: Supabase não disponível', 'error');
            return;
        }

        const { error } = await supabase
            .from('prontuarios')
            .update({ ativo: false })  // Soft delete
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar:', error);
            showToast('Erro ao excluir prontuário', 'error');
        } else {
            showToast('Prontuário excluído com sucesso!', 'success');
            await loadProntuarios();
        }

    } catch (error) {
        console.error('Erro inesperado:', error);
        showToast('Erro inesperado ao excluir', 'error');
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-cyan-500'
    };

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    toast.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg mb-3 flex items-center gap-3 animate-slide-in`;
    toast.innerHTML = `
        <i class="fa-solid ${icons[type]}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// UTILITÁRIOS
// ============================================
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        window.location.href = '../login.html';
    }
}
