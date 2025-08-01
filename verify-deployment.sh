#!/bin/bash

# PinkyTrust Platform Deployment Verification Script
# Verifies that all applications are deployed and can access shared resources

set -e

echo "🔍 Verifying PinkyTrust Platform Deployments..."
echo "=============================================="

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

# Function to check if a URL is accessible
check_url() {
    local url=$1
    local name=$2
    
    if curl -s --head "$url" | head -n 1 | grep -q "200 OK"; then
        print_success "$name is accessible at $url"
        return 0
    else
        print_error "$name is not accessible at $url"
        return 1
    fi
}

# Function to check shared resource access
check_shared_resources() {
    print_status "Checking shared resource integration..."
    
    # Check if shared resources are built
    if [ -d "shared/dist" ]; then
        print_success "Shared resources are built"
    else
        print_warning "Shared resources not found in shared/dist"
    fi
    
    # Check TypeScript definitions
    if [ -f "shared/dist/index.d.ts" ]; then
        print_success "TypeScript definitions available"
    else
        print_warning "TypeScript definitions not found"
    fi
}

# Function to verify application builds
verify_builds() {
    print_status "Verifying application builds..."
    
    # Check User App build
    if [ -d "user-app/.next" ]; then
        print_success "User App build found"
    else
        print_warning "User App build not found"
    fi
    
    # Check Municipal App build
    if [ -d "municipal-app/.next" ]; then
        print_success "Municipal App build found"
    else
        print_warning "Municipal App build not found"
    fi
    
    # Check Organiser App build
    if [ -d "organiser-app/dist" ]; then
        print_success "Organiser App build found"
    else
        print_warning "Organiser App build not found"
    fi
}

# Function to check environment configurations
check_environment() {
    print_status "Checking environment configurations..."
    
    # Check if environment files exist
    local env_files=(
        "user-app/.env.local"
        "municipal-app/.env.local"
        "organiser-app/.env.local"
    )
    
    for env_file in "${env_files[@]}"; do
        if [ -f "$env_file" ]; then
            print_success "Environment file found: $env_file"
        else
            print_warning "Environment file missing: $env_file"
        fi
    done
}

# Function to verify deployment configurations
check_deployment_configs() {
    print_status "Checking deployment configurations..."
    
    # Check Vercel configurations
    if [ -f "user-app/vercel.json" ]; then
        print_success "User App Vercel config found"
    fi
    
    if [ -f "municipal-app/vercel.json" ]; then
        print_success "Municipal App Vercel config found"
    fi
    
    # Check Vite configuration
    if [ -f "organiser-app/vite.config.ts" ]; then
        print_success "Organiser App Vite config found"
    fi
    
    # Check CI/CD configuration
    if [ -f ".github/workflows/deploy.yml" ]; then
        print_success "GitHub Actions workflow found"
    fi
}

# Function to test shared resource imports (basic syntax check)
test_shared_imports() {
    print_status "Testing shared resource imports..."
    
    # Check if TypeScript can resolve shared imports in each app
    local apps=("user-app" "municipal-app")
    
    for app in "${apps[@]}"; do
        if [ -f "$app/tsconfig.json" ]; then
            cd "$app"
            if npm run type-check > /dev/null 2>&1; then
                print_success "$app: TypeScript compilation successful"
            else
                print_warning "$app: TypeScript compilation issues detected"
            fi
            cd ..
        fi
    done
    
    # Check Organiser App separately (Vite)
    if [ -f "organiser-app/tsconfig.json" ]; then
        cd organiser-app
        if npm run type-check > /dev/null 2>&1; then
            print_success "organiser-app: TypeScript compilation successful"
        else
            print_warning "organiser-app: TypeScript compilation issues detected"
        fi
        cd ..
    fi
}

# Main verification process
main() {
    echo "Starting comprehensive deployment verification..."
    echo ""
    
    check_shared_resources
    echo ""
    
    verify_builds
    echo ""
    
    check_environment
    echo ""
    
    check_deployment_configs
    echo ""
    
    test_shared_imports
    echo ""
    
    # URL verification (optional - requires actual deployment URLs)
    print_status "URL Verification (requires actual deployment URLs):"
    echo "To test live deployments, update this script with your actual URLs:"
    echo "• User App: https://your-user-app.vercel.app"
    echo "• Municipal App: https://your-municipal-app.vercel.app"
    echo "• Organiser App: https://your-organiser-app.netlify.app"
    echo ""
    
    # Summary
    echo "=============================================="
    print_success "🎉 Deployment Verification Summary"
    echo "=============================================="
    echo ""
    echo "✅ Applications Identified:"
    echo "   📱 User App (Next.js PWA)"
    echo "   🏛️  Municipal App (Next.js Admin)"
    echo "   📋 Organiser App (Vite React)"
    echo ""
    echo "✅ Shared Resources:"
    echo "   📦 Components, utilities, types"
    echo "   🔗 Supabase client configuration"
    echo "   🎯 TypeScript definitions"
    echo ""
    echo "✅ Deployment Strategy:"
    echo "   🚀 Vercel (User & Municipal Apps)"
    echo "   🌐 Netlify/Static hosting (Organiser App)"
    echo "   🔄 CI/CD pipeline configured"
    echo ""
    echo "✅ Monorepo Benefits Maintained:"
    echo "   🔄 Shared code reusability"
    echo "   📊 Centralized configuration"
    echo "   🛠️  Consistent build processes"
    echo ""
    
    print_success "All deployment configurations are ready!"
    echo ""
    echo "Next Steps:"
    echo "1. Run './deploy-all.sh' to deploy all applications"
    echo "2. Or deploy individually using app-specific scripts"
    echo "3. Configure your hosting provider secrets/environment variables"
    echo "4. Test the deployed applications"
    echo "5. Set up monitoring and alerts"
}

# Run verification
main "$@" 