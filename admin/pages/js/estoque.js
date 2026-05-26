// Estoque Inteligente - JavaScript Implementation
// Viva Óptica Admin Panel - Module 3

// Global state
let currentTab = 'produtos';
let allProducts = [];
let allAlerts = [];
let allMovimentacoes = [];
let allFornecedores = [];

// Toast notification system
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    const bgColor = type === 'success' ? 'bg-green-600' :
                   type === 'error' ? 'bg-red-600' :
                   type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600';

    const icon = type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-times-circle' :
                type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle';

    toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-3 flex items-center animate-slide-in`;
    toast.innerHTML = `
        <i class="fa-solid ${icon} mr-3"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Tab switching
function switchTab(tab) {
    currentTab = tab;

    // Update tab buttons
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        btn.classList.remove('border-cyan', 'text-cyan');
        btn.classList.add('border-transparent', 'text-gray-500');
    });

    const activeBtn = document.getElementById(`tab-${tab}`);
    if (activeBtn) {
        activeBtn.classList.remove('border-transparent', 'text-gray-500');
        activeBtn.classList.add('border-cyan', 'text-cyan');
    }

    // Hide all content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Show selected content
    const selectedContent = document.getElementById(`content-${tab}`);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }

    // Load data for the tab
    loadTabData(tab);
}

async function loadTabData(tab) {
    switch(tab) {
        case 'produtos':
            await loadEstoque();
            break;
        case 'alertas':
            await loadAlertas();
            break;
        case 'movimentacoes':
            await loadMovimentacoes();
            break;
        case 'fornecedores':
            await loadFornecedores();
            break;
        case 'relatorios':
            await loadRelatorios();
            break;
    }
}

// Modal management
function openModal(type, id = null) {
    const modal = document.getElementById(`${type}-modal`);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        if (type === 'produto' && id) {
            loadProdutoForEdit(id);
        } else if (type === 'produto') {
            resetProdutoForm();
        }
    }
}

function closeModal(type) {
    const modal = document.getElementById(`${type}-modal`);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';

        if (type === 'produto') {
            resetProdutoForm();
        }
    }
}

function resetProdutoForm() {
    const form = document.getElementById('produto-form');
    if (form) {
        form.reset();
        document.getElementById('produto-id').value = '';
        document.getElementById('margem_lucro').value = '';
    }
}

// Load estoque products
async function loadEstoque() {
    const loading = document.getElementById('loading');
    const productsGrid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');

    if (loading) loading.classList.remove('hidden');
    if (productsGrid) productsGrid.innerHTML = '';
    if (emptyState) emptyState.classList.add('hidden');

    try {
        const { data, error } = await window.supabase
            .from('view_estoque_completo')
            .select('*')
            .eq('ativo', true)
            .order('nome_produto', { ascending: true });

        if (error) throw error;

        allProducts = data || [];

        // Update statistics
        updateStats(allProducts);

        // Apply filters
        const filteredProducts = applyFilters(allProducts);

        if (filteredProducts.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
        } else {
            if (productsGrid) {
                productsGrid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
            }
        }

        // Load brands for filter
        loadBrandFilter(allProducts);

    } catch (error) {
        console.error('Error loading estoque:', error);
        showToast('Erro ao carregar estoque: ' + error.message, 'error');
    } finally {
        if (loading) loading.classList.add('hidden');
    }
}

