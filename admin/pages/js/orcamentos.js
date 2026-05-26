// Gerador de Orçamentos PDF - Viva Óptica Admin
// Sistema de criação e gestão de orçamentos profissionais

let orcamentoAtual = null;
let itensOrcamento = [];
let clientesCache = [];
let produtosCache = [];
let orcamentosList = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('data_emissao').valueAsDate = new Date();
    document.getElementById('data_validade').valueAsDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 dias

    loadEstatisticas();
    loadClientes();
    loadProdutos();
});

// Carregar estatísticas
async function loadEstatisticas() {
    try {
        const { data, error } = await supabase
            .from('view_estatisticas_orcamentos')
            .select('*')
            .single();

        if (error) throw error;

        document.getElementById('stat-rascunhos').textContent = data.total_rascunhos || 0;
        document.getElementById('stat-enviados').textContent = data.total_enviados || 0;
        document.getElementById('stat-aprovados').textContent = data.total_aprovados || 0;

        const vendas = data.total_vendas_aprovadas || 0;
        document.getElementById('stat-vendas').textContent = `Kz ${vendas.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        showToast('Erro ao carregar estatísticas', 'error');
    }
}

// Carregar clientes
async function loadClientes() {
    try {
        const { data, error } = await supabase
            .from('clientes')
            .select('id, nome, telefone, email')
            .order('nome');

        if (error) throw error;

        clientesCache = data || [];
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
}

// Carregar produtos
async function loadProdutos() {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('id, nome, preco, categoria, imagem_url, ativo')
            .eq('ativo', true)
            .order('nome');

        if (error) throw error;

        produtosCache = data || [];
        renderProdutosGrid(produtosCache);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// Renderizar grid de produtos
function renderProdutosGrid(produtos) {
    const container = document.getElementById('produtos-grid');
    container.innerHTML = '';

    if (produtos.length === 0) {
        container.innerHTML = '<p class="col-span-3 text-center text-gray-500">Nenhum produto encontrado</p>';
        return;
    }

    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'product-item bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-cyan hover:shadow-md transition-all';
        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    ${produto.imagem_url
                        ? `<img src="${produto.imagem_url}" alt="${produto.nome}" class="w-full h-full object-cover">`
                        : '<i class="fa-solid fa-box text-gray-400 text-2xl"></i>'
                    }
                </div>
                <div class="flex-1">
                    <h4 class="font-medium text-sm text-navy">${produto.nome}</h4>
                    <p class="text-xs text-gray-500">${produto.categoria || 'Geral'}</p>
                    <p class="text-sm font-bold text-cyan mt-1">Kz ${parseFloat(produto.preco).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
                </div>
            </div>
        `;

        card.onclick = () => adicionarItem(produto);
        container.appendChild(card);
    });
}

// Buscar clientes
document.getElementById('cliente_busca').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();

    if (termo.length < 2) {
        document.getElementById('cliente-suggestions').classList.add('hidden');
        return;
    }

    const filtrados = clientesCache.filter(c =>
        c.nome.toLowerCase().includes(termo) ||
        (c.telefone && c.telefone.includes(termo))
    );

    renderClienteSuggestions(filtrados);
});

// Renderizar sugestões de clientes
function renderClienteSuggestions(clientes) {
    const container = document.getElementById('cliente-suggestions');
    container.innerHTML = '';

    if (clientes.length === 0) {
        container.classList.add('hidden');
        return;
    }

    clientes.forEach(cliente => {
        const item = document.createElement('div');
        item.className = 'p-3 hover:bg-cyanLight hover:text-white cursor-pointer border-b border-gray-100';
        item.innerHTML = `
            <div class="font-medium">${cliente.nome}</div>
            <div class="text-xs text-gray-500">${cliente.telefone || 'Sem telefone'}</div>
        `;

        item.onclick = () => selecionarCliente(cliente);
        container.appendChild(item);
    });

    container.classList.remove('hidden');
    container.style.position = 'absolute';
    container.style.width = '400px';
    container.style.zIndex = '50';
}

// Selecionar cliente
function selecionarCliente(cliente) {
    document.getElementById('cliente_busca').value = cliente.nome;
    document.getElementById('cliente_id').value = cliente.id;
    document.getElementById('cliente-suggestions').classList.add('hidden');
}

