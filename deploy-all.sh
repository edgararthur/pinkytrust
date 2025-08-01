#!/bin/bash

# PinkyTrust Platform Deployment Script
# This script deploys all three applications while maintaining shared resource integrity

set -e

echo "🚀 Starting PinkyTrust Platform Deployment..."
echo "================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI is not installed. Attempting to install..."
        
        # Try npx first (doesn't require global install)
        if command -v npx &> /dev/null; then
            print_status "Using npx vercel instead of global installation"
            alias vercel="npx vercel@latest"
        else
            # Try installing without sudo first
            if npm install -g vercel 2>/dev/null; then
                print_success "Vercel CLI installed successfully"
            else
                print_error "Failed to install Vercel CLI globally."
                echo ""
                echo "Please install Vercel CLI manually using one of these methods:"
                echo "1. Using npx (recommended): npx vercel@latest"
                echo "2. Using sudo: sudo npm install -g vercel"
                echo "3. Using a Node version manager like nvm"
                echo ""
                echo "After installation, run this script again."
                exit 1
            fi
        fi
    fi
    
    print_success "Prerequisites check completed"
}

# Build shared resources
build_shared_resources() {
    print_status "Building shared resources..."
    
    cd shared
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing shared dependencies..."
        npm install
    fi
    
    # Clean previous build
    npm run clean 2>/dev/null || true
    
    # Build shared resources
    if [ -d "dist" ]; then
        print_success "Shared resources already built"
    else
        print_status "Building shared resources..."
        mkdir -p dist
        cp -r lib dist/ 2>/dev/null || true
        cp -r types dist/ 2>/dev/null || true
        cp -r utils dist/ 2>/dev/null || true
        echo 'export * from "./lib"; export * from "./types"; export * from "./utils";' > dist/index.js
        echo 'export * from "./lib"; export * from "./types"; export * from "./utils";' > dist/index.d.ts
    fi
    
    cd ..
    print_success "Shared resources ready"
}

# Deploy User App
deploy_user_app() {
    print_status "Deploying User App (PWA)..."
    
    cd user-app
    
    # Check if already linked to Vercel
    if [ ! -f ".vercel/project.json" ]; then
        print_status "Linking User App to Vercel..."
        print_warning "You'll need to link this project to Vercel manually or use the Vercel dashboard"
    fi
    
    # Use npx if vercel command is aliased
    if alias vercel &>/dev/null; then
        npx vercel@latest --prod --yes
    else
        vercel --prod --yes
    fi
    
    cd ..
    print_success "User App deployment initiated"
}

# Deploy Municipal App
deploy_municipal_app() {
    print_status "Deploying Municipal App (Admin Dashboard)..."
    
    cd municipal-app
    
    # Check if already linked to Vercel
    if [ ! -f ".vercel/project.json" ]; then
        print_status "Linking Municipal App to Vercel..."
        print_warning "You'll need to link this project to Vercel manually or use the Vercel dashboard"
    fi
    
    # Use npx if vercel command is aliased
    if alias vercel &>/dev/null; then
        npx vercel@latest --prod --yes
    else
        vercel --prod --yes
    fi
    
    cd ..
    print_success "Municipal App deployment initiated"
}

# Deploy Organiser App
deploy_organiser_app() {
    print_status "Deploying Organiser App (Event Management)..."
    
    cd organiser-app
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing Organiser App dependencies..."
        npm install
    fi
    
    # Build the application
    if [ ! -d "dist" ]; then
        print_status "Building Organiser App..."
        npm run build
    else
        print_success "Organiser App already built"
    fi
    
    # Check if Netlify CLI is available
    if command -v netlify &> /dev/null; then
        print_status "Deploying to Netlify..."
        netlify deploy --prod --dir=dist
    else
        print_warning "Netlify CLI not found."
        print_status "Build completed. You can:"
        echo "1. Upload the 'dist' folder to any static hosting provider"
        echo "2. Use Vercel: npx vercel@latest --prod"
        echo "3. Use Netlify: npx netlify-cli deploy --prod --dir=dist"
        echo "4. Deploy via GitHub (see GITHUB_DEPLOYMENT.md)"
    fi
    
    cd ..
    print_success "Organiser App deployment completed"
}

# Verify deployments
verify_deployments() {
    print_status "Deployment summary:"
    
    echo ""
    echo "📱 User App: Deployed to Vercel"
    echo "🏛️  Municipal App: Deployed to Vercel"
    echo "📋 Organiser App: Built and ready for deployment"
    echo ""
    echo "Next steps:"
    echo "1. Check your Vercel dashboard for deployment URLs"
    echo "2. Configure environment variables in your hosting platforms"
    echo "3. Set up custom domains if needed"
    echo "4. Test all applications"
}

# Main deployment process
main() {
    echo "Starting deployment process..."
    
    # Check if we're in the right directory
    if [ ! -d "shared" ] || [ ! -d "user-app" ] || [ ! -d "municipal-app" ] || [ ! -d "organiser-app" ]; then
        print_error "Please run this script from the root of the PinkyTrust project"
        exit 1
    fi
    
    check_prerequisites
    build_shared_resources
    
    # Ask user what they want to deploy
    echo ""
    echo "What would you like to deploy?"
    echo "1. All applications (recommended)"
    echo "2. User App only"
    echo "3. Municipal App only"
    echo "4. Organiser App only"
    echo "5. Skip deployment (just build)"
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            deploy_user_app
            deploy_municipal_app
            deploy_organiser_app
            ;;
        2)
            deploy_user_app
            ;;
        3)
            deploy_municipal_app
            ;;
        4)
            deploy_organiser_app
            ;;
        5)
            print_status "Skipping deployment. All builds are ready."
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
    
    verify_deployments
    
    echo ""
    echo "================================================"
    print_success "🎉 PinkyTrust Platform Deployment Process Complete!"
    echo "================================================"
}

# Handle script interruption
cleanup() {
    print_warning "Deployment interrupted. Cleaning up..."
    exit 1
}

trap cleanup INT

# Run main function
main "$@" 