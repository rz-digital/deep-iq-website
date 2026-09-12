import { createRouteLifecycle } from './route-lifecycle.js';
import { APP_ROUTES, ROUTE_ALIASES, SITE_ORIGIN } from './routes.config.js';
import { captureException, trackPageView } from './telemetry.js';
import { ensureCookieConsentUI, initCookieConsent } from './cookie-consent.js';
import homeStyles from './styles.css?url';
import cloudmonStyles from './cloudmon.css?url';
import miphiStyles from './miphi.css?url';

const aliases = new Map(Object.entries(ROUTE_ALIASES));

const views = {
  home: {
    css: homeStyles,
    load: async () => ({ title: 'DeepIQ', theme: '#050608', mount: (await import('./main.js')).default }),
  },
  cloudmon: {
    css: cloudmonStyles,
    load: async () => {
      const [view, behavior] = await Promise.all([import('./views/cloudmon.js'), import('./cloudmon.js')]);
      return { ...view.default, mount: behavior.default };
    },
  },
  miphi: {
    css: miphiStyles,
    load: async () => {
      const [view, behavior, wizard] = await Promise.all([
        import('./views/miphi.js'),
        import('./miphi.js'),
        import('./miphi-wizard.js'),
      ]);
      return {
        ...view.default,
        mount: (scope) => {
          behavior.default(scope);
          wizard.default(scope);
        },
      };
    },
  },
  privacy: {
    css: homeStyles,
    load: async () => {
      const view = await import('./views/privacy.js');
      return { ...view.default, mount: (await import('./privacy.js')).default };
    },
  },
};

const routes = new Map(APP_ROUTES.map((route) => [route.path, route]));
const legacyFragments = APP_ROUTES.reduce((fragments, route) => {
  fragments[route.view] ||= {};
  fragments[route.view][route.anchor || 'top'] = route.path;
  return fragments;
}, {});

const styleCache = new Map();
let activeStyle;
let activeScope;
let renderedView;
let navigationId = 0;
history.scrollRestoration = 'manual';
initCookieConsent();

function canonicalUrl(url) {
  const next = new URL(url, location.href);
  next.pathname = aliases.get(next.pathname) || next.pathname;

  if (next.pathname.length > 1 && next.pathname.endsWith('/')) {
    const withoutSlash = next.pathname.slice(0, -1);
    if (routes.has(withoutSlash)) next.pathname = withoutSlash;
  }

  const route = routes.get(next.pathname);
  if (next.hash) {
    let fragment = '';
    try {
      fragment = decodeURIComponent(next.hash.slice(1));
    } catch {
      /* Ignore an invalid legacy fragment. */
    }
    const legacyPath = route ? legacyFragments[route.view]?.[fragment] : undefined;
    if (legacyPath) next.pathname = legacyPath;
    next.hash = '';
  }
  return next;
}

function loadStyle(href) {
  if (styleCache.has(href)) return styleCache.get(href);
  const promise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'not all';
    link.onload = () => resolve(link);
    link.onerror = () => {
      styleCache.delete(href);
      link.remove();
      reject(new Error('Unable to load the page styles'));
    };
    document.head.append(link);
  });
  styleCache.set(href, promise);
  return promise;
}

function scrollToRoute(anchorId, savedPosition) {
  const anchor = anchorId ? document.getElementById(anchorId) : null;
  if (anchor) {
    anchor.classList.add('in-view');
    anchor.querySelectorAll('.reveal').forEach((element) => element.classList.add('in-view'));
    anchor.scrollIntoView({ behavior: 'auto', block: 'start' });
  } else {
    window.scrollTo({ left: savedPosition?.[0] || 0, top: savedPosition?.[1] || 0, behavior: 'auto' });
  }
}

function focusPage() {
  const heading = document.querySelector('h1');
  if (!heading) return;
  heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
}

function setMetaContent(selector, value) {
  document.querySelector(selector)?.setAttribute('content', value);
}

function applyRouteMetadata(route, view) {
  const title = route?.title || view?.title || 'Page not found | DeepIQ';
  const description =
    route?.description || view?.description || 'The requested DeepIQ page could not be found.';
  const canonicalUrl = new URL(route?.path || location.pathname, SITE_ORIGIN).href;

  document.title = title;
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[name="robots"]', route ? 'index,follow' : 'noindex,follow');
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[property="og:url"]', canonicalUrl);
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', description);
}

