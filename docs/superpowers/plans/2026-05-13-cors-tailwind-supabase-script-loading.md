# Fix CORS and Script Loading Errors — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Tailwind CDN CORS blocking and missing Supabase SDK on pages that need it.

**Architecture:** Replace the unversioned Tailwind CDN URL with a versioned one that includes CORS headers. Add the Supabase SDK CDN script tag before `supabaseClient.js` in the two HTML files that are missing it.

**Tech Stack:** Static HTML/JS, Tailwind CSS CDN, Supabase JS SDK v2 CDN

**Spec:** `docs/superpowers/specs/2026-05-13-cors-tailwind-supabase-script-loading-design.md`

---

## File Structure

| File | Change | Purpose |
|---|---|---|
| `index.html` | Modify line 8, add script before line 207 | Fix Tailwind CORS + add Supabase SDK |
| `agendamento.html` | Modify line 7 | Fix Tailwind CORS |
| `paginas/armacoes.html` | Modify line 9 | Fix Tailwind CORS |
| `paginas/produtos.html` | Modify line 9, add script before line 159 | Fix Tailwind CORS + add Supabase SDK |
| `paginas/servicos.html` | Modify line 7 | Fix Tailwind CORS |
| `paginas/sobre.html` | Modify line 9 | Fix Tailwind CORS |
| `paginas/contacto.html` | Modify line 9 | Fix Tailwind CORS |
| `admin/index.html` | Modify line 8 | Fix Tailwind CORS |
| `admin/login.html` | Modify line 7 | Fix Tailwind CORS |

All paths are relative to `viva-optica/viva-optica/`.

---

### Task 1: Replace Tailwind CDN URL in all 9 HTML files

**Files:**
- Modify: `index.html:8`
- Modify: `agendamento.html:7`
- Modify: `paginas/armacoes.html:9`
- Modify: `paginas/produtos.html:9`
- Modify: `paginas/servicos.html:7`
- Modify: `paginas/sobre.html:9`
- Modify: `paginas/contacto.html:9`
- Modify: `admin/index.html:8`
- Modify: `admin/login.html:7`

- [ ] **Step 1: Replace Tailwind CDN in `index.html` (line 8)**

Current:
```html
<script src="https://cdn.tailwindcss.com" crossorigin="anonymous"></script>
```

Replace with:
```html
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
```

- [ ] **Step 2: Replace Tailwind CDN in `agendamento.html` (line 7)**

Current:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

Replace with:
```html
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
```

- [ ] **Step 3: Replace Tailwind CDN in `paginas/armacoes.html` (line 9)**

Current:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

Replace with:
```html
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
```

- [ ] **Step 4: Replace Tailwind CDN in `paginas/produtos.html` (line 9)**

Current:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

Replace with:
```html
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
```

- [ ] **Step 5: Replace Tailwind CDN in `paginas/servicos.html` (line 7)**

Current:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

Replace with:
```html
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
```

- [ ] **Step 6: Replace Tailwind CDN in `paginas/sobre.html` (line 9)**

Current:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

Replace with:
```html
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
```

- [ ] **Step 7: Replace Tailwind CDN in `paginas/contacto.html` (line 9)**

Current:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

Replace with:
```html
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
```

- [ ] **Step 8: Replace Tailwind CDN in `admin/index.html` (line 8)**

Current:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

Replace with:
```html
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
```

- [ ] **Step 9: Replace Tailwind CDN in `admin/login.html` (line 7)**

Current:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

Replace with:
```html
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
```

- [ ] **Step 10: Verify all 9 files were updated**

Run:
```bash
grep -rn "cdn.tailwindcss.com" --include="*.html" "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica"
```

Expected: Every match shows `/3.4.17` — no bare `cdn.tailwindcss.com"></script>` remains.

- [ ] **Step 11: Commit**

```bash
cd "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica"
git add index.html agendamento.html paginas/armacoes.html paginas/produtos.html paginas/servicos.html paginas/sobre.html paginas/contacto.html admin/index.html admin/login.html
git commit -m "fix: switch Tailwind CDN to versioned URL to resolve CORS blocking"
```

---

### Task 2: Add Supabase SDK CDN to `index.html`

**Files:**
- Modify: `index.html:207`

- [ ] **Step 1: Add Supabase SDK script tag before `supabaseClient.js`**

Current (lines 206-208):
```html

<script src="supabaseClient.js"></script>
<script src="script.js"></script>
```

Replace with:
```html

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabaseClient.js"></script>
<script src="script.js"></script>
```

- [ ] **Step 2: Verify the change**

Run:
```bash
grep -n "supabase-js" "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica\index.html"
```

Expected: One match showing the SDK script tag appears before `supabaseClient.js`.

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica"
git add index.html
git commit -m "fix: add Supabase SDK CDN to index.html to resolve init failure"
```

---

### Task 3: Add Supabase SDK CDN to `paginas/produtos.html`

**Files:**
- Modify: `paginas/produtos.html:159`

- [ ] **Step 1: Add Supabase SDK script tag before `supabaseClient.js`**

Current (lines 158-160):
```html
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<script src="../supabaseClient.js"></script>
<script src="produtos.js"></script>
```

Replace with:
```html
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../supabaseClient.js"></script>
<script src="produtos.js"></script>
```

- [ ] **Step 2: Verify the change**

Run:
```bash
grep -n "supabase-js" "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica\paginas\produtos.html"
```

Expected: One match showing the SDK script tag appears before `../supabaseClient.js`.

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\viva-optica\viva-optica"
git add paginas/produtos.html
git commit -m "fix: add Supabase SDK CDN to produtos.html to resolve init failure"
```

---

## Verification

After all tasks are complete, open each modified page in the browser via Live Server and confirm:

1. **No CORS error** for Tailwind in the browser console
2. **No `tailwind is not defined`** error
3. **`supabaseClient.js` logs** `✅ [SUPABASE] Módulo v9.0 carregado!` (not the SDK missing error)
4. **Products/carousel load** data from Supabase (not static fallback)

---

## Self-Review

- **Spec coverage:** Task 1 covers Change 1 (Tailwind URL). Tasks 2-3 cover Change 2 (Supabase SDK). All spec requirements mapped.
- **Placeholder scan:** No TBD/TODO. All code blocks contain actual content. All commands are exact.
- **Type consistency:** N/A — no types/functions defined. Only HTML attribute changes.
- **No gaps found.**
