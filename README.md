# DeepIQ website

DeepIQ is a Vite-powered single-page marketing site. Home, Cloudmon, MiPhi, and the privacy policy share
one HTML entry and use clean browser-history routes without hash fragments or page reloads.

## Project layout

- `index.html` — the application's only HTML entry (never a navigation destination itself).
- `src/` — all application source: the router (`router.js`), per-route behaviour and content modules,
  shared styles, telemetry, and the cookie-consent banner.
- `public/` — static passthrough assets: editable content (`page.json`, `site-content.json`), the
  favicon/logo, responsive hero images, and the generated `robots.txt` / `sitemap.xml`.
- `schemas/` — JSON Schemas that validate the editable content files.
- `scripts/` — Node build scripts (route/SEO/nginx-config generation, content validation, image optimisation).
- `deploy/` — the Nginx server config for this site's VPS deployment (see "Hosting" below).

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

`npm run quality` runs ESLint, checked JavaScript, JSON schema validation, and the Prettier check. Both `npm run dev` and `npm run build` automatically run `verify:content` first (route/SEO generation, then content validation), so route and content changes can never go stale.

## Routes

- `/`, `/story`, `/solutions`, `/services`, `/contact` - home sections
- `/cloudmon`, `/cloudmon/why`, `/cloudmon/coverage`, `/cloudmon/outcomes`, `/cloudmon/deepiq-advantage` - Cloudmon
- `/miphi`, `/miphi/foundation`, `/miphi/workloads`, `/miphi/engineering`, `/miphi/sri-lanka` - MiPhi
- `/privacy` - privacy and cookie policy

`src/routes.config.js` is the single source of truth for route paths, legacy aliases, page titles, descriptions, and sitemap priorities. After changing it, run:

```bash
npm run routes:generate
```

That command generates `deploy/nginx-routes.conf`, `public/sitemap.xml`, and `public/robots.txt`. Do not edit those generated files independently.

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

Analytics, error monitoring, and Sentry are only ever initialized after a visitor accepts them in the
cookie-consent banner (`src/cookie-consent.js`); they also still respect the browser's Do Not Track
setting. Error monitoring excludes default personal data. Contact forms, newsletter submissions, email
links, and WhatsApp links emit conversion-intent events once analytics is enabled. Consent itself is
stored in the visitor's own browser (`localStorage`) — DeepIQ sets no tracking cookies. See `/privacy`
for the visitor-facing explanation, and the settings icon in the bottom-left corner to change consent.

## Contact and newsletter forms

- `VITE_FORM_ENDPOINT` accepts JSON submissions (`{ form, fields, page }`) from the contact and
  newsletter forms.

Without an endpoint configured, both forms fall back to opening the visitor's email application with
the message pre-filled, and the on-page status message explains what happened — the forms always do
something useful rather than silently failing.

## Hosting

This site deploys to a self-managed VPS (Nginx), not Netlify or Vercel — nothing Node-related runs in
production; Nginx serves the static `dist/` output directly. See `deploy/deploy.sh` for the deploy
script and its header comment for the one-time server setup it assumes (a persistent git checkout, a
production `.env`, and the releases directory layout). In short:

1. One-time: install `deploy/nginx.conf.example` as the Nginx server block (or merge its pieces into
   whatever `certbot --nginx` already produced — don't blindly overwrite a working TLS config).
2. Every deploy: run `deploy/deploy.sh` from the persistent checkout. It pulls, `npm ci`, builds
   (which also regenerates `deploy/nginx-routes.conf` and validates the editable content), publishes
   the build as a new timestamped release, atomically repoints the `current` symlink Nginx serves, and
   reloads Nginx.

`dist/`, logs, local environment files, and original source images are ignored and must not be committed. Releases are atomic and versioned on the server (see `deploy/deploy.sh`), so a bad deploy is a symlink repoint away from being rolled back.

SEO defaults include canonical metadata, Open Graph/Twitter metadata, Organization and WebSite JSON-LD, `robots.txt`, and a route-derived sitemap.
