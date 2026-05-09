#!/bin/bash

# ── MDview Publish ────────────────────────────────
# Double-click to symlink a file or folder into
# MDview's content/ directory (publish step).
# First run only: chmod +x "MDview Publish.command"
# ─────────────────────────────────────────────────

CONTENT_DIR="$(dirname "$0")/content"

# Ask: file or folder?
CHOICE=$(osascript <<'EOF'
tell application "Finder" to activate
button returned of (display dialog "What do you want to publish?" buttons {"Cancel", "File", "Folder"} default button "Folder")
EOF
)

if [ -z "$CHOICE" ] || [ "$CHOICE" = "Cancel" ]; then
  echo "Cancelled."
  echo ""
  read -p "Press Enter to close..."
  exit 0
fi

# Show the appropriate picker
if [ "$CHOICE" = "Folder" ]; then
  TARGET=$(osascript <<'EOF'
tell application "Finder" to activate
try
  POSIX path of (choose folder with prompt "Choose a folder to publish into MDview content/:")
on error
  ""
end try
EOF
)
else
  TARGET=$(osascript <<'EOF'
tell application "Finder" to activate
try
  POSIX path of (choose file with prompt "Choose a file to publish into MDview content/:")
on error
  ""
end try
EOF
)
fi

if [ -z "$TARGET" ]; then
  echo "Cancelled."
  echo ""
  read -p "Press Enter to close..."
  exit 0
fi

# Strip trailing slash
TARGET="${TARGET%/}"
NAME="$(basename "$TARGET")"
LINK="$CONTENT_DIR/$NAME"

if [ -e "$LINK" ] || [ -L "$LINK" ]; then
  echo "⚠️  '$NAME' already exists in content/ — skipping."
  echo "   Remove $LINK first if you want to re-link it."
  echo ""
  read -p "Press Enter to close..."
  exit 1
fi

ln -s "$TARGET" "$LINK"

if [ $? -eq 0 ]; then
  echo "✅ Published: content/$NAME"
  echo "   → $TARGET"
  echo ""
  echo "   Run 'MDview Build.command' to rebuild the site."
else
  echo "❌ Failed to create symlink."
fi

echo ""
read -p "Press Enter to close..."
