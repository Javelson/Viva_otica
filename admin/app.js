// ============================================
// ESTADO GLOBAL
// ============================================
let agendamentos = [];
let produtos = [];
let clientes = [];
let configuracoes = [];
let slides = []; // Array principal de slides
let currentSlide = null; // Para edição
let currentSlideImage = null; // Arquivo de imagem selecionado
let isUploadingSlide = false; // Estado de upload
let consultas = []; // Array principal de consultas
let currentConsulta = null; // Para edição


// ============================================
// NOTIFICACOES TOAST
// ============================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  toast.className = `admin-toast ${colors[type] || colors.info} text-white px-6 py-3 shadow-lg transform translate-y-[-20px] opacity-0 transition-all duration-300`;
  
  // Determinar ícone baseado no tipo
  const getIconClass = () => {
    switch(type) {
      case 'success': return 'check-circle';
      case 'error': return 'times-circle';
      case 'warning': return 'exclamation-circle';
      default: return 'info-circle';
    }
  };
  
  toast.innerHTML = `
    <div class="flex items-center">
      <i class="fa-solid fa-${getIconClass()} mr-3"></i>
      <span>${message}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-[-20px]', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-[-20px]', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


// ============================================
// NAVEGACAO E RENDERIZACAO DE SECOES
// ============================================
function setupNavigation() {
  console.log('[NAV] Configurando navegação...');

  // Desktop sidebar
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  console.log('[NAV] Found', sidebarItems.length, 'sidebar items');

  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      console.log('[NAV] Clicked section:', section);
      navigateToSection(section);
    });
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Tem certeza que deseja terminar sessão?')) {
        await globalThis.supabase.auth.signOut();
        globalThis.location.href = '../index.html';
      }
    });
  }
}

function navigateToSection(section) {
  console.log('[NAV] Navegando para:', section);

  // Atualizar classe activa no menu
  document.querySelectorAll('.sidebar-item').forEach(item => {
    if (item.dataset.section === section) {
      item.classList.add('sidebar-active');
    } else {
      item.classList.remove('sidebar-active');
    }
  });

  // Atualizar titulo da pagina
  const titles = {
    dashboard: 'Dashboard',
    slideshow: 'Slideshow',
    produtos: 'Produtos',
    lentes: 'Lentes',
    acessorios: 'Acessórios',
    paginas: 'Páginas',
    agendamentos: 'Agendamentos',
    consultas: 'Consultas',
    clientes: 'Clientes'
  };
  document.getElementById('page-title').textContent = titles[section] || 'Dashboard';

  // Renderizar secção correspondente
  const renderFunctions = {
    dashboard: renderDashboard,
    slideshow: renderSlideshow,
    produtos: () => loadProductsFromSupabase().then(products => renderProdutosUI(products)),
    lentes: () => loadProductsFromSupabase().then(products => renderProdutosUI(products.filter(p => p.categoria === 'lente'))),
    acessorios: () => loadProductsFromSupabase().then(products => renderProdutosUI(products.filter(p => p.categoria === 'acessorio'))),
    paginas: renderPaginas,
    agendamentos: renderAgendamentos,
    consultas: renderConsultas,
    clientes: renderClientes
  };

  if (renderFunctions[section]) {
    console.log('[NAV] Renderizando:', section);
    renderFunctions[section]();
  } else {
    console.error('[NAV] Secção não encontrada:', section);
  }
}


// ============================================
// FUNCOES DE AGENDAMENTOS - CRUD COMPLETO
// ============================================
let currentEditingAppointment = null;

async function showAddAppointmentModal() {
  currentEditingAppointment = null;

  const main = document.getElementById('main-content');
  if (!main) return;

  // Create modal backdrop
  const modal = document.createElement('div');
  modal.id = 'appointment-modal';
  modal.className = 'admin-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="admin-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
      <div class="admin-modal-header">
        <h3><i class="fa-solid fa-calendar-plus"></i>Novo Agendamento</h3>
        <button onclick="closeAppointmentModal()" class="text-white/60 hover:text-white transition-colors">
          <i class="fa-solid fa-times text-lg"></i>
        </button>
      </div>

      <form id="appointment-form" class="admin-modal-body space-y-4">
        <!-- Cliente Nome -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente *</label>
          <input type="text" id="cliente_nome" name="cliente_nome" required
            class="admin-input"
            placeholder="Digite o nome completo">
        </div>

        <!-- Cliente Telefone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
          <input type="tel" id="cliente_telefone" name="cliente_telefone" required
            class="admin-input"
            placeholder="+244 XXX XXX XXX">
        </div>

        <!-- Cliente Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" id="cliente_email" name="cliente_email"
            class="admin-input"
            placeholder="cliente@email.com">
        </div>

        <!-- Data e Hora -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data *</label>
            <input type="date" id="data_hora" name="data_hora" required
              class="admin-input">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
            <input type="time" id="data_hora_time" name="data_hora_time" required
              class="admin-input">
          </div>
        </div>

        <!-- Serviço Principal -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Serviço Principal *</label>
          <select id="servico_principal" name="servico_principal" required
            class="admin-input">
            <option value="">Selecione um serviço</option>
            <option value="Consultação Geral">Consultação Geral</option>
            <option value="Exame de Visão">Exame de Visão</option>
            <option value="Ajuste de Armação">Ajuste de Armação</option>
            <option value="Substituição de Lentes">Substituição de Lentes</option>
            <option value="Limpeza de Equipamento">Limpeza de Equipamento</option>
          </select>
        </div>

        <!-- Observações -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea id="observacoes" name="observacoes" rows="3"
            class="admin-input"
            placeholder="Observações adicionais..."></textarea>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
          <select id="status" name="status" required
            class="admin-input">
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="feito">Feito</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <!-- Botões -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onclick="closeAppointmentModal()"
            class="admin-btn-secondary">
            Cancelar
          </button>
          <button type="submit" id="submit-appointment-btn"
            class="admin-btn-primary">
            Salvar Agendamento
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Form submission handler
  const form = document.getElementById('appointment-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveAppointment();
  });

  // Focus first input
  document.getElementById('cliente_nome').focus();
}

function closeAppointmentModal() {
  const modal = document.getElementById('appointment-modal');
  if (modal) {
    modal.remove();
    currentEditingAppointment = null;
  }
}

async function saveAppointment() {
  const form = document.getElementById('appointment-form');
  const submitBtn = document.getElementById('submit-appointment-btn');

  if (!form || !submitBtn) {
    console.error('[SAVE] Form ou botão não encontrados');
    return;
  }

  // Validation
  const cliente_nome = document.getElementById('cliente_nome').value.trim();
  const cliente_telefone = document.getElementById('cliente_telefone').value.trim();
  const data_hora_date = document.getElementById('data_hora').value;
  const data_hora_time = document.getElementById('data_hora_time').value;
  const servico_principal = document.getElementById('servico_principal').value;
  const observacoes = document.getElementById('observacoes').value.trim();
  const status = document.getElementById('status').value;

  console.log('[SAVE] Validação - cliente_nome:', cliente_nome, 'telefone:', cliente_telefone);

  // Required fields validation
  if (!cliente_nome || !cliente_telefone || !data_hora_date || !data_hora_time || !servico_principal) {
    showToast('Por favor, preencha todos os campos obrigatórios*', 'error');
    console.error('[SAVE] Campos obrigatórios faltando');
    return;
  }

  // Verificar duplicados (mesmo cliente + mesma data, ignorando edições)
  if (!currentEditingAppointment?.id) {
    const { data: existing } = await globalThis.supabase
      .from('agendamentos')
      .select('id')
      .eq('cliente_nome', cliente_nome)
      .eq('data', data_hora_date)
      .limit(1);

    if (existing && existing.length > 0) {
      showToast('Já existe um agendamento para este cliente nesta data', 'error');
      return;
    }
  }

  // Combine date and time - Corrigir formato de data
  let data_hora;
  try {
    // Criar data combinada no formato ISO
    const dateTimeString = `${data_hora_date}T${data_hora_time}:00`;
    data_hora = new Date(dateTimeString);
    console.log('[SAVE] Data combinada:', data_hora.toISOString());
  } catch (dateError) {
    console.error('[SAVE] Erro ao criar data:', dateError);
    showToast('Erro no formato da data/hora', 'error');
    return;
  }

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Salvando...';

  const appointmentData = {
    servico: servico_principal || null,
    data: data_hora_date,
    hora: data_hora_time + ':00',
    observacoes: observacoes || null,
    status: status,
    cliente_nome: cliente_nome,
    cliente_telefone: cliente_telefone
  };

  console.log('[SAVE] Dados do agendamento:', appointmentData);

  try {
    let result;

    if (currentEditingAppointment?.id) {
      // Update existing appointment
      console.log('[SAVE] Atualizando agendamento ID:', currentEditingAppointment.id);
      const { data, error } = await globalThis.supabase
        .from('agendamentos')
        .update(appointmentData)
        .eq('id', currentEditingAppointment.id)
        .select();

      if (error) {
        console.error('[SAVE] Erro Supabase ao atualizar:', error);
        throw error;
      }
      result = data[0];
      showToast('Agendamento atualizado com sucesso!', 'success');
    } else {
      // Create new appointment
      console.log('[SAVE] Criando novo agendamento');
      const { data, error } = await globalThis.supabase
        .from('agendamentos')
        .insert([appointmentData])
        .select();

      if (error) {
        console.error('[SAVE] Erro Supabase ao criar:', error);
        throw error;
      }
      result = data[0];
      showToast('Agendamento criado com sucesso!', 'success');
    }

    console.log('[SAVE] Resultado:', result);

    // Reload agendamentos and re-render
    await loadAgendamentos();
    renderAgendamentos();
    closeAppointmentModal();

  } catch (error) {
    console.error('[SAVE] Erro completo ao salvar agendamento:', error);
    console.error('[SAVE] Detalhes do erro:', error.message);
    console.error('[SAVE] Tratamento de erro Supabase:', JSON.stringify(error, null, 2));
    showToast('Erro ao salvar agendamento: ' + (error.message || 'Erro desconhecido'), 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = currentEditingAppointment ? 'Atualizar Agendamento' : 'Salvar Agendamento';
  }
}

async function editAppointment(appointmentId) {
  try {
    const { data, error } = await globalThis.supabase
      .from('agendamentos')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (error) throw error;

    currentEditingAppointment = data;

    const main = document.getElementById('main-content');
    if (!main) return;

    const modal = document.createElement('div');
    modal.id = 'appointment-modal';
    modal.className = 'admin-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="admin-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div class="admin-modal-header">
          <h3><i class="fa-solid fa-calendar-pen"></i>Editar Agendamento</h3>
          <button onclick="closeAppointmentModal()" class="text-white/60 hover:text-white transition-colors">
            <i class="fa-solid fa-times text-lg"></i>
          </button>
        </div>

        <form id="appointment-form" class="admin-modal-body space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente *</label>
            <input type="text" id="cliente_nome" name="cliente_nome" value="${data.cliente_nome || ''}" required
              class="admin-input">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
            <input type="tel" id="cliente_telefone" name="cliente_telefone" value="${data.cliente_telefone || ''}" required
              class="admin-input">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="cliente_email" name="cliente_email" value="${data.cliente_email || ''}" readonly
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              placeholder="Este campo não é armazenado">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input type="date" id="data_hora" name="data_hora" value="${data.data ? new Date(data.data).toISOString().split('T')[0] : ''}" required
                class="admin-input">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
              <input type="time" id="data_hora_time" name="data_hora_time" value="${data.hora ? data.hora.substring(0,5) : ''}" required
                class="admin-input">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Serviço Principal *</label>
            <select id="servico_principal" name="servico_principal" required
              class="admin-input">
              <option value="">Selecione um serviço</option>
              <option value="Consultação Geral" ${data.servico === 'Consultação Geral' ? 'selected' : ''}>Consultação Geral</option>
              <option value="Exame de Visão" ${data.servico === 'Exame de Visão' ? 'selected' : ''}>Exame de Visão</option>
              <option value="Ajuste de Armação" ${data.servico === 'Ajuste de Armação' ? 'selected' : ''}>Ajuste de Armação</option>
              <option value="Substituição de Lentes" ${data.servico === 'Substituição de Lentes' ? 'selected' : ''}>Substituição de Lentes</option>
              <option value="Limpeza de Equipamento" ${data.servico === 'Limpeza de Equipamento' ? 'selected' : ''}>Limpeza de Equipamento</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea id="observacoes" name="observacoes" rows="3"
              class="admin-input">${data.observacoes || ''}</textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select id="status" name="status" required
              class="admin-input">
              <option value="pendente" ${data.status === 'pendente' ? 'selected' : ''}>Pendente</option>
              <option value="confirmado" ${data.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
              <option value="feito" ${data.status === 'feito' ? 'selected' : ''}>Feito</option>
              <option value="concluido" ${data.status === 'concluido' ? 'selected' : ''}>Concluído</option>
              <option value="cancelado" ${data.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onclick="closeAppointmentModal()"
              class="admin-btn-secondary">
              Cancelar
            </button>
            <button type="submit" id="submit-appointment-btn"
              class="admin-btn-primary">
              Atualizar Agendamento
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const form = document.getElementById('appointment-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveAppointment();
    });

  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    showToast('Erro ao carregar dados do agendamento', 'error');
  }
}

async function deleteAppointment(appointmentId) {
  if (!confirm('Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.')) {
    return;
  }

  try {
    const { error } = await globalThis.supabase
      .from('agendamentos')
      .delete()
      .eq('id', appointmentId);

    if (error) throw error;

    showToast('Agendamento excluído com sucesso!', 'success');
    await loadAgendamentos();
    renderAgendamentos();

  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    showToast('Erro ao excluir agendamento', 'error');
  }
}

async function handleUpdateStatus(appointmentId) {
  try {
    console.log('🔍 [DEBUG] Atualizando agendamento:', appointmentId);
    const { data, error } = await globalThis.supabase
      .from('agendamentos')
      .update({ status: 'feito' })
      .eq('id', appointmentId)
      .select();

    console.log('🔍 [DEBUG] Resultado update agendamento:', { data, error });
    if (error) throw error;

    showToast('Agendamento marcado como Feito!', 'success');
    await loadAgendamentos();
    renderAgendamentos();
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    if (error.code === '42501' || error.message?.includes('policy')) {
      showToast('Erro de permissão (RLS): não autorizado a alterar este agendamento.', 'error');
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      showToast('Erro de conexão: verifique sua internet e tente novamente.', 'error');
    } else {
      showToast('Erro ao atualizar status: ' + (error.message || 'Erro desconhecido'), 'error');
    }
  }
}

// ============================================
// FUNCOES DE AGENDAMENTOS
// ============================================
async function loadAgendamentos() {
  try {
    const { data, error } = await globalThis.supabase
      .from('agendamentos')
      .select('*')
      .order('data', { ascending: false })
      .order('hora', { ascending: false });

    if (error) throw error;
    agendamentos = data || [];
    console.log('[LOAD] Agendamentos carregados:', agendamentos.length);
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);
  }
}

function filtrarAgendamentos() {
  const input = document.getElementById('agendamentos-search');
  if (!input) return;

  const termo = input.value.trim().toLowerCase();
  const tbody = document.getElementById('agendamentos-table-body');
  const emptyMsg = document.getElementById('agendamentos-empty-search');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  let visiveis = 0;

  rows.forEach(row => {
    const cliente = row.dataset.cliente || '';
    const servico = row.dataset.servico || '';
    const status = row.dataset.status || '';
    const match = cliente.includes(termo) || servico.includes(termo) || status.includes(termo);
    row.style.display = match ? '' : 'none';
    if (match) visiveis++;
  });

  if (emptyMsg) {
    emptyMsg.classList.toggle('hidden', visiveis > 0);
  }
}

function renderAgendamentos() {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="p-6 animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800 tracking-tight">Agendamentos</h2>
        <button onclick="showAddAppointmentModal()" class="admin-btn-primary flex items-center gap-2">
          <i class="fa-solid fa-plus"></i>Novo Agendamento
        </button>
      </div>

      ${agendamentos.length === 0 ? '' : `
        <div class="mb-5">
          <div class="relative max-w-md">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i class="fa-solid fa-magnifying-glass text-gray-400 text-sm"></i>
            </div>
            <input type="text" id="agendamentos-search" placeholder="Buscar por cliente, serviço ou status..."
              class="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan/40 focus:border-cyan shadow-sm transition-all"
              oninput="filtrarAgendamentos()">
          </div>
        </div>
      `}

      <div class="admin-table-container">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Data/Hora</th>
              <th>Serviço</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="agendamentos-table-body">
            ${agendamentos.length === 0 ? '<tr><td colspan="5" class="px-6 py-12 text-center text-gray-400">Nenhum agendamento encontrado</td></tr>' : ''}
          </tbody>
        </table>
        <div id="agendamentos-empty-search" class="hidden py-10 text-center">
          <i class="fa-solid fa-search text-2xl text-gray-300 mb-2"></i>
          <p class="text-sm text-gray-400">Nenhum agendamento encontrado</p>
        </div>
      </div>
    </div>
  `;

  const tbody = main.querySelector('#agendamentos-table-body');
  if (tbody) {
    // Função para formatar data e hora
    const formatDate = (data) => {
      if (!data) return '';
      const d = new Date(data + 'T00:00:00');
      return d.toLocaleDateString('pt-PT');
    };
    const formatHora = (hora) => {
      if (!hora) return '';
      return hora.substring(0, 5);
    };

    tbody.innerHTML = agendamentos.map(a => `
      <tr data-cliente="${(a.cliente_nome || '').toLowerCase()}" data-servico="${(a.servico || a.servico_principal || '').toLowerCase()}" data-status="${(a.status || '').toLowerCase()}">
        <td>
          <div class="font-semibold text-gray-900">${a.cliente_nome || 'N/A'}</div>
          <div class="text-xs text-gray-400 mt-0.5">${a.cliente_telefone || ''}</div>
        </td>
        <td>
          <div class="font-medium text-gray-800">${formatDate(a.data)}</div>
          <div class="text-xs text-gray-500 mt-0.5">${a.hora ? 'às ' + formatHora(a.hora) : ''}</div>
        </td>
        <td>${a.servico || a.servico_principal || 'Consultação'}</td>
        <td>
          <span class="admin-badge ${a.status === 'confirmado' ? 'admin-badge-success' : a.status === 'pendente' ? 'admin-badge-warning' : a.status === 'concluido' || a.status === 'feito' ? 'admin-badge-info' : 'admin-badge-neutral'}">
            ${a.status || 'pendente'}
          </span>
        </td>
        <td>
          ${a.status === 'pendente' ? `
            <button onclick="handleUpdateStatus('${a.id}')" class="text-green-500 hover:text-green-700 mr-3 transition-colors p-1.5 hover:bg-green-50 rounded-lg" title="Marcar como Feito">
              <i class="fa-solid fa-check"></i>
            </button>
          ` : a.status === 'feito' ? `
            <span class="text-green-600 mr-3 p-1.5 inline-flex items-center" title="Concluído">
              <i class="fa-solid fa-circle-check"></i>
            </span>
          ` : ''}
          <button onclick="editAppointment('${a.id}')" class="text-cyan hover:text-navy mr-3 transition-colors p-1.5 hover:bg-cyan/10 rounded-lg">
            <i class="fa-solid fa-edit"></i>
          </button>
          <button onclick="deleteAppointment('${a.id}')" class="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }
}


// ============================================
// FUNCOES DE PRODUTOS - CRUD COM MODAL
// ============================================

let products = []; // Array principal de produtos
let currentProduct = null; // Para edição
let currentImageFile = null; // Arquivo de imagem selecionado

// Limpar seleção de imagem
function clearProductImage() {
  const fileInput = document.getElementById('product-image');
  if (fileInput) fileInput.value = '';

  const preview = document.getElementById('product-image-preview');
  const previewContainer = document.getElementById('product-image-preview-container');
  if (preview) preview.src = '';
  if (previewContainer) previewContainer.classList.add('hidden');

  currentImageFile = null;
}

// Carregar produtos do Supabase
async function loadProductsFromSupabase() {
  try {
    const { data, error } = await globalThis.supabase
      .from('produtos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    products = data || [];
    console.log('[LOAD] Produtos carregados:', products.length);
    return products;
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    products = [];
    return [];
  }
}

// Abrir modal de adicionar/editar produto
async function showProductModal(product = null) {
  currentProduct = product;
  currentImageFile = null;

  const main = document.getElementById('main-content');
  if (!main) return;

  // Create modal backdrop
  const modal = document.createElement('div');
  modal.id = 'product-modal';
  modal.className = 'admin-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="admin-modal max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
      <div class="admin-modal-header">
        <h3><i class="fa-solid fa-box${product ? '' : '-open'}"></i>${product ? 'Editar Produto' : 'Novo Produto'}</h3>
        <button onclick="closeProductModal()" class="text-white/60 hover:text-white transition-colors">
          <i class="fa-solid fa-times text-lg"></i>
        </button>
      </div>

      <form id="product-form" class="admin-modal-body space-y-4">
        <!-- Nome -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
          <input type="text" id="product-nome" name="nome" required
            class="admin-input"
            placeholder="Ex: Armação Ray-Ban">
        </div>

        <!-- Categoria -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
          <select id="product-categoria" name="categoria" required
            class="admin-input">
            <option value="">Selecione uma categoria</option>
            <option value="armacao">Armação</option>
            <option value="lente">Lente</option>
            <option value="acessorio">Acessório</option>
          </select>
        </div>

        <!-- Upload de Imagem -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Imagem do Produto</label>
          <div class="flex items-center gap-4">
            <div class="relative flex-1">
              <input type="file" id="product-image" accept="image/*"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan/10 file:text-cyan hover:file:bg-cyan/20"
                onchange="handleProductImageSelect(event, 'product-image-preview')">
            </div>
            <button type="button" onclick="clearProductImage()"
              class="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          <div id="product-image-preview-container" class="mt-3 hidden">
            <img id="product-image-preview" src="" alt="Preview"
              class="w-32 h-32 object-cover rounded-lg border-2 border-cyan/20">
          </div>
        </div>

        <!-- Preço -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Preço (KZ) *</label>
          <input type="number" id="product-preco" name="preco" required step="0.01" min="0"
            class="admin-input"
            placeholder="0.00">
        </div>

        <!-- Estoque -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estoque *</label>
          <input type="number" id="product-estoque" name="estoque" required min="0"
            class="admin-input"
            placeholder="0">
        </div>

        <!-- Botões -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onclick="closeProductModal()"
            class="admin-btn-secondary">
            Cancelar
          </button>
          <button type="submit" id="submit-product-btn"
            class="admin-btn-primary">
            ${product ? 'Atualizar Produto' : 'Salvar Produto'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Fill form if editing
  if (product) {
    document.getElementById('product-nome').value = product.nome || '';
    document.getElementById('product-categoria').value = product.categoria || '';
    document.getElementById('product-preco').value = product.preco || '';
    document.getElementById('product-estoque').value = product.estoque || '';
  }

  // Form submission handler
  const form = document.getElementById('product-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveProduct();
  });

  // Focus first input
  document.getElementById('product-nome').focus();
}

// Fechar modal de produto
function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.remove();
    currentProduct = null;
    currentImageFile = null;
  }
}

// Salvar produto (create ou update)
async function saveProduct() {
  const form = document.getElementById('product-form');
  const submitBtn = document.getElementById('submit-product-btn');

  if (!form || !submitBtn) return;

  const nome = document.getElementById('product-nome').value.trim();
  const categoria = document.getElementById('product-categoria').value;
  const preco = Number.parseFloat(document.getElementById('product-preco').value);
  const estoque = Number.parseInt(document.getElementById('product-estoque').value);

  // Validation
  if (!nome || !categoria || Number.isNaN(preco) || Number.isNaN(estoque)) {
    showToast('Preencha todos os campos obrigatórios*', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Salvando...';

  let imagem_url = currentProduct?.imagem_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect fill="%23f3f4f6" width="150" height="150"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESem Imagem%3C/text%3E%3C/svg%3E';

  // Fazer upload da imagem se houver novo arquivo selecionado
  if (currentImageFile) {
    try {
      imagem_url = await uploadProductImage(currentImageFile);
      showToast('Imagem enviada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      showToast('Erro ao enviar imagem, salvando sem imagem', 'warning');
    }
  }

  const productData = {
    nome,
    categoria,
    preco,
    estoque,
    imagem_url
  };

  try {
    if (currentProduct?.id) {
      // Update
      const { error } = await globalThis.supabase
        .from('produtos')
        .update(productData)
        .eq('id', currentProduct.id);

      if (error) throw error;
      showToast('Produto atualizado com sucesso!', 'success');
    } else {
      // Create
      const { error } = await globalThis.supabase
        .from('produtos')
        .insert([productData]);

      if (error) throw error;
      showToast('Produto criado com sucesso!', 'success');
    }

    // Reload and close
    await loadProductsFromSupabase();
    renderProdutosUI(await loadProductsFromSupabase());
    closeProductModal();

  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    showToast('Erro ao salvar produto', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = currentProduct ? 'Atualizar Produto' : 'Salvar Produto';
  }
}

// Editar produto - abrir modal
async function editProduct(id) {
  const products = await loadProductsFromSupabase();
  const product = products.find(p => p.id === id);
  if (product) {
    currentImageFile = null; // Reset image for editing
    showProductModal(product);
  }
}

// Apagar produto
async function deleteProduct(id) {
  if (!confirm('Tem certeza que deseja apagar este produto?')) return;

  try {
    const { error } = await globalThis.supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showToast('Produto apagado com sucesso!', 'success');
    const products = await loadProductsFromSupabase();
    renderProdutosUI(products);

  } catch (error) {
    console.error('Erro ao apagar produto:', error);
    showToast('Erro ao apagar produto', 'error');
  }
}

// Renderizar produtos na UI do admin
function renderProdutosUI(products = []) {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="p-6 animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800 tracking-tight">Produtos</h2>
        <button id="btn-novo-produto" class="admin-btn-primary flex items-center gap-2">
          <i class="fa-solid fa-plus"></i>Adicionar Novo Produto
        </button>
      </div>

      ${products.length === 0 ? `
        <div class="admin-card-flat">
          <div class="admin-empty-state">
            <div class="admin-empty-state-icon">
              <i class="fa-solid fa-box"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Nenhum produto encontrado</h3>
            <p class="text-sm text-gray-400">Clique em "Adicionar Novo Produto" para começar.</p>
          </div>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${products.map(p => `
            <div class="admin-card overflow-hidden group">
              <div class="h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative flex items-center justify-center">
                ${p.imagem_url && !p.imagem_url.includes('data:image/svg') ? `<img src="${p.imagem_url}" alt="${p.nome}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">` : `<div class="flex flex-col items-center justify-center h-full text-gray-300"><svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="16" width="48" height="32" rx="4" stroke="#d1d5db" stroke-width="2" fill="#f9fafb"/><circle cx="24" cy="30" r="5" stroke="#d1d5db" stroke-width="2" fill="#f3f4f6"/><path d="M8 40l12-10 8 6 12-14 16 18" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#e5e7eb" fill-opacity="0.3"/><circle cx="44" cy="26" r="3" fill="#e5e7eb"/></svg><span class="text-xs text-gray-400 mt-2 font-medium">Sem Imagem</span></div>`}
                <div class="absolute top-2 right-2">
                  <span class="admin-badge admin-badge-neutral">${p.categoria || '-'}</span>
                </div>
              </div>
              <div class="p-4">
                <h3 class="font-bold text-gray-900 mb-1 text-sm">${p.nome || 'N/A'}</h3>
                <div class="flex justify-between items-center mb-3">
                  <span class="font-bold text-lg" style="color: var(--admin-cyan)">KZ ${formatPrice(p.preco || 0)}</span>
                  <span class="text-xs text-gray-400">Estoque: ${p.estoque || 0}</span>
                </div>
                <div class="flex gap-2">
                  <button onclick="globalThis.editProduct('${p.id}')" class="flex-1 px-3 py-2 bg-navy/5 text-navy rounded-xl text-xs font-semibold hover:bg-navy/10 transition-all flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-pen-to-square"></i>Editar
                  </button>
                  <button onclick="globalThis.deleteProduct('${p.id}')" class="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-all flex items-center justify-center">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
  // Adicionar evento ao botão de novo produto
  const btnNovoProduto = main.querySelector('#btn-novo-produto');
  if (btnNovoProduto) {
    btnNovoProduto.addEventListener('click', () => {
      console.log('[PRODUTOS] Botão novo produto clicado');
      showProductModal(null);
    });
  }

  // Expor funções globalmente para onclick handlers
  globalThis.editProduct = editProduct;
  globalThis.deleteProduct = deleteProduct;
}


//upload de imagem para o bucket 'produtos-imgs'
async function uploadProductImage(file) {
  try {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { error } = await globalThis.supabase.storage
      .from('produtos-imgs')
      .upload(fileName, file);

    if (error) throw error;

    // Obter URL pública
    const { data: urlData } = globalThis.supabase.storage
      .from('produtos-imgs')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
}

// Handle image selection with preview
function handleProductImageSelect(event, previewId = 'product-image-preview') {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Selecione um arquivo de imagem', 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast('A imagem deve ter no máximo 5MB', 'error');
    return;
  }

  // Guardar ficheiro para upload
  currentImageFile = file;

  const preview = document.getElementById(previewId);
  const previewContainer = document.getElementById(`${previewId}-container`);

  if (preview && previewContainer) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      previewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  return file;
}


// ============================================
// FUNCOES DE CLIENTES - CRUD COM MODAL
// ============================================

let currentCliente = null; // Para edição

// Carregar clientes do Supabase
async function loadClientes() {
  try {
    const { data, error } = await globalThis.supabase
      .from('clientes')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    clientes = data || [];
    console.log('[LOAD] Clientes carregados:', clientes.length);
    return clientes;
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    clientes = [];
    return [];
  }
}

// Abrir modal de adicionar/editar cliente
async function showClientModal(cliente = null) {
  currentCliente = cliente;

  const main = document.getElementById('main-content');
  if (!main) return;

  // Create modal backdrop
  const modal = document.createElement('div');
  modal.id = 'client-modal';
  modal.className = 'admin-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="admin-modal max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
      <div class="admin-modal-header">
        <h3><i class="fa-solid fa-user${cliente ? '' : '-plus'}"></i>${cliente ? 'Editar Cliente' : 'Novo Cliente'}</h3>
        <button onclick="closeClientModal()" class="text-white/60 hover:text-white transition-colors">
          <i class="fa-solid fa-times text-lg"></i>
        </button>
      </div>

      <form id="client-form" class="admin-modal-body space-y-4">
        <!-- Nome -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
          <input type="text" id="client-nome" name="nome" required
            class="admin-input"
            placeholder="Ex: João Silva">
        </div>

        <!-- Telefone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
          <input type="tel" id="client-telefone" name="telefone" required
            class="admin-input"
            placeholder="Ex: +244 923 456 789">
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" id="client-email" name="email"
            class="admin-input"
            placeholder="exemplo@email.com">
        </div>

        <!-- Botões -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onclick="closeClientModal()"
            class="admin-btn-secondary">
            Cancelar
          </button>
          <button type="submit" id="submit-client-btn"
            class="admin-btn-primary">
            ${cliente ? 'Atualizar Cliente' : 'Salvar Cliente'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Fill form if editing
  if (cliente) {
    document.getElementById('client-nome').value = cliente.nome || '';
    document.getElementById('client-telefone').value = cliente.telefone || '';
    document.getElementById('client-email').value = cliente.email || '';
    document.getElementById('client-obs').value = cliente.obs || '';
  }

  // Form submission handler
  const form = document.getElementById('client-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveClient();
  });

  // Focus first input
  document.getElementById('client-nome').focus();
}

// Fechar modal de cliente
function closeClientModal() {
  const modal = document.getElementById('client-modal');
  if (modal) {
    modal.remove();
    currentCliente = null;
  }
}

// Salvar cliente (create ou update)
async function saveClient() {
  const form = document.getElementById('client-form');
  const submitBtn = document.getElementById('submit-client-btn');

  if (!form || !submitBtn) return;

  const nome = document.getElementById('client-nome').value.trim();
  const telefone = document.getElementById('client-telefone').value.trim();
  const email = document.getElementById('client-email')?.value.trim() || '';

  // Validation
  if (!nome || !telefone) {
    showToast('Preencha o nome e telefone obrigatórios*', 'error');
    return;
  }

  // Verificar duplicados (mesmo nome + mesmo telefone, ignorando edições)
  if (!currentCliente?.id) {
    const { data: existing } = await globalThis.supabase
      .from('clientes')
      .select('id')
      .eq('nome', nome)
      .eq('telefone', telefone)
      .limit(1);

    if (existing && existing.length > 0) {
      showToast('Já existe um cliente com este nome e telefone', 'error');
      return;
    }
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Salvando...';

  const clientData = {
    nome: nome,
    telefone: telefone,
    email: email || null
  };

  try {
    if (currentCliente?.id) {
      // Update
      const { error } = await globalThis.supabase
        .from('clientes')
        .update(clientData)
        .eq('id', currentCliente.id);

      if (error) throw error;
      showToast('Cliente atualizado com sucesso!', 'success');
    } else {
      // Create
      const { error } = await globalThis.supabase
        .from('clientes')
        .insert([clientData]);

      if (error) throw error;
      showToast('Cliente criado com sucesso!', 'success');
    }

    // Reload and close
    await loadClientes();
    renderClientes(await loadClientes());
    closeClientModal();

  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
    console.error('Detalhes:', JSON.stringify(error, null, 2));

    if (error.message) {
      showToast(`Erro: ${error.message}`, 'error');
    } else {
      showToast('Erro ao salvar cliente', 'error');
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = currentCliente ? 'Atualizar Cliente' : 'Salvar Cliente';
  }
}

// Editar cliente - abrir modal
async function editClient(id) {
  const clientesList = await loadClientes();
  const cliente = clientesList.find(c => c.id === id);
  if (cliente) {
    showClientModal(cliente);
  }
}

// Apagar cliente
async function deleteClient(id) {
  if (!confirm('Tem certeza que deseja apagar este cliente?')) return;

  try {
    const { error } = await globalThis.supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showToast('Cliente apagado com sucesso!', 'success');
    const clientesList = await loadClientes();
    renderClientes(clientesList);

  } catch (error) {
    console.error('Erro ao apagar cliente:', error);
    showToast('Erro ao apagar cliente', 'error');
  }
}

// Filtrar clientes por nome ou email em tempo real
function filtrarClientes() {
  const input = document.getElementById('clientes-search');
  if (!input) return;

  const termo = input.value.trim().toLowerCase();
  const tbody = document.getElementById('clientes-tbody');
  const emptyMsg = document.getElementById('clientes-empty-search');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  let visiveis = 0;

  rows.forEach(row => {
    const nome = row.dataset.nome || '';
    const email = row.dataset.email || '';
    const match = nome.includes(termo) || email.includes(termo);
    row.style.display = match ? '' : 'none';
    if (match) visiveis++;
  });

  if (emptyMsg) {
    emptyMsg.classList.toggle('hidden', visiveis > 0);
  }
}

// Renderizar clientes na UI do admin
async function renderClientes(clientesList = []) {
  if (clientesList.length === 0) {
    clientesList = await loadClientes();
  }

  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="p-6 animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800 tracking-tight">Clientes</h2>
        <button id="btn-novo-cliente" class="admin-btn-primary flex items-center gap-2">
          <i class="fa-solid fa-user-plus"></i>Adicionar Novo Cliente
        </button>
      </div>

      ${clientesList.length === 0 ? `
        <div class="admin-card-flat">
          <div class="admin-empty-state">
            <div class="admin-empty-state-icon">
              <i class="fa-solid fa-users"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Nenhum cliente encontrado</h3>
            <p class="text-sm text-gray-400">Clique em "Adicionar Novo Cliente" para começar.</p>
          </div>
        </div>
      ` : `
        <!-- Campo de busca -->
        <div class="mb-5">
          <div class="relative max-w-md">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i class="fa-solid fa-magnifying-glass text-gray-400 text-sm"></i>
            </div>
            <input type="text" id="clientes-search" placeholder="Buscar por nome ou email..."
              class="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan/40 focus:border-cyan shadow-sm transition-all"
              oninput="filtrarClientes()">
          </div>
        </div>

        <div class="admin-table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Email</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="clientes-tbody">
              ${clientesList.map(c => `
                <tr data-nome="${(c.nome || '').toLowerCase()}" data-email="${(c.email || '').toLowerCase()}">
                  <td class="font-semibold text-gray-900">${c.nome || 'N/A'}</td>
                  <td>${c.telefone || '-'}</td>
                  <td>${c.email || '-'}</td>
                  <td class="text-right">
                    <button onclick="globalThis.editClient('${c.id}')" class="text-cyan hover:text-navy mr-3 transition-colors p-1.5 hover:bg-cyan/10 rounded-lg">
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button onclick="globalThis.deleteClient('${c.id}')" class="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div id="clientes-empty-search" class="hidden py-10 text-center">
            <i class="fa-solid fa-search text-2xl text-gray-300 mb-2"></i>
            <p class="text-sm text-gray-400">Nenhum cliente encontrado</p>
          </div>
        </div>
      `}
    </div>
  `;

  // Adicionar evento ao botão de novo cliente
  const btnNovoCliente = main.querySelector('#btn-novo-cliente');
  if (btnNovoCliente) {
    btnNovoCliente.addEventListener('click', () => {
      console.log('[CLIENTES] Botão novo cliente clicado');
      showClientModal(null);
    });
  }

  // Expor funções globalmente para onclick handlers
  globalThis.editClient = editClient;
  globalThis.deleteClient = deleteClient;
}


// ============================================
// FUNCOES DE CONFIGURACOES - CRUD COM MODAL
// ============================================

let currentConfig = null; // Para edição

// Carregar configurações do Supabase
async function loadConfiguracoes() {
  try {
    const { data, error } = await globalThis.supabase
      .from('configuracoes')
      .select('*');

    if (error) throw error;

    configuracoes = data || [];
    configuracoes.forEach(config => {
      if (config.valor !== null) window[config.chave] = config.valor;
    });
    console.log('[LOAD] Configurações carregadas:', configuracoes.length);
    return configuracoes;
  } catch (error) {
    console.error('Erro na configuração:', error);
    configuracoes = [];
    return [];
  }
}

// Abrir modal de adicionar/editar configuração
async function showConfigModal(config = null) {
  currentConfig = config;

  const main = document.getElementById('main-content');
  if (!main) return;

  // Create modal backdrop
  const modal = document.createElement('div');
  modal.id = 'config-modal';
  modal.className = 'admin-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="admin-modal max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
      <div class="admin-modal-header">
        <h3><i class="fa-solid fa-gear"></i>${config ? 'Editar Configuração' : 'Nova Configuração'}</h3>
        <button onclick="closeConfigModal()" class="text-white/60 hover:text-white transition-colors">
          <i class="fa-solid fa-times text-lg"></i>
        </button>
      </div>

      <form id="config-form" class="admin-modal-body space-y-4">
        <!-- Chave -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Chave *</label>
          <input type="text" id="config-chave" name="chave" required ${config ? 'disabled' : ''}
            class="admin-input ${config ? 'bg-gray-100 cursor-not-allowed' : ''}"
            placeholder="ex: loja_nome">
        </div>

        <!-- Valor -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
          <input type="text" id="config-valor" name="valor" required
            class="admin-input"
            placeholder="Valor da configuração">
        </div>

        <!-- Descrição -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea id="config-desc" name="descricao" rows="3"
            class="admin-input"
            placeholder="Descrição da configuração..."></textarea>
        </div>

        <!-- Botões -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onclick="closeConfigModal()"
            class="admin-btn-secondary">
            Cancelar
          </button>
          <button type="submit" id="submit-config-btn"
            class="admin-btn-primary">
            ${config ? 'Atualizar Configuração' : 'Salvar Configuração'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Fill form if editing
  if (config) {
    document.getElementById('config-chave').value = config.chave || '';
    document.getElementById('config-valor').value = config.valor || '';
    document.getElementById('config-desc').value = config.descricao || '';
  }

  // Form submission handler
  const form = document.getElementById('config-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveConfig();
  });

  // Focus first input
  document.getElementById('config-chave').focus();
}

// Fechar modal de configuração
function closeConfigModal() {
  const modal = document.getElementById('config-modal');
  if (modal) {
    modal.remove();
    currentConfig = null;
  }
}

// Salvar configuração (create ou update)
async function saveConfig() {
  const form = document.getElementById('config-form');
  const submitBtn = document.getElementById('submit-config-btn');

  if (!form || !submitBtn) return;

  const chave = document.getElementById('config-chave').value.trim();
  const valor = document.getElementById('config-valor').value.trim();
  const descricao = document.getElementById('config-desc').value.trim();

  // Validation
  if (!chave || !valor) {
    showToast('Preencha a chave e o valor obrigatórios*', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Salvando...';

  const configData = {
    chave,
    valor,
    descricao: descricao || null
  };

  try {
    if (currentConfig?.id) {
      // Update
      const { error } = await globalThis.supabase
        .from('configuracoes')
        .update(configData)
        .eq('id', currentConfig.id);

      if (error) throw error;
      showToast('Configuração atualizada com sucesso!', 'success');
    } else {
      // Create
      const { error } = await globalThis.supabase
        .from('configuracoes')
        .insert([configData]);

      if (error) throw error;
      showToast('Configuração criada com sucesso!', 'success');
    }

    // Reload and close
    await loadConfiguracoes();
    renderConfiguracoes(await loadConfiguracoes());
    closeConfigModal();

  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    showToast('Erro ao salvar configuração', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = currentConfig ? 'Atualizar Configuração' : 'Salvar Configuração';
  }
}

// Editar configuração - abrir modal
async function editConfig(id) {
  const configs = await loadConfiguracoes();
  const config = configs.find(c => c.id === id);
  if (config) {
    showConfigModal(config);
  }
}

// Apagar configuração
async function deleteConfig(id) {
  if (!confirm('Tem certeza que deseja apagar esta configuração?')) return;

  try {
    const { error } = await globalThis.supabase
      .from('configuracoes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showToast('Configuração apagada com sucesso!', 'success');
    const configs = await loadConfiguracoes();
    renderConfiguracoes(configs);

  } catch (error) {
    console.error('Erro ao apagar configuração:', error);
    showToast('Erro ao apagar configuração', 'error');
  }
}

// Renderizar configurações na UI do admin
async function renderConfiguracoes(configsList = []) {
  if (configsList.length === 0) {
    configsList = await loadConfiguracoes();
  }

  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="p-6 animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800 tracking-tight">Configurações</h2>
        <button id="btn-novo-config" class="admin-btn-primary flex items-center gap-2">
          <i class="fa-solid fa-cog"></i>Adicionar Configuração
        </button>
      </div>

      ${configsList.length === 0 ? `
        <div class="admin-card-flat">
          <div class="admin-empty-state">
            <div class="admin-empty-state-icon">
              <i class="fa-solid fa-cog"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Nenhuma configuração encontrada</h3>
            <p class="text-sm text-gray-400">Clique em "Adicionar Configuração" para começar.</p>
          </div>
        </div>
      ` : `
        <div class="admin-table-container">
          <table>
            <thead>
              <tr>
                <th>Chave</th>
                <th>Valor</th>
                <th>Descrição</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${configsList.map(c => `
                <tr>
                  <td class="font-mono font-semibold text-gray-900">${c.chave || 'N/A'}</td>
                  <td>${c.valor || '-'}</td>
                  <td class="text-gray-500">${c.descricao || '-'}</td>
                  <td class="text-right">
                    <button onclick="globalThis.editConfig('${c.id}')" class="text-cyan hover:text-navy mr-3 transition-colors p-1.5 hover:bg-cyan/10 rounded-lg">
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button onclick="globalThis.deleteConfig('${c.id}')" class="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;

  // Adicionar evento ao botão de nova configuração
  const btnNovoConfig = main.querySelector('#btn-novo-config');
  if (btnNovoConfig) {
    btnNovoConfig.addEventListener('click', () => {
      console.log('[CONFIGURACOES] Botão nova configuração clicado');
      showConfigModal(null);
    });
  }

  // Expor funções globalmente para onclick handlers
  globalThis.editConfig = editConfig;
  globalThis.deleteConfig = deleteConfig;
}


// ============================================
// RENDERIZACAO DO DASHBOARD
// ============================================
function renderDashboard() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const totalAgendamentos = agendamentos.length;
  const agendamentosPendentes = agendamentos.filter(a => a.status === 'pendente').length;
  const agendamentosConfirmados = agendamentos.filter(a => a.status === 'confirmado').length;
  const totalProdutos = produtos.length;

  // Função para classe de status
  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  main.innerHTML = `
    <div class="p-6 animate-fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 tracking-tight">Dashboard</h2>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div class="admin-stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1 font-medium">Total Agendamentos</p>
              <p class="text-3xl font-bold text-gray-800">${totalAgendamentos}</p>
            </div>
            <div class="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center">
              <i class="fa-solid fa-calendar-check text-cyan text-xl"></i>
            </div>
          </div>
        </div>

        <div class="admin-stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1 font-medium">Pendentes</p>
              <p class="text-3xl font-bold text-yellow-600">${agendamentosPendentes}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <i class="fa-solid fa-clock text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="admin-stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1 font-medium">Confirmados</p>
              <p class="text-3xl font-bold text-green-600">${agendamentosConfirmados}</p>
            </div>
            <div class="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <i class="fa-solid fa-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="admin-stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1 font-medium">Total Produtos</p>
              <p class="text-3xl font-bold text-navy">${totalProdutos}</p>
            </div>
            <div class="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center">
              <i class="fa-solid fa-box text-navy text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="admin-card-flat p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Agendamentos Recentes</h3>
        <div class="space-y-2">
          ${agendamentos.slice(0, 5).map(a => `
            <div class="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p class="font-semibold text-gray-800 text-sm">${a.cliente_nome || 'N/A'}</p>
                <p class="text-xs text-gray-400 mt-0.5">${a.data_hora ? new Date(a.data_hora).toLocaleString('pt-PT') : 'N/A'}</p>
              </div>
              <span class="admin-badge ${a.status === 'confirmado' ? 'admin-badge-success' : a.status === 'pendente' ? 'admin-badge-warning' : 'admin-badge-neutral'}">
                ${a.status || 'pendente'}
              </span>
            </div>
          `).join('')}
          ${agendamentos.length === 0 ? '<p class="text-gray-400 text-center py-6 text-sm">Nenhum agendamento recente</p>' : ''}
        </div>
      </div>
    </div>
  `;
}


// ============================================
// SLIDESHOW - Gerenciador Dinâmico com Drag-and-Drop
// Bucket: banners | Tabela: slides
// ============================================

const SLIDES_BUCKET = 'banners';


// Carregar slides do Supabase
async function loadSlides() {
	try {
		const { data, error } = await globalThis.supabase
			.from('slideshow')
			.select('*')
			.order('ordem', { ascending: true });

		if (error) throw error;
		slides = data || [];
		return slides;
	} catch (error) {
		console.error('Erro ao carregar slides:', error);
		slides = [];
		return [];
	}
}

// Upload de imagem para o bucket 'banners'
async function uploadSlideImage(file) {
	const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
	console.log('🔍 [DEBUG] uploadSlideImage - fileName:', fileName, 'bucket:', SLIDES_BUCKET, 'fileSize:', file.size);

	try {
		console.log('🔍 [DEBUG] Iniciando upload para Supabase Storage...');
		const { data, error } = await globalThis.supabase.storage
			.from(SLIDES_BUCKET)
			.upload(fileName, file, { cacheControl: '3600', upsert: false });

		console.log('🔍 [DEBUG] Resposta upload - data:', data, 'error:', error);
		if (error) throw error;

		console.log('🔍 [DEBUG] Obtendo URL pública...');
		const { data: urlData } = globalThis.supabase.storage
			.from(SLIDES_BUCKET)
			.getPublicUrl(fileName);

		console.log('✅ [DEBUG] URL pública:', urlData.publicUrl);
		return urlData.publicUrl;
	} catch (err) {
		console.error('❌ [DEBUG] Erro no uploadSlideImage:', err);
		throw err;
	}
}

// Deletar imagem do storage
async function deleteSlideImage(imageUrl) {
	try {
		if (!imageUrl) return;
		const fileName = imageUrl.split('/').pop();
		if (!fileName) return;

		const { error } = await globalThis.supabase.storage
			.from(SLIDES_BUCKET)
			.remove([fileName]);

		if (error) throw error;
	} catch (error) {
		console.error('Erro ao deletar imagem do storage:', error);
	}
}

// Extrair nome legível do arquivo a partir da URL
function getFileNameFromUrl(url) {
	if (!url) return '';
	const raw = url.split('/').pop() || '';
	// Remove o prefixo timestamp_ para mostrar nome limpo
	return raw.replace(/^\d+_/, '') || 'imagem';
}

// Abrir modal de adicionar/editar slide com drag-and-drop
async function showSlideModal(slide = null) {
	console.log('🔍 [DEBUG] showSlideModal chamada, slide:', slide);
	currentSlide = slide;
	currentSlideImage = null;

	const modal = document.createElement('div');
	modal.id = 'slide-modal';
	modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4';
	modal.innerHTML = `
		<div class="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
			<!-- Header -->
			<div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-navy to-navy/90 rounded-t-2xl">
				<h3 class="text-lg font-bold text-white flex items-center gap-2">
					<i class="fa-solid fa-image text-cyan"></i>
					${slide ? 'Editar Slide' : 'Novo Slide'}
				</h3>
				<button onclick="closeSlideModal()" class="text-white/60 hover:text-white transition-colors">
					<i class="fa-solid fa-times text-lg"></i>
				</button>
			</div>

			<form id="slide-form" class="p-6 space-y-5">
				<!-- Drag-and-Drop Upload Zone -->
				<div>
					<label class="block text-sm font-semibold text-gray-700 mb-2">Imagem do Slide</label>
					<div id="slide-drop-zone" class="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:border-cyan hover:bg-cyan/5 group overflow-hidden">
						<div id="slide-blur-bg" class="hidden absolute inset-0 bg-cover bg-center filter blur-lg scale-110 opacity-40"></div>
						<input type="file" id="slide-image" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
						<div id="slide-drop-placeholder" class="relative z-10 space-y-2">
							<div class="w-12 h-12 mx-auto bg-cyan/10 rounded-full flex items-center justify-center group-hover:bg-cyan/20 transition-colors">
								<i class="fa-solid fa-cloud-arrow-up text-xl text-cyan"></i>
							</div>
							<p class="text-sm font-medium text-gray-600">Arraste e solte a imagem aqui</p>
							<p class="text-xs text-gray-400">ou clique para selecionar (PNG, JPG até 5MB)</p>
						</div>
						<div id="slide-drop-preview" class="hidden relative z-10">
							<img id="slide-image-preview" src="" alt="Preview" class="w-full h-52 object-cover rounded-lg shadow-sm">
							<p id="slide-file-name" class="text-xs text-gray-500 mt-2 truncate"></p>
						</div>
					</div>
					<button type="button" id="btn-clear-slide-image" class="hidden mt-2 text-xs text-red-500 hover:text-red-700 transition-colors">
						<i class="fa-solid fa-times mr-1"></i>Remover imagem
					</button>
				</div>

				<!-- Título -->
				<div>
					<label class="block text-sm font-semibold text-gray-700 mb-1">Título</label>
					<input type="text" id="slide-titulo" name="titulo"
						class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan focus:border-transparent transition-all text-sm"
						placeholder="Ex: Nova Coleção de Óculos">
				</div>

				<!-- Subtítulo -->
				<div>
					<label class="block text-sm font-semibold text-gray-700 mb-1">Subtítulo</label>
					<input type="text" id="slide-subtitulo" name="subtitulo"
						class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan focus:border-transparent transition-all text-sm"
						placeholder="Ex: Desbloqueie seu melhor visual">
				</div>

				<!-- Ordem e Status lado a lado -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-semibold text-gray-700 mb-1">Ordem</label>
						<input type="number" id="slide-ordem" name="ordem" min="0"
							class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan focus:border-transparent transition-all text-sm"
							value="0">
					</div>
					<div>
						<label class="block text-sm font-semibold text-gray-700 mb-1">Status</label>
						<select id="slide-ativo" name="ativo"
							class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan focus:border-transparent transition-all text-sm">
							<option value="true">Ativo</option>
							<option value="false">Inativo</option>
						</select>
					</div>
				</div>

				<!-- Botões -->
				<div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
					<button type="button" onclick="closeSlideModal()"
						class="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium">
						Cancelar
					</button>
					<button type="submit" id="submit-slide-btn"
						class="px-6 py-2.5 bg-cyan text-white rounded-lg hover:bg-cyan/90 transition-all text-sm font-semibold shadow-sm hover:shadow-md">
						${slide ? 'Atualizar Slide' : 'Salvar Slide'}
					</button>
				</div>
			</form>
		</div>
	`;

	document.body.appendChild(modal);
	console.log('✅ [DEBUG] Modal adicionado ao DOM');

	// --- Setup Drag-and-Drop ---
	const dropZone = document.getElementById('slide-drop-zone');
	const fileInput = document.getElementById('slide-image');

	// Prevenir comportamento padrão do drag
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
		dropZone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); });
	});

	// Highlight ao arrastar sobre a zona
	dropZone.addEventListener('dragenter', () => {
		dropZone.classList.add('border-cyan', 'bg-cyan/10');
		dropZone.classList.remove('border-gray-300');
	});
	dropZone.addEventListener('dragleave', (e) => {
		if (!dropZone.contains(e.relatedTarget)) {
			dropZone.classList.remove('border-cyan', 'bg-cyan/10');
			dropZone.classList.add('border-gray-300');
		}
	});
	dropZone.addEventListener('drop', (e) => {
		dropZone.classList.remove('border-cyan', 'bg-cyan/10');
		dropZone.classList.add('border-gray-300');
		const file = e.dataTransfer.files[0];
		if (file) {
			const dt = new DataTransfer();
			dt.items.add(file);
			fileInput.files = dt.files;
			handleSlideImageSelect({ target: { files: [file] } });
		}
	});

	// Change do input de arquivo
	fileInput.addEventListener('change', (e) => handleSlideImageSelect(e));

	// Botão limpar imagem
	document.getElementById('btn-clear-slide-image').addEventListener('click', clearSlideImage);

	// Fechar ao clicar fora
	modal.addEventListener('click', (e) => {
		if (e.target === modal) closeSlideModal();
	});

	// Preencher formulário se editando
	if (slide) {
		document.getElementById('slide-titulo').value = slide.titulo || '';
		document.getElementById('slide-subtitulo').value = slide.subtitulo || '';
		document.getElementById('slide-ordem').value = slide.ordem ?? 0;
		document.getElementById('slide-ativo').value = String(slide.ativo ?? true);

		if (slide.imagem_url) {
			const preview = document.getElementById('slide-image-preview');
			const previewBox = document.getElementById('slide-drop-preview');
			const placeholder = document.getElementById('slide-drop-placeholder');
			const fileName = document.getElementById('slide-file-name');
			const clearBtn = document.getElementById('btn-clear-slide-image');
			const dropZone = document.getElementById('slide-drop-zone');
			const blurBg = document.getElementById('slide-blur-bg');

			preview.src = slide.imagem_url;
			fileName.textContent = getFileNameFromUrl(slide.imagem_url);
			previewBox.classList.remove('hidden');
			placeholder.classList.add('hidden');
			clearBtn.classList.remove('hidden');

			// Mostrar fundo desfocado
			if (dropZone) {
				dropZone.classList.remove('border-dashed', 'border-gray-300');
				dropZone.classList.add('border-solid', 'border-transparent');
			}
			if (blurBg) {
				blurBg.style.backgroundImage = `url(${slide.imagem_url})`;
				blurBg.classList.remove('hidden');
			}
		}
	}

	// Submit handler
	document.getElementById('slide-form').addEventListener('submit', async (e) => {
		console.log('🔍 [DEBUG] Form submit event disparado');
		e.preventDefault();
		await saveSlide();
	});

	document.getElementById('slide-titulo').focus();
}

// Fechar modal de slide
function closeSlideModal() {
	const modal = document.getElementById('slide-modal');
	if (modal) modal.remove();
	currentSlide = null;
	currentSlideImage = null;
}

// Handler de seleção de imagem com preview
function handleSlideImageSelect(event) {
	console.log('🔍 [DEBUG] handleSlideImageSelect chamada');
	const file = event.target.files?.[0];
	console.log('🔍 [DEBUG] file:', file);
	if (!file) return;

	if (!file.type.startsWith('image/')) {
		showToast('Selecione um arquivo de imagem (PNG, JPG)', 'error');
		return;
	}
	if (file.size > 5 * 1024 * 1024) {
		showToast('A imagem deve ter no máximo 5MB', 'error');
		return;
	}

	currentSlideImage = file;

	const preview = document.getElementById('slide-image-preview');
	const previewBox = document.getElementById('slide-drop-preview');
	const placeholder = document.getElementById('slide-drop-placeholder');
	const fileNameEl = document.getElementById('slide-file-name');
	const clearBtn = document.getElementById('btn-clear-slide-image');

	const dropZone = document.getElementById('slide-drop-zone');

	const blurBg = document.getElementById('slide-blur-bg');

	if (preview && previewBox && placeholder) {
		const reader = new FileReader();
		reader.onload = (e) => {
			preview.src = e.target.result;
			fileNameEl.textContent = file.name;
			previewBox.classList.remove('hidden');
			placeholder.classList.add('hidden');
			if (clearBtn) clearBtn.classList.remove('hidden');

			// Remover borda tracejada e adicionar fundo desfocado
			if (dropZone) {
				dropZone.classList.remove('border-dashed', 'border-gray-300');
				dropZone.classList.add('border-solid', 'border-transparent');
			}
			if (blurBg) {
				blurBg.style.backgroundImage = `url(${e.target.result})`;
				blurBg.classList.remove('hidden');
			}
		};
		reader.readAsDataURL(file);
	}
}

// Limpar seleção de imagem
function clearSlideImage() {
	const fileInput = document.getElementById('slide-image');
	if (fileInput) fileInput.value = '';

	const preview = document.getElementById('slide-image-preview');
	const previewBox = document.getElementById('slide-drop-preview');
	const placeholder = document.getElementById('slide-drop-placeholder');
	const fileNameEl = document.getElementById('slide-file-name');
	const clearBtn = document.getElementById('btn-clear-slide-image');
	const dropZone = document.getElementById('slide-drop-zone');
	const blurBg = document.getElementById('slide-blur-bg');

	if (preview) preview.src = '';
	if (previewBox) previewBox.classList.add('hidden');
	if (placeholder) placeholder.classList.remove('hidden');
	if (fileNameEl) fileNameEl.textContent = '';
	if (clearBtn) clearBtn.classList.add('hidden');

	// Restaurar borda tracejada e remover fundo desfocado
	if (dropZone) {
		dropZone.classList.add('border-dashed', 'border-gray-300');
		dropZone.classList.remove('border-solid', 'border-transparent');
	}
	if (blurBg) {
		blurBg.style.backgroundImage = '';
		blurBg.classList.add('hidden');
	}

	currentSlideImage = null;
}

// Validar dados do slide
function validateSlideData(titulo, imagem_url) {
	console.log('🔍 [DEBUG] validateSlideData - titulo:', titulo, 'imagem_url:', imagem_url);
	if (!titulo) {
		console.log('❌ [DEBUG] Título vazio');
		showToast('Preencha o título do slide', 'error');
		return false;
	}
	if (!imagem_url) {
		console.log('❌ [DEBUG] imagem_url vazio');
		showToast('Selecione uma imagem para o slide', 'error');
		return false;
	}
	return true;
}

// Fazer upload da imagem do slide
async function handleSlideImageUpload(submitBtn) {
	console.log('🔍 [DEBUG] handleSlideImageUpload chamada, currentSlideImage:', currentSlideImage);
	if (!currentSlideImage) {
		console.log('🔍 [DEBUG] Sem imagem nova, retornando:', currentSlide?.imagem_url || '');
		return currentSlide?.imagem_url || '';
	}

	submitBtn.disabled = true;
	submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Enviando imagem...';

	try {
		console.log('🔍 [DEBUG] Chamando uploadSlideImage...');
		const url = await uploadSlideImage(currentSlideImage);
		console.log('✅ [DEBUG] uploadSlideImage retornou:', url);
		return url;
	} catch (error) {
		console.error('❌ [DEBUG] Erro no upload:', error);
		showToast('Erro ao enviar imagem: ' + (error.message || 'Verifique o console'), 'error');
		submitBtn.disabled = false;
		submitBtn.innerHTML = currentSlide ? 'Atualizar Slide' : 'Salvar Slide';
		throw error;
	}
}

// Salvar slide (create ou update)
async function saveSlide() {
	console.log('🔍 [DEBUG] saveSlide() chamada');
	const submitBtn = document.getElementById('submit-slide-btn');
	console.log('🔍 [DEBUG] submitBtn:', submitBtn);
	if (!submitBtn) return;

	const titulo = document.getElementById('slide-titulo')?.value?.trim() || '';
	const subtitulo = document.getElementById('slide-subtitulo')?.value?.trim() || '';
	const ordem = Number.parseInt(document.getElementById('slide-ordem')?.value) || 0;
	const ativo = document.getElementById('slide-ativo')?.value === 'true';

	let imagem_url;

	console.log('🔍 [DEBUG] titulo:', titulo, 'currentSlideImage:', currentSlideImage);

	try {
		imagem_url = await handleSlideImageUpload(submitBtn);
		console.log('🔍 [DEBUG] imagem_url após upload:', imagem_url);
	} catch (error) {
		console.error('❌ [DEBUG] Erro ao fazer upload:', error);
		return;
	}

	if (!validateSlideData(titulo, imagem_url)) {
		console.log('❌ [DEBUG] Validação falhou');
		return;
	}

	console.log('✅ [DEBUG] Validação OK, salvando...');

	submitBtn.disabled = true;
	submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Salvando...';

	const slideData = { titulo, subtitulo, ordem, ativo, imagem_url };

	try {
		if (currentSlide?.id) {
			const { error } = await globalThis.supabase
				.from('slideshow')
				.update(slideData)
				.eq('id', currentSlide.id);
			if (error) throw error;
			showToast('Slide atualizado com sucesso!', 'success');
		} else {
			const { error } = await globalThis.supabase
				.from('slideshow')
				.insert([slideData]);
			if (error) throw error;
			showToast('Slide criado com sucesso!', 'success');
		}

		await loadSlides();
		renderSlides();
		closeSlideModal();
	} catch (error) {
		console.error('Erro ao salvar slide:', error);
		showToast('Erro ao salvar slide: ' + (error.message || ''), 'error');
	} finally {
		if (submitBtn) {
			submitBtn.disabled = false;
			submitBtn.innerHTML = currentSlide ? 'Atualizar Slide' : 'Salvar Slide';
		}
	}
}

// Editar slide
async function editSlide(id) {
	const slide = slides.find(s => s.id === id);
	if (slide) {
		currentSlideImage = null;
		showSlideModal(slide);
	}
}

// Apagar slide com confirmação e remoção de imagem do storage
async function deleteSlideWithImage(id, imageUrl) {
	if (!confirm('Tem certeza que deseja apagar este slide? A imagem também será removida.')) return;

	const card = document.querySelector(`[data-slide-id="${id}"]`);
	if (card) {
		card.classList.add('opacity-50', 'pointer-events-none');
	}

	try {
		const { error: dbError } = await globalThis.supabase
			.from('slideshow')
			.delete()
			.eq('id', id);

		if (dbError) throw dbError;

		if (imageUrl) {
			await deleteSlideImage(imageUrl);
		}

		showToast('Slide removido com sucesso!', 'success');
		await loadSlides();
		renderSlides();
	} catch (error) {
		console.error('Erro ao apagar slide:', error);
		showToast('Erro ao apagar slide', 'error');
		if (card) {
			card.classList.remove('opacity-50', 'pointer-events-none');
		}
	}
}

// Deletar slide (wrapper que busca o slide na lista)
async function deleteSlide(id) {
	const slide = slides.find(s => s.id === id);
	if (!slide) return;
	await deleteSlideWithImage(id, slide.imagem_url);
}

// Renderizar seção completa de Slides
async function renderSlides() {
	const main = document.getElementById('main-content');
	if (!main) return;

	// Estado de carregamento
	main.innerHTML = `
		<div class="p-6 max-w-6xl mx-auto">
			<div class="flex justify-between items-center mb-8">
				<div>
					<h2 class="text-2xl font-bold text-gray-800">Slideshow</h2>
					<p class="text-sm text-gray-500 mt-1">Gerencie os banners da página inicial</p>
				</div>
				<button id="btn-novo-slide" class="px-5 py-2.5 bg-cyan text-white rounded-lg hover:bg-cyan/90 transition-all text-sm font-semibold shadow-sm hover:shadow-md flex items-center gap-2">
					<i class="fa-solid fa-plus"></i>
					Adicionar Novo Slide
				</button>
			</div>
			<div class="flex items-center justify-center py-20">
				<i class="fa-solid fa-spinner fa-spin text-3xl text-cyan mr-3"></i>
				<span class="text-gray-500">Carregando slides...</span>
			</div>
		</div>
	`;

	// Carregar dados
	await loadSlides();

	// Sem slides — estado vazio
	if (slides.length === 0) {
		main.innerHTML = `
			<div class="p-6 max-w-6xl mx-auto">
				<div class="flex justify-between items-center mb-8">
					<div>
						<h2 class="text-2xl font-bold text-gray-800">Slideshow</h2>
						<p class="text-sm text-gray-500 mt-1">Gerencie os banners da página inicial</p>
					</div>
					<button id="btn-novo-slide" class="px-5 py-2.5 bg-cyan text-white rounded-lg hover:bg-cyan/90 transition-all text-sm font-semibold shadow-sm hover:shadow-md flex items-center gap-2">
						<i class="fa-solid fa-plus"></i>
						Adicionar Novo Slide
					</button>
				</div>
				<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
					<div class="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
						<i class="fa-solid fa-images text-3xl text-gray-300"></i>
					</div>
					<h3 class="text-lg font-semibold text-gray-700 mb-2">Nenhum slide cadastrado</h3>
					<p class="text-sm text-gray-400 mb-6">Adicione o primeiro banner para a página inicial</p>
					<button id="btn-novo-slide-empty" class="px-5 py-2.5 bg-cyan text-white rounded-lg hover:bg-cyan/90 transition-all text-sm font-semibold">
						<i class="fa-solid fa-plus mr-2"></i>Adicionar Slide
					</button>
				</div>
			</div>
		`;

		document.getElementById('btn-novo-slide')?.addEventListener('click', () => showSlideModal(null));
		document.getElementById('btn-novo-slide-empty')?.addEventListener('click', () => showSlideModal(null));
		globalThis.editSlide = editSlide;
		globalThis.deleteSlide = deleteSlide;
		globalThis.deleteSlideWithImage = deleteSlideWithImage;
		return;
	}

	// Galeria de cards
	main.innerHTML = `
		<div class="p-6 max-w-6xl mx-auto">
			<div class="flex justify-between items-center mb-8">
				<div>
					<h2 class="text-2xl font-bold text-gray-800">Slideshow</h2>
					<p class="text-sm text-gray-500 mt-1">${slides.length} slide${slides.length === 1 ? '' : 's'} cadastrado${slides.length === 1 ? '' : 's'}</p>
				</div>
				<button id="btn-novo-slide" class="px-5 py-2.5 bg-cyan text-white rounded-lg hover:bg-cyan/90 transition-all text-sm font-semibold shadow-sm hover:shadow-md flex items-center gap-2">
					<i class="fa-solid fa-plus"></i>
					Adicionar Novo Slide
				</button>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
				${slides.map(s => `
					<div data-slide-id="${s.id}" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-cyan/30 transition-all duration-200 group">
						<!-- Imagem -->
						<div class="relative h-44 bg-gray-100 overflow-hidden">
							${s.imagem_url
								? `<img src="${s.imagem_url}" alt="${s.titulo || 'Slide'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">`
								: `<div class="flex items-center justify-center h-full text-gray-300"><i class="fa-solid fa-image text-4xl"></i></div>`
							}
							<!-- Badge de status -->
							<div class="absolute top-2 left-2">
								<span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${s.ativo ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}">
									${s.ativo ? 'Ativo' : 'Inativo'}
								</span>
							</div>
							<!-- Badge de ordem -->
							<div class="absolute top-2 right-2">
								<span class="px-2 py-1 text-[10px] font-bold bg-black/50 text-white rounded-full">
									#${s.ordem ?? 0}
								</span>
							</div>
						</div>

						<!-- Info + Ações -->
						<div class="p-4">
							<h3 class="font-bold text-gray-800 text-sm truncate mb-0.5">${s.titulo || 'Sem título'}</h3>
							<p class="text-xs text-gray-400 truncate mb-3">${s.subtitulo || '—'}</p>
							<p class="text-[10px] text-gray-300 truncate mb-3 font-mono">${getFileNameFromUrl(s.imagem_url)}</p>

							<div class="flex gap-2">
								<button onclick="globalThis.editSlide('${s.id}')" class="flex-1 px-3 py-2 bg-navy/5 text-navy rounded-lg hover:bg-navy/10 transition-all text-xs font-semibold flex items-center justify-center gap-1.5">
									<i class="fa-solid fa-pen-to-square"></i>Editar
								</button>
								<button onclick="globalThis.deleteSlide('${s.id}')" class="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-xs font-semibold flex items-center justify-center gap-1.5">
									<i class="fa-solid fa-trash-can"></i>Excluir
								</button>
							</div>
						</div>
					</div>
				`).join('')}
			</div>
		</div>
	`;

	// Event listeners
	document.getElementById('btn-novo-slide')?.addEventListener('click', () => showSlideModal(null));

	// Expor funções globais para onclick
	globalThis.editSlide = editSlide;
	globalThis.deleteSlide = deleteSlide;
	globalThis.deleteSlideWithImage = deleteSlideWithImage;

	globalThis.dispatchEvent(new Event('slidesUpdated'));
}

// Wrapper para compatibilidade com switchSection
async function renderSlideshow() {
	await renderSlides();
}
// ============================================
// PAGINAS RENDER
// ============================================
async function renderPaginas() {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="p-6 animate-fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 tracking-tight">Páginas</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <a href="../index.html" target="_blank" class="admin-card p-6 block group">
          <div class="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan/20 transition-colors">
            <i class="fa-solid fa-house text-xl text-cyan"></i>
          </div>
          <h4 class="font-bold text-gray-800 mb-1">Página Inicial</h4>
          <p class="text-sm text-gray-400">Site principal</p>
        </a>
        <a href="../agendamento.html" target="_blank" class="admin-card p-6 block group">
          <div class="w-12 h-12 bg-magenta/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-magenta/20 transition-colors">
            <i class="fa-solid fa-calendar text-xl text-magenta"></i>
          </div>
          <h4 class="font-bold text-gray-800 mb-1">Agendamentos</h4>
          <p class="text-sm text-gray-400">Formulário de marcação</p>
        </a>
        <a href="../paginas/produtos.html" target="_blank" class="admin-card p-6 block group">
          <div class="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-navy/20 transition-colors">
            <i class="fa-solid fa-box text-xl text-navy"></i>
          </div>
          <h4 class="font-bold text-gray-800 mb-1">Produtos</h4>
          <p class="text-sm text-gray-400">Catálogo de produtos</p>
        </a>
        <a href="../paginas/servicos.html" target="_blank" class="admin-card p-6 block group">
          <div class="w-12 h-12 bg-yellow/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow/20 transition-colors">
            <i class="fa-solid fa-eye text-xl text-yellow"></i>
          </div>
          <h4 class="font-bold text-gray-800 mb-1">Serviços</h4>
          <p class="text-sm text-gray-400">Página de serviços</p>
        </a>
      </div>
    </div>
  `;
}


// ============================================
// LENTES RENDER
// ============================================
function renderLentes() {
  renderProdutos('lente');
}


// ============================================
// HELPER FUNCTIONS
// ============================================
function formatPrice(value) {
  return new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
}

// Formatar data
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Sanitizar HTML para prevenir XSS
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


// ============================================
// CONSULTAS
// ============================================

// Carregar consultas do Supabase
async function loadConsultas() {
  try {
    const { data, error } = await globalThis.supabase
      .from('consultas')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    consultas = data || [];
    console.log('[LOAD] Consultas carregadas:', consultas.length);
  } catch (error) {
    console.error('Erro ao carregar consultas:', error);
    consultas = [];
  }
}

// Renderizar secção de consultas
function renderConsultas() {
  const main = document.getElementById('main-content');

  main.innerHTML = `
    <div class="p-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Consultas</h2>
          <p class="text-sm text-gray-500 mt-1">Registo de consultas oftalmológicas</p>
        </div>
        <button onclick="showConsultaModal()" class="admin-btn-primary px-5 py-2.5 text-sm font-semibold flex items-center gap-2">
          <i class="fa-solid fa-plus"></i>
          Nova Consulta
        </button>
      </div>

      <!-- Filtro -->
      <div class="mb-4">
        <input type="text" id="search-consultas" placeholder="Buscar por nome do paciente..."
          class="admin-input w-full max-w-md px-4 py-2.5 text-sm"
          oninput="filterConsultas(this.value)">
      </div>

      <!-- Tabela -->
      <div id="consultas-table-container">
        ${renderConsultasTable(consultas)}
      </div>
    </div>
  `;

  // Expor funções globalmente para onclick handlers
  globalThis.showConsultaModal = showConsultaModal;
  globalThis.editConsulta = editConsulta;
  globalThis.deleteConsulta = deleteConsulta;
  globalThis.printConsulta = printConsulta;
  globalThis.filterConsultas = filterConsultas;
  globalThis.closeConsultaModal = closeConsultaModal;
  globalThis.selectPacienteFromList = selectPacienteFromList;
}

// Filtrar consultas por nome ou diagnóstico
function filterConsultas(query) {
  const filtered = consultas.filter(c =>
    c.nome_paciente.toLowerCase().includes(query.toLowerCase()) ||
    (c.diagnostico && c.diagnostico.toLowerCase().includes(query.toLowerCase()))
  );
  document.getElementById('consultas-table-container').innerHTML = renderConsultasTable(filtered);
}

// Renderizar tabela de consultas
function renderConsultasTable(data) {
  if (!data || data.length === 0) {
    return `
      <div class="admin-empty-state text-center py-16">
        <div class="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-stethoscope text-3xl text-gray-400"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Nenhuma consulta registada</h3>
        <p class="text-sm text-gray-400 mb-6">Registe a primeira consulta do paciente</p>
        <button onclick="showConsultaModal()" class="admin-btn-primary px-5 py-2.5 text-sm font-semibold">
          <i class="fa-solid fa-plus mr-2"></i>Nova Consulta
        </button>
      </div>
    `;
  }

  return `
    <div class="admin-table-container overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Paciente</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Data</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Diagnóstico</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Próxima Consulta</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(c => `
            <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="py-3 px-4">
                <div class="font-medium text-gray-800">${escapeHtml(c.nome_paciente)}</div>
                ${c.telefone_paciente ? `<div class="text-xs text-gray-400">${escapeHtml(c.telefone_paciente)}</div>` : ''}
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">
                ${formatDate(c.criado_em)}
              </td>
              <td class="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                ${escapeHtml(c.diagnostico || '-')}
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">
                ${c.data_proxima_consulta ? formatDate(c.data_proxima_consulta) : '-'}
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button onclick="generatePrescricaoPDF('${c.id}')" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Gerar PDF">
                    <i class="fa-solid fa-file-pdf"></i>
                  </button>
                  <button onclick="printConsulta('${c.id}')" class="p-2 text-gray-400 hover:text-cyan hover:bg-cyan/10 rounded-lg transition-all" title="Imprimir">
                    <i class="fa-solid fa-print"></i>
                  </button>
                  <button onclick="editConsulta('${c.id}')" class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button onclick="deleteConsulta('${c.id}')" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Filtrar consultas
function filterConsultas(query) {
  const filtered = consultas.filter(c =>
    c.nome_paciente.toLowerCase().includes(query.toLowerCase()) ||
    (c.diagnostico && c.diagnostico.toLowerCase().includes(query.toLowerCase()))
  );
  document.getElementById('consultas-table-container').innerHTML = renderConsultasTable(filtered);
}

// Modal de consulta
function showConsultaModal(consulta = null) {
  currentConsulta = consulta;
  const isEdit = !!consulta;

  const modal = document.createElement('div');
  modal.id = 'consulta-modal';
  modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-navy to-navy/90 rounded-t-2xl sticky top-0 z-10">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-stethoscope text-cyan"></i>
          ${isEdit ? 'Editar Consulta' : 'Nova Consulta'}
        </h3>
        <button onclick="closeConsultaModal()" class="text-white/60 hover:text-white transition-colors">
          <i class="fa-solid fa-times text-lg"></i>
        </button>
      </div>

      <form id="consulta-form" class="p-6 space-y-6">
        <!-- Secção 1: Dados do Paciente -->
        <div class="bg-gray-50 rounded-xl p-4">
          <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-user text-cyan"></i> Dados do Paciente
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2 relative">
              <label class="block text-xs font-semibold text-gray-600 mb-1">
                Nome Completo * ${!isEdit ? '<span class="text-gray-400 font-normal">(selecione um paciente com agendamento)</span>' : ''}
              </label>
              <input type="text" id="consulta-nome" required
                class="admin-input w-full px-3 py-2 text-sm"
                value="${escapeHtml(consulta?.nome_paciente || '')}"
                ${isEdit ? '' : 'autocomplete="off"'}>
              <div id="autocomplete-pacientes" class="hidden absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"></div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Telefone</label>
              <input type="tel" id="consulta-telefone"
                class="admin-input w-full px-3 py-2 text-sm"
                value="${escapeHtml(consulta?.telefone_paciente || '')}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <input type="email" id="consulta-email"
                class="admin-input w-full px-3 py-2 text-sm"
                value="${escapeHtml(consulta?.email_paciente || '')}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Data de Nascimento</label>
              <input type="date" id="consulta-nascimento"
                class="admin-input w-full px-3 py-2 text-sm"
                value="${consulta?.data_nascimento || ''}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Gênero</label>
              <select id="consulta-genero" class="admin-input w-full px-3 py-2 text-sm">
                <option value="">Selecionar...</option>
                <option value="M" ${consulta?.genero === 'M' ? 'selected' : ''}>Masculino</option>
                <option value="F" ${consulta?.genero === 'F' ? 'selected' : ''}>Feminino</option>
                <option value="Outro" ${consulta?.genero === 'Outro' ? 'selected' : ''}>Outro</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Secção 2: Histórico Clínico -->
        <div class="bg-gray-50 rounded-xl p-4">
          <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-notes-medical text-cyan"></i> Histórico Clínico
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-gray-600 mb-1">Queixa Principal</label>
              <textarea id="consulta-queixa" rows="2"
                class="admin-input w-full px-3 py-2 text-sm">${escapeHtml(consulta?.queixa_principal || '')}</textarea>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Histórico Médico</label>
              <textarea id="consulta-historico" rows="2"
                class="admin-input w-full px-3 py-2 text-sm">${escapeHtml(consulta?.historico_medico || '')}</textarea>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Medicação Atual</label>
              <textarea id="consulta-medicacao" rows="2"
                class="admin-input w-full px-3 py-2 text-sm">${escapeHtml(consulta?.medicacao_atual || '')}</textarea>
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-gray-600 mb-1">Alergias</label>
              <input type="text" id="consulta-alergias"
                class="admin-input w-full px-3 py-2 text-sm"
                value="${escapeHtml(consulta?.alergias || '')}">
            </div>
          </div>
        </div>

        <!-- Secção 3: Exame Oftalmológico -->
        <div class="bg-gray-50 rounded-xl p-4">
          <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-eye text-cyan"></i> Exame Oftalmológico
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Acuidade Visual OD</label>
              <input type="text" id="consulta-acuidade-od" placeholder="Ex: 20/20"
                class="admin-input w-full px-3 py-2 text-sm"
                value="${escapeHtml(consulta?.acuidade_visual_od || '')}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Acuidade Visual OE</label>
              <input type="text" id="consulta-acuidade-oe" placeholder="Ex: 20/20"
                class="admin-input w-full px-3 py-2 text-sm"
                value="${escapeHtml(consulta?.acuidade_visual_oe || '')}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Pressão Intraocular OD (mmHg)</label>
              <input type="text" id="consulta-pio-od" placeholder="Ex: 15"
                class="admin-input w-full px-3 py-2 text-sm"
                value="${escapeHtml(consulta?.pressao_intraocular_od || '')}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Pressão Intraocular OE (mmHg)</label>
              <input type="text" id="consulta-pio-oe" placeholder="Ex: 15"
                class="admin-input w-full px-3 py-2 text-sm"
                value="${escapeHtml(consulta?.pressao_intraocular_oe || '')}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Refração OD</label>
              <input type="text" id="consulta-refracao-od" placeholder="Ex: -2.00"
                class="admin-input w-full px-3 py-2 text-sm"
                value="${escapeHtml(consulta?.refracao_od || '')}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Refração OE</label>
              <input type="text" id="consulta-refracao-oe" placeholder="Ex: -1.50"
                class="admin-input w-full px-3 py-2 text-sm"
                value="${escapeHtml(consulta?.refracao_oe || '')}">
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-gray-600 mb-1">Fundo do Olho</label>
              <textarea id="consulta-fundo-olho" rows="2"
                class="admin-input w-full px-3 py-2 text-sm">${escapeHtml(consulta?.fundo_olho || '')}</textarea>
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-gray-600 mb-1">Observações do Exame</label>
              <textarea id="consulta-obs-exame" rows="2"
                class="admin-input w-full px-3 py-2 text-sm">${escapeHtml(consulta?.observacoes_exame || '')}</textarea>
            </div>
          </div>
        </div>

        <!-- Secção 4: Diagnóstico e Prescrição -->
        <div class="bg-gray-50 rounded-xl p-4">
          <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-prescription text-cyan"></i> Diagnóstico e Prescrição
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-gray-600 mb-1">Diagnóstico</label>
              <textarea id="consulta-diagnostico" rows="2"
                class="admin-input w-full px-3 py-2 text-sm">${escapeHtml(consulta?.diagnostico || '')}</textarea>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Prescrição de Lentes</label>
              <textarea id="consulta-lentes" rows="2"
                class="admin-input w-full px-3 py-2 text-sm">${escapeHtml(consulta?.prescricao_lentes || '')}</textarea>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Prescrição de Medicação</label>
              <textarea id="consulta-medicacao-rx" rows="2"
                class="admin-input w-full px-3 py-2 text-sm">${escapeHtml(consulta?.prescricao_medicacao || '')}</textarea>
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-gray-600 mb-1">Observações Gerais</label>
              <textarea id="consulta-observacoes" rows="2"
                class="admin-input w-full px-3 py-2 text-sm">${escapeHtml(consulta?.observacoes || '')}</textarea>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Data da Próxima Consulta</label>
              <input type="date" id="consulta-proxima"
                class="admin-input w-full px-3 py-2 text-sm"
                value="${consulta?.data_proxima_consulta || ''}">
            </div>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onclick="closeConsultaModal()"
            class="admin-btn-secondary px-5 py-2.5 text-sm font-semibold">
            Cancelar
          </button>
          <button type="submit" id="submit-consulta-btn"
            class="admin-btn-primary px-5 py-2.5 text-sm font-semibold">
            <i class="fa-solid fa-save mr-2"></i>${isEdit ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Submit handler
  document.getElementById('consulta-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveConsulta();
  });

  // Fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeConsultaModal();
  });

  // Autocomplete de pacientes (apenas para novas consultas)
  if (!isEdit) {
    setupPacienteAutocomplete();
  }

  document.getElementById('consulta-nome').focus();
}

// Configurar autocomplete de pacientes com agendamentos
function setupPacienteAutocomplete() {
  const input = document.getElementById('consulta-nome');
  const dropdown = document.getElementById('autocomplete-pacientes');
  if (!input || !dropdown) return;

  // Criar lista única de pacientes a partir de TODOS os agendamentos
  const pacientesMap = new Map();
  agendamentos.forEach(a => {
    const nome = (a.cliente_nome || '').trim();
    if (nome && !pacientesMap.has(nome.toLowerCase())) {
      pacientesMap.set(nome.toLowerCase(), {
        nome: a.cliente_nome,
        telefone: a.cliente_telefone || '',
        servico: a.servico || ''
      });
    }
  });

  // Adicionar também clientes da tabela clientes
  clientes.forEach(c => {
    const nome = (c.nome || '').trim();
    if (nome && !pacientesMap.has(nome.toLowerCase())) {
      pacientesMap.set(nome.toLowerCase(), {
        nome: c.nome,
        telefone: c.telefone || '',
        servico: ''
      });
    } else if (nome && pacientesMap.has(nome.toLowerCase())) {
      // Atualizar email se existir
      const existing = pacientesMap.get(nome.toLowerCase());
      if (c.email) existing.email = c.email;
    }
  });

  const pacientesList = Array.from(pacientesMap.values());

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (query.length < 2) {
      dropdown.classList.add('hidden');
      return;
    }

    const matches = pacientesList.filter(p =>
      p.nome.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      dropdown.classList.add('hidden');
      return;
    }

    dropdown.innerHTML = matches.map(p => `
      <div class="px-4 py-3 hover:bg-cyan/10 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
           onclick="selectPacienteFromList('${escapeHtml(p.nome)}', '${escapeHtml(p.telefone)}', '${escapeHtml(p.email || '')}', '${escapeHtml(p.servico)}')">
        <div class="font-medium text-sm text-gray-800">${escapeHtml(p.nome)}</div>
        <div class="text-xs text-gray-400">${escapeHtml(p.telefone)} ${p.email ? '· ' + escapeHtml(p.email) : ''}</div>
      </div>
    `).join('');

    dropdown.classList.remove('hidden');
  });

  // Fechar dropdown ao clicar fora
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

// Selecionar paciente do autocomplete
function selectPacienteFromList(nome, telefone, email, servico) {
  document.getElementById('consulta-nome').value = nome;
  document.getElementById('consulta-telefone').value = telefone;
  document.getElementById('consulta-email').value = email || '';
  document.getElementById('autocomplete-pacientes').classList.add('hidden');

  // Preencher queixa principal com o serviço
  if (servico) {
    document.getElementById('consulta-queixa').value = servico;
  }
}

// Fechar modal
function closeConsultaModal() {
  const modal = document.getElementById('consulta-modal');
  if (modal) modal.remove();
  currentConsulta = null;
}

// Salvar consulta
async function saveConsulta() {
  const btn = document.getElementById('submit-consulta-btn');
  if (!btn) return;

  const data = {
    nome_paciente: document.getElementById('consulta-nome').value.trim(),
    telefone_paciente: document.getElementById('consulta-telefone').value.trim() || null,
    email_paciente: document.getElementById('consulta-email').value.trim() || null,
    data_nascimento: document.getElementById('consulta-nascimento').value || null,
    genero: document.getElementById('consulta-genero').value || null,
    queixa_principal: document.getElementById('consulta-queixa').value.trim() || null,
    historico_medico: document.getElementById('consulta-historico').value.trim() || null,
    medicacao_atual: document.getElementById('consulta-medicacao').value.trim() || null,
    alergias: document.getElementById('consulta-alergias').value.trim() || null,
    acuidade_visual_od: document.getElementById('consulta-acuidade-od').value.trim() || null,
    acuidade_visual_oe: document.getElementById('consulta-acuidade-oe').value.trim() || null,
    pressao_intraocular_od: document.getElementById('consulta-pio-od').value.trim() || null,
    pressao_intraocular_oe: document.getElementById('consulta-pio-oe').value.trim() || null,
    refracao_od: document.getElementById('consulta-refracao-od').value.trim() || null,
    refracao_oe: document.getElementById('consulta-refracao-oe').value.trim() || null,
    fundo_olho: document.getElementById('consulta-fundo-olho').value.trim() || null,
    observacoes_exame: document.getElementById('consulta-obs-exame').value.trim() || null,
    diagnostico: document.getElementById('consulta-diagnostico').value.trim() || null,
    prescricao_lentes: document.getElementById('consulta-lentes').value.trim() || null,
    prescricao_medicacao: document.getElementById('consulta-medicacao-rx').value.trim() || null,
    observacoes: document.getElementById('consulta-observacoes').value.trim() || null,
    data_proxima_consulta: document.getElementById('consulta-proxima').value || null
  };

  if (!data.nome_paciente) {
    showToast('Preencha o nome do paciente', 'error');
    return;
  }

  // Verificar duplicados apenas ao criar nova consulta
  if (!currentConsulta?.id) {
    const { data: existing } = await globalThis.supabase
      .from('consultas')
      .select('id')
      .eq('nome_paciente', data.nome_paciente)
      .limit(1);

    if (existing && existing.length > 0) {
      showToast('Já existe uma consulta registada para este paciente', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Salvar Consulta';
      return;
    }
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Salvando...';

  try {
    // Debug completo da sessão
    const { data: sessaoData, error: sessaoErro } = await globalThis.supabase.auth.getSession();
    console.log('🔍 [DEBUG] ============================');
    console.log('🔍 [DEBUG] SESSÃO');
    console.log('🔍 [DEBUG] Existe sessão:', !!sessaoData?.session);
    console.log('🔍 [DEBUG] Access token existe:', !!sessaoData?.session?.access_token);
    if (sessaoData?.session?.access_token) {
      console.log('🔍 [DEBUG] Token (primeiros 30 chars):', sessaoData.session.access_token.substring(0, 30));
    }
    console.log('🔍 [DEBUG] User email:', sessaoData?.session?.user?.email || 'NENHUM');
    console.log('🔍 [DEBUG] User id:', sessaoData?.session?.user?.id || 'NENHUM');
    console.log('🔍 [DEBUG] Erro sessão:', sessaoErro ? JSON.stringify(sessaoErro) : 'NENHUM');
    console.log('🔍 [DEBUG] ============================');

    // Testar SELECT primeiro
    console.log('🔍 [DEBUG] Testando SELECT na tabela consultas...');
    const { data: testData, error: testError } = await globalThis.supabase
      .from('consultas')
      .select('id')
      .limit(1);
    console.log('🔍 [DEBUG] SELECT resultado:', JSON.stringify({ data: testData, error: testError }));

    if (currentConsulta?.id) {
      const { data: updateData, error: updateError } = await globalThis.supabase
        .from('consultas')
        .update(data)
        .eq('id', currentConsulta.id)
        .select();
      console.log('🔍 [DEBUG] UPDATE resultado:', JSON.stringify({ data: updateData, error: updateError }));
      if (updateError) throw updateError;
      showToast('Consulta atualizada com sucesso!', 'success');
    } else {
      console.log('🔍 [DEBUG] Tentando INSERT com dados:', JSON.stringify(data));
      const { data: insertData, error: insertError } = await globalThis.supabase
        .from('consultas')
        .insert([data])
        .select();
      console.log('🔍 [DEBUG] INSERT resultado:', JSON.stringify({ data: insertData, error: insertError }));
      if (insertError) throw insertError;

      // Adicionar/atualizar cliente na secção Clientes
      await addClienteFromConsulta(data);

      // Marcar agendamento como "feito"
      await marcarAgendamentoFeito(data.nome_paciente);

      showToast('Consulta registada com sucesso!', 'success');
    }

    await loadConsultas();
    await loadClientes();
    await loadAgendamentos();
    renderConsultas();
    closeConsultaModal();
  } catch (error) {
    console.error('Erro ao salvar consulta:', error);
    showToast('Erro ao salvar consulta: ' + (error.message || ''), 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-save mr-2"></i>Salvar';
  }
}

// Marcar agendamento como "feito" após criar consulta
async function marcarAgendamentoFeito(nomePaciente) {
  try {
    if (!nomePaciente) return;

    const nome = nomePaciente.trim();

    // Encontrar agendamento pendente/confirmado mais recente deste paciente
    const { data: agendamentos } = await globalThis.supabase
      .from('agendamentos')
      .select('*')
      .ilike('cliente_nome', nome)
      .in('status', ['pendente', 'confirmado'])
      .order('data', { ascending: false })
      .limit(1);

    if (agendamentos && agendamentos.length > 0) {
      const { error } = await globalThis.supabase
        .from('agendamentos')
        .update({ status: 'feito' })
        .eq('id', agendamentos[0].id);

      if (error) throw error;
      console.log('[AGENDAMENTO] Status atualizado para "feito":', agendamentos[0].cliente_nome);
    }
  } catch (error) {
    console.error('[AGENDAMENTO] Erro ao atualizar status:', error);
  }
}

// Adicionar/atualizar cliente a partir dos dados da consulta
async function addClienteFromConsulta(consultaData) {
  try {
    if (!consultaData.nome_paciente) return;

    // Verificar se cliente já existe (por nome + telefone)
    const nome = consultaData.nome_paciente.trim();
    const telefone = consultaData.telefone_paciente?.trim() || null;
    const email = consultaData.email_paciente?.trim() || null;

    // Buscar cliente existente
    let clienteExistente = null;
    if (telefone) {
      const { data } = await globalThis.supabase
        .from('clientes')
        .select('*')
        .eq('nome', nome)
        .eq('telefone', telefone)
        .maybeSingle();
      clienteExistente = data;
    } else {
      const { data } = await globalThis.supabase
        .from('clientes')
        .select('*')
        .eq('nome', nome)
        .maybeSingle();
      clienteExistente = data;
    }

    if (clienteExistente) {
      // Atualizar dados se necessário
      const updates = {};
      if (email && !clienteExistente.email) updates.email = email;
      if (telefone && !clienteExistente.telefone) updates.telefone = telefone;

      if (Object.keys(updates).length > 0) {
        await globalThis.supabase
          .from('clientes')
          .update(updates)
          .eq('id', clienteExistente.id);
        console.log('[CLIENTE] Atualizado:', nome);
      }
    } else {
      // Criar novo cliente
      const { error } = await globalThis.supabase
        .from('clientes')
        .insert([{
          nome: nome,
          telefone: telefone,
          email: email
        }]);
      if (error) {
        console.error('[CLIENTE] Erro ao criar:', error);
      } else {
        console.log('[CLIENTE] Criado:', nome);
      }
    }
  } catch (error) {
    console.error('[CLIENTE] Erro ao adicionar cliente:', error);
  }
}






// Editar consulta
async function editConsulta(id) {
  try {
    const { data, error } = await globalThis.supabase
      .from('consultas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    showConsultaModal(data);
  } catch (error) {
    console.error('Erro ao carregar consulta:', error);
    showToast('Erro ao carregar consulta', 'error');
  }
}

// Eliminar consulta
async function deleteConsulta(id) {
  if (!confirm('Tem certeza que deseja eliminar este registo de consulta?')) return;

  try {
    const { error } = await globalThis.supabase
      .from('consultas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    showToast('Consulta eliminada com sucesso!', 'success');
    await loadConsultas();
    renderConsultas();
  } catch (error) {
    console.error('Erro ao eliminar consulta:', error);
    showToast('Erro ao eliminar consulta', 'error');
  }
}

// Imprimir consulta
async function printConsulta(id) {
  try {
    const { data: c, error } = await globalThis.supabase
      .from('consultas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Consulta - ${escapeHtml(c.nome_paciente)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; padding: 40px; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0D1B2E; padding-bottom: 20px; margin-bottom: 30px; }
          .header img { height: 80px; }
          .header-info { text-align: right; }
          .header-info h2 { color: #0D1B2E; font-size: 14px; }
          .header-info p { color: #666; font-size: 12px; }
          .patient-info { background: #f8f9fa; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px; }
          .patient-info h3 { color: #0D1B2E; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #dee2e6; padding-bottom: 8px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .info-item { font-size: 13px; }
          .info-item strong { color: #0D1B2E; }
          .section { margin-bottom: 25px; }
          .section h3 { color: #0D1B2E; font-size: 15px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #00aadc; }
          .section-content { font-size: 13px; line-height: 1.6; }
          .eye-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .eye-card { background: #f8f9fa; padding: 12px; border-radius: 6px; }
          .eye-card h4 { color: #00aadc; font-size: 13px; margin-bottom: 8px; }
          .eye-card .item { font-size: 12px; margin-bottom: 4px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #0D1B2E; display: flex; justify-content: space-between; }
          .footer .signature { width: 200px; text-align: center; }
          .footer .signature .line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; font-size: 12px; color: #666; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="../Logo/viva_logo_branco.jpeg" alt="Viva Óptica" onerror="this.style.display='none'">
          <div class="header-info">
            <h2>VIVA ÓPTICA</h2>
            <p>Consultas Oftalmológicas</p>
            <p>Data: ${formatDate(c.criado_em)}</p>
          </div>
        </div>

        <div class="patient-info">
          <h3><i class="fa-solid fa-user"></i> Dados do Paciente</h3>
          <div class="info-grid">
            <div class="info-item"><strong>Nome:</strong> ${escapeHtml(c.nome_paciente)}</div>
            <div class="info-item"><strong>Telefone:</strong> ${escapeHtml(c.telefone_paciente || '-')}</div>
            <div class="info-item"><strong>Email:</strong> ${escapeHtml(c.email_paciente || '-')}</div>
            <div class="info-item"><strong>Data Nasc.:</strong> ${c.data_nascimento ? formatDate(c.data_nascimento) : '-'}</div>
            <div class="info-item"><strong>Gênero:</strong> ${c.genero === 'M' ? 'Masculino' : c.genero === 'F' ? 'Feminino' : c.genero || '-'}</div>
          </div>
        </div>

        ${c.queixa_principal || c.historico_medico || c.medicacao_atual || c.alergias ? `
        <div class="section">
          <h3>Histórico Clínico</h3>
          <div class="section-content">
            ${c.queixa_principal ? `<p><strong>Queixa Principal:</strong> ${escapeHtml(c.queixa_principal)}</p>` : ''}
            ${c.historico_medico ? `<p><strong>Histórico Médico:</strong> ${escapeHtml(c.historico_medico)}</p>` : ''}
            ${c.medicacao_atual ? `<p><strong>Medicação Atual:</strong> ${escapeHtml(c.medicacao_atual)}</p>` : ''}
            ${c.alergias ? `<p><strong>Alergias:</strong> ${escapeHtml(c.alergias)}</p>` : ''}
          </div>
        </div>
        ` : ''}

        ${(c.acuidade_visual_od || c.acuidade_visual_oe || c.pressao_intraocular_od || c.pressao_intraocular_oe || c.refracao_od || c.refracao_oe) ? `
        <div class="section">
          <h3>Exame Oftalmológico</h3>
          <div class="eye-grid">
            <div class="eye-card">
              <h4>Olho Direito (OD)</h4>
              ${c.acuidade_visual_od ? `<div class="item"><strong>Acuidade Visual:</strong> ${escapeHtml(c.acuidade_visual_od)}</div>` : ''}
              ${c.pressao_intraocular_od ? `<div class="item"><strong>Pressão Intraocular:</strong> ${escapeHtml(c.pressao_intraocular_od)} mmHg</div>` : ''}
              ${c.refracao_od ? `<div class="item"><strong>Refração:</strong> ${escapeHtml(c.refracao_od)}</div>` : ''}
            </div>
            <div class="eye-card">
              <h4>Olho Esquerdo (OE)</h4>
              ${c.acuidade_visual_oe ? `<div class="item"><strong>Acuidade Visual:</strong> ${escapeHtml(c.acuidade_visual_oe)}</div>` : ''}
              ${c.pressao_intraocular_oe ? `<div class="item"><strong>Pressão Intraocular:</strong> ${escapeHtml(c.pressao_intraocular_oe)} mmHg</div>` : ''}
              ${c.refracao_oe ? `<div class="item"><strong>Refração:</strong> ${escapeHtml(c.refracao_oe)}</div>` : ''}
            </div>
          </div>
          ${c.fundo_olho ? `<p style="margin-top:12px;font-size:13px"><strong>Fundo do Olho:</strong> ${escapeHtml(c.fundo_olho)}</p>` : ''}
          ${c.observacoes_exame ? `<p style="margin-top:8px;font-size:13px"><strong>Observações:</strong> ${escapeHtml(c.observacoes_exame)}</p>` : ''}
        </div>
        ` : ''}

        ${c.diagnostico || c.prescricao_lentes || c.prescricao_medicacao ? `
        <div class="section">
          <h3>Diagnóstico e Prescrição</h3>
          <div class="section-content">
            ${c.diagnostico ? `<p><strong>Diagnóstico:</strong> ${escapeHtml(c.diagnostico)}</p>` : ''}
            ${c.prescricao_lentes ? `<p><strong>Prescrição de Lentes:</strong> ${escapeHtml(c.prescricao_lentes)}</p>` : ''}
            ${c.prescricao_medicacao ? `<p><strong>Prescrição de Medicação:</strong> ${escapeHtml(c.prescricao_medicacao)}</p>` : ''}
            ${c.observacoes ? `<p><strong>Observações:</strong> ${escapeHtml(c.observacoes)}</p>` : ''}
            ${c.data_proxima_consulta ? `<p><strong>Próxima Consulta:</strong> ${formatDate(c.data_proxima_consulta)}</p>` : ''}
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <div></div>
          <div class="signature">
            <div class="line">Médico</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  } catch (error) {
    console.error('Erro ao gerar impressão:', error);
    showToast('Erro ao gerar impressão', 'error');
  }
}


// ============================================
// INICIALIZACAO
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 [APP] Inicializando painel admin...');

  globalThis.supabase = await globalThis.getSupabase();
  if (!globalThis.supabase) {
    alert('Erro: Não foi possível conectar ao Supabase');
    return;
  }

  console.log('✅ [APP] Supabase pronto');

  await Promise.all([
    loadAgendamentos(),
    loadClientes(),
    loadConsultas()
  ]);

  console.log('✅ [APP] Dados carregados');

  // Renderizar dashboard por padrão
  renderDashboard();

  // Configurar navegação do sidebar
  setupNavigation();

  // Expor função de PDF globalmente
  globalThis.generatePrescricaoPDF = generatePrescricaoPDF;

  console.log('✅ [APP] Painel inicializado');
});

// ============================================
// GERADOR DE PDF - RECEITA MÉDICA DE ÓCULOS
// ============================================

// Calcular idade a partir da data de nascimento
function calcularIdade(dataNascimento) {
  if (!dataNascimento) return '-';
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade + ' anos';
}

// Formatar data para exibição
function formatarData(dataStr) {
  if (!dataStr) return '-';
  const data = new Date(dataStr);
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Gerar PDF da receita médica
async function generatePrescricaoPDF(id) {
  try {
    const { data: consulta, error } = await globalThis.supabase
      .from('consultas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Usar jsPDF (carregado via CDN)
    const jsPDF = window.jspdf?.jsPDF;
    if (!jsPDF) throw new Error('jsPDF não carregado');
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // === CABEÇALHO ===
    // Converter logo para base64 via fetch
    let logoBase64 = null;
    try {
      const logoPaths = ['../Logo/viva_logo_branco.jpeg', '../Logo/viva_logo.png', '../Logo/Logo_viva_otica.jpeg'];
      for (const path of logoPaths) {
        try {
          const resp = await fetch(path);
          if (resp.ok) {
            const blob = await resp.blob();
            logoBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(blob);
            });
            if (logoBase64) break;
          }
        } catch (e) { /* tentar próximo caminho */ }
      }
    } catch (e) { console.warn('Logo não carregado:', e); }

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', margin, y, 22, 22);
    }

    // Nome da clínica
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(13, 27, 46);
    doc.text('VIVA ÓPTICA', margin + 25, y + 8);

    // Morada e contactos
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Morro Bento - Instituto Superior Metropolitano de Angola', margin + 25, y + 13);
    doc.text('WhatsApp: 954 145 065 / 936 029 495', margin + 25, y + 17);

    // Data à direita
    doc.setFontSize(9);
    doc.text('Data: ' + formatarData(consulta.criado_em), pageWidth - margin, y + 8, { align: 'right' });
    doc.text('Ref: ' + (consulta.id ? consulta.id.substring(0, 8) : ''), pageWidth - margin, y + 13, { align: 'right' });

    y += 25;

    // Linha separadora
    doc.setDrawColor(0, 170, 220);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // === DADOS DO PACIENTE ===
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('NOME', margin + 3, y + 4);
    doc.text('IDADE', margin + 100, y + 4);
    doc.text('PRÓXIMA CONSULTA', margin + 135, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text(consulta.nome_paciente || '-', margin + 3, y + 11);
    doc.setFont('helvetica', 'normal');
    doc.text(calcularIdade(consulta.data_nascimento), margin + 100, y + 11);
    doc.text(formatarData(consulta.data_proxima_consulta), margin + 135, y + 11);

    y += 25;

    // === TÍTULO RECEITA ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(13, 27, 46);
    doc.text('RECEITA DE ÓCULOS', pageWidth / 2, y, { align: 'center' });

    doc.setDrawColor(0, 170, 220);
    doc.setLineWidth(0.3);
    const titleWidth = doc.getTextWidth('RECEITA DE ÓCULOS');
    doc.line((pageWidth / 2) - (titleWidth / 2), y + 1, (pageWidth / 2) + (titleWidth / 2), y + 1);
    y += 10;

    // === TABELA DE PRESCRIÇÃO ===
    const colWidths = [30, 30, 30, 25, 25, 30]; // O.D/O.E, Esférico, Cilíndrico, Eixo, OP, ADD
    const headers = ['', 'Esférico', 'Cilíndrico', 'Eixo', 'OP', 'ADD'];
    const rows = [
      ['OD Longe', consulta.refracao_od || '', '', '', '', ''],
      ['OD Perto', '', '', '', '', ''],
      ['OE Longe', consulta.refracao_oe || '', '', '', '', ''],
      ['OE Perto', '', '', '', '', '']
    ];

    // Cabeçalho da tabela
    doc.setFillColor(13, 27, 46);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    let x = margin;
    headers.forEach((h, i) => {
      doc.text(h, x + colWidths[i] / 2, y + 5.5, { align: 'center' });
      x += colWidths[i];
    });
    y += 8;

    // Linhas da tabela
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 51, 51);
    rows.forEach((row, rowIndex) => {
      x = margin;
      const isOD = rowIndex < 2;
      const isLonge = rowIndex % 2 === 0;

      row.forEach((cell, colIndex) => {
        // Bordas
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.rect(x, y, colWidths[colIndex], 8);

        // Fundo da primeira coluna
        if (colIndex === 0) {
          doc.setFillColor(240, 249, 255);
          doc.rect(x, y, colWidths[colIndex], 8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(cell, x + colWidths[colIndex] / 2, y + 4, { align: 'center' });
          doc.setFontSize(6);
          doc.setTextColor(100, 100, 100);
          doc.text(isLonge ? 'Longe' : 'Perto', x + colWidths[colIndex] / 2, y + 7, { align: 'center' });
          doc.setTextColor(51, 51, 51);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
        } else {
          doc.text(cell, x + colWidths[colIndex] / 2, y + 5.5, { align: 'center' });
        }
        x += colWidths[colIndex];
      });
      y += 8;
    });

    y += 5;

    // === INFORMAÇÕES DO EXAME ===
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 51, 51);
    doc.text('Acuidade Visual:  OD: ' + (consulta.acuidade_visual_od || '-') + '  |  OE: ' + (consulta.acuidade_visual_oe || '-'), margin + 3, y + 5);
    doc.text('Pressão Intraocular:  OD: ' + (consulta.pressao_intraocular_od || '-') + '  |  OE: ' + (consulta.pressao_intraocular_oe || '-'), margin + 3, y + 10);

    y += 18;

    // === PRESCRIÇÃO DE LENTES ===
    if (consulta.prescricao_lentes) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(13, 27, 46);
      doc.text('Prescrição de Lentes', margin, y);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y + 1, pageWidth - margin, y + 1);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 51, 51);
      const lentesLines = doc.splitTextToSize(consulta.prescricao_lentes, contentWidth);
      doc.text(lentesLines, margin, y);
      y += lentesLines.length * 4.5 + 5;
    }

    // === DIAGNÓSTICO ===
    if (consulta.diagnostico) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(13, 27, 46);
      doc.text('Diagnóstico', margin, y);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y + 1, pageWidth - margin, y + 1);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 51, 51);
      const diagLines = doc.splitTextToSize(consulta.diagnostico, contentWidth);
      doc.text(diagLines, margin, y);
      y += diagLines.length * 4.5 + 5;
    }

    // === OBSERVAÇÕES ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(13, 27, 46);
    doc.text('Observações', margin, y);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y + 1, pageWidth - margin, y + 1);
    y += 5;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 51, 51);
    const obsText = consulta.observacoes || consulta.prescricao_medicacao || 'Anti Foto Grey';
    doc.text(obsText, margin + 3, y + 6);

    y += 30;

    // === RODAPÉ ===
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Viva Óptica - Morro Bento, ISMA', margin, y);
    doc.text('Tel: 954 145 065 / 936 029 495', margin, y + 4);

    // Linha de assinatura
    doc.setDrawColor(51, 51, 51);
    doc.setLineWidth(0.3);
    doc.line(pageWidth - margin - 70, y + 10, pageWidth - margin, y + 10);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Assinatura do Optometrista', pageWidth - margin - 35, y + 14, { align: 'center' });

    // Descarregar PDF
    const fileName = `receita_${(consulta.nome_paciente || 'paciente').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

    showToast('PDF gerado com sucesso!', 'success');

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    showToast('Erro ao gerar PDF: ' + (error.message || ''), 'error');
  }
}
