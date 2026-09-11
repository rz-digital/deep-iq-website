import { defineConfig } from 'vite';

const aliases = new Map([
  ['/index.html', '/'],
  ['/cloudmon/', '/cloudmon'],
  ['/cloudmon.html', '/cloudmon'],
  ['/cloudmon/index.html', '/cloudmon'],
  ['/miphi/', '/miphi'],
  ['/miphi.html', '/miphi'],
  ['/miphi/index.html', '/miphi'],
]);

function routeRequests(request, response, next) {
  const url = new URL(request.url || '/', 'http://localhost');
  const canonical = aliases.get(url.pathname);
  if (canonical) {
    response.statusCode = 308;
    response.setHeader('Location', canonical + url.search);
    response.end();
    return;
  }
  if (['/cloudmon', '/miphi'].includes(url.pathname)) request.url = '/index.html' + url.search;
  next();
}

export default defineConfig({
  base: '/',
  // Only index.html is built. The router mounts every view into this entry.
  appType: 'mpa',
  plugins: [{
    name: 'deepiq-history-routes',
    configureServer(server) { server.middlewares.use(routeRequests); },
    configurePreviewServer(server) { server.middlewares.use(routeRequests); },
  }],
});
