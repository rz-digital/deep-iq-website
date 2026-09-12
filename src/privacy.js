export default function mount(scope) {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const openButton = document.querySelector('[data-open-cookie-settings]');
  scope.on(openButton, 'click', () => {
    document.querySelector('[data-cookie-settings]')?.dispatchEvent(new MouseEvent('click'));
  });
}
