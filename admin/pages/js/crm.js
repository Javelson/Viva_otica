// CRM de Re-engajamento - Viva Óptica Admin
// JavaScript para gestão de fidelização e re-ativação de clientes

let currentTab = 'alertas';
let alertasData = [];
let fieisData = [];
let aniversariantesData = [];
let campanhasData = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
    loadAlertas();
    setupFormHandlers();
});

// Tab switching
function switchTab(tab) {
    currentTab = tab;

    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('border-cyan', 'text-cyan');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    document.getElementById(`tab-${tab}`).classList.remove('border-transparent', 'text-gray-500');
    document.getElementById(`tab-${tab}`).classList.add('border-cyan', 'text-cyan');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`content-${tab}`).classList.remove('hidden');

    // Load data based on tab
    switch(tab) {
        case 'alertas':
            loadAlertas();
            break;
        case 'fieis':
            loadClientesFieis();
            break;
        case 'aniversario':
            loadAniversariantes();
            break;
        case 'campanhas':
            loadCampanhas();
            break;
    }
}

// Load statistics
async function loadStatistics() {
    try {
        const { data, error } = await supabase
            .from('view_estatisticas_crm')
            .select('*')
            .single();

        if (error) throw error;

        if (data) {
            document.getElementById('stat-urgente').textContent = data.urgentes || 0;
            document.getElementById('stat-risco').textContent = data.em_risco || 0;
            document.getElementById('stat-vip').textContent = data.vip_count || 0;
            document.getElementById('stat-aniversario').textContent = data.aniversariantes || 0;

            const ticket = data.ticket_medio || 0;
            document.getElementById('stat-ticket').textContent = `Kz ${ticket.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            // Update badge
            const totalAlertas = (data.urgentes || 0) + (data.em_risco || 0) + (data.sem_exame || 0);
            document.getElementById('alert-badge').textContent = totalAlertas;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        showToast('Erro ao carregar estatísticas', 'error');
    }
}

// Load alerts
async function loadAlertas() {
    const filterPrioridade = document.getElementById('filter-prioridade').value;
    const filterTipo = document.getElementById('filter-tipo').value;

    try {
        let query = supabase
            .from('view_alertas_pendentes_completas')
            .select('*')
            .order('prioridade_desc, dias_sem_compra DESC');

        // Apply filters
        if (filterPrioridade) {
            const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
            const priorityValue = priorityOrder[filterPrioridade];
            query = query.eq('prioridade_desc', filterPrioridade.toUpperCase());
        }

        if (filterTipo) {
            query = query.eq('tipo_alerta', filterTipo);
        }

        const { data, error } = await query;

        if (error) throw error;

        alertasData = data || [];
        renderAlertas(alertasData);

    } catch (error) {
        console.error('Erro ao carregar alertas:', error);
        showToast('Erro ao carregar alertas', 'error');
    }
}

// Render alerts
function renderAlertas(alertas) {
    const container = document.getElementById('alertas-list');
    container.innerHTML = '';

    if (alertas.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-12 text-gray-500">
                <i class="fa-solid fa-check-circle text-4xl mb-3 text-green-500"></i>
                <p>Não há alertas pendentes</p>
            </div>
        `;
        return;
    }

    alertas.forEach(alerta => {
        const priorityClass = getPriorityClass(alerta.prioridade_desc);
        const typeIcon = getTypeIcon(alerta.tipo_alerta);
        const typeLabel = getTypeLabel(alerta.tipo_alerta);

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow';
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="${priorityClass} w-10 h-10 rounded-full flex items-center justify-center">
                        <i class="fa-solid ${typeIcon}"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-navy">${alerta.cliente_nome}</h3>
                        <p class="text-sm text-gray-500">${typeLabel}</p>
                    </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadgeClass(alerta.prioridade_desc)}">
                    ${alerta.prioridade_desc || 'MÉDIA'}
                </span>
            </div>

            <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Última compra:</span>
                    <span class="font-medium">${formatDate(alerta.data_ultima_compra)}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Dias sem comprar:</span>
                    <span class="font-medium text-red-600">${alerta.dias_sem_compra || 0} dias</span>
                </div>
                ${alerta.data_ultimo_exame ? `
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Último exame:</span>
                    <span class="font-medium">${formatDate(alerta.data_ultimo_exame)}</span>
                </div>
                ` : ''}
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Telefone:</span>
                    <span class="font-medium">${alerta.cliente_telefone || '-'}</span>
                </div>
            </div>

            <div class="flex gap-2">
                <button onclick="openMensagemModal(${alerta.id}, '${alerta.cliente_nome}', '${alerta.cliente_telefone || ''}')"
                    class="flex-1 bg-cyan hover:bg-cyanLight text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <i class="fa-solid fa-paper-plane mr-1"></i>
                    Enviar
                </button>
                <button onclick="processarAlerta(${alerta.id})"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <i class="fa-solid fa-check mr-1"></i>
                    Concluir
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

// Load loyal clients
async function loadClientesFieis() {
    const filterNivel = document.getElementById('filter-nivel').value;

    try {
        let query = supabase
            .from('view_clientes_fieis')
            .select('*')
            .order('nivel_fidelidade DESC, total_gasto DESC');

        if (filterNivel) {
            query = query.eq('nivel_fidelidade', filterNivel);
        }

        const { data, error } = await query;

        if (error) throw error;

        fieisData = data || [];
        renderClientesFieis(fieisData);

    } catch (error) {
        console.error('Erro ao carregar clientes fiéis:', error);
        showToast('Erro ao carregar clientes fiéis', 'error');
    }
}

// Render loyal clients
function renderClientesFieis(clientes) {
    const container = document.getElementById('fieis-list');
    container.innerHTML = '';

    if (clientes.length === 0) {
        container.innerHTML = `
            <div class="col-span-3 text-center py-12 text-gray-500">
                <i class="fa-solid fa-users text-4xl mb-3 text-purple-500"></i>
                <p>Não há clientes nesta categoria</p>
            </div>
        `;
        return;
    }

    clientes.forEach(cliente => {
        const levelBadge = getLevelBadge(cliente.nivel_fidelidade);

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow';
        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="bg-purple-100 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center">
                        <i class="fa-solid fa-crown text-xl"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-navy">${cliente.cliente_nome}</h3>
                        ${levelBadge}
                    </div>
                </div>
            </div>

            <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Compras:</span>
                    <span class="font-medium">${cliente.total_compras || 0}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Total gasto:</span>
                    <span class="font-medium text-green-600">Kz ${cliente.total_gasto?.toLocaleString('pt-AO', { minimumFractionDigits: 2 }) || 0}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Ticket médio:</span>
                    <span class="font-medium">Kz ${cliente.ticket_medio?.toLocaleString('pt-AO', { minimumFractionDigits: 2 }) || 0}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Telefone:</span>
                    <span class="font-medium">${cliente.cliente_telefone || '-'}</span>
                </div>
            </div>

            <button onclick="openMensagemModal(null, '${cliente.cliente_nome}', '${cliente.cliente_telefone || ''}')"
                class="w-full bg-cyan hover:bg-cyanLight text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <i class="fa-solid fa-paper-plane mr-1"></i>
                Enviar Mensagem
            </button>
        `;

        container.appendChild(card);
    });
}

// Load anniversaries
async function loadAniversariantes() {
    try {
        const { data, error } = await supabase
            .from('view_clientes_aniversario')
            .select('*')
            .order('dias_para_aniversario ASC');

        if (error) throw error;

        aniversariantesData = data || [];
        renderAniversariantes(aniversariantesData);

    } catch (error) {
        console.error('Erro ao carregar aniversariantes:', error);
        showToast('Erro ao carregar aniversariantes', 'error');
    }
}

// Render anniversaries
function renderAniversariantes(clientes) {
    const container = document.getElementById('aniversario-list');
    container.innerHTML = '';

    if (clientes.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-12 text-gray-500">
                <i class="fa-solid fa-birthday-cake text-4xl mb-3 text-blue-500"></i>
                <p>Não há aniversariantes nos próximos 30 dias</p>
            </div>
        `;
        return;
    }

    clientes.forEach(cliente => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow';
        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center">
                        <i class="fa-solid fa-birthday-cake text-xl"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-navy">${cliente.cliente_nome}</h3>
                        <p class="text-sm text-gray-500">${formatDate(cliente.data_nascimento)}</p>
                    </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    ${client.dias_para_aniversario} dias
                </span>
            </div>

            <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Última compra:</span>
                    <span class="font-medium">${formatDate(cliente.data_ultima_compra) || 'N/A'}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Total gasto:</span>
                    <span class="font-medium text-green-600">Kz ${cliente.total_gasto?.toLocaleString('pt-AO', { minimumFractionDigits: 2 }) || 0}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Telefone:</span>
                    <span class="font-medium">${cliente.cliente_telefone || '-'}</span>
                </div>
            </div>

            <button onclick="openMensagemModal(null, '${cliente.cliente_nome}', '${cliente.cliente_telefone || ''}')"
                class="w-full bg-cyan hover:bg-cyanLight text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <i class="fa-solid fa-paper-plane mr-1"></i>
                Enviar Parabéns
            </button>
        `;

        container.appendChild(card);
    });
}

// Load campaigns
async function loadCampanhas() {
    try {
        const { data, error } = await supabase
            .from('crm_campanhas')
            .select('*')
            .order('data_inicio DESC');

        if (error) throw error;

        campanhasData = data || [];
        renderCampanhas(campanhasData);

    } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
        showToast('Erro ao carregar campanhas', 'error');
    }
}

// Render campaigns
function renderCampanhas(campanhas) {
    const container = document.getElementById('campanhas-list');
    container.innerHTML = '';

    if (campanhas.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-12 text-gray-500">
                <i class="fa-solid fa-bullhorn text-4xl mb-3 text-cyan-500"></i>
                <p>Não há campanhas ativas</p>
            </div>
        `;
        return;
    }

    campanhas.forEach(campanha => {
        const statusClass = getStatusClass(campanha.status);

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow';
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="font-bold text-navy">${campanha.nome}</h3>
                    <p class="text-sm text-gray-500 mt-1">${campanha.descricao || ''}</p>
                </div>
                <span class="${statusClass} px-3 py-1 rounded-full text-xs font-medium">
                    ${campanha.status || 'rascunho'}
                </span>
            </div>

            <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Segmento:</span>
                    <span class="font-medium">${campanha.segmento_alvo || 'Todos'}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Canal:</span>
                    <span class="font-medium">${campanha.canal || 'WhatsApp'}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Período:</span>
                    <span class="font-medium">${formatDate(campanha.data_inicio)} - ${formatDate(campanha.data_fim) || 'Indefinido'}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Mensagens enviadas:</span>
                    <span class="font-medium">${campanha.mensagens_enviadas || 0}</span>
                </div>
            </div>

            <div class="flex gap-2">
                <button onclick="editCampaign(${campanha.id})"
                    class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <i class="fa-solid fa-edit mr-1"></i>
                    Editar
                </button>
                <button onclick="deleteCampaign(${campanha.id})"
                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <i class="fa-solid fa-times mr-1"></i>
                    Excluir
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

// Open message modal
function openMensagemModal(alertaId, clienteNome, clienteTelefone) {
    document.getElementById('mensagem-alerta-id').value = alertaId || '';
    document.getElementById('mensagem-cliente-nome').value = clienteNome;
    document.getElementById('mensagem-cliente-telefone').value = clienteTelefone || '';
    document.getElementById('mensagem-texto').value = '';

    document.getElementById('mensagem-modal').classList.remove('hidden');
}

// Process alert
async function processarAlerta(alertaId) {
    try {
        const { error } = await supabase
            .from('crm_alertas')
            .update({ status: 'concluido' })
            .eq('id', alertaId);

        if (error) throw error;

        showToast('Alerta concluído com sucesso', 'success');
        loadAlertas();
        loadStatistics();

    } catch (error) {
        console.error('Erro ao processar alerta:', error);
        showToast('Erro ao processar alerta', 'error');
    }
}

// Send message
async function enviarMensagem(event) {
    event.preventDefault();

    const alertaId = document.getElementById('mensagem-alerta-id').value;
    const canal = document.getElementById('mensagem-canal').value;
    const texto = document.getElementById('mensagem-texto').value;

    try {
        // Insert interaction
        const { error: interacaoError } = await supabase
            .from('crm_interacoes')
            .insert({
                cliente_id: null, // Will be resolved by trigger if needed
                canal,
                mensagem: texto,
                status: 'enviado'
            });

        if (interacaoError) throw interacaoError;

        // If alert ID exists, mark as processed
        if (alertaId) {
            await processarAlerta(parseInt(alertaId));
        }

        showToast('Mensagem enviada com sucesso', 'success');
        closeModal('mensagem');

    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        showToast('Erro ao enviar mensagem', 'error');
    }
}

// Generate alerts manually
async function gerarAlertas() {
    try {
        showToast('Gerando alertas...', 'info');

        const { data, error } = await supabase.rpc('gerar_alertas_reengajamento');

        if (error) throw error;

        showToast('Alertas atualizados com sucesso', 'success');
        loadAlertas();
        loadStatistics();

    } catch (error) {
        console.error('Erro ao gerar alertas:', error);
        showToast('Erro ao gerar alertas', 'error');
    }
}

// Setup form handlers
function setupFormHandlers() {
    // Message form
    const mensagemForm = document.getElementById('mensagem-form');
    if (mensagemForm) {
        mensagemForm.addEventListener('submit', enviarMensagem);
    }
}

// Helper functions
function getPriorityClass(priority) {
    const classes = {
        'URGENTE': 'bg-red-100 text-red-600',
        'ALTA': 'bg-orange-100 text-orange-600',
        'MÉDIA': 'bg-yellow-100 text-yellow-600',
        'BAIXA': 'bg-gray-100 text-gray-600'
    };
    return classes[priority] || classes['MÉDIA'];
}

function getPriorityBadgeClass(priority) {
    const classes = {
        'URGENTE': 'bg-red-100 text-red-700',
        'ALTA': 'bg-orange-100 text-orange-700',
        'MÉDIA': 'bg-yellow-100 text-yellow-700',
        'BAIXA': 'bg-gray-100 text-gray-700'
    };
    return classes[priority] || classes['MÉDIA'];
}

function getTypeIcon(type) {
    const icons = {
        'tempo_sem_compra': 'fa-shopping-cart',
        'tempo_sem_exame': 'fa-eye',
        'aniversario': 'fa-birthday-cake'
    };
    return icons[type] || 'fa-bell';
}

function getTypeLabel(type) {
    const labels = {
        'tempo_sem_compra': 'Sem Compra',
        'tempo_sem_exame': 'Sem Exame',
        'aniversario': 'Aniversário'
    };
    return labels[type] || 'Alerta';
}

function getLevelBadge(level) {
    const badges = {
        'VIP': '<span class="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">VIP</span>',
        'fiel': '<span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Fiel</span>',
        'regular': '<span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Regular</span>'
    };
    return badges[level] || badges['regular'];
}

function getStatusClass(status) {
    const classes = {
        'ativa': 'bg-green-100 text-green-700',
        'pausada': 'bg-yellow-100 text-yellow-700',
        'concluida': 'bg-gray-100 text-gray-700',
        'rascunho': 'bg-blue-100 text-blue-700'
    };
    return classes[status] || classes['rascunho'];
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch {
        return dateString;
    }
}

// Modal helpers
function closeModal(modalName) {
    document.getElementById(`${modalName}-modal`).classList.add('hidden');

    if (modalName === 'mensagem') {
        document.getElementById('mensagem-form').reset();
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        warning: 'bg-yellow-600'
    };

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    toast.className = `${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`;
    toast.innerHTML = `
        <i class="fa-solid ${icons[type]}"></i>
        <span>${message}</span>
    `;

    document.getElementById('toast-container').appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Filter functions
function filterAlertas() {
    loadAlertas();
}

function filterFieis() {
    loadClientesFieis();
}

// Campaign functions (placeholder for future implementation)
function editCampaign(campaignId) {
    showToast('Funcionalidade de editar campanha em breve', 'info');
}

function deleteCampaign(campaignId) {
    if (confirm('Tem certeza que deseja excluir esta campanha?')) {
        showToast('Campanha excluída', 'success');
        loadCampanhas();
    }
}
