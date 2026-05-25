# 🔧 Correção Definitiva de Login - Viva Óptica

## Problemas Identificados e Corrigidos

### 1. ❌ **Credenciais Erradas no Supabase**
**Problema:** O `supabaseClient.js` estava usando as credenciais do projeto errado:
- **Antes:** `ppvdqrhhcmeqssazgpnd` (projeto antigo)
- **Depois:** `hbcjjhmdgftgzrlmqfxk` (projeto correto - Viva_otica)

**Correção Aplicada:** ✅ Ficheiro `admin/supabaseClient.js` atualizado

---

### 2. ❌ **Logo Quebrado**
**Problema:** Caminho do logo incorreto (`Logo/viva_logo_branco.jpeg`)

**Correção Aplicada:** ✅ Alterado para `../Logo/viva_logo_branco.jpeg`
- O logo agora carrega corretamente
- Adicionado fallback para placeholder caso falhe

---

### 3. ❌ **Sistema de Login sem Diagnóstico**
**Problema:** Erros genéricos sem detalhes técnicos

**Correção Aplicada:** ✅ Sistema completo de logging implementado:
- Logs detalhados no console (F12) para cada etapa
- Mensagens de erro específicas para cada tipo de problema
- Verificação de cada componente (URL, Key, Client, Profile)

---

## 🚀 Passos para Resolver o Login

### **PASSO 1: Execute o Script SQL no Supabase**

1. Acesse: https://supabase.com
2. Selecione o projeto: **Viva_otica**
3. Vá para: **SQL Editor** (menu lateral esquerdo)
4. Copie e cole o conteúdo de: `fix-login-complete.sql`
5. Clique em **Run** (Executar)

**O que este script faz:**
- ✅ Verifica se o utilizador existe no Auth
- ✅ Cria a tabela `profiles` se não existir
- ✅ Cria/atualiza seu perfil como `admin`
- ✅ Configura RLS policies corretamente
- ✅ Mostra o status final do acesso

---

### **PASSO 2: Verifique se o Email está Confirmado**

No resultado do script SQL, procure por:
```
✅ Email confirmado
```

Se aparecer:
```
❌ Email NÃO confirmado
```

**Solução:**
1. Verifique sua caixa de entrada (e spam)
2. Clique no link de confirmação do Supabase
3. OU execute esta query no SQL Editor:

```sql
UPDATE auth.users
SET confirmed_at = NOW(),
    email_confirmed_at = NOW()
WHERE email = 'javelsoncanzenze7@gmail.com'
AND confirmed_at IS NULL;
```

---

### **PASSO 3: Teste a Conexão**

1. Acesse: `admin/test-connection.html`
2. Verifique se todos os testes estão verdes (✅)
3. Se houver erros vermelhos (❌), siga as sugestões

---

### **PASSO 4: Faça Login**

1. Acesse: `admin/login.html`
2. Email: `javelsoncanzenze7@gmail.com`
3. Palavra-passe: (sua palavra-passe)
4. **IMPORTANTE:** Abra o console (F12) antes de clicar em "Aceder"

**O que você deve ver no console:**
```
🚀 Página de login carregada
🔐 TENTATIVA DE LOGIN
📧 Email: javelsoncanzenze7@gmail.com
🌐 Supabase URL: https://hbcjjhmdgftgzrlmqfxk.supabase.co
🔑 Supabase Key: Presente (eyJhbGciOiJIUzI1NiIs...
📦 Supabase client: Inicializado
🔄 A chamar supabase.auth.signInWithPassword...
✅ AUTENTICAÇÃO BEM-SUCEDIDA!
📋 A verificar perfil na tabela profiles...
📊 Perfil consultado: {role: 'admin', ...}
✅ ROLE VERIFICADA: admin
💾 Salvando dados no localStorage...
✅ Dados salvos: Sim
🚀 Redirecionando para dashboard...
✅ LOGIN COMPLETO COM SUCESSO!
```

---

## 🐛 Diagnóstico de Erros

### Erro: "Email ou palavra-passe incorretos"
**Causa:** Credenciais erradas ou utilizador não existe
**Solução:**
```sql
-- Verifique se o utilizador existe
SELECT id, email, confirmed_at FROM auth.users
WHERE email = 'javelsoncanzenze7@gmail.com';
```

### Erro: "Email não confirmado"
**Causa:** Email não foi confirmado
**Solução:** Execute a query de confirmação manual (Passo 2)

### Erro: "Perfil não encontrado"
**Causa:** Tabela `profiles` não existe ou não tem seu registro
**Solução:** Execute o script `fix-login-complete.sql` novamente

### Erro: "Supabase não inicializado"
**Causa:** Credenciais erradas ou SDK não carregado
**Solução:**
1. Verifique `admin/supabaseClient.js`
2. Confirme que as credenciais são do projeto `hbcjjhmdgftgzrlmqfxk`
3. Verifique se `supabaseClient.js` está incluído no `login.html`

### Erro: "Acesso negado - Role não é admin"
**Causa:** Perfil existe mas role não é 'admin'
**Solução:**
```sql
UPDATE profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'javelsoncanzenze7@gmail.com');
```

---

## 📋 Verificação Final

Após todas as correções, execute esta query para confirmar tudo está OK:

```sql
SELECT
  u.email,
  u.confirmed_at IS NOT NULL as email_confirmed,
  p.role,
  CASE
    WHEN p.role = 'admin' AND u.confirmed_at IS NOT NULL THEN '✅ ACESSO PERMITIDO'
    ELSE '❌ PROBLEMA DETECTADO'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'javelsoncanzenze7@gmail.com';
```

**Resultado esperado:**
```
email                          | email_confirmed | role  | status
-------------------------------|-----------------|-------|------------------
javelsoncanzenze7@gmail.com    | true            | admin | ✅ ACESSO PERMITIDO
```

---

## 📞 Ficheiros Modificados/Criados

| Ficheiro | Status | Descrição |
|----------|--------|-----------|
| `admin/supabaseClient.js` | ✅ Atualizado | Credenciais corrigidas para projeto correto |
| `admin/login.html` | ✅ Atualizado | Logo fixo + diagnóstico detalhado |
| `fix-login-complete.sql` | ✅ Criado | Script SQL completo de correção |
| `admin/test-connection.html` | ✅ Criado | Página de teste de conexão |
| `LOGIN_FIX_INSTRUCTIONS.md` | ✅ Criado | Este ficheiro de instruções |

---

## 💡 Dicas de Debug

1. **Sempre abra o console (F12)** quando for fazer login
2. **Copie os logs** e guarde para referência
3. **Execute `test-connection.html`** antes de tentar login
4. **Verifique o SQL Editor** no Supabase para logs de erro do banco

---

## ✅ Checklist de Resolução

- [ ] Executei `fix-login-complete.sql` no Supabase
- [ ] Confirmei que o email está confirmado
- [ ] Testei a conexão em `admin/test-connection.html`
- [ ] Abri o console (F12) antes de fazer login
- [ ] Todos os logs verdes no console
- [ ] Login foi bem-sucedido e redirecionou para dashboard

---

**Última atualização:** 2026-04-30
**Versão:** 2.0 - Correção Completa
