// ============================================
// AGENDAMENTO HANDLER - Viva Óptica
// Versão: 2.0 - Com Logs Detalhados e Debug
// ============================================

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

// Preparar objeto para inserção (CHAVES EXATAS DA TABELA)
const dadosParaInsercao = {
nome: dados.nome,
nome_cliente: dados.nome, // Alias para compatibilidade com admin
email: dados.email,
telefone: dados.telefone,
telefone_cliente: dados.telefone, // Alias para compatibilidade com admin
nascimento: dados.nascimento,
tipo: dados.tipo_consulta,
servico: dados.tipo_consulta, // Alias para compatibilidade com admin
data: dados.data,
hora: dados.hora,
observacoes: dados.observacoes || null,
status: 'pendente'
};

console.log('📦 [AGENDAMENTO] Objeto para inserção:', dadosParaInsercao);

// UI Feedback
submitBtn.disabled = true;
submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin mr-2"></i>A processar...';
feedback.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');

try {
console.log('🔄 [AGENDAMENTO] A conectar ao Supabase...');

// 1. Guardar no Supabase - APENAS colunas que existem na tabela agendamentos
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

// 2. Criar Mensagem WhatsApp
const mensagem = `*NOVO AGENDAMENTO - Viva Óptica*%0A%0A*Nome:* ${dados.nome}%0A*Email:* ${dados.email}%0A*Telefone:* ${dados.telefone}%0A*Nascimento:* ${dados.nascimento}%0A*Tipo:* ${dados.tipo_consulta}%0A*Data:* ${dados.data}%0A*Hora:* ${dados.hora}%0A*Observações:* ${dados.observacoes || 'Nenhuma'}`;

// 3. Feedback de Sucesso
feedback.textContent = '✅ Agendamento enviado com sucesso! Vamos abrir o WhatsApp para confirmar.';
feedback.className = 'mt-4 p-4 bg-green-100 text-green-700 rounded-lg';
feedback.classList.remove('hidden');

console.log('🎉 [AGENDAMENTO] Sucesso! Redirecionando para WhatsApp...');

// 4. Redirecionar para WhatsApp
setTimeout(() => {
window.open(`https://wa.me/244954145065?text=${mensagem}`, '_blank');
form.reset();
submitBtn.disabled = false;
submitBtn.innerHTML = '<i class="fa-brands fa-whatsapp mr-2"></i>Confirmar Agendamento';
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ [AGENDAMENTO] Processo concluído!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}, 1500);

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
