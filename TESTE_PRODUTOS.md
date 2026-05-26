# Teste de Sincronização de Produtos - Viva Óptica

## ✅ Implementação Concluída

### Alterações Feitas

1. **admin/app.js** - Sistema de CRUD Completo
   - Formulário modal para adicionar produtos
   - Formulário modal para editar produtos
   - Filtros por categoria (Armações, Lentes, Acessórios)
   - Preview de imagem ao inserir URL
   - Badges de status (ativo/inativo, estoque)
   - Toast notifications para feedback

2. **script.js** - Migração para Supabase
   - Substituição do array estático `products` por carregamento dinâmico
   - Função `loadProductsFromSupabase()` com fallback para dados estáticos
   - Detecção automática de categoria baseada no URL
   - Mapeamento de campos do Supabase para o frontend

### Como Testar

#### 1. Testar no Admin Panel
```
1. Abrir http://localhost/admin/login.html (ou servidor local)
2. Fazer login com credenciais administrativas
3. Navegar para "Armações" no menu
4. Clicar em "Adicionar Armação"
5. Preencher o formulário:
   - Nome: Ex: "Armação Ray-Ban Classic"
   - Descrição: "Armação clássica preta de acetato"
   - Preço: 25000
   - Estoque: 10
   - Categoria: Armações
   - Imagem URL: (opcional)
6. Clicar em "Guardar Produto"
7. Verificar toast de sucesso
8. Confirmar que o produto aparece na lista
```

#### 2. Testar Sincronização com Página Pública
```
1. Com o produto já adicionado no admin
2. Abrir uma nova aba do browser
3. Navegar para: http://localhost/viva-optica/viva-optica/paginas/armacoes.html
4. Recarregar a página (F5)
5. Verificar que o novo produto aparece no grid
6. Se não houver imagem, verificar se o fallback está a funcionar
```

#### 3. Testar Edição
```
1. No admin, clicar em "Editar" num produto existente
2. Alterar o preço ou descrição
3. Guardar alterações
4. Atualizar a página pública (F5)
5. Verificar que as alterações refletem
```

#### 4. Testar Eliminação
```
1. No admin, clicar em "Eliminar" num produto
2. Confirmar a eliminação
3. Atualizar a página pública (F5)
4. Verificar que o produto desapareceu
```

### Mapeamento de Categorias

| Admin (Select) | Supabase (categoria) | Página Pública |
|----------------|---------------------|----------------|
| Armações | armações | armacoes.html |
| Lentes de Contacto | lentes | (não existe ainda) |
| Acessórios | acessórios | (não existe ainda) |

### Estrutura de Dados do Supabase

```sql
CREATE TABLE produtos (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  imagem_url TEXT,
  categoria TEXT NOT NULL DEFAULT 'outros',
  estoque INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE,
  atualizado_em TIMESTAMP WITH TIME ZONE
);
```

### RLS Policies

- **SELECT (público)**: Todos os produtos (política aberta para pesquisa)
- **ALL (authenticated)**: Admin pode fazer CRUD completo

### Fallback para Dados Estáticos

Se o Supabase falhar (erro de rede, permissão, etc.), o sistema automaticamente:
1. Regista o erro no console
2. Carrega produtos estáticos de exemplo
3. Permite que o site continue funcionando

### Próximos Passos (Opcionais)

- [ ] Criar páginas `lentes.html` e `acessorios.html`
- [ ] Adicionar colunas opcionais para filtros avançados:
  - `gender` (masculino/feminino/unissex)
  - `shape` (redonda/quadrada/aviador/gatinho)
  - `material` (metal/acetato/titânio)
- [ ] Implementar upload de imagens para Supabase Storage
- [ ] Adicionar paginação para muitos produtos
- [ ] Criar página de detalhes do produto
