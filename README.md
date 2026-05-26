# Viva Óptica - Sistema de Gestão

> **O Futuro é Mais Nítido Aqui**

Sistema web de gestão para clínica e loja de óculos, com agendamentos, CRM, estoque e orçamentos.

---

## 🚀 Tecnologias

- **Frontend**: HTML5, JavaScript (ES6+), Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estilo**: Tailwind CSS via CDN
- **Ícones**: Font Awesome 6
- **Animações**: AOS Library

---

## 📁 Estrutura do Projeto

```
viva-optica/
├── config/
│   └── supabase.js          # Cliente Supabase centralizado
├── database/
│   └── schema.sql           # Schema completo do banco de dados
├── public/
│   ├── img/                 # Imagens (logo, slides, produtos)
│   └── icons/               # Favicon e ícones
├── src/
│   ├── pages/               # Páginas HTML
│   │   ├── index.html       # Homepage
│   │   ├── agendamento.html # Agendamento online
│   │   ├── admin/           # Painel administrativo
│   │   └── cliente/         # Páginas públicas
│   ├── js/                  # JavaScript modular
│   │   ├── utils/           # Funções utilitárias
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── services/        # Serviços API
│   │   └── admin/           # Lógica do admin
│   └── css/                 # Estilos personalizados
├── .env.example             # Template de variáveis de ambiente
├── .gitignore              # Git ignore configurado
└── README.md               # Este arquivo
```

---

## ⚙️ Configuração Inicial

### 1. Clone o repositório

```bash
git clone <repo-url>
cd viva-optica
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais do Supabase:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
```

### 3. Configure o banco de dados

Execute o script SQL no Supabase SQL Editor:

```bash
# Abra database/schema.sql no editor SQL do Supabase
# Execute todo o script
```

### 4. Inicie um servidor local

**Opção A: VS Code Live Server**
- Instale a extensão "Live Server"
- Clique direito em `index.html` → "Open with Live Server"

**Opção B: Python**
```bash
python -m http.server 8000
```

**Opção C: Node.js**
```bash
npx http-server -p 8000
```

---

## 📊 Banco de Dados

### Tabelas Principais

- **profiles** - Perfis de usuário (admin, superadmin)
- **produtos** - Catálogo de armações, lentes e acessórios
- **clientes** - Cadastro de clientes
- **agendamentos** - Agendamentos de consultas
- **vendas** - Histórico de vendas
- **slideshow** - Slideshow da homepage
- **configuracoes_loja** - Configurações globais

### Políticas RLS

Todas as tabelas têm Row Level Security ativado:
- **Admin**: Acesso completo (CRUD)
- **Público**: Apenas leitura de dados ativos

---

## 🎨 Páginas do Sistema

### Públicas
- **Homepage** (`index.html`) - Apresentação da clínica
- **Agendamento** (`agendamento.html`) - Formulário online
- **Armações** (`cliente/armacoes.html`) - Catálogo
- **Produtos** (`cliente/produtos.html`) - Todos produtos
- **Serviços** (`cliente/servicos.html`) - Lista de serviços
- **Sobre** (`cliente/sobre.html`) - Informações da clínica
- **Contato** (`cliente/contacto.html`) - Formulário de contato

### Administrativas
- **Login** (`admin/login.html`) - Autenticação
- **Dashboard** (`admin/index.html`) - Painel principal com CRUD completo

---

## 🔐 Autenticação

O sistema usa o **Supabase Auth** com roles:
- `admin` - Acesso completo ao painel
- `superadmin` - Acesso total + gestão de usuários

### Fluxo de Login

1. Usuário insere email e senha em `admin/login.html`
2. Sistema valida com Supabase Auth
3. Verifica role na tabela `profiles`
4. Redireciona para `admin/index.html` se autorizado

---

## 🛠️ Desenvolvimento

### Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Convenções de Código

- **Nomenclatura**: Português para colunas DB, camelCase para JS
- **Arquitetura**: Modular com separação de responsabilidades
- **Estilo**: Tailwind CSS com classes utilitárias
- **Comentários**: JSDoc para funções complexas

---

## 📦 Dependências

### Frontend (CDN)
- Tailwind CSS 3.x
- Font Awesome 6.x
- AOS Library 2.x
- Supabase JS 2.x

### Desenvolvimento
- Vite (opcional, para build moderno)
- ESLint (opcional, para linting)

---

## 🚨 Troubleshooting

### Erro de DNS/Conexão

Se aparecer `ERR_NAME_NOT_RESOLVED`:

```bash
# Mude seu DNS para Google DNS
# Windows: Painel de Controle → Rede → Alterar DNS
# DNS 1: 8.8.8.8
# DNS 2: 8.8.4.4
```

### Login não funciona

1. Verifique se o servidor local está rodando (não funciona com `file://`)
2. Confirme que as credenciais do Supabase estão corretas no `.env`
3. Verifique se a tabela `profiles` foi criada corretamente

### Erro "column does not exist"

Execute novamente o `database/schema.sql` no Supabase SQL Editor.

---

## 📝 Histórico de Versões

### v10.0 (2026-05-07)
- ✅ Migração para variáveis de ambiente
- ✅ Schema SQL consolidado
- ✅ Remoção de backend não utilizado
- ✅ Reorganização completa de pastas
- ✅ Melhorias de segurança (RLS)

### v9.0 (2026-05-02)
- ✅ Retry automático de conexão
- ✅ Detecção de erro DNS
- ✅ Alertas visuais de conexão

---

## 👥 Equipe

Desenvolvido para **Viva Óptica** - Angola

---

## 📄 Licença

Proprietário - Uso exclusivo Viva Óptica

---

## 🆘 Suporte

Para suporte técnico, contate:
- Email: contato@vivaoptica.ao
- Telefone: +244 923 456 789
