#!/bin/bash

# Setup Neon test branch for E2E testing
# Usage: ./scripts/setup-test-branch.sh
#
# Prerequisites:
# - NEON_API_KEY environment variable (get from https://console.neon.tech/app/settings/api-keys)
# - NEON_PROJECT_ID environment variable (or pass as argument)

set -e

echo "🚀 Setting up Neon test branch..."

# Load credentials from .env.test if it exists
if [ -f .env.test ]; then
    echo "📄 Loading credentials from .env.test..."
    # Export all variables from .env.test
    set -a
    source .env.test
    set +a
fi

# Check for NEON_API_KEY
if [ -z "$NEON_API_KEY" ]; then
    echo "❌ NEON_API_KEY environment variable is not set."
    echo "   Get your API key from: https://console.neon.tech/app/settings/api-keys"
    echo "   Export it: export NEON_API_KEY=nkey_xxx"
    exit 1
fi

# Check for NEON_PROJECT_ID
if [ -z "$NEON_PROJECT_ID" ]; then
    echo "❌ NEON_PROJECT_ID environment variable is not set."
    echo "   Find your project ID in Neon console or run: neonctl projects list"
    echo "   Export it: export NEON_PROJECT_ID=proj_xxx"
    exit 1
fi

# Check if neonctl is installed
if ! command -v neonctl &> /dev/null; then
    echo "❌ neonctl is not installed. Installing..."
    npm install -g neonctl
fi

# Resolve project name to project ID if needed
# Neon project IDs look like: purple-brook-09615940 (adjective-noun-numbers)
# Project names can be anything, so we check if it's a valid project ID
echo "🔍 Checking project '$NEON_PROJECT_ID'..."

# Try to list branches - if it fails, the project ID might be a name that needs resolution
if ! neonctl branches list --project-id "$NEON_PROJECT_ID" --output json >/dev/null 2>&1; then
    echo "   Attempting to resolve project name to ID..."
    RESOLVED_ID=$(neonctl projects list --output json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['projects'][0]['id'])" 2>/dev/null || echo "")
    if [ -n "$RESOLVED_ID" ]; then
        echo "   Found project ID: $RESOLVED_ID"
        NEON_PROJECT_ID="$RESOLVED_ID"
    else
        echo "❌ Could not resolve project ID"
        exit 1
    fi
fi

# Check if .env.test exists
if [ ! -f .env.test ]; then
    echo "📝 Creating .env.test from example..."
    cp .env.test.example .env.test
fi

# Check if test branch exists (using JSON output for reliable parsing)
echo "🌿 Checking for test branch..."
BRANCH_EXISTS=$(neonctl branches list --project-id "$NEON_PROJECT_ID" --output json 2>/dev/null | python3 -c "import sys,json; branches=json.load(sys.stdin); print('yes' if any(b['name']=='test' for b in branches) else 'no')" 2>/dev/null || echo "no")

if [ "$BRANCH_EXISTS" = "yes" ]; then
    echo "✅ Test branch already exists"
else
    echo "Creating test branch from main..."
    neonctl branches create --project-id "$NEON_PROJECT_ID" --name test
    echo "✅ Test branch created"
fi

# Get connection string for test branch
echo "📡 Getting test branch connection string..."
CONNECTION_STRING=$(neonctl connection-string test --project-id "$NEON_PROJECT_ID")

# Update .env.test using python for reliable replacement
echo "📝 Updating .env.test..."
python3 << EOF
import re
with open('.env.test', 'r') as f:
    content = f.read()
content = re.sub(r'^DATABASE_URL_TEST=.*$', 'DATABASE_URL_TEST=$CONNECTION_STRING', content, flags=re.MULTILINE)
with open('.env.test', 'w') as f:
    f.write(content)
EOF

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: pnpm test:e2e:setup (to seed test database)"
echo "2. Run: pnpm test:e2e (to run E2E tests)"
