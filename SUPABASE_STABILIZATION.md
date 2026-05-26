# 🔧 Estabilização da Conexão Supabase - Viva Óptica

## ✅ Alterações Aplicadas

### 1. Validação Rigorosa de Credenciais (`supabaseClient.js`)
- ✅ Verificação se `SUPABASE_URL` e `SUPABASE_ANON_KEY` não estão vazias
- ✅ Validação de formato HTTPS
- ✅ Limpeza de espaços em branco com `.trim()`
- ✅ Fallback automático para valores padrão se necessário

### 2. Retentativa Automática (`login-handler.js`)
- ✅ Lógica de retry com máximo de 2 tentativas
- ✅ Delay de 2 segundos entre tentativas
- ✅ Detecção automática de erros de rede ("Failed to fetch")
- ✅ Logs detalhados em cada tentativa

### 3. Detecção Offline (`login-handler.js`)
- ✅ Verificação `navigator.onLine` antes de tentar login
- ✅ Mensagem amigável ao utilizador quando offline
- ✅ Bloqueio preventivo de tentativas inúteis

### 4. Limpeza de Sessão (`login-handler.js`)
- ✅ `supabase.auth.signOut()` executado antes de cada login
- ✅ Prevenção de sessões corrompidas
- ✅ Limpeza de cache de autenticação

### 5. Redirecionamentos Relativos
- ✅ Uso de `./index.html` em vez de caminhos absolutos
- ✅ Compatibilidade com diferentes portas e protocolos

---

## 🧪 Como Testar a Conexão

### Método 1: Teste Automático (ao carregar a página)
1. Acesse `http://localhost:8000/admin/login.html`
2. Abra a consola do navegador (F12)
3. Observe os logs de inicialização do Supabase

### Método 2: Teste Manual na Consola
1. Abra a página de login: `http://localhost:8000/admin/login.html`
2. Abra a consola do navegador (F12)
3. Copie e cole este comando:

```javascript
await testSupabaseConnection()
```

Este teste verifica:
- ✅ Se o projeto Supabase está acessível
- ✅ Se a autenticação funciona
- ✅ Se a base de dados responde

### Método 3: Script Completo de Teste
1. Abra a consola do navegador (F12)
2. Copie o conteúdo completo de `admin/console-test.js`
3. Cole na consola e prima Enter
4. Observe os resultados dos 3 testes

---

## 🔍 Diagnóstico de Erros

### Erro: "Failed to fetch"

**Causas possíveis:**
1. **Projeto Supabase inativo**
   - Verifique em: https://supabase.com/dashboard/project/hbcjjhmdgftgzrlmqfxk
   - Status deve ser "Active"

2. **CORS não configurado**
   - Siga o guia `CORS_SETUP.md`
   - Adicione `http://localhost:8000` aos Allowed Origins

3. **URL incorreta**
   - Verifique em `supabaseClient.js`
   - URL deve ser: `https://hbcjjhmdgftgzrlmqfxk.supabase.co`

4. **Firewall/Antivírus bloqueando**
   - Desative temporariamente para teste
   - Adicione exceção para o navegador

5. **Está a usar file:// em vez de http://**
   - ❌ NÃO use: `file:///C:/Users/.../admin/login.html`
   - ✅ USE: `http://localhost:8000/admin/login.html`

### Erro: "Offline" ou "Você está offline"

**Solução:**
1. Verifique sua conexão à internet
2. Teste acessar https://supabase.com no navegador
3. Verifique se não está em modo avião
4. Reinicie o router/modem se necessário

### Erro: "Invalid login credentials"

**Solução:**
1. Verifique se o email está correto
2. Verifique se a senha está correta
3. Confirme se o email foi confirmado (verifique spam)
4. Se necessário, redefina a senha

---

## 🌐 URLs Importantes

| Serviço | URL |
|---------|-----|
| Dashboard Supabase | https://supabase.com/dashboard/project/hbcjjhmdgftgzrlmqfxk |
| Configurações API | https://supabase.com/dashboard/project/hbcjjhmdgftgzrlmqfxk/settings/api |
| Authentication | https://supabase.com/dashboard/project/hbcjjhmdgftgzrlmqfxk/auth/users |
| SQL Editor | https://supabase.com/dashboard/project/hbcjjhmdgftgzrlmqfxk/sql |
| Local (dev) | http://localhost:8000/admin/login.html |

---

## 📋 Checklist de Validação

Antes de considerar o sistema estável, verifique:

- [ ] Server HTTP rodando em `http://localhost:8000`
- [ ] CORS configurado no Supabase com `http://localhost:8000`
- [ ] Projeto Supabase status "Active"
- [ ] Teste de conexão na consola retorna ✅
- [ ] Login funciona sem erros "Failed to fetch"
- [ ] Mensagem offline aparece quando desliga internet
- [ ] Retry automático funciona (verificar logs F12)
- [ ] Redirecionamento após login funciona corretamente

---

## 🛠️ Comandos Úteis

### Verificar se server está rodando:
```bash
netstat -ano | findstr :8000
```

### Parar server existente:
```bash
taskkill /PID <PID> /F
```

### Iniciar server novo:
```bash
npx http-server -p 8000 --cors -c-1
```

### Testar conexão com curl:
```bash
curl -H "apikey: YOUR_KEY" https://hbcjjhmdgftgzrlmqfxk.supabase.co/rest/v1/
```

---

## 📞 Suporte

Se todos os testes falharem:

1. Verifique os logs na consola (F12)
2. Execute o teste manual `testSupabaseConnection()`
3. Verifique se o servidor HTTP está rodando
4. Confirme as configurações de CORS no Supabase
5. Contacte o desenvolvedor com os logs completos

---

**Última atualização:** 2026-04-30
**Versão:** 1.0
