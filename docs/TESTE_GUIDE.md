# 🧪 Guia de Testes - Painel Administrativo Viva Óptica

**Data:** 2026-05-07  
**Versão:** 8.0

---

## 📋 Pré-Requisitos

### 1. **Configurar Variáveis de Ambiente**

```bash
# O ficheiro .env já foi criado a partir do .env.example
# Verifique se contém:

SUPABASE_URL=https://ppvdqrhhcmeqssazgpnd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **Verificação:**
```bash
cat .env
```

---

### 2. **Executar Schema no Supabase**

1. Acesse: https://supabase.com/dashboard/project/ppvdqrhhcmeqssazgpnd
2. Vá para **SQL Editor**
3. Copie todo o conteúdo de `database/schema.sql`
4. Cole no editor e clique em **RUN**

✅ **Verificação - Tabelas devem existir:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Resultado esperado:**
```
profiles
produtos
slideshow
configuracoes_loja
clientes
agendamentos
```

---

### 3. **Iniciar Servidor Local**

**Opção A: Python (recomendado)**
```bash
cd viva-optica
python -m http.server 8000
```

**Opção B: Node.js**
```bash
cd viva-optica
npx http-server -p 8000
```

**Opção C: VS Code Live Server**
- Instale extensão "Live Server"
- Clique direito em `admin/index.html` → "Open with Live Server"

✅ **Verificação:**
- Acesse http://localhost:8000
- Deve ver a homepage da Viva Óptica

---

## 🧪 Cenários de Teste

### **CENÁRIO 1: Login Admin**

**Objetivo:** Validar autenticação

**Passos:**
1. Acesse http://localhost:8000/admin/login.html
2. Insira email e senha de admin
3. Clique em "Entrar"

**Resultado Esperado:**
- ✅ Redireciona para `admin/index.html`
- ✅ Dashboard carrega com estatísticas
- ✅ Sidebar mostra menu completo

**Falha Possível:**
- ❌ "Erro de conexão" → Verifique DNS (8.8.8.8)
- ❌ "Credenciais inválidas" → Verifique email/senha no Supabase Auth

---

### **CENÁRIO 2: Criar Agendamento**

**Objetivo:** Testar CREATE de agendamentos

**Passos:**
1. No dashboard, clique em **"Novo Agendamento"**
2. Preencha:
   - Nome: João Silva
   - Telefone: 923456789
   - Data: 2026-05-10
   - Hora: 14:30
   - Serviço: Consulta de Optometria
3. Clique em **"Salvar Agendamento"**

**Resultado Esperado:**
- ✅ Modal fecha
- ✅ Toast verde: "Agendamento criado com sucesso!"
- ✅ Agendamento aparece na lista
- ✅ Contador "Pendentes" aumenta +1

**Verificação no Banco:**
```sql
SELECT * FROM agendamentos 
WHERE nome_cliente = 'João Silva' 
ORDER BY criado_em DESC 
LIMIT 1;
```

---

### **CENÁRIO 3: Filtrar Agendamentos**

**Objetivo:** Testar busca/filtro

**Passos:**
1. Na seção "Agendamentos", digite "João" no campo de busca
2. Pressione Enter ou clique na lupa

**Resultado Esperado:**
- ✅ Apenas agendamentos com "João" aparecem
- ✅ Contador atualiza para número filtrado

---

### **CENÁRIO 4: Atualizar Status de Agendamento**

**Objetivo:** Testar UPDATE

**Passos:**
1. Encontre um agendamento pendente
2. Clique no botão **"Concluir"** (verde)

**Resultado Esperado:**
- ✅ Status muda para "Concluído" (badge verde)
- ✅ Toast: "Status atualizado!"
- ✅ Contador "Pendentes" diminui -1
- ✅ Contador "Concluídos" aumenta +1

---

### **CENÁRIO 5: Cancelar Agendamento**

**Objetivo:** Testar soft delete

**Passos:**
1. Encontre um agendamento pendente
2. Clique no botão **"Cancelar"** (vermelho)

**Resultado Esperado:**
- ✅ Status muda para "Cancelado" (badge vermelha)
- ✅ Toast: "Agendamento cancelado"
- ✅ Agendamento ainda existe no banco (status = 'cancelado')

---

### **CENÁRIO 6: Eliminar Agendamento Permanentemente**

**Objetivo:** Testar DELETE

**Passos:**
1. Encontre um agendamento
2. Clique no botão **"Eliminar"** (ícone de lixeira)
3. Confirme no diálogo: "Tem certeza?"

**Resultado Esperado:**
- ✅ Agendamento some da lista
- ✅ Toast: "Agendamento eliminado"
- ✅ Contadores atualizam

**Verificação no Banco:**
```sql
SELECT * FROM agendamentos WHERE id = 'ID_DO_AGENDAMENTO';
-- Deve retornar 0 linhas
```

---

### **CENÁRIO 7: Adicionar Produto (Armação)**

**Objetivo:** Testar CREATE de produtos

**Passos:**
1. Navegue para seção **"Produtos"**
2. Selecione categoria: **"Armações"**
3. Clique em **"Adicionar Armação"**
4. Preencha:
   - Nome: Ray-Ban Classic
   - Preço: 45000
   - Estoque: 10
5. Clique em **"Salvar Produto"**

**Resultado Esperado:**
- ✅ Modal fecha
- ✅ Toast: "Produto criado com sucesso!"
- ✅ Produto aparece na tabela
- ✅ Badge de estoque mostra "10" (verde)

---

### **CENÁRIO 8: Editar Produto**

**Objetivo:** Testar UPDATE de produtos

**Passos:**
1. Na lista de produtos, encontre "Ray-Ban Classic"
2. Clique no botão **"Editar"** (ícone de lápis)
3. Altere preço para: 48000
4. Clique em **"Atualizar Produto"**

**Resultado Esperado:**
- ✅ Preço atualizado para 48000 Kz
- ✅ Toast: "Produto atualizado!"

---

### **CENÁRIO 9: Filtrar Produtos**

**Objetivo:** Testar busca de produtos

**Passos:**
1. Na seção de produtos, digite "Ray-Ban" no campo de busca
2. Pressione Enter

**Resultado Esperado:**
- ✅ Apenas produtos com "Ray-Ban" aparecem
- ✅ Contador atualiza

---

### **CENÁRIO 10: Eliminar Produto**

**Objetivo:** Testar DELETE de produtos

**Passos:**
1. Encontre um produto
2. Clique em **"Eliminar"** (lixeira)
3. Confirme: "Tem certeza?"

**Resultado Esperado:**
- ✅ Produto some da tabela
- ✅ Toast: "Produto eliminado"

**Verificação no Banco:**
```sql
SELECT * FROM produtos WHERE nome = 'Ray-Ban Classic';
-- Deve retornar 0 linhas (ou ativo = false se soft delete)
```

---

### **CENÁRIO 11: Loading States**

**Objetivo:** Validar feedback visual durante operações

**Passos:**
1. Clique em "Novo Agendamento"
2. Preencha o formulário rapidamente
3. Clique em "Salvar"

**Resultado Esperado:**
- ✅ Overlay cinza aparece sobre a tela
- ✅ Spinner azul gira no centro
- ✅ Texto: "Processando..."
- ✅ Formulário fica desabilitado durante operação

---

### **CENÁRIO 12: Tratamento de Erros**

**Objetivo:** Validar mensagens de erro

**Passos:**
1. Desligue sua internet
2. Tente criar um agendamento

**Resultado Esperado:**
- ✅ Alerta vermelho no topo: "Sem conexão com a internet"
- ✅ Sugestão: "Verifique sua conexão"

**Ou:**
1. Insira preço negativo (-100)
2. Tente salvar

**Resultado Esperado:**
- ✅ Toast vermelho: "Preço não pode ser negativo"

---

## 📊 Checklist de Testes

### **Funcionalidades MVP**

| Teste | Status | Observações |
|-------|--------|-------------|
| Login Admin | ⬜ | |
| Dashboard carrega | ⬜ | |
| Criar Agendamento | ⬜ | |
| Listar Agendamentos | ⬜ | |
| Filtrar Agendamentos | ⬜ | |
| Concluir Agendamento | ⬜ | |
| Cancelar Agendamento | ⬜ | |
| Eliminar Agendamento | ⬜ | |
| Criar Produto | ⬜ | |
| Editar Produto | ⬜ | |
| Filtrar Produtos | ⬜ | |
| Eliminar Produto | ⬜ | |
| Loading States | ⬜ | |
| Toast Notifications | ⬜ | |
| Tratamento de Erros | ⬜ | |

---

## 🔍 Console Logs para Debug

Se algo não funcionar, abra o **Console do Browser** (F12) e verifique:

### **Logs de Sucesso:**
```
✅ [SUPABASE] Instância criada
✅ [SUPABASE] Conexão estabelecida
✅ Agendamento criado com sucesso!
✅ Produto atualizado!
```

### **Logs de Erro Comuns:**

**1. Erro de Conexão:**
```
❌ [SUPABASE] Erro de rede - Verifique DNS e firewall
📋 SOLUÇÃO: Mude seu DNS para 8.8.8.8
```
**Solução:** Alterar DNS para Google DNS

**2. Tabela Não Existe:**
```
❌ Erro: relation "agendamentos" does not exist
```
**Solução:** Executar `database/schema.sql` no Supabase

**3. Permissão Negada:**
```
❌ new row violates row-level-security policy
```
**Solução:** Verificar RLS policies no Supabase

**4. Função Não Exportada:**
```
❌ showManualAppointmentForm is not defined
```
**Solução:** Verificar se `app.js` foi carregado corretamente

---

## 🎯 Critérios de Aceitação

O painel está **100% funcional** quando:

- ✅ Todos os 15 testes acima passam
- ✅ Nenhum erro no Console do Browser
- ✅ Todas as operações CRUD funcionam
- ✅ Loading states aparecem corretamente
- ✅ Toast notifications mostram mensagens adequadas
- ✅ Erros são tratados com mensagens claras

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique logs no Console (F12)
2. Consulte `docs/PENDENCIAS_TECHNICAS.md`
3. Verifique se `database/schema.sql` foi executado
4. Confirme que `.env` está configurado

---

**Última atualização:** 2026-05-07  
**Responsável:** OpenClaude - Senior Full-Stack Developer
