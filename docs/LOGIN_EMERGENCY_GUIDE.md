# 🔧 Guia de Emergência - Problemas de Login

**Data:** 2026-05-07  
**Para:** Resolver problema "não consigo fazer login"

---

## 🚨 Diagnóstico Rápido

### **Passo 1: Acessar Ferramenta de Diagnóstico**

1. Inicie um servidor local:
```bash
cd viva-optica
python -m http.server 8000
```

2. Acesse: **http://localhost:8000/admin/test-login.html**

Esta ferramenta vai mostrar:
- ✅ Se Supabase está conectado
- ✅ Se tabelas existem
- ✅ Se existem usuários admin
- ✅ Se login funciona

---

### **Passo 2: Verificar Logs no Browser**

1. Abra o Console do Browser (F12)
2. Acesse http://localhost:8000/admin/login.html
3. Tente fazer login
4. Verifique os logs no Console

**Logs esperados:**
```
🔐 [LOGIN] Inicializando...
✅ [LOGIN] Supabase pronto
🔐 [LOGIN] Tentando autenticação...
✅ [LOGIN] Sucesso! User: admin@vivaoptica.com
✅ [LOGIN] Role: admin
✅ [LOGIN] Redirecionando para dashboard...
```

**Logs de erro comuns:**

#### **Erro 1: "Invalid login credentials"**
```
❌ [LOGIN] Erro: Invalid login credentials
```
**Causa:** Email ou senha incorretos  
**Solução:** 
- Verifique se o usuário existe no Supabase
- Crie um novo usuário se necessário (veja Passo 3)

#### **Erro 2: "Failed to fetch" / "network error"**
```
❌ Erro de conexão com o Supabase
```
**Causa:** Problema de DNS ou firewall  
**Solução:**
```bash
# Mude seu DNS para Google DNS:
# Windows: Painel de Controle → Rede → Alterar DNS
# DNS 1: 8.8.8.8
# DNS 2: 8.8.4.4
```

#### **Erro 3: "relation 'profiles' does not exist"**
```
❌ Erro: relation "profiles" does not exist
```
**Causa:** Schema não foi executado  
**Solução:** Execute `database/schema.sql` no Supabase SQL Editor

#### **Erro 4: "Acesso negado"**
```
❌ [LOGIN] Acesso negado
```
**Causa:** Usuário não tem role 'admin' ou 'superadmin'  
**Solução:** Atualize o role no Supabase (veja Passo 4)

---

### **Passo 3: Criar Usuário Admin (Se Necessário)**

#### **Método A: Usando o Dashboard do Supabase (RECOMENDADO)**

1. Acesse: https://supabase.com/dashboard/project/ppvdqrhhcmeqssazgpnd
2. Vá para **Authentication → Users**
3. Clique em **"Add user"** → **"Create new user"**
4. Preencha:
   - Email: `admin@vivaoptica.com` (ou seu email)
   - Password: (escolha uma senha forte)
   - **DESMARQUE** "Confirm user"
5. Clique em **"Create"**

6. Agora crie o perfil no banco de dados:
   - Vá para **SQL Editor**
   - Execute este SQL (substitua pelo UUID do usuário criado):

```sql
-- Primeiro, obtenha o UUID do usuário criado
SELECT id, email FROM auth.users WHERE email = 'admin@vivaoptica.com';

-- Copie o UUID e execute:
INSERT INTO public.profiles (id, email, role, nome)
VALUES ('COLE_O_UUID_AQUI', 'admin@vivaoptica.com', 'admin', 'Administrador');
```

#### **Método B: Usando Ferramenta de Teste**

1. Acesse: http://localhost:8000/admin/test-login.html
2. Preencha o formulário "Criar Usuário Admin"
3. Clique em **"Criar Usuário Admin"**
4. Verifique os logs para confirmar sucesso

---

### **Passo 4: Verificar/Atualizar Role do Usuário**

Se o usuário existe mas não consegue login:

1. Acesse Supabase Dashboard
2. Vá para **Table Editor → profiles**
3. Encontre seu usuário
4. Verifique a coluna `role`
5. Deve ser: `admin` ou `superadmin`

**Se estiver errado, atualize:**
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@vivaoptica.com';
```

---

### **Passo 5: Verificar Políticas RLS**

Se tudo mais falhar, verifique se as políticas RLS estão corretas:

```sql
-- No Supabase SQL Editor, execute:
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Políticas esperadas:**
1. "Admin full access profiles" - Permite ALL para admins
2. "Public read profiles" - Permite SELECT para todos

**Se faltarem, execute:**
```sql
-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar política para admin
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
CREATE POLICY "Admin full access profiles" ON public.profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Criar política para leitura pública
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles
FOR SELECT USING (true);
```

---

## 📋 Checklist de Verificação

Marque cada item que você verificou:

- [ ] Servidor local está rodando (não funciona com file://)
- [ ] `.env` foi criado e contém credenciais corretas
- [ ] `database/schema.sql` foi executado no Supabase
- [ ] Tabela `profiles` existe no Supabase
- [ ] Usuário admin existe em **Authentication → Users**
- [ ] Perfil existe na tabela `profiles` com role = 'admin'
- [ ] Políticas RLS estão configuradas corretamente
- [ ] DNS está configurado (8.8.8.8 se necessário)
- [ ] Console do browser não mostra erros de conexão

---

## 🔍 Comandos Úteis no Supabase SQL Editor

### **Verificar usuários:**
```sql
SELECT 
    p.id,
    p.email,
    p.role,
    p.nome,
    au.created_at as criado_em
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;
```

### **Verificar se RLS está ativo:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### **Criar usuário admin manualmente (último recurso):**
```sql
-- Isso cria um usuário SEM confirmação de email
INSERT INTO auth.users (
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin@vivaoptica.com',
    crypt('sua_senha_segura', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
) RETURNING id;

-- Use o ID retornado para criar o perfil:
-- INSERT INTO public.profiles (id, email, role, nome)
-- VALUES ('ID_RETORNADO', 'admin@vivaoptica.com', 'admin', 'Administrador');
```

---

## 📞 Suporte

Se nada funcionar:

1. **Verifique logs completos:**
   - Console do browser (F12 → Console)
   - Network tab (F12 → Network → Verifique requisições ao Supabase)

2. **Teste conexão direta:**
   - Acesse https://supabase.com/dashboard/project/ppvdqrhhcmeqssazgpnd
   - Verifique se consegue acessar Authentication e Table Editor

3. **Verifique credenciais:**
   - `.env` tem `SUPABASE_URL` correto?
   - `.env` tem `SUPABASE_ANON_KEY` correto?

4. **Contate:**
   - Email: contato@vivaoptica.ao
   - Ou abra um issue no GitHub

---

## ✅ Após Resolver

Depois de conseguir fazer login:

1. ✅ Teste criar um novo agendamento
2. ✅ Teste criar um novo produto
3. ✅ Teste editar/excluir registros
4. ✅ Verifique se loading states aparecem
5. ✅ Confirme que toast notifications funcionam

Se tudo funcionar → **Sistema pronto para produção!** 🎉

---

**Última atualização:** 2026-05-07  
**Responsável:** OpenClaude - Senior Full-Stack Developer
