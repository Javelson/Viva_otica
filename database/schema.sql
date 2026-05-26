-- ============================================
-- SCHEMA PRINCIPAL - Viva Óptica
-- Versão: 1.0
-- Data: 2026-05-07
-- Descrição: Schema consolidado do Supabase
-- ============================================

-- ============================================
-- SEÇÃO 1: DROP TABELAS EXISTENTES (ORDEM CORRETA)
-- ============================================
-- Drop em ordem inversa (filhos primeiro para evitar FK conflicts)
DROP TABLE IF EXISTS public.itens_venda CASCADE;
DROP TABLE IF EXISTS public.vendas CASCADE;
DROP TABLE IF EXISTS public.agendamentos CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE;
DROP TABLE IF EXISTS public.configuracoes_loja CASCADE;
DROP TABLE IF EXISTS public.slideshow CASCADE;
DROP TABLE IF EXISTS public.produtos CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================
-- SEÇÃO 2: TABELA PROFILES (CRÍTICA PARA LOGIN)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  email VARCHAR(255),
  nome VARCHAR(255),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ============================================
-- SEÇÃO 3: TABELAS PRINCIPAIS
-- ============================================

-- Produtos
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  preco DECIMAL(12,2) NOT NULL,
  categoria VARCHAR(100),
  imagem_url TEXT,
  estoque INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slideshow
CREATE TABLE public.slideshow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  subtitulo TEXT,
  imagem_url TEXT NOT NULL,
  link VARCHAR(500),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações da Loja
CREATE TABLE public.configuracoes_loja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  tipo VARCHAR(50) DEFAULT 'texto',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(50),
  endereco TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agendamentos
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  servico VARCHAR(255) NOT NULL,
  observacoes TEXT,
  status VARCHAR(50) DEFAULT 'pendente',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendas
CREATE TABLE public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  total DECIMAL(12,2) NOT NULL,
  data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  forma_pagamento VARCHAR(50),
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itens de Venda
CREATE TABLE public.itens_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID REFERENCES public.vendas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SEÇÃO 4: TRIGGERS PARA atualizado_em
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_produtos_updated_at ON public.produtos;
CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_configuracoes_updated_at ON public.configuracoes_loja;
CREATE TRIGGER update_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes_loja
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEÇÃO 5: HABILITAR RLS
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slideshow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_loja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_venda ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SEÇÃO 6: POLÍTICAS RLS - PROFILES
-- ============================================
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
CREATE POLICY "Admin full access profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles
  FOR SELECT USING (true);

-- ============================================
-- SEÇÃO 7: POLÍTICAS RLS - PRODUTOS
-- ============================================
DROP POLICY IF EXISTS "Admin full access produtos" ON public.produtos;
CREATE POLICY "Admin full access produtos" ON public.produtos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Public read produtos" ON public.produtos;
CREATE POLICY "Public read produtos" ON public.produtos
  FOR SELECT USING (ativo = true);

-- ============================================
-- SEÇÃO 8: POLÍTICAS RLS - SLIDESHOW
-- ============================================
DROP POLICY IF EXISTS "Admin full access slideshow" ON public.slideshow;
CREATE POLICY "Admin full access slideshow" ON public.slideshow
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Public read slideshow" ON public.slideshow;
CREATE POLICY "Public read slideshow" ON public.slideshow
  FOR SELECT USING (ativo = true);

-- ============================================
-- SEÇÃO 9: POLÍTICAS RLS - CONFIGURACOES
-- ============================================
DROP POLICY IF EXISTS "Admin full access configuracoes" ON public.configuracoes_loja;
CREATE POLICY "Admin full access configuracoes" ON public.configuracoes_loja
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Public read configuracoes" ON public.configuracoes_loja;
CREATE POLICY "Public read configuracoes" ON public.configuracoes_loja
  FOR SELECT USING (true);

-- ============================================
-- SEÇÃO 10: POLÍTICAS RLS - CLIENTES, AGENDAMENTOS, VENDAS
-- ============================================
DROP POLICY IF EXISTS "Admin full access clientes" ON public.clientes;
CREATE POLICY "Admin full access clientes" ON public.clientes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin full access agendamentos" ON public.agendamentos;
CREATE POLICY "Admin full access agendamentos" ON public.agendamentos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Permitir que qualquer pessoa possa CREATE agendamentos (formulário público)
DROP POLICY IF EXISTS "Public create agendamentos" ON public.agendamentos;
CREATE POLICY "Public create agendamentos" ON public.agendamentos
  FOR INSERT WITH CHECK (true);

-- Permitir que qualquer pessoa possa SELECT agendamentos com status='pendente' (para confirmação pública)
DROP POLICY IF EXISTS "Public read pendente agendamentos" ON public.agendamentos;
CREATE POLICY "Public read pendente agendamentos" ON public.agendamentos
  FOR SELECT USING (status = 'pendente');

DROP POLICY IF EXISTS "Admin full access vendas" ON public.vendas;
CREATE POLICY "Admin full access vendas" ON public.vendas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin full access itens_venda" ON public.itens_venda;
CREATE POLICY "Admin full access itens_venda" ON public.itens_venda
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SEÇÃO 11: DADOS INICIAIS
-- ============================================
INSERT INTO public.configuracoes_loja (chave, valor, tipo) VALUES
  ('nome_loja', 'Viva Óptica', 'texto'),
  ('slogan', 'O Futuro é Mais Nítido Aqui', 'texto'),
  ('telefone', '+244 923 456 789', 'texto'),
  ('email_contato', 'contato@vivaoptica.ao', 'texto'),
  ('endereco', 'Luanda, Angola', 'texto')
ON CONFLICT (chave) DO UPDATE SET
  valor = EXCLUDED.valor,
  atualizado_em = NOW();

-- ============================================
-- SEÇÃO 12: VERIFICAÇÃO FINAL
-- ============================================
SELECT
  '=== RESULTADO FINAL ===' as etapa,
  COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

SELECT '✅ SCHEMA CONCLUÍDO!' as resultado;