// Abrir modal de produto
function abrirModalProduto() {
    document.getElementById('produto-modal').classList.remove('hidden');
    renderProdutosGrid(produtosCache);
}

// Fechar modal de produto
function fecharModalProduto() {
    document.getElementById('produto-modal').classList.add('hidden');
    document.getElementById('produto_busca').value = '';
}

// Buscar produtos no modal
document.getElementById('produto_busca').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = produtosCache.filter(p => p.nome.toLowerCase().includes(termo));
    renderProdutosGrid(filtrados);
});

// Adicionar item ao orçamento
function adicionarItem(produto) {
    const item = {
        id: Date.now(),
        produto_id: produto.id,
        produto_nome: produto.nome,
        categoria: produto.categoria,
        quantidade: 1,
        preco_unitario: parseFloat(produto.preco),
        subtotal: parseFloat(produto.preco)
    };

    itensOrcamento.push(item);
    renderItens();
    fecharModalProduto();
}

// Renderizar itens
function renderItens() {
    const container = document.getElementById('itens-container');

    if (itensOrcamento.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <i class="fa-solid fa-box text-3xl mb-2"></i>
                <p>Nenhum produto adicionado</p>
                <p class="text-sm">Clique em "Adicionar Produto" para começar</p>
            </div>
        `;
        atualizarTotais();
        return;
    }

    container.innerHTML = '';

    itensOrcamento.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'bg-gray-50 rounded-lg p-4 border border-gray-200';
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-medium text-navy">${item.produto_nome}</h4>
                    <p class="text-sm text-gray-500">${item.categoria || 'Geral'}</p>
                </div>
                <button onclick="removerItem(${item.id})" class="text-red-500 hover:text-red-700">
                    <i class="fa-solid fa-times text-xl"></i>
                </button>
            </div>
            <div class="flex gap-4 mt-3">
                <div class="flex items-center gap-2">
                    <label class="text-sm text-gray-600">Qtd:</label>
                    <input type="number" value="${item.quantidade}" min="1"
                        class="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                        onchange="atualizarQuantidade(${item.id}, this.value)">
                </div>
                <div class="flex items-center gap-2">
                    <label class="text-sm text-gray-600">Preço:</label>
                    <input type="number" value="${item.preco_unitario}" step="0.01" min="0"
                        class="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                        onchange="atualizarPreco(${item.id}, this.value)">
                </div>
                <div class="flex items-center gap-2 flex-1 justify-end">
                    <span class="font-bold text-navy">Subtotal: Kz ${item.subtotal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
        `;

        container.appendChild(div);
    });

    atualizarTotais();
}

// Atualizar quantidade
function atualizarQuantidade(itemId, quantidade) {
    const item = itensOrcamento.find(i => i.id === itemId);
    if (item) {
        item.quantidade = parseInt(quantidade) || 1;
        item.subtotal = item.quantidade * item.preco_unitario;
        renderItens();
    }
}

// Atualizar preço
function atualizarPreco(itemId, preco) {
    const item = itensOrcamento.find(i => i.id === itemId);
    if (item) {
        item.preco_unitario = parseFloat(preco) || 0;
        item.subtotal = item.quantidade * item.preco_unitario;
        renderItens();
    }
}

// Remover item
function removerItem(itemId) {
    itensOrcamento = itensOrcamento.filter(i => i.id !== itemId);
    renderItens();
}

// Atualizar totais
function atualizarTotais() {
    const subtotal = itensOrcamento.reduce((sum, item) => sum + item.subtotal, 0);
    const descontoValor = parseFloat(document.getElementById('desconto_valor').value) || 0;
    const descontoTipo = document.getElementById('desconto_tipo').value;

    let descontoFinal = 0;
    if (descontoTipo === 'percentual') {
        descontoFinal = (subtotal * descontoValor) / 100;
    } else {
        descontoFinal = descontoValor;
    }

    const total = subtotal - descontoFinal;

    document.getElementById('total_subtotal').textContent = `Kz ${subtotal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}`;
    document.getElementById('total_desconto').textContent = `- Kz ${descontoFinal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}`;
    document.getElementById('total_final').textContent = `Kz ${total.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}`;

    return { subtotal, descontoFinal, total };
}