function renderMessage(title, message) {
  const main = document.createElement('main');
  main.className = 'page-error';
  const content = document.createElement('div');
  const heading = document.createElement('h1');
  heading.textContent = title;
  const paragraph = document.createElement('p');
  paragraph.textContent = message;
  const home = document.createElement('a');
  home.href = '/';
  home.textContent = 'Return to DeepIQ';
  content.append(heading, paragraph, home);
  main.append(content);
  document.body.replaceChildren(main);
}

/** @param {{ restore?: [number, number], focus?: boolean }} [options] */
async function renderRoute({ restore, focus = true } = {}) {
  const url = canonicalUrl(location.href);
  if (url.href !== location.href) history.replaceState(history.state, '', url);
  const route = routes.get(url.pathname);

  if (route && renderedView === route.view) {
    document.body.dataset.route = url.pathname;
    applyRouteMetadata(route);
    scrollToRoute(route.anchor, restore);
    trackPageView(route.path, route.title);
    return;
  }

  renderedView = undefined;
  const id = ++navigationId;
  activeScope?.dispose();
  document.querySelectorAll('dialog[open]').forEach((dialog) => {
    if (dialog instanceof HTMLDialogElement) dialog.close();
  });
  const scope = createRouteLifecycle();
  activeScope = scope;
  try {
    const viewRoute = route ? views[route.view] : null;
    const [view, stylesheet] = await Promise.all([
      viewRoute ? viewRoute.load() : Promise.resolve(null),
      loadStyle(viewRoute?.css || homeStyles),
    ]);
    if (id !== navigationId) return;
    if (activeStyle) activeStyle.media = 'not all';
    stylesheet.media = 'all';
    activeStyle = stylesheet;
    document.body.classList.remove('wizard-open', 'workload-wizard-open');
    document.body.style.overflow = '';
    document.body.dataset.route = url.pathname;
    setMetaContent('meta[name="theme-color"]', view?.theme || '#050608');
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    if (view) {
      document.body.innerHTML = ('body' in view && view.body) || '<div id="app"></div>';
      await view.mount(scope);
    } else {
      renderMessage('Page not found', 'This address does not match a DeepIQ page.');
    }
    if (id !== navigationId) return;
    ensureCookieConsentUI();
    renderedView = route?.view;
    applyRouteMetadata(route, view);
    scrollToRoute(route?.anchor, restore);
    if (route) trackPageView(route.path, route.title);
    if (focus) focusPage();
  } catch (error) {
    if (scope.signal.aborted || id !== navigationId) return;
    scope.dispose();
    renderedView = undefined;
    document.body.style.overflow = '';
    console.error('Unable to open route:', error);
    captureException(error, { route: url.pathname, source: 'router' });
    renderMessage('Unable to open this page', 'Please refresh the page and try again.');
    ensureCookieConsentUI();
  }
}

function navigate(url) {
  const next = canonicalUrl(url);
  history.replaceState({ ...history.state, deepiqScroll: [scrollX, scrollY] }, '', location.href);
  if (next.href !== location.href) history.pushState({}, '', next);
  void renderRoute();
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const skipButton = event.target.closest('[data-skip-content]');
  if (skipButton) {
    event.preventDefault();
    const main = document.getElementById('main-content') || document.querySelector('main');
    main?.setAttribute('tabindex', '-1');
    main?.focus({ preventScroll: true });
    main?.scrollIntoView({ behavior: 'auto', block: 'start' });
    return;
  }

  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const link = event.target.closest('a[href]');
  if (
    !(link instanceof HTMLAnchorElement) ||
    link.hasAttribute('download') ||
    (link.target && link.target !== '_self')
  )
    return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) return;
  // Files such as PDFs should retain their normal browser download/navigation.
  if (/\.[^/]+$/.test(url.pathname) && !aliases.has(url.pathname)) return;
  event.preventDefault();
  navigate(url);
});

window.addEventListener('popstate', (event) => {
  void renderRoute({ restore: event.state?.deepiqScroll });
});
void renderRoute({ focus: false });
