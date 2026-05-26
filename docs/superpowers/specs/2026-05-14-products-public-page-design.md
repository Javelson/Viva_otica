# Products Public Page Redesign — Design Spec

**Date:** 2026-05-14
**Status:** Approved
**Approach:** Refactor existing `produtos.js`

---

## 1. Overview

Redesign the public-facing product display to dynamically load and show products from the Supabase `produtos` table. Consolidate `armacoes.html` and `produtos.html` into a single page with category filters. Add a product detail modal and skeleton loading. Update the homepage featured products section to load real data.

## 2. Architecture

### Pages affected

| File | Change |
|------|--------|
| `paginas/produtos.html` | Rewrite main content (hero + filters + grid). Reuse header/nav/footer shell |
| `paginas/produtos.js` | Full rewrite — new query, filter, card, modal, skeleton logic |
| `paginas/armacoes.html` | Replace content with redirect to `produtos.html?cat=armacao` |
| `index.html` | Replace static "Produtos em Destaque" cards with dynamic Supabase load |
| `script.js` | Add featured products query + reuse card/modal rendering functions |
| All nav HTML files | Update "Armações" link to `produtos.html?cat=armacao` |

### Data flow

1. Page loads → skeleton cards appear
2. JS queries Supabase: `SELECT * FROM produtos WHERE ativo = true AND estoque > 0`
3. If URL has `?cat=armacao`, filter "Armações" is pre-activated
4. Products rendered in responsive grid (1/2/3 columns)
5. Click on card → detail modal opens with WhatsApp button
6. Category filter change → client-side re-render (no new query)
7. Products stored in `window.produtosData` after initial load

### Supabase query

```sql
SELECT * FROM produtos WHERE ativo = true AND estoque > 0
```

Homepage featured (4 random):

```sql
SELECT * FROM produtos WHERE ativo = true AND estoque > 0 ORDER BY random() LIMIT 4
```

## 3. Product Card

```
┌─────────────────────┐
│ ┌───────────────┐   │
│ │               │   │
│ │    IMAGEM     │   │
│ │    (16:9)     │   │
│ │               │   │
│ └───────────────┘   │
│  Nome do Produto    │
│  15.000 Kz          │
│  [Ver Detalhes]     │
└─────────────────────┘
```

- Image: `object-cover`, aspect-ratio 16:9, rounded top corners
- Placeholder: inline SVG (glasses icon + "Sem imagem") when `imagem_url` is null
- Name: 1-2 lines with `line-clamp-2`, truncate with `...`
- Price: `cyan` color, font-weight 600, format `15.000 Kz`
- Button "Ver Detalhes": outline navy, hover fill navy + white text
- Card hover: `shadow-lg` + `scale(1.02)` with transition

## 4. Product Detail Modal

```
┌──────────────────────────────────┐
│ ✕                                │
│ ┌──────────┐  Nome Produto      │
│ │          │  Armação           │
│ │  IMAGEM  │  15.000 Kz         │
│ │ (maior)  │                    │
│ │          │  Armação — Nome    │
│ └──────────┘                    │
│                                 │
│  [Comprar via WhatsApp]         │
└──────────────────────────────────┘
```

