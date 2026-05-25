# Correção de Login - Viva Óptica

## Problema Identificado
O login com `admin@vivaoptica.com` está a retornar "Email ou palavra-passe incorretos".

## Causas Possíveis

### 1. Usuário não existe no Supabase Auth
**Verificação:**
1. Vai ao Supabase Dashboard
2. Navega para **Authentication** > **Users**
3. Procura por `admin@vivaoptica.com`

**Solução:** Se o usuário não existir, cria-o manualmente:
```
Email: admin@vivaoptica.com
Password: admin123
```

### 2. Usuário não tem perfil na tabela `profiles`
**Verificação:**
1. Vai ao Supabase Dashboard
2. Navega para **Database** > **Tables** > **profiles**
3. Procura por um registro com o ID do usuário

**Solução:** Cria o registro manualmente no SQL Editor:
```sql
-- Primeiro, obtém o ID do usuário
SELECT id FROM auth.users WHERE email = 'admin@vivaoptica.com';

-- Depois, cria o perfil (substitui UUID_DO_USUARIO pelo ID real)
INSERT INTO profiles (id, role)
VALUES ('UUID_DO_USUARIO', 'admin');
```

Ou de forma automática:
```sql
INSERT INTO profiles (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@vivaoptica.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 3. Confirmação de email ativada
**Verificação:**
1. Vai ao Supabase Dashboard
2. **Authentication** > **Settings**
3. Verifica se "Enable email confirmations" está ativado

**Solução:** Desativa a confirmação de email para desenvolvimento:
```
Desativa "Enable email confirmations"
```

Ou confirma o usuário manualmente:
1. **Authentication** > **Users**
2. Seleciona o usuário `admin@vivaoptica.com`
3. Clica em **Confirm**

### 4. RLS bloqueando leitura da tabela `profiles`
**Verificação:**
Abre o console do navegador (F12) e verifica se há erros de RLS.

**Solução:** Cria a policy no SQL Editor:
```sql
-- Enable RLS se não estiver ativado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Cria policy para permitir leitura do próprio perfil
CREATE POLICY "Usuários podem ler o seu próprio perfil"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Cria policy para admins lerem todos os perfis
CREATE POLICY "Admins podem ler todos os perfis"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Passos de Debug

### Passo 1: Verificar se o usuário existe no Auth
```sql
SELECT * FROM auth.users WHERE email = 'admin@vivaoptica.com';
```

### Passo 2: Verificar se o perfil existe
```sql
SELECT * FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@vivaoptica.com');
```

### Passo 3: Verificar logs de autenticação
No Supabase Dashboard:
- **Authentication** > **Logs**
- Procura por erros recentes

### Passo 4: Verificar no console do navegador
1. Abre `admin/login.html`
2. Abre o console (F12)
3. Tenta fazer login
4. Verifica os logs de erro

## Script SQL Completo para Configurar Admin

Executa este script no Supabase SQL Editor:

```sql
-- 1. Cria o perfil de admin se não existir
INSERT INTO profiles (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@vivaoptica.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 2. Cria policies para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ler o seu próprio perfil" ON profiles;
CREATE POLICY "Usuários podem ler o seu próprio perfil"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins podem ler todos os perfis" ON profiles;
CREATE POLICY "Admins podem ler todos os perfis"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins podem atualizar perfis" ON profiles;
CREATE POLICY "Admins podem atualizar perfis"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE 'Perfil de admin configurado com sucesso!';
END $$;
```

## Testar Após Configuração

1. Limpa o cache do navegador (Ctrl+Shift+Delete)
2. Abre `admin/login.html`
3. Tenta login com:
   - Email: `admin@vivaoptica.com`
   - Password: `admin123`
4. Deverias ser redirecionado para o dashboard

Se ainda tiveres problemas, verifica os logs no Supabase Dashboard > Authentication > Logs.
