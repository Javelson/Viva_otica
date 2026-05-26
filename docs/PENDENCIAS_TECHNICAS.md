# 📋 Pendências Técnicas - Painel Administrativo Viva Óptica

**Data:** 2026-05-07  
**Versão do Sistema:** 8.0  
**Status:** Em Implementação

---

## 🔴 Críticas (Altas Prioridades)

### 1. **Testar CRUD com Supabase Real**
**Descrição:** Validar todas as operações CRUD com o banco de dados Supabase real.

**O que testar:**
- [ ] Criar novo agendamento
- [ ] Listar agendamentos
- [ ] Atualizar status de agendamento
- [ ] Cancelar agendamento
- [ ] Eliminar agendamento permanentemente
- [ ] Adicionar produto (armação, lente, acessório)
- [ ] Editar produto existente
- [ ] Eliminar produto

**Como testar:**
```bash
# 1. Iniciar servidor local
cd viva-optica
python -m http.server 8000

# 2. Acessar http://localhost:8000/admin/index.html

# 3. Fazer login com credenciais admin
# 4. Testar cada operação do CRUD
```

**Risco:** ⚠️ Alto - Sem testes, bugs podem passar para produção

---

### 2. **Remover Links Quebrados do Sidebar**
**Local:** `admin/index.html:77-96`

**Links problemáticos:**
```html
<!-- Estes links apontam para páginas que não existem -->
<a href="pages/prontuario.html">Prontuário Digital</a> ❌
<a href="pages/laboratorio.html">Laboratório</a> ❌
<a href="pages/estoque.html">Estoque Inteligente</a> ❌
<a href="pages/agenda.html">Agenda Consultas</a> ❌
<a href="pages/crm.html">CRM Re-engajamento</a> ❌
<a href="orcamentos.html">Orçamentos PDF</a> ❌
```

**Solução proposta:**
```html
<!-- Opção A: Remover completamente -->
<!-- Opção B: Desabilitar com tooltip -->
<li class="opacity-50 cursor-not-allowed" title="Em desenvolvimento">
  <a href="#">Prontuário Digital (Em breve)</a>
</li>
```

**Risco:** ⚠️ Médio - Usuários clicam e recebem erro 404

---

### 3. **Configurar .env em Produção**
**Local:** Raiz do projeto

**Status:** ✅ `.env.example` criado, ❌ `.env` real não existe

**Ação necessária:**
```bash
# 1. Copiar template
cp .env.example .env

# 2. Editar .env com credenciais reais
echo "SUPABASE_URL=https://ppvdqrhhcmeqssazgpnd.supabase.co" > .env
echo "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." >> .env

# 3. Adicionar .env ao .gitignore (já feito)
```

**Risco:** 🔴 Crítico - Sem .env, sistema não conecta ao Supabase

---

### 4. **Executar schema.sql no Supabase**
**Local:** `database/schema.sql`

**Verificar se tabelas existem:**
```sql
-- No Supabase SQL Editor, execute:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Tabelas esperadas:**
- profiles ✅
- produtos ✅
- slideshow ✅
- configuracoes_loja ✅
- clientes ✅
- agendamentos ✅
- vendas (opcional)
- itens_venda (opcional)

**Risco:** 🔴 Crítico - Sem tabelas, CRUD não funciona

---

## 🟡 Médias Prioridades

### 5. **Implementar Paginação**
**Motivo:** Tabelas com > 100 registros ficarão lentas com filtro client-side

**Solução proposta:**
```javascript
const ITEMS_PER_PAGE = 10;
let currentPage = 1;

