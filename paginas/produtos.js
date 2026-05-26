/**
 * produtos.js - Lógica da página de produtos Viva Óptica
 * Carrega produtos do Supabase, filtra e exibe em modal
 */

(function() {
    'use strict';

    // ========== CONFIGURAÇÃO ==========
    const WHATSAPP_NUMBER = '244954145065';
    const MAX_RETRIES = 10;
    const RETRY_DELAY = 500;

    // Mapeamento de categorias
    const CATEGORY_LABELS = {
        'Armacao': 'Armações',
        'Lente': 'Lentes',
        'Acessorio': 'Acessórios'
    };

    // Estado da aplicação
    let produtosData = [];
    let supabaseClient = null;

    // ========== INICIALIZAÇÃO ==========
    async function initProdutos() {
        console.log('🔄 [PRODUTOS] Inicializando...');
        
        // 1. Aguardar cliente Supabase
        supabaseClient = await waitForSupabase();
        if (!supabaseClient) {
            mostrarErro('Cliente Supabase não disponível. Verifique a conexão.');
            return;
        }

        // 2. Mostrar skeleton loaders
        mostrarLoadingSkeletons();

        // 3. Carregar produtos
        await carregarProdutos();

        // 4. Configurar event listeners
        configurarFiltros();
        configurarModal();
        configurarMenuMobile();

        console.log('✅ [PRODUTOS] Inicialização concluída');
    }

    // ========== AGUARDAR SUPABASE ==========
    async function waitForSupabase() {
        for (let i = 0; i < MAX_RETRIES; i++) {
            const supabase = window.supabase;
            if (supabase && typeof supabase.from === 'function') {
                console.log('✅ [SUPABASE] Cliente disponível');
                return supabase;
            }
            console.log(`⏳ [SUPABASE] Tentativa ${i + 1}/${MAX_RETRIES}...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
        console.error('❌ [SUPABASE] Cliente não inicializado');
        return null;
    }

    // ========== CARREGAR PRODUTOS ==========
    async function carregarProdutos() {
        try {
            console.log('📦 Carregando produtos...');
            
            const { data, error } = await supabaseClient
                .from('produtos')
                .select('*')
                .order('criado_em', { ascending: false });

            if (error) {
                console.error('❌ Erro ao buscar produtos:', error.message);
                mostrarErro('Erro ao carregar produtos: ' + error.message);
                return;
            }

            produtosData = data || [];
            console.log(`✅ ${produtosData.length} produtos carregados`);

            // Renderizar produtos por padrão (todos)
            renderizarProdutos(produtosData);
        } catch (err) {
            console.error('❌ Erro excepcional:', err);
            mostrarErro('Erro ao carregar produtos: ' + err.message);
        }
    }

    // ========== RENDERIZAR SKELETONS ==========
    function mostrarLoadingSkeletons() {
        const container = document.getElementById('products-container');
        if (!container) return;

        let html = '';
        for (let i = 0; i < 6; i++) {
            html += `
                <div class="skeleton bg-gray-200 rounded-lg overflow-hidden">
                    <div class="h-64 bg-gray-300"></div>
                    <div class="p-4">
                        <div class="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                        <div class="h-6 bg-gray-300 rounded w-1/2 mb-3"></div>
                        <div class="h-10 bg-gray-300 rounded"></div>
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    }

    // ========== RENDERIZAR PRODUTOS ==========
    function renderizarProdutos(produtos) {
        const container = document.getElementById('products-container');
        const emptyState = document.getElementById('empty-state');

        if (!container) return;

        // Verificar se há produtos
        if (!produtos || produtos.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Renderizar grid
        let html = '';
        produtos.forEach(produto => {
            html += criarCartaProduto(produto);
        });

        container.innerHTML = html;

        // Adicionar event listeners aos cards
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const produto = produtosData.find(p => p.id === id);
                if (produto) abrirModal(produto);
            });
        });
    }

    // ========== CRIAR CARTA DO PRODUTO ==========
    function criarCartaProduto(produto) {
        const imagem = produto.imagem_url && produto.imagem_url.trim() 
            ? produto.imagem_url 
            : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 font-family=%22Arial%22 font-size=%2216%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESem imagem%3C/text%3E%3C/svg%3E';

        const estoque = produto.estoque || 0;
        const temEstoque = estoque > 0;
        const categLabel = CATEGORY_LABELS[produto.categoria] || 'Viva Óptica';
        const precoFormatado = formatarPreco(produto.preco);

        return `
            <div class="product-card bg-white rounded-lg shadow-md overflow-hidden border border-gray-200" data-id="${produto.id}">
                <!-- Imagem -->
                <div class="relative overflow-hidden bg-gray-100 h-64">
                    <img 
                        src="${imagem}" 
                        alt="${produto.nome}" 
                        class="product-image"
                        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESem imagem%3C/text%3E%3C/svg%3E'"
                    >
                    <!-- Badge de Estoque -->
                    <div class="absolute top-3 right-3">
                        ${temEstoque 
                            ? '<span class="badge badge-success">Em Stock</span>' 
                            : '<span class="badge badge-danger">Esgotado</span>'
                        }
                    </div>
                </div>

                <!-- Conteúdo -->
                <div class="p-4">
                    <!-- Categoria -->
                    <p class="text-cyan text-xs font-semibold uppercase tracking-wide mb-2">${categLabel}</p>
                    
                    <!-- Título -->
                    <h3 class="text-lg font-bold text-navy mb-2 line-clamp-2 min-h-14">
                        ${produto.nome || 'Produto sem nome'}
                    </h3>

                    <!-- Preço -->
                    <p class="text-2xl font-bold text-cyan mb-4">
                        ${precoFormatado}
                    </p>

                    <!-- Botão -->
                    <button class="w-full bg-navy text-white py-3 rounded-lg font-semibold hover:bg-navy/90 transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-eye"></i>
                        Ver Detalhes
                    </button>
                </div>
            </div>
        `;
    }

    // ========== ABRIR MODAL ==========
    function abrirModal(produto) {
        const modal = document.getElementById('product-modal');
        const modalContent = document.getElementById('modal-content');

        if (!modal || !modalContent) return;

        const imagem = produto.imagem_url && produto.imagem_url.trim() 
            ? produto.imagem_url 
            : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESem imagem%3C/text%3E%3C/svg%3E';

        const categLabel = CATEGORY_LABELS[produto.categoria] || 'Viva Óptica';
        const precoFormatado = formatarPreco(produto.preco);
        const estoque = produto.estoque || 0;
        const temEstoque = estoque > 0;
        const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Tenho interesse no produto: ${encodeURIComponent(produto.nome)} (${precoFormatado})`;

        modalContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Imagem -->
                <div>
                    <img 
                        src="${imagem}" 
                        alt="${produto.nome}"
                        class="w-full rounded-lg shadow-md mb-4"
                        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESem imagem%3C/text%3E%3C/svg%3E'"
                    >
                </div>

                <!-- Detalhes -->
                <div>
                    <!-- Categoria -->
                    <p class="text-cyan text-xs font-semibold uppercase tracking-wide mb-3">${categLabel}</p>

                    <!-- Título -->
                    <h2 class="text-3xl font-bold text-navy mb-4">${produto.nome || 'Produto sem nome'}</h2>

                    <!-- Preço -->
                    <p class="text-4xl font-bold text-cyan mb-6">${precoFormatado}</p>

                    <!-- Status de Estoque -->
                    <div class="mb-6">
                        ${temEstoque 
                            ? `<p class="text-green-600 font-semibold text-lg"><i class="fas fa-check-circle mr-2"></i>Em estoque (${estoque} un.)</p>` 
                            : '<p class="text-red-600 font-semibold text-lg"><i class="fas fa-exclamation-circle mr-2"></i>Esgotado</p>'
                        }
                    </div>

                    <!-- Descrição -->
                    ${produto.descricao ? `<p class="text-gray-600 mb-6 leading-relaxed">${produto.descricao}</p>` : ''}

                    <!-- Botão WhatsApp -->
                    <a 
                        href="${urlWhatsApp}" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors w-full justify-center"
                    >
                        <i class="fab fa-whatsapp text-2xl"></i>
                        Comprar via WhatsApp
                    </a>

                    <!-- Informações Adicionais -->
                    <div class="mt-8 pt-6 border-t border-gray-200">
                        <p class="text-gray-500 text-sm">
                            <i class="fas fa-info-circle mr-2"></i>
                            Clique no botão acima para falar diretamente conosco no WhatsApp.
                        </p>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    // ========== FECHAR MODAL ==========
    function fecharModal() {
        const modal = document.getElementById('product-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }

    // ========== CONFIGURAR FILTROS ==========
    function configurarFiltros() {
        const filterBtns = document.querySelectorAll('.filter-btn');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const categoria = btn.dataset.category;

                // Atualizar classe active
                filterBtns.forEach(b => {
                    b.classList.remove('active', 'bg-cyan', 'text-white', 'shadow-lg');
                    b.classList.add('bg-white', 'text-navy', 'border-2', 'border-navy');
                });

                btn.classList.add('active', 'bg-cyan', 'text-white', 'shadow-lg');
                btn.classList.remove('bg-white', 'text-navy', 'border-2', 'border-navy');

                // Filtrar produtos
                filtrarPorCategoria(categoria);
            });
        });
    }

    // ========== FILTRAR POR CATEGORIA ==========
    function filtrarPorCategoria(categoria) {
        let filtered = produtosData;

        if (categoria && categoria !== 'todos') {
            filtered = produtosData.filter(p => {
                const cat = (p.categoria || '').trim().toLowerCase();
                return cat === categoria.toLowerCase().trim();
            });
        }

        console.log(`📂 Filtrando por: ${categoria} → ${filtered.length} produtos`);
        renderizarProdutos(filtered);
    }

    // ========== CONFIGURAR MODAL ==========
    function configurarModal() {
        const modal = document.getElementById('product-modal');
        const closeBtn = document.getElementById('modal-close');

        if (closeBtn) {
            closeBtn.addEventListener('click', fecharModal);
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) fecharModal();
            });
        }

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') fecharModal();
        });
    }

    // ========== CONFIGURAR MENU MOBILE ==========
    function configurarMenuMobile() {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');

        if (menuBtn && menu) {
            menuBtn.addEventListener('click', () => {
                menu.classList.toggle('hidden');
            });

            // Fechar menu ao clicar num link
            menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    menu.classList.add('hidden');
                });
            });
        }
    }

    // ========== FORMATAR PREÇO ==========
    function formatarPreco(preco) {
        const num = parseFloat(preco) || 0;
        return num.toLocaleString('pt-AO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' Kz';
    }

    // ========== MOSTRAR ERRO ==========
    function mostrarErro(mensagem) {
        const container = document.getElementById('products-container');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 bg-red-50 rounded-lg border-2 border-red-200">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4 block"></i>
                    <h3 class="text-xl font-bold text-red-700 mb-2">Erro ao Carregar Produtos</h3>
                    <p class="text-red-600">${mensagem}</p>
                </div>
            `;
        }
    }

    // ========== INICIAR QUANDO DOM ESTIVER PRONTO ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProdutos);
    } else {
        initProdutos();
    }

})();