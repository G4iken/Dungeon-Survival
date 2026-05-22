#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
echo "======================================"
echo "  AI Dungeon Survival - Mac/Linux"
echo "======================================"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Install Node.js LTS from https://nodejs.org/"
  exit 1
fi
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi
echo "Starting development server..."
npm run dev
