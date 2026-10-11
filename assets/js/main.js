/* 
    TorreSoft Sistemas - Scripts 
    Author: Gemini CLI
*/

document.addEventListener('DOMContentLoaded', () => {
    const floatingContact = document.createElement('div');
    floatingContact.className = 'floating-contact';
    floatingContact.innerHTML = `
        <a class="whatsapp" href="https://wa.me/5534992693522?text=Ol%C3%A1%2C%20quero%20falar%20com%20um%20especialista%20da%20TorreSoft." target="_blank" rel="noopener noreferrer" aria-label="Falar com a TorreSoft pelo WhatsApp">
            <i class="fab fa-whatsapp"></i>
            <span>WhatsApp</span>
        </a>
        <a class="support" href="suporte.html" aria-label="Acessar suporte TorreSoft">
            <i class="fas fa-headset"></i>
            <span>Suporte</span>
        </a>
        <a class="demo" href="contato.html" aria-label="Agendar demonstração TorreSoft">
            <i class="fas fa-calendar-check"></i>
            <span>Demonstração</span>
        </a>
    `;
    document.body.appendChild(floatingContact);

    // Eventos compatíveis com GA4/GTM já instalados pelo proprietário do site.
    // Sem dataLayer, não carrega nem envia nenhum serviço de terceiros.
    const trackConversion = (eventName, params = {}) => {
        if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push({ event: eventName, ...params });
        }
    };

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link) return;
        if (link.dataset.conversion) trackConversion(link.dataset.conversion, { link_url: link.href });
        if (link.href.includes('wa.me')) trackConversion('clique_whatsapp', { link_url: link.href });
        if (link.href.includes('/terceiro-setor.html') || link.href.includes('g3n.torresoftbrasil.com.br')) {
            trackConversion('conhecer_g3n', { link_url: link.href });
        }
    });

    document.addEventListener('submit', (event) => {
        if (event.target.matches('form[action*="/api/contact"]')) trackConversion('envio_formulario_comercial');
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar-hta');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Initialize AOS (Animate on Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }

    // Initialize Swiper (Sliders)
    if (typeof Swiper !== 'undefined') {
        const testimonialSwiper = new Swiper('.testimonial-swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: {
                delay: 5000,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                }
            }
        });
    }

    // Continuous counters
    const counters = document.querySelectorAll('.counter[data-target]');
    const counterTimers = new Map();

    const startCounter = () => {
        counters.forEach(counter => {
            if (counterTimers.has(counter)) return;

            let count = Number(counter.getAttribute('data-target')) || 0;
            const interval = Number(counter.getAttribute('data-interval')) || 1200;
            const step = Number(counter.getAttribute('data-step')) || 1;

            counter.innerText = count.toLocaleString('pt-BR');

            const timer = setInterval(() => {
                count += step;
                counter.innerText = count.toLocaleString('pt-BR');
            }, interval);

            counterTimers.set(counter, timer);
        });
    };

    // Trigger counter using Intersection Observer
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                startCounter();
            }
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
        
        // Fallback imediato se já estiver na tela
        const rect = statsSection.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
            startCounter();
            observer.unobserve(statsSection);
        }
    }
});
