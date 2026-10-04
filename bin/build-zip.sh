#!/usr/bin/env bash
# Builds the WordPress.org-ready zip: ./ai-content-image-seo.zip
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci --no-audit --no-fund
npm run build
SLUG=ai-content-image-seo
TMP="$(mktemp -d)"
mkdir -p "$TMP/$SLUG"
tar --exclude-from=<(sed 's#^/##' .distignore) --exclude=dist --exclude='*.zip' -cf - . | tar -xf - -C "$TMP/$SLUG"
rm -f "$SLUG.zip"
(cd "$TMP" && zip -rq "$OLDPWD/$SLUG.zip" "$SLUG")
rm -rf "$TMP"
echo "Created $SLUG.zip"
