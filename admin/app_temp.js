async function showManualAppointmentForm() {
 const main = document.getElementById('main-content');
 const modal = document.createElement('div');
 modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

 modal.innerHTML = `
 <div class="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
 <div class="flex items-center justify-between mb-6">
 <h3 class="text-2xl font-bold text-gray-800">
 <i class="fa-solid fa-calendar-plus text-green-600 mr-2"></i>
 Novo Agendamento
 </h3>
 <button type="button" onclick="closeModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
 <i class="fa-solid fa-times text-xl"></i>
 </button>
 </div>

 <form id="appointment-form" class="space-y-5">
 <!-- Nome do Cliente -->
 <div>
 <label class="block text-sm font-semibold text-gray-700 mb-2">
 Nome do Cliente <span class="text-red-500">*</span>
 </label>
 <div class="relative">
 <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <i class="fa-solid fa-user text-gray-400"></i>
 </div>
 <input
 type="text"
 id="nome_cliente"
 name="nome_cliente"
 required
 placeholder="Digite o nome completo"
 class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
 oninput="validateField(this)"
 >
 </div>
 <p class="mt-1 text-sm text-red-600 hidden" id="error-nome_cliente"></p>
 </div>

 <!-- Telefone e Email -->
 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label class="block text-sm font-semibold text-gray-700 mb-2">
 Telefone <span class="text-red-500">*</span>
 </label>
 <div class="relative">
 <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <i class="fa-solid fa-phone text-gray-400"></i>
 </div>
 <input
 type="tel"
 id="telefone_cliente"
 name="telefone_cliente"
 required
 placeholder="923 456 789"
 pattern="[0-9]{9}"
 class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
 oninput="validateField(this)"
 >
 </div>
 <p class="mt-1 text-sm text-red-600 hidden" id="error-telefone_cliente"></p>
 </div>

 <div>
 <label class="block text-sm font-semibold text-gray-700 mb-2">
 Email
 </label>
 <div class="relative">
 <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <i class="fa-solid fa-envelope text-gray-400"></i>
 </div>
 <input
 type="email"
 id="cliente_email"
 name="cliente_email"
 placeholder="cliente@email.com"
 class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
 oninput="validateField(this)"
 >
 </div>
 <p class="mt-1 text-sm text-red-600 hidden" id="error-cliente_email"></p>
 </div>
 </div>

 <!-- Servico -->
 <div>
 <label class="block text-sm font-semibold text-gray-700 mb-2">
 Servico <span class="text-red-500">*</span>
 </label>
 <div class="relative">
 <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <i class="fa-solid fa-glasses text-gray-400"></i>
 </div>
 <select
 id="servico"
 name="servico"
 required
 class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none appearance-none bg-white"
 onchange="validateField(this)"
 >
 <option value="">Selecione um servico</option>
 <option value="Consulta de Visao">Consulta de Visao</option>
 <option value="Exame de Visao">Exame de Visao</option>
 <option value="Consulta de Optometria">Consulta de Optometria</option>
 <option value="Ajuste de Armacao">Ajuste de Armacao</option>
 <option value="Reparacao de Armacao">Reparacao de Armacao</option>
 <option value="Compra de Armacao">Compra de Armacao</option>
 <option value="Compra de Lentes">Compra de Lentes</option>
 <option value="Outro">Outro</option>
 </select>
 <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
 <i class="fa-solid fa-chevron-down text-gray-400"></i>
 </div>
 </div>
 <p class="mt-1 text-sm text-red-600 hidden" id="error-servico"></p>
 </div>

 <!-- Data e Hora -->
 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label class="block text-sm font-semibold text-gray-700 mb-2">
 Data <span class="text-red-500">*</span>
 </label>
 <div class="relative">
 <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <i class="fa-solid fa-calendar text-gray-400"></i>
 </div>
 <input
 type="date"
 id="data"
 name="data"
 required
 class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
 onchange="validateField(this)"
 >
 </div>
 <p class="mt-1 text-sm text-red-600 hidden" id="error-data"></p>
 </div>

 <div>
 <label class="block text-sm font-semibold text-gray-700 mb-2">
 Horario
 </label>
 <div class="relative">
 <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <i class="fa-solid fa-clock text-gray-400"></i>
 </div>
 <input
 type="time"
 id="hora"
 name="hora"
 class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
 onchange="validateField(this)"
 >
 </div>
 <p class="mt-1 text-sm text-red-600 hidden" id="error-hora"></p>
 </div>
 </div>

 <!-- Observacoes -->
 <div>
 <label class="block text-sm font-semibold text-gray-700 mb-2">
 Observacoes
 </label>
 <div class="relative">
 <div class="absolute top-3 left-3 pointer-events-none">
 <i class="fa-solid fa-note-sticky text-gray-400"></i>
 </div>
 <textarea
 id="observacoes"
 name="observacoes"
 rows="4"
 placeholder="Adicione notas ou informacoes adicionais..."
 class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none resize-none"
 ></textarea>
 </div>
 </div>

 <!-- botoes de Acao -->
 <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
 <button
 type="button"
 onclick="cancelForm()"
 class="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
 >
 <i class="fa-solid fa-times mr-2"></i>Cancelar
 </button>
 <button
 type="submit"
 id="submit-btn"
 class="px-6 py-3 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <i class="fa-solid fa-calendar-check mr-2"></i>Agendar
 </button>
 </div>
 </form>
 </div>
 `;

 main.appendChild(modal);

 // Definir data minima como hoje
 const today = new Date().toISOString().split('T')[0];
 modal.querySelector('#data').setAttribute('min', today);

 // Funcao para fechar modal
 window.closeModal = function() {
 modal.remove();
 };

 // Funcao para cancelar e limpar
 window.cancelForm = function() {
 const form = modal.querySelector('#appointment-form');
 form.reset();
 closeModal();
 };

 // Funcao de validacao
 window.validateField = function(field) {
 const errorEl = document.getElementById(`error-${field.name}`);
 if (!errorEl) return;

 let isValid = true;
 let errorMessage = '';

 if (field.required && !field.value.trim()) {
 isValid = false;
 errorMessage = 'Este campo é obrigatorio';
 } else if (field.type === 'email' && field.value && !/\S+@\S+\.\S+/.test(field.value)) {
 isValid = false;
 errorMessage = 'Email invalido';
 } else if (field.name === 'telefone_cliente' && field.value && !/^\d{9}$/.test(field.value.replace(/\s/g, ''))) {
 isValid = false;
 errorMessage = 'Telefone deve ter 9 digitos';
 } else if (field.name === 'data' && field.value) {
 const selectedDate = new Date(field.value);
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 if (selectedDate < today) {
 isValid = false;
 errorMessage = 'Não é possivel agendar datas passadas';
 }
 }

 if (isValid) {
 field.classList.remove('border-red-500', 'border-red-300');
 field.classList.add('border-green-500', 'border-green-300');
 errorEl.classList.add('hidden');
 } else {
 field.classList.remove('border-green-500', 'border-green-300');
 field.classList.add('border-red-500', 'border-red-300');
 errorEl.textContent = errorMessage;
 errorEl.classList.remove('hidden');
 }

 updateSubmitButton();
 };

 // Atualizar estado do botao de submit
 function updateSubmitButton() {
 const form = modal.querySelector('#appointment-form');
 const submitBtn = modal.querySelector('#submit-btn');
 const isValid = form.checkValidity();

 submitBtn.disabled = !isValid;
 }

 // Listener para validar todo o formulario
 modal.querySelector('#appointment-form').addEventListener('input', updateSubmitButton);
 modal.querySelector('#appointment-form').addEventListener('change', updateSubmitButton);

 // Submit do formulario
 modal.querySelector('#appointment-form').addEventListener('submit', async (e) => {
 e.preventDefault();

 const form = e.target;
 const submitBtn = modal.querySelector('#submit-btn');

 // Desativar botao para prevenir cliques duplos
 submitBtn.disabled = true;
 submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Processando...';

 const formData = new FormData(form);

 try {
 const supabase = await window.getSupabase();
 const dataValor = formData.get('data');
 const horaValor = formData.get('hora');
 let finalData = dataValor;

 if (horaValor && horaValor.includes(':')) {
 finalData = `${dataValor}T${horaValor}`;
 }

 const { error: apptError } = await supabase.from('agendamentos').insert([{
 nome_cliente: formData.get('nome_cliente').trim(),
 telefone_cliente: formData.get('telefone_cliente').trim(),
 cliente_email: formData.get('cliente_email')?.trim() || null,
 servico: formData.get('servico'),
 data: finalData,
 hora: horaValor || null,
 observacoes: formData.get('observacoes')?.trim() || null,
 status: 'pendente'
 }]);

 if (apptError) {
 console.error('Erro ao salvar agendamento:', apptError);
 throw apptError;
 }

 // Sucesso
 modal.remove();
 loadAgendamentos();
 showToast('Agendamento criado com sucesso!', 'success');

 } catch (error) {
 console.error('Erro ao criar agendamento:', error);
 showToast('Erro ao criar agendamento: ' + error.message, 'error');

 // Reativar botao
 submitBtn.disabled = false;
 submitBtn.innerHTML = '<i class="fa-solid fa-calendar-check mr-2"></i>Agendar';
 }
 });
}