- Dark semi-transparent overlay, closes on outside click or ✕ button
- Desktop: horizontal layout (image left + info right)
- Mobile: vertical layout (image top + info below)
- Auto-generated description: `"{Categoria} — {nome}"` (see rules below)
- WhatsApp button: green (#25D366), WhatsApp icon, opens `wa.me/{numero}?text=...`
- WhatsApp number: from `configuracoes_loja` table (`whatsapp` field), hardcoded fallback

### Description auto-generation rules

| `categoria` | Description |
|---|---|
| `armacao` | `Armação — {nome}` |
| `lente` | `Lente — {nome}` |
| `acessorio` | `Acessório — {nome}` |
| null/other | `Viva Ótica — {nome}` |

### WhatsApp Number

- Default fallback: `244954145065` (from `index.html` and `agendamento.html`)
- Future enhancement: load from `configuracoes_loja.whatsapp` field

### WhatsApp message

```
Olá! Gostaria de saber mais sobre o produto: {nome} — {preco}
```

## 5. Category Filters

```
┌─────────────────────────────────────────────┐
│ [Todos]  [Armações]  [Lentes]  [Acessórios] │
└─────────────────────────────────────────────┘
```

- Horizontal pill buttons, scrollable on mobile
- Active: `cyan` background, white text, `rounded-full`
- Inactive: transparent background, `navy` text, light `navy` border, hover `cyan/10`
- Categories mapped from DB `categoria` field: `armacao`, `lente`, `acessorio`
- "Todos" shows all products (no filter)
- Pre-select from URL `?cat=` parameter on page load
- Filter change → client-side re-render (data in memory), no new Supabase query
- Transition: cards fade out (`opacity-0`) then fade in (`opacity-1` + `translateY`)

## 6. Skeleton Loading

- 6 skeleton cards (2 rows of 3 on desktop)
- Same dimensions as real cards
- `pulse` animation (opacity 0.3 → 0.6)
- Replaced by real grid when data arrives

## 7. Empty State

- Icon: Font Awesome search/magnifying glass
- Text: "Nenhum produto encontrado nesta categoria."
- Gray text, centered, generous vertical margin

## 8. Homepage Featured Products

- Replaces 4 static cards in "Produtos em Destaque" section
- Query: `ORDER BY random() LIMIT 4`
- Same card component and modal as products page
- Section title stays "Produtos em Destaque"
- Add "Ver Todos os Produtos →" link at bottom, pointing to `paginas/produtos.html`
- Fallback: if Supabase fails or no products, show current static cards

## 9. Armações Redirect

- `armacoes.html` content replaced with redirect only
- JS: `window.location.href = '../paginas/produtos.html?cat=armacao'`
- Backup: `<meta http-equiv="refresh" content="0;url=../paginas/produtos.html?cat=armacao">`

## 10. Navigation Updates

- "Armações" link → `paginas/produtos.html?cat=armacao`
- "Produtos" link → `paginas/produtos.html`
- Remove hardcoded `nav-link-active` — JS detects current page and marks correct link

## 11. Responsive Grid

| Screen | Columns |
|--------|---------|
| Mobile (<640px) | 1 |
| Tablet (640-1024px) | 2 |
| Desktop (>1024px) | 3 |

Tailwind classes: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`

## 12. Price Formatting

- Format: `15.000 Kz`
- Locale: `pt-AO` with `toLocaleString`
- Example: `15000` → `15.000 Kz`

## 13. JS Module Structure (produtos.js)

| Function | Purpose |
|----------|---------|
| `initProdutos()` | Main entry — called on DOMContentLoaded |
| `fetchProdutos()` | Supabase query, returns array |
| `renderCard(produto)` | Returns card HTML string |
| `renderSkeletons()` | Returns 6 skeleton HTML strings |
| `renderGrid(produtos, containerId)` | Clears container, injects cards |
| `openModal(produto)` | Creates/opens detail modal overlay |
| `closeModal()` | Closes and removes modal overlay |
| `filterByCategory(cat)` | Filters `produtosData` in memory, re-renders grid |
| `generateDescricao(produto)` | Auto-generates description from category + name |
| `formatPreco(preco)` | Formats price as `15.000 Kz` |
| `getPlaceholderSvg()` | Returns inline SVG for missing images |
| `getWhatsappUrl(produto)` | Builds WhatsApp URL with pre-filled message |

All functions are attached to `window` so they can be accessed by `script.js` (Homepage). Since the project uses plain `<script src="...">` tags without bundlers, including `paginas/produtos.js` on `index.html` makes these functions globally available.

## 14. Out of Scope

- Product search by name
- Price range filter
- Stock filter (esgotados simply hidden)
- Individual product detail page (produto.html)
- Pagination or infinite scroll
- Adding `descricao` column to DB
- Admin panel changes
