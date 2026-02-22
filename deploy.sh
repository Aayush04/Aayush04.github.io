#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Building iptv-web-app in $ROOT_DIR/iptv-web-app"
cd "$ROOT_DIR/iptv-web-app"

echo "Installing dependencies..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile || pnpm install
  echo "Running build with pnpm..."
  pnpm run build
else
  npm ci --no-audit --no-fund
  echo "Running build with npm..."
  npm run build
fi

BUILD_DIR="$ROOT_DIR/iptv-web-app/dist"
if [ ! -d "$BUILD_DIR" ]; then
  echo "Build output not found at $BUILD_DIR"
  exit 1
fi

echo "Copying build to $ROOT_DIR/docs/"
rm -rf "$ROOT_DIR/docs"
mkdir -p "$ROOT_DIR/docs"
cp -r "$BUILD_DIR/." "$ROOT_DIR/docs/"

echo "Build copied to docs/. Ready for commit and publish."
