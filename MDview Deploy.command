#!/bin/bash

# ── MDview Deploy ─────────────────────────────────
# Builds the site, then commits and pushes to GitHub.
# GitHub Pages serves directly from the dist/ in the
# gh-pages branch (or main, per your Pages settings).
# First run only: chmod +x "MDview Deploy.command"
# ─────────────────────────────────────────────────

cd "$(dirname "$0")"

echo "🔨 Building MDview..."
echo ""

npm run build

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Build failed — aborting deploy."
  echo ""
  read -p "Press Enter to close..."
  exit 1
fi

echo ""
echo "✅ Build complete."
echo ""

# Check if there's anything to commit
git add -A

if git diff --cached --quiet; then
  echo "ℹ️  Nothing changed since last deploy — already up to date."
  echo ""
  read -p "Press Enter to close..."
  exit 0
fi

# Show what's being committed
echo "📦 Changes to deploy:"
git diff --cached --stat
echo ""

# Commit with timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
git commit -m "Deploy: $TIMESTAMP"

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Commit failed."
  echo ""
  read -p "Press Enter to close..."
  exit 1
fi

echo ""
echo "⬆️  Pushing to GitHub..."
git push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deployed. GitHub Pages will update in a moment."
else
  echo ""
  echo "❌ Push failed — check your connection or credentials."
fi

echo ""
read -p "Press Enter to close..."