function renderAgendamentosPaginated(data) {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageData = data.slice(start, end);
  
  // Renderizar pagina...
  renderPaginationControls(totalPages);
}
```

**Esforço:** ~2 horas  
**Impacto:** Alto em performance

---

### 6. **Melhorar Validação de Formulários**
**Status atual:** Apenas `required` do HTML5

**Melhorias necessárias:**

**Agendamentos:**
```javascript
function validateAppointmentForm() {
  const nome = document.getElementById('appt-nome').value.trim();
  const telefone = document.getElementById('appt-telefone').value.trim();
  const data = document.getElementById('appt-data').value;
  const hora = document.getElementById('appt-hora').value;
  
  if (nome.length < 3) {
    showToast('Nome deve ter pelo menos 3 caracteres', 'error');
    return false;
  }
  
  if (!/^\d{9,15}$/.test(telefone.replace(/\D/g, ''))) {
    showToast('Telefone inválido', 'error');
    return false;
  }
  
  if (new Date(data) < new Date()) {
    showToast('Data não pode ser no passado', 'error');
    return false;
  }
  
  return true;
}
```

**Produtos:**
```javascript
function validateProductForm() {
  const nome = document.getElementById('produto-nome').value.trim();
  const preco = parseFloat(document.getElementById('produto-preco').value);
  const estoque = parseInt(document.getElementById('produto-estoque').value);
  
  if (nome.length < 3) {
    showToast('Nome deve ter pelo menos 3 caracteres', 'error');
    return false;
  }
  
  if (preco < 0) {
    showToast('Preço não pode ser negativo', 'error');
    return false;
  }
  
  if (estoque < 0) {
    showToast('Estoque não pode ser negativo', 'error');
    return false;
  }
  
  return true;
}
```

**Esforço:** ~1 hora  
**Impacto:** Médio - Previne dados inválidos

---

### 7. **Adicionar Confirmação Detalhada em Deletes**
**Status atual:** `confirm('Tem certeza?')` - genérico

**Melhoria:**
```javascript
function deleteAgendamento(id) {
  const appt = window.allAgendamentos.find(a => a.id === id);
  
  if (!confirm(`
    ⚠️ ELIMINAR AGENDAMENTO PERMANENTEMENTE
    
    Cliente: ${appt.nome_cliente}
    Data: ${formatDate(appt.data)}
    Hora: ${appt.hora}
    Serviço: ${appt.servico}
    
    Esta ação NÃO pode ser desfeita.
    
    Digite "SIM" para confirmar:
  `)) return;
  
  const resposta = prompt();
  if (resposta !== 'SIM') {
    showToast('Cancelado', 'info');
    return;
  }
  
  // Proceed with deletion...
}
```

**Esforço:** ~30 minutos  
**Impacto:** Alto - Previne deletes acidentais

---

### 8. **Adicionar Loading States em Inputs**
**Status atual:** Loading apenas em botões

**Melhoria:** Desabilitar inputs durante submit
```javascript
function toggleInputs(disabled) {
  const inputs = document.querySelectorAll('#manual-appointment-form input, #manual-appointment-form select');
  inputs.forEach(input => input.disabled = disabled);
  
  const submitBtn = document.querySelector('#manual-appointment-form button[type="submit"]');
  if (disabled) {
    submitBtn.innerHTML = '<span class="animate-pulse">Processando...</span>';
  } else {
    submitBtn.innerHTML = 'Salvar Agendamento';
  }
}
```

**Esforço:** ~30 minutos  
**Impacto:** Médio - Melhora UX

---

## 🟢 Baixas Prioridades

### 9. **Implementar Exportação CSV**
**Motivo:** Backup manual e análise de dados

**Solução proposta:**
```javascript
function exportAgendamentosCSV() {
  const headers = ['ID', 'Cliente', 'Telefone', 'Data', 'Hora', 'Serviço', 'Status'];
  const rows = window.allAgendamentos.map(a => [
    a.id, a.nome_cliente, a.telefone_cliente, a.data, a.hora, a.servico, a.status
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agendamentos_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}
```

**Esforço:** ~1 hora  
**Impacto:** Baixo - Útil para backups

---

### 10. **Adicionar Search com Debounce**
**Motivo:** Evitar re-renderizações excessivas durante digitação

**Solução:**
```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Uso:
const filteredAgendamentos = debounce(filterAgendamentos, 300);
document.getElementById('search-agendamentos').addEventListener('input', filteredAgendamentos);
```

**Esforço:** ~20 minutos  
**Impacto:** Baixo - Otimização

---

### 11. **Implementar Supabase Realtime**
**Motivo:** Atualizações automáticas sem refresh

**Solução:**
```javascript
// Em admin/app.js
const agendamentosChannel = supabase
  .channel('agendamentos')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'agendamentos' },
    payload => {
      console.log('Mudança detectada:', payload);
      loadAgendamentos(); // Recarrega automaticamente
      showToast('Dados atualizados', 'success');
    }
  )
  .subscribe();
