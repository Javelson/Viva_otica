# Plano de Resolução de Erros de Conexão - Viva Óptica

**Data:** 2026-05-16

## Problemas Identificados

### 1. Erro `ERR_CONNECTION_CLOSED` - Recursos Externos Não Acessíveis

**Recursos problemáticos:**
| Recurso | URL | Impacto |
|---------|-----|---------|
| Supabase SDK | `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` | Cliente Supabase não carrega |
| Tailwind CSS | `https://cdn.tailwindcss.com/3.4.17` | Estilos não aplicam |
| FontAwesome | `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/` | Ícones não mostram |
| Google Fonts | `https://fonts.googleapis.com/css2?family=Inter` | Fonte não carrega |
| Placeholder Images | `https://via.placeholder.com/150` | Imagens de produtos falham |

### 2. Dependência de `supabaseClient.js` para SDK do Supabase

O arquivo `supabaseClient.js` assume que `window.supabase` já está definido (da CDN), mas a CDN está falhando.

## Soluções Propostas

### Opção A: Download Manual dos Recursos (Recomendado)

**Passos:**
1. Baixar manual dos CDNs:
   - `supabase-js@2` → salvar em `/js/libs/supabase.min.js`
   - `tailwind@3.4.17` → salvar em `/css/tailwind.css`
   - `font-awesome` → salvar em `/css/font-awesome.min.css` + `/fonts/`
   - `Google Fonts Inter` → incluir via fallback systemic font

2. Alterar os HTML:
   ```html
   <!-- De: -->
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <!-- Para: -->
   <script src="js/libs/supabase.min.js"></script>
   ```

**Vantagens:**
- Funciona offline/local
- Não depende de conexões externas
- Mais rápido

**Desvantagens:**
- Requer download manual
- Atualizações futuras mais complexas

---

### Opção B: Alternativas Fallback em Linha

**Para o Supabase SDK:**
Manter a CDN como primária e adicionar fallback:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  if (typeof supabase === 'undefined') {
    document.write('<script src="js/libs/supabase.min.js"><\/script>');
  }
</script>
```

**Para Tailwind:**
Usar `<style>` inline com CSS mínimo ou carregar do arquivo local:
```html
<link rel="stylesheet" href="css/tailwind.css">
```

**Para FontAwesome:**
Usar SVG inline para ícones essenciais:
```html
<svg class="icon"><use xlink:href="#fa-user"></use></svg>
```

**Para Google Fonts:**
Usar `font-family: system-ui, -apple-system, sans-serif;` como fallback.

**Para Imagens placeholder:**
Usar data URL já implementado:
```javascript
'data:image/svg+xml,%3Csvg...'
```

---

### Opção C: Corrigir Problema de Rede Local

**Causas possíveis:**
1. Firewall/Antivírus bloqueando CDNs
2. DNS não resolvendo registos
3. Conexão instável

**Soluções:**
1. Alterar DNS para 8.8.8.8 (Google) ou 1.1.1.1 (Cloudflare)
2. Desativar firewall temporariamente para teste
3. Verificar proxy/VPN

---

## Execução Imediata (2026-05-16)

### Tarefa 1: Verificar Status de Todos os Recursos
```bash
# Testar conectividade
curl -I https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
curl -I https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
curl -I https://fonts.googleapis.com/css2?family=Inter
```

### Tarefa 2: Criar Estrutura de Arquivos Locais
```
viva-optica/
├── js/
│   └── libs/
│       ├── supabase.min.js          # baixar da CDN
│       └── sortable.min.js          # baixar da CDN
├── css/
│   ├── tailwind.css                 # baixar da CDN
│   ├── font-awesome.css             # baixar da CDN
│   └── font-awesome/
│       ├── fonts/                   # baixar woff/woff2
│       └── css/
└── log/
```

### Tarefa 3: Atualizar Referências nos HTMLs
- `admin/index.html`
- `admin/pages/produtos.html`
- `admin/pages/slideshow.html`
- `admin/login.html`
- `index.html`
- `index2.html`
- `agendamento.html`
- `catalogo.html`

### Tarefa 4: Garantir Fallback no produtos.html
- Verificar que imagens usam data URL
- Verificar que `supabaseClient.js` está sendo carregado
- Verificar que `getSupabase()` funciona
- Adicionar logs no console para debug

---

## Checklist Final

- [ ] Todos os recursos externos substituídos ou fallback implementado
- [ ] `supabaseClient.js` carrega Supabase SDK
- [ ] `getSupabase()` retorna client válido
- [ ] `renderCards()` executa sem erros
- [ ] Toggle de visibilidade de produtos funciona
- [ ] Slideshow drag-and-drop funciona
- [ ] Imagens de produtos mostram placeholder local
- [ ] Ícones mostram (FontAwesome ou SVG inline)
- [ ] Estilos aplicam (Tailwind ou CSS equivalente)