const solutions = [
  { href: '/cloudmon', name: 'Observability Platform', brand: 'Cloudmon' },
  { href: '/rayan', name: 'Smart Solution', brand: 'Rayan' },
  { href: '/miphi', name: 'AI Semi Conductors', brand: 'MiPhi' },
  { href: '/contact', name: 'Cyber Resilience', brand: 'Security solutions' },
];

const links = [
  { href: '/story', label: 'Our Story' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

const distributorButton = '<button class="partner-button" type="button">Become a Distributor</button>';
const talkButton = 'Talk to DeepIQ <span aria-hidden="true">↗</span>';
const dropdown = `<div class="nav-solutions">
  <a class="nav-solutions-trigger" href="/solutions">Solutions<span class="nav-caret" aria-hidden="true"></span></a>
  <div class="solutions-dropdown" aria-label="Available solutions">
    <p>DEEPIQ SOLUTIONS</p>
    ${solutions
      .map(
        ({ href, name, brand }, index) => `<a href="${href}">
      <span class="solution-dropdown-no">0${index + 1}</span>
      <span><strong>${name}</strong><small>${brand}</small></span>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6"></path></svg>
    </a>`,
      )
      .join('')}
  </div>
</div>`;

export function ensureSharedNavigation(viewName, scope) {
  const header = document.querySelector('header[data-header], .legal-header');
  if (!header) return;

  if (viewName === 'privacy') {
    header.classList.replace('legal-header', 'site-header');
    header.setAttribute('data-header', '');
    header.querySelector('.text-link')?.remove();
  }
  header.classList.add('shared-header');

  let desktopNav = header.querySelector('.desktop-nav');
  if (!desktopNav) {
    desktopNav = document.createElement('nav');
    desktopNav.className = 'desktop-nav';
    header.append(desktopNav);
  }
  desktopNav.classList.add('shared-main-nav');
  desktopNav.setAttribute('aria-label', 'Main navigation');
  desktopNav.innerHTML = links
    .map(({ href, label }) => (href === '/solutions' ? dropdown : `<a href="${href}">${label}</a>`))
    .join('');

  if (viewName === 'home') {
    desktopNav.insertAdjacentHTML('beforeend', distributorButton);
    header.querySelector('.header-cta')?.remove();
  } else {
    let cta = header.querySelector('.header-cta');
    if (!cta) {
      cta = document.createElement('a');
      cta.className = 'header-cta';
      desktopNav.after(cta);
    }
    cta.setAttribute('href', '/contact');
    cta.innerHTML = talkButton;
  }

  let menuButton = header.querySelector('.menu-toggle');
  if (!menuButton) {
    menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.setAttribute('type', 'button');
    menuButton.innerHTML = '<span></span><span></span>';
    header.append(menuButton);
  }
  menuButton.setAttribute('aria-label', 'Open navigation');
  menuButton.setAttribute('aria-expanded', 'false');

  let mobileNav = document.querySelector('.mobile-nav');
  if (!mobileNav) {
    mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    mobileNav.id = 'mobile-nav';
    mobileNav.innerHTML = '<nav></nav>';
    header.after(mobileNav);
  }
  mobileNav.classList.add('shared-mobile-nav');
  mobileNav.setAttribute('aria-hidden', 'true');
  menuButton.setAttribute('aria-controls', mobileNav.id);
  const mobileLinks = mobileNav.querySelector('nav');
  if (!mobileLinks) return;
  mobileLinks.setAttribute('aria-label', 'Mobile navigation');
  mobileLinks.innerHTML = [{ href: '/', label: 'Home' }, ...links]
    .map(({ href, label }, index) => `<a href="${href}"><span>0${index + 1}</span>${label}</a>`)
    .join('');
  mobileLinks.insertAdjacentHTML(
    'beforeend',
    viewName === 'home'
      ? distributorButton.replace('partner-button', 'partner-button mobile-partner-button')
      : `<a class="mobile-talk-button" href="/contact">${talkButton}</a>`,
  );

  scope.on(window, 'resize', () => {
    if (innerWidth <= 900 || !mobileNav?.classList.contains('open')) return;
    menuButton?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  });
}
