// Content for the shared application router.
export default {
  title: 'Privacy Policy | DeepIQ',
  description: 'How DeepIQ handles data, local storage and optional analytics for deepiq.lk visitors.',
  theme: '#050608',
  body: `<button class="skip-link" type="button" data-skip-content>Skip to content</button>
    <header class="legal-header">
      <a class="brand" href="/" aria-label="DeepIQ home"><img src="/deepiq-logo.svg" alt="" /><span>DEEP</span><b>IQ</b></a>
      <a class="text-link" href="/">Back to DeepIQ <i aria-hidden="true">↗</i></a>
    </header>

    <main id="main-content" class="legal-page" tabindex="-1">
      <p class="eyebrow">LAST UPDATED 2026</p>
      <h1>Privacy &amp; cookie policy</h1>
      <p class="lead">This page explains, in plain language, what DeepIQ stores about your visit to deepiq.lk and
        what choices you have.</p>

      <h2>What we don't do</h2>
      <p>We don't set advertising or cross-site tracking cookies, sell visitor data, or share it with third-party
        advertisers.</p>

      <h2>What we store locally, always</h2>
      <p>Your consent choice itself is saved in your browser's local storage so we don't ask again on every visit.
        This is required for the banner to work and isn't a tracking mechanism.</p>

      <h2>What we store only with your permission</h2>
      <p>If you accept analytics, anonymised page-view and interaction events (page path, referrer origin) are sent
        to our analytics endpoint, and unhandled errors may be reported to our error-monitoring service (optionally
        Sentry) to help us fix bugs. This never runs before you accept, and never runs if your browser sends a
        Do Not Track signal.</p>

      <h2>Contact forms</h2>
      <p>Submitting the contact or newsletter form sends the details you enter to our enquiry handling service (or,
        if that service is unavailable, opens your email application with the message pre-filled). We use this only
        to respond to your enquiry.</p>

      <h2>Your choices</h2>
      <p>You can change your analytics choice at any time using the cookie icon in the bottom-left corner of any
        page, or the button below.</p>
      <button type="button" class="ghost-button" data-open-cookie-settings>Manage cookie preferences</button>

      <h2>Contact us</h2>
      <p>Questions about this policy? Email <a href="mailto:sales@deepiq.lk">sales@deepiq.lk</a>.</p>
    </main>

    <footer class="legal-footer">
      <a href="/">Home</a><span>© <b id="year"></b> DeepIQ</span>
    </footer>`,
};