// Monitorar desconto
document.getElementById('desconto_valor').addEventListener('input', atualizarTotais);
document.getElementById('desconto_tipo').addEventListener('change', atualizarTotais);

// Novo orçamento
function novoOrcamento() {
    orcamentoAtual = null;
    itensOrcamento = [];

    document.getElementById('cliente_busca').value = '';
    document.getElementById('cliente_id').value = '';
    document.getElementById('data_emissao').valueAsDate = new Date();
    document.getElementById('data_validade').valueAsDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    document.getElementById('desconto_valor').value = '';
    document.getElementById('desconto_tipo').value = 'valor';
    document.getElementById('observacoes').value = '';

    renderItens();
    atualizarTotais();

    document.getElementById('formulario-container').classList.remove('hidden');
    document.getElementById('lista-container').classList.add('hidden');

    showToast('Novo orçamento criado', 'success');
}

// Cancelar orçamento
function cancelarOrcamento() {
    if (confirm('Tem certeza que deseja cancelar? Todas as alterações serão perdidas.')) {
        novoOrcamento();
    }
}

// Salvar orçamento
async function salvarOrcamento() {
    const clienteId = document.getElementById('cliente_id').value;
    const clienteNome = document.getElementById('cliente_busca').value;
    const dataValidade = document.getElementById('data_validade').value;

    if (!clienteNome) {
        showToast('Selecione um cliente', 'error');
        return;
    }

    if (!dataValidade) {
        showToast('Defina a data de validade', 'error');
        return;
    }

    if (itensOrcamento.length === 0) {
        showToast('Adicione pelo menos um produto', 'error');
        return;
    }

    const { subtotal, descontoFinal, total } = atualizarTotais();
    const descontoValor = parseFloat(document.getElementById('desconto_valor').value) || 0;
    const descontoTipo = document.getElementById('desconto_tipo').value;
    const observacoes = document.getElementById('observacoes').value;

    // Obter dados do cliente
    const cliente = clientesCache.find(c => c.id === clienteId) || {};
    const clienteTelefone = cliente.telefone || '';
    const clienteEmail = cliente.email || '';

    try {
        let error;

        if (orcamentoAtual) {
            // Atualizar existente
            const itensJson = itensOrcamento.map(item => ({
                produto_id: item.produto_id,
                produto_nome: item.produto_nome,
                categoria: item.categoria,
                quantidade: item.quantidade,
                preco_unitario: item.preco_unitario,
                subtotal: item.subtotal
            }));

            const { error: updateError } = await supabase
                .from('orcamentos')
                .update({
                    cliente_nome: clienteNome,
                    cliente_telefone: clienteTelefone,
                    cliente_email: clienteEmail,
                    data_validade: dataValidade,
                    desconto: descontoValor,
                    desconto_tipo: descontoTipo,
                    observacoes: observacoes
                })
                .eq('id', orcamentoAtual.id);

            if (updateError) throw updateError;

            // Remover itens existentes e inserir novos
            const { error: deleteError } = await supabase
                .from('orcamentos_itens')
                .delete()
                .eq('orcamento_id', orcamentoAtual.id);

            if (deleteError) throw deleteError;

            for (const item of itensJson) {
                const { error: itemError } = await supabase
                    .from('orcamentos_itens')
                    .insert({
                        orcamento_id: orcamentoAtual.id,
                        ...item
                    });

                if (itemError) throw itemError;
            }

            showToast('Orçamento atualizado com sucesso', 'success');
        } else {
            // Criar novo
            const { data, error: createError } = await supabase
                .from('orcamentos')
                .insert({
                    cliente_id: clienteId || null,
                    cliente_nome: clienteNome,
                    cliente_telefone: clienteTelefone,
                    cliente_email: clienteEmail,
                    data_emissao: new Date().toISOString().split('T')[0],
                    data_validade: dataValidade,
                    desconto: descontoValor,
                    desconto_tipo: descontoTipo,
                    observacoes: observacoes,
                    status: 'rascunho'
                })
                .select()
                .single();

            if (createError) throw createError;

            orcamentoAtual = data;

            // Inserir itens
            for (const item of itensOrcamento) {
                const { error: itemError } = await supabase
                    .from('orcamentos_itens')
                    .insert({
                        orcamento_id: orcamentoAtual.id,
                        produto_id: item.produto_id || null,
                        produto_nome: item.produto_nome,
                        categoria: item.categoria,
                        quantidade: item.quantidade,
                        preco_unitario: item.preco_unitario,
                        subtotal: item.subtotal
                    });

                if (itemError) throw itemError;
            }

            showToast('Orçamento criado com sucesso', 'success');
        }

        loadEstatisticas();

    } catch (error) {
        console.error('Erro ao salvar orçamento:', error);
        showToast('Erro ao salvar orçamento', 'error');
    }
}

