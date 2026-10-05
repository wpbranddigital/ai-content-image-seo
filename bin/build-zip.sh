#!/usr/bin/env bash
# Builds the WordPress.org-ready zip: ./wbd-content-image-seo-assistant.zip
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci --no-audit --no-fund
npm run build
SLUG=wbd-content-image-seo-assistant
TMP="$(mktemp -d)"
mkdir -p "$TMP/$SLUG"
tar --exclude-from=<(sed 's#^/##' .distignore) --exclude=dist --exclude='*.zip' -cf - . | tar -xf - -C "$TMP/$SLUG"
rm -f "$SLUG.zip"
(cd "$TMP" && zip -rq "$OLDPWD/$SLUG.zip" "$SLUG")
rm -rf "$TMP"
echo "Created $SLUG.zip"
