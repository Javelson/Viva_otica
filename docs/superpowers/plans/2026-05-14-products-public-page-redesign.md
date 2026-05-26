# Products Public Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a unified products page with category filters, detail modal, skeleton loading, and dynamic homepage featured products.

**Architecture:** Refactor existing `produtos.js` to query Supabase for active products, implement client-side filtering by category, add modal for product details with WhatsApp integration, and update homepage to load featured products dynamically.

**Tech Stack:** Vanilla HTML/JS, Tailwind CSS CDN, Supabase JS SDK v2, Font Awesome 6, AOS animations

**Spec:** `docs/superpowers/specs/2026-05-14-products-public-page-design.md`

---

## File Structure

| File | Change | Purpose |
|---|---|---|
| `paginas/produtos.html` | Modify hero/filters section | Update UI structure for new filters and product grid |
| `paginas/produtos.js` | Complete rewrite | New query, filter, card, modal, skeleton logic |
| `paginas/armacoes.html` | Replace with redirect | Redirect to `produtos.html?cat=armacao` |
| `index.html` | Replace featured section JS | Load 4 random products from Supabase |
| `script.js` | Add featured products query | Reuse card/modal rendering from produtos.js |
| All nav files | Update "Armações" link | Point to `produtos.html?cat=armacao` |

**Nav files to update:**
- `index.html`
- `paginas/armacoes.html` (will become redirect)
- `paginas/servicos.html`
- `paginas/sobre.html`
- `paginas/contacto.html`
- `agendamento.html`

---

### Task 1: Update `produtos.html` UI structure

**Files:**
- Modify: `paginas/produtos.html`

- [ ] **Step 1: Read current produtos.html**

Run:
```bash
cat "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica\paginas\produtos.html"
```

- [ ] **Step 2: Replace the main content area**

Keep the header/nav/footer. Replace everything between `<main>` tags with:

```html
<main>
  <!-- Hero Section -->
  <section class="page-hero bg-navy text-white py-16">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">Nossos Produtos</h1>
      <p class="text-lg text-gray-300">Descobra a nossa coleção de óculos, lentes e acessórios</p>
    </div>
  </section>

  <!-- Filter Section -->
  <section class="py-8 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="flex flex-wrap gap-3 justify-center" id="category-filters">
        <button class="filter-btn active bg-cyan text-white px-6 py-2 rounded-full font-semibold" data-category="todos">
          Todos
        </button>
        <button class="filter-btn bg-white text-navy border border-navy px-6 py-2 rounded-full font-semibold hover:bg-cyan/10" data-category="armacao">
          Armações
        </button>
        <button class="filter-btn bg-white text-navy border border-navy px-6 py-2 rounded-full font-semibold hover:bg-cyan/10" data-category="lente">
          Lentes
        </button>
        <button class="filter-btn bg-white text-navy border border-navy px-6 py-2 rounded-full font-semibold hover:bg-cyan/10" data-category="acessorio">
          Acessórios
        </button>
      </div>
    </div>
  </section>

  <!-- Products Grid -->
  <section class="py-12">
    <div class="container mx-auto px-4">
      <div id="products-container">
        <!-- Skeleton loading will be injected here -->
      </div>
      
      <!-- Empty State (hidden by default) -->
      <div id="empty-state" class="text-center py-20 hidden">
        <i class="fas fa-search text-6xl text-gray-400 mb-4"></i>
        <p class="text-gray-600 text-lg">Nenhum produto encontrado nesta categoria.</p>
      </div>
    </div>
  </section>
</main>

<!-- Product Modal -->
<div id="product-modal" class="fixed inset-0 bg-black/70 hidden items-center justify-center z-50">
  <div class="bg-white rounded-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
    <div class="p-6">
      <button id="modal-close" class="absolute top-4 right-4 text-gray-500 hover:text-navy text-2xl">
        <i class="fas fa-times"></i>
      </button>
      <div id="modal-content" class="flex flex-col md:flex-row gap-6">
        <!-- Content will be injected by JS -->
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify the change**

Run:
```bash
grep -n "category-filters\|products-container\|product-modal" "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica\paginas\produtos.html"
```

Expected: 3 matches showing the new IDs are present.

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica"
git add paginas/produtos.html
git commit -m "feat: update produtos.html with new filter UI and modal structure"
```

