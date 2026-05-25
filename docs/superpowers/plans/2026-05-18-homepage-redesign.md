# Homepage Full Premium Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Viva Óptica homepage with a modern/premium visual style, adding new sections (Serviços, Marcas, Testemunhos, FAQ, CTA) and improving existing ones (Hero, Stats, Produtos).

**Architecture:** Single-page HTML redesign using Tailwind CSS utility classes + custom CSS for glassmorphism, gradients, and animations. JavaScript handles dynamic content (slideshow, products, testimonials). No build system — direct browser rendering.

**Tech Stack:** HTML5, Tailwind CSS 3.4 (CDN), Font Awesome 6, AOS (scroll animations), Supabase JS (dynamic content), Google Fonts (Inter).

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `viva-optica/viva-optica/index.html` | **Rewrite** | Complete homepage with all new sections |
| `viva-optica/viva-optica/style.css` | **Modify** | Add glassmorphism, marquee, accordion, counter animation styles |
| `viva-optica/viva-optica/script.js` | **Modify** | Add testimonial loader, FAQ accordion, counter animation, brand marquee |

All paths relative to `C:\Users\IP4U\OneDrive\Javelson Canzenze Doc\Viva Otica\`.

---

### Task 1: CSS Foundation — Glassmorphism, Gradients, New Utilities

**Files:**
- Modify: `viva-optica/viva-optica/style.css`

- [ ] **Step 1: Add glassmorphism utility classes**

Append to `style.css`:

```css
/* ========== PREMIUM REDESIGN UTILITIES ========== */

/* Glassmorphism */
.glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-dark {
    background: rgba(26, 42, 74, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-white {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
}
```

- [ ] **Step 2: Add gradient backgrounds**

```css
/* Gradient backgrounds */
.bg-gradient-navy-cyan {
    background: linear-gradient(135deg, #1a2a4a 0%, #00aadc 100%);
}

.bg-gradient-hero {
    background: linear-gradient(135deg, rgba(26, 42, 74, 0.85) 0%, rgba(0, 170, 220, 0.4) 100%);
}

.bg-gradient-soft {
    background: linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%);
}
```

- [ ] **Step 3: Add glow button effect**

```css
/* Glow button */
.btn-glow {
    box-shadow: 0 0 20px rgba(0, 170, 220, 0.4), 0 0 40px rgba(0, 170, 220, 0.2);
    transition: all 0.3s ease;
}

.btn-glow:hover {
    box-shadow: 0 0 30px rgba(0, 170, 220, 0.6), 0 0 60px rgba(0, 170, 220, 0.3);
    transform: translateY(-2px);
}
```

- [ ] **Step 4: Add marquee animation for brand logos**

```css
/* Brand logos marquee */
.marquee-track {
    display: flex;
    animation: marquee 30s linear infinite;
    width: max-content;
}

.marquee-track:hover {
    animation-play-state: paused;
}

@keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}

.brand-logo {
    filter: grayscale(100%);
    opacity: 0.6;
    transition: all 0.3s ease;
}

.brand-logo:hover {
    filter: grayscale(0%);
    opacity: 1;
}
```

- [ ] **Step 5: Add FAQ accordion styles**

```css
/* FAQ Accordion */
.faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease, padding 0.4s ease;
}

.faq-answer.open {
    max-height: 300px;
}

.faq-icon {
    transition: transform 0.3s ease;
}

