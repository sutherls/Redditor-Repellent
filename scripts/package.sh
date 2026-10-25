#!/usr/bin/env sh
# Builds dist/redditor-repellent-<version>.zip for store submission (macOS/Linux).
set -e
cd "$(dirname "$0")/.."
version=$(node -p "require('./manifest.json').version")
mkdir -p dist
zip="dist/redditor-repellent-$version.zip"
rm -f "$zip"
zip -r "$zip" manifest.json LICENSE src popup icons -x '*.DS_Store'
echo "Wrote $zip"
