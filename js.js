class Carousel {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        this.track = this.container.querySelector('.carousel-track');
        this.slides = Array.from(this.track.children);
        this.btnPrev = this.container.querySelector('.carousel-nav-btn.prev');
        this.btnNext = this.container.querySelector('.carousel-nav-btn.next');
        this.dotsContainer = document.querySelector('.carousel-dots');

        this.originalCount = this.slides.length;
        if (this.originalCount === 0) return;

        this.currentIndex = this.originalCount; // Começa no primeiro slide original (após os clones do início)
        this.isTransitioning = false;
        this.autoPlayTimer = null;
        this.autoPlayDelay = 4000; // 4 segundos

        this.init();
    }

    init() {
        // Clonagem dos slides para o loop infinito
        // Cria cópias completas do deck original
        const firstClones = this.slides.map(slide => slide.cloneNode(true));
        const lastClones = this.slides.map(slide => slide.cloneNode(true));

        // Define aria-hidden nos clones para acessibilidade
        firstClones.forEach(clone => clone.setAttribute('aria-hidden', 'true'));
        lastClones.forEach(clone => clone.setAttribute('aria-hidden', 'true'));

        // Adiciona os clones ao track
        firstClones.forEach(clone => this.track.appendChild(clone));
        lastClones.reverse().forEach(clone => this.track.insertBefore(clone, this.track.firstChild));

        // Atualiza a lista completa de slides
        this.allSlides = Array.from(this.track.children);

        // Cria os pontos de paginação dinamicamente
        this.createDots();

        // Listeners de eventos
        this.btnPrev.addEventListener('click', () => this.prev());
        this.btnNext.addEventListener('click', () => this.next());

        this.track.addEventListener('transitionend', () => this.handleTransitionEnd());

        // Atualiza a posição ao redimensionar a tela
        window.addEventListener('resize', () => this.handleResize());

        // Controles de autoplay com pausa no hover e foco
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
        this.container.addEventListener('focusin', () => this.stopAutoPlay());
        this.container.addEventListener('focusout', () => this.startAutoPlay());

        // Navegação por teclado
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
            } else if (e.key === 'ArrowRight') {
                this.next();
            }
        });

        // Inicializa o carrossel na posição correta
        this.updatePosition(false);
        this.updateDots();
        this.startAutoPlay();
    }

    createDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.innerHTML = '';
        for (let i = 0; i < this.originalCount; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('type', 'button');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Ir para o slide ${i + 1}`);
            dot.addEventListener('click', () => this.goTo(i));
            this.dotsContainer.appendChild(dot);
        }
    }

    getSlideWidth() {
        const slide = this.allSlides[0];
        return slide ? slide.getBoundingClientRect().width : 0;
    }

    getGap() {
        return parseFloat(window.getComputedStyle(this.track).gap) || 0;
    }

    updatePosition(animate = true) {
        if (animate) {
            this.track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        } else {
            this.track.style.transition = 'none';
        }

        const slideWidth = this.getSlideWidth();
        const gap = this.getGap();
        const offset = this.currentIndex * (slideWidth + gap);

        this.track.style.transform = `translateX(-${offset}px)`;
    }

    updateDots() {
        if (!this.dotsContainer) return;
        const dots = Array.from(this.dotsContainer.children);
        dots.forEach(dot => dot.classList.remove('active'));

        let activeIndex = (this.currentIndex - this.originalCount) % this.originalCount;
        if (activeIndex < 0) {
            activeIndex += this.originalCount;
        }

        if (dots[activeIndex]) {
            dots[activeIndex].classList.add('active');
        }
    }

    next() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex++;
        this.updatePosition(true);
        this.updateDots();
    }

    prev() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex--;
        this.updatePosition(true);
        this.updateDots();
    }

    goTo(index) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex = this.originalCount + index;
        this.updatePosition(true);
        this.updateDots();
    }

    handleTransitionEnd() {
        this.isTransitioning = false;

        // Loop infinito - reposiciona sem animação se atingiu o limite
        if (this.currentIndex >= 2 * this.originalCount) {
            this.currentIndex -= this.originalCount;
            this.updatePosition(false);
        } else if (this.currentIndex < this.originalCount) {
            this.currentIndex += this.originalCount;
            this.updatePosition(false);
        }
    }

    handleResize() {
        this.track.style.transition = 'none';
        this.updatePosition(false);
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayTimer = setInterval(() => this.next(), this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Inicializa o carrossel de projetos
    new Carousel('.carousel-container');

    // Scroll suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Destaque do menu ativo durante scroll
    var sections = document.querySelectorAll('section[id]');
    var links = document.querySelectorAll('nav a');

    function atualizarMenu() {
        var offset = window.innerHeight * 0.35;
        sections.forEach(function (sec) {
            var top = sec.getBoundingClientRect().top;
            var id = sec.getAttribute('id');
            var link = document.querySelector('nav a[href="#' + id + '"]');
            if (link) {
                if (top <= offset && top >= -offset) {
                    link.classList.add('ativo');
                } else {
                    link.classList.remove('ativo');
                }
            }
        });
    }

    window.addEventListener('scroll', atualizarMenu);
    atualizarMenu();

    // Voltar ao topo com botão
    var btnTop = document.createElement('button');
    btnTop.textContent = '↑';
    btnTop.id = 'btn-voltar-topo';
    btnTop.title = 'Voltar ao topo';
    document.body.appendChild(btnTop);

    btnTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
        btnTop.style.display = window.scrollY > 320 ? 'block' : 'none';
    });

    // Validação simples de formulário
    var form = document.querySelector('#contato form');
    if (form) {
        form.addEventListener('submit', function (e) {
            var nome = form.querySelector('#nome').value.trim();
            var email = form.querySelector('#email').value.trim();

            if (!nome || !email) {
                e.preventDefault();
                alert('Por favor, preencha os campos Nome e E-mail antes de enviar.');
                return;
            }

            alert('Obrigado! Sua solicitação foi enviada com sucesso.');
        });
    }

    // Animação de entrada das seções
    var observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(function (section) {
        observer.observe(section);
    });

    // Efeito de hover nos cards de serviço
    document.querySelectorAll('.servico-item').forEach(function (item) {
        item.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        item.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});
