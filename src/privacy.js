export default function mount(scope) {
  const header = document.querySelector('[data-header]');
  const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 30);
  syncHeader();
  scope.on(window, 'scroll', syncHeader, { passive: true });

  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const setMenuOpen = (open) => {
    menuButton?.classList.toggle('open', open);
    menuButton?.setAttribute('aria-expanded', String(open));
    menuButton?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileNav?.classList.toggle('open', open);
    mobileNav?.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  scope.on(menuButton, 'click', () => setMenuOpen(!mobileNav?.classList.contains('open')));
  document.querySelectorAll('.mobile-nav a').forEach((link) => {
    scope.on(link, 'click', () => setMenuOpen(false));
  });
  scope.on(window, 'keydown', (event) => {
    if (event.key === 'Escape' && mobileNav?.classList.contains('open')) {
      setMenuOpen(false);
      if (menuButton instanceof HTMLElement) menuButton.focus();
    }
  });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const openButton = document.querySelector('[data-open-cookie-settings]');
  scope.on(openButton, 'click', () => {
    document.querySelector('[data-cookie-settings]')?.dispatchEvent(new MouseEvent('click'));
  });
}
