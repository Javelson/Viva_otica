// ============================================
// Configurações da Loja - Viva Óptica Admin
// ============================================

let configuracoes = {};

// Mapeamento de chaves para IDs
const configKeys = {
  'nome_loja': 'config-nome_loja',
  'slogan': 'config-slogan',
  'telefone': 'config-telefone',
  'email_loja': 'config-email_loja',
  'endereco': 'config-endereco',
  'horario_seg_sex': 'config-horario_seg_sex',
  'horario_sabado': 'config-horario_sabado',
  'horario_domingo': 'config-horario_domingo'
};

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadConfiguracoes();
  setupAutoSave();
});

// ============================================
// AUTENTICAÇÃO
// ============================================
function checkAuth() {
  const user = localStorage.getItem('admin_user');
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
}

// ============================================
// CARREGAR CONFIGURAÇÕES
// ============================================
async function loadConfiguracoes() {
  const supabase = window.getSupabase();
  const loading = document.getElementById('loading');
  const content = document.getElementById('config-content');

  loading.classList.remove('hidden');
  content.classList.add('hidden');

  try {
    const { data, error } = await supabase
      .from('configuracoes_loja')
      .select('*');

    if (error) throw error;

    configuracoes = {};
    data.forEach(config => {
      configuracoes[config.chave] = config.valor || '';
    });

    renderConfiguracoes();

    loading.classList.add('hidden');
    content.classList.remove('hidden');

  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    loading.classList.add('hidden');
    showToast('Erro ao carregar configurações', 'error');
  }
}

// ============================================
// RENDERIZAR CONFIGURAÇÕES
// ============================================
function renderConfiguracoes() {
  for (const [chave, elementId] of Object.entries(configKeys)) {
    const input = document.getElementById(elementId);
    if (input) {
      input.value = configuracoes[chave] || '';
    }
  }
}

// ============================================
// SALVAR TODAS AS CONFIGURAÇÕES
// ============================================
async function saveAll() {
  const supabase = window.getSupabase();
  const saveBtn = document.getElementById('save-btn');

  // Coletar novos valores
  const updatedConfigs = {};
  for (const [chave, elementId] of Object.entries(configKeys)) {
    const input = document.getElementById(elementId);
    if (input) {
      updatedConfigs[chave] = input.value;
    }
  }

  // Loading state
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i><span>Salvando...</span>';

  try {
    // Update em batch
    const updates = [];
    for (const [chave, valor] of Object.entries(updatedConfigs)) {
      updates.push({
        chave,
        valor,
        tipo: 'text'
      });
    }

    // Atualizar cada configuração
    for (const config of updates) {
      const { error } = await supabase
        .from('configuracoes_loja')
        .upsert(config, { onConflict: 'chave' });

      if (error) throw error;
    }

    showToast('Configurações salvas com sucesso!', 'success');

  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    showToast('Erro ao salvar configurações: ' + error.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fa-solid fa-save mr-2"></i><span>Salvar Todas</span>';
  }
}

// ============================================
// AUTO-SAVE (debounce)
// ============================================
function setupAutoSave() {
  let timeout;

  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        saveAll();
      }, 2000); // Salva automaticamente após 2s sem mudanças
    });
  });
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

  toast.className = `${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 mb-3 transform transition-all duration-300 translate-y-full opacity-0`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type]}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-full', 'opacity-0');
  }, 10);

  // Remove after 3s
  setTimeout(() => {
    toast.classList.add('translate-y-full', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// LOGOUT
// ============================================
function logout() {
  if (confirm('Tem certeza que deseja sair?')) {
    localStorage.removeItem('admin_user');
    window.location.href = 'login.html';
  }
}
