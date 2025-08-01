#!/bin/bash

# Breast Cancer Awareness Platform - User App Deployment Script
echo "🚀 Starting deployment of User App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the user-app directory."
    exit 1
fi

# Check if environment file exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Copying from example..."
    if [ -f "env.local.example" ]; then
        cp env.local.example .env.local
        print_status "Created .env.local from example"
        print_warning "Please update .env.local with your actual values before continuing"
        echo "Press any key to continue after updating .env.local..."
        read -n 1 -s
    else
        print_error "env.local.example not found. Please create .env.local manually."
        exit 1
    fi
fi

# Install dependencies
print_status "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Type check
print_status "Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    print_error "Type check failed"
    exit 1
fi

# Lint check
print_status "Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    print_warning "Linting issues found. Attempting to fix..."
    npm run lint:fix
fi

# Run tests
print_status "Running tests..."
npm run test -- --run
if [ $? -ne 0 ]; then
    print_warning "Some tests failed. Continue with deployment? (y/n)"
    read -r response
    if [[ ! $response =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi
fi

# Build the application
print_status "Building application..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

print_status "Build completed successfully!"

# Check deployment target
echo ""
echo "Choose deployment target:"
echo "1) Vercel"
echo "2) Netlify"
echo "3) Docker"
echo "4) Static export"
echo "5) Custom server"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_status "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            print_error "Vercel CLI not found. Install with: npm i -g vercel"
            exit 1
        fi
        ;;
    2)
        print_status "Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir=.next
        else
            print_error "Netlify CLI not found. Install with: npm i -g netlify-cli"
            exit 1
        fi
        ;;
    3)
        print_status "Building Docker image..."
        if [ -f "Dockerfile" ]; then
            docker build -t user-app .
            print_status "Docker image built successfully!"
            echo "Run with: docker run -p 3001:3000 user-app"
        else
            print_error "Dockerfile not found"
            exit 1
        fi
        ;;
    4)
        print_status "Creating static export..."
        # Modify next.config.js temporarily for static export
        if grep -q "output: 'standalone'" next.config.js; then
            sed -i.bak "s/output: 'standalone'/output: 'export'/" next.config.js
            npm run build
            mv next.config.js.bak next.config.js
            print_status "Static export created in 'out' directory"
        else
            print_error "Unable to create static export. Please check next.config.js"
        fi
        ;;
    5)
        print_status "Starting production server..."
        npm run start
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

print_status "Deployment process completed!"
echo ""
echo "📋 Post-deployment checklist:"
echo "  □ Update DNS settings"
echo "  □ Configure SSL certificate"
echo "  □ Test all functionality"
echo "  □ Monitor performance"
echo "  □ Set up monitoring alerts"
echo ""
echo "🌐 Your User App should now be accessible!" 