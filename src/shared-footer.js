const footerMarkup = `
  <div class="footer-identity">
    <a class="deepiq-brand footer-brand" href="/" aria-label="DeepIQ home">
      <img src="/deepiq-logo.svg" alt="" />
      <span>DEEP</span><b>IQ</b>
    </a>
    <address class="footer-details">
      <p><span class="footer-detail-icon" aria-hidden="true">⌖</span><span>No. 45, Galle Road, Colombo 03, Sri Lanka.</span></p>
      <p><span class="footer-detail-icon" aria-hidden="true">☎</span><span><a href="tel:+94742682674">+94 74 268 2674</a></span></p>
      <p><span class="footer-detail-icon" aria-hidden="true">✉</span><span><a href="mailto:sales@deepiq.lk">sales@deepiq.lk</a></span></p>
    </address>
  </div>
  <nav class="footer-links" aria-label="Footer navigation">
    <h3>Useful Links</h3>
    <a href="/">Home</a>
    <a href="/story">Our Story</a>
    <a href="/solutions">Solutions</a>
    <a href="/services">Services</a>
    <a href="/contact">Contact</a>
  </nav>
  <div class="footer-actions">
    <div class="footer-newsletter">
      <h3>Subscribe to Our Newsletters</h3>
      <form class="newsletter-field" action="mailto:sales@deepiq.lk?subject=Newsletter%20Subscription" method="post" enctype="text/plain">
        <input name="Subscriber email" type="email" aria-label="Email address" placeholder="Your email address" required />
        <button type="submit">Submit</button>
      </form>
    </div>
    <div class="footer-socials">
      <h3>Follow Us On</h3>
      <div class="social-buttons">
        <button class="facebook-social" type="button" aria-label="Facebook"><span aria-hidden="true">f</span></button>
        <a class="linkedin-social" href="https://www.linkedin.com/company/deepiq-lk?trk=public_profile_topcard-current-company" target="_blank" rel="noopener noreferrer" aria-label="DeepIQ on LinkedIn"><span aria-hidden="true">in</span></a>
        <button class="instagram-social" type="button" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle class="instagram-dot" cx="17.4" cy="6.7" r="1.2"></circle></svg></button>
      </div>
    </div>
  </div>
  <p class="copyright">© <span data-shared-footer-year></span> DEEPIQ. ALL RIGHTS RESERVED.</p>
`;

const whatsappMarkup = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.6 11.7a8.6 8.6 0 0 1-12.7 7.6l-4.4 1.2 1.2-4.2a8.6 8.6 0 1 1 15.9-4.6Z"></path>
    <path d="M8.2 7.7c.3-.5.6-.5.9-.1l1.1 1.5c.2.3.2.6 0 .9l-.7.8c.7 1.4 1.8 2.5 3.2 3.2l.8-.7c.3-.2.6-.2.9 0l1.5 1.1c.4.3.4.6-.1.9-.7.5-1.5.8-2.3.6-3.2-.7-5.8-3.3-6.5-6.5-.2-.8.1-1.6.6-2.3Z"></path>
  </svg>
`;

function ensureWhatsappButton() {
  if (document.querySelector('.whatsapp-button')) return;
  const button = document.createElement('a');
  button.className = 'whatsapp-button shared-whatsapp-button';
  button.href = 'https://wa.me/94742682674';
  button.target = '_blank';
  button.rel = 'noopener noreferrer';
  button.setAttribute('aria-label', 'Chat with DeepIQ on WhatsApp');
  button.innerHTML = whatsappMarkup;
  document.body.append(button);
}

export function ensureSharedFooter(viewName) {
  if (viewName !== 'home') {
    const currentFooter = document.querySelector('body > footer');
    if (currentFooter) {
      const footer = document.createElement('footer');
      footer.className = 'site-footer shared-site-footer';
      footer.innerHTML = footerMarkup;
      currentFooter.replaceWith(footer);
      const year = footer.querySelector('[data-shared-footer-year]');
      if (year) year.textContent = String(new Date().getFullYear());
    }
  }
  ensureWhatsappButton();
}
