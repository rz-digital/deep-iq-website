import { writeFile } from 'node:fs/promises';
import { APP_ROUTES, ROUTE_ALIASES, SITE_ORIGIN } from '../src/routes.config.js';

const nonRootRoutes = APP_ROUTES.filter(({ path }) => path !== '/');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const nginxHeader = [
  '# GENERATED FILE — do not edit by hand.',
  '# Run `npm run routes:generate` after changing src/routes.config.js; this file is',
  '# `include`d from the server block in deploy/nginx.conf.example.',
  '',
].join('\n');

const legacyRedirects = Object.entries(ROUTE_ALIASES)
  .map(([source, destination]) => `rewrite ^${escapeRegex(source)}$ ${destination} permanent;`)
  .join('\n');

const trailingSlashRedirects = nonRootRoutes
  .map(({ path }) => `rewrite ^${escapeRegex(path)}/$ ${path} permanent;`)
  .join('\n');

const spaLocations = nonRootRoutes
  .map(({ path }) => `location = ${path} { try_files /index.html =404; }`)
  .join('\n');

const nginxRoutes = [
  nginxHeader,
  '# Old .html / nested-index addresses redirect to their canonical clean URL.',
  legacyRedirects,
  '',
  '# A trailing slash on an app route redirects to the canonical, slash-free path.',
  trailingSlashRedirects,
  '',
  '# Each known application route serves the SPA shell; everything else falls through',
  '# to normal static handling (and a real 404 if nothing matches).',
  'location = / { try_files /index.html =404; }',
  spaLocations,
  '',
].join('\n');

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
  writeFile(new URL('../deploy/nginx-routes.conf', import.meta.url), nginxRoutes),
  writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemap),
  writeFile(new URL('../public/robots.txt', import.meta.url), robots),
]);

console.log(`Generated nginx routes and SEO files for ${APP_ROUTES.length} routes.`);
