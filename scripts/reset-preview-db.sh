#!/bin/bash
set -e

# Reset Preview Database Script
# This script deletes and recreates the Neon preview branch from production

echo "🔄 Resetting preview database..."

# Check if Neon CLI is installed
if ! command -v neonctl &> /dev/null; then
    echo "❌ Error: neonctl is not installed"
    echo "Install it with: npm install -g neonctl"
    exit 1
fi

# Check if NEON_PROJECT_ID is set
if [ -z "$NEON_PROJECT_ID" ]; then
    echo "❌ Error: NEON_PROJECT_ID environment variable is not set"
    echo "Set it with: export NEON_PROJECT_ID=your-project-id"
    exit 1
fi

PROJECT_ID="$NEON_PROJECT_ID"
PREVIEW_BRANCH="preview"
PRODUCTION_BRANCH="production"

echo "📋 Project ID: $PROJECT_ID"
echo "🌿 Preview branch: $PREVIEW_BRANCH"

# Restore preview branch from production
echo "🔄 Restoring preview branch from $PRODUCTION_BRANCH..."
neonctl branch restore "$PREVIEW_BRANCH" "$PRODUCTION_BRANCH" --project-id "$PROJECT_ID"

echo "✅ Preview database reset complete!"
