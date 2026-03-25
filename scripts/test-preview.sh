#!/bin/bash
set -e

# Test Preview Deployment Script
# This script runs E2E tests against the Vercel preview deployment

echo "🧪 Running E2E tests against preview deployment..."

# Get preview URL from argument or saved file
PREVIEW_URL="$1"

if [ -z "$PREVIEW_URL" ]; then
    if [ -f ".vercel-preview-url" ]; then
        PREVIEW_URL=$(cat .vercel-preview-url)
        echo "📋 Using saved preview URL: $PREVIEW_URL"
    else
        echo "❌ Error: No preview URL provided"
        echo "Usage: $0 <preview-url>"
        echo "   or: Deploy first with 'pnpm deploy:preview'"
        exit 1
    fi
fi

# Validate URL format
if [[ ! "$PREVIEW_URL" =~ ^https?:// ]]; then
    echo "❌ Error: Invalid URL format: $PREVIEW_URL"
    exit 1
fi

echo "🎯 Target URL: $PREVIEW_URL"

# Optional: Reset preview database
if [ "$RESET_DB" = "true" ]; then
    echo "🔄 Resetting preview database..."
    ./scripts/reset-preview-db.sh
fi

# Run Playwright tests
echo "🎭 Running Playwright tests..."
BASE_URL="$PREVIEW_URL" pnpm playwright test

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    echo "🚀 Ready to promote to production: pnpm deploy:prod"
else
    echo ""
    echo "❌ Tests failed!"
    echo "🔍 Check test results in tmp/test-results/"
    exit $EXIT_CODE
fi
