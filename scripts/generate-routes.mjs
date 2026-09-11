import { writeFile } from 'node:fs/promises';
import { APP_ROUTES, ROUTE_ALIASES, SITE_ORIGIN } from '../routes.config.js';

const nonRootRoutes = APP_ROUTES.filter(({ path }) => path !== '/');

const netlifyRedirects = [
  ...Object.entries(ROUTE_ALIASES).map(([source, destination]) => `${source}  ${destination}  301!`),
  ...nonRootRoutes.map(({ path }) => `${path}/  ${path}  301!`),
  '',
  ...nonRootRoutes.map(({ path }) => `${path}  /index.html  200`),
  '',
].join('\n');

const vercelConfig = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  trailingSlash: false,
  redirects: Object.entries(ROUTE_ALIASES).map(([source, destination]) => ({
    source,
    destination,
    permanent: true,
  })),
  rewrites: nonRootRoutes.map(({ path: source }) => ({ source, destination: '/index.html' })),
};

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const sitemapEntries = APP_ROUTES.map(({ path, priority }) =>
  [
    '  <url>',
    `    <loc>${escapeXml(new URL(path, SITE_ORIGIN).href)}</loc>`,
    '    <changefreq>monthly</changefreq>',
    `    <priority>${priority.toFixed(1)}</priority>`,
    '  </url>',
  ].join('\n'),
).join('\n');

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  sitemapEntries,
  '</urlset>',
  '',
].join('\n');

const robots = ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_ORIGIN}/sitemap.xml`, ''].join('\n');

await Promise.all([
  writeFile(new URL('../public/_redirects', import.meta.url), netlifyRedirects),
  writeFile(new URL('../vercel.json', import.meta.url), `${JSON.stringify(vercelConfig, null, 2)}\n`),
  writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemap),
  writeFile(new URL('../public/robots.txt', import.meta.url), robots),
]);

console.log(`Generated hosting rules and SEO files for ${APP_ROUTES.length} routes.`);