// Gerar PDF
async function gerarPDF() {
    if (!orcamentoAtual) {
        showToast('Salve o orçamento primeiro', 'error');
        return;
    }

    const { subtotal, descontoFinal, total } = atualizarTotais();

    // Preencher template PDF
    document.getElementById('pdf-numero').textContent = orcamentoAtual.numero_orcamento;
    document.getElementById('pdf-cliente').textContent = orcamentoAtual.cliente_nome;
    document.getElementById('pdf-telefone').textContent = `Telefone: ${orcamentoAtual.cliente_telefone || 'N/A'}`;
    document.getElementById('pdf-email').textContent = `Email: ${orcamentoAtual.cliente_email || 'N/A'}`;

    const emissao = new Date(orcamentoAtual.data_emissao);
    const validade = new Date(orcamentoAtual.data_validade);
    document.getElementById('pdf-emissao').textContent = emissao.toLocaleDateString('pt-BR');
    document.getElementById('pdf-validade').textContent = validade.toLocaleDateString('pt-BR');

    // Preencher itens
    const tbody = document.querySelector('#pdf-itens tbody');
    tbody.innerHTML = '';

    itensOrcamento.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e5e7eb';
        tr.innerHTML = `
            <td style="padding: 10px; font-size: 12px; color: #374151;">${item.produto_nome}</td>
            <td style="padding: 10px; text-align: center; font-size: 12px; color: #374151;">${item.quantidade}</td>
            <td style="padding: 10px; text-align: right; font-size: 12px; color: #374151;">Kz ${item.preco_unitario.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
            <td style="padding: 10px; text-align: right; font-size: 12px; color: #374151;">Kz ${item.subtotal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('pdf-subtotal').textContent = `Kz ${subtotal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}`;
    document.getElementById('pdf-desconto').textContent = `- Kz ${descontoFinal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}`;
    document.getElementById('pdf-total').textContent = `Kz ${total.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}`;

    const observacoes = document.getElementById('observacoes').value;
    document.getElementById('pdf-observacoes').textContent = observacoes || 'Nenhuma observação';
    document.getElementById('pdf-observacoes-container').style.display = observacoes ? 'block' : 'none';

    // Gerar PDF
    const element = document.getElementById('pdf-template');
    element.classList.remove('hidden');

    const opt = {
        margin: 10,
        filename: `Orcamento_${orcamentoAtual.numero_orcamento}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(element).save();

    element.classList.add('hidden');
    showToast('PDF gerado com sucesso', 'success');
}

// Enviar WhatsApp
function enviarWhatsApp() {
    if (!orcamentoAtual) {
        showToast('Salve o orçamento primeiro', 'error');
        return;
    }

    const telefone = orcamentoAtual.cliente_telefone;
    if (!telefone) {
        showToast('Cliente não tem telefone cadastrado', 'error');
        return;
    }

    const { total } = atualizarTotais();

    const mensagem = `*ORÇAMENTO ${orcamentoAtual.numero_orcamento}*\n\n` +
        `Olá ${orcamentoAtual.cliente_nome}!\n\n` +
        `Segue seu orçamento da Viva Óptica:\n` +
        `Total: Kz ${total.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}\n` +
        `Validade: ${new Date(orcamentoAtual.data_validade).toLocaleDateString('pt-BR')}\n\n` +
        `Aproveite nossa qualidade e atendimento!\n\n` +
        `*Viva Óptica* - O Futuro é Mais Nítido Aqui`;

    const url = `https://wa.me/${telefone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');
    showToast('Abrindo WhatsApp...', 'success');
}

// Listar orçamentos
async function listarOrcamentos() {
    try {
        const { data, error } = await supabase
            .from('view_orcamentos_listagem')
            .select('*')
            .order('criado_em', { ascending: false });

        if (error) throw error;

        orcamentosList = data || [];
        renderOrcamentosList(orcamentosList);

        document.getElementById('formulario-container').classList.add('hidden');
        document.getElementById('lista-container').classList.remove('hidden');

    } catch (error) {
        console.error('Erro ao listar orçamentos:', error);
        showToast('Erro ao listar orçamentos', 'error');
    }
}

// Renderizar lista de orçamentos
function renderOrcamentosList(orcamentos) {
    const tbody = document.getElementById('orcamentos-tabela');
    tbody.innerHTML = '';

    if (orcamentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">Nenhum orçamento encontrado</td></tr>';
        return;
    }

    orcamentos.forEach(orc => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50';

        const statusClass = getStatusClass(orc.status);

        tr.innerHTML = `
            <td class="py-3 px-4 text-sm font-medium text-navy">${orc.numero_orcamento}</td>
            <td class="py-3 px-4 text-sm">${orc.cliente_nome}</td>
            <td class="py-3 px-4 text-sm">${new Date(orc.data_emissao).toLocaleDateString('pt-BR')}</td>
            <td class="py-3 px-4 text-sm">${new Date(orc.data_validade).toLocaleDateString('pt-BR')}</td>
            <td class="py-3 px-4 text-sm font-bold text-navy">Kz ${orc.total_final.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
            <td class="py-3 px-4"><span class="${statusClass} px-2 py-1 rounded-full text-xs">${orc.status}</span></td>
            <td class="py-3 px-4">
                <button onclick="editarOrcamento('${orc.id}')" class="text-cyan hover:text-cyanLight mr-2">
                    <i class="fa-solid fa-edit"></i>
                </button>
                <button onclick="excluirOrcamento('${orc.id}')" class="text-red-500 hover:text-red-700">
                    <i class="fa-solid fa-times"></i>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Editar orçamento
async function editarOrcamento(orcamentoId) {
    try {
        const { data, error } = await supabase
            .rpc('obter_orcamento_completo', { p_orcamento_id: orcamentoId });

        if (error) throw error;

        if (!data || data.length === 0) {
            showToast('Orçamento não encontrado', 'error');
            return;
        }

        orcamentoAtual = data[0];
        itensOrcamento = orcamentoAtual.itens || [];

        document.getElementById('cliente_busca').value = orcamentoAtual.cliente_nome;
        document.getElementById('data_emissao').value = orcamentoAtual.data_emissao;
        document.getElementById('data_validade').value = orcamentoAtual.data_validade;
        document.getElementById('desconto_valor').value = orcamentoAtual.desconto || '';
        document.getElementById('desconto_tipo').value = orcamentoAtual.desconto_tipo || 'valor';
        document.getElementById('observacoes').value = orcamentoAtual.observacoes || '';

        renderItens();
        atualizarTotais();

        document.getElementById('formulario-container').classList.remove('hidden');
        document.getElementById('lista-container').classList.add('hidden');

        showToast('Orçamento carregado', 'success');

    } catch (error) {
        console.error('Erro ao editar orçamento:', error);
        showToast('Erro ao editar orçamento', 'error');
    }
}

// Excluir orçamento
async function excluirOrcamento(orcamentoId) {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;

    try {
        const { error } = await supabase
            .from('orcamentos')
            .delete()
            .eq('id', orcamentoId);

        if (error) throw error;

        showToast('Orçamento excluído', 'success');
        listarOrcamentos();
        loadEstatisticas();

    } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
        showToast('Erro ao excluir orçamento', 'error');
    }
}

// Filtrar orçamentos
function filtrarOrcamentos() {
    const status = document.getElementById('filtro-status').value;

    let filtrados = orcamentosList;
    if (status) {
        filtrados = orcamentosList.filter(o => o.status === status);
    }

    renderOrcamentosList(filtrados);
}

// Helper: Status class
function getStatusClass(status) {
    const classes = {
        'rascunho': 'bg-gray-100 text-gray-700',
        'enviado': 'bg-blue-100 text-blue-700',
        'aprovado': 'bg-green-100 text-green-700',
        'cancelado': 'bg-red-100 text-red-700'
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
}

// Helper: Toast notification
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

// Logout function (deve estar definida globalmente)
function logout() {
    if (confirm('Deseja terminar a sessão?')) {
        window.location.href = '../index.html';
    }
}
