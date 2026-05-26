# 🔧 Configuração de CORS no Supabase

## 🚨 Problema: "Failed to fetch"

Este erro ocorre quando o navegador bloqueia a conexão com o Supabase devido a políticas de CORS.

---

## ✅ SOLUÇÃO: Configurar CORS no Supabase

### Passo 1: Acessar o Dashboard do Supabase

1. Vá para: https://supabase.com/dashboard
2. Selecione o projeto: **Viva_otica**

### Passo 2: Configurar CORS

1. No menu lateral, vá para: **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Encontre a seção **Request Policy** ou **CORS**
4. Adicione os seguintes domínios ao **Allowed Origins**:

```
http://localhost:8000
http://127.0.0.1:8000
http://localhost:3000
http://127.0.0.1:3000
*
```

**Nota:** Use `*` para desenvolvimento (permite todos os domínios). Para produção, especifique apenas o seu domínio real.

### Passo 3: Verificar Configurações de Auth

1. No menu lateral, vá para: **Authentication** > **Settings**
2. Verifique **Email Auth**:
   - ✅ Enable email confirmations (opcional para desenvolvimento)
   - ✅ Enable double opt-in (opcional)
3. Em **Redirect URLs**, adicione:
   ```
   http://localhost:8000/admin/index.html
   http://localhost:8000/admin/login.html
   ```

### Passo 4: Salvar e Testar

1. Clique em **Save** no final da página
2. Aguarde 1-2 minutos para as mudanças aplicar
3. Recarregue a página de login (F5)
4. Tente fazer login novamente

---

## 🔍 Diagnóstico Rápido

### Se ainda receber "Failed to fetch":

1. **Verifique o Console (F12)**
   - Procure por mensagens de erro CORS
   - Verifique se a URL do Supabase está correta

2. **Teste a conexão:**
   ```javascript
   // No console do navegador (F12)
   fetch('https://hbcjjhmdgftgzrlmqfxk.supabase.co/rest/v1/', {
     headers: {
       'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiY2pqaG1kZ2Z0Z3pybG1xZnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODQyNzMsImV4cCI6MjA2MjE2MDI3M30.J6s4p3p8y8cF8J5f5H5K5L5M5N5O5P5Q5R5S5T5U5V5'
     }
   })
   .then(r => console.log('✅ Conexão OK:', r.status))
   .catch(e => console.error('❌ Erro:', e));
   ```

3. **Verifique se o projeto está ativo:**
   - Vá para: https://supabase.com/dashboard/project/hbcjjhmdgftgzrlmqfxk
   - O status deve ser "Active"

---

## 🌐 URLs Importantes

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Projeto Viva_otica:** https://supabase.com/dashboard/project/hbcjjhmdgftgzrlmqfxk
- **SQL Editor:** https://supabase.com/dashboard/project/hbcjjhmdgftgzrlmqfxk/sql
- **Authentication:** https://supabase.com/dashboard/project/hbcjjhmdgftgzrlmqfxk/auth/users

---

## 📋 Checklist Final

- [ ] CORS configurado com `http://localhost:8000`
- [ ] Projeto Supabase está "Active"
- [ ] Email Auth habilitado
- [ ] Redirecionamentos configurados
- [ ] Teste de conexão bem-sucedido no console
- [ ] Login funciona sem erros "Failed to fetch"

---

**Após configurar CORS, recarregue a página e tente login novamente!**