function createProductCard(product) {
    const statusConfig = {
        critico: { color: 'red', label: 'Esgotado', icon: 'fa-times-circle' },
        baixo: { color: 'orange', label: 'Estoque Baixo', icon: 'fa-exclamation-triangle' },
        ok: { color: 'green', label: 'Estoque OK', icon: 'fa-check-circle' }
    };

    const status = product.quantidade_atual <= 0 ? 'critico' :
                   product.quantidade_atual <= product.estoque_minimo ? 'baixo' : 'ok';

    const config = statusConfig[status];

    return `
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-${config.color}-500 hover:shadow-md transition-shadow">
            <div class="p-4">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="font-bold text-navy text-lg">${product.nome_produto}</h3>
                        <p class="text-sm text-gray-500">SKU: ${product.sku}</p>
                    </div>
                    <span class="bg-${config.color}-100 text-${config.color}-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <i class="fa-solid ${config.icon} mr-1"></i>
                        ${config.label}
                    </span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                        <span class="text-gray-500">Categoria:</span>
                        <span class="font-medium ml-1">${product.categoria}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Marca:</span>
                        <span class="font-medium ml-1">${product.marca || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Modelo:</span>
                        <span class="font-medium ml-1">${product.modelo || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Estoque:</span>
                        <span class="font-bold ${status === 'critico' ? 'text-red-600' : status === 'baixo' ? 'text-orange-600' : 'text-green-600'} ml-1">
                            ${product.quantidade_atual}
                        </span>
                    </div>
                </div>

                <div class="border-t pt-3 mt-3">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-gray-500">Preço de Venda:</span>
                        <span class="font-bold text-navy">Kz ${formatCurrency(product.preco_venda)}</span>
                    </div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-gray-500">Custo:</span>
                        <span class="font-medium text-gray-600">Kz ${formatCurrency(product.custo_unitario)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Margem:</span>
                        <span class="font-medium text-green-600">${calculateMargin(product.custo_unitario, product.preco_venda)}%</span>
                    </div>
                </div>

                <div class="flex gap-2 mt-4">
                    <button onclick="openMovimentacaoModal('${product.id}', '${product.nome_produto}')"
                            class="flex-1 bg-cyan hover:bg-cyanLight text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                        <i class="fa-solid fa-arrows-rotate mr-1"></i>
                        Movimentar
                    </button>
                    <button onclick="openModal('produto', '${product.id}')"
                            class="flex-1 bg-navy hover:bg-navyLight text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                        <i class="fa-solid fa-edit mr-1"></i>
                        Editar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function updateStats(products) {
    const total = products.length;
    const critico = products.filter(p => p.quantidade_atual <= 0).length;
    const baixo = products.filter(p => p.quantidade_atual > 0 && p.quantidade_atual <= p.estoque_minimo).length;
    const normal = products.filter(p => p.quantidade_atual > p.estoque_minimo).length;
    const valor = products.reduce((sum, p) => sum + (p.custo_unitario * p.quantidade_atual), 0);

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-critico').textContent = critico;
    document.getElementById('stat-baixo').textContent = baixo;
    document.getElementById('stat-normal').textContent = normal;
    document.getElementById('stat-valor').textContent = formatCurrency(valor / 1000) + 'K';
}

function loadBrandFilter(products) {
    const brands = [...new Set(products.map(p => p.marca).filter(Boolean))].sort();
    const brandSelect = document.getElementById('filter-brand');

    if (brandSelect) {
        brandSelect.innerHTML = '<option value="">Todas</option>' +
            brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
    }
}

function applyFilters(products) {
    const search = document.getElementById('search').value.toLowerCase();
    const category = document.getElementById('filter-category').value;
    const brand = document.getElementById('filter-brand').value;
    const status = document.getElementById('filter-status').value;

    return products.filter(product => {
        const matchesSearch = !search ||
            product.nome_produto.toLowerCase().includes(search) ||
            product.sku.toLowerCase().includes(search) ||
            (product.marca && product.marca.toLowerCase().includes(search));

        const matchesCategory = !category || product.categoria === category;
        const matchesBrand = !brand || product.marca === brand;

        let matchesStatus = true;
        if (status) {
            const productStatus = product.quantidade_atual <= 0 ? 'critico' :
                                 product.quantidade_atual <= product.estoque_minimo ? 'baixo' : 'ok';
            matchesStatus = productStatus === status;
        }

        return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
    });
}

function filterByAlert(type) {
    switchTab('produtos');

    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) {
        statusSelect.value = type;
        loadEstoque();
    }
}

// Load alerts
async function loadAlertas() {
    const alertsList = document.getElementById('alerts-list');

    try {
        const { data, error } = await window.supabase
            .from('view_alertas_pendentes')
            .select('*')
            .order('prioridade', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;

        allAlerts = data || [];

        if (allAlerts.length === 0) {
            if (alertsList) {
                alertsList.innerHTML = `
                    <div class="bg-white rounded-xl shadow-sm p-12 text-center">
                        <i class="fa-solid fa-check-circle text-6xl text-green-500 mb-4"></i>
                        <p class="text-gray-500 text-lg">Nenhum alerta pendente.</p>
                    </div>
                `;
            }
        } else {
            if (alertsList) {
                alertsList.innerHTML = allAlerts.map(alert => createAlertCard(alert)).join('');
            }
        }

        // Update badge
        const badge = document.getElementById('alert-badge');
        if (badge) {
            badge.textContent = allAlerts.length;
            badge.classList.toggle('hidden', allAlerts.length === 0);
        }

    } catch (error) {
        console.error('Error loading alerts:', error);
        showToast('Erro ao carregar alertas: ' + error.message, 'error');
    }
}

function createAlertCard(alert) {
    const priorityConfig = {
        critical: { color: 'red', label: 'Crítico', icon: 'fa-exclamation-circle' },
        high: { color: 'orange', label: 'Alta', icon: 'fa-exclamation-triangle' },
        medium: { color: 'yellow', label: 'Média', icon: 'fa-info-circle' },
        low: { color: 'blue', label: 'Baixa', icon: 'fa-info' }
    };

    const config = priorityConfig[alert.prioridade] || priorityConfig.medium;

    return `
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-${config.color}-500 p-4">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="bg-${config.color}-100 text-${config.color}-700 px-3 py-1 rounded-full text-xs font-medium">
                            <i class="fa-solid ${config.icon} mr-1"></i>
                            ${config.label}
                        </span>
                        <span class="text-xs text-gray-500">${formatDate(alert.created_at)}</span>
                    </div>
                    <h4 class="font-bold text-navy mb-1">${alert.nome_produto}</h4>
                    <p class="text-sm text-gray-600">${alert.mensagem}</p>
                </div>
                <div class="text-right ml-4">
                    <div class="text-2xl font-bold ${alert.quantidade_atual <= 0 ? 'text-red-600' : 'text-orange-600'}">
                        ${alert.quantidade_atual}
                    </div>
                    <div class="text-xs text-gray-500">em estoque</div>
                </div>
            </div>
            <div class="mt-3 flex gap-2">
                <button onclick="openMovimentacaoModal('${alert.estoque_id}', '${alert.nome_produto}')"
                        class="bg-cyan hover:bg-cyanLight text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <i class="fa-solid fa-plus mr-1"></i>
                    Registrar Entrada
                </button>
                <button onclick="resolveAlert('${alert.id}')"
                        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <i class="fa-solid fa-check mr-1"></i>
                    Resolver
                </button>
            </div>
        </div>
    `;
}

async function resolveAlert(alertId) {
    try {
        const { error } = await window.supabase
            .from('estoque_alertas')
            .update({ resolvido: true, resolvido_em: new Date().toISOString() })
            .eq('id', alertId);

        if (error) throw error;

        showToast('Alerta resolvido com sucesso!', 'success');
        await loadAlertas();
        await loadEstoque();

    } catch (error) {
        console.error('Error resolving alert:', error);
        showToast('Erro ao resolver alerta: ' + error.message, 'error');
    }
}

// Load movimentações
async function loadMovimentacoes() {
    const movimentacoesList = document.getElementById('movimentacoes-list');

    try {
        const { data, error } = await window.supabase
            .from('view_estoque_movimentacao_completa')
            .select('*')
            .order('data_hora', { ascending: false })
            .limit(50);

        if (error) throw error;

        allMovimentacoes = data || [];

        if (allMovimentacoes.length === 0) {
            if (movimentacoesList) {
                movimentacoesList.innerHTML = `
                    <div class="bg-white rounded-xl shadow-sm p-12 text-center">
                        <i class="fa-solid fa-history text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500 text-lg">Nenhuma movimentação registrada.</p>
                    </div>
                `;
            }
        } else {
            if (movimentacoesList) {
                movimentacoesList.innerHTML = allMovimentacoes.map(mov => createMovimentacaoCard(mov)).join('');
            }
        }

    } catch (error) {
        console.error('Error loading movimentações:', error);
        showToast('Erro ao carregar movimentações: ' + error.message, 'error');
    }
}

function createMovimentacaoCard(mov) {
    const typeConfig = {
        entrada: { color: 'green', icon: 'fa-arrow-down', label: 'Entrada' },
        saida: { color: 'red', icon: 'fa-arrow-up', label: 'Saída' },
        ajuste: { color: 'blue', icon: 'fa-adjust', label: 'Ajuste' }
    };

    const config = typeConfig[mov.tipo] || typeConfig.ajuste;

    return `
        <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 flex-1">
                    <div class="bg-${config.color}-100 text-${config.color}-600 w-12 h-12 rounded-full flex items-center justify-center">
                        <i class="fa-solid ${config.icon} text-xl"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-navy">${mov.nome_produto}</h4>
                        <p class="text-sm text-gray-500">${mov.tipo.toUpperCase()} - ${mov.quantidade} unidades</p>
                        <p class="text-xs text-gray-400">${formatDateDetailed(mov.data_hora)}</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm text-gray-600">Motivo:</div>
                    <div class="font-medium text-navy">${mov.motivo || 'N/A'}</div>
                    ${mov.observacoes ? `<div class="text-xs text-gray-400 mt-1">${mov.observacoes}</div>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Load fornecedores
async function loadFornecedores() {
    const fornecedoresList = document.getElementById('fornecedores-list');

    try {
        const { data, error } = await window.supabase
            .from('estoque_fornecedores')
            .select('*')
            .eq('ativo', true)
            .order('nome_fornecedor', { ascending: true });

        if (error) throw error;

        allFornecedores = data || [];

        if (allFornecedores.length === 0) {
            if (fornecedoresList) {
                fornecedoresList.innerHTML = `
                    <div class="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
                        <i class="fa-solid fa-truck text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500 text-lg">Nenhum fornecedor cadastrado.</p>
                        <button onclick="openModal('fornecedor')" class="mt-4 text-cyan hover:text-cyanLight font-medium">
                            Cadastrar o primeiro fornecedor
                        </button>
                    </div>
                `;
            }
        } else {
            if (fornecedoresList) {
                fornecedoresList.innerHTML = allFornecedores.map(fornecedor => createFornecedorCard(fornecedor)).join('');
            }
        }

    } catch (error) {
        console.error('Error loading fornecedores:', error);
        showToast('Erro ao carregar fornecedores: ' + error.message, 'error');
    }
}

function createFornecedorCard(fornecedor) {
    return `
        <div class="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div class="flex items-start gap-3">
                <div class="bg-navy text-white w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-truck text-xl"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-navy">${fornecedor.nome_fornecedor}</h4>
                    <p class="text-sm text-gray-600">${fornecedor.contato || 'N/A'}</p>
                    <p class="text-xs text-gray-500">${fornecedor.telefone || 'N/A'}</p>
                    <p class="text-xs text-gray-500">${fornecedor.email || 'N/A'}</p>
                </div>
            </div>
        </div>
    `;
}

// Load relatórios
async function loadRelatorios() {
    await loadTopProducts();
    await loadCategorySummary();
}

async function loadTopProducts() {
    const topProductsList = document.getElementById('top-products-list');

    try {
        const { data, error } = await window.supabase.rpc('view_produtos_mais_vendidos');

        if (error) throw error;

        const topProducts = data || [];

        if (topProducts.length === 0) {
            if (topProductsList) {
                topProductsList.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum dado disponível.</p>';
            }
        } else {
            if (topProductsList) {
                topProductsList.innerHTML = topProducts.map((product, index) => `
                    <div class="flex items-center gap-3 py-2 border-b last:border-0">
                        <div class="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold">
                            ${index + 1}
                        </div>
                        <div class="flex-1">
                            <div class="font-medium text-navy">${product.nome_produto}</div>
                            <div class="text-xs text-gray-500">${product.total_vendas} unidades</div>
                        </div>
                        <div class="font-bold text-navy">Kz ${formatCurrency(product.receita_total)}</div>
                    </div>
                `).join('');
            }
        }

    } catch (error) {
        console.error('Error loading top products:', error);
        topProductsList.innerHTML = '<p class="text-red-500 text-center py-8">Erro ao carregar dados.</p>';
    }
}

async function loadCategorySummary() {
    const categorySummary = document.getElementById('category-summary');

    try {
        const { data, error } = await window.supabase
            .from('view_estoque_resumo_categoria')
            .select('*');

        if (error) throw error;

        const summary = data || [];

        if (summary.length === 0) {
            if (categorySummary) {
                categorySummary.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum dado disponível.</p>';
            }
        } else {
            if (categorySummary) {
                categorySummary.innerHTML = summary.map(cat => {
                    const maxQty = Math.max(...summary.map(s => s.quantidade_total));
                    const barWidth = (cat.quantidade_total / maxQty) * 100;

                    return `
                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-1">
                                <span class="font-medium text-navy">${cat.categoria}</span>
                                <span class="text-sm text-gray-600">${cat.quantidade_total} unidades</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-3">
                                <div class="bg-cyan h-3 rounded-full" style="width: ${barWidth}%"></div>
                            </div>
                            <div class="flex justify-between text-xs text-gray-500 mt-1">
                                <span>${cat.quantidade_critica} críticos</span>
                                <span>${cat.quantidade_baixo} baixos</span>
                                <span>Valor: Kz ${formatCurrency(cat.valor_estoque)}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

    } catch (error) {
        console.error('Error loading category summary:', error);
        categorySummary.innerHTML = '<p class="text-red-500 text-center py-8">Erro ao carregar dados.</p>';
    }
}

