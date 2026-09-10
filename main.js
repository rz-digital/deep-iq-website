const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

let siteContent;

const loadPageStructure = async () => {
  const response = await fetch(`${import.meta.env.BASE_URL}page.json`);
  if (!response.ok) throw new Error(`Page request failed with status ${response.status}`);
  const page = await response.json();
  document.body.innerHTML = page.body;
};

const applySiteContent = (content) => {
  siteContent = content;
  document.title = content.meta.title;
  $('meta[name="description"]')?.setAttribute('content', content.meta.description);

  Object.entries(content.html).forEach(([selector, markup]) => {
    $$(selector).forEach((element) => { element.innerHTML = markup; });
  });
  Object.entries(content.text).forEach(([selector, value]) => {
    $$(selector).forEach((element) => { element.textContent = value; });
  });
  content.attributes.forEach(({ selector, name, value }) => {
    $$(selector).forEach((element) => element.setAttribute(name, value));
  });
};

const loadSiteContent = async () => {
  const response = await fetch(`${import.meta.env.BASE_URL}site-content.json`);
  if (!response.ok) throw new Error(`Content request failed with status ${response.status}`);
  applySiteContent(await response.json());
};

const prepareFooterStructure = () => {
  const footer = $('.site-footer');
  const footerBrand = $('.footer-brand');
  if (!footer || !footerBrand) return;

  if (!footerBrand.parentElement?.classList.contains('footer-identity')) {
    const identity = document.createElement('div');
    const details = document.createElement('address');
    identity.className = 'footer-identity';
    details.className = 'footer-details';
    footerBrand.replaceWith(identity);
    identity.append(footerBrand, details);
  }

  if (!$('.footer-actions', footer)) {
    const actions = document.createElement('div');
    actions.className = 'footer-actions';
    footer.insertBefore(actions, $('.copyright', footer));
  }
};

const prepareWhatsappButton = () => {
  if ($('.whatsapp-button')) return;
  const button = document.createElement('a');
  button.className = 'whatsapp-button';
  document.body.append(button);
};

const initializeSite = () => {
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

const productSelect = $('[data-product-select]');
if (productSelect) {
  const trigger = $('.product-select-trigger', productSelect);
  const selectedLabel = $('.product-select-value', productSelect);
  const input = $('.product-select-input', productSelect);
  const options = $$('.product-option', productSelect);

  const setDropdownOpen = (open) => {
    productSelect.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', String(open));
  };

  trigger.addEventListener('click', () => {
    setDropdownOpen(!productSelect.classList.contains('open'));
  });

  options.forEach((option, index) => {
    option.addEventListener('click', () => {
      input.value = option.dataset.value;
      selectedLabel.textContent = option.textContent;
      options.forEach((item) => item.setAttribute('aria-selected', String(item === option)));
      setDropdownOpen(false);
      trigger.focus();
    });

    option.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        options[(index + direction + options.length) % options.length].focus();
      }
    });
  });

  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setDropdownOpen(true);
      options[0]?.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!productSelect.contains(event.target)) setDropdownOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && productSelect.classList.contains('open')) {
      setDropdownOpen(false);
      trigger.focus();
    }
  });
}

$('#year').textContent = new Date().getFullYear();
};

const startSite = async () => {
  await loadPageStructure();
  prepareFooterStructure();
  prepareWhatsappButton();
  await loadSiteContent();
  initializeSite();
  const anchorTarget = document.getElementById(window.location.hash.slice(1));
  if (anchorTarget) {
    anchorTarget.querySelectorAll('.reveal').forEach((element) => element.classList.add('in-view'));
    requestAnimationFrame(() => anchorTarget.scrollIntoView());
  }
};

startSite().catch((error) => {
  console.error('The JSON page could not be loaded.', error);
  $('#app').textContent = `Unable to load the page: ${error.message}`;
});
