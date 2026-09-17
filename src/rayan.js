export default function mount(scope) {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pageColors = getComputedStyle(document.documentElement);
  const diagramColors = {
    bright: pageColors.getPropertyValue('--blue-bright').trim(),
    cyan: pageColors.getPropertyValue('--cyan').trim(),
  };

  const header = $('[data-header]');
  const progress = $('.reading-progress span');
  const syncScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 30);
    if (progress instanceof HTMLElement) {
      const available = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      progress.style.width = `${Math.min((scrollY / available) * 100, 100)}%`;
    }
  };
  syncScroll();
  scope.on(window, 'scroll', syncScroll, { passive: true });

  const menuButton = $('.menu-toggle');
  const mobileNav = $('.mobile-nav');
  const closeMenu = () => {
    menuButton?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    mobileNav?.classList.remove('open');
    mobileNav?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  scope.on(menuButton, 'click', () => {
    const isOpen = !mobileNav?.classList.contains('open');
    menuButton?.classList.toggle('open', isOpen);
    menuButton?.setAttribute('aria-expanded', String(isOpen));
    mobileNav?.classList.toggle('open', isOpen);
    mobileNav?.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  $$('.mobile-nav a').forEach((link) => scope.on(link, 'click', closeMenu));

  if (reducedMotion) {
    $$('.reveal').forEach((element) => element.classList.add('in-view'));
  } else {
    const revealObserver = scope.observe(
      IntersectionObserver,
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -45px' },
    );
    $$('.reveal').forEach((element) => revealObserver.observe(element));
  }

  const cursorAura = $('.cursor-aura');
  if (matchMedia('(pointer:fine)').matches) {
    scope.on(
      window,
      'pointermove',
      (event) => {
        if (!(cursorAura instanceof HTMLElement)) return;
        cursorAura.style.opacity = '1';
        cursorAura.style.left = `${event.clientX}px`;
        cursorAura.style.top = `${event.clientY}px`;
      },
      { passive: true },
    );
  }

  class ConnectedField {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d');
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.points = Array.from({ length: 34 }, (_, index) => ({
        x: ((index * 47) % 101) / 100,
        y: ((index * 67 + 13) % 97) / 96,
        phase: index * 0.61,
      }));
      this.resizeObserver = scope.observe(ResizeObserver, () => this.resize());
      this.resizeObserver.observe(canvas);
      this.resize();
      if (reducedMotion) this.draw(0);
      else this.frame = scope.requestAnimationFrame((time) => this.draw(time));
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = Math.max(rect.width, 1);
      this.height = Math.max(rect.height, 1);
      this.dpr = Math.min(devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.context?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      if (reducedMotion) this.draw(0);
    }

    line(from, to, color, alpha = 1) {
      const context = this.context;
      if (!context) return;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.strokeStyle = color;
      context.globalAlpha = alpha;
      context.lineWidth = 1;
      context.stroke();
      context.globalAlpha = 1;
    }

    dot(point, radius, color, glow = 0) {
      const context = this.context;
      if (!context) return;
      context.save();
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = glow;
      context.fill();
      context.restore();
    }

    drawFuture(time) {
      const context = this.context;
      if (!context) return;
      const seconds = time * 0.001;
      const mapped = this.points.map((point) => ({
        x: point.x * this.width + Math.sin(seconds * 0.2 + point.phase) * 8,
        y: point.y * this.height + Math.cos(seconds * 0.17 + point.phase) * 7,
        phase: point.phase,
      }));
      for (let left = 0; left < mapped.length; left += 1) {
        for (let right = left + 1; right < mapped.length; right += 1) {
          const dx = mapped[left].x - mapped[right].x;
          const dy = mapped[left].y - mapped[right].y;
          const distance = Math.hypot(dx, dy);
          if (distance < 145) {
            this.line(mapped[left], mapped[right], diagramColors.cyan, (1 - distance / 145) * 0.18);
          }
        }
      }
      mapped.forEach((point, index) => {
        const active = (Math.floor(seconds * 2) + index) % 7 === 0;
        this.dot(
          point,
          active ? 2.4 : 1.2,
          index % 5 === 0 ? diagramColors.bright : diagramColors.cyan,
          active ? 10 : 0,
        );
      });
    }

    draw(time) {
      const context = this.context;
      if (!context || !this.width || !this.height) return;
      context.clearRect(0, 0, this.width, this.height);
      this.drawFuture(time);
      if (!reducedMotion) this.frame = scope.requestAnimationFrame((nextTime) => this.draw(nextTime));
    }
  }

  const futureCanvas = $('#rayan-future-canvas');
  if (futureCanvas instanceof HTMLCanvasElement) new ConnectedField(futureCanvas);

  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
}
