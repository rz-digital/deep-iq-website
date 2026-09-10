const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = $('[data-header]');
const progress = $('.reading-progress span');

const syncScrollState = () => {
  header?.classList.toggle('scrolled', window.scrollY > 28);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = `${scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0}%`;
};

syncScrollState();
window.addEventListener('scroll', syncScrollState, { passive: true });
window.addEventListener('resize', syncScrollState, { passive: true });

const menuButton = $('.menu-toggle');
const mobileNav = $('.mobile-nav');
const setMenuOpen = (open) => {
  menuButton?.classList.toggle('open', open);
  menuButton?.setAttribute('aria-expanded', String(open));
  menuButton?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNav?.classList.toggle('open', open);
  mobileNav?.setAttribute('aria-hidden', String(!open));
  if (mobileNav) mobileNav.inert = !open;
  document.body.style.overflow = open ? 'hidden' : '';
};

menuButton?.addEventListener('click', () => setMenuOpen(!mobileNav?.classList.contains('open')));
$$('.mobile-nav a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileNav?.classList.contains('open')) {
    setMenuOpen(false);
    menuButton?.focus();
  }
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 1100 && mobileNav?.classList.contains('open')) setMenuOpen(false);
}, { passive: true });

const revealElements = $$('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px' });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('in-view'));
}

const cursorAura = $('.cursor-aura');
if (cursorAura && window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    cursorAura.style.opacity = '1';
    cursorAura.style.left = `${event.clientX}px`;
    cursorAura.style.top = `${event.clientY}px`;
  }, { passive: true });
}

const heroImage = $('[data-parallax]');
if (heroImage && !reducedMotion) {
  window.addEventListener('scroll', () => {
    heroImage.style.transform = `scale(1.035) translateY(${Math.min(window.scrollY * 0.07, 65)}px)`;
  }, { passive: true });
}

class TelemetryField {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.context = canvas?.getContext('2d');
    this.options = { density: 26, maxDistance: 145, speed: 0.12, ...options };
    this.points = [];
    this.frame = 0;
    this.running = false;
    this.width = 0;
    this.height = 0;
    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);
    if (!this.context) return;
    this.resize();
    window.addEventListener('resize', this.resize);
    if (!reducedMotion) this.start();
    else this.draw(true);
  }

  start() {
    if (!this.context || this.running || reducedMotion) return;
    this.running = true;
    this.frame = requestAnimationFrame(this.draw);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    this.canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.max(18, Math.min(78, Math.floor(rect.width / this.options.density)));
    this.points = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * this.options.speed,
      vy: (Math.random() - 0.5) * this.options.speed,
      size: index % 9 === 0 ? Math.random() * 1.7 + 1 : Math.random() * 1.1 + 0.35,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  draw(singleFrame = false) {
    if (!singleFrame && !this.running) return;
    const context = this.context;
    context.clearRect(0, 0, this.width, this.height);
    const time = performance.now() * 0.001;

    this.points.forEach((point, index) => {
      if (!singleFrame) {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < -10 || point.x > this.width + 10) point.vx *= -1;
        if (point.y < -10 || point.y > this.height + 10) point.vy *= -1;
      }

      const glow = 0.52 + Math.sin(time * 1.5 + point.phase) * 0.28;
      context.beginPath();
      context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      context.fillStyle = `rgba(84, 220, 255, ${Math.max(0.18, glow)})`;
      context.fill();

      for (let otherIndex = index + 1; otherIndex < this.points.length; otherIndex += 1) {
        const other = this.points[otherIndex];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance > this.options.maxDistance) continue;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(31, 174, 255, ${(1 - distance / this.options.maxDistance) * 0.13})`;
        context.lineWidth = 0.65;
        context.stroke();
      }
    });

    if (!singleFrame && this.running) this.frame = requestAnimationFrame(this.draw);
  }
}

const heroField = new TelemetryField($('#telemetry-canvas'), { density: 31, maxDistance: 155, speed: 0.15 });
const ctaField = new TelemetryField($('#cta-canvas'), { density: 24, maxDistance: 135, speed: 0.1 });

document.addEventListener('visibilitychange', () => {
  [heroField, ctaField].forEach((field) => {
    if (!field?.context || reducedMotion) return;
    if (document.hidden) field.stop();
    else field.start();
  });
});

$('#year')?.replaceChildren(String(new Date().getFullYear()));
