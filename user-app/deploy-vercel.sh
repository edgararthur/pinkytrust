#!/bin/bash

# Breast Cancer Awareness Platform - User App Vercel Deployment Script
echo "🚀 Deploying User App to Vercel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the user-app directory."
    exit 1
fi

# Use npx instead of global installation to avoid permission issues
print_info "Using npx vercel (no global installation required)"

# Check if environment file exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Copying from example..."
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
        print_status "Created .env.local from example"
        print_warning "Please update .env.local with your production values"
    else
        print_error "env.local.example not found. Please create .env.local manually."
        exit 1
    fi
fi

# Pre-deployment checks
print_info "Running pre-deployment checks..."

# Install dependencies
print_status "Installing dependencies..."
npm install --force
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Type check
print_status "Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    print_error "Type check failed. Please fix TypeScript errors before deploying."
    print_info "You can use the quick deployment script to bypass type checking: ./deploy-vercel-quick.sh"
    exit 1
fi

# Lint check
print_status "Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    print_warning "Linting issues found. Attempting to fix..."
    npm run lint:fix
    if [ $? -ne 0 ]; then
        print_warning "Some linting issues couldn't be auto-fixed. Continue anyway? (y/n)"
        read -r response
        if [[ ! $response =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled"
            exit 1
        fi
    fi
fi

# Test build locally
print_status "Testing build locally..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Local build failed. Please fix build errors before deploying."
    exit 1
fi

print_status "Pre-deployment checks completed successfully!"

# Choose deployment type
echo ""
echo "Choose deployment type:"
echo "1) Production deployment"
echo "2) Preview deployment"
echo "3) Development preview"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        print_info "Deploying to production using npx..."
        npx vercel --prod
        DEPLOY_EXIT_CODE=$?
        ;;
    2)
        print_info "Creating preview deployment using npx..."
        npx vercel
        DEPLOY_EXIT_CODE=$?
        ;;
    3)
        print_info "Creating development preview using npx..."
        npx vercel --dev
        DEPLOY_EXIT_CODE=$?
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    print_status "Deployment completed successfully!"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "  □ Test the deployed application"
    echo "  □ Verify environment variables are set correctly"
    echo "  □ Check PWA functionality"
    echo "  □ Test Supabase connectivity"
    echo "  □ Verify Mapbox integration"
    echo "  □ Test mobile responsiveness"
    echo "  □ Check performance metrics"
    echo ""
    print_info "Your app should now be live on Vercel!"
    
    # Get deployment URL
    echo ""
    print_info "To get your deployment URL, run: npx vercel ls"
    print_info "To set up custom domain, run: npx vercel domains add yourdomain.com"
    print_info "To configure environment variables, run: npx vercel env add"
else
    print_error "Deployment failed. Please check the error messages above."
    exit 1
fi 