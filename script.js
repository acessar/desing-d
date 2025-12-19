/* =========================================
   STYLE MEN - SCRIPT COMPLETO COM CARROSSEL INFINITO
   ========================================= */

// --- 1. LOADER ---
window.addEventListener('load', function() {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 600);
});

// --- 2. ANIMAÇÕES FADE-IN NO SCROLL ---
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.fade-in-element').forEach(el => {
        observer.observe(el);
    });
});

// --- 3. EFEITO PARALLAX SUAVE ---
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const banner = document.querySelector('.hero-banner');
    if (banner) {
        const rate = scrolled * -0.3;
        banner.style.transform = `translateY(${rate}px)`;
    }
});

// --- 4. INFINITE LOOP CAROUSEL CLASS ---
class InfiniteCarousel {
    constructor(options = {}) {
        // Configurações padrão
        this.config = {
            containerSelector: '.products',
            wrapperSelector: '.products__wrapper',
            carouselSelector: '.products__carousel',
            cardSelector: '.product-card',
            indicatorsSelector: '.products__indicators',
            autoplay: true,
            autoplayInterval: 4000,
            transitionDuration: 1000,
            pauseOnHover: true,
            ...options
        };

        // Estado
        this.currentIndex = 0;
        this.totalSlides = 0;
        this.autoplayTimer = null;
        this.isPlaying = this.config.autoplay;
        this.isDragging = false;
        this.isTransitioning = false;
        this.startX = 0;
        this.currentX = 0;
        this.dragThreshold = 50;
        this.animationFrame = null;
        this.jumpTimeout = null;

        // Elementos DOM
        this.container = null;
        this.wrapper = null;
        this.carousel = null;
        this.cards = [];
        this.originalCards = [];
        this.indicators = null;
        this.dots = [];

        this.init();
    }

    init() {
        this.container = document.querySelector(this.config.containerSelector);
        if (!this.container) return;

        this.wrapper = this.container.querySelector(this.config.wrapperSelector);
        this.carousel = this.container.querySelector(this.config.carouselSelector);
        this.originalCards = [...this.carousel.querySelectorAll(this.config.cardSelector)];
        this.indicators = this.container.querySelector(this.config.indicatorsSelector);

        this.totalSlides = this.originalCards.length;

        if (this.totalSlides === 0) return;

        // Configurar carousel infinito
        this.setupInfiniteCarousel();
        this.createIndicators();
        this.bindEvents();
        
        // Inicializar na posição correta (primeiro card real)
        setTimeout(() => {
            this.goToSlide(0, false);
            // Garantir que o primeiro card seja marcado como ativo
            this.updateActiveStates();
        }, 100);

        // Iniciar autoplay imediatamente para movimento contínuo
        if (this.config.autoplay) {
            setTimeout(() => {
                this.startAutoplay();
            }, 300);
        }
    }