---

### Task 2: Rewrite `produtos.js` with new logic

**Files:**
- Create: `paginas/produtos.js` (complete replacement)

- [ ] **Step 1: Read current productos.js for reference**

Run:
```bash
cat "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica\paginas\produtos.js"
```

- [ ] **Step 2: Write complete new implementation**

Replace entire file with:

```javascript
// productos.js - Products page logic for Viva Ótica
// Loads products from Supabase, renders with filters and modal

(function() {
  'use strict';

  const CATEGORY_LABELS = {
    armacao: 'Armação',
    lente: 'Lente',
    acessorio: 'Acessório'
  };

  const WHATSAPP_NUMBER = '244954145065';

  let produtosData = [];

  // Generate description from category and name
  function generateDescricao(produto) {
    const categoriaLabel = CATEGORY_LABELS[produto.categoria?.toLowerCase()] || 'Viva Ótica';
    return `${categoriaLabel} — ${produto.nome}`;
  }

  // Format price as "15.000 Kz"
  function formatPreco(preco) {
    return `${Number(preco).toLocaleString('pt-AO')} Kz`;
  }

  // Get placeholder SVG for missing images
  function getPlaceholderSvg() {
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <rect fill="#f0f0f0" width="400" height="300"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="16" fill="#9ca3af">Sem imagem</text>
    </svg>`;
  }

  // Generate WhatsApp URL with pre-filled message
  function getWhatsappUrl(produto) {
    const mensagem = `Olá! Gostaria de saber mais sobre o produto: ${produto.nome} — ${formatPreco(produto.preco)}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
  }

  // Render product card HTML
  function renderCard(produto) {
    const imagemHTML = produto.imagem_url
      ? `<img src="${produto.imagem_url}" alt="${produto.nome}" class="w-full h-48 object-cover rounded-t-lg" loading="lazy">`
      : `<div class="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">${getPlaceholderSvg()}</div>`;

    return `
      <div class="product-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105" data-id="${produto.id}" data-categoria="${produto.categoria?.toLowerCase()}">
        ${imagemHTML}
        <div class="p-4">
          <h3 class="font-semibold text-navy text-lg mb-2 line-clamp-2">${produto.nome}</h3>
          <p class="text-cyan font-semibold text-xl mb-3">${formatPreco(produto.preco)}</p>
          <button class="btn-outline w-full py-2 px-4 border-2 border-navy text-navy rounded-lg font-semibold hover:bg-navy hover:text-white transition-colors open-modal-btn" data-id="${produto.id}">
            Ver Detalhes
          </button>
        </div>
      </div>
    `;
  }

  // Render skeleton loading cards
  function renderSkeletons() {
    return Array(6).fill(`
      <div class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div class="h-48 bg-gray-300"></div>
        <div class="p-4">
          <div class="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
          <div class="h-8 bg-gray-300 rounded w-1/2 mb-3"></div>
          <div class="h-10 bg-gray-300 rounded"></div>
        </div>
      </div>
    `).join('');
  }

  // Render product grid
  function renderGrid(produtos, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }

    if (produtos.length === 0) {
      container.innerHTML = '';
      document.getElementById('empty-state')?.classList.remove('hidden');
      return;
    }

    document.getElementById('empty-state')?.classList.add('hidden');
    container.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${produtos.map(renderCard).join('')}</div>`;

    // Add click listeners to modal buttons
    container.querySelectorAll('.open-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const produto = produtosData.find(p => p.id === btn.dataset.id);
        if (produto) openModal(produto);
      });
    });
  }

  // Open product detail modal
  function openModal(produto) {
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;

    const imagemHTML = produto.imagem_url
      ? `<img src="${produto.imagem_url}" alt="${produto.nome}" class="w-full md:w-1/2 object-cover rounded-lg">`
      : `<div class="w-full md:w-1/2 h-64 bg-gray-200 rounded-lg flex items-center justify-center">${getPlaceholderSvg()}</div>`;

    modalContent.innerHTML = `
      ${imagemHTML}
      <div class="md:w-1/2">
        <h2 class="text-2xl font-bold text-navy mb-2">${produto.nome}</h2>
        <p class="text-cyan font-semibold text-2xl mb-4">${formatPreco(produto.preco)}</p>
        <p class="text-gray-600 mb-6">${generateDescricao(produto)}</p>
        <a href="${getWhatsappUrl(produto)}" target="_blank" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors">
          <i class="fab fa-whatsapp text-xl"></i>
          Comprar via WhatsApp
        </a>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  function closeModal() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  // Filter by category
  function filterByCategory(category) {
    let filtered = produtosData;
    if (category !== 'todos') {
      filtered = produtosData.filter(p => p.categoria?.toLowerCase() === category);
    }
    renderGrid(filtered, 'products-container');
  }

  // Fetch products from Supabase
  async function fetchProdutos() {
    const supabase = await window.getSupabase();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return [];
    }

    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .gt('estoque', 0);

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  }

  // Initialize page
  async function initProdutos() {
    console.log('[PRODUTOS] Initializing products page...');

    const container = document.getElementById('products-container');
    if (container) {
      container.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${renderSkeletons()}</div>`;
    }

    produtosData = await fetchProdutos();
    console.log('[PRODUTOS] Loaded', produtosData.length, 'products');

    // Check URL for category filter
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('cat') || 'todos';

    // Set initial filter
    filterByCategory(initialCategory);
    document.querySelectorAll('.filter-btn').forEach(btn => {
      if (btn.dataset.category === initialCategory) {
        btn.classList.add('active', 'bg-cyan', 'text-white');
        btn.classList.remove('bg-white', 'text-navy', 'border');
      } else {
        btn.classList.remove('active', 'bg-cyan', 'text-white');
        btn.classList.add('bg-white', 'text-navy', 'border');
      }
    });

    // Render initial grid
    renderGrid(produtosData, 'products-container');

    // Set up filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;

        document.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.remove('active', 'bg-cyan', 'text-white');
          b.classList.add('bg-white', 'text-navy', 'border');
        });
        btn.classList.add('active', 'bg-cyan', 'text-white');
        btn.classList.remove('bg-white', 'text-navy', 'border');

        filterByCategory(category);
      });
    });

    // Set up modal close
    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.getElementById('product-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'product-modal') closeModal();
    });

    console.log('[PRODUTOS] Page initialized successfully');
  }

  // Expose functions globally
  window.renderCard = renderCard;
  window.renderGrid = renderGrid;
  window.renderSkeletons = renderSkeletons;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.filterByCategory = filterByCategory;
  window.generateDescricao = generateDescricao;
  window.formatPreco = formatPreco;
  window.getPlaceholderSvg = getPlaceholderSvg;
  window.getWhatsappUrl = getWhatsappUrl;

  // Initialize on DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProdutos);
  } else {
    initProdutos();
  }
})();
```

- [ ] **Step 3: Test in browser**

Open `paginas/produtos.html` in browser. Verify:
- Products load from Supabase
- Filter buttons work
- Modal opens on card click
- WhatsApp button works

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica"
git add paginas/produtos.js
git commit -m "feat: rewrite produtos.js with Supabase query, filters, and modal"
```