```

**Esforço:** ~2 horas  
**Impacto:** Baixo - UX melhorada

---

### 12. **Criar Sistema de Backup Automático**
**Motivo:** Prevenir perda de dados

**Solução proposta:**
```javascript
// Backup semanal automático
async function exportBackupCompleto() {
  const [produtos, agendamentos, clientes] = await Promise.all([
    supabase.from('produtos').select('*'),
    supabase.from('agendamentos').select('*'),
    supabase.from('clientes').select('*')
  ]);
  
  const backup = {
    timestamp: new Date().toISOString(),
    produtos: produtos.data,
    agendamentos: agendamentos.data,
    clientes: clientes.data
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_viva_optica_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

// Agendar backup automático (ex: toda sexta às 18h)
exportBackupCompleto();
```

**Esforço:** ~1 hora  
**Impacto:** Baixo - Segurança de dados

---

## 🔵 Opcional (Futuro)

### 13. **Migração para React/Vue**
**Status:** Protótipo aprovado mas não implementado

**Vantagens:**
- Melhor gerenciamento de estado
- Componentização
- Performance otimizada
- Ecossistema rico

**Desvantagens:**
- Curva de aprendizado
- Build process necessário
- Maior complexidade inicial

**Recomendação:** Manter Vanilla JS até validar demanda, depois migrar.

---

### 14. **Adicionar TypeScript**
**Vantagens:**
- Type safety
- Melhor autocomplete
- Menos bugs em runtime

**Esforço:** ~1 semana (migração completa)

---

### 15. **Implementar Sistema de Permissões Granulares**
**Atual:** Apenas `admin` e `superadmin`

**Proposta:**
```javascript
const ROLES = {
  SUPERADMIN: 'superadmin', // Acesso total + gestão de usuários
  ADMIN: 'admin', // Acesso total
  RECEPCIONISTA: 'reception', // Apenas agendamentos (CRUD limitado)
  VENDEDOR: 'sales' // Apenas produtos (leitura + vendas)
};
```

**Esforço:** ~4 horas  
**Impacto:** Médio - Segurança aprimorada

---

## 📊 Resumo de Esforço

| Prioridade | Total de Horas | Quantidade de Tarefas |
|------------|---------------|----------------------|
| Crítica    | ~2 horas      | 4 tarefas            |
| Média      | ~4 horas      | 4 tarefas            |
| Baixa      | ~4 horas      | 4 tarefas            |
| Opcional   | ~2 semanas    | 3 tarefas            |
| **TOTAL**  | **~10 horas** | **15 tarefas**       |

---

## 🎯 Próximos Passos Imediatos

1. **HOJE:** Configurar `.env` real e executar `schema.sql` no Supabase
2. **HOJE:** Testar todas as operações CRUD manualmente
3. **AMANHÃ:** Remover links quebrados do sidebar
4. **ESTA SEMANA:** Implementar validação de formulários
5. **ESTA SEMANA:** Adicionar confirmações detalhadas em deletes

---

## 📝 Notas Finais

- **Nenhuma tarefa crítica deve ser ignorada** antes de colocar em produção
- **Testes manuais são obrigatórios** para validar todas as funcionalidades
- **Backup antes de qualquer mudança** no banco de dados
- **Documentar qualquer alteração** no schema ou lógica

---

**Última atualização:** 2026-05-07  
**Responsável:** OpenClaude - Senior Full-Stack Developer  
**Próxima revisão:** Após implementação das tarefas críticas
