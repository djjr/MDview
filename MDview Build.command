#!/bin/bash

# ── MDview Build ─────────────────────────────────
# Double-click this file to rebuild the site.
# First run only: chmod +x "MDview Build.command"
# ─────────────────────────────────────────────────

# Change to the project directory regardless of where
# Terminal happened to start.
cd "$(dirname "$0")"

echo "🔨 Building MDview..."
echo ""

npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build complete — dist/ is ready."
  echo "   To preview: python3 -m http.server --directory dist/ 8080"
else
  echo ""
  echo "❌ Build failed — check the output above."
fi

echo ""
read -p "Press Enter to close..."
