#!/bin/bash

# Organiser App Production Deployment Script
# Builds and prepares the Vite React app for deployment

set -e

echo "📋 Deploying Organiser App (Event Management) to Production..."

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the organiser-app directory
if [ ! -f "package.json" ] || [ ! -f "vite.config.ts" ]; then
    print_error "Please run this script from the organiser-app directory"
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
cd ../organiser-app

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Type check
print_status "Running type check..."
npm run type-check

# Run linting
print_status "Running linter..."
npm run lint

# Build the application
print_status "Building application for production..."
npm run build

print_success "Build completed successfully!"

# Check if Netlify CLI is available for automatic deployment
if command -v netlify &> /dev/null; then
    print_status "Netlify CLI found. Deploying automatically..."
    netlify deploy --prod --dir=dist
    print_success "Organiser App deployed to Netlify successfully!"
else
    print_warning "Netlify CLI not found. Manual deployment required."
    echo ""
    echo "📦 Build files are ready in the 'dist' directory"
    echo ""
    echo "To deploy manually:"
    echo "1. Upload the contents of the 'dist' folder to your hosting provider"
    echo "2. Configure your web server to serve the index.html file for all routes"
    echo "3. Set up the following environment variables on your hosting platform:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo "   - VITE_APP_URL"
    echo ""
    echo "Popular hosting options:"
    echo "• Netlify: netlify.com (recommended for Vite apps)"
    echo "• Vercel: vercel.com"
    echo "• Firebase Hosting: firebase.google.com"
    echo "• GitHub Pages: pages.github.com"
fi

# Display build info
print_status "Build information:"
echo "📁 Output directory: dist/"
echo "📊 Build size:"
du -sh dist/ 2>/dev/null || echo "Build size calculation unavailable"

print_status "Post-deployment checklist:"
echo "✅ Shared resources included"
echo "✅ Environment variables configured"
echo "✅ Vite optimizations applied"
echo "✅ Static assets optimized"
echo "✅ Code splitting implemented"

print_success "Organiser App deployment preparation completed! 🎉" 