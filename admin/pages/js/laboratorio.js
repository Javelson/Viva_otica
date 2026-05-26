// ============================================
// FLUXO DE LABORATÓRIO - Viva Óptica Admin
// Versão: 1.0
// Descrição: Gestão completa de ordens de produção
// ============================================

let currentWorkOrder = null;
let selectedCliente = null;

// Status definitions
const STATUS_CONFIG = {
    conferencia: {
        label: 'Em Conferência',
        color: 'blue',
        icon: 'fa-clipboard-check',
        bg: 'bg-blue-100',
        text: 'text-blue-700'
    },
    enviado_lab: {
        label: 'Enviado ao Laboratório',
        color: 'yellow',
        icon: 'fa-shipping-fast',
        bg: 'bg-yellow-100',
        text: 'text-yellow-700'
    },
    em_producao: {
        label: 'Em Produção',
        color: 'purple',
        icon: 'fa-cogs',
        bg: 'bg-purple-100',
        text: 'text-purple-700'
    },
    controle_qualidade: {
        label: 'Controle de Qualidade',
        color: 'orange',
        icon: 'fa-check-double',
        bg: 'bg-orange-100',
        text: 'text-orange-700'
    },
    pronto: {
        label: 'Pronto',
        color: 'green',
        icon: 'fa-check-circle',
        bg: 'bg-green-100',
        text: 'text-green-700'
    },
    entregue: {
        label: 'Entregue',
        color: 'gray',
        icon: 'fa-box-open',
        bg: 'bg-gray-100',
        text: 'text-gray-700'
    },
    cancelado: {
        label: 'Cancelado',
        color: 'red',
        icon: 'fa-ban',
        bg: 'bg-red-100',
        text: 'text-red-700'
    }
};

// Priority definitions
const PRIORITY_CONFIG = {
    baixa: { label: 'Baixa', color: 'gray', icon: 'fa-arrow-down' },
    normal: { label: 'Normal', color: 'blue', icon: 'fa-minus' },
    alta: { label: 'Alta', color: 'orange', icon: 'fa-arrow-up' },
    urgente: { label: 'Urgente', color: 'red', icon: 'fa-exclamation' }
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Fluxo de Laboratório - Carregando...');
    await loadWorkOrders();
    await loadStats();

    // Set data mínima como hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('prazo_entrega').min = today;
});

