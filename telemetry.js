// @ts-check

const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT?.trim();
const errorEndpoint = import.meta.env.VITE_ERROR_MONITORING_ENDPOINT?.trim();
const sentryDsn = import.meta.env.VITE_SENTRY_DSN?.trim();
const environment = import.meta.env.VITE_APP_ENVIRONMENT?.trim() || import.meta.env.MODE;
const release = import.meta.env.VITE_APP_RELEASE?.trim() || undefined;

let initialized = false;
let sentry;

const safeString = (value, limit = 1000) => String(value || '').slice(0, limit);

const deliver = (endpoint, payload) => {
  if (!endpoint) return;
  const body = JSON.stringify({
    ...payload,
    environment,
    release,
    occurredAt: new Date().toISOString(),
  });

  if (navigator.sendBeacon) {
    const accepted = navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
    if (accepted) return;
  }

  void fetch(endpoint, {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json' },
    keepalive: true,
    credentials: 'omit',
  }).catch(() => {
    // Telemetry must never interrupt the visitor experience.
  });
};

export function trackEvent(name, properties = {}) {
  if (navigator.doNotTrack === '1') return;
  deliver(analyticsEndpoint, {
    type: 'event',
    name: safeString(name, 80),
    path: location.pathname,
    properties,
  });
}

export function trackPageView(path, title) {
  if (navigator.doNotTrack === '1') return;
  deliver(analyticsEndpoint, {
    type: 'page_view',
    path,
    title: safeString(title, 160),
    referrer: document.referrer ? new URL(document.referrer).origin : '',
  });
  sentry?.setTag('route', path);
}

export function captureException(error, context = {}) {
  const normalized = error instanceof Error ? error : new Error(safeString(error));
  sentry?.captureException(normalized, { extra: context });
  deliver(errorEndpoint, {
    type: 'client_error',
    message: safeString(normalized.message),
    name: safeString(normalized.name, 120),
    stack: safeString(normalized.stack, 5000),
    path: location.pathname,
    context,
  });
}

export function initializeTelemetry() {
  if (initialized) return;
  initialized = true;

  if (sentryDsn) {
    void import('@sentry/browser')
      .then((api) => {
        api.init({
          dsn: sentryDsn,
          environment,
          release,
          sendDefaultPii: false,
        });
        sentry = api;
      })
      .catch((error) => {
        console.warn('Unable to initialize error monitoring:', error);
      });
  }

  if (errorEndpoint) {
    window.addEventListener('error', (event) => {
      captureException(event.error || event.message, { source: 'window.error' });
    });
    window.addEventListener('unhandledrejection', (event) => {
      captureException(event.reason, { source: 'unhandledrejection' });
    });
  }

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const isLeadForm = form.id === 'contact-form' || form.classList.contains('newsletter-field');
    if (isLeadForm) trackEvent('lead_submit', { form: form.id || 'newsletter' });
  });

  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('mailto:') || href.startsWith('https://wa.me/')) {
      trackEvent('contact_intent', { channel: href.startsWith('mailto:') ? 'email' : 'whatsapp' });
    }
  });
}
