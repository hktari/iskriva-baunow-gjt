#!/bin/bash
set -e

# Deploy to Vercel Preview Script
# This script deploys the application to Vercel preview environment

echo "🚀 Deploying to Vercel preview..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI is not installed"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

# Deploy to preview
echo "📦 Building and deploying..."
PREVIEW_URL=$(vercel --yes 2>&1 | tee /dev/tty | grep -oP 'https://[^\s]+' | head -1)

if [ -z "$PREVIEW_URL" ]; then
    echo "❌ Error: Failed to get preview URL"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo "🔗 Preview URL: $PREVIEW_URL"
echo ""
echo "📝 Next steps:"
echo "   1. Run E2E tests: pnpm test:e2e:preview $PREVIEW_URL"
echo "   2. If tests pass, promote to production: pnpm deploy:prod"

# Save preview URL to file for test script
echo "$PREVIEW_URL" > .vercel-preview-url
