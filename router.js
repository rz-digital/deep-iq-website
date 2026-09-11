import { createRouteLifecycle } from './route-lifecycle.js';
import homeStyles from './styles.css?url';
import cloudmonStyles from './cloudmon.css?url';
import miphiStyles from './miphi.css?url';

const aliases = new Map([
  ['/index.html', '/'],
  ['/cloudmon/', '/cloudmon'],
  ['/cloudmon.html', '/cloudmon'],
  ['/cloudmon/index.html', '/cloudmon'],
  ['/miphi/', '/miphi'],
  ['/miphi.html', '/miphi'],
  ['/miphi/index.html', '/miphi'],
]);

const routes = {
  '/': {
    css: homeStyles,
    load: async () => ({ title: 'DeepIQ', theme: '#050608', mount: (await import('./main.js')).default }),
  },
  '/cloudmon': {
    css: cloudmonStyles,
    load: async () => {
      const [view, behavior] = await Promise.all([import('./views/cloudmon.js'), import('./cloudmon.js')]);
      return { ...view.default, mount: behavior.default };
    },
  },
  '/miphi': {
    css: miphiStyles,
    load: async () => {
      const [view, behavior, wizard] = await Promise.all([
        import('./views/miphi.js'), import('./miphi.js'), import('./miphi-wizard.js'),
      ]);
      return { ...view.default, mount: (scope) => { behavior.default(scope); wizard.default(scope); } };
    },
  },
};

const styleCache = new Map();
let activeStyle;
let activeScope;
let renderedPath;
let navigationId = 0;
history.scrollRestoration = 'manual';

function canonicalUrl(url) {
  const next = new URL(url, location.href);
  next.pathname = aliases.get(next.pathname) || next.pathname;
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

function scrollToRoute(url, savedPosition) {
  let anchor;
  try { anchor = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { /* Invalid fragment. */ }
  if (anchor) {
    anchor.classList.add('in-view');
    anchor.querySelectorAll('.reveal').forEach((element) => element.classList.add('in-view'));
    anchor.scrollIntoView({ behavior: 'instant', block: 'start' });
  } else {
    window.scrollTo({ left: savedPosition?.[0] || 0, top: savedPosition?.[1] || 0, behavior: 'instant' });
  }
}

function focusPage() {
  const heading = document.querySelector('h1');
  if (!heading) return;
  heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
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

async function renderRoute({ restore, focus = true } = {}) {
  const url = canonicalUrl(location.href);
  if (url.href !== location.href) history.replaceState(history.state, '', url);
  if (renderedPath === url.pathname) {
    scrollToRoute(url, restore);
    return;
  }

  renderedPath = undefined;
  const id = ++navigationId;
  activeScope?.dispose();
  document.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close());
  const scope = createRouteLifecycle();
  activeScope = scope;
  try {
    const route = routes[url.pathname];
    const [view, stylesheet] = await Promise.all([
      route ? route.load() : Promise.resolve(null),
      loadStyle(route?.css || homeStyles),
    ]);
    if (id !== navigationId) return;
    if (activeStyle) activeStyle.media = 'not all';
    stylesheet.media = 'all';
    activeStyle = stylesheet;
    document.body.classList.remove('wizard-open', 'workload-wizard-open');
    document.body.style.overflow = '';
    document.body.dataset.route = url.pathname;
    document.title = view?.title || 'Page not found | DeepIQ';
    document.querySelector('meta[name="theme-color"]').content = view?.theme || '#050608';
    if (view?.description) document.querySelector('meta[name="description"]').content = view.description;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (view) {
      document.body.innerHTML = view.body || '<div id="app"></div>';
      await view.mount(scope);
    } else {
      renderMessage('Page not found', 'This address does not match a DeepIQ page.');
    }
    if (id !== navigationId) return;
    renderedPath = url.pathname;
    scrollToRoute(url, restore);
    if (focus) focusPage();
  } catch (error) {
    if (scope.signal.aborted || id !== navigationId) return;
    scope.dispose();
    renderedPath = undefined;
    document.body.style.overflow = '';
    console.error('Unable to open route:', error);
    renderMessage('Unable to open this page', 'Please refresh the page and try again.');
  }
}

function navigate(url) {
  const next = canonicalUrl(url);
  history.replaceState({ ...history.state, deepiqScroll: [scrollX, scrollY] }, '', location.href);
  if (next.href !== location.href) history.pushState({}, '', next);
  void renderRoute();
}

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest?.('a[href]');
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
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
