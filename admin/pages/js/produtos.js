// ============================================
// VARIAVEIS GLOBAIS
// ============================================
let products = [];
let currentImageFile = null;
let currentImageUrl = null;
let currentProduct = null;
let supabase = null;

// ============================================
// AUTENTICACAO
// ============================================
function checkAuth() {
  const email = localStorage.getItem('admin_email');
  if (!email) {
    window.location.href = '../login.html';
    return false;
  }
  return true;
}

// ============================================
// INICIALIZACAO
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;

  // Usar o supabase jA inicializado no HTML
  supabase = window.supabaseApp;

  loadProducts();
  setupEventListeners();
});

// ============================================
// CARREGAR PRODUTOS
// ============================================
async function loadProducts() {
  const loading = document.getElementById('loading');
  const tableBody = document.getElementById('products-table-body');

  if (loading) loading.classList.remove('hidden');
  if (tableBody) tableBody.innerHTML = '';

  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;

    products = data || [];

    if (loading) loading.classList.add('hidden');
    renderProducts(products, '');

  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    if (loading) loading.classList.add('hidden');
    showToast('Erro ao carregar produtos', 'error');
  }
}

// ============================================
// RENDERIZAR PRODUTOS
// ============================================
function renderProducts(productsList, filterCategory = '') {
  const tableBody = document.getElementById('products-table-body');
  const emptyState = document.getElementById('empty-state');

  if (!tableBody) return;

  const filtered = filterCategory
    ? productsList.filter(p => p.categoria === filterCategory)
    : productsList;

  const countEl = document.getElementById('product-count');
  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    tableBody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  // Add toggle visibility function
  window.toggleProductVisibility = async (id, isVisible) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ ativo: isVisible })
        .eq('id', id);

      if (error) throw error;

      showToast(`Produto ${isVisible ? 'visível' : 'oculto'}!`, 'success');
      renderProducts(products, filterCategory);
    } catch (error) {
      console.error('Erro ao atualizar visibilidade:', error);
      showToast('Erro ao atualizar visibilidade', 'error');
    }
  };

  tableBody.innerHTML = filtered.map(product => `
    <tr class="border-b hover:bg-gray-50">
      <td class="px-6 py-4">
        ${product.imagem_url ?
          `<img src="${product.imagem_url}" alt="${product.nome}" class="w-12 h-12 object-cover rounded">` :
          '<div class="w-12 h-12 bg-gray-200 rounded"></div>'
        }
      </td>
      <td class="px-6 py-4 font-medium">${product.nome || ''}</td>
      <td class="px-6 py-4">
        <span class="px-2 py-1 text-xs bg-cyan/10 text-cyan rounded">${product.categoria || ''}</span>
      </td>
      <td class="px-6 py-4">Kz ${(product.preco || 0).toFixed(2)}</td>
      <td class="px-6 py-4">${product.estoque || 0}</td>
      <td class="px-6 py-4 text-center">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" ${product.ativo ? 'checked' : ''}
            onchange="toggleProductVisibility('${product.id}', this.checked)"
            class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan"></div>
          <span class="ml-2 text-sm text-gray-700">${product.ativo ? 'Ativo' : 'Inativo'}</span>
        </label>
      </td>
      <td class="px-6 py-4">
        <button onclick="editProduct('${product.id}')" class="text-cyan hover:text-navy mr-3">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button onclick="deleteProduct('${product.id}')" class="text-red-500 hover:text-red-700">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// ============================================
// FILTRAR PRODUTOS
// ============================================
function filterProducts() {
  const filterValue = document.getElementById('category-filter').value;
  renderProducts(products, filterValue);
}

// ============================================
// ABRIR MODAL
// ============================================
function openModal(isEdit = false) {
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('modal-title');
  const productIdInput = document.getElementById('product-id');

  if (isEdit && currentProduct) {
    title.textContent = 'Editar Produto';
    document.getElementById('product-nome').value = currentProduct.nome || '';
    document.getElementById('product-categoria').value = currentProduct.categoria || '';
    document.getElementById('product-preco').value = currentProduct.preco || '';
    document.getElementById('product-estoque').value = currentProduct.estoque || '';
    productIdInput.value = currentProduct.id || '';
    currentImageUrl = currentProduct.imagem_url || '';
  } else {
    title.textContent = 'Adicionar Produto';
    document.getElementById('product-form').reset();
    productIdInput.value = '';
    currentImageUrl = null;
  }

  modal.classList.remove('hidden');
}

// ============================================
// EDITAR PRODUTO
// ============================================
function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  currentProduct = product;
  openModal(true);
}

// ============================================
// FECHAR MODAL
// ============================================
function closeModal() {
  const modal = document.getElementById('product-modal');
  modal.classList.add('hidden');
  currentImageFile = null;
  currentImageUrl = null;
  currentProduct = null;
}

// ============================================
// APAGAR PRODUTO
// ============================================
async function deleteProduct(id) {
  if (!confirm('Tem certeza que deseja apagar este produto?')) return;

  try {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showToast('Produto apagado com sucesso!', 'success');
    loadProducts();

  } catch (error) {
    console.error('Erro ao apagar produto:', error);
    showToast('Erro ao apagar produto', 'error');
  }
}

// ============================================
// SALVAR PRODUTO
// ============================================
async function saveProduct(event) {
  event.preventDefault();

  const saveBtn = document.getElementById('save-btn');
  const productId = document.getElementById('product-id').value;

  const nome = document.getElementById('product-nome').value;
  const categoria = document.getElementById('product-categoria').value;
  const preco = parseFloat(document.getElementById('product-preco').value);
  const estoque = parseInt(document.getElementById('product-estoque').value);

  if (!nome || !categoria || isNaN(preco) || isNaN(estoque)) {
    showToast('Preencha todos os campos corretamente', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Salvando...';

  try {
    let productData = {
      nome,
      categoria,
      preco,
      estoque,
      imagem_url: currentImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect fill="%23f3f4f6" width="150" height="150"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESem Imagem%3C/text%3E%3C/svg%3E'
    };

    if (productId) {
      // Update existente
      const { error } = await supabase
        .from('produtos')
        .update(productData)
        .eq('id', productId);

      if (error) throw error;
      showToast('Produto atualizado com sucesso!', 'success');
    } else {
      // Create novo
      const { error } = await supabase
        .from('produtos')
        .insert([productData]);

      if (error) throw error;
      showToast('Produto criado com sucesso!', 'success');
    }

    closeModal();
    loadProducts();

  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    showToast('Erro ao salvar produto', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fa-solid fa-save mr-2"></i>Salvar';
  }
}

// ============================================
// SELECIONAR IMAGEM
// ============================================
function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Selecione um arquivo de imagem', 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast('A imagem deve ter no maximo 5MB', 'error');
    return;
  }

  currentImageFile = file;
  currentImageUrl = null; // Limpar URL existente se houver nova selecao

  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('image-preview-container');
    if (preview && previewContainer) {
      preview.src = e.target.result;
      previewContainer.classList.remove('hidden');
    }
  };
  reader.readAsDataURL(file);
}

// ============================================
// LIMPAR IMAGEM
// ============================================
function clearImage() {
  currentImageFile = null;
  currentImageUrl = null;
  const fileInput = document.getElementById('product-image');
  if (fileInput) fileInput.value = '';

  const preview = document.getElementById('image-preview');
  const previewContainer = document.getElementById('image-preview-container');
  if (preview) preview.src = '';
  if (previewContainer) previewContainer.classList.add('hidden');
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================
function setupEventListeners() {
  const filter = document.getElementById('category-filter');
  if (filter) filter.addEventListener('change', filterProducts);

  const addBtn = document.getElementById('add-product-btn');
  if (addBtn) addBtn.addEventListener('click', () => openModal(false));

  const form = document.getElementById('product-form');
  if (form) form.addEventListener('submit', saveProduct);

  const imageUpload = document.getElementById('image-upload');
  if (imageUpload) imageUpload.addEventListener('change', handleImageSelect);

  const closeBtn = document.getElementById('close-modal');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

// ============================================
// SHOW TOAST
// ============================================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  } z-50`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}