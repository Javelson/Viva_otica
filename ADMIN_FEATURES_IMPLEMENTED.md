# Funcionalidades Implementadas no Painel Admin - Viva Óptica

## ✅ 1. Novo Agendamento Manual

**Onde:** Botão "Novo Agendamento" no painel de agendamentos (cor magenta)

**Funcionalidade:**
- Formulário oculto que aparece ao clicar no botão
- Campos:
  - Nome do Cliente *
  - Telefone *
  - Email (opcional)
  - Tipo de Serviço * (Primeira Consulta, Retorno, Exame de Visão, Compra de Armação, Outros)
  - Data * (com validação: não pode ser anterior a hoje)
  - Hora *
  - Observações (opcional)
- Botão "Guardar Agendamento" que insere diretamente no Supabase
- Feedback visual com toast notification
- Redirecionamento automático após salvamento

**Funções adicionadas:**
- `showManualAppointmentForm()` - Mostra o formulário
- `hideManualAppointmentForm()` - Esconde e limpa o formulário
- `deleteAppointment(id)` - Elimina um agendamento

## ✅ 2. Melhoria na Visualização de Agendamentos

**Antes:** Cards simples com informações básicas

**Agora:** Layout em grid com 5 colunas:

| Coluna | Informação | Ícone |
|--------|------------|-------|
| **Quem marcou** | Nome + Email | 👤 📧 |
| **Contacto** | Telefone | 📱 |
| **O quê** | Serviço + Status | 💆 🏷️ |
| **Quando** | Data + Hora | 📅 🕐 |
| **Ações** | Concluir/Cancelar/Eliminar | ✓ ✕ 🗑️ |

**Melhorias:**
- Layout responsivo (1 coluna no mobile, 5 no desktop)
- Badges coloridos por status
- Observações exibidas em destaque abaixo do card
- Hover effect com sombra para melhor UX
- Botão de eliminar (lixo) adicionado

## ✅ 3. Exposição Global de Funções

Funções adicionadas ao window para acesso global:
```javascript
window.showManualAppointmentForm
window.hideManualAppointmentForm
window.deleteAppointment
```

## 📝 Notas Técnicas

### Arquivo Modificado
- `admin/app.js` - Adicionadas ~150 linhas de código

### Dependências
- Supabase já configurado com tabela `agendamentos`
- RLS policies corretas (INSERT/SELECT para anon, ALL para authenticated)

### Compatibilidade
- Formulário manual usa as mesmas colunas do agendamento automático:
  - `nome`, `nome_cliente`
  - `telefone`, `telefone_cliente`
  - `servico`, `tipo`
  - `data`, `hora`, `observacoes`, `status`

## ✅ 4. Sistema de Produtos Completo (Concluído 2026-05-01)

**Onde:** Menu "Armações", "Lentes", "Acessórios" no admin

**Funcionalidade:**
- **Formulários Modais Modernos:**
  - Substituição dos `prompt()` nativos por formulários modais com Tailwind CSS
  - Campos: Nome, Descrição, Preço, Estoque, Categoria (select), URL da Imagem
  - Preview da imagem ao inserir URL
  - Validação no frontend antes de submeter

- **CRUD Completo:**
  - **Adicionar:** Botão "Adicionar Armação" abre modal, guarda no Supabase
  - **Editar:** Modal pré-preenchido com dados do produto
  - **Eliminar:** Confirmação antes de eliminar, com feedback visual
  - **Listar:** Cards modernos com imagem, badges de status, preço formatado

- **Filtros por Categoria:**
  - Botões de filtro no topo: "Todos", "Armações", "Lentes", "Acessórios"
  - Filtragem em tempo real sem recarregar a página
  - Contador de produtos por categoria

- **Sincronização com Páginas Públicas:**
  - Produtos adicionados no admin aparecem automaticamente em:
    - `paginas/armacoes.html` (categoria: 'armações')
    - `paginas/lentes.html` (categoria: 'lentes') - quando criada
    - `paginas/acessorios.html` (categoria: 'acessórios') - quando criada
  - Carregamento dinâmico do Supabase com fallback para dados estáticos
  - Detecção automática de categoria baseada no URL

**Funções adicionadas/alteradas:**
- `showAddProductForm(categoria)` - Modal para adicionar produtos
- `editProduct(id)` - Modal para editar produtos
- `cancelAddProduct()` / `cancelEditProduct()` - Fechar modais
- `loadProdutosCategoria(categoria, titulo)` - Carregar com filtros
- `loadProductsFromSupabase()` - No script.js para páginas públicas

## 🚀 Próximos Passos Sugeridos

1. **Upload de Imagens:**
   - Integrar com Supabase Storage para upload direto de imagens
   - Substituir campo de URL por upload de ficheiro

2. **Páginas de Lentes e Acessórios:**
   - Criar `paginas/lentes.html` e `paginas/acessorios.html`
   - Reutilizar o mesmo `script.js` (detecção automática de categoria)

3. **Filtros Avançados:**
   - Adicionar colunas opcionais: `gender`, `shape`, `material`
   - Permitir filtragem combinada no frontend

4. **Dashboard com Estatísticas:**
   - Total de produtos por categoria
   - Produtos com baixo estoque
   - Valor total do inventário
