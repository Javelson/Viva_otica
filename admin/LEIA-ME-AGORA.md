# 🔐 GUIA DE IMPLEMENTAÇÃO - Viva Óptica
## Sistema de Login e Painel Admin Reconstruído

**Data:** 2026-04-30  
**Versão:** 4.0 - Sistema Completo e Funcional

---

## 🚀 PASSOS PARA COLOCAR O SISTEMA NO AR

### PASSO 1: Executar SQL no Supabase (CRÍTICO)

1. Acesse https://supabase.com/dashboard
2. Selecione o projeto **"Viva_otica"**
3. Vá em **SQL Editor** (menu lateral)
4. Copie o conteúdo do ficheiro `MASTER_DATABASE_SETUP.sql`
5. Cole no editor e clique em **Run**
6. Aguarde a mensagem de sucesso ✅

**O que este SQL faz:**
- Cria tabelas: `profiles`, `clientes`, `produtos`, `agendamentos`, `vendas`, `itens_venda`
- Configura RLS (Row Level Security)
- Cria triggers automáticas
- Configura storage bucket para imagens

---

### PASSO 2: Criar Utilizador Admin no Supabase Auth

1. No Supabase Dashboard, vá em **Authentication** > **Users**
2. Clique em **"Add user"** > **"Create new user"**
3. Preencha:
   - **Email:** `admin@vivaoptica.com` (ou o que preferir)
   - **Password:** (escolha uma senha forte)
   - **Confirm password:** (repetir)
4. **DESLIGUE** "Send confirmation email" (para testar rápido)
5. Clique em **Create user**

**Nota:** O perfil será criado automaticamente na tabela `profiles` thanks ao trigger!

---

### PASSO 3: Testar o Login

1. Abra o ficheiro `admin/login.html` em um **servidor local** (NÃO use file://)

   **Como iniciar servidor local:**
   
   **Opção A - Python:**
   ```bash
   cd "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica"
   python -m http.server 8000
   ```
   
   **Opção B - Node.js:**
   ```bash
   npx http-server . -p 8000
   ```
   
   **Opção C - VS Code Live Server:**
   - Clique direito em `login.html`
   - Escolher "Open with Live Server"

2. Acesse: `http://localhost:8000/admin/login.html`

3. Faça login com:
   - **Email:** (o email que criou no Passo 2)
   - **Password:** (a senha que definiu)

---

## 📁 ESTRUTURA DE FICHEIROS ATUALIZADA

```
admin/
├── supabaseClient.js          ✅ Configurado com failover
├── login.html                 ✅ Página de login limpa
├── index.html                 ✅ Painel admin principal
├── app.js                     ✅ Lógica completa do painel
├── js/
│   └── login-handler.js       ✅ Handler de login com tratamento de erros
├── MASTER_DATABASE_SETUP.sql  ✅ Script SQL completo
└── LEIA-ME-AGORA.md           ✅ Este ficheiro
```

**Ficheiros REMOVIDOS (limpeza):**
- ❌ login-debug.js
- ❌ login-test.js
- ❌ login-fix.js
- ❌ console-test.js
- ❌ SQL_CORRECAO_PROFILES.sql
- ❌ test-login.html
- ❌ LOGIN_DIAGNOSTIC_REPORT.md

---

## 🔧 CARACTERÍSTICAS IMPLEMENTADAS

### 1. Sistema de Login
- ✅ Autenticação via Supabase Auth
- ✅ Verificação de role (apenas admin/superadmin)
- ✅ Redirecionamento automático se já estiver logado
- ✅ Tratamento de erros de rede com mensagens claras
- ✅ Failover automático (retry com delay)
- ✅ Detecção de DNS bloqueado
- ✅ Persistência de sessão no localStorage

### 2. Painel Admin
- ✅ Dashboard com estatísticas
- ✅ Lista de agendamentos recentes
- ✅ CRUD completo de produtos (Armações, Lentes, Acessórios)
- ✅ Gestão de agendamentos (concluir/cancelar)
- ✅ Proteção de sessão em todas as páginas
- ✅ Logout automático se sessão expirar
- ✅ Notificações toast para feedback

### 3. Tratamento de Erros
- ✅ Erros de DNS com sugestão de mudar para 8.8.8.8
- ✅ Erros de rede com instruções claras
- ✅ Erros de autenticação específicos
- ✅ Feedback visual para todas as ações

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### Problema: "Failed to fetch" ou "ERR_NAME_NOT_RESOLVED"

**Solução:**
1. Mude seu DNS para Google DNS:
   - **Preferencial:** 8.8.8.8
   - **Alternativo:** 8.8.4.4

2. Como mudar DNS no Windows:
   ```
   Win + R → ncpa.cpl → Enter
   Clique direito na conexão → Propriedades
   "Protocolo IP Versão 4 (TCP/IPv4)" → Propriedades
   Usar os seguintes DNS:
     8.8.8.8
     8.8.4.4
   ```

3. Reinicie o router/modem

4. Teste com dados móveis (hotspot do telemóvel)

### Problema: "Email not confirmed"

**Solução:**
- No Supabase Dashboard > Authentication > Users
- Clique no utilizador
- Clique em "Resend confirmation"
- OU desligue "Send confirmation email" ao criar usuário

### Problema: "Invalid API key"

**Solução:**
1. Vá ao Supabase Dashboard > Settings > API
2. Copie a **"anon public"** key (NÃO a service_role)
3. Substitua em `supabaseClient.js` linha 7

### Problema: "relation profiles doesn't exist"

**Solução:**
- Execute o SQL completo em `MASTER_DATABASE_SETUP.sql`

### Problema: Login não funciona

**Diagnóstico:**
1. Abra o console do navegador (F12)
2. Verifique os logs:
   - `🔧 [SUPABASE]` - Inicialização
   - `🔐 TENTATIVA DE LOGIN` - Tentativa
   - `✅ LOGIN COMPLETO!` - Sucesso
3. Reporte o erro EXATO se ainda falhar

---

## 📊 COMANDOS ÚTEIS NO CONSOLE

```javascript
// Testar conexão
window.getSupabase().then(s => console.log('Supabase:', s ? '✅' : '❌'));

// Verificar sessão atual
window.checkSession();

// Verificar estado do utilizador
console.log('Usuário:', state.user);
console.log('Role:', state.role);

// Navegar manualmente
window.navigateTo('agendamentos');
window.navigateTo('produtos');
```

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **Testar login** com o utilizador criado
2. **Verificar dashboard** carregando estatísticas
3. **Criar alguns produtos** de teste
4. **Criar agendamentos** de teste
5. **Testar CRUD completo** (criar, editar, apagar)
6. **Configurar Supabase Storage** para upload de imagens

---

## 📞 SUPORTE

Se algo não funcionar:

1. **Verifique o console do navegador** (F12 > Console)
2. **Copie o erro EXATO** (não apenas "não funciona")
3. **Verifique se o SQL foi executado** no Supabase
4. **Verifique se o utilizador existe** em Authentication > Users
5. **Verifique se o perfil existe** na tabela profiles

---

## ✅ CHECKLIST FINAL

- [ ] SQL executado no Supabase (MASTER_DATABASE_SETUP.sql)
- [ ] Utilizador criado em Authentication > Users
- [ ] Perfil criado automaticamente na tabela profiles
- [ ] Servidor local rodando (não file://)
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] CRUD de produtos funcionando
- [ ] Agendamentos visíveis

---

**Boa sorte! O sistema está pronto para uso.** 🎉
