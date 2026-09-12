// A first-party, dependency-free cookie/consent banner.
//
// DeepIQ does not set any tracking cookies of its own. The only thing stored locally is the
// visitor's own choice (in localStorage — see telemetry.js), which gates whether the optional
// analytics endpoint, error monitoring and Sentry are ever initialized. Nothing here loads a
// third-party script or contacts any endpoint until the visitor accepts.
import {
  hasAnalyticsConsent,
  hasConsentDecision,
  initializeTelemetry,
  setAnalyticsConsent,
} from './telemetry.js';

const STYLE_ID = 'deepiq-consent-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .consent-banner,.consent-settings{position:fixed;z-index:2147483000;font-family:Inter,system-ui,sans-serif;color:#eef2f7}
    .consent-banner{left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;padding:20px 22px;border-radius:16px;background:rgba(10,13,20,.96);border:1px solid rgba(255,255,255,.14);box-shadow:0 20px 50px rgba(0,0,0,.45);backdrop-filter:blur(14px)}
    .consent-banner p{margin:0 0 14px;font-size:13px;line-height:1.55;color:#c7cedb}
    .consent-banner a{color:#7db8ff;text-decoration:underline}
    .consent-actions{display:flex;flex-wrap:wrap;gap:10px}
    .consent-actions button{flex:1 1 auto;min-width:120px;padding:11px 16px;border-radius:10px;font-size:12px;letter-spacing:.04em;cursor:pointer;border:1px solid rgba(255,255,255,.28);background:transparent;color:#eef2f7}
    .consent-actions button.is-primary{background:#eef2f7;color:#0a0d14;border-color:transparent}
    .consent-actions button:hover{opacity:.85}
    .consent-panel{display:none;margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.12)}
    .consent-banner.is-managing .consent-panel{display:block}
    .consent-option{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:12px}
    .consent-option strong{display:block;font-size:12px}
    .consent-option span{display:block;margin-top:3px;font-size:11px;color:#9aa5b5}
    .consent-toggle{position:relative;flex:none;width:38px;height:22px;border-radius:999px;background:rgba(255,255,255,.2);border:0;cursor:pointer}
    .consent-toggle::after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s ease}
    .consent-toggle[aria-checked='true']{background:#3d8bff}
    .consent-toggle[aria-checked='true']::after{transform:translateX(16px)}
    .consent-toggle:disabled{opacity:.5;cursor:not-allowed}
    .consent-settings{left:16px;bottom:16px;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(10,13,20,.9);color:#eef2f7;font-size:18px;line-height:1;cursor:pointer;display:none;align-items:center;justify-content:center}
    .consent-settings.is-visible{display:flex}
    @media (max-width:480px){.consent-actions button{min-width:0}}
  `;
  document.head.append(style);
}

function buildBanner() {
  const banner = document.createElement('div');
  banner.className = 'consent-banner';
  banner.dataset.cookieBanner = '';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie and privacy choices');
  banner.innerHTML = `
    <p>We use your browser's local storage for essential site features, and — only with your permission —
      privacy-respecting analytics and error monitoring to improve DeepIQ. No data is shared with advertisers.
      Read our <a href="/privacy">Privacy Policy</a>.</p>
    <div class="consent-actions" data-consent-main>
      <button type="button" data-consent-reject>Necessary only</button>
      <button type="button" data-consent-manage>Manage preferences</button>
      <button type="button" class="is-primary" data-consent-accept>Accept all</button>
    </div>
    <div class="consent-panel">
      <div class="consent-option">
        <div><strong>Necessary</strong><span>Required for the site to function. Always on.</span></div>
        <button type="button" class="consent-toggle" aria-checked="true" disabled aria-label="Necessary (always on)"></button>
      </div>
      <div class="consent-option">
        <div><strong>Analytics &amp; error monitoring</strong><span>Helps us understand usage and fix problems.</span></div>
        <button type="button" class="consent-toggle" data-consent-analytics-toggle aria-checked="false" aria-label="Analytics and error monitoring"></button>
      </div>
      <div class="consent-actions">
        <button type="button" class="is-primary" data-consent-save>Save preferences</button>
      </div>
    </div>
  `;

  const panelToggle = /** @type {HTMLButtonElement} */ (
    banner.querySelector('[data-consent-analytics-toggle]')
  );

  const closeBanner = () => banner.remove();

  const decide = (analytics) => {
    setAnalyticsConsent(analytics);
    closeBanner();
    // The settings toggle only becomes visible once a decision exists — surface it now
    // rather than waiting for the next route render.
    ensureCookieConsentUI();
  };

  banner.querySelector('[data-consent-accept]')?.addEventListener('click', () => decide(true));
  banner.querySelector('[data-consent-reject]')?.addEventListener('click', () => decide(false));
  banner.querySelector('[data-consent-manage]')?.addEventListener('click', () => {
    banner.classList.toggle('is-managing');
  });
  panelToggle?.addEventListener('click', () => {
    panelToggle.setAttribute('aria-checked', String(panelToggle.getAttribute('aria-checked') !== 'true'));
  });
  banner.querySelector('[data-consent-save]')?.addEventListener('click', () => {
    decide(panelToggle?.getAttribute('aria-checked') === 'true');
  });

  return banner;
}

function buildSettingsButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'consent-settings';
  button.dataset.cookieSettings = '';
  button.setAttribute('aria-label', 'Cookie settings');
  button.textContent = '🍪';
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-cookie-banner]').forEach((existing) => existing.remove());
    const banner = buildBanner();
    banner.classList.add('is-managing');
    const analyticsToggle = /** @type {HTMLButtonElement | null} */ (
      banner.querySelector('[data-consent-analytics-toggle]')
    );
    analyticsToggle?.setAttribute('aria-checked', String(hasAnalyticsConsent()));
    document.body.append(banner);
  });
  return button;
}

/** Re-asserts the consent UI after a route render replaces document.body's contents. */
export function ensureCookieConsentUI() {
  if (!document.body) return;
  injectStyles();

  let settingsButton = document.querySelector('[data-cookie-settings]');
  if (!settingsButton) {
    settingsButton = buildSettingsButton();
    document.body.append(settingsButton);
  }
  settingsButton.classList.toggle('is-visible', hasConsentDecision());

  if (!hasConsentDecision() && !document.querySelector('[data-cookie-banner]')) {
    document.body.append(buildBanner());
  }
}

/** Call once at startup. */
export function initCookieConsent() {
  if (hasAnalyticsConsent()) initializeTelemetry();
  ensureCookieConsentUI();
}
