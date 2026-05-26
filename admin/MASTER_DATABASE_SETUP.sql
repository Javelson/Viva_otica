-- ============================================
-- MASTER DATABASE SETUP - Viva Óptica
-- Versão: 4.0 - Schema Completo e Consolidado
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. TABELA: profiles (Utilizadores do Admin)
-- ============================================
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'admin' NOT NULL CHECK (role IN ('admin', 'superadmin', 'editor', 'viewer')),
  nome TEXT,
  telefone TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Allow authenticated read" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin update" ON public.profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete" ON public.profiles
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 2. TABELA: clientes
-- ============================================
DROP TABLE IF EXISTS public.clientes CASCADE;

CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  contacto TEXT NOT NULL,
  localizacao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.clientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON public.clientes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.clientes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.clientes
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 3. TABELA: produtos (Armações, Lentes, Acessórios)
-- ============================================
DROP TABLE IF EXISTS public.produtos CASCADE;

CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('armacao', 'lente', 'acessorio', 'outro')),
  descricao TEXT,
  preco DECIMAL(12, 2) NOT NULL DEFAULT 0,
  estoque INTEGER NOT NULL DEFAULT 0,
  imagem_url TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.produtos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin insert" ON public.produtos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin update" ON public.produtos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete" ON public.produtos
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 4. TABELA: agendamentos
-- ============================================
DROP TABLE IF EXISTS public.agendamentos CASCADE;

CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  nome_cliente TEXT,
  telefone_cliente TEXT,
  servico TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  status TEXT DEFAULT 'pendente' NOT NULL CHECK (status IN ('pendente', 'concluido', 'cancelado')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.agendamentos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON public.agendamentos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.agendamentos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.agendamentos
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 5. TABELA: vendas
-- ============================================
DROP TABLE IF EXISTS public.vendas CASCADE;

CREATE TABLE public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  total_valor DECIMAL(12, 2) NOT NULL DEFAULT 0,
  data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.vendas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON public.vendas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.vendas
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.vendas
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 6. TABELA: itens_venda
-- ============================================
DROP TABLE IF EXISTS public.itens_venda CASCADE;

CREATE TABLE public.itens_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID REFERENCES public.vendas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(12, 2) NOT NULL DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.itens_venda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.itens_venda
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON public.itens_venda
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.itens_venda
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.itens_venda
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 7. TRIGGER: update_updated_at_column
-- ============================================
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas as tabelas com atualizado_em
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendas_updated_at
  BEFORE UPDATE ON public.vendas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. FUNÇÃO: decrement_stock (RPC para reduzir stock)
-- ============================================
CREATE OR REPLACE FUNCTION public.decrement_stock(p_id UUID, p_qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.produtos
  SET estoque = GREATEST(0, estoque - p_qty)
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. TRIGGER: criar perfil automaticamente ao criar usuário
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, criado_em)
  VALUES (
    NEW.id,
    NEW.email,
    'admin',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 10. SUPABASE STORAGE BUCKET
-- ============================================
-- Nota: O bucket 'viva_optica_assets' deve ser criado manualmente no dashboard
-- ou via API. Aqui está o SQL para policies:

-- Criar bucket (se não existir) - executar no SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('viva_optica_assets', 'viva_optica_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies para storage
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'viva_optica_assets');

CREATE POLICY "Allow authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'viva_optica_assets' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'viva_optica_assets' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'viva_optica_assets' AND
    auth.role() = 'authenticated'
  );

-- ============================================
-- 11. VERIFICAÇÃO FINAL
-- ============================================
SELECT
  'Tabelas criadas:' as info,
  COUNT(*) as quantidade
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

SELECT
  'Políticas RLS:' as info,
  COUNT(*) as quantidade
FROM pg_policies
WHERE schemaname = 'public';

SELECT
  'Triggers:' as info,
  COUNT(*) as quantidade
FROM pg_trigger
WHERE tgrelid IN (
  SELECT oid FROM pg_class WHERE relschema = 'public'
);

-- ============================================
-- MENSAGEM DE SUCESSO
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup concluído com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tabelas criadas:';
  RAISE NOTICE '  - profiles';
  RAISE NOTICE '  - clientes';
  RAISE NOTICE '  - produtos';
  RAISE NOTICE '  - agendamentos';
  RAISE NOTICE '  - vendas';
  RAISE NOTICE '  - itens_venda';
  RAISE NOTICE '';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Criar utilizadores no Supabase Authentication';
  RAISE NOTICE '2. Verificar se os perfis foram criados automaticamente';
  RAISE NOTICE '3. Testar login no painel admin';
END $$;
