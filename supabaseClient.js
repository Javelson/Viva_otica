// ============================================
// SUPABASE CLIENT - Viva Óptica
// Versão: 9.0 - Retry Automático + DNS Check + Global Imediato
// ============================================

// Configurações do Supabase
const SUPABASE_URL = 'https://ppvdqrhhcmeqssazgpnd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmRxcmhoY21lcXNzYXpncG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTI1NzksImV4cCI6MjA5Mjg2ODU3OX0.UJhzd1SxSSz_NO9XMBDSjAljxTNXygI59ezPwZv3wRw';

// ============================================
// ESTADO GLOBAL
// ============================================
let supabaseInstance = null;
let isOnline = navigator.onLine;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Detectar mudanças de conexão
window.addEventListener('online', () => {
    isOnline = true;
    console.log('✅ [CONEXÃO] Online');
    retryCount = 0;
});
window.addEventListener('offline', () => {
    isOnline = false;
    console.log('⚠️ [CONEXÃO] Offline');
});

// ============================================
// INICIALIZAÇÃO SÍNCRONA E IMEDIATA
// ============================================
(function automaticInit() {
    console.log('🚀 [SUPABASE] Inicialização iniciada...');

    // Verificar se SDK do Supabase está disponível
    if (typeof supabase === 'undefined') {
        console.error('❌ [SUPABASE] SDK não carregado!');
        console.error('📋 Adicione no HTML ANTES deste script:');
        console.error('   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return;
    }

    console.log('🔧 [SUPABASE] SDK detectado');
    console.log('🔧 [SUPABASE] URL:', SUPABASE_URL);

    // Verificar conexão
    if (!isOnline) {
        console.error('❌ [SUPABASE] Offline - verifique a internet');
        return;
    }

    try {
        // Criar cliente SÍNCRONO
        supabaseInstance = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            },
            global: {
                headers: { 'apikey': SUPABASE_ANON_KEY }
            }
        });

        // EXPOSIÇÃO GLOBAL IMEDIATA
        window.supabase = supabaseInstance;
        console.log('✅ [SUPABASE] Global inicializado');
        console.log('✅ [SUPABASE] window.supabase type:', typeof window.supabase);
        console.log('✅ [SUPABASE] window.supabase.from:', typeof window.supabase?.from);

        // Verificar se .from() está disponível
        if (typeof window.supabase?.from !== 'function') {
            console.error('❌ [SUPABASE] CRÍTICO: window.supabase.from NÃO é função!');
        } else {
            console.log('✅ [SUPABASE] window.supabase.from() disponível!');
        }

        // Testar conexão com retry
        setTimeout(() => testConnectionWithRetry(), 1000);

    } catch (error) {
        console.error('❌ [SUPABASE] Erro ao criar cliente:', error.message);
    }
})();

// ============================================
// TESTE DE CONEXÃO COM RETRY
// ============================================
async function testConnectionWithRetry() {
    if (!supabaseInstance) return;

    try {
        console.log(`🔍 [SUPABASE] Testando conexão (tentativa ${retryCount + 1}/${MAX_RETRIES})...`);

        const { data, error } = await supabaseInstance
            .from('profiles')
            .select('count', { count: 'exact', head: true });

        if (error) {
            throw error;
        }

        console.log('✅ [SUPABASE] Conexão estabelecida!');
        console.log('✅ [SUPABASE] Teste .from() passou!');
        retryCount = 0;
    } catch (error) {
        console.error('❌ [SUPABASE] Erro no teste:', error.message);

        // Verificar se é erro de DNS
        if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
            console.error('❌ [SUPABASE] ERRO DE DNS DETECTADO!');
            console.error('📋 SOLUÇÃO: Altere o DNS para 8.8.8.8 (Google DNS)');
            console.error('📋 Passo a passo: Painel Controle → Rede → Alterar adaptador → IPv4 → DNS: 8.8.8.8');
            return;
        }

        retryCount++;
        if (retryCount < MAX_RETRIES) {
            console.log(`🔄 [SUPABASE] Retry em ${RETRY_DELAY}ms...`);
            setTimeout(() => testConnectionWithRetry(), RETRY_DELAY);
        } else {
            console.error('❌ [SUPABASE] Máximo de tentativas atingido');
        }
    }
}

// ============================================
// FUNÇÃO GLOBAL getSupabase (FALLBACK)
// ============================================
window.getSupabase = async function() {
    if (supabaseInstance && window.supabase) {
        return window.supabase;
    }

    console.warn('⚠️ [getSupabase] Cliente não inicializado');

    // Tentar aguardar um pouco
    for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (window.supabase && typeof window.supabase.from === 'function') {
            return window.supabase;
        }
    }

    return null;
};

console.log('✅ [SUPABASE] Módulo v9.0 carregado!');
