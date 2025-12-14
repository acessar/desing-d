/* =========================================
   STYLE MEN - SCRIPT COMPLETO
   ========================================= */

// --- 1. LOADER ---
window.addEventListener('load', function() {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 800);
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

// --- 4. CARROSSEL / ACCORDION HORIZONTAL ---
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('servicesCarousel');
    
    // Se não houver carrossel na página, encerra a função
    if (!carousel) return;

    let currentIndex = 0;
    const cards = carousel.querySelectorAll('.service-card');
    const totalCards = cards.length;
    let isScrolling = false;
    let autoScrollInterval;
    
    // Variáveis para Drag (Arrastar)
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    let startScrollLeft = 0;
    
    // Função global para parar auto-scroll (acessível de qualquer lugar)
    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
    }
    
    // >>> CORREÇÃO PRINCIPAL: Forçar o início no zero <<<
    carousel.scrollLeft = 0;

    // Função para mover o scroll até um card específico
    function scrollToCard(index) {
        if (isScrolling || isDragging) return;
        
        // Proteção: verifica se o card existe
        if (!cards[index]) return;

        isScrolling = true;
        
        const card = cards[index];
        const cardWidth = card.offsetWidth;
        const carouselWidth = carousel.offsetWidth;
        
        // Centraliza o card
        const scrollPosition = card.offsetLeft - (carouselWidth - cardWidth) / 2;
        
        carousel.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
        
        // Atualiza classe active no desktop
        if (window.innerWidth >= 1024) {
            cards.forEach(card => card.classList.remove('active'));
            if (cards[index]) {
                cards[index].classList.add('active');
            }
        }
        
        setTimeout(() => {
            isScrolling = false;
        }, 500);
    }
    
    // Função para ir ao próximo card
    function nextCard() {
        if (isDragging) return;
        currentIndex = (currentIndex + 1) % totalCards;
        scrollToCard(currentIndex);
    }
    
    // Função para ir ao card anterior
    function prevCard() {
        if (isDragging) return;
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        scrollToCard(currentIndex);
    }
    
    // Iniciar rolagem automática
    function startAutoScroll() {
        if (isDragging) return;
        clearInterval(autoScrollInterval); // Limpa para evitar duplicidade
        autoScrollInterval = setInterval(nextCard, 4000); // 4 segundos
    }
    
    // Resetar timer de inatividade (volta a rolar se o usuário parar de mexer)
    let inactivityTimer;
    function resetAutoScroll() {
        stopAutoScroll();
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (!isDragging) {
                startAutoScroll();
            }
        }, 5000);
    }

    // --- Eventos de Mouse ---
    carousel.addEventListener('mousedown', function(e) {
        isDragging = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        startScrollLeft = carousel.scrollLeft;
        resetAutoScroll();
        e.preventDefault();
    });
    
    carousel.addEventListener('mouseleave', function() {
        if (isDragging) {
            isDragging = false;
            carousel.style.cursor = 'grab';
        }
    });
    
    carousel.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            carousel.style.cursor = 'grab';
            resetAutoScroll();
        }
    });
    
    carousel.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // Velocidade do arrasto
        carousel.scrollLeft = startScrollLeft - walk;
    });
    
    // --- Eventos de Touch (Celular) ---
    let touchStartX = 0;
    let touchStartScrollLeft = 0;
    
    carousel.addEventListener('touchstart', function(e) {
        isDragging = true;
        touchStartX = e.touches[0].pageX - carousel.offsetLeft;
        touchStartScrollLeft = carousel.scrollLeft;
        resetAutoScroll();
    }, { passive: true });
    
    carousel.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        const x = e.touches[0].pageX - carousel.offsetLeft;
        const walk = (x - touchStartX) * 2;
        carousel.scrollLeft = touchStartScrollLeft - walk;
    }, { passive: true });
    
    carousel.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            resetAutoScroll();
        }
    });
    
    // Detectar scroll manual para atualizar o índice atual
    let scrollTimeout;
    carousel.addEventListener('scroll', function() {
        // Pausa o automático se o usuário scrollar
        resetAutoScroll();
        
        // Atualiza qual é o card "ativo"
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Encontra o card mais próximo do centro
            const carouselCenter = carousel.scrollLeft + carousel.offsetWidth / 2;
            let closestIndex = 0;
            let closestDistance = Infinity;
            
            cards.forEach((card, index) => {
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const distance = Math.abs(carouselCenter - cardCenter);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
                // Remove classe active de todos os cards
                card.classList.remove('active');
            });
            currentIndex = closestIndex;
            // Adiciona classe active ao card mais próximo do centro (apenas no desktop)
            if (window.innerWidth >= 1024 && cards[closestIndex]) {
                cards[closestIndex].classList.add('active');
            }
        }, 100);
    });
    
    // Botões de navegação
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    
    if (prevBtn && nextBtn) {
        // Tamanho do scroll baseado na largura do card + gap
        // Calcula dinamicamente baseado no primeiro card visível (igual ao exemplo)
        function getScrollAmount() {
            if (cards.length === 0) return 320;
            const firstCard = cards[0];
            const cardWidth = firstCard.offsetWidth;
            const gap = parseInt(window.getComputedStyle(carousel).gap) || 16;
            return cardWidth + gap;
        }
        
        nextBtn.addEventListener('click', () => {
            const scrollAmount = getScrollAmount();
            carousel.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
            resetAutoScroll();
        });

        prevBtn.addEventListener('click', () => {
            const scrollAmount = getScrollAmount();
            carousel.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
            resetAutoScroll();
        });
    }
    
    // Inicialização final do carrossel
    setTimeout(() => {
        carousel.scrollLeft = 0; // Garante mais uma vez que começa do início
        // Adiciona classe active ao primeiro card no desktop
        if (window.innerWidth >= 1024 && cards[0]) {
            cards[0].classList.add('active');
        }
        startAutoScroll();
    }, 1000);
});

