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

// FAQ Accordion
function initFaqAccordion() {
    const toggles = document.querySelectorAll('.faq-toggle');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const item = toggle.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');

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

// Inicialização ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar animações AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
        });
    }

    // Inicializar Menu Mobile
    initMobileMenu();

    // Navbar glassmorphism on scroll
    initNavbarScroll();

    // Inicializar Slideshow da homepage
    if (document.getElementById('slideshow-container')) {
        initHomepageSlideshow();
    }

    // Se estivermos na página de armações/produtos, inicializar filtros
    if (document.getElementById('filter-gender')) {
        renderProducts();
        setupFilters();
    }

    // Carregar produtos destacados na homepage
    if (document.getElementById('featured-products-grid')) {
        loadFeaturedProducts();
    }

    // Initialize counter animation
    initCounterAnimation();

    // Render testimonials
    renderTestimonials();

    // Initialize FAQ accordion
    initFaqAccordion();
});

// Load featured products for homepage
async function loadFeaturedProducts() {
  const supabase = await window.getSupabase();
  if (!supabase) return;

  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('ativo', true)
    .gt('estoque', 0)
    .limit(20);

  // Embaralhar e pegar 4 aleatórios
  const shuffled = (data || []).sort(() => Math.random() - 0.5).slice(0, 4);

  if (error) {
    console.error('Error loading featured products:', error);
    return;
  }

  const container = document.getElementById('featured-products-grid');
  if (!container || !shuffled.length) return;

  const renderCard = window.renderCard;
  const openModal = window.openModal;

  if (renderCard) {
    container.innerHTML = shuffled.map(renderCard).join('');
  } else {
    container.innerHTML = shuffled.map(p => `
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" data-aos="fade-up">
            <div class="relative h-52 overflow-hidden">
                ${p.imagem_url && !p.imagem_url.includes('data:image/svg') ? `<img src="${p.imagem_url}" alt="${p.nome}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">` : `<div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300"><svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="16" width="48" height="32" rx="4" stroke="#d1d5db" stroke-width="2" fill="#f9fafb"/><circle cx="24" cy="30" r="5" stroke="#d1d5db" stroke-width="2" fill="#f3f4f6"/><path d="M8 40l12-10 8 6 12-14 16 18" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#e5e7eb" fill-opacity="0.3"/><circle cx="44" cy="26" r="3" fill="#e5e7eb"/></svg><span class="text-xs text-gray-400 mt-1">Sem Imagem</span></div>`}
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

  // Add modal listeners
  container.querySelectorAll('.open-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const produto = shuffled.find(p => p.id === btn.dataset.id);
      if (produto && openModal) openModal(produto);
    });
  });
}

// Homepage slideshow with auto-rotation
let homepageSlideIndex = 0;
let homepageSlideshowInterval;
let homepageSlides = [];

async function initHomepageSlideshow() {
    const container = document.getElementById('slideshow-container');
    if (!container) return;

    const supabase = await globalThis.getSupabase();
    if (!supabase) {
        console.warn('Supabase not available for homepage slideshow');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('slideshow')
            .select('*')
            .eq('ativo', true)
            .order('ordem', { ascending: true });

        if (error || !data || data.length === 0) {
            console.log('No slideshow data available');
            return;
        }

        homepageSlides = data;
        console.log(`✅ Homepage slideshow loaded: ${homepageSlides.length} slides`);

        renderHomepageSlides();
        startHomepageSlideshow();
    } catch (error) {
        console.error('❌ Error loading homepage slideshow:', error);
    }
}

function renderHomepageSlides() {
    const container = document.getElementById('slideshow-container');
    if (!container || homepageSlides.length === 0) return;

    let slidesHTML = homepageSlides.map((slide, idx) => {
        const imageUrl = slide.imagem_url || '';
        let html = `<div class="slide ${idx === 0 ? 'active' : ''}" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;">`;
        html += '<div class="absolute inset-0 bg-black/40"></div>';
        if (slide.titulo || slide.subtitulo) {
            html += '<div class="absolute inset-0 flex items-center justify-center text-center px-4">';
            html += '<div class="max-w-4xl">';
            if (slide.titulo) html += `<h2 class="text-4xl md:text-6xl font-bold text-white mb-4">${slide.titulo}</h2>`;
            if (slide.subtitulo) html += `<p class="text-xl md:text-2xl text-gray-200">${slide.subtitulo}</p>`;
            if (slide.link) html += `<a href="${slide.link}" class="inline-block mt-6 px-8 py-3 bg-cyan text-white font-semibold rounded-lg hover:bg-cyan/90 transition-colors">Saiba Mais</a>`;
            html += '</div></div>';
        }
        html += '</div>';
        return html;
    }).join('');

    // Navigation controls
    if (homepageSlides.length > 1) {
        let indicatorsHTML = '';
        homepageSlides.forEach((_, idx) => {
            indicatorsHTML += `<span class="indicator ${idx === 0 ? 'active' : ''}" onclick="gotoHomepageSlide(${idx})"></span>`;
        });
        slidesHTML += '<button class="slide-nav slide-prev" onclick="prevHomepageSlide()"><i class="fa-solid fa-chevron-left"></i></button>';
        slidesHTML += '<button class="slide-nav slide-next" onclick="nextHomepageSlide()"><i class="fa-solid fa-chevron-right"></i></button>';
        slidesHTML += '<div class="slide-indicators">' + indicatorsHTML + '</div>';
    }

    container.innerHTML = slidesHTML;
}

function startHomepageSlideshow() {
    if (homepageSlideshowInterval) clearInterval(homepageSlideshowInterval);

    const container = document.getElementById('slideshow-container');
    container?.addEventListener('mouseenter', () => {
        if (homepageSlideshowInterval) {
            clearInterval(homepageSlideshowInterval);
            homepageSlideshowInterval = null;
        }
    });

    container?.addEventListener('mouseleave', () => {
        if (!homepageSlideshowInterval) {
            homepageSlideshowInterval = setInterval(nextHomepageSlide, 5000);
        }
    });

    homepageSlideshowInterval = setInterval(nextHomepageSlide, 5000);
}

function nextHomepageSlide() {
    gotoHomepageSlide(homepageSlideIndex + 1 >= homepageSlides.length ? 0 : homepageSlideIndex + 1);
}

function prevHomepageSlide() {
    gotoHomepageSlide(homepageSlideIndex - 1 < 0 ? homepageSlides.length - 1 : homepageSlideIndex - 1);
}

function gotoHomepageSlide(n) {
    const container = document.getElementById('slideshow-container');
    if (!container || homepageSlides.length === 0) return;

    const allSlides = container.querySelectorAll('.slide');
    const indicators = container.querySelectorAll('.indicator');

    if (allSlides.length === 0) return;

    allSlides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));

    if (allSlides[n]) allSlides[n].classList.add('active');
    if (indicators[n]) indicators[n].classList.add('active');

    homepageSlideIndex = n;
}

// Função para controlar o Menu Mobile
function initMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Fechar menu ao clicar num link
        const links = mobileMenu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
}

// --- LÓGICA DE PRODUTOS (Para armacoes.html e produtos.html) ---

// Array de produtos - agora carregado dinamicamente do Supabase
let products = [];
let productsCategory = 'armações'; // Categoria atual (definida baseada na página)

// Carregar produtos do Supabase
async function loadProductsFromSupabase() {
 try {
 const supabase = await globalThis.getSupabase();
 if (!supabase) {
 console.error('❌ [SCRIPT] Supabase não disponível');
 products = getStaticProducts();
 if (document.getElementById('filter-gender')) {
 renderProducts();
 }
 return;
 }

 console.log('🔍 [SCRIPT] Carregando produtos da categoria:', productsCategory);

 const { data, error } = await supabase
 .from('produtos')
 .select('*')
 .eq('categoria', productsCategory)
 .eq('ativo', true)
 .order('criado_em', { ascending: false });

 if (error) {
 console.error('❌ [SCRIPT] Erro ao carregar produtos:', error);
 products = getStaticProducts();
 if (document.getElementById('filter-gender')) {
 renderProducts();
 }
 return;
 }

 console.log('✅ [SCRIPT] Produtos carregados:', data?.length || 0);

 // Mapear dados do Supabase para o formato do frontend
 products = (data || []).map(prod => ({
 id: prod.id,
 name: prod.nome,
 price: prod.preco,
 gender: 'unissex',
 shape: 'clássica',
 material: prod.categoria || 'acetato',
 img: prod.imagem_url || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80',
 descricao: prod.descricao
 }));

 // Renderizar produtos após carregar
 if (document.getElementById('filter-gender')) {
 renderProducts();
 }

 } catch (error) {
 console.error('❌ [SCRIPT] Exceção ao carregar produtos:', error);
 products = getStaticProducts();
 if (document.getElementById('filter-gender')) {
 renderProducts();
 }
 }
}

// Produtos estáticos como fallback
function getStaticProducts() {
 return [
 { id: 1, name: 'Classic Aviator', price: 84000, gender: 'masculino', shape: 'aviador', material: 'metal', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80' },
 { id: 2, name: 'Modern Round', price: 66500, gender: 'feminino', shape: 'redonda', material: 'acetato', img: 'https://images.unsplash.com/photo-1511499767390-903390e6fbc4?auto=format&fit=crop&w=400&q=80' },
 { id: 3, name: 'Urban Square', price: 105000, gender: 'unissex', shape: 'quadrada', material: 'titânio', img: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=400&q=80' },
 { id: 4, name: 'Retro Cat-Eye', price: 77000, gender: 'feminino', shape: 'gatinho', material: 'acetato', img: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=400&q=80' },
 { id: 5, name: 'Steel Minimal', price: 126000, gender: 'masculino', shape: 'quadrada', material: 'titânio', img: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=400&q=80' },
 { id: 6, name: 'Chic Round', price: 59500, gender: 'feminino', shape: 'redonda', material: 'metal', img: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=400&q=80' },
 { id: 7, name: 'Sporty Aviator', price: 98000, gender: 'unissex', shape: 'aviador', material: 'metal', img: 'https://images.unsplash.com/photo-1509100104048-6373f680613e?auto=format&fit=crop&w=400&q=80' },
 { id: 8, name: 'Classic Acetate', price: 91000, gender: 'masculino', shape: 'quadrada', material: 'acetato', img: 'https://images.unsplash.com/photo-1511499767390-903390e6fbc4?auto=format&fit=crop&w=400&q=80' },
 ];
}

// Determinar categoria baseada no URL
(function determineCategory() {
 const path = globalThis.location.pathname;
 if (path.includes('lentes')) {
 productsCategory = 'lente'; // Correspondente ao banco de dados
 } else if (path.includes('acessorios')) {
 productsCategory = 'acessorio'; // Correspondente ao banco de dados
 } else {
 productsCategory = 'armacao'; // Correspondente ao banco de dados
 }
 console.log('📋 [SCRIPT] Categoria definida:', productsCategory);
})();

// Carregar produtos ao iniciar
loadProductsFromSupabase();


function renderProducts(filteredProducts = products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (filteredProducts.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">Nenhum produto encontrado com estes filtros.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = `
            <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group" data-aos="fade-up">
                <div class="relative h-48 overflow-hidden">
                    <img src="${product.img}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    <div class="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-navy">
                        ${product.material.toUpperCase()}
                    </div>
                </div>
                <div class="p-5">
                    <h3 class="font-bold text-lg text-navy mb-1">${product.name}</h3>
                    <p class="text-sm text-gray-500 mb-4 capitalize">${product.shape} • ${product.gender}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-xl font-bold text-cyan">Kz ${product.price.toLocaleString('pt-AO')}</span>
                        <button class="text-sm font-semibold text-magenta hover:text-navy transition-colors">Ver detalhes</button>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

function setupFilters() {
    const genderFilter = document.getElementById('filter-gender');
    const shapeFilter = document.getElementById('filter-shape');
    const materialFilter = document.getElementById('filter-material');

    if (!genderFilter || !shapeFilter || !materialFilter) return;

    const applyFilters = () => {
        const gender = genderFilter.value;
        const shape = shapeFilter.value;
        const material = materialFilter.value;

        const filtered = products.filter(p => {
            return (gender === 'all' || p.gender === gender) &&
                   (shape === 'all' || p.shape === shape) &&
                   (material === 'all' || p.material === material);
        });

        renderProducts(filtered);
    };

    genderFilter.addEventListener('change', applyFilters);
    shapeFilter.addEventListener('change', applyFilters);
    materialFilter.addEventListener('change', applyFilters);
}

// --- SLIDESHOW FUNCTIONALITY ---

let currentSlideIndex = 0;
let slides = [];
let slideshowInterval;

async function initSlideshow() {
    const container = document.getElementById('slideshow-container');
    if (!container) return;

    // Tentar carregar slides do Supabase
 const supabase = await globalThis.getSupabase();
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('slides')
                .select('*')
                .eq('ativo', true)
                .order('ordem', { ascending: true });

            if (!error && data && data.length > 0) {
                slides = data;
                console.log('✅ [SLIDE] Slides carregados do Supabase:', slides.length);
            } else {
                console.log('⚠️ [SLIDE] Nenhum slide no Supabase, usando fallback');
                slides = getFallbackSlides();
            }
        } catch (error) {
            console.error('❌ [SLIDE] Erro ao carregar slides:', error);
            slides = getFallbackSlides();
        }
    } else {
        // Fallback: carregar do localStorage ou criar slides padrão
        slides = JSON.parse(localStorage.getItem('slides') || '[]').filter(slide => slide.ativo);
        if (slides.length === 0) {
            slides = getFallbackSlides();
            localStorage.setItem('slides', JSON.stringify(slides));
        }
    }

    // Renderizar slides
    renderSlidesHTML();

    // Iniciar autoplay
    startSlideshow();
}

function getFallbackSlides() {
    return [
        {
            id: 1,
            imagem_url: 'img_slide/pexels-gustavo-fring-7446669.jpg',
            titulo: 'VIVA ÓPTICA',
            subtitulo: 'O Futuro é Mais Nítido Aqui',
            ativo: true
        },
        {
            id: 2,
            imagem_url: 'img_slide/pexels-kseniachernaya-5752256.jpg',
            titulo: 'QUALIDADE PREMIUM',
            subtitulo: 'As melhores marcas do mercado',
            ativo: true
        }
    ];
}

function renderSlidesHTML() {
    const container = document.getElementById('slideshow-container');
    if (!container) return;

    let slidesHTML = '';
    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const isActive = i === 0 ? 'active' : '';
        const imageUrl = slide.imagem_url || slide.imagem || '';

        let slideHTML = '<div class="slide ' + isActive + '" style="background-image: url(\'' + imageUrl + '\'); background-size: cover; background-position: center;">';
        slideHTML += '<div class="absolute inset-0 bg-black/40"></div>';

        if (slide.titulo || slide.subtitulo) {
            slideHTML += '<div class="absolute inset-0 flex items-center justify-center text-center px-4">';
            slideHTML += '<div class="max-w-4xl">';
            if (slide.titulo) {
                slideHTML += '<h2 class="text-4xl md:text-6xl font-bold text-white mb-4">' + slide.titulo + '</h2>';
            }
            if (slide.subtitulo) {
                slideHTML += '<p class="text-xl md:text-2xl text-gray-200">' + slide.subtitulo + '</p>';
            }
            // Botão opcional
            if (slide.btn_txt && slide.link) {
                slideHTML += '<a href="' + slide.link + '" class="inline-block mt-6 px-8 py-3 bg-cyan text-white font-semibold rounded-lg hover:bg-cyanLight transition-colors">' + slide.btn_txt + '</a>';
            }
            slideHTML += '</div></div>';
        }

        slideHTML += '</div>';
        slidesHTML += slideHTML;
    }

    // Adicionar controles de navegação se houver mais de um slide
    if (slides.length > 1) {
        let indicatorsHTML = '';
        for (let i = 0; i < slides.length; i++) {
            const isActive = i === 0 ? 'active' : '';
            indicatorsHTML += '<span class="indicator ' + isActive + '" onclick="goToSlide(' + i + ')"></span>';
        }

        slidesHTML += '<button class="slide-nav slide-prev" onclick="prevSlide()"><i class="fa-solid fa-chevron-left"></i></button>';
        slidesHTML += '<button class="slide-nav slide-next" onclick="nextSlide()"><i class="fa-solid fa-chevron-right"></i></button>';
        slidesHTML += '<div class="slide-indicators">' + indicatorsHTML + '</div>';
    }

    container.innerHTML = slidesHTML;
}

function showSlide(index) {
    const allSlides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');

    allSlides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    if (allSlides[index]) {
        allSlides[index].classList.add('active');
    }
    if (indicators[index]) {
        indicators[index].classList.add('active');
    }

    currentSlideIndex = index;
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(currentSlideIndex);
}

function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    showSlide(currentSlideIndex);
}

function goToSlide(index) {
    showSlide(index);
    resetSlideshowTimer();
}

function startSlideshow() {
    if (slides.length <= 1) return;

    slideshowInterval = setInterval(() => {
        nextSlide();
    }, 5000); // Mudar slide a cada 5 segundos
}

function resetSlideshowTimer() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        startSlideshow();
    }
}

function stopSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
    }
}
