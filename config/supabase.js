// ============================================
// Supabase Client - Viva Óptica
// Versão: 10.0 - Com suporte a .env
// ============================================

// Detectar ambiente (browser ou Node.js)
const isBrowser = typeof window !== 'undefined';

// Obter configurações - Prioridade: .env > hardcoded (fallback)
function getSupabaseConfig() {
  // Tentar ler de variáveis de ambiente (se disponíveis via build tool)
  const url = import.meta?.env?.VITE_SUPABASE_URL ||
              (isBrowser ? window?.SUPABASE_URL : process?.env?.SUPABASE_URL);

  const key = import.meta?.env?.VITE_SUPABASE_ANON_KEY ||
              (isBrowser ? window?.SUPABASE_ANON_KEY : process?.env?.SUPABASE_ANON_KEY);

  // Fallback para valores hardcoded (APENAS PARA DESENVOLVIMENTO)
  const fallbackUrl = 'https://ppvdqrhhcmeqssazgpnd.supabase.co';
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmRxcmhoY21lcXNzYXpncG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTI1NzksImV4cCI6MjA5Mjg2ODU3OX0.UJhzd1SxSSz_NO9XMBDSjAljxTNXygI59ezPwZv3wRw';

  if (!url || !key) {
    console.warn('⚠️ [SUPABASE] Variáveis de ambiente não definidas. Usando fallback.');
    console.warn('📋 Configure .env ou defina window.SUPABASE_URL e window.SUPABASE_ANON_KEY');
  }

  return {
    url: url || fallbackUrl,
    key: key || fallbackKey
  };
}

// ============================================
// INICIALIZAÇÃO DO CLIENTE
// ============================================
let supabaseClient = null;
let initializationError = null;

async function initSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    // Verificar se SDK do Supabase está disponível
    if (typeof createClient === 'undefined') {
      throw new Error('SDK do Supabase não carregado. Adicione no HTML:');
    }

    const config = getSupabaseConfig();

    // Validar configurações
    if (!config.url || !config.key) {
      throw new Error('Configurações do Supabase inválidas');
    }

    // Criar cliente
    supabaseClient = createClient(config.url, config.key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'X-Client-Info': 'viva-optica-web-v10'
        }
      }
    });

    console.log('✅ [SUPABASE] Cliente inicializado com sucesso');
    console.log(`🔗 URL: ${config.url}`);

    // Testar conexão
    const { data, error } = await supabaseClient.from('profiles').select('id', { count: 'exact', head: true });

    if (error) {
      console.warn('⚠️ [SUPABASE] Erro ao testar conexão:', error.message);
      initializationError = error;
    } else {
      console.log('✅ [SUPABASE] Conexão testada com sucesso');
    }

    return supabaseClient;
  } catch (error) {
    console.error('❌ [SUPABASE] Erro na inicialização:', error);
    initializationError = error;
    return null;
  }
}

// ============================================
// FUNÇÕES DE ACESSO
// ============================================

// Inicialização síncrona para browser (exposição global)
if (isBrowser) {
  window.initSupabase = initSupabase;
  window.getSupabase = async () => {
    if (!supabaseClient) {
      await initSupabase();
    }
    return supabaseClient;
  };

  // Iniciar automaticamente
  initSupabase();
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initSupabase, getSupabase: () => supabaseClient };
}