.faq-item.open .faq-icon {
    transform: rotate(45deg);
}
```

- [ ] **Step 6: Add counter animation support**

```css
/* Counter animation */
.counter-value {
    font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 7: Add testimonial card styles**

```css
/* Testimonial cards */
.testimonial-card {
    transition: all 0.3s ease;
}

.testimonial-card:hover {
    transform: translateY(-4px);
}

/* Star rating */
.star-rating {
    color: #f5c800;
}
```

- [ ] **Step 8: Add navbar scroll effect**

```css
/* Navbar glassmorphism on scroll */
nav.scrolled {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}
```

- [ ] **Step 9: Verify**

Open `style.css` in browser — no syntax errors. All new classes available.

---

### Task 2: Hero Section — Glassmorphism Overlay + Improved Typography

**Files:**
- Modify: `viva-optica/viva-optica/index.html:80-106`

- [ ] **Step 1: Replace the Hero section**

Replace the entire `<section id="home">` block (lines 80–106) with:

```html
<!-- Hero Section with Slideshow -->
<section id="home" class="relative h-screen flex items-center justify-center overflow-hidden">
    <!-- Slideshow Background -->
    <div class="absolute inset-0 z-0">
        <div class="slideshow-container w-full h-full" id="slideshow-container">
            <!-- Slides loaded dynamically -->
        </div>
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-hero"></div>
    </div>

    <!-- Glassmorphism Content Card -->
    <div class="relative z-10 text-center text-white px-4" data-aos="fade-up" data-aos-delay="200">
        <div class="glass-dark rounded-3xl px-12 py-14 max-w-3xl mx-auto">
            <h1 class="text-5xl md:text-7xl font-bold mb-4 tracking-tight" style="text-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                VIVA <span class="text-cyan">ÓPTICA</span>
            </h1>
            <p class="text-xl md:text-2xl font-light mb-10 text-gray-200 tracking-wide">
                "O Futuro é Mais Nítido Aqui"
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="paginas/produtos.html?cat=armacao" class="btn-glow bg-cyan text-navy px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-all">
                    Ver Coleções
                </a>
                <a href="agendamento.html" class="border-2 border-white/60 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-navy transition-all glass">
                    Agendar Exame
                </a>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Verify**

Open `index.html` in browser. Hero should show slideshow with gradient overlay, glassmorphism card with title/buttons, glow effect on primary button.

---

### Task 3: Serviços em Destaque Section (NEW)

**Files:**
- Modify: `viva-optica/viva-optica/index.html` (insert after Hero section)

- [ ] **Step 1: Add Serviços section after the Hero `</section>` tag**

Insert this block between the Hero `</section>` (line ~106 after Task 2) and the Stats section:

```html
<!-- Serviços em Destaque -->
<section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-14" data-aos="fade-up">
            <span class="text-cyan font-semibold text-sm uppercase tracking-widest">O que fazemos</span>
            <h2 class="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">Nossos Serviços</h2>
            <div class="w-20 h-1 bg-gradient-to-r from-cyan to-magenta mx-auto rounded-full"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Serviço 1 -->
            <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 border-cyan group" data-aos="fade-up">
                <div class="w-14 h-14 bg-cyan/10 text-cyan rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                    <i class="fa-solid fa-eye"></i>
                </div>
                <h3 class="text-xl font-bold text-navy mb-3">Exame de Vista</h3>
                <p class="text-gray-600 mb-6 leading-relaxed">Avaliações completas com tecnologia de ponta para determinar a sua graduação com precisão.</p>
                <a href="agendamento.html" class="text-cyan font-bold hover:text-navy transition-colors inline-flex items-center gap-2">
                    Agendar Agora <i class="fa-solid fa-arrow-right text-sm"></i>
                </a>
            </div>

            <!-- Serviço 2 -->
            <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 border-magenta group" data-aos="fade-up" data-aos-delay="100">
                <div class="w-14 h-14 bg-magenta/10 text-magenta rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                    <i class="fa-solid fa-glasses"></i>
                </div>
                <h3 class="text-xl font-bold text-navy mb-3">Graduação de Lentes</h3>
                <p class="text-gray-600 mb-6 leading-relaxed">Acompanhamento profissional para garantir que as suas lentes ou óculos sejam perfeitamente confortáveis.</p>
                <a href="agendamento.html" class="text-magenta font-bold hover:text-navy transition-colors inline-flex items-center gap-2">
                    Saber Mais <i class="fa-solid fa-arrow-right text-sm"></i>
                </a>
            </div>

            <!-- Serviço 3 -->
            <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 border-yellow group" data-aos="fade-up" data-aos-delay="200">
                <div class="w-14 h-14 bg-yellow/10 text-yellow rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                    <i class="fa-solid fa-screwdriver-wrench"></i>
                </div>
                <h3 class="text-xl font-bold text-navy mb-3">Manutenção e Reparação</h3>
                <p class="text-gray-600 mb-6 leading-relaxed">Ajustes, limpeza profunda e reparação de armações para que os seus óculos pareçam novos.</p>
                <a href="paginas/contacto.html" class="text-yellow font-bold hover:text-navy transition-colors inline-flex items-center gap-2">
                    Pedir Reparação <i class="fa-solid fa-arrow-right text-sm"></i>
                </a>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Verify**

Three service cards with colored borders, icons, hover effects, and links to agendamento.

---

### Task 4: Produtos Destaque Section (Improved)

**Files:**
- Modify: `viva-optica/viva-optica/index.html` (replace existing Produtos section)

- [ ] **Step 1: Replace the Produtos Destaque section**

Replace the existing `<section class="py-20 bg-gray-50">` block with:

```html
<!-- Produtos em Destaque -->
<section class="py-20 bg-gradient-soft">
    <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-14" data-aos="fade-up">
            <span class="text-cyan font-semibold text-sm uppercase tracking-widest">Novidades</span>
            <h2 class="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">Produtos em Destaque</h2>
            <div class="w-20 h-1 bg-gradient-to-r from-cyan to-magenta mx-auto rounded-full"></div>
        </div>

        <div id="featured-products-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Loading skeletons -->
            <div class="animate-pulse bg-gray-200 h-72 rounded-2xl"></div>
            <div class="animate-pulse bg-gray-200 h-72 rounded-2xl"></div>
            <div class="animate-pulse bg-gray-200 h-72 rounded-2xl"></div>
            <div class="animate-pulse bg-gray-200 h-72 rounded-2xl"></div>
        </div>

        <div class="text-center mt-14">
            <a href="paginas/produtos.html" class="inline-flex items-center gap-2 text-navy font-bold border-b-2 border-cyan hover:text-cyan transition-colors text-lg">
                Ver todos os produtos <i class="fa-solid fa-arrow-right"></i>
            </a>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Update product card rendering in `script.js`**

In `loadFeaturedProducts()`, update the card rendering to use rounded-2xl and improved styling. The `renderCard` function from `produtos.html` is used — check if it exists in the shared scripts. If not, add inline rendering:

Find the `loadFeaturedProducts` function and replace the card rendering logic. After `container.innerHTML = data.map(renderCard).join('');`, if `renderCard` is not available, use this fallback:

```javascript
// In loadFeaturedProducts(), replace the renderCard block:
if (renderCard) {
    container.innerHTML = data.map(renderCard).join('');
} else {
    container.innerHTML = data.map(p => `
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" data-aos="fade-up">
            <div class="relative h-52 overflow-hidden">
                <img src="${p.imagem_url || 'https://placehold.co/400x300/e2e8f0/64748b?text=Sem+Imagem'}" alt="${p.nome}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-navy shadow-sm">
                    ${(p.categoria || 'produto').toUpperCase()}
                </div>
            </div>
            <div class="p-5">
                <h3 class="font-bold text-lg text-navy mb-1">${p.nome}</h3>
                <p class="text-sm text-gray-500 mb-4 line-clamp-2">${p.descricao || ''}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xl font-bold text-cyan">Kz ${(p.preco || 0).toLocaleString('pt-AO')}</span>
                    <button class="open-modal-btn text-sm font-semibold text-magenta hover:text-navy transition-colors" data-id="${p.id}">Ver detalhes</button>
                </div>
            </div>
        </div>
    `).join('');
}
```

- [ ] **Step 3: Verify**

Products section shows rounded-2xl cards with gradient background, hover lift effect, category badges.

---

### Task 5: Stats Section — Glassmorphism + Counter Animation

**Files:**
- Modify: `viva-optica/viva-optica/index.html` (replace Stats section)
- Modify: `viva-optica/viva-optica/script.js` (add counter animation)

- [ ] **Step 1: Replace the Stats section in `index.html`**

Replace the existing `<section class="py-16 bg-white">` block with:

```html
<!-- Stats / Counters -->
<section class="py-20 bg-gradient-navy-cyan relative overflow-hidden">
    <!-- Decorative shapes -->
    <div class="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>

    <div class="max-w-7xl mx-auto px-4 relative z-10">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <!-- Stat 1 -->
            <div class="glass rounded-2xl p-8 text-center text-white" data-aos="fade-up">
                <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
                    <i class="fa-solid fa-users"></i>
                </div>
                <h3 class="text-4xl font-bold mb-2 counter-value" data-target="15000">0</h3>
                <p class="text-gray-200 text-sm uppercase tracking-wider">Clientes Atendidos</p>
            </div>

            <!-- Stat 2 -->
            <div class="glass rounded-2xl p-8 text-center text-white" data-aos="fade-up" data-aos-delay="100">
                <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
                    <i class="fa-solid fa-award"></i>
                </div>
                <h3 class="text-4xl font-bold mb-2"><span class="counter-value" data-target="50">0</span>+</h3>
                <p class="text-gray-200 text-sm uppercase tracking-wider">Marcas Premium</p>
            </div>

            <!-- Stat 3 -->
            <div class="glass rounded-2xl p-8 text-center text-white" data-aos="fade-up" data-aos-delay="200">
                <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
                    <i class="fa-solid fa-calendar-check"></i>
                </div>
                <h3 class="text-4xl font-bold mb-2"><span class="counter-value" data-target="10">0</span>+</h3>
                <p class="text-gray-200 text-sm uppercase tracking-wider">Anos de Experiência</p>
            </div>

            <!-- Stat 4 -->
            <div class="glass rounded-2xl p-8 text-center text-white" data-aos="fade-up" data-aos-delay="300">
                <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
                    <i class="fa-solid fa-heart"></i>
                </div>
                <h3 class="text-4xl font-bold mb-2"><span class="counter-value" data-target="100">0</span>%</h3>
                <p class="text-gray-200 text-sm uppercase tracking-wider">Satisfação</p>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Add counter animation function to `script.js`**

Add this function before the `DOMContentLoaded` listener:

```javascript
// Counter animation on scroll
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter-value');
    if (!counters.length) return;

    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const update = () => {
            current += step;
            if (current < target) {
                el.textContent = Math.floor(current).toLocaleString('pt-AO');
                requestAnimationFrame(update);
            } else {
                el.textContent = target.toLocaleString('pt-AO');
            }
        };
        update();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}
```

- [ ] **Step 3: Call counter animation in DOMContentLoaded**

Inside the `DOMContentLoaded` listener, add:

```javascript
// Initialize counter animation
initCounterAnimation();
```

- [ ] **Step 4: Verify**

Stats section shows gradient navy background, glassmorphism cards, animated counters that count up when scrolled into view.

---

### Task 6: Logotipos de Marcas Section (NEW)

**Files:**
- Modify: `viva-optica/viva-optica/index.html` (insert after Stats section)

- [ ] **Step 1: Add Marcas section after Stats `</section>`**

```html
<!-- Logotipos de Marcas -->
<section class="py-16 bg-white overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 mb-10" data-aos="fade-up">
        <div class="text-center">
            <span class="text-cyan font-semibold text-sm uppercase tracking-widest">Parceiros</span>
            <h2 class="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">Marcas que Trabalhamos</h2>
            <div class="w-20 h-1 bg-gradient-to-r from-cyan to-magenta mx-auto rounded-full"></div>
        </div>
    </div>

    <!-- Marquee container -->
    <div class="relative">
        <!-- Fade edges -->
        <div class="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div class="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>

        <div class="overflow-hidden">
            <div class="marquee-track items-center gap-16 py-4 px-8">
                <!-- First set -->
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">RAY-BAN</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">OAKLEY</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">GUCCI</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">PRADA</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">VERSACE</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">TOM FORD</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">ARMAÇÕES</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">ESSILOR</span>
                </div>

                <!-- Duplicate set for seamless loop -->
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">RAY-BAN</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">OAKLEY</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">GUCCI</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">PRADA</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">VERSACE</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">TOM FORD</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">ARMAÇÕES</span>
                </div>
                <div class="brand-logo flex-shrink-0 h-12 flex items-center">
                    <span class="text-2xl font-bold text-gray-400 tracking-wider">ESSILOR</span>
                </div>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Verify**

Brand names scroll horizontally in an infinite marquee. Hovering pauses the animation. Edge fade effects visible.

---

### Task 7: Testemunhos Section (NEW)

**Files:**
- Modify: `viva-optica/viva-optica/index.html` (insert after Marcas section)
- Modify: `viva-optica/viva-optica/script.js` (add testimonials data/rendering)

- [ ] **Step 1: Add Testemunhos section HTML after Marcas `</section>`**

```html
<!-- Testemunhos -->
<section class="py-20 bg-gradient-soft">
    <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-14" data-aos="fade-up">
            <span class="text-cyan font-semibold text-sm uppercase tracking-widest">Depoimentos</span>
            <h2 class="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">O que Dizem os Nossos Clientes</h2>
            <div class="w-20 h-1 bg-gradient-to-r from-cyan to-magenta mx-auto rounded-full"></div>
        </div>

        <div id="testimonials-grid" class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Testimonials loaded dynamically or fallback -->
        </div>
    </div>
</section>
```

- [ ] **Step 2: Add testimonials rendering function to `script.js`**

```javascript
// Testimonials
const defaultTestimonials = [
    {
        nome: 'Maria Fernandes',
        texto: 'Excelente atendimento! Fiz o exame de vista e encontrei as armações perfeitas. A equipa é muito profissional e atenciosa.',
        estrelas: 5,
        avatar: 'MF'
    },
    {
        nome: 'João Silva',
        texto: 'As melhores lentes que já tive. O processo de graduação foi rápido e preciso. Recomendo a todos!',
        estrelas: 5,
        avatar: 'JS'
    },
    {
        nome: 'Ana Rodrigues',
        texto: 'Ótima variedade de marcas premium e preços acessíveis. A manutenção dos meus óculos ficou impecável.',
        estrelas: 5,
        avatar: 'AR'
    }
];

function renderTestimonials() {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;

    const testimonials = defaultTestimonials;

    grid.innerHTML = testimonials.map((t, i) => `
        <div class="testimonial-card bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl" data-aos="fade-up" data-aos-delay="${i * 100}">
            <div class="star-rating text-lg mb-4">
                ${'<i class="fa-solid fa-star"></i>'.repeat(t.estrelas)}${'<i class="fa-regular fa-star"></i>'.repeat(5 - t.estrelas)}
            </div>
            <p class="text-gray-600 leading-relaxed mb-6 italic">"${t.texto}"</p>
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-gradient-navy-cyan flex items-center justify-center text-white font-bold text-sm">
                    ${t.avatar}
                </div>
                <div>
                    <p class="font-bold text-navy">${t.nome}</p>
                    <p class="text-sm text-gray-500">Cliente Verificado</p>
                </div>
            </div>
        </div>
    `).join('');
}
```

- [ ] **Step 3: Call renderTestimonials in DOMContentLoaded**

Inside the `DOMContentLoaded` listener, add:

```javascript
// Render testimonials
renderTestimonials();
```

- [ ] **Step 4: Verify**

Three testimonial cards with star ratings, quotes, avatar initials, and hover lift effect.

---

### Task 8: FAQ Section (NEW)

**Files:**
- Modify: `viva-optica/viva-optica/index.html` (insert after Testemunhos section)
- Modify: `viva-optica/viva-optica/script.js` (add FAQ accordion logic)

- [ ] **Step 1: Add FAQ section HTML after Testemunhos `</section>`**

```html
<!-- FAQ -->
<section class="py-20 bg-white">
    <div class="max-w-3xl mx-auto px-4">
        <div class="text-center mb-14" data-aos="fade-up">
            <span class="text-cyan font-semibold text-sm uppercase tracking-widest">Dúvidas</span>
            <h2 class="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">Perguntas Frequentes</h2>
            <div class="w-20 h-1 bg-gradient-to-r from-cyan to-magenta mx-auto rounded-full"></div>
        </div>

        <div id="faq-container" class="space-y-4" data-aos="fade-up">
            <!-- FAQ items -->
            <div class="faq-item border border-gray-200 rounded-2xl overflow-hidden">
                <button class="faq-toggle w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                    <span class="font-bold text-navy text-lg pr-4">Como posso agendar um exame de vista?</span>
                    <span class="faq-icon text-cyan text-2xl font-light flex-shrink-0">+</span>
                </button>
                <div class="faq-answer px-6">
                    <p class="text-gray-600 pb-6 leading-relaxed">Pode agendar diretamente pelo nosso site na secção "Agendar", ligar para +244 954 145 065, ou enviar uma mensagem pelo WhatsApp. Respondemos em menos de 24 horas.</p>
                </div>
            </div>

            <div class="faq-item border border-gray-200 rounded-2xl overflow-hidden">
                <button class="faq-toggle w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                    <span class="font-bold text-navy text-lg pr-4">Quanto tempo demora a graduação de lentes?</span>
                    <span class="faq-icon text-cyan text-2xl font-light flex-shrink-0">+</span>
                </button>
                <div class="faq-answer px-6">
                    <p class="text-gray-600 pb-6 leading-relaxed">O exame completo dura aproximadamente 30-45 minutos. Os resultados são imediatos e a receita é entregue no final da consulta.</p>
                </div>
            </div>

            <div class="faq-item border border-gray-200 rounded-2xl overflow-hidden">
                <button class="faq-toggle w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                    <span class="font-bold text-navy text-lg pr-4">Trabalham com seguros de saúde?</span>
                    <span class="faq-icon text-cyan text-2xl font-light flex-shrink-0">+</span>
                </button>
                <div class="faq-answer px-6">
                    <p class="text-gray-600 pb-6 leading-relaxed">Sim, trabalhamos com os principais seguradores em Angola. Contacte-nos para verificar se o seu seguro é aceite.</p>
                </div>
            </div>

            <div class="faq-item border border-gray-200 rounded-2xl overflow-hidden">
                <button class="faq-toggle w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                    <span class="font-bold text-navy text-lg pr-4">Qual é o prazo de entrega das lentes?</span>
                    <span class="faq-icon text-cyan text-2xl font-light flex-shrink-0">+</span>
                </button>
                <div class="faq-answer px-6">
                    <p class="text-gray-600 pb-6 leading-relaxed">Lentes simples ficam prontas em 3-5 dias úteis. Lentes especiais ou progressivas podem levar 7-10 dias úteis.</p>
                </div>
            </div>

            <div class="faq-item border border-gray-200 rounded-2xl overflow-hidden">
                <button class="faq-toggle w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                    <span class="font-bold text-navy text-lg pr-4">Oferecem garantia nos produtos?</span>
                    <span class="faq-icon text-cyan text-2xl font-light flex-shrink-0">+</span>
                </button>
                <div class="faq-answer px-6">
                    <p class="text-gray-600 pb-6 leading-relaxed">Sim! Todas as armações têm garantia de 12 meses contra defeitos de fabrico. Lentes têm garantia de 6 meses.</p>
                </div>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Add FAQ accordion logic to `script.js`**

```javascript
// FAQ Accordion
function initFaqAccordion() {
    const toggles = document.querySelectorAll('.faq-toggle');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const item = toggle.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const isOpen = item.classList.contains('open');

            // Close all others
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('open');
                    openItem.querySelector('.faq-answer').classList.remove('open');
                }
            });

            // Toggle current
            item.classList.toggle('open');
            answer.classList.toggle('open');
        });
    });
}
```

- [ ] **Step 3: Call initFaqAccordion in DOMContentLoaded**

Inside the `DOMContentLoaded` listener, add:

```javascript
// Initialize FAQ accordion
initFaqAccordion();
```

- [ ] **Step 4: Verify**

FAQ shows 5 items. Clicking one expands the answer with smooth animation, clicking again collapses it. Only one open at a time.

---

### Task 9: CTA WhatsApp Section (NEW)

**Files:**
- Modify: `viva-optica/viva-optica/index.html` (insert after FAQ section, before footer)

- [ ] **Step 1: Add CTA section after FAQ `</section>` and before `<footer>`**

```html
<!-- CTA WhatsApp -->
<section class="py-20 bg-navy relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-navy via-navy to-cyan/20"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-cyan/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 left-0 w-64 h-64 bg-magenta/10 rounded-full -translate-x-1/2 translate-y-1/2"></div>

    <div class="max-w-4xl mx-auto px-4 text-center relative z-10" data-aos="zoom-in">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Pronto para Melhorar a Sua Visão?</h2>
        <p class="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">Fale diretamente connosco via WhatsApp para marcar uma consulta, tirar dúvidas ou saber mais sobre os nossos serviços.</p>
        <a href="https://wa.me/244954145065" target="_blank" class="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-green-500/30 hover:-translate-y-1">
            <i class="fa-brands fa-whatsapp text-2xl"></i> Contactar via WhatsApp
        </a>
    </div>
</section>
```

- [ ] **Step 2: Verify**

Dark navy section with gradient background, decorative circles, centered CTA with green WhatsApp button.

---

### Task 10: Footer Enhancement

**Files:**
- Modify: `viva-optica/viva-optica/index.html` (replace footer)

- [ ] **Step 1: Replace the footer with enhanced version**

Replace the entire `<footer>` block with:

```html
<footer class="bg-navy text-white py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <!-- Brand -->
            <div class="md:col-span-1">
                <h3 class="font-bold text-xl mb-4 text-cyan">Viva Óptica</h3>
                <p class="text-gray-300 leading-relaxed mb-6">Sua visão é nossa prioridade. Mais de 10 anos a cuidar da saúde visual dos angolanos.</p>
                <div class="flex gap-4">
                    <a href="#" class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-300 hover:bg-cyan hover:text-white transition-all">
                        <i class="fa-brands fa-facebook-f"></i>
                    </a>
                    <a href="#" class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-300 hover:bg-cyan hover:text-white transition-all">
                        <i class="fa-brands fa-instagram"></i>
                    </a>
                    <a href="https://wa.me/244954145065" target="_blank" class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-300 hover:bg-green-500 hover:text-white transition-all">
                        <i class="fa-brands fa-whatsapp"></i>
                    </a>
                </div>
            </div>

            <!-- Links Rápidos -->
            <div>
                <h3 class="font-bold text-lg mb-4 text-cyan">Links Rápidos</h3>
                <ul class="text-gray-300 space-y-3">
                    <li><a href="index.html" class="hover:text-cyan transition-colors">Início</a></li>
                    <li><a href="paginas/produtos.html" class="hover:text-cyan transition-colors">Produtos</a></li>
                    <li><a href="paginas/servicos.html" class="hover:text-cyan transition-colors">Serviços</a></li>
                    <li><a href="paginas/sobre.html" class="hover:text-cyan transition-colors">Sobre Nós</a></li>
                </ul>
            </div>

            <!-- Serviços -->
            <div>
                <h3 class="font-bold text-lg mb-4 text-cyan">Serviços</h3>
                <ul class="text-gray-300 space-y-3">
                    <li><a href="agendamento.html" class="hover:text-cyan transition-colors">Exame de Vista</a></li>
                    <li><a href="agendamento.html" class="hover:text-cyan transition-colors">Graduação de Lentes</a></li>
                    <li><a href="paginas/contacto.html" class="hover:text-cyan transition-colors">Manutenção</a></li>
                    <li><a href="paginas/contacto.html" class="hover:text-cyan transition-colors">Contacto</a></li>
                </ul>
            </div>

            <!-- Contacto -->
            <div>
                <h3 class="font-bold text-lg mb-4 text-cyan">Contacte-nos</h3>
                <div class="text-gray-300 space-y-3">
                    <p class="flex items-start gap-3">
                        <i class="fas fa-phone text-cyan mt-1"></i>
                        <span>+244 954 145 065</span>
                    </p>
                    <p class="flex items-start gap-3">
                        <i class="fas fa-envelope text-cyan mt-1"></i>
                        <span>info@vivaoptica.ao</span>
                    </p>
                    <p class="flex items-start gap-3">
                        <i class="fas fa-map-marker-alt text-cyan mt-1"></i>
                        <span>Luanda, Angola</span>
                    </p>
                </div>
            </div>
        </div>

        <div class="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-gray-400 text-sm">&copy; 2026 Viva Óptica. Todos os direitos reservados.</p>
            <div class="flex gap-6 text-sm text-gray-500">
                <a href="admin/login.html" class="hover:text-cyan transition-colors">Admin</a>
            </div>
        </div>
    </div>
</footer>
```

- [ ] **Step 2: Verify**

Footer shows 4 columns (Brand + social icons, Links, Serviços, Contacto), copyright bar at bottom.

---

### Task 11: Navbar Scroll Effect

**Files:**
- Modify: `viva-optica/viva-optica/script.js`

- [ ] **Step 1: Add navbar scroll detection to DOMContentLoaded**

```javascript
// Navbar glassmorphism on scroll
function initNavbarScroll() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}
```

- [ ] **Step 2: Call in DOMContentLoaded**

```javascript
initNavbarScroll();
```

- [ ] **Step 3: Verify**

Scroll down the page — navbar gets glassmorphism effect (slightly transparent + blur).

---

### Task 12: Final Integration — Remove Old `</main>` and Assemble

**Files:**
- Modify: `viva-optica/viva-optica/index.html`

- [ ] **Step 1: Ensure `<main>` tag only wraps the hero section**

The `<main>` tag should close after the Produtos section. All new sections (Stats, Marcas, Testemunhos, FAQ, CTA) should be outside `<main>` but before the floating WhatsApp button and footer.

Structure should be:
```
</main>

<!-- Stats -->
<!-- Marcas -->
<!-- Testemunhos -->
<!-- FAQ -->
<!-- CTA WhatsApp -->

<!-- WhatsApp Floating Button -->
<footer>...</footer>
```

- [ ] **Step 2: Verify final page structure**

Open `index.html` in browser and verify all sections render in order:
1. Navbar (with scroll effect)
2. Hero (glassmorphism card, gradient overlay)
3. Serviços (3 cards)
4. Produtos Destaque (4 cards from Supabase)
5. Stats (gradient bg, counter animation)
6. Marcas (infinite marquee)
7. Testemunhos (3 cards)
8. FAQ (accordion)
9. CTA WhatsApp
10. Footer (4 columns + social)
11. Floating WhatsApp button

- [ ] **Step 3: Test responsive behavior**

Resize browser to mobile width. Verify:
- Hamburger menu works
- Cards stack vertically
- Hero text readable
- Marquee still animates
- FAQ accordion works on tap

---

## Execution Notes

- **No test framework** — verification is visual in browser
- **Supabase dependency** — Slideshow and Featured Products require Supabase connection
- **Brand names** — Update the marquee section with actual brand names if different
- **Testimonials** — Currently static data; can be migrated to Supabase table later
- **Colors** — Using existing palette: navy (#1a2a4a), cyan (#00aadc), magenta (#e91e8c), yellow (#f5c800)
