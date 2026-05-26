// ============================================
// Slideshow Management - Viva Óptica Admin
// ============================================

let slides = [];
let currentImageFile = null;
let currentImageUrl = null;

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadSlides();
  setupForm();
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
// CARREGAR SLIDES
// ============================================
async function loadSlides() {
  const supabase = window.getSupabase();
  const loading = document.getElementById('loading');
  const container = document.getElementById('slides-container');
  const emptyState = document.getElementById('empty-state');

  loading.classList.remove('hidden');
  container.innerHTML = '';

  try {
    const { data, error } = await supabase
      .from('slideshow')
      .select('*')
      .order('ordem', { ascending: true });

    if (error) throw error;

    slides = data || [];

    loading.classList.add('hidden');

    if (slides.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    renderSlides();

  } catch (error) {
    console.error('Erro ao carregar slides:', error);
    loading.classList.add('hidden');
    showToast('Erro ao carregar slides', 'error');
  }
}

// ============================================
// RENDERIZAR SLIDES COM DRAG-AND-DROP
// ============================================
function renderSlides() {
  const container = document.getElementById('slides-container');
  container.innerHTML = '';

  slides.forEach((slide, index) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-md p-6 flex items-center gap-6 hover:shadow-lg transition-shadow cursor-move';
    card.setAttribute('draggable', 'true');
    card.dataset.id = slide.id;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="relative flex-shrink-0">
        <img src="${slide.imagem_url}" alt="${slide.titulo}"
          class="w-48 h-32 object-cover rounded-lg shadow-md">
        <div class="absolute top-2 left-2 bg-navy text-white text-xs px-2 py-1 rounded">
          #${index + 1}
        </div>
        ${!slide.ativo ? '<div class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Inativo</div>' : ''}
      </div>

      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <i class="fa-solid fa-grip-vertical text-gray-300"></i>
          <h3 class="text-lg font-bold text-navy">${slide.titulo}</h3>
        </div>
        ${slide.subtitulo ? `<p class="text-gray-600 text-sm mb-2">${slide.subtitulo}</p>` : ''}
        ${slide.link ? `<p class="text-xs text-cyan"><i class="fa-solid fa-link mr-1"></i>${slide.link}</p>` : ''}
      </div>

      <div class="flex items-center gap-3">
        <button onclick="editSlide('${slide.id}')"
          class="p-2 text-cyan hover:bg-cyan/10 rounded-lg transition-colors" title="Editar">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button onclick="deleteSlide('${slide.id}')"
          class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Apagar">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  setupDragAndDrop();
}

// ============================================
// ABRIR MODAL
// ============================================
function openModal(editMode = false) {
  const modal = document.getElementById('slide-modal');
  const modalTitle = document.getElementById('modal-title');

  if (!editMode) {
    // Reset form
    document.getElementById('slide-form').reset();
    document.getElementById('slide-id').value = '';
    document.getElementById('modal-title').textContent = 'Adicionar Slide';
    clearImage();
  }

  modal.classList.remove('hidden');
}

// ============================================
// FECHAR MODAL
// ============================================
function closeModal() {
  const modal = document.getElementById('slide-modal');
  modal.classList.add('hidden');
  clearImage();
}

// ============================================
// EDITAR SLIDE
// ============================================
async function editSlide(id) {
  const supabase = window.getSupabase();
  const slide = slides.find(s => s.id === id);

  if (!slide) return;

  openModal(true);
  document.getElementById('modal-title').textContent = 'Editar Slide';
  document.getElementById('slide-id').value = slide.id;
  document.getElementById('slide-titulo').value = slide.titulo;
  document.getElementById('slide-subtitulo').value = slide.subtitulo || '';
  document.getElementById('slide-link').value = slide.link || '';
  document.getElementById('slide-ordem').value = slide.ordem || 0;
  document.getElementById('slide-ativo').checked = slide.ativo !== false;

  // Mostrar imagem atual
  currentImageUrl = slide.imagem_url;
  showImagePreview(slide.imagem_url);
}

// ============================================
// SALVAR SLIDE
// ============================================
async function saveSlide(event) {
  event.preventDefault();

  const supabase = window.getSupabase();
  const saveBtn = document.getElementById('save-btn');
  const slideId = document.getElementById('slide-id').value;

  // Validar imagem
  if (!currentImageFile && !currentImageUrl) {
    showToast('Por favor, selecione uma imagem', 'error');
    return;
  }

  // Loading state
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i><span>Salvando...</span>';

  try {
    let imageUrl = currentImageUrl;

    // Upload nova imagem se selecionada
    if (currentImageFile) {
      imageUrl = await UploadManager.uploadImage('banners', currentImageFile);

      // Apagar imagem antiga se existir e for diferente
      if (currentImageUrl && currentImageUrl !== imageUrl) {
        await UploadManager.deleteImage('banners', currentImageUrl);
      }
    }

    const slideData = {
      titulo: document.getElementById('slide-titulo').value,
      subtitulo: document.getElementById('slide-subtitulo').value,
      imagem_url: imageUrl,
      link: document.getElementById('slide-link').value,
      ordem: parseInt(document.getElementById('slide-ordem').value),
      ativo: document.getElementById('slide-ativo').checked
    };

    if (slideId) {
      // Update
      const { error } = await supabase
        .from('slideshow')
        .update(slideData)
        .eq('id', slideId);

      if (error) throw error;
      showToast('Slide atualizado com sucesso!', 'success');
    } else {
      // Create
      const { error } = await supabase
        .from('slideshow')
        .insert([slideData]);

      if (error) throw error;
      showToast('Slide criado com sucesso!', 'success');
    }

    closeModal();
    loadSlides();

  } catch (error) {
    console.error('Erro ao salvar slide:', error);
    showToast('Erro ao salvar slide: ' + error.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fa-solid fa-save mr-2"></i><span>Salvar</span>';
  }
}

// ============================================
// APAGAR SLIDE
// ============================================
async function deleteSlide(id) {
  if (!confirm('Tem certeza que deseja apagar este slide? A imagem também será removida.')) {
    return;
  }

  const supabase = window.getSupabase();
  const slide = slides.find(s => s.id === id);

  if (!slide) return;

  try {
    // Apagar imagem do Storage
    if (slide.imagem_url) {
      await UploadManager.deleteImage('banners', slide.imagem_url);
    }

    // Apagar da base de dados
    const { error } = await supabase
      .from('slideshow')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showToast('Slide apagado com sucesso!', 'success');
    loadSlides();

  } catch (error) {
    console.error('Erro ao apagar slide:', error);
    showToast('Erro ao apagar slide', 'error');
  }
}

// ============================================
// MANIPULAÇÃO DE IMAGENS
// ============================================
function handleImageSelect(event) {
  const file = event.target.files[0];

  const validation = UploadManager.validateFile(file);
  if (!validation.valid) {
    showToast(validation.error, 'error');
    return;
  }

  currentImageFile = file;
  currentImageUrl = null; // Reset URL anterior

  // Criar preview
  UploadManager.previewImage(file)
    .then(url => showImagePreview(url))
    .catch(error => {
      console.error('Erro no preview:', error);
      showToast('Erro ao carregar preview', 'error');
    });
}

function showImagePreview(url) {
  const preview = document.getElementById('image-preview');
  const container = document.getElementById('image-preview-container');

  preview.src = url;
  container.classList.remove('hidden');
}

function clearImage() {
  currentImageFile = null;
  currentImageUrl = null;
  document.getElementById('slide-image').value = '';
  document.getElementById('image-preview-container').classList.add('hidden');
  document.getElementById('image-preview').src = '';
}

// ============================================
// SETUP FORM
// ============================================
function setupForm() {
  document.getElementById('slide-form').addEventListener('submit', saveSlide);
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

// ============================================
// DRAG-AND-DROP REORDERING
// ============================================
let dragStartIndex;

function setupDragAndDrop() {
  const cards = document.querySelectorAll('#slides-container > div');

  cards.forEach(card => {
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragover', dragOver);
    card.addEventListener('drop', dragDrop);
    card.addEventListener('dragenter', dragEnter);
    card.addEventListener('dragleave', dragLeave);
    card.addEventListener('dragend', dragEnd);
  });
}

function dragStart(e) {
  dragStartIndex = +this.dataset.index;
  this.style.opacity = '0.4';
  this.classList.add('dragging');
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
  this.classList.add('over');
}

function dragLeave() {
  this.classList.remove('over');
}

function dragDrop(e) {
  const dragEndIndex = +this.dataset.index;
  swapItems(dragStartIndex, dragEndIndex);
  this.style.opacity = '1';
}

function dragEnd() {
  this.style.opacity = '1';
  this.classList.remove('dragging');
  this.classList.remove('over');

  // Update ordem na database
  updateSlidesOrder();
}

function swapItems(fromIndex, toIndex) {
  const itemOne = slides[fromIndex];
  const itemTwo = slides[toIndex];

  slides[fromIndex] = itemTwo;
  slides[toIndex] = itemOne;

  renderSlides();
}

async function updateSlidesOrder() {
  const supabase = window.getSupabase();

  try {
    const updates = slides.map((slide, index) => ({
      id: slide.id,
      ordem: index
    }));

    for (const update of updates) {
      await supabase
        .from('slideshow')
        .update({ ordem: update.ordem })
        .eq('id', update.id);
    }

    console.log('Ordem dos slides atualizada');
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error);
    showToast('Erro ao salvar nova ordem', 'error');
  }
}
