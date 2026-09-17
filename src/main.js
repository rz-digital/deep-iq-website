import { assertPageContent, assertSiteContent } from './content-validation.js';
import { captureException } from './telemetry.js';
import { ensureSharedNavigation } from './shared-navigation.js';

export default async function mount(scope) {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  let siteContent;

  const loadPageStructure = async () => {
    const response = await fetch(`${import.meta.env.BASE_URL}page.json`, { signal: scope.signal });
    if (!response.ok) throw new Error(`Page request failed with status ${response.status}`);
    const page = assertPageContent(await response.json());
    scope.signal.throwIfAborted();
    document.body.innerHTML = page.body;
  };

  const applySiteContent = (content) => {
    siteContent = content;
    document.title = content.meta.title;
    $('meta[name="description"]')?.setAttribute('content', content.meta.description);

    const selectContentTargets = (group, selector) => {
      try {
        return $$(selector);
      } catch {
        throw new TypeError(`Invalid selector in site-content.json ${group}: ${selector}`);
      }
    };

    Object.entries(content.html).forEach(([selector, markup]) => {
      selectContentTargets('html', selector).forEach((element) => {
        element.innerHTML = markup;
      });
    });
    Object.entries(content.text).forEach(([selector, value]) => {
      selectContentTargets('text', selector).forEach((element) => {
        element.textContent = value;
      });
    });
    content.attributes.forEach(({ selector, name, value }) => {
      selectContentTargets('attributes', selector).forEach((element) => element.setAttribute(name, value));
    });
  };

  const loadSiteContent = async () => {
    const response = await fetch(`${import.meta.env.BASE_URL}site-content.json`, { signal: scope.signal });
    if (!response.ok) throw new Error(`Content request failed with status ${response.status}`);
    const content = assertSiteContent(await response.json());
    scope.signal.throwIfAborted();
    applySiteContent(content);
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
    const dismissLoader = () => scope.setTimeout(() => loader?.classList.add('loaded'), 450);
    if (document.readyState === 'loading') {
      scope.on(document, 'DOMContentLoaded', dismissLoader, { once: true });
    } else {
      dismissLoader();
    }
    // Never let a slow third-party font or image request trap the visitor behind the loader.
    scope.setTimeout(() => loader?.classList.add('loaded'), 2200);

    const header = $('[data-header]');
    const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 30);
    syncHeader();
    scope.on(window, 'scroll', syncHeader, { passive: true });

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
      menuButton.classList.toggle('open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
      mobileNav?.classList.toggle('open', isOpen);
      mobileNav?.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    $$('.mobile-nav a').forEach((link) => scope.on(link, 'click', closeMenu));

    const revealObserver = scope.observe(
      IntersectionObserver,
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.13, rootMargin: '0px 0px -40px' },
    );
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
        if (progress < 1) scope.requestAnimationFrame(tick);
      };
      scope.requestAnimationFrame(tick);
    };

    const countObserver = scope.observe(
      IntersectionObserver,
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    $$('[data-count]').forEach((number) => countObserver.observe(number));

    const cursorGlow = $('.cursor-glow');
    if (matchMedia('(pointer:fine)').matches) {
      scope.on(
        window,
        'pointermove',
        (event) => {
          if (!cursorGlow) return;
          cursorGlow.style.opacity = '1';
          cursorGlow.style.left = `${event.clientX}px`;
          cursorGlow.style.top = `${event.clientY}px`;
        },
        { passive: true },
      );
    }

    const parallax = $('[data-parallax]');
    if (parallax && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scope.on(
        window,
        'scroll',
        () => {
          const offset = Math.min(window.scrollY * 0.12, 90);
          parallax.style.transform = `scale(1.05) translateY(${offset}px)`;
        },
        { passive: true },
      );
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
        scope.requestAnimationFrame(renderMarquee);
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

      scope.on(marquee, 'pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        dragging = true;
        activePointer = event.pointerId;
        previousX = event.clientX;
        previousPointerTime = performance.now();
        velocity = 0;
        marquee.classList.add('is-dragging');
        marquee.setPointerCapture(event.pointerId);
      });

      scope.on(marquee, 'pointermove', (event) => {
        if (!dragging || event.pointerId !== activePointer) return;
        const now = performance.now();
        const movement = event.clientX - previousX;
        const elapsed = Math.max(now - previousPointerTime, 8);
        position += movement;
        velocity = Math.max(-1400, Math.min(1400, (movement / elapsed) * 1000));
        previousX = event.clientX;
        previousPointerTime = now;
        wrapPosition();
        marqueeTrack.style.transform = `translate3d(${position}px, 0, 0)`;
      });

      scope.on(marquee, 'pointerup', finishDrag);
      scope.on(marquee, 'pointercancel', finishDrag);
      scope.on(marquee, 'lostpointercapture', finishDrag);
      scope.on(window, 'resize', measureMarquee);
      measureMarquee();
      scope.requestAnimationFrame(renderMarquee);
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
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: Math.random() * 1.4 + 0.3,
      }));
    };

    const drawSignal = () => {
      if (!canvas || !context) return;
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);
      dots.forEach((dot, index) => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;
        context.beginPath();
        context.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        context.fillStyle = 'rgba(46,156,255,.85)';
        context.fill();
        for (let j = index + 1; j < dots.length; j += 1) {
          const other = dots[j];
          const distance = Math.hypot(dot.x - other.x, dot.y - other.y);
          if (distance < 130) {
            context.beginPath();
            context.moveTo(dot.x, dot.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(8,124,255,${(1 - distance / 130) * 0.18})`;
            context.stroke();
          }
        }
      });
      animationFrame = scope.requestAnimationFrame(drawSignal);
    };

    if (canvas && context) {
      resizeCanvas();
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) drawSignal();
      scope.on(window, 'resize', resizeCanvas);
      scope.on(document, 'visibilitychange', () => {
        if (document.hidden) scope.cancelAnimationFrame(animationFrame);
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

      scope.on(trigger, 'click', () => {
        setDropdownOpen(!productSelect.classList.contains('open'));
      });

      options.forEach((option, index) => {
        scope.on(option, 'click', () => {
          input.value = option.dataset.value;
          selectedLabel.textContent = option.textContent;
          options.forEach((item) => item.setAttribute('aria-selected', String(item === option)));
          setDropdownOpen(false);
          trigger.focus();
        });

        scope.on(option, 'keydown', (event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            options[(index + direction + options.length) % options.length].focus();
          }
        });
      });

      scope.on(trigger, 'keydown', (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setDropdownOpen(true);
          options[0]?.focus();
        }
      });

      scope.on(document, 'click', (event) => {
        if (!productSelect.contains(event.target)) setDropdownOpen(false);
      });

      scope.on(document, 'keydown', (event) => {
        if (event.key === 'Escape' && productSelect.classList.contains('open')) {
          setDropdownOpen(false);
          trigger.focus();
        }
      });
    }

    const formEndpoint = import.meta.env.VITE_FORM_ENDPOINT?.trim();

    const openMailtoFallback = (form, data) => {
      const action = form.getAttribute('action') || '';
      const [address, query] = action.replace(/^mailto:/, '').split('?');
      const subject = new URLSearchParams(query || '').get('subject') || 'Website message';
      const body = Object.entries(data)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      window.location.href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const bindLeadForm = (form) => {
      if (!form) return;
      const status =
        $('.form-status', form) ||
        (() => {
          const paragraph = document.createElement('p');
          paragraph.className = 'form-status';
          paragraph.setAttribute('role', 'status');
          paragraph.setAttribute('aria-live', 'polite');
          form.append(paragraph);
          return paragraph;
        })();
      const submitButton = $('button[type="submit"]', form);
      const idleLabel = submitButton?.textContent;

      scope.on(form, 'submit', async (event) => {
        event.preventDefault();
        if (submitButton?.disabled) return;
        const data = Object.fromEntries(new FormData(form).entries());

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = siteContent?.form?.submittingLabel || 'SENDING…';
        }
        status.hidden = false;
        status.classList.remove('is-error', 'is-success');
        status.textContent = '';

        try {
          if (!formEndpoint) throw new Error('No form delivery endpoint is configured.');
          const response = await fetch(formEndpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ form: form.id || 'newsletter', fields: data, page: location.pathname }),
          });
          if (!response.ok) throw new Error(`Form endpoint responded with ${response.status}`);
          status.textContent = siteContent?.form?.successMessage || "Thanks — we've received your message.";
          status.classList.add('is-success');
          if (submitButton) submitButton.textContent = siteContent?.form?.successLabel || 'SENT';
          form.reset();
        } catch (error) {
          captureException(error, { form: form.id || 'newsletter' });
          status.textContent = "We couldn't reach our server, so we've opened your email app instead.";
          status.classList.add('is-error');
          if (submitButton) submitButton.textContent = idleLabel;
          openMailtoFallback(form, data);
        } finally {
          if (submitButton) submitButton.disabled = false;
        }
      });
    };

    bindLeadForm($('#contact-form'));
    bindLeadForm($('.newsletter-field'));

    $('#year').textContent = new Date().getFullYear();
  };

  await loadPageStructure();
  prepareFooterStructure();
  prepareWhatsappButton();
  await loadSiteContent();
  ensureSharedNavigation('home', scope);
  initializeSite();
}