    setupInfiniteCarousel() {
        // Clonar cards para criar loop infinito
        const fragment = document.createDocumentFragment();
        
        // Clonar os últimos 2 cards e adicionar no início
        for (let i = this.totalSlides - 1; i >= Math.max(0, this.totalSlides - 2); i--) {
            const clone = this.originalCards[i].cloneNode(true);
            clone.classList.add('clone');
            clone.setAttribute('data-clone', 'prepend');
            clone.setAttribute('data-original-index', i);
            this.carousel.insertBefore(clone, this.carousel.firstChild);
        }
        
        // Clonar os primeiros 2 cards e adicionar no final
        for (let i = 0; i < Math.min(2, this.totalSlides); i++) {
            const clone = this.originalCards[i].cloneNode(true);
            clone.classList.add('clone');
            clone.setAttribute('data-clone', 'append');
            clone.setAttribute('data-original-index', i);
            this.carousel.appendChild(clone);
        }

        // Atualizar lista de cards (incluindo clones)
        this.cards = [...this.carousel.querySelectorAll(this.config.cardSelector)];
        
        // Número de clones no início
        this.clonesBefore = Math.min(2, this.totalSlides);
        
        // Configurar transição suave para movimento contínuo
        this.carousel.style.transition = `transform ${this.config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    }

    createIndicators() {
        if (!this.indicators) return;

        this.indicators.innerHTML = '';

        // Criar dots apenas para cards originais
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'products__dot';
            if (i === 0) dot.classList.add('active'); // Primeiro dot ativo
            dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
            dot.addEventListener('click', () => {
                this.goToSlide(i);
                this.resetAutoplayTimer();
            });
            this.indicators.appendChild(dot);
        }

        this.dots = [...this.indicators.querySelectorAll('.products__dot')];
    }

    bindEvents() {
        // Pausar autoplay no hover
        if (this.config.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.container.addEventListener('mouseleave', () => this.resumeAutoplay());
        }

        // Mouse drag events
        this.carousel.addEventListener('mousedown', (e) => this.handleDragStart(e));
        this.carousel.addEventListener('mousemove', (e) => this.handleDragMove(e));
        this.carousel.addEventListener('mouseup', (e) => this.handleDragEnd(e));
        this.carousel.addEventListener('mouseleave', (e) => {
            if (this.isDragging) this.handleDragEnd(e);
        });

        // Touch events
        this.carousel.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: true });
        this.carousel.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: true });
        this.carousel.addEventListener('touchend', (e) => this.handleDragEnd(e));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Resize handler
        window.addEventListener('resize', () => this.handleResize());

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else {
                this.resumeAutoplay();
            }
        });

        // Listener para fim da transição (para o loop infinito)
        this.carousel.addEventListener('transitionend', () => this.handleTransitionEnd());

        // Adicionar eventos de clique nos cards para abrir chatbot
        this.cards.forEach(card => {
            card.addEventListener('click', () => {
                openChatbot();
            });
        });
    }

    getCardWidth() {
        return this.cards[0].offsetWidth;
    }

    getWrapperWidth() {
        return this.wrapper ? this.wrapper.offsetWidth : this.carousel.parentElement.offsetWidth;
    }

    goToSlide(index, animate = true) {
        this.currentIndex = index;
        
        const realIndex = index + this.clonesBefore;
        const cardWidth = this.getCardWidth();
        const wrapperWidth = this.getWrapperWidth();
        
        // No mobile, não centralizar - mostrar o card do início
        const isMobile = window.innerWidth < 640;
        const centerOffset = isMobile ? 0 : (wrapperWidth - cardWidth) / 2;
        const translateX = -(realIndex * cardWidth) + centerOffset;

        if (animate) {
            this.carousel.style.transition = `transform ${this.config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        } else {
            this.carousel.style.transition = 'none';
        }

        this.carousel.style.transform = `translateX(${translateX}px)`;

        if (!animate) {
            void this.carousel.offsetHeight;
            this.carousel.style.transition = `transform ${this.config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            this.isTransitioning = false;
        }

        this.updateActiveStates();
    }

    handleTransitionEnd() {
        // Não fazer nada aqui - permitir movimento contínuo
        // Não resetar isTransitioning para manter movimento fluido
        this.isTransitioning = false;
    }

    jumpToSlide(index) {
        if (this.autoplayTimer) {
            clearTimeout(this.autoplayTimer);
            this.autoplayTimer = null;
        }
        
        if (this.jumpTimeout) {
            clearTimeout(this.jumpTimeout);
            this.jumpTimeout = null;
        }
        
        const realIndex = index + this.clonesBefore;
        const cardWidth = this.getCardWidth();
        const wrapperWidth = this.getWrapperWidth();
        const isMobile = window.innerWidth < 640;
        const centerOffset = isMobile ? 0 : (wrapperWidth - cardWidth) / 2;
        const translateX = -(realIndex * cardWidth) + centerOffset;

        this.carousel.style.transition = 'none';
        this.carousel.style.transform = `translateX(${translateX}px)`;
        
        void this.carousel.offsetHeight;
        
        this.carousel.style.transition = `transform ${this.config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        this.isTransitioning = false;
        
        this.updateActiveStates();
        
        // Continuar movimento imediatamente após jump para movimento contínuo
        if (this.isPlaying && !this.isDragging) {
            // Pequeno delay para garantir que o jump foi aplicado
            setTimeout(() => {
                const nextIndex = this.currentIndex + 1;
                if (nextIndex >= this.totalSlides) {
                    this.currentIndex = this.totalSlides;
                    this.goToClone('next');
                } else {
                    this.goToSlide(nextIndex, true);
                }
                this.scheduleNextAutoplay();
            }, 10);
        }
    }
    
    scheduleNextAutoplay() {
        if (!this.isPlaying || this.isDragging) return;
        
        // Começar próximo movimento mais cedo para movimento contínuo (65% da duração)
        const overlapTime = this.config.transitionDuration * 0.65;
        this.autoplayTimer = setTimeout(() => {
            if (!this.isDragging && this.isPlaying) {
                this.next();
                this.scheduleNextAutoplay();
            }
        }, overlapTime);
    }

    updateActiveStates() {
        let normalizedIndex = this.currentIndex;
        if (normalizedIndex < 0) normalizedIndex = this.totalSlides - 1;
        if (normalizedIndex >= this.totalSlides) normalizedIndex = 0;

        this.cards.forEach((card, i) => {
            const isOriginal = !card.classList.contains('clone');
            const cardIndex = isOriginal 
                ? this.originalCards.indexOf(card)
                : parseInt(card.getAttribute('data-original-index'));
            
            card.classList.toggle('active', cardIndex === normalizedIndex);
        });

        if (this.dots) {
            this.dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === normalizedIndex);
            });
        }
    }

    next() {
        // Não bloquear - permitir movimento contínuo
        const nextIndex = this.currentIndex + 1;
        
        if (nextIndex >= this.totalSlides) {
            this.currentIndex = this.totalSlides;
            this.goToClone('next');
        } else {
            this.goToSlide(nextIndex, true);
        }
    }

    prev() {
        if (this.isTransitioning) return;
        
        const prevIndex = this.currentIndex - 1;
        
        if (prevIndex < 0) {
            this.currentIndex = -1;
            this.goToClone('prev');
        } else {
            this.goToSlide(prevIndex);
        }
    }

    goToClone(direction) {
        let realIndex;
        let targetIndex;
        if (direction === 'next') {
            realIndex = this.totalSlides + this.clonesBefore;
            targetIndex = 0;
        } else {
            realIndex = this.clonesBefore - 1;
            targetIndex = this.totalSlides - 1;
        }

        const cardWidth = this.getCardWidth();
        const wrapperWidth = this.getWrapperWidth();
        const isMobile = window.innerWidth < 640;
        const centerOffset = isMobile ? 0 : (wrapperWidth - cardWidth) / 2;
        const translateX = -(realIndex * cardWidth) + centerOffset;

        this.carousel.style.transition = `transform ${this.config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        this.carousel.style.transform = `translateX(${translateX}px)`;

        this.updateActiveStates();
        
        // Fazer o jump mais rápido (45% da duração) para movimento contínuo sem pausas
        const jumpDelay = Math.max(20, this.config.transitionDuration * 0.45);
        this.jumpTimeout = setTimeout(() => {
            if ((direction === 'next' && this.currentIndex >= this.totalSlides) ||
                (direction === 'prev' && this.currentIndex < 0)) {
                this.currentIndex = targetIndex;
                this.jumpToSlide(this.currentIndex);
            }
        }, jumpDelay);
    }

    startAutoplay() {
        if (!this.config.autoplay) return;
        this.isPlaying = true;
        
        this.next();
        this.scheduleNextAutoplay();
    }

    stopAutoplay() {
        if (this.autoplayTimer) {
            clearTimeout(this.autoplayTimer);
            this.autoplayTimer = null;
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.jumpTimeout) {
            clearTimeout(this.jumpTimeout);
            this.jumpTimeout = null;
        }
    }

    pauseAutoplay() {
        this.stopAutoplay();
    }

    resumeAutoplay() {
        if (this.isPlaying && this.config.autoplay) {
            this.stopAutoplay();
            this.startAutoplay();
        }
    }

    resetAutoplayTimer() {
        if (this.isPlaying && this.config.autoplay) {
            this.stopAutoplay();
            this.startAutoplay();
        }
    }

    handleDragStart(e) {
        if (this.isTransitioning) return;
        
        this.isDragging = true;
        this.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        this.carousel.classList.add('dragging');
        this.carousel.style.cursor = 'grabbing';
        this.pauseAutoplay();
    }

    handleDragMove(e) {
        if (!this.isDragging) return;
        if (e.type.includes('mouse')) e.preventDefault();
        this.currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    }

    handleDragEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.carousel.classList.remove('dragging');
        this.carousel.style.cursor = 'grab';

        const diff = this.startX - this.currentX;

        if (Math.abs(diff) > this.dragThreshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }

        this.resumeAutoplay();
    }

    handleKeyboard(e) {
        if (this.isTransitioning) return;
        
        if (e.key === 'ArrowLeft') {
            this.prev();
            this.resetAutoplayTimer();
        } else if (e.key === 'ArrowRight') {
            this.next();
            this.resetAutoplayTimer();
        }
    }

    handleResize() {
        this.goToSlide(this.currentIndex, false);
    }

    destroy() {
        this.stopAutoplay();
    }

    getState() {
        return {
            currentIndex: this.currentIndex,
            totalSlides: this.totalSlides,
            isPlaying: this.isPlaying
        };
    }
}

// =========================================
// INICIALIZAÇÃO DO CARROSSEL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new InfiniteCarousel({
        autoplay: true,
        autoplayInterval: 4000,
        transitionDuration: 3000,
        pauseOnHover: false
    });

    window.carousel = carousel;
});

// Smooth scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Detecção de Touch Device
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}

// --- 5. BOTÃO AGENDAR CHATBOT ---
function openChatbot() {
    if (window.Chatling) {
        window.Chatling.open();
    } else {
        // Método alternativo: Tenta encontrar e clicar no botão flutuante do chatbot
        const chatbotButton = document.querySelector('[id*="chtl"], [class*="chtl-button"], [data-id="4924658132"], button[class*="chat"]');
        if (chatbotButton) {
            chatbotButton.click();
            return;
        }
        
        // Método 2: Tenta encontrar o widget do chatbot e exibi-lo
        const chatWidget = document.querySelector('#chtl-widget, .chtl-widget, [class*="chtl-widget"], [id*="chtl-widget"]');
        if (chatWidget) {
            chatWidget.style.display = 'block';
            chatWidget.style.visibility = 'visible';
            chatWidget.style.opacity = '1';
            chatWidget.style.zIndex = '99999';
            return;
        }
        
        // Método 3: Tenta encontrar o iframe do chatbot
        const chatbotIframe = document.querySelector('iframe[src*="chatling"], iframe[src*="chtl"]');
        if (chatbotIframe) {
            chatbotIframe.style.display = 'block';
            chatbotIframe.style.visibility = 'visible';
            chatbotIframe.style.zIndex = '99999';
            try {
                chatbotIframe.contentWindow.postMessage({ type: 'open', action: 'open' }, '*');
            } catch (err) {
                console.log('Não foi possível enviar mensagem ao iframe');
            }
            return;
        }
        
        // Método 4: Tenta encontrar qualquer elemento relacionado ao chatbot
        const allChatElements = document.querySelectorAll('[id*="chtl"], [class*="chtl"], [data-id*="4924658132"]');
        allChatElements.forEach(el => {
            if (el.style) {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.zIndex = '99999';
            }
            if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.onclick) {
                el.click();
            }
        });
    }
}

// Botão Agendar
document.addEventListener('DOMContentLoaded', function() {
    const agendarBtn = document.querySelector('.main-button');
    if (agendarBtn) {
        agendarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            let attempts = 0;
            const maxAttempts = 10;
            
            const tryOpen = setInterval(() => {
                attempts++;
                openChatbot();
                
                const widgetVisible = document.querySelector('[id*="chtl-widget"][style*="block"], [class*="chtl-widget"][style*="block"]');
                if (widgetVisible || attempts >= maxAttempts) {
                    clearInterval(tryOpen);
                }
            }, 300);
            
            setTimeout(() => {
                clearInterval(tryOpen);
            }, 3000);
        });
    }
});
