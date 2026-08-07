const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const loader = $('.page-loader');
const dismissLoader = () => window.setTimeout(() => loader?.classList.add('loaded'), 450);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', dismissLoader, { once: true });
} else {
  dismissLoader();
}
// Never let a slow third-party font or image request trap the visitor behind the loader.
window.setTimeout(() => loader?.classList.add('loaded'), 2200);

const header = $('[data-header]');
const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 30);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

const menuButton = $('.menu-toggle');
const mobileNav = $('.mobile-nav');
const closeMenu = () => {
  menuButton?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  mobileNav?.classList.remove('open');
  mobileNav?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

menuButton?.addEventListener('click', () => {
  const isOpen = !mobileNav?.classList.contains('open');
  menuButton.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  mobileNav?.classList.toggle('open', isOpen);
  mobileNav?.setAttribute('aria-hidden', String(!isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
$$('.mobile-nav a').forEach((link) => link.addEventListener('click', closeMenu));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.13, rootMargin: '0px 0px -40px' });
$$('.reveal').forEach((element) => revealObserver.observe(element));

const easeOut = (value) => 1 - Math.pow(1 - value, 4);
const animateCount = (element) => {
  const target = Number(element.dataset.count || 0);
  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';
  const duration = 1500;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const current = Math.round(target * easeOut(progress));
    element.textContent = `${prefix}${current}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach((number) => countObserver.observe(number));

const cursorGlow = $('.cursor-glow');
if (matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    if (!cursorGlow) return;
    cursorGlow.style.opacity = '1';
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

const parallax = $('[data-parallax]');
if (parallax && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const offset = Math.min(window.scrollY * 0.12, 90);
    parallax.style.transform = `scale(1.05) translateY(${offset}px)`;
  }, { passive: true });
}

const marquee = $('[data-draggable-marquee]');
const marqueeTrack = $('.marquee-track', marquee || document);
if (marquee && marqueeTrack) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const automaticSpeed = reducedMotion ? 0 : -58;
  let position = 0;
  let velocity = automaticSpeed;
  let segmentWidth = 0;
  let dragging = false;
  let activePointer = null;
  let previousX = 0;
  let previousPointerTime = 0;
  let previousFrameTime = performance.now();
  let resumeAt = 0;

  const measureMarquee = () => {
    segmentWidth = marqueeTrack.scrollWidth / 2;
  };

  const wrapPosition = () => {
    if (!segmentWidth) return;
    while (position <= -segmentWidth) position += segmentWidth;
    while (position > 0) position -= segmentWidth;
  };

  const renderMarquee = (time) => {
    const delta = Math.min((time - previousFrameTime) / 1000, 0.05);
    previousFrameTime = time;

    if (!dragging) {
      if (time >= resumeAt) {
        const returnStrength = Math.min(1, delta * 3.2);
        velocity += (automaticSpeed - velocity) * returnStrength;
      } else {
        velocity *= Math.pow(0.92, delta * 60);
      }
      position += velocity * delta;
    }

    wrapPosition();
    marqueeTrack.style.transform = `translate3d(${position}px, 0, 0)`;
    requestAnimationFrame(renderMarquee);
  };

  const finishDrag = (event) => {
    if (!dragging || (event && event.pointerId !== activePointer)) return;
    dragging = false;
    marquee.classList.remove('is-dragging');
    resumeAt = performance.now() + 450;
    if (event && marquee.hasPointerCapture(event.pointerId)) {
      marquee.releasePointerCapture(event.pointerId);
    }
    activePointer = null;
  };

  marquee.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging = true;
    activePointer = event.pointerId;
    previousX = event.clientX;
    previousPointerTime = performance.now();
    velocity = 0;
    marquee.classList.add('is-dragging');
    marquee.setPointerCapture(event.pointerId);
  });

  marquee.addEventListener('pointermove', (event) => {
    if (!dragging || event.pointerId !== activePointer) return;
    const now = performance.now();
    const movement = event.clientX - previousX;
    const elapsed = Math.max(now - previousPointerTime, 8);
    position += movement;
    velocity = Math.max(-1400, Math.min(1400, movement / elapsed * 1000));
    previousX = event.clientX;
    previousPointerTime = now;
    wrapPosition();
    marqueeTrack.style.transform = `translate3d(${position}px, 0, 0)`;
  });

  marquee.addEventListener('pointerup', finishDrag);
  marquee.addEventListener('pointercancel', finishDrag);
  marquee.addEventListener('lostpointercapture', finishDrag);
  window.addEventListener('resize', measureMarquee);
  measureMarquee();
  requestAnimationFrame(renderMarquee);
}

const canvas = $('#signal-canvas');
const context = canvas?.getContext('2d');
let dots = [];
let animationFrame;

const resizeCanvas = () => {
  if (!canvas || !context) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  dots = Array.from({ length: Math.min(75, Math.floor(rect.width / 16)) }, () => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    vx: (Math.random() - .5) * .22,
    vy: (Math.random() - .5) * .22,
    size: Math.random() * 1.4 + .3,
  }));
};

const drawSignal = () => {
  if (!canvas || !context) return;
  const { width, height } = canvas.getBoundingClientRect();
  context.clearRect(0, 0, width, height);
  dots.forEach((dot, index) => {
    dot.x += dot.vx; dot.y += dot.vy;
    if (dot.x < 0 || dot.x > width) dot.vx *= -1;
    if (dot.y < 0 || dot.y > height) dot.vy *= -1;
    context.beginPath(); context.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
    context.fillStyle = 'rgba(46,156,255,.85)'; context.fill();
    for (let j = index + 1; j < dots.length; j += 1) {
      const other = dots[j];
      const distance = Math.hypot(dot.x - other.x, dot.y - other.y);
      if (distance < 130) {
        context.beginPath(); context.moveTo(dot.x, dot.y); context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(8,124,255,${(1 - distance / 130) * .18})`;
        context.stroke();
      }
    }
  });
  animationFrame = requestAnimationFrame(drawSignal);
};

if (canvas && context) {
  resizeCanvas();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) drawSignal();
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animationFrame);
    else if (!matchMedia('(prefers-reduced-motion: reduce)').matches) drawSignal();
  });
}

const form = $('#contact-form');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const status = $('.form-status', form);
  const button = $('button', form);
  button.disabled = true;
  button.firstChild.textContent = 'SENDING... ';
  window.setTimeout(() => {
    status.textContent = 'Thanks — your message is ready for the DeepIQ team.';
    button.firstChild.textContent = 'MESSAGE SENT ';
    form.reset();
  }, 800);
});

$('#year').textContent = new Date().getFullYear();
