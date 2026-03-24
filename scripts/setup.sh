#!/bin/bash

# EU Project Manager - Setup Script
# This script initializes the development environment

set -e

echo "🚀 EU Project Manager - Setup"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  Please edit .env and add your database credentials and secrets"
  echo ""
else
  echo "✅ .env file already exists"
fi

# Check for PostgreSQL
echo "🔍 Checking PostgreSQL connection..."
if ! command -v psql &> /dev/null; then
  echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed."
else
  echo "✅ PostgreSQL client found"
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🗄️  Setting up database..."
echo "Generating Prisma Client..."
pnpm db:generate

echo ""
echo "Pushing schema to database..."
pnpm db:push

echo ""
echo "🌱 Seeding database with demo data..."
pnpm db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "📧 Demo accounts created:"
echo "   Viewer:     viewer@example.com / demo123"
echo "   Editor:     editor@example.com / demo123"
echo "   Super User: admin@example.com / demo123"
echo ""
echo "🎯 Next steps:"
echo "   1. Edit .env file with your database credentials"
echo "   2. Run 'pnpm dev' to start the development server"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
