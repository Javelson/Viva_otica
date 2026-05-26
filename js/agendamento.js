// ============================================
// AGENDAMENTO HANDLER - Viva Óptica
// Versão: 3.0 - Pós-agendamento com redirect WhatsApp
// ============================================

// ============================================
// CONFIGURAÇÃO CENTRALIZADA
// ============================================
const WHATSAPP_CONFIG = {
    phone: '244954145065',
    get waMeUrl() { return `https://wa.me/${this.phone}`; },
    get webUrl() { return `https://web.whatsapp.com/send?phone=${this.phone}`; }
};

const REDIRECT_DELAY_MS = 2000;

// ============================================
// DETECÇÃO DE DISPOSITIVO
// ============================================
function isMobileDevice() {
    const ua = navigator.userAgent || '';
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
        || (navigator.maxTouchPoints > 0 && /Mobile/i.test(ua));
}

// ============================================
// VALIDAÇÃO DE URL
// ============================================
function buildWhatsAppUrl(phone, message, mobile) {
    const encodedMsg = encodeURIComponent(message);
    const base = mobile ? WHATSAPP_CONFIG.waMeUrl : WHATSAPP_CONFIG.webUrl;
    const separator = mobile ? '?' : '&';
    const url = `${base}${separator}text=${encodedMsg}`;

    // Validar que o URL é seguro (apenas domínios WhatsApp)
    try {
        const parsed = new URL(url);
        const allowedHosts = ['wa.me', 'web.whatsapp.com', 'api.whatsapp.com'];
        if (!allowedHosts.includes(parsed.hostname)) {
            console.error('❌ [AGENDAMENTO] URL inválido detectado:', parsed.hostname);
            return null;
        }
        return url;
    } catch {
        console.error('❌ [AGENDAMENTO] URL malformado');
        return null;
    }
}

// ============================================
// CONSTRUIR MENSAGEM WHATSAPP
// ============================================
function buildWhatsAppMessage(dados) {
    return [
        '*NOVO AGENDAMENTO - Viva Óptica*',
        '',
        `*Nome:* ${dados.nome}`,
        `*Email:* ${dados.email}`,
        `*Telefone:* ${dados.telefone}`,
        `*Nascimento:* ${dados.nascimento}`,
        `*Tipo:* ${dados.tipo_consulta}`,
        `*Data:* ${dados.data}`,
        `*Hora:* ${dados.hora}`,
        `*Observações:* ${dados.observacoes || 'Nenhuma'}`
    ].join('\n');
}

document.addEventListener('DOMContentLoaded', function() {
console.log('✅ [AGENDAMENTO] DOM carregado - Inicializando...');

// Verificar Supabase
if (!window.supabase) {
console.error('❌ [AGENDAMENTO] window.supabase NÃO disponível!');
alert('Erro: Sistema de agendamento não carregado. Recarregue a página.');
return;
}

console.log('✅ [AGENDAMENTO] window.supabase disponível');
console.log('🔍 [AGENDAMENTO] Supabase URL:', window.supabase.supabaseUrl);

// Configurar limites de data
const dataInput = document.getElementById('data');
const nascimentoInput = document.getElementById('nascimento');

if (dataInput) {
const hoje = new Date().toISOString().split('T')[0];
dataInput.min = hoje;
console.log('✅ [AGENDAMENTO] Data mínima definida:', hoje);
}

if (nascimentoInput) {
const dezoitoAnos = new Date();
dezoitoAnos.setFullYear(dezoitoAnos.getFullYear() - 18);
nascimentoInput.max = dezoitoAnos.toISOString().split('T')[0];
console.log('✅ [AGENDAMENTO] Data máxima (18 anos):', nascimentoInput.max);
}

// Handler de submissão do formulário
const form = document.getElementById('agendamento-form');
if (!form) {
console.error('❌ [AGENDAMENTO] Formulário #agendamento-form não encontrado!');
return;
}

form.addEventListener('submit', async function(e) {
e.preventDefault();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 [AGENDAMENTO] Iniciando submissão...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const submitBtn = document.getElementById('submit-btn');
const feedback = document.getElementById('form-feedback');
const formData = new FormData(form);

// Coletar dados
const dados = {
nome: formData.get('nome'),
email: formData.get('email'),
telefone: formData.get('telefone'),
nascimento: formData.get('nascimento'),
tipo_consulta: formData.get('tipo_consulta'),
data: formData.get('data'),
hora: formData.get('hora'),
observacoes: formData.get('observacoes')
};

console.log('📊 [AGENDAMENTO] Dados do formulário:', dados);

// Verificar Supabase novamente
if (!window.supabase) {
console.error('❌ [AGENDAMENTO] window.supabase NÃO disponível!');
feedback.textContent = '❌ Erro crítico: Sistema não carregado. Recarregue a página (F5).';
feedback.className = 'mt-4 p-4 bg-red-100 text-red-700 rounded-lg';
feedback.classList.remove('hidden');
submitBtn.disabled = false;
submitBtn.innerHTML = '<i class="fa-brands fa-whatsapp mr-2"></i>Confirmar Agendamento';
return;
}

// UI Feedback
submitBtn.disabled = true;
submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin mr-2"></i>A processar...';
feedback.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');

try {
console.log('🔄 [AGENDAMENTO] A conectar ao Supabase...');

// 1. Guardar no Supabase - aguardar confirmação antes de prosseguir
const { data, error } = await window.supabase
.from('agendamentos')
.insert([{
  cliente_nome: dados.nome,
  servico: dados.tipo_consulta,
  data: dados.data,
  hora: dados.hora + ':00',
  observacoes: dados.observacoes || null,
  status: 'pendente'
}])
.select();

console.log('📬 [AGENDAMENTO] Resposta do Supabase:');
console.log('  - Data:', data);
console.log('  - Error:', error);

if (error) {
console.error('❌ [AGENDAMENTO] ERRO ao inserir:', error);
console.error('❌ [AGENDAMENTO] Código de erro:', error.code);
console.error('❌ [AGENDAMENTO] Mensagem:', error.message);
console.error('❌ [AGENDAMENTO] Detalhe:', error.details);
console.error('❌ [AGENDAMENTO] Hint:', error.hint);

// Detectar tipo de erro
let errorMessage = '❌ Erro ao guardar agendamento. ';

if (error.message && error.message.includes('permission denied')) {
errorMessage += '\n\nPermissão negada! Execute o SQL no Supabase Dashboard:\nSQL_AGENDAMENTOS_FIX.sql';
} else if (error.message && error.message.includes('column does not exist')) {
errorMessage += '\n\nColuna não existe! Verifique o schema da tabela.';
} else if (error.message && error.message.includes('Failed to fetch')) {
errorMessage += '\n\nErro de conexão. Verifique sua internet.';
} else {
errorMessage += '\n\n' + (error.message || 'Erro desconhecido');
}

throw new Error(errorMessage);
}

console.log('✅ [AGENDAMENTO] Agendamento guardado com sucesso!');
console.log('✅ [AGENDAMENTO] ID criado:', data?.[0]?.id);

// 2. Notificação de sucesso clara
feedback.textContent = '✅ Agendamento feito com sucesso! A redirecionar para o WhatsApp...';
feedback.className = 'mt-4 p-4 bg-green-100 text-green-700 rounded-lg';
feedback.classList.remove('hidden');

// Atualizar passo visual para "3 - Confirmação"
const step3 = document.querySelector('.flex.items-center:last-child .w-10');
if (step3) {
step3.classList.remove('bg-gray-300', 'text-gray-600');
step3.classList.add('bg-cyan', 'text-white');
}

// 3. Redirecionamento após delay (2 segundos)
const mensagem = buildWhatsAppMessage(dados);
const mobile = isMobileDevice();

console.log('📱 [AGENDAMENTO] Dispositivo detectado:', mobile ? 'Mobile' : 'Desktop');

setTimeout(() => {
const url = buildWhatsAppUrl(WHATSAPP_CONFIG.phone, mensagem, mobile);

if (!url) {
    console.error('❌ [AGENDAMENTO] Falha ao construir URL do WhatsApp');
    feedback.textContent = '✅ Agendamento feito com sucesso! Contacte-nos pelo WhatsApp: +244 954 145 065';
    feedback.className = 'mt-4 p-4 bg-green-100 text-green-700 rounded-lg';
    form.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-brands fa-whatsapp mr-2"></i>Confirmar Agendamento';
    return;
}

console.log('🔗 [AGENDAMENTO] URL de redirecionamento:', url);
console.log('📱 [AGENDAMENTO] Tipo:', mobile ? 'wa.me (app nativo)' : 'WhatsApp Web');

// Mobile: location.href abre o app nativo (wa.me)
// Desktop: nova aba no WhatsApp Web (mantém o utilizador no site)
if (mobile) {
    window.location.href = url;
} else {
    window.open(url, '_blank');
}

// Reset form após redirect (caso o utilizador volte)
setTimeout(() => {
    form.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-brands fa-whatsapp mr-2"></i>Confirmar Agendamento';
    feedback.classList.add('hidden');
}, 500);
}, REDIRECT_DELAY_MS);

} catch (err) {
console.error('💥 [AGENDAMENTO] ERRO CRÍTICO:', err);
console.error('💥 [AGENDAMENTO] Stack:', err.stack);

feedback.textContent = err.message || '❌ Erro ao guardar agendamento. Tenta novamente ou contacta-nos.';
feedback.className = 'mt-4 p-4 bg-red-100 text-red-700 rounded-lg';
feedback.classList.remove('hidden');
submitBtn.disabled = false;
submitBtn.innerHTML = '<i class="fa-brands fa-whatsapp mr-2"></i>Confirmar Agendamento';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('❌ [AGENDAMENTO] Falha na submissão');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
});

console.log('✅ [AGENDAMENTO] Handler configurado com sucesso!');
});
