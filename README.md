# DeepIQ website

DeepIQ is a Vite-powered single-page marketing site. Home, Cloudmon, and MiPhi share one HTML entry and use clean browser-history routes without hash fragments or page reloads.

## Local development

```bash
npm install
npm run dev
```

Useful production checks:

```bash
npm run quality
npm run build
npm run preview
```

`npm run quality` runs ESLint, checked JavaScript, JSON schema validation, and the Prettier check. A build also regenerates route/SEO artifacts and validates editable content before Vite starts.

## Routes

- `/`, `/story`, `/solutions`, `/services`, `/contact` - home sections
- `/cloudmon`, `/cloudmon/why`, `/cloudmon/coverage`, `/cloudmon/outcomes`, `/cloudmon/deepiq-advantage` - Cloudmon
- `/miphi`, `/miphi/foundation`, `/miphi/workloads`, `/miphi/engineering`, `/miphi/sri-lanka` - MiPhi

`routes.config.js` is the single source of truth for route paths, legacy aliases, page titles, descriptions, and sitemap priorities. After changing it, run:

```bash
npm run routes:generate
```

That command generates Netlify rules in `public/_redirects`, Vercel rules in `vercel.json`, `public/sitemap.xml`, and `public/robots.txt`. Do not edit those generated files independently.

Old hashes, `.html` addresses, nested `index.html` addresses, and trailing slashes are upgraded or redirected to canonical clean URLs. Query strings are preserved. The root `index.html` remains the application entry file but is never used as a public navigation URL.

## Content and images

Homepage structure and copy live in `public/page.json` and `public/site-content.json`. Their schemas live in `schemas/`; runtime and build-time validation reject malformed content and executable markup.

Optimized hero images are committed under `public/images/heroes/` as responsive AVIF and WebP variants. Original high-resolution PNGs are intentionally excluded from Git. To regenerate the variants, place the three source PNGs in the ignored `source-images/` directory and run:

```bash
npm run images:optimize
```

## Analytics and error monitoring

Copy `.env.example` to `.env.local` and configure the services used by the deployment:

- `VITE_ANALYTICS_ENDPOINT` accepts JSON page-view and conversion events.
- `VITE_ERROR_MONITORING_ENDPOINT` accepts JSON browser error reports.
- `VITE_SENTRY_DSN` enables Sentry browser monitoring.
- `VITE_APP_ENVIRONMENT` and `VITE_APP_RELEASE` label reports.

Analytics respects the browser's Do Not Track setting. Error monitoring excludes default personal data. Contact forms, newsletter submissions, email links, and WhatsApp links emit conversion-intent events when an analytics endpoint is configured.

## Hosting

Run `npm run build` and publish the generated `dist/` directory at the domain root. Netlify and Vercel configuration is included. For another host, rewrite every clean application route to `/index.html`, preserve the requested browser URL, and return a real 404 for unknown files and paths.

`dist/`, logs, local environment files, and original source images are ignored and must not be committed. Use a clean or atomic deployment of the current build output.

SEO defaults include canonical metadata, Open Graph/Twitter metadata, Organization and WebSite JSON-LD, `robots.txt`, and a route-derived sitemap.
