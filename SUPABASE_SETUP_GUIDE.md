# Guia de Configuração do Supabase - Viva Óptica

## 1. Configuração de Autenticação

### Desativar Confirmação de Email (para desenvolvimento)
1. Vai ao [Supabase Dashboard](https://app.supabase.com)
2. Seleciona o teu projeto
3. Navega para **Authentication** > **Settings**
4. Desfaz o check em **"Enable email confirmations"**
5. Isso permite que admin@vivaoptica.com e javelsoncanzenze7@gmail.com façam login sem confirmar email

### Criar Usuário Admin
```
Email: admin@vivaoptica.com
Password: admin123
```
Ou usa o teu email pessoal:
```
Email: javelsoncanzenze7@gmail.com
Password: [escolhe uma password]
```

Depois de criar o usuário, vai ao SQL Editor e executa:

```sql
-- Adicionar role ao usuário criado
INSERT INTO profiles (id, role)
SELECT auth.uid(), 'admin'
FROM auth.users
WHERE email = 'admin@vivaoptica.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

## 2. Tabelas Necessárias

Cria as seguintes tabelas no **Database** > **Tables**:

### Table: `profiles`
- `id` (uuid, primary key, references auth.users)
- `role` (text, default: 'user')
- `created_at` (timestamp with time zone, default: now())

### Table: `produtos`
- `id` (uuid, primary key)
- `nome` (text)
- `categoria` (text) - valores: 'armacao', 'lente', 'acessorio'
- `preco` (numeric)
- `estoque` (integer)
- `imagem_url` (text)
- `created_at` (timestamp with time zone, default: now())

### Table: `clientes`
- `id` (uuid, primary key)
- `nome` (text)
- `email` (text)
- `contacto` (text)
- `localizacao` (text)
- `created_at` (timestamp with time zone, default: now())

### Table: `vendas`
- `id` (uuid, primary key)
- `cliente_id` (uuid, references clientes)
- `total_valor` (numeric)
- `data_venda` (timestamp with time zone)
- `created_at` (timestamp with time zone, default: now())

### Table: `itens_venda`
- `id` (uuid, primary key)
- `venda_id` (uuid, references vendas)
- `produto_id` (uuid, references produtos)
- `quantidade` (integer)
- `preco_unitario` (numeric)
- `created_at` (timestamp with time zone, default: now())

### Table: `agendamentos`
- `id` (uuid, primary key)
- `cliente_id` (uuid, references clientes)
- `data` (timestamp with time zone)
- `status` (text, default: 'Pendente') - valores: 'Pendente', 'Confirmado', 'Cancelado'
- `created_at` (timestamp with time zone, default: now())

## 3. Supabase Storage

### Criar Bucket para Imagens
1. Vai a **Storage** no Supabase Dashboard
2. Cria um novo bucket chamado: `viva_optica_assets`
3. Define como **Public** (para imagens de produtos)
4. Cria uma pasta chamada `produtos` dentro do bucket

## 4. Row Level Security (RLS) Policies

### profiles
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admin pode ler todos os perfis
CREATE POLICY "Admins podem ler todos os perfis"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Usuários podem ler o seu próprio perfil
CREATE POLICY "Usuários podem ler o seu próprio perfil"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admin pode atualizar perfis
CREATE POLICY "Admins podem atualizar perfis"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### produtos
```sql
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- Todos podem ler produtos
CREATE POLICY "Todos podem ler produtos"
ON produtos FOR SELECT
TO authenticated
USING (true);

-- Apenas admins podem inserir/atualizar/deletar
CREATE POLICY "Admins podem gerir produtos"
ON produtos FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### clientes, vendas, agendamentos
```sql
-- Similar para outras tabelas - apenas admins podem escrever
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerir clientes"
ON clientes FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins podem gerir vendas"
ON vendas FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins podem gerir agendamentos"
ON agendamentos FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Público pode criar agendamentos (se tiveres formulário público)
CREATE POLICY "Público pode criar agendamentos"
ON agendamentos FOR INSERT
TO authenticated
WITH CHECK (true);
```

## 5. Função RPC (já criada no ficheiro supabase-rpc-functions.sql)

Executa no SQL Editor:

```sql
CREATE OR REPLACE FUNCTION decrement_stock(p_id UUID, p_qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE produtos
  SET estoque = estoque - p_qty
  WHERE id = p_id AND estoque >= p_qty;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INTEGER) TO authenticated;
```

## 6. Testar Login

1. Abre `admin/login.html` no teu navegador
2. Tenta login com:
   - Email: `admin@vivaoptica.com`
   - Password: `admin123`
3. Deverias ser redirecionado para o dashboard

Se ainda receberes erro "Email not confirmed", verifica no Supabase Dashboard:
- **Authentication** > **Users** > seleciona o usuário > **Confirm**

---

**Nota:** Se tiveres problemas com o login, verifica os logs no Supabase Dashboard > **Authentication** > **Logs** para ver erros detalhados.
