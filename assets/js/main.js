/* 
    TorreSoft Sistemas - Scripts 
    Author: Gemini CLI
*/

document.addEventListener('DOMContentLoaded', () => {
    const floatingContact = document.createElement('div');
    floatingContact.className = 'floating-contact';
    floatingContact.innerHTML = `
        <a class="whatsapp" href="https://wa.me/5534992693522" target="_blank" rel="noopener noreferrer" aria-label="Falar com a TorreSoft pelo WhatsApp">
            <i class="fab fa-whatsapp"></i>
        </a>
        <a class="support" href="suporte.html" aria-label="Acessar suporte TorreSoft">
            <i class="fas fa-headset"></i>
        </a>
    `;
    document.body.appendChild(floatingContact);

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
    const counters = document.querySelectorAll('.counter');
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
