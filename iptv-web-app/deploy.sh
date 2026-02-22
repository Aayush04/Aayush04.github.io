#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$SCRIPT_DIR"

echo "Building iptv-web-app in $APP_DIR"
cd "$APP_DIR"

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

BUILD_DIR="$APP_DIR/dist"
if [ ! -d "$BUILD_DIR" ]; then
  echo "Build output not found at $BUILD_DIR"
  exit 1
fi

echo "Copying build to $REPO_ROOT/iptv-app/"
rm -rf "$REPO_ROOT/iptv-app"
mkdir -p "$REPO_ROOT/iptv-app"
cp -r "$BUILD_DIR/." "$REPO_ROOT/iptv-app/"

echo "Build copied to docs/. Ready for commit and publish."