---

### Task 3: Create redirect for `armacoes.html`

**Files:**
- Modify: `paginas/armacoes.html`

- [ ] **Step 1: Replace content with redirect**

Replace entire file content with:

```html
<!DOCTYPE html>
<html lang="pt-AO">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecionando...</title>
  <meta http-equiv="refresh" content="0;url=./produtos.html?cat=armacao">
  <script>
    window.location.href = './produtos.html?cat=armacao';
  </script>
</head>
<body>
  <p>Redirecionando para a página de produtos...</p>
</body>
</html>
```

- [ ] **Step 2: Verify redirect**

Open `paginas/armacoes.html` in browser. Should instantly redirect to `produtos.html?cat=armacao`.

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica"
git add paginas/armacoes.html
git commit -m "feat: redirect armacoes.html to produtos.html with category filter"
```

---

### Task 4: Update navigation links

**Files:**
- Modify: `index.html` (nav)
- Modify: `paginas/servicos.html` (nav)
- Modify: `paginas/sobre.html` (nav)
- Modify: `paginas/contacto.html` (nav)
- Modify: `agendamento.html` (nav)

- [ ] **Step 1: Update "Armações" link in each file**

In each file, find the "Armações" link and change `href` from current value to:

```html
<a href="paginas/produtos.html?cat=armacao" class="...">Armações</a>
```

- [ ] **Step 2: Verify all nav links updated**

Run:
```bash
grep -rn "Armações" --include="*.html" "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica" | grep "href"
```

Expected: All "Armações" links point to `produtos.html?cat=armacao`.

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica"
git add index.html paginas/servicos.html paginas/sobre.html paginas/contacto.html agendamento.html
git commit -m "feat: update navigation links to point to unified products page"
```

