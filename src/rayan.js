export default function mount(scope) {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const pointer = { x: 0, y: 0 };
  scope.on(
    window,
    'pointermove',
    (event) => {
      pointer.x = event.clientX / Math.max(innerWidth, 1) - 0.5;
      pointer.y = event.clientY / Math.max(innerHeight, 1) - 0.5;
    },
    { passive: true },
  );

  class ConnectedField {
    constructor(canvas, mode) {
      this.canvas = canvas;
      this.mode = mode;
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

    polygon(center, radius, sides, rotation, color) {
      const context = this.context;
      if (!context) return;
      context.beginPath();
      for (let index = 0; index < sides; index += 1) {
        const angle = rotation + (index / sides) * Math.PI * 2;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.stroke();
    }

    drawHero(time) {
      const context = this.context;
      if (!context) return;
      const seconds = time * 0.001;
      const compact = this.width < 760;
      const center = {
        x: this.width * (compact ? 0.75 : 0.79) + pointer.x * 14,
        y: this.height * 0.49 + pointer.y * 11,
      };
      const radius = Math.min(this.width, this.height) * (compact ? 0.2 : 0.27);
      const colors = ['#35d8ff', '#8a72ff', '#45efad', '#087cff', '#35d8ff'];
      const phases = [-2.7, -1.6, -0.45, 0.62, 1.75];
      const nodes = phases.map((phase, index) => ({
        x: center.x + Math.cos(phase) * radius * (index === 3 ? 0.84 : 1),
        y: center.y + Math.sin(phase) * radius * (index === 3 ? 0.84 : 1),
      }));

      nodes.forEach((node, index) => {
        const bend = {
          x: center.x + (node.x - center.x) * 0.52,
          y: center.y + (node.y - center.y) * 0.2,
        };
        context.beginPath();
        context.moveTo(center.x, center.y);
        context.quadraticCurveTo(bend.x, bend.y, node.x, node.y);
        context.strokeStyle = colors[index];
        context.globalAlpha = 0.28;
        context.lineWidth = 1;
        context.stroke();
        context.globalAlpha = 1;

        const travel = (seconds * (0.14 + index * 0.011) + index * 0.19) % 1;
        const inverse = 1 - travel;
        const packet = {
          x: inverse * inverse * center.x + 2 * inverse * travel * bend.x + travel * travel * node.x,
          y: inverse * inverse * center.y + 2 * inverse * travel * bend.y + travel * travel * node.y,
        };
        this.dot(packet, 2.2, colors[index], 12);
        this.dot(node, 4, colors[index], 10);
        context.beginPath();
        context.arc(node.x, node.y, 10 + Math.sin(seconds * 1.7 + index) * 2, 0, Math.PI * 2);
        context.strokeStyle = colors[index];
        context.globalAlpha = 0.19;
        context.stroke();
        context.globalAlpha = 1;
      });

      for (let ring = 0; ring < 3; ring += 1) {
        context.beginPath();
        context.arc(center.x, center.y, 36 + ring * 18 + Math.sin(seconds + ring) * 2, 0, Math.PI * 2);
        context.strokeStyle = ring === 1 ? '#8a72ff' : '#35d8ff';
        context.globalAlpha = 0.16 - ring * 0.025;
        context.stroke();
      }
      context.globalAlpha = 1;
      this.polygon(center, 27, 6, seconds * 0.16, '#35d8ff');
      this.polygon(center, 16, 4, Math.PI / 4 - seconds * 0.12, '#8a72ff');
      this.dot(center, 4, '#45efad', 15);
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
          if (distance < 145) this.line(mapped[left], mapped[right], '#35d8ff', (1 - distance / 145) * 0.18);
        }
      }
      mapped.forEach((point, index) => {
        const active = (Math.floor(seconds * 2) + index) % 7 === 0;
        this.dot(point, active ? 2.4 : 1.2, index % 5 === 0 ? '#45efad' : '#35d8ff', active ? 10 : 0);
      });
    }

    draw(time) {
      const context = this.context;
      if (!context || !this.width || !this.height) return;
      context.clearRect(0, 0, this.width, this.height);
      if (this.mode === 'hero') this.drawHero(time);
      else this.drawFuture(time);
      if (!reducedMotion) this.frame = scope.requestAnimationFrame((nextTime) => this.draw(nextTime));
    }
  }

  const heroCanvas = $('#rayan-network-canvas');
  if (heroCanvas instanceof HTMLCanvasElement) new ConnectedField(heroCanvas, 'hero');
  const futureCanvas = $('#rayan-future-canvas');
  if (futureCanvas instanceof HTMLCanvasElement) new ConnectedField(futureCanvas, 'future');

  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
}
