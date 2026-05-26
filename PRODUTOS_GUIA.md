# 📦 Guia de Correção - Página Produtos

## ✅ Correções Implementadas

1. **Melhorou a inicialização do cliente Supabase** 
   - O código agora aguarda até 10 segundos para o cliente Supabase estar disponível
   - Melhor tratamento de erros se o cliente não inicializar

2. **Removeu filtros restritivos**
   - Removeu o filtro `gt('estoque', 0)` que estava escondendo produtos sem estoque
   - Removeu o filtro `eq('ativo', true)` que era muito restritivo
   - Agora busca TODOS os produtos

3. **Melhorou a filtragem por categoria**
   - Corrigido o tratamento de valores nulos/undefined
   - Melhor normalização de strings (trim + lowercase)

4. **Adicionado arquivo de teste**
   - `test-produtos.html` - página para testar se Supabase está funcionando
   - Pode verificar o status da conexão
   - Carrega e exibe todos os produtos

5. **Criado script SQL de amostra**
   - `database/insert-sample-products.sql` - 10 produtos de exemplo
   - Inclui armações, lentes e acessórios
   - Pronto para inserir no banco de dados

## 🚀 Como Usar

### Opção 1: Adicionar Produtos de Teste (RECOMENDADO)

1. Abra o [Supabase Console](https://app.supabase.com)
2. Vá para seu projeto "viva-optica"
3. No menu esquerdo, clique em **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo de `database/insert-sample-products.sql`
6. Clique **Run** para executar

### Opção 2: Testar a Página

1. Abra `paginas/test-produtos.html` no navegador
2. Verifique se o status mostra "✅ Cliente Supabase inicializado"
3. Clique em "Carregar Produtos" para listar os produtos
4. Se aparecer "⚠️ Nenhum produto encontrado", execute a Opção 1

### Opção 3: Usar a Página de Produtos

1. Abra `paginas/produtos.html` no navegador
2. Os produtos carregarão automaticamente
3. Use os filtros para ver por categoria

## 🔧 Estrutura de Dados Esperada

```sql
CREATE TABLE produtos (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  preco DECIMAL(12,2) NOT NULL,
  categoria VARCHAR(100),  -- 'Armacao', 'Lente', 'Acessorio'
  imagem_url TEXT,
  estoque INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP,
  atualizado_em TIMESTAMP
)
```

## 📋 Categorias Disponíveis

- `Armacao` - Armações de óculos
- `Lente` - Lentes ópticas
- `Acessorio` - Acessórios diversos

## 🐛 Troubleshooting

### Produtos não aparecem?
1. Verifique se há produtos na tabela: abra `test-produtos.html`
2. Se nenhum produto aparecer, execute `insert-sample-products.sql`

### Supabase não inicializa?
1. Verifique a conexão de internet
2. Abra o console do navegador (F12) e procure por erros
3. Verifique se o arquivo `supabaseClient.js` está no caminho correto

### Erro de CORS?
1. Se ver erro sobre CORS, verifique as configurações no Supabase
2. A URL e a chave ANON devem estar corretas em `supabaseClient.js`

## 📱 WhatsApp Integration

A página tem integração com WhatsApp:
- Cada produto tem botão "Comprar via WhatsApp"
- O número padrão é: `244954145065`
- Edite a constante `WHATSAPP_NUMBER` em `produtos.js` para mudar

## 🎨 Personalizações

### Alterar número do WhatsApp
Edite em `paginas/produtos.js`:
```javascript
const WHATSAPP_NUMBER = 'seu_numero_aqui';
```

### Alterar cores
As cores estão definidas em `supabaseClient.js` como variáveis Tailwind:
- `navy: '#1a2a4a'` - azul escuro
- `cyan: '#00aadc'` - azul claro
- `magenta: '#e91e8c'` - rosa
- `yellow: '#f5c800'` - amarelo

## ✨ Features

- ✅ Filtragem por categoria
- ✅ Busca e carregamento de produtos do Supabase
- ✅ Modal com detalhes do produto
- ✅ Integração com WhatsApp
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ Imagens com placeholder fallback
- ✅ Formatação de preços em Kz
- ✅ Indicador de estoque

## 📞 Suporte

Se tiver problemas:
1. Verifique o console do navegador (F12)
2. Procure por erros em vermelho
3. Teste com `test-produtos.html` primeiro
4. Verifique a conexão Supabase no painel de admin