---

### Task 5: Add featured products to homepage

**Files:**
- Modify: `index.html` (featured products section)
- Modify: `script.js` (add featured products query)

- [ ] **Step 1: Modify `index.html` featured section**

Find the "Produtos em Destaque" section and replace static cards with:

```html
<section id="featured-products" class="py-16 bg-gray-50">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl font-bold text-center text-navy mb-8">Produtos em Destaque</h2>
    <div id="featured-products-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Loading skeletons -->
      <div class="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      <div class="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      <div class="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      <div class="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
    </div>
    <div class="text-center mt-8">
      <a href="paginas/produtos.html" class="inline-block bg-cyan text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan/80 transition-colors">
        Ver Todos os Produtos →
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add featured products query to `script.js`**

Add at the top of `script.js` (after other imports):

```javascript
// Load featured products for homepage
async function loadFeaturedProducts() {
  const supabase = await window.getSupabase();
  if (!supabase) return;

  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('ativo', true)
    .gt('estoque', 0)
    .order('random')
    .limit(4);

  if (error) {
    console.error('Error loading featured products:', error);
    return;
  }

  const container = document.getElementById('featured-products-grid');
  if (!container || !data?.length) return;

  const renderCard = window.renderCard;
  const openModal = window.openModal;

  container.innerHTML = data.map(renderCard).join('');

  // Add modal listeners
  container.querySelectorAll('.open-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const produto = data.find(p => p.id === btn.dataset.id);
      if (produto) openModal(produto);
    });
  });
}

// Call on page load
if (document.getElementById('featured-products-grid')) {
  loadFeaturedProducts();
}
```

- [ ] **Step 3: Test homepage**

Open `index.html` in browser. Verify 4 random products load and modal works.

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica"
git add index.html script.js
git commit -m "feat: add dynamic featured products section to homepage"
```

---

## Verification

After all tasks complete:

1. Open `paginas/produtos.html` — verify products load, filters work, modal opens
2. Open `paginas/armacoes.html` — verify redirect to `produtos.html?cat=armacao`
3. Open `index.html` — verify 4 featured products load
4. Click "Armações" in nav — verify redirect works
5. Check browser console — no errors

---

## Self-Review

- **Spec coverage:** All 14 sections of spec covered across 5 tasks.
- **Placeholder scan:** No TBD/TODO. All code blocks contain actual implementation.
- **Type consistency:** Function names match between `produtos.js` exports and `script.js` imports.
- **No gaps found.**