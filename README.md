# DeepIQ website

The site uses one HTML entry and a browser-history router. Navigation between home, Cloudmon and MiPhi happens in the current document, without a page reload.

## Routes

- `/` — home, with section links such as `/#contact`.
- `/cloudmon` — Cloudmon view.
- `/miphi` — MiPhi view.

Old `.html`, nested `index.html`, and trailing-slash URLs redirect to these canonical addresses. Query strings and fragments are preserved. The root `index.html` is the application's required entry file; it is never a public navigation destination.

## Development

Run `npm run dev`, `npm run build`, or `npm run preview`. Vite serves the shared entry for both solution routes and redirects legacy addresses.

`router.js` owns navigation, Back/Forward, per-view styles and scroll restoration. `route-lifecycle.js` removes event listeners, timers, animation frames and observers when leaving a view. Solution content is in `views/`; homepage content remains editable in `public/page.json` and `public/site-content.json`.

## Hosting

Publish `dist` after `npm run build`. Deploy at the domain root. Netlify and Vercel configuration is included. On another host, internally rewrite `/cloudmon` and `/miphi` to `/index.html` while preserving the requested URL. Copy the legacy redirects from `public/_redirects`. Serve missing assets and other unknown server paths with HTTP 404.

Only one application HTML entry is built; do not upload old product directories from previous builds. Use a clean or atomic deployment of the current `dist` folder.

Contact and newsletter forms currently open the visitor's email application. A server-backed form delivery service has not been configured.
