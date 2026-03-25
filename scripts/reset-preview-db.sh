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

# Check if NEON_API_KEY is set
if [ -z "$NEON_API_KEY" ]; then
    echo "❌ Error: NEON_API_KEY environment variable is not set"
    echo "Set it with: export NEON_API_KEY=your-api-key"
    exit 1
fi

PROJECT_ID="$NEON_PROJECT_ID"
PREVIEW_BRANCH="preview"
MAIN_BRANCH="main"

echo "📋 Project ID: $PROJECT_ID"
echo "🌿 Preview branch: $PREVIEW_BRANCH"

# Check if preview branch exists
if neonctl branches list --project-id "$PROJECT_ID" | grep -q "$PREVIEW_BRANCH"; then
    echo "🗑️  Deleting existing preview branch..."
    neonctl branches delete "$PREVIEW_BRANCH" --project-id "$PROJECT_ID"
    echo "✅ Preview branch deleted"
else
    echo "ℹ️  Preview branch does not exist, will create new one"
fi

# Create new preview branch from main
echo "🌱 Creating new preview branch from $MAIN_BRANCH..."
neonctl branches create --project-id "$PROJECT_ID" --name "$PREVIEW_BRANCH" --parent "$MAIN_BRANCH"

echo "✅ Preview database reset complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Get the connection string: neonctl connection-string $PREVIEW_BRANCH --project-id $PROJECT_ID"
echo "   2. Update DATABASE_URL in Vercel preview environment"
echo "   3. Run migrations if needed: pnpm prisma migrate deploy"