// Smooth scroll para links internos (caso adicione menu no futuro)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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
            // Tenta enviar mensagem para abrir
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
            // Tenta clicar se for clicável
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
            
            // Aguarda o script do chatbot carregar
            let attempts = 0;
            const maxAttempts = 10;
            
            const tryOpen = setInterval(() => {
                attempts++;
                openChatbot();
                
                // Verifica se o chatbot foi aberto ou se excedeu tentativas
                const widgetVisible = document.querySelector('[id*="chtl-widget"][style*="block"], [class*="chtl-widget"][style*="block"]');
                if (widgetVisible || attempts >= maxAttempts) {
                    clearInterval(tryOpen);
                }
            }, 300);
            
            // Para após 3 segundos
            setTimeout(() => {
                clearInterval(tryOpen);
            }, 3000);
        });
    }
    
    // Botão Flutuante do Chatbot
    const floatingChatbot = document.getElementById('floatingChatbot');
    if (floatingChatbot) {
        floatingChatbot.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Aguarda o script do chatbot carregar
            let attempts = 0;
            const maxAttempts = 10;
            
            const tryOpen = setInterval(() => {
                attempts++;
                openChatbot();
                
                // Verifica se o chatbot foi aberto ou se excedeu tentativas
                const widgetVisible = document.querySelector('[id*="chtl-widget"][style*="block"], [class*="chtl-widget"][style*="block"]');
                if (widgetVisible || attempts >= maxAttempts) {
                    clearInterval(tryOpen);
                }
            }, 300);
            
            // Para após 3 segundos
            setTimeout(() => {
                clearInterval(tryOpen);
            }, 3000);
        });
    }
    
    // Cards do carrossel - Abrir chatbot ao clicar
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Aguarda o script do chatbot carregar
            let attempts = 0;
            const maxAttempts = 10;
            
            const tryOpen = setInterval(() => {
                attempts++;
                openChatbot();
                
                // Verifica se o chatbot foi aberto ou se excedeu tentativas
                const widgetVisible = document.querySelector('[id*="chtl-widget"][style*="block"], [class*="chtl-widget"][style*="block"]');
                if (widgetVisible || attempts >= maxAttempts) {
                    clearInterval(tryOpen);
                }
            }, 300);
            
            // Para após 3 segundos
            setTimeout(() => {
                clearInterval(tryOpen);
            }, 3000);
        });
    });
});
