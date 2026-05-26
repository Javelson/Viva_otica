# 🧹 Plano de Auditoria e Reorganização - Viva Óptica
**Data:** 2026-05-07  
**Abordagem:** Limpeza Radical (A)

## 📋 Resumo Executivo
Este documento detalha a reorganização completa do projeto Viva Óptica para eliminar código morto, proteger credenciais e estabelecer uma estrutura profissional.

---

## 🔴 Problemas Identificados

### 1. Segurança - Credenciais Expostas
- **Local:** `supabaseClient.js` (linha 9) e `admin/supabaseClient.js` (linha 8)
- **Impacto:** Chave ANON do Supabase visível no código-fonte
- **Solução:** Migrar para variáveis de ambiente via `.env`

### 2. Ficheiros SQL Redundantes (12 ficheiros)
```
❌ MASTER_DATABASE_SETUP.sql
❌ CREATE_ALL_TABLES.sql
❌ CREATE_AGENDAMENTOS_TABLE.sql
❌ CREATE_AGENDAMENTOS_FINAL.sql
❌ SQL_AGENDAMENTOS_FIX.sql
❌ MODULE_AGENDA_CONSULTAS.sql
❌ MODULE_CRM_REENGAJAMENTO.sql
❌ MODULE_ESTOQUE_INTELIGENTE.sql
❌ MODULE_FLUXO_LABORATORIO.sql
❌ MODULE_ORCAMENTOS_PDF.sql
❌ MODULE_PRONTUARIO_DIGITAL.sql
❌ INSTALL_*.md (6 ficheiros de documentação duplicada)
```

### 3. Backend Não Utilizado
```
❌ backend/server.js (Express + SQLite - não usado)
❌ backend/database.js (SQLite schema - não usado)
❌ backend/node_modules/ (200+ MB desnecessários)
```

### 4. Estrutura Desorganizada
- Scripts JS espalhados: `js/`, `admin/js/`, `admin/pages/js/`
- HTMLs misturados na raiz e em subpastas
- Falta de separação clara entre componentes

---

## 🎯 Estrutura Final Proposta

```
viva-optica/
├── .env.example                 # Template de variáveis de ambiente
├── .gitignore                   # Atualizado para excluir node_modules, .env
├── README.md                    # Documentação principal
│
├── config/                      # Configurações
│   └── supabase.js             # Cliente Supabase com .env
│
├── public/                      # Assets estáticos
│   ├── img/
│   │   ├── logo/
│   │   ├── slides/
│   │   └── produtos/
│   └── icons/
│
├── src/                         # Código fonte organizado
│   ├── pages/                   # Páginas HTML
│   │   ├── index.html
│   │   ├── agendamento.html
│   │   ├── admin/
│   │   │   ├── index.html
│   │   │   └── login.html
│   │   └── cliente/
│   │       ├── armacoes.html
│   │       ├── produtos.html
│   │       ├── servicos.html
│   │       ├── sobre.html
│   │       └── contacto.html
│   │
│   ├── js/                      # JavaScript modular
│   │   ├── utils/
│   │   │   ├── auth.js
│   │   │   ├── storage.js
│   │   │   └── validators.js
│   │   ├── components/
│   │   │   ├── navbar.js
│   │   │   ├── sidebar.js
│   │   │   └── modal.js
│   │   ├── services/
│   │   │   ├── supabaseService.js
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   └── appointmentService.js
│   │   ├── admin/
│   │   │   ├── dashboard.js
│   │   │   ├── products.js
│   │   │   ├── appointments.js
│   │   │   └── customers.js
│   │   └── main.js              # Entry point público
│   │
│   ├── css/                     # Estilos
│   │   ├── main.css
│   │   ├── admin.css
│   │   └── components.css
│   │
│   └── data/                    # Mock data (se necessário)
│       └── mockData.js
│
├── database/                    # Scripts SQL
│   ├── schema.sql              # Schema consolidado (UNICO)
│   ├── migrations/
│   │   ├── 001_initial.sql
│   │   ├── 002_agendamentos.sql
│   │   ├── 003_estoque.sql
│   │   └── ...
│   └── seeds/
│       └── sample_data.sql
│
├── docs/                        # Documentação
│   ├── specs/                   # Especificações técnicas
│   ├── guides/                  # Guias de implementação
│   └── API.md                  # Documentação de APIs
│
└── scripts/                     # Utilitários
    ├── setup-database.js
    ├── backup.sh
    └── deploy.sh
```

---

## 📝 Lista de Ações

### Fase 1: Backup e Preparação
- [ ] Criar backup completo do projeto
- [ ] Criar `.env.example` com variáveis necessárias
- [ ] Criar `.gitignore` atualizado

### Fase 2: Limpeza de Dependências
- [ ] Remover `backend/` completo (200+ MB)
- [ ] Remover ficheiros SQL redundantes (manter apenas `database/schema.sql`)
- [ ] Remover documentação duplicada `INSTALL_*.md`

### Fase 3: Migração de Credenciais
- [ ] Criar `config/supabase.js` com leitura de `.env`
- [ ] Atualizar todos os ficheiros que usam Supabase
- [ ] Adicionar validação de variáveis de ambiente

### Fase 4: Reorganização de Ficheiros
- [ ] Criar nova estrutura de pastas
- [ ] Mover `src/pages/` para organização correta
- [ ] Mover `src/js/` para módulos organizados
- [ ] Mover `src/css/` para estilos centralizados

### Fase 5: Atualização de Imports
- [ ] Atualizar todos os `<script>` tags nos HTMLs
- [ ] Testar cada página funcional
- [ ] Verificar console errors

### Fase 6: Documentação
- [ ] Criar README.md atualizado
- [ ] Documentar estrutura de pastas
- [ ] Criar guia de setup para novos desenvolvedores

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Perda de dados durante limpeza | Alto | Backup completo antes de qualquer ação |
| Quebra de funcionalidade | Médio | Testar cada página após migração |
| Credenciais perdidas | Alto | Manter cópia segura das chaves do Supabase |
| Links quebrados | Médio | Auditoria completa de todos os links |

---

## ✅ Critérios de Sucesso

1. ✅ Zero credenciais expostas no código
2. ✅ Projeto reduzido de ~200MB para < 50MB
3. ✅ Estrutura de pastas organizada e documentada
4. ✅ Todas as páginas funcionais após migração
5. ✅ Zero ficheiros SQL redundantes
6. ✅ `.env` configurado corretamente

---

## 🚀 Próximos Passos

1. **Aprovação deste plano** pelo usuário
2. **Execução faseada** com checkpoints após cada fase
3. **Testes completos** antes de marcar como concluído

---

**Status:** Aguardando aprovação para execução  
**Autor:** OpenClaude - Senior Full-Stack Developer  
**Revisado por:** [Aguardando]
