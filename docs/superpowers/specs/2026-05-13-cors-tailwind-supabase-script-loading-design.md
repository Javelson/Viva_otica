# Fix CORS and Script Loading Errors

**Date:** 2026-05-13
**Status:** Approved

## Context

When running the Viva Optica site via VS Code Live Server (`127.0.0.1:5500`), two critical errors block the site from working:

1. **Tailwind CSS CDN blocked by CORS** — `cdn.tailwindcss.com` returns no `Access-Control-Allow-Origin` header, so the browser rejects the script. This breaks all styling and causes `tailwind is not defined` when the inline `tailwind.config` runs.
2. **Supabase SDK not loaded** — `index.html` and `paginas/produtos.html` load `supabaseClient.js` without first loading the `@supabase/supabase-js@2` SDK. The IIFE in `supabaseClient.js` checks `typeof supabase === 'undefined'` and bails out, leaving the client uninitialized.

Only `agendamento.html` and `admin/index.html` properly include both the SDK CDN and `supabaseClient.js` in the correct order.

## Design

### Change 1: Fix Tailwind CORS — Switch to versioned CDN URL

Replace in all HTML files:
```html
<script src="https://cdn.tailwindcss.com"></script>
```
with:
```html
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
```

The versioned URL includes proper CORS headers and works with Live Server.

**Files to modify:**
- `index.html`
- `agendamento.html`
- `paginas/armacoes.html`
- `paginas/produtos.html`
- `paginas/servicos.html`
- `paginas/sobre.html`
- `paginas/contacto.html`
- `admin/index.html`
- `admin/login.html`

### Change 2: Add Supabase SDK CDN to pages that need it

Add `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>` before `supabaseClient.js` in pages that use Supabase but are missing the SDK.

**Files to modify:**
- `index.html` — add SDK CDN before `supabaseClient.js` in `<body>`
- `paginas/produtos.html` — add SDK CDN before `../supabaseClient.js` in `<body>`

## Verification

After changes, open each modified page in the browser and confirm:
1. No CORS error for Tailwind in the console
2. `tailwind.config` applies without `ReferenceError`
3. `supabaseClient.js` logs `✅ [SUPABASE] Módulo v9.0 carregado!`
4. Products/carousel load data from Supabase (not static fallback)
