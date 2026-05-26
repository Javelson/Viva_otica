# Prontuário Digital - Design Document

**Data:** 2026-05-02  
**Projeto:** Viva Óptica ERP  
**Versão:** 1.0  
**Status:** ✅ Implementado - Aguardando Testes

---

## Visão Geral

Sistema completo de gestão de prontuários médicos oftalmológicos, permitindo o registro, edição e consulta de receitas oftalmológicas com campos específicos para OD (Olho Direito) e OE (Olho Esquerdo).

---

## Arquitetura

### Componentes Principais

1. **Backend (Supabase)**
   - Tabela `prontuarios` - Dados principais da receita
   - Tabela `prontuario_anexos` - Anexos de exames (imagens/PDF)
   - Views para consultas otimizadas
   - RLS policies para segurança

2. **Frontend (Admin Panel)**
   - Página `admin/pages/prontuario.html` - Interface principal
   - JavaScript `admin/pages/js/prontuario.js` - Lógica de negócio
   - Componentes reutilizáveis (modais, cards, formulários)

3. **Integração**
   - Supabase Client (via CDN)
   - TailwindCSS para estilização
   - Font Awesome para ícones

---

## Schema do Banco de Dados

### Tabela: `prontuarios`

```sql
CREATE TABLE public.prontuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,

    -- Olho Direito (OD)
    od_esferico DECIMAL(5,2),
    od_cilindrico DECIMAL(5,2),
    od_eixo DECIMAL(5,2),
    od_adicao DECIMAL(5,2),
    od_dnp DECIMAL(5,2),

    -- Olho Esquerdo (OE)
    oe_esferico DECIMAL(5,2),
    oe_cilindrico DECIMAL(5,2),
    oe_eixo DECIMAL(5,2),
    oe_adicao DECIMAL(5,2),
    oe_dnp DECIMAL(5,2),

    -- Dados adicionais
    dnp_dual DECIMAL(5,2),
    observacoes TEXT,
    tipo_exame VARCHAR(50) DEFAULT 'refracao',

    -- Metadados
    data_exame TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    optometrista VARCHAR(255),
    proximo_exame DATE,
    ativo BOOLEAN DEFAULT true,

    -- Auditoria
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Campos da Receita

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `esferico` | DECIMAL(5,2) | Grau de miopia/hipermetropia | -1.50, +2.25 |
| `cilindrico` | DECIMAL(5,2) | Grau de astigmatismo | -0.75, -1.25 |
| `eixo` | DECIMAL(5,2) | Eixo do astigmatismo (0-180°) | 180, 90, 45 |
| `adicao` | DECIMAL(5,2) | Adição para multifocal | +1.50, +2.00 |
| `dnp` | DECIMAL(5,2) | Distância Nasopupilar (mm) | 63.5, 65.0 |

---

## Fluxo de Dados

### 1. Criar Novo Prontuário

```
[Admin] → Abre Modal → Busca Cliente → Preenche Receita → Salva → [Supabase]
                                                              ↓
                                                        [Toast Success]
                                                              ↓
                                                      [Atualiza Lista]
```

### 2. Editar Prontuário Existente

```
[Admin] → Clicar em Editar → Carregar Dados → Preencher Modal → Salvar → [Supabase]
                                                                            ↓
                                                                      [Toast Success]
                                                                            ↓
                                                                    [Atualiza Lista]
```

### 3. Deletar Prontuário (Soft Delete)

```
[Admin] → Clicar em Deletar → Confirmar → Update(ativo=false) → [Supabase]
                                                                  ↓
                                                            [Toast Success]
