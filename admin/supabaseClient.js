// ============================================
// SUPABASE CLIENT - Viva Óptica Admin
// Versão: 11.1 - Browser Native (sem bundler) - FIX
// ============================================

// Configurações hardcoded (para funcionar sem Vite/Webpack)
const SUPABASE_URL = 'https://ppvdqrhhcmeqssazgpnd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmRxcmhoY21lcXNzYXpncG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTI1NzksImV4cCI6MjA5Mjg2ODU3OX0.UJhzd1SxSSz_NO9XMBDSjAljxTNXygI59ezPwZv3wRw';

console.log('🔧 [SUPABASE] Configurado com URL:', SUPABASE_URL);

// ============================================
// ESTADO GLOBAL
// ============================================
let supabaseInstance = null;
let isInitializing = false;
let isOnline = navigator.onLine;
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

// Detectar mudanças de conexão
window.addEventListener('online', () => {
    isOnline = true;
    console.log('✅ [CONEXÃO] Online - Tentando reconectar...');
    if (!supabaseInstance) {
        automaticInit();
    }
});

window.addEventListener('offline', () => {
    isOnline = false;
    console.warn('⚠️ [CONEXÃO] Offline');
    showConnectionAlert('offline');
});

// ============================================
// ALERTA VISUAL DE CONEXÃO
// ============================================
function showConnectionAlert(type) {
    const existingAlert = document.getElementById('connection-alert');
    if (existingAlert) existingAlert.remove();

    const alert = document.createElement('div');
    alert.id = 'connection-alert';
    alert.className = 'fixed top-0 left-0 right-0 bg-red-600 text-white p-3 text-center z-[9999]';

    if (type === 'offline') {
        alert.innerHTML = '<strong>⚠️ Sem conexão com a internet</strong><br><small>Verifique sua conexão e tente novamente</small>';
    } else if (type === 'dns') {
        alert.innerHTML = '<strong>⚠️ Erro de conexão com o Supabase</strong><br><small>Sugestão: Mude seu DNS para 8.8.8.8 (Google DNS)</small>';
    } else if (type === 'auth') {
        alert.innerHTML = '<strong>⚠️ Erro de autenticação</strong><br><small>Verifique suas credenciais no Supabase</small>';
    }

    document.body.insertBefore(alert, document.body.firstChild);

    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 0.5s';
            setTimeout(() => alert.remove(), 500);
        }
    }, 10000);
}

// ============================================
// INICIALIZAÇÃO DO SUPABASE
// ============================================
async function initSupabase() {
    if (isInitializing) {
        console.log('⏳ [SUPABASE] Já está inicializando...');
        return supabaseInstance;
    }

    if (supabaseInstance) {
        console.log('✅ [SUPABASE] Já inicializado');
        return supabaseInstance;
    }

    isInitializing = true;
    initAttempts++;

    console.log(`🔧 [SUPABASE] Iniciando (tentativa ${initAttempts}/${MAX_INIT_ATTEMPTS})...`);

    try {
        // Verificar se Supabase JS está carregado
        if (typeof window.supabase === 'undefined') {
            throw new Error('Biblioteca Supabase não carregada. Verifique se o script CDN está presente no HTML.');
        }

        // Criar instância
        supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Testar conexão (usar * em vez de 1)
        const { error } = await supabaseInstance.from('configuracoes_loja').select('*').limit(1);

        if (error && error.code !== 'PGRST300') { // PGRST300 = "no rows returned" (ok)
            throw error;
        }

        console.log('✅ [SUPABASE] Conexão estabelecida com sucesso!');
        isInitializing = false;
        return supabaseInstance;

    } catch (error) {
        console.error('❌ [SUPABASE] Erro ao inicializar:', error.message);
        initAttempts++;

        if (initAttempts < MAX_INIT_ATTEMPTS) {
            console.log('⏳ [SUPABASE] Retentando em 2 segundos...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return initSupabase();
        }

        // Detectar tipo de erro
        if (error.message.includes('fetch') || error.message.includes('network')) {
            showConnectionAlert('dns');
        } else if (error.message.includes('API key')) {
            showConnectionAlert('auth');
        }

        isInitializing = false;
        return null;
    }
}

// ============================================
// FUNÇÕES DE ACESSO GLOBAL
// ============================================
window.initSupabase = initSupabase;

window.getSupabase = async function() {
    if (!supabaseInstance) {
        await initSupabase();
    }
    return supabaseInstance;
};

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================
async function automaticInit() {
    if (!isOnline) {
        console.warn('⚠️ [SUPABASE] Offline - aguardando conexão...');
        return;
    }

    console.log('🚀 [SUPABASE] Inicialização automática...');
    await initSupabase();
}

// Iniciar automaticamente quando o DOM estiver pronto
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', automaticInit);
    } else {
        automaticInit();
    }
}

// Exportar para uso direto
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initSupabase, getSupabase };
}
