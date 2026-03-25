#!/bin/bash
set -e

# Deploy to Vercel Production Script
# This script deploys the application to Vercel production environment

echo "🚀 Deploying to Vercel production..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI is not installed"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

# Confirm production deployment
echo "⚠️  You are about to deploy to PRODUCTION"
echo "   Make sure all tests have passed on preview!"
echo ""
read -p "Continue with production deployment? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy to production
echo "📦 Building and deploying to production..."
PROD_URL=$(vercel --prod --yes 2>&1 | tee /dev/tty | grep -oP 'https://[^\s]+' | head -1)

if [ -z "$PROD_URL" ]; then
    echo "❌ Error: Failed to get production URL"
    exit 1
fi

echo ""
echo "✅ Production deployment successful!"
echo "🔗 Production URL: $PROD_URL"
echo ""
echo "📝 Next steps:"
echo "   1. Verify production deployment"
echo "   2. Monitor for any issues"
echo "   3. Clean up preview URL file"

# Clean up preview URL file
if [ -f ".vercel-preview-url" ]; then
    rm .vercel-preview-url
    echo "🧹 Cleaned up preview URL file"
fi