// Movimentação functions
function openMovimentacaoModal(estoqueId, produtoNome) {
    document.getElementById('movimentacao-estoque-id').value = estoqueId;
    document.getElementById('movimentacao-produto-nome').value = produtoNome;
    document.getElementById('movimentacao-produto-display').value = produtoNome;
    document.getElementById('movimentacao-quantidade').value = '';
    document.getElementById('movimentacao-motivo').value = '';
    document.getElementById('movimentacao-observacoes').value = '';
    document.getElementById('movimentacao-tipo').value = 'entrada';

    openModal('movimentacao');
}

async function confirmMovimentacao() {
    const estoqueId = document.getElementById('movimentacao-estoque-id').value;
    const tipo = document.getElementById('movimentacao-tipo').value;
    const quantidade = parseInt(document.getElementById('movimentacao-quantidade').value);
    const motivo = document.getElementById('movimentacao-motivo').value;
    const observacoes = document.getElementById('movimentacao-observacoes').value;

    if (!quantidade || quantidade <= 0) {
        showToast('Quantidade inválida', 'error');
        return;
    }

    try {
        const { error } = await window.supabase.rpc('registrar_movimentacao_estoque', {
            p_estoque_id: estoqueId,
            p_tipo: tipo,
            p_quantidade: quantidade,
            p_motivo: motivo,
            p_observacoes: observacoes
        });

        if (error) throw error;

        showToast('Movimentação registrada com sucesso!', 'success');
        closeModal('movimentacao');

        // Reload all data
        await loadEstoque();
        await loadAlertas();
        await loadMovimentacoes();

    } catch (error) {
        console.error('Error registering movement:', error);
        showToast('Erro ao registrar movimentação: ' + error.message, 'error');
    }
}

// Produto form handling
document.getElementById('produto-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        sku: document.getElementById('sku').value,
        codigo_barras: document.getElementById('codigo_barras').value,
        nome_produto: document.getElementById('nome_produto').value,
        categoria: document.getElementById('categoria').value,
        subcategoria: document.getElementById('subcategoria').value,
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        cor: document.getElementById('cor').value,
        tamanho: document.getElementById('tamanho').value,
        quantidade_atual: parseInt(document.getElementById('quantidade_atual').value),
        estoque_minimo: parseInt(document.getElementById('estoque_minimo').value),
        estoque_maximo: parseInt(document.getElementById('estoque_maximo').value),
        localizacao_almoxarifado: document.getElementById('localizacao_almoxarifado').value,
        custo_unitario: parseFloat(document.getElementById('custo_unitario').value) || 0,
        preco_venda: parseFloat(document.getElementById('preco_venda').value) || 0,
        ativo: document.getElementById('ativo').checked,
        disponivel_venda: document.getElementById('disponivel_venda').checked
    };

    try {
        const produtoId = document.getElementById('produto-id').value;

        if (produtoId) {
            // Update existing
            const { error } = await window.supabase
                .from('estoque')
                .update(formData)
                .eq('id', produtoId);

            if (error) throw error;
            showToast('Produto atualizado com sucesso!', 'success');
        } else {
            // Create new
            const { error } = await window.supabase
                .from('estoque')
                .insert([formData]);

            if (error) throw error;
            showToast('Produto criado com sucesso!', 'success');
        }

        closeModal('produto');
        await loadEstoque();

    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Erro ao salvar produto: ' + error.message, 'error');
    }
});

async function loadProdutoForEdit(id) {
    try {
        const { data, error } = await window.supabase
            .from('estoque')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        document.getElementById('produto-id').value = data.id;
        document.getElementById('sku').value = data.sku;
        document.getElementById('codigo_barras').value = data.codigo_barras || '';
        document.getElementById('nome_produto').value = data.nome_produto;
        document.getElementById('categoria').value = data.categoria;
        document.getElementById('subcategoria').value = data.subcategoria || '';
        document.getElementById('marca').value = data.marca || '';
        document.getElementById('modelo').value = data.modelo || '';
        document.getElementById('cor').value = data.cor || '';
        document.getElementById('tamanho').value = data.tamanho || '';
        document.getElementById('quantidade_atual').value = data.quantidade_atual;
        document.getElementById('estoque_minimo').value = data.estoque_minimo;
        document.getElementById('estoque_maximo').value = data.estoque_maximo;
        document.getElementById('localizacao_almoxarifado').value = data.localizacao_almoxarifado || '';
        document.getElementById('custo_unitario').value = data.custo_unitario;
        document.getElementById('preco_venda').value = data.preco_venda;
        document.getElementById('ativo').checked = data.ativo;
        document.getElementById('disponivel_venda').checked = data.disponivel_venda;

    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Erro ao carregar produto: ' + error.message, 'error');
    }
}

