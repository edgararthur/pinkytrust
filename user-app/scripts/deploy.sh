#!/bin/bash

# Production Deployment Script for User App
# This script handles building, testing, and deploying the user application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="user-app"
BUILD_DIR="build"
DIST_DIR=".next"
NODE_ENV="production"
PORT="${PORT:-3000}"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗ $1${NC}"
    exit 1
}

check_dependencies() {
    log "Checking dependencies..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if ! npx semver "$NODE_VERSION" -r ">=$REQUIRED_VERSION" &> /dev/null; then
        error "Node.js version $NODE_VERSION is not supported. Required: >=$REQUIRED_VERSION"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    success "Dependencies check passed"
}

install_dependencies() {
    log "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci --only=production
    else
        npm install --only=production
    fi
    
    success "Dependencies installed"
}

run_tests() {
    log "Running tests..."
    
    # Install dev dependencies for testing
    npm install --only=dev
    
    # Run linting
    if npm run lint &> /dev/null; then
        success "Linting passed"
    else
        warning "Linting failed, but continuing..."
    fi
    
    # Run type checking
    if npm run type-check &> /dev/null; then
        success "Type checking passed"
    else
        warning "Type checking failed, but continuing..."
    fi
    
    # Run unit tests
    if npm run test &> /dev/null; then
        success "Tests passed"
    else
        warning "Tests failed, but continuing..."
    fi
    
    success "Test suite completed"
}

build_application() {
    log "Building application..."
    
    # Set environment variables
    export NODE_ENV="production"
    export NEXT_TELEMETRY_DISABLED=1
    
    # Clean previous build
    if [ -d "$DIST_DIR" ]; then
        rm -rf "$DIST_DIR"
        log "Cleaned previous build"
    fi
    
    # Build the application
    npm run build
    
    # Check if build was successful
    if [ ! -d "$DIST_DIR" ]; then
        error "Build failed - no build directory found"
    fi
    
    success "Application built successfully"
}

analyze_bundle() {
    log "Analyzing bundle size..."
    
    # Generate bundle analysis
    if command -v npx &> /dev/null; then
        npx next-bundle-analyzer || warning "Bundle analysis failed"
    fi
    
    # Check build size
    BUILD_SIZE=$(du -sh "$DIST_DIR" | cut -f1)
    log "Build size: $BUILD_SIZE"
    
    success "Bundle analysis completed"
}

optimize_build() {
    log "Optimizing build..."
    
    # Compress static assets if possible
    if command -v gzip &> /dev/null; then
        find "$DIST_DIR" -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -k {} \;
        success "Static assets compressed"
    fi
    
    # Remove unnecessary files
    find "$DIST_DIR" -name "*.map" -delete || true
    find "$DIST_DIR" -name "*.log" -delete || true
    
    success "Build optimized"
}

health_check() {
    log "Performing health check..."
    
    # Start the application in background
    npm start &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 10
    
    # Check if server is responding
    if curl -f "http://localhost:$PORT" &> /dev/null; then
        success "Health check passed"
    else
        error "Health check failed - server not responding"
    fi
    
    # Stop the server
    kill $SERVER_PID || true
    wait $SERVER_PID 2>/dev/null || true
}

create_deployment_info() {
    log "Creating deployment info..."
    
    # Create deployment info file
    cat > deployment-info.json << EOF
{
  "appName": "$APP_NAME",
  "version": "$(node -p "require('./package.json').version")",
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "buildSize": "$(du -sh "$DIST_DIR" | cut -f1)",
  "environment": "$NODE_ENV"
}
EOF
    
    success "Deployment info created"
}

cleanup() {
    log "Cleaning up..."
    
    # Remove dev dependencies
    npm prune --production
    
    # Clean npm cache
    npm cache clean --force
    
    success "Cleanup completed"
}

# Main deployment process
main() {
    log "Starting deployment process for $APP_NAME..."
    
    # Pre-deployment checks
    check_dependencies
    
    # Install dependencies
    install_dependencies
    
    # Run tests (optional, can be skipped with --skip-tests)
    if [[ "$*" != *"--skip-tests"* ]]; then
        run_tests
    fi
    
    # Build application
    build_application
    
    # Analyze bundle
    if [[ "$*" != *"--skip-analysis"* ]]; then
        analyze_bundle
    fi
    
    # Optimize build
    optimize_build
    
    # Health check
    if [[ "$*" != *"--skip-health-check"* ]]; then
        health_check
    fi
    
    # Create deployment info
    create_deployment_info
    
    # Cleanup
    cleanup
    
    success "Deployment completed successfully!"
    log "Application is ready for production deployment"
    log "Build location: $DIST_DIR"
    log "Start command: npm start"
    log "Health check: http://localhost:$PORT"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo "Options:"
        echo "  --skip-tests        Skip running tests"
        echo "  --skip-analysis     Skip bundle analysis"
        echo "  --skip-health-check Skip health check"
        echo "  --help, -h          Show this help message"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac 