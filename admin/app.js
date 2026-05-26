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
    clientes: 'Clientes',
    configuracoes: 'Configurações'
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
    clientes: renderClientes,
    configuracoes: renderConfiguracoes
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
            <input type="tel" id="cliente_telefone" name="cliente_telefone" value="${data.telefone_cliente || ''}" required
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
              <input type="time" id="data_hora_time" name="data_hora_time" value="${data.data ? new Date(data.data).toTimeString().split(' ')[0].substring(0,5) : ''}" required
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
    const { data, error } = await globalThis.supabase
      .from('agendamentos')
      .update({ status: 'feito' })
      .eq('id', appointmentId)
      .select();

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
      .order('data', { ascending: false });

    if (error) throw error;
    agendamentos = data || [];
    console.log('[LOAD] Agendamentos carregados:', agendamentos.length);
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);
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
      </div>
    </div>
  `;

  const tbody = main.querySelector('#agendamentos-table-body');
  if (tbody) {
    // Função para formatar data/hora
    const formatDateTime = (data, data_hora) => {
      if (data) {
        return new Date(data).toLocaleString('pt-PT');
      }
      if (data_hora) {
        return new Date(data_hora).toLocaleString('pt-PT');
      }
      return 'N/A';
    };
    
    tbody.innerHTML = agendamentos.map(a => `
      <tr>
        <td>
          <div class="font-semibold text-gray-900">${a.cliente_nome || 'N/A'}</div>
          <div class="text-xs text-gray-400 mt-0.5">${a.cliente_telefone || ''}</div>
        </td>
        <td>${formatDateTime(a.data, a.data_hora)}</td>
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
			.from('slides')
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
	const { error } = await globalThis.supabase.storage
		.from(SLIDES_BUCKET)
		.upload(fileName, file, { cacheControl: '3600', upsert: false });

	if (error) throw error;

	const { data: urlData } = globalThis.supabase.storage
		.from(SLIDES_BUCKET)
		.getPublicUrl(fileName);

	return urlData.publicUrl;
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
					<div id="slide-drop-zone" class="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:border-cyan hover:bg-cyan/5 group">
						<input type="file" id="slide-image" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
						<div id="slide-drop-placeholder" class="space-y-2">
							<div class="w-12 h-12 mx-auto bg-cyan/10 rounded-full flex items-center justify-center group-hover:bg-cyan/20 transition-colors">
								<i class="fa-solid fa-cloud-arrow-up text-xl text-cyan"></i>
							</div>
							<p class="text-sm font-medium text-gray-600">Arraste e solte a imagem aqui</p>
							<p class="text-xs text-gray-400">ou clique para selecionar (PNG, JPG até 5MB)</p>
						</div>
						<div id="slide-drop-preview" class="hidden">
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

			preview.src = slide.imagem_url;
			fileName.textContent = getFileNameFromUrl(slide.imagem_url);
			previewBox.classList.remove('hidden');
			placeholder.classList.add('hidden');
			clearBtn.classList.remove('hidden');
		}
	}

	// Submit handler
	document.getElementById('slide-form').addEventListener('submit', async (e) => {
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
	const file = event.target.files?.[0];
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

	if (preview && previewBox && placeholder) {
		const reader = new FileReader();
		reader.onload = (e) => {
			preview.src = e.target.result;
			fileNameEl.textContent = file.name;
			previewBox.classList.remove('hidden');
			placeholder.classList.add('hidden');
			if (clearBtn) clearBtn.classList.remove('hidden');
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

	if (preview) preview.src = '';
	if (previewBox) previewBox.classList.add('hidden');
	if (placeholder) placeholder.classList.remove('hidden');
	if (fileNameEl) fileNameEl.textContent = '';
	if (clearBtn) clearBtn.classList.add('hidden');

	currentSlideImage = null;
}

// Validar dados do slide
function validateSlideData(titulo, imagem_url) {
	if (!titulo) {
		showToast('Preencha o título do slide', 'error');
		return false;
	}
	if (!imagem_url) {
		showToast('Selecione uma imagem para o slide', 'error');
		return false;
	}
	return true;
}

// Fazer upload da imagem do slide
async function handleSlideImageUpload(submitBtn) {
	if (!currentSlideImage) {
		return currentSlide?.imagem_url || '';
	}

	submitBtn.disabled = true;
	submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Enviando imagem...';

	try {
		return await uploadSlideImage(currentSlideImage);
	} catch (error) {
		console.error('Erro no upload:', error);
		showToast('Erro ao enviar imagem para o storage', 'error');
		submitBtn.disabled = false;
		submitBtn.innerHTML = currentSlide ? 'Atualizar Slide' : 'Salvar Slide';
		throw error;
	}
}

// Salvar slide (create ou update)
async function saveSlide() {
	const submitBtn = document.getElementById('submit-slide-btn');
	if (!submitBtn) return;

	const titulo = document.getElementById('slide-titulo')?.value?.trim() || '';
	const subtitulo = document.getElementById('slide-subtitulo')?.value?.trim() || '';
	const ordem = Number.parseInt(document.getElementById('slide-ordem')?.value) || 0;
	const ativo = document.getElementById('slide-ativo')?.value === 'true';

	let imagem_url;

	try {
		imagem_url = await handleSlideImageUpload(submitBtn);
	} catch (error) {
		console.error('Erro ao fazer upload:', error);
		return;
	}

	if (!validateSlideData(titulo, imagem_url)) {
		return;
	}

	submitBtn.disabled = true;
	submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Salvando...';

	const slideData = { titulo, subtitulo, ordem, ativo, imagem_url };

	try {
		if (currentSlide?.id) {
			const { error } = await globalThis.supabase
				.from('slides')
				.update(slideData)
				.eq('id', currentSlide.id);
			if (error) throw error;
			showToast('Slide atualizado com sucesso!', 'success');
		} else {
			const { error } = await globalThis.supabase
				.from('slides')
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
			.from('slides')
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
    loadConfiguracoes()
  ]);

  console.log('✅ [APP] Dados carregados');

  // Renderizar dashboard por padrão
  renderDashboard();

  // Configurar navegação do sidebar
  setupNavigation();

  console.log('✅ [APP] Painel inicializado');
});
