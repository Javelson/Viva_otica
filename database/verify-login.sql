-- ============================================
-- VERIFICAÇÃO E CORREÇÃO DE LOGIN - Viva Óptica
-- Execute este script no Supabase SQL Editor
-- ============================================

-- 1. Verificar se tabela profiles existe
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
        THEN '✅ Tabela profiles existe'
        ELSE '❌ Tabela profiles NÃO existe'
    END as verifica_profiles;

-- 2. Verificar usuários existentes
SELECT
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
    COUNT(CASE WHEN role = 'superadmin' THEN 1 END) as total_superadmins
FROM public.profiles;

-- 3. Listar todos os usuários com role
SELECT
    p.id,
    p.email,
    p.role,
    p.nome,
    au.email as auth_email,
    au.created_at as auth_created
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;

-- 4. Verificar se RLS está ativado
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'produtos', 'clientes', 'agendamentos')
ORDER BY tablename;

-- 5. Verificar políticas RLS da tabela profiles
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- ============================================
-- SE NÃO HOUVER USUÁRIOS ADMIN, EXECUTE ISSO:
-- ============================================
-- Substitua 'admin@vivaoptica.com' e 'sua_senha_aqui' pelos seus valores
-- NOTA: Após criar, você pode alterar a senha no Supabase Dashboard

/*
-- Criar usuário admin de emergência
DO $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Verificar se já existe
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE role IN ('admin', 'superadmin')
    ) THEN
        -- Criar usuário no auth
        INSERT INTO auth.users (
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            'admin@vivaoptica.com',
            crypt('sua_senha_aqui', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            NOW(),
            NOW(),
            'authenticated'
        ) RETURNING id INTO new_user_id;

        -- Criar perfil
        INSERT INTO public.profiles (id, email, role, nome)
        VALUES (new_user_id, 'admin@vivaoptica.com', 'admin', 'Administrador');

        RAISE NOTICE '✅ Usuário admin criado com sucesso!';
    ELSE
        RAISE NOTICE 'ℹ️ Já existem usuários admin no sistema';
    END IF;
END $$;
*/

-- 6. Alternativa mais simples - Usar Supabase Auth (RECOMENDADO)
-- Em vez do script acima, use o Dashboard do Supabase:
-- 1. Vá para Authentication → Users
-- 2. Clique em "Add user" → "Create new user"
-- 3. Preencha email e senha
-- 4. Desmarque "Confirm user" para criar manualmente
-- 5. Depois execute este SQL para criar o perfil:

/*
-- Substitua pelo ID do usuário criado no passo anterior
INSERT INTO public.profiles (id, email, role, nome)
VALUES ('UUID_DO_USUARIO_AQUI', 'admin@vivaoptica.com', 'admin', 'Administrador');
*/

SELECT '✅ Verificação concluída! Use os resultados acima para diagnosticar.' as resultado;
