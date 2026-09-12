#!/usr/bin/env bash
# Builds the current branch and atomically publishes it as the live release.
#
# Run this FROM THE PERSISTENT CHECKOUT, e.g.:
#   cd /opt/deepiq/repo && ./deploy/deploy.sh
#
# What it does, in order:
#   1. Pulls the deploy branch.
#   2. Installs dependencies exactly as locked (npm ci, not npm install).
#   3. Builds (this also regenerates deploy/nginx-routes.conf and public/sitemap.xml
#      and validates public/page.json + site-content.json — the build fails loudly if
#      either is broken, rather than publishing a broken site).
#   4. Copies dist/ into a fresh timestamped release directory.
#   5. Repoints the `current` symlink at it (atomic — visitors never see a half-copied
#      directory).
#   6. Publishes the freshly generated Nginx route rules and reloads Nginx.
#   7. Prunes old releases, keeping the last 5 for a quick rollback.
#
# One-time setup this script assumes already exists:
#   - A persistent git checkout at $REPO_DIR (never served directly by Nginx).
#   - $REPO_DIR/.env with real production values for the VITE_* variables in
#     .env.example (Vite inlines these at build time, so it must exist before step 3).
#   - $RELEASES_DIR and the `current` symlink's parent directory, owned by the user
#     running this script.
#   - passwordless sudo (or run as root) for `nginx -t` / `systemctl reload nginx`,
#     OR run those two commands yourself after this script finishes.

set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/deepiq/repo}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-develop}"
RELEASES_DIR="${RELEASES_DIR:-/var/www/deepiq/releases}"
CURRENT_LINK="${CURRENT_LINK:-/var/www/deepiq/current}"
NGINX_ROUTES_DEST="${NGINX_ROUTES_DEST:-/etc/nginx/deepiq/nginx-routes.conf}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"

cd "$REPO_DIR"

echo "==> Pulling $DEPLOY_BRANCH"
git fetch --quiet origin
git checkout --quiet "$DEPLOY_BRANCH"
git reset --hard --quiet "origin/$DEPLOY_BRANCH"

if [ ! -f .env ]; then
  echo "!! $REPO_DIR/.env is missing. Copy .env.example to .env and fill in real values" >&2
  echo "   before the first deploy (Vite bakes VITE_* vars in at build time)." >&2
  exit 1
fi

echo "==> Installing dependencies"
npm ci

echo "==> Building"
npm run build

timestamp="$(date +%Y%m%d%H%M%S)"
release_dir="$RELEASES_DIR/$timestamp"

echo "==> Publishing release $timestamp"
mkdir -p "$release_dir"
cp -r dist/. "$release_dir"/

echo "==> Updating Nginx route rules"
sudo mkdir -p "$(dirname "$NGINX_ROUTES_DEST")"
sudo cp deploy/nginx-routes.conf "$NGINX_ROUTES_DEST"

echo "==> Swapping the current symlink"
ln -sfn "$release_dir" "$CURRENT_LINK"

echo "==> Reloading Nginx"
sudo nginx -t
sudo systemctl reload nginx

echo "==> Pruning old releases (keeping last $KEEP_RELEASES)"
cd "$RELEASES_DIR"
ls -1dt -- */ 2>/dev/null | tail -n "+$((KEEP_RELEASES + 1))" | xargs -r rm -rf --

echo "==> Deployed $timestamp"
