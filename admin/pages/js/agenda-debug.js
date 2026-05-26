// ============================================
// AGENDA DIAGNÓSTICO - Viva Óptica
// Versão Mínima para Debug
// ============================================

console.log('🚀 agenda-debug.js carregado');

let allConsultas = [];

// Toast simples
function showToast(msg, type = 'info') {
    console.log(`[TOAST ${type}]`, msg);
    alert(msg);
}

// Verificar Supabase
async function checkSupabase() {
    console.log('🔍 Verificando Supabase...');

    if (typeof supabase === 'undefined') {
        console.error('❌ SDK não carregado');
        showToast('SDK Supabase não carregado!', 'error');
        return null;
    }

    if (!window.supabase) {
        console.error('❌ window.supabase não definido');
        showToast('window.supabase não definido!', 'error');
        return null;
    }

    if (typeof window.supabase.from !== 'function') {
        console.error('❌ window.supabase.from não é função');
        showToast('Supabase .from() não disponível!', 'error');
        return null;
    }

    console.log('✅ Supabase OK');
    return window.supabase;
}

// Testar tabela
async function testTable() {
    const supabase = await checkSupabase();
    if (!supabase) return;

    console.log('🔍 Testando tabela agendamentos...');

    try {
        const { data, error, count } = await supabase
            .from('agendamentos')
            .select('*', { count: 'exact' })
            .limit(5);

        if (error) {
            console.error('❌ Erro na tabela:', error);
            showToast('Erro: ' + error.message, 'error');
            return;
        }

        console.log(`✅ Tabela OK! ${count || 0} registros`);
        console.log('📋 Dados:', data);
        showToast(`Tabela OK! ${count || 0} registros encontrados`, 'success');

        allConsultas = data || [];
        renderSimpleTable();
    } catch (e) {
        console.error('❌ Erro:', e);
        showToast('Erro: ' + e.message, 'error');
    }
}

// Renderizar tabela simples
function renderSimpleTable() {
    const tbody = document.getElementById('consultas-tabela');
    if (!tbody) {
        console.error('❌ Elemento consultas-tabela não encontrado');
        return;
    }

    if (allConsultas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8">Nenhum agendamento encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = allConsultas.map(a => `
        <tr class="border-b">
            <td class="py-2 px-4">${a.data || 'N/A'}</td>
            <td class="py-2 px-4">${a.horario_inicio || a.hora || 'N/A'}</td>
            <td class="py-2 px-4">${a.cliente_nome || a.nome || 'N/A'}</td>
            <td class="py-2 px-4">${a.status || 'N/A'}</td>
            <td class="py-2 px-4">-</td>
        </tr>
    `).join('');

    console.log('✅ Tabela renderizada');
}

// Verificar autenticação
async function checkAuth() {
    const supabase = await checkSupabase();
    if (!supabase) return;

    console.log('🔍 Verificando autenticação...');

    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('❌ Erro auth:', error);
            return;
        }

        if (!session) {
            console.error('❌ Usuário NÃO logado');
            showToast('Usuário não logado! Redirecionando...', 'error');
            setTimeout(() => window.location.href = '../login.html', 2000);
            return;
        }

        console.log('✅ Usuário logado:', session.user.email);
        showToast('Usuário logado: ' + session.user.email, 'success');
    } catch (e) {
        console.error('❌ Erro:', e);
    }
}

// Auto-executar ao carregar
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📋 DOM carregado');

    // Criar botão de teste se não existir
    const container = document.querySelector('.flex.justify-between');
    if (container) {
        const btn = document.createElement('button');
        btn.textContent = '🔍 Testar BD';
        btn.className = 'bg-yellow-500 text-white px-4 py-2 rounded';
        btn.onclick = testTable;
        container.appendChild(btn);
    }

    await checkAuth();
    await testTable();
    renderCalendar();
});

// Calendário simples
function renderCalendar() {
    const cal = document.getElementById('calendario-dias');
    if (!cal) {
        console.error('❌ calendario-dias não encontrado');
        return;
    }

    console.log('📅 Renderizando calendário...');

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '';
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${i.toString().padStart(2,'0')}`;
        const hasAppt = allConsultas.some(a => a.data === dateStr);
        html += `<div class="h-10 flex items-center justify-center ${hasAppt ? 'bg-green-100' : 'hover:bg-gray-100'} rounded cursor-pointer">${i}</div>`;
    }

    cal.innerHTML = html;
    console.log('✅ Calendário renderizado');
}

console.log('✅ agenda-debug.js carregado completamente');
