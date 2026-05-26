// agenda.js v5.0 - ULTRA SIMPLES
// Apenas para testar se o JS carrega

console.log('🚀 agenda.js v5.0 carregado');

function logout() {
  if (confirm('Tem certeza que deseja sair?')) {
    window.location.href = '../../index.html';
  }
}

// Teste básico
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM carregado');

    // Tentar carregar supabase
    if (typeof supabase !== 'undefined' && window.supabase) {
        console.log('✅ Supabase disponível');

        // Atualizar estatísticas com dados fixos primeiro
        var el1 = document.getElementById('stat-agendados');
        var el2 = document.getElementById('stat-confirmados');
        var el3 = document.getElementById('stat-andamento');
        if (el1) el1.textContent = '5';
        if (el2) el2.textContent = '3';
        if (el3) el3.textContent = '2';

        console.log('✅ Estatísticas atualizadas');

        // Renderizar calendário simples
        var cal = document.getElementById('calendario-dias');
        if (cal) {
            var html = '';
            for (var i = 1; i <= 31; i++) {
                html += '<div class="h-10 flex items-center justify-center hover:bg-gray-100 rounded">' + i + '</div>';
            }
            cal.innerHTML = html;
            console.log('✅ Calendário renderizado');
        }

        // Tabela simples
        var tbody = document.getElementById('consultas-tabela');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8">Sistema carregado! Faça login para ver dados reais.</td></tr>';
            console.log('✅ Tabela atualizada');
        }

        // Mostrar mensagem
        alert('✅ Agenda carregada com sucesso!');

    } else {
        console.error('❌ Supabase não disponível');
        alert('❌ Erro: Supabase não carregado. Verifique o console (F12).');
    }
});
