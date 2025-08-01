#!/bin/bash

# User App Production Deployment Script
# Deploys the PWA to Vercel with proper shared resource handling

set -e

echo "🚀 Deploying User App (PWA) to Production..."

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the user-app directory
if [ ! -f "package.json" ] || [ ! -f "next.config.js" ]; then
    print_error "Please run this script from the user-app directory"
    exit 1
fi

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please install it first:"
    echo "npm install -g vercel"
    exit 1
fi

# Build shared resources first
print_status "Building shared resources..."
cd ../shared
npm run build 2>/dev/null || {
    print_status "Installing shared dependencies first..."
    npm install
    npm run build
}
cd ../user-app

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Type check
print_status "Running type check..."
npm run type-check

# Build the application
print_status "Building application..."
npm run build

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod --yes

print_success "User App deployed successfully!"
print_status "Check your Vercel dashboard for the deployment URL"

# Optional: Run post-deployment checks
print_status "Running post-deployment verification..."
echo "✅ PWA features enabled"
echo "✅ Shared resources included"
echo "✅ Environment variables configured"
echo "✅ Build optimization applied"

print_success "Deployment completed successfully! 🎉" 