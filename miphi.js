export default function mount(scope) {
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const header = $('[data-header]');
const progress = $('.reading-progress span');
const syncScrollState = () => {
  header?.classList.toggle('scrolled', window.scrollY > 28);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = `${scrollable > 0 ? Math.min(100, window.scrollY / scrollable * 100) : 0}%`;
};
syncScrollState();
scope.on(window, 'scroll', syncScrollState, { passive: true });

const menuButton = $('.menu-toggle');
const mobileNav = $('.mobile-nav');
const setMenuOpen = (open) => {
  menuButton?.classList.toggle('open', open);
  menuButton?.setAttribute('aria-expanded', String(open));
  menuButton?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNav?.classList.toggle('open', open);
  mobileNav?.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
};
scope.on(menuButton, 'click', () => setMenuOpen(!mobileNav?.classList.contains('open')));
$$('.mobile-nav a').forEach((link) => scope.on(link, 'click', () => setMenuOpen(false)));
scope.on(window, 'keydown', (event) => { if (event.key === 'Escape') setMenuOpen(false); });

const revealElements = $$('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = scope.observe(IntersectionObserver, (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold:0.12, rootMargin:'0px 0px -45px' });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('in-view'));
}

const cursorAura = $('.cursor-aura');
if (cursorAura && window.matchMedia('(pointer:fine)').matches) {
  scope.on(window, 'pointermove', (event) => {
    cursorAura.style.opacity = '1';
    cursorAura.style.left = `${event.clientX}px`;
    cursorAura.style.top = `${event.clientY}px`;
  }, { passive:true });
}

const heroImage = $('[data-parallax]');
if (heroImage && !reducedMotion) {
  scope.on(window, 'scroll', () => {
    heroImage.style.transform = `scale(1.035) translateY(${Math.min(window.scrollY * .07, 65)}px)`;
  }, { passive:true });
}

class DataStream {
  constructor(canvas, mode = 'streaks') {
    this.canvas = canvas;
    this.context = canvas?.getContext('2d');
    this.mode = mode;
    this.items = [];
    this.frame = 0;
    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);
    if (!this.context) return;
    this.resize();
    scope.on(window, 'resize', this.resize);
    if (reducedMotion) this.draw(true);
    else this.frame = scope.requestAnimationFrame(this.draw);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    this.canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = this.mode === 'streaks' ? Math.min(54, Math.max(24, Math.floor(rect.width / 30))) : Math.min(80, Math.max(30, Math.floor(rect.width / 22)));
    this.items = Array.from({ length:count }, () => this.createItem(true));
  }

  createItem(randomX = false) {
    if (this.mode === 'streaks') {
      return {
        x:randomX ? Math.random() * this.width : -180,
        y:Math.random() * this.height,
        length:Math.random() * 115 + 24,
        speed:Math.random() * 1.1 + .32,
        alpha:Math.random() * .28 + .06,
        warm:Math.random() > .82,
      };
    }
    return {
      x:Math.random() * this.width,
      y:Math.random() * this.height,
      vx:(Math.random() - .5) * .2,
      vy:(Math.random() - .5) * .2,
      size:Math.random() * 1.3 + .35,
      phase:Math.random() * Math.PI * 2,
    };
  }

  draw(singleFrame = false) {
    const context = this.context;
    context.clearRect(0, 0, this.width, this.height);
    if (this.mode === 'streaks') {
      this.items.forEach((item, index) => {
        if (singleFrame !== true) item.x += item.speed;
        const gradient = context.createLinearGradient(item.x, 0, item.x + item.length, 0);
        const color = item.warm ? '46,156,255' : '53,216,255';
        gradient.addColorStop(0, `rgba(${color},0)`);
        gradient.addColorStop(1, `rgba(${color},${item.alpha})`);
        context.beginPath();
        context.moveTo(item.x, item.y);
        context.lineTo(item.x + item.length, item.y);
        context.strokeStyle = gradient;
        context.lineWidth = item.warm ? .8 : .65;
        context.stroke();
        if (item.x > this.width + 20) this.items[index] = this.createItem(false);
      });
    } else {
      const time = performance.now() * .001;
      this.items.forEach((item, index) => {
        if (singleFrame !== true) {
          item.x += item.vx;
          item.y += item.vy;
          if (item.x < 0 || item.x > this.width) item.vx *= -1;
          if (item.y < 0 || item.y > this.height) item.vy *= -1;
        }
        const alpha = .34 + Math.sin(time * 1.4 + item.phase) * .2;
        context.beginPath();
        context.arc(item.x, item.y, item.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(53,216,255,${Math.max(.12, alpha)})`;
        context.fill();
        for (let otherIndex = index + 1; otherIndex < this.items.length; otherIndex += 1) {
          const other = this.items[otherIndex];
          const distance = Math.hypot(item.x - other.x, item.y - other.y);
          if (distance > 125) continue;
          context.beginPath();
          context.moveTo(item.x, item.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(8,124,255,${(1 - distance / 125) * .11})`;
          context.lineWidth = .6;
          context.stroke();
        }
      });
    }
    if (singleFrame !== true) this.frame = scope.requestAnimationFrame(this.draw);
  }
}

const heroStream = new DataStream($('#data-stream-canvas'), 'streaks');
const memoryField = new DataStream($('#memory-canvas'), 'network');
scope.on(document, 'visibilitychange', () => {
  [heroStream, memoryField].forEach((field) => {
    if (!field?.context || reducedMotion) return;
    if (document.hidden) scope.cancelAnimationFrame(field.frame);
    else field.frame = scope.requestAnimationFrame(field.draw);
  });
});

$('#year').textContent = new Date().getFullYear();
}