```

---

## Componentes de UI

### 1. Lista de Prontuários

**Local:** `admin/pages/prontuario.html`

**Funcionalidades:**
- Busca por nome/telefone do cliente
- Filtro por data
- Filtro por tipo de exame
- Cards com resumo da receita (OD/OE)
- Botões de editar/deletar

**Design Pattern:** Card-based layout com TailwindCSS

### 2. Modal de Formulário

**Funcionalidades:**
- Seleção dinâmica de cliente (autocomplete)
- Campos numéricos com step=0.25 para graus
- Validação de eixo (0-180)
- Diagrama visual OD/OE
- Observações e histórico

**Validações:**
- Cliente obrigatório
- Data do exame obrigatória
- Optometrista obrigatório
- Campos de receita opcionais (podem ser null)

### 3. Visualização de Receita

**Formato:**
```
┌─────────────────────────────────────┐
│  OD: SPH -1.50 • CYL -0.75 • AXIS 180° │
│  OE: SPH -1.25 • CYL -0.50 • AXIS 170° │
│  DNP: 63.5 mm                       │
└─────────────────────────────────────┘
```

---

## Segurança

### RLS Policies

```sql
-- Admin/Superadmin: acesso total
CREATE POLICY "Admin full access prontuarios" ON public.prontuarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- Clientes: apenas seus próprios prontuários
CREATE POLICY "Cliente ver proprios prontuarios" ON public.prontuarios
    FOR SELECT USING (
        cliente_id IN (
            SELECT id FROM public.clientes
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );
```

### Proteção de Dados

- **Soft Delete:** Nunca deleta fisicamente, apenas marca `ativo = false`
- **RLS:** Row Level Security garante que apenas admins vejam todos os prontuários
- **Validação:** Inputs validados no frontend e backend

---

## Tratamento de Erros

### Cenários Tratados

1. **Supabase não disponível**
   - Toast notification com erro
   - Sugestão de verificar DNS (8.8.8.8)

2. **Cliente não selecionado**
   - Validação no submit
   - Mensagem clara de erro

3. **Erro de rede**
   - Try-catch em todas as chamadas API
   - Feedback visual ao usuário

4. **Dados inválidos**
   - Validação de range (eixo 0-180)
   - Step de 0.25 para graus

---

## Próximos Passos (Futuras Iterações)

### Fase 2 (Prioridade Alta)

- [ ] **Anexos de Exames** - Upload de imagens/PDF
- [ ] **Exportação PDF** - Gerar receita em PDF
- [ ] **Histórico por Cliente** - Timeline de exames
- [ ] **Validações Avançadas** - Regras oftalmológicas

### Fase 3 (Prioridade Média)

- [ ] **Área do Cliente** - Visualização no site público
- [ ] **Lembretes Automáticos** - E-mail/SMS para próximo exame
- [ ] **Estatísticas** - Gráficos de exames por período
- [ ] **Integração com Laboratório** - Work Order

---

## Testes

### Testes Manuais

1. **Criar Prontuário**
   - [ ] Buscar cliente existente
   - [ ] Preencher todos os campos
   - [ ] Salvar e verificar no banco
   - [ ] Verificar na lista

2. **Editar Prontuário**
   - [ ] Clicar em editar
   - [ ] Carregar dados corretamente
   - [ ] Modificar campos
   - [ ] Salvar e verificar atualização

3. **Deletar Prontuário**
   - [ ] Clicar em deletar
   - [ ] Confirmar diálogo
   - [ ] Verificar soft delete no banco
   - [ ] Confirmar remoção da lista

### Testes de Borda

- [ ] Campos vazios (null)
- [ ] Valores negativos (miopia)
- [ ] Valores positivos (hipermetropia)
- [ ] Eixo fora de range (0-180)
- [ ] Cliente sem prontuários anteriores

---

## Dependências

### Externas

- Supabase (Database + Auth)
- TailwindCSS (via CDN)
- Font Awesome (via CDN)
- Google Fonts (Inter)

### Internas

- `admin/supabaseClient.js` - Cliente Supabase
- `admin/pages/prontuario.html` - Interface
- `admin/pages/js/prontuario.js` - Lógica

---

## Changelog

### v1.0 (2026-05-02)

- ✅ Schema SQL completo criado
- ✅ Views otimizadas implementadas
- ✅ RLS policies configuradas
- ✅ Interface admin desenvolvida
- ✅ CRUD completo implementado
- ✅ Validações e tratamentos de erro
- ✅ Toast notifications
- ✅ Integração com menu admin

---

**Autor:** OpenClaude (Desenvolvedor Full-Stack Sênior)  
**Revisado por:** _Aguardando_  
**Aprovado por:** _Aguardando_