// Utility functions
function formatCurrency(value) {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function calculateMargin(custo, preco) {
    if (!custo || !preco || custo === 0) return '0.00';
    const margin = ((preco - custo) / preco) * 100;
    return margin.toFixed(2);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateDetailed(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Search and filter event listeners
document.getElementById('search').addEventListener('input', () => {
    if (currentTab === 'produtos') {
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid && allProducts.length > 0) {
            const filteredProducts = applyFilters(allProducts);
            productsGrid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
        }
    }
});

document.getElementById('filter-category').addEventListener('change', () => {
    if (currentTab === 'produtos') loadEstoque();
});

document.getElementById('filter-brand').addEventListener('change', () => {
    if (currentTab === 'produtos') loadEstoque();
});

document.getElementById('filter-status').addEventListener('change', () => {
    if (currentTab === 'produtos') loadEstoque();
});

// Calculate margin on input change
document.getElementById('custo_unitario').addEventListener('input', updateMargin);
document.getElementById('preco_venda').addEventListener('input', updateMargin);

function updateMargin() {
    const custo = parseFloat(document.getElementById('custo_unitario').value) || 0;
    const preco = parseFloat(document.getElementById('preco_venda').value) || 0;
    const marginInput = document.getElementById('margem_lucro');

    if (marginInput) {
        marginInput.value = calculateMargin(custo, preco) + '%';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('admin_logged_in');
    window.location.href = '../login.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!localStorage.getItem('admin_logged_in')) {
        window.location.href = '../login.html';
        return;
    }

    // Load initial data
    await loadEstoque();
});
