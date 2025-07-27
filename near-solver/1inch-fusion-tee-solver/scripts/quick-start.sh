#!/bin/bash

# 1inch Fusion+ TEE Solver Quick Start Script

set -e

echo "🚀 1inch Fusion+ TEE Solver Quick Start"
echo "======================================"

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v20+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need it for TEE deployment"
fi

echo "✅ Prerequisites checked"

# Install dependencies
echo -e "\n📦 Installing dependencies..."
npm install

# Setup environment
echo -e "\n🔧 Setting up environment..."
if [ ! -f "env/.env.local" ]; then
    cp env/.env.example env/.env.local
    echo "✅ Created env/.env.local from template"
    echo "⚠️  Please edit env/.env.local with your configuration:"
    echo "   - 1inch Fusion+ API key"
    echo "   - NEAR account credentials"
    echo "   - Contract addresses"
else
    echo "✅ Environment file already exists"
fi

# Build TypeScript
echo -e "\n🔨 Building TypeScript..."
npm run build

# Display next steps
echo -e "\n✨ Quick start complete!"
echo -e "\n📖 Next steps:"
echo "1. Configure your environment:"
echo "   nano env/.env.local"
echo ""
echo "2. Deploy NEAR contracts (if not already deployed):"
echo "   See ../tee-solver/README.md"
echo ""
echo "3. Register your solver:"
echo "   npm run register"
echo ""
echo "4. Start the solver:"
echo "   npm run dev"
echo ""
echo "5. For production TEE deployment:"
echo "   docker build -t fusion-solver ."
echo "   See DEPLOYMENT_GUIDE.md"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Overview and features"
echo "   - ARCHITECTURE.md - Technical architecture"
echo "   - DEPLOYMENT_GUIDE.md - Production deployment"
echo ""
echo "🎉 Happy solving!"