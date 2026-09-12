import { defineConfig } from 'vite';
import { APP_ROUTE_PATHS, ROUTE_ALIASES } from './src/routes.config.js';

const aliases = new Map(Object.entries(ROUTE_ALIASES));
const appRoutes = new Set(APP_ROUTE_PATHS);

function routeRequests(request, response, next) {
  const url = new URL(request.url || '/', 'http://localhost');
  const withoutTrailingSlash =
    url.pathname.length > 1 && url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : '';
  const canonical =
    aliases.get(url.pathname) || (appRoutes.has(withoutTrailingSlash) ? withoutTrailingSlash : undefined);
  if (canonical) {
    response.statusCode = 308;
    response.setHeader('Location', canonical + url.search);
    response.end();
    return;
  }
  if (appRoutes.has(url.pathname) && url.pathname !== '/') request.url = '/index.html' + url.search;
  next();
}

export default defineConfig({
  base: '/',
  // Only index.html is built. The router mounts every view into this entry.
  appType: 'mpa',
  plugins: [
    {
      name: 'deepiq-history-routes',
      configureServer(server) {
        server.middlewares.use(routeRequests);
      },
      configurePreviewServer(server) {
        server.middlewares.use(routeRequests);
      },
    },
  ],
});
