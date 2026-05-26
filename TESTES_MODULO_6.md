# Guia de Testes - Módulo 6: Gerador de Orçamentos PDF

**Viva Óptica** - Testes de Funcionalidade do Módulo 6

---

## Pré-requisitos

Antes de iniciar os testes, certifique-se de:

1. ✅ Executar `MODULE_ORCAMENTOS_PDF.sql` no Supabase SQL Editor
2. ✅ Ter clientes cadastrados no sistema
3. ✅ Ter produtos cadastrados no sistema
4. ✅ Estar acessando via servidor local (não file://)

---

## Teste 1: Acesso à Página

**Objetivo:** Verificar se a página carrega corretamente

**Passos:**
1. Acesse `http://localhost/admin/pages/orcamentos.html` (ou URL do seu servidor)
2. Verifique se não há erros no console (F12 → Console)

**Resultado Esperado:**
- ✅ Página carrega sem erros
- ✅ Estatísticas aparecem (mesmo com valores 0)
- ✅ Formulário está visível
- ✅ Botões "Novo Orçamento", "Listar Orçamentos" funcionam

**Erros Comuns:**
- `supabaseClient is not defined` → Verifique se `../supabaseClient.js` existe
- `Failed to fetch` → Verifique conexão com Supabase

---

## Teste 2: Carregar Clientes

**Objetivo:** Verificar se clientes são carregados do Supabase

**Passos:**
1. Na página de orçamentos, clique no campo "Buscar cliente..."
2. Digite parte do nome de um cliente existente

**Resultado Esperado:**
- ✅ Lista de sugestões aparece
- ✅ Clientes filtram conforme digita
- ✅ Selecionar cliente preenche: nome, telefone, email

**SQL para verificar clientes:**
```sql
SELECT id, nome, telefone, email FROM clientes LIMIT 5;
```

---

## Teste 3: Carregar Produtos

**Objetivo:** Verificar se produtos são carregados corretamente

**Passos:**
1. Clique em "Adicionar Produto"
2. Modal com lista de produtos deve abrir
3. Filtre por categoria ou busca

**Resultado Esperado:**
- ✅ Modal abre corretamente
- ✅ Produtos aparecem com imagem, nome, preço
- ✅ Filtro por categoria funciona
- ✅ Busca por nome funciona

**SQL para verificar produtos:**
```sql
SELECT id, nome, preco, categoria, estoque FROM produtos LIMIT 10;
```

---

## Teste 4: Adicionar Produtos ao Orçamento

**Objetivo:** Verificar adição de múltiplos produtos

**Passos:**
1. Com um cliente selecionado, clique em "Adicionar Produto"
2. Selecione 3 produtos diferentes
3. Clique em "Adicionar" para cada um

**Resultado Esperado:**
- ✅ Cada produto aparece na lista de itens
- ✅ Quantidade padrão é 1
- ✅ Preço unitário preenchido automaticamente
- ✅ Subtotal calculado (quantidade × preço)
- ✅ Botão "X" para remover item funciona

---

## Teste 5: Atualizar Quantidades

**Objetivo:** Verificar cálculo automático ao mudar quantidades

**Passos:**
1. Em um item da lista, mude quantidade de 1 para 2
2. Mude para 5
3. Volte para 1

**Resultado Esperado:**
- ✅ Subtotal do item atualiza automaticamente
- ✅ Total geral atualiza
- ✅ Não há erros no console

---

## Teste 6: Aplicar Desconto

**Objetivo:** Verificar cálculo de desconto fixo e percentual

**Passos:**
1. Com itens no orçamento, localize campo "Desconto"
2. Teste 1: Digite "5000" (valor fixo)
3. Teste 2: Mude tipo para "percentual" e digite "10"

**Resultado Esperado:**
- ✅ Desconto em valor: Kz 5.000 subtraído do total
- ✅ Desconto percentual: 10% calculado corretamente
- ✅ Total final atualiza automaticamente
- ✅ Fórmula: `total = subtotal - desconto`

---

## Teste 7: Salvar Orçamento

**Objetivo:** Verificar salvamento no banco de dados

**Passos:**
1. Preencha: cliente, produtos, desconto (opcional), observações
2. Selecione data de validade
3. Clique em "Salvar"

**Resultado Esperado:**
- ✅ Toast notification: "Orçamento criado com sucesso"
- ✅ Número do orçamento gerado: `ORC-2026-0001`
- ✅ Status: "rascunho"

**Verificação no Supabase:**
```sql
-- Último orçamento criado
SELECT id, numero_orcamento, cliente_nome, status, data_validade
FROM orcamentos
ORDER BY criado_em DESC
LIMIT 1;

-- Itens do orçamento
SELECT * FROM orcamentos_itens
WHERE orcamento_id = 'UUID_DO_ORCAMENTO';
```

---

## Teste 8: Gerar PDF

**Objetivo:** Verificar geração do PDF profissional

**Passos:**
1. Com um orçamento salvo, clique em "Gerar PDF"
2. Aguarde processamento
3. Verifique download automático

**Resultado Esperado:**
- ✅ PDF é baixado com nome: `orcamento_ORC-2026-0001.pdf`
- ✅ Logo da Viva Óptica aparece no header
- ✅ Dados do cliente corretos
- ✅ Todos os itens listados na tabela
- ✅ Subtotal, desconto e total corretos
- ✅ Termos e condições visíveis
- ✅ Espaço para assinatura
- ✅ Cores da marca aplicadas (navy, cyan)

**Verificar no PDF:**
- [ ] Logo visível e nítida
- [ ] Número do orçamento: `ORC-2026-XXXX`
- [ ] Data emissão e validade corretas
- [ ] Todos produtos listados
- [ ] Cálculos matemáticos corretos
- [ ] Rodapé com slogan da empresa

---

## Teste 9: Enviar WhatsApp

**Objetivo:** Verificar integração com WhatsApp

**Passos:**
1. Com um orçamento salvo, clique em "Enviar WhatsApp"
2. Verifique se WhatsApp Web ou app abre

**Resultado Esperado:**
- ✅ WhatsApp abre em nova aba/janela
- ✅ Mensagem pré-formatada contém:
  ```
  *ORÇAMENTO ORC-2026-0001*

  Olá [Nome do Cliente]!

  Segue seu orçamento da Viva Óptica:
  Total: Kz XX.XXX,XX
  Validade: DD/MM/AAAA

  Aproveite nossa qualidade e atendimento!

  *Viva Óptica* - O Futuro é Mais Nítido Aqui
  ```
- ✅ Número do telefone correto

---

## Teste 10: Listar Orçamentos

**Objetivo:** Verificar listagem e filtros

**Passos:**
1. Clique em "Listar Orçamentos"
2. Verifique tabela com todos os orçamentos
3. Filtre por status: "rascunho", "enviado", "aprovado"

**Resultado Esperado:**
- ✅ Todos orçamentos aparecem na tabela
- ✅ Colunas: Nº, Cliente, Data, Validade, Total, Status
- ✅ Filtro por status funciona
- ✅ Botões "Editar", "PDF", "WhatsApp" em cada linha
- ✅ Status com cores diferentes (badge)

**Cores dos status:**
- Rascunho: Cinza
- Enviado: Azul
- Aprovado: Verde
- Cancelado: Vermelho

---

## Teste 11: Editar Orçamento

**Objetivo:** Verificar edição de orçamento existente

**Passos:**
1. Na listagem, clique em "Editar" em um orçamento
2. Modifique: produtos, desconto, observações
3. Clique em "Atualizar"

**Resultado Esperado:**
- ✅ Formulário preenche com dados existentes
- ✅ Itens podem ser adicionados/removidos
- ✅ Alterações salvas corretamente
- ✅ Histórico registrado

**Verificar histórico:**
```sql
SELECT status_antigo, status_novo, alterado_em
FROM orcamentos_historico
WHERE orcamento_id = 'UUID_DO_ORCAMENTO';
```

---

## Teste 12: Alterar Status

**Objetivo:** Verificar workflow de status

**Passos:**
1. Crie orçamento com status "rascunho"
2. Altere para "enviado"
3. Altere para "aprovado"
4. Teste alteração para "cancelado"

**Resultado Esperado:**
- ✅ Status muda corretamente
- ✅ Histórico registra cada mudança
- ✅ Badge de status atualiza na listagem

---

## Teste 13: Estatísticas

**Objetivo:** Verificar cálculo de estatísticas

**Passos:**
1. Crie vários orçamentos com diferentes status
2. Recarregue a página
3. Verifique cards de estatísticas

**Resultado Esperado:**
- ✅ Card "Rascunhos": conta correta
- ✅ Card "Enviados": conta correta
- ✅ Card "Aprovados": conta correta
- ✅ Card "Vendas Totais": soma dos totais de aprovados

**SQL para verificar:**
```sql
SELECT 
  status,
  COUNT(*) as total,
  SUM(
    (SELECT COALESCE(SUM(subtotal), 0) FROM orcamentos_itens WHERE orcamento_id = orcamentos.id)
  ) as valor_total
FROM orcamentos
GROUP BY status;
```

---

## Teste 14: Numeração Automática

**Objetivo:** Verificar sequência de numeração

**Passos:**
1. Crie orçamento → deve ser `ORC-2026-0001`
2. Crie outro → deve ser `ORC-2026-0002`
3. Crie mais um → deve ser `ORC-2026-0003`

**Resultado Esperado:**
- ✅ Sequência incremental correta
- ✅ Formato: `ORC-AAAA-NNNN`
  - AAAA = ano atual
  - NNNN = número com 4 dígitos (0001, 0002, ...)

**Verificar sequência:**
```sql
SELECT currval('orcamento_number_seq');
```

---

## Teste 15: Validações

**Objetivo:** Verificar validações de formulário

**Passos:**
1. Tente salvar sem selecionar cliente
2. Tente salvar sem produtos
3. Tente salvar com data de validade vazia

**Resultado Esperado:**
- ✅ Mensagem de erro: "Selecione um cliente"
- ✅ Mensagem de erro: "Adicione pelo menos um produto"
- ✅ Mensagem de erro: "Selecione data de validade"
- ✅ Orçamento NÃO é salvo

---

## Cenários de Teste Integrado

### Cenário A: Orçamento Completo

1. ✅ Acessar página
2. ✅ Selecionar cliente "João Silva"
3. ✅ Adicionar produto "Armação Ray-Ban" (Qtd: 2)
4. ✅ Adicionar produto "Lente Progressive" (Qtd: 1)
5. ✅ Aplicar desconto 10%
6. ✅ Validade: 15 dias
7. ✅ Observação: "Cliente VIP"
8. ✅ Salvar → `ORC-2026-0001`
9. ✅ Gerar PDF → verificar conteúdo
10. ✅ Enviar WhatsApp → verificar mensagem
11. ✅ Alterar status para "enviado"
12. ✅ Listar → verificar aparece com status "Enviado"

### Cenário B: Orçamento Cancelado

1. ✅ Criar orçamento
2. ✅ Alterar status para "cancelado"
3. ✅ Motivo: "Cliente desistiu"
4. ✅ Listar → aparece em cinza
5. ✅ NÃO entra no total de vendas

### Cenário C: Orçamento Aprovado

1. ✅ Criar orçamento
2. ✅ Enviar para cliente
3. ✅ Cliente aprova → alterar status para "aprovado"
4. ✅ Entrar no total de vendas
5. ✅ Gerar PDF final com "APROVADO" em destaque

---

## Checklist Final

Antes de considerar o módulo pronto:

- [ ] Todos os 15 testes acima passaram
- [ ] SQL executado no Supabase sem erros
- [ ] Página acessível via navegador
- [ ] PDF gerado com logo e branding corretos
- [ ] WhatsApp integration funciona
- [ ] Estatísticas calculadas corretamente
- [ ] Histórico de alterações registrado
- [ ] Numeração automática funcionando
- [ ] Validações de formulário implementadas
- [ ] Erros tratados com mensagens amigáveis

---

## Problemas Conhecidos

### Erro: "Cannot read property 'nome' of null"
**Causa:** Cliente não selecionado  
**Solução:** Selecionar cliente antes de salvar

### Erro: "html2pdf is not defined"
**Causa:** CDN do html2pdf não carregou  
**Solução:** Verificar conexão internet e URL do CDN

### Erro: "Failed to fetch"
**Causa:** Supabase não acessível  
**Solução:** Verificar credenciais em `supabaseClient.js`

### PDF sem logo
**Causa:** Caminho da imagem incorreto  
**Solução:** Verificar se `Logo/viva_logo_branco.jpeg` existe

---

**Fim do Guia de Testes**  
**Viva Óptica - O Futuro é Mais Nítido Aqui**