// ============================================
// CARREGAR ESTATÍSTICAS
// ============================================
async function loadStats() {
    try {
        const supabase = await window.getSupabase();
        if (!supabase) return;

        const { data } = await supabase
            .from('view_work_orders_por_status')
            .select('*');

        if (data) {
            data.forEach(stat => {
                const element = document.getElementById(`stat-${stat.status}`);
                if (element) {
                    element.textContent = stat.total || 0;
                }
            });
        }

        // Carregar atrasados
        const { data: atrasadas } = await supabase
            .from('view_work_orders_atrasadas')
            .select('id');

        const statAtrasado = document.getElementById('stat-atrasado');
        if (statAtrasado) {
            statAtrasado.textContent = atrasadas ? atrasadas.length : 0;
        }

    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// ============================================
// CARREGAR WORK ORDERS
// ============================================
async function loadWorkOrders() {
    const grid = document.getElementById('work-orders-grid');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty-state');

    loading.classList.remove('hidden');
    grid.innerHTML = '';
    empty.classList.add('hidden');

    try {
        const supabase = await window.getSupabase();
        if (!supabase) {
            showToast('Erro: Supabase não disponível', 'error');
            return;
        }

        let query = supabase
            .from('view_work_orders_completas')
            .select('*')
            .order('data_criacao', { ascending: false });

        // Aplicar filtros
        const search = document.getElementById('search').value.toLowerCase();
        const status = document.getElementById('filter-status').value;
        const priority = document.getElementById('filter-priority').value;
        const type = document.getElementById('filter-type').value;

        if (search) {
            query = query.or(`numero_ordem.ilike.%${search}%,cliente_nome.ilike.%${search}%`);
        }
        if (status) {
            query = query.eq('status', status);
        }
        if (priority) {
            query = query.eq('prioridade', priority);
        }
        if (type) {
            query = query.eq('tipo_produto', type);
        }

        const { data, error } = await query;

        loading.classList.add('hidden');

        if (error) {
            console.error('Erro ao carregar work orders:', error);
            showToast('Erro ao carregar ordens', 'error');
            empty.classList.remove('hidden');
            return;
        }

        if (!data || data.length === 0) {
            empty.classList.remove('hidden');
            return;
        }

        // Renderizar cards
        data.forEach(wo => {
            const card = createWorkOrderCard(wo);
            grid.appendChild(card);
        });

        // Atualizar stats novamente
        await loadStats();

    } catch (error) {
        console.error('Erro inesperado:', error);
        showToast('Erro inesperado', 'error');
        loading.classList.add('hidden');
    }
}

// ============================================
// CRIAR CARD DE WORK ORDER
// ============================================
function createWorkOrderCard(wo) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-sm p-5 work-order-card border-l-4 transition-all cursor-pointer';

    // Cor da borda baseada no status
    const statusConfig = STATUS_CONFIG[wo.status] || STATUS_CONFIG.conferencia;
    card.style.borderLeftColor = `var(--${statusConfig.color}-500)`;

    // Cor da prioridade
    const priorityConfig = PRIORITY_CONFIG[wo.prioridade] || PRIORITY_CONFIG.normal;

    const dataCriacao = new Date(wo.data_criacao).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const prazoFormatado = wo.prazo_entrega_estimado
        ? new Date(wo.prazo_entrega_estimado).toLocaleDateString('pt-PT')
        : '-';

    // Verificar se está atrasado
    const isAtrasado = wo.dias_atraso !== null && wo.dias_atraso > 0;
    const prazoClass = isAtrasado ? 'text-red-600 font-bold' : 'text-gray-600';

    card.innerHTML = `
        <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-lg font-bold text-navy">${wo.numero_ordem}</h3>
                    <span class="px-2 py-1 ${statusConfig.bg} ${statusConfig.text} rounded-full text-xs font-medium flex items-center">
                        <i class="fa-solid ${statusConfig.icon} mr-1"></i>
                        ${statusConfig.label}
                    </span>
                </div>
                <p class="text-sm text-gray-500">
                    <i class="fa-solid fa-user mr-1"></i>
                    ${wo.cliente_nome || 'Cliente não identificado'}
                </p>
            </div>
            <div class="text-right">
                <span class="px-2 py-1 bg-${priorityConfig.color}-100 text-${priorityConfig.color}-700 rounded text-xs font-medium flex items-center justify-end">
                    <i class="fa-solid ${priorityConfig.icon} mr-1"></i>
                    ${priorityConfig.label}
                </span>
            </div>
        </div>

        <div class="mb-3">
            <div class="text-sm text-gray-600 mb-1">
                <span class="font-medium">${wo.tipo_produto.charAt(0).toUpperCase() + wo.tipo_produto.slice(1)}</span>
                ${wo.marca ? `• ${wo.marca}` : ''}
                ${wo.modelo ? `• ${wo.modelo}` : ''}
            </div>
            ${wo.indice_refracao ? `
                <div class="text-xs text-gray-500">
                    Índice: ${wo.indice_refracao}
                    ${wo.tratamento ? ` • ${wo.tratamento}` : ''}
                </div>
            ` : ''}
        </div>

        <div class="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div class="bg-gray-50 rounded p-2">
                <div class="text-xs text-gray-500">Criado em</div>
                <div class="font-medium text-navy">${dataCriacao}</div>
            </div>
            <div class="bg-gray-50 rounded p-2">
                <div class="text-xs text-gray-500">Prazo</div>
                <div class="${prazoClass} font-medium">${prazoFormatado}</div>
                ${isAtrasado ? `<div class="text-xs text-red-600 font-bold">Atrasado: ${wo.dias_atraso} dias</div>` : ''}
            </div>
        </div>

        ${wo.responsavel_producao ? `
            <div class="text-xs text-gray-500 mb-2">
                <i class="fa-solid fa-user-check mr-1"></i>
                Produção: ${wo.responsavel_producao}
            </div>
        ` : ''}

        <div class="flex gap-2 pt-3 border-t">
            <button onclick="openStatusModal('${wo.id}')"
                class="flex-1 px-3 py-2 bg-cyan/10 text-cyan rounded-lg hover:bg-cyan/20 transition-colors text-sm font-medium">
                <i class="fa-solid fa-arrow-right mr-1"></i>
                Avançar
            </button>
            <button onclick="editWorkOrder('${wo.id}')"
                class="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                <i class="fa-solid fa-edit"></i>
            </button>
            <button onclick="viewDetails('${wo.id}')"
                class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <i class="fa-solid fa-eye"></i>
            </button>
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            viewDetails(wo.id);
        }
    });

    return card;
}

// ============================================
// ABRIR MODAL DE NOVA ORDEM
// ============================================
function openModal(workOrderId = null) {
    const modal = document.getElementById('workorder-modal');
    modal.classList.remove('hidden');

    if (workOrderId) {
        document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-edit mr-2"></i>Editar Ordem';
        loadWorkOrderData(workOrderId);
    } else {
        document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-plus mr-2"></i>Nova Ordem de Produção';
        resetForm();
    }
}

// ============================================
// FECHAR MODAL
// ============================================
function closeModal() {
    const modal = document.getElementById('workorder-modal');
    modal.classList.add('hidden');
    resetForm();
    selectedCliente = null;
}

// ============================================
// RESETAR FORMULÁRIO
// ============================================
function resetForm() {
    document.getElementById('workorder-form').reset();
    document.getElementById('workorder-id').value = '';
    document.getElementById('cliente-id').value = '';
    document.getElementById('cliente-search').value = '';
    document.getElementById('cliente-results').classList.add('hidden');

    // Set data mínima
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('prazo_entrega').min = today;
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
    document.getElementById('cliente-results').classList.add('hidden');
}

// ============================================
// TRACKING DE TRATAMENTO
// ============================================
document.getElementById('tratamento')?.addEventListener('change', function(e) {
    const personalizadoDiv = document.getElementById('tratamento_personalizado_div');
    if (e.target.value === 'personalizado') {
        personalizadoDiv.classList.remove('hidden');
    } else {
        personalizadoDiv.classList.add('hidden');
    }
});

// ============================================
// SALVAR WORK ORDER
// ============================================
document.getElementById('workorder-form').addEventListener('submit', async (e) => {
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

        const clienteId = document.getElementById('cliente-id').value;

        if (!clienteId) {
            showToast('Selecione um cliente', 'error');
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-save mr-2"></i>Criar Ordem';
            return;
        }

        // Preparar dados
        const formData = {
            cliente_id: clienteId,
            tipo_produto: document.getElementById('tipo_produto').value,
            marca: document.getElementById('marca').value || null,
            modelo: document.getElementById('modelo').value || null,
            cor: document.getElementById('cor_tamanho').value || null,

            indice_refracao: document.getElementById('indice_refracao').value || null,
            tratamento: document.getElementById('tratamento').value || null,
            tratamento_personalizado: document.getElementById('tratamento_personalizado').value || null,

            od_esferico: parseFloat(document.getElementById('od_esferico').value) || null,
            od_cilindrico: parseFloat(document.getElementById('od_cilindrico').value) || null,
            od_eixo: parseFloat(document.getElementById('od_eixo').value) || null,
            oe_esferico: parseFloat(document.getElementById('oe_esferico').value) || null,
            oe_cilindrico: parseFloat(document.getElementById('oe_cilindrico').value) || null,
            oe_eixo: parseFloat(document.getElementById('oe_eixo').value) || null,
            dnp: parseFloat(document.getElementById('dnp').value) || null,

            prazo_entrega_estimado: document.getElementById('prazo_entrega').value,
            prioridade: document.getElementById('prioridade').value,
            taxa_emergencia: document.getElementById('taxa_emergencia').checked,
            observacoes: document.getElementById('observacoes').value || null,
            ativo: true
        };

        const workOrderId = document.getElementById('workorder-id').value;

        let error;

        if (workOrderId) {
            // Atualizar
            const result = await supabase
                .from('work_orders')
                .update(formData)
                .eq('id', workOrderId);
            error = result.error;
            showToast('Ordem atualizada com sucesso!', 'success');
        } else {
            // Criar novo usando função
            const result = await supabase.rpc('criar_work_order', {
                p_cliente_id: clienteId,
                p_prontuario_id: null,
                p_tipo_produto: formData.tipo_produto,
                p_marca: formData.marca,
                p_modelo: formData.modelo,
                p_indice_refracao: formData.indice_refracao,
                p_tratamento: formData.tratamento,
                p_od_esferico: formData.od_esferico,
                p_od_cilindrico: formData.od_cilindrico,
                p_od_eixo: formData.od_eixo,
                p_oe_esferico: formData.oe_esferico,
                p_oe_cilindrico: formData.oe_cilindrico,
                p_oe_eixo: formData.oe_eixo,
                p_dnp: formData.dnp,
                p_prazo_entrega: formData.prazo_entrega_estimado,
                p_prioridade: formData.prioridade,
                p_observacoes: formData.observacoes
            });
            error = result.error;
            showToast('Ordem de produção criada com sucesso!', 'success');
        }

        if (error) {
            console.error('Erro ao salvar:', error);
            showToast('Erro ao salvar ordem', 'error');
        } else {
            closeModal();
            await loadWorkOrders();
            await loadStats();
        }

    } catch (error) {
        console.error('Erro inesperado:', error);
        showToast('Erro inesperado ao salvar', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-save mr-2"></i>Criar Ordem';
    }
});

// ============================================
// MODAL DE STATUS
// ============================================
async function openStatusModal(workOrderId) {
    currentWorkOrder = workOrderId;
    document.getElementById('status-workorder-id').value = workOrderId;
    document.getElementById('status-modal').classList.remove('hidden');
}

function updateStatusOptions() {
    const novoStatus = document.getElementById('status-novo').value;
    const observacoesField = document.getElementById('status-observacoes');

    // Sugestões de observações por status
    const sugestoes = {
        conferencia: 'Conferência de dados e materiais concluída',
        enviado_lab: 'Pedido enviado ao laboratório para produção',
        em_producao: 'Início da produção das lentes',
        controle_qualidade: 'Produção concluída, iniciando controle de qualidade',
        pronto: 'Lentes prontas e aprovadas, aguardando retirada pelo cliente',
        entregue: 'Pedido entregue ao cliente com sucesso',
        cancelado: 'Pedido cancelado pelo cliente/laboratório'
    };

    if (sugestoes[novoStatus]) {
        observacoesField.placeholder = sugestoes[novoStatus];
    }
}

async function confirmStatusUpdate() {
    const novoStatus = document.getElementById('status-novo').value;
    const observacoes = document.getElementById('status-observacoes').value;

    if (!novoStatus) {
        showToast('Selecione um novo status', 'error');
        return;
    }

    try {
        const supabase = await window.getSupabase();
        if (!supabase) {
            showToast('Erro: Supabase não disponível', 'error');
            return;
        }

        const responsavel = 'Admin'; // Poderia vir do perfil do usuário

        const { error } = await supabase.rpc('atualizar_status_work_order', {
            p_work_order_id: currentWorkOrder,
            p_novo_status: novoStatus,
            p_observacoes: observacoes,
            p_responsavel: responsavel
        });

        if (error) {
            console.error('Erro ao atualizar status:', error);
            showToast('Erro ao atualizar status', 'error');
        } else {
            showToast('Status atualizado com sucesso!', 'success');
            document.getElementById('status-modal').classList.add('hidden');
            await loadWorkOrders();
            await loadStats();
        }

    } catch (error) {
        console.error('Erro inesperado:', error);
        showToast('Erro inesperado', 'error');
    }
}

// ============================================
// UTILITÁRIOS
// ============================================
function editWorkOrder(id) {
    openModal(id);
}

function viewDetails(id) {
    showToast('Funcionalidade de detalhes em breve', 'info');
}

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

    toast.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg mb-3 flex items-center gap-3`;
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

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        window.location.href = '../login.html';
    }
}
