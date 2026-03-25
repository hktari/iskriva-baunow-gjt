#!/bin/bash

# Copy environment files from the original workspace
if [ -f "$ROOT_WORKSPACE_PATH/.env" ]; then
    cp "$ROOT_WORKSPACE_PATH/.env" .env
    echo "Copied .env file"
fi

if [ -f "$ROOT_WORKSPACE_PATH/.env.local" ]; then
    cp "$ROOT_WORKSPACE_PATH/.env.local" .env.local
    echo "Copied .env.local file"
fi

# Install dependencies
if [ -f "package.json" ]; then
    pnpm install
    echo "Installed npm dependencies"
fi

exit 0