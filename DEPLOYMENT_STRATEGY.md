# Monorepo Deployment Strategy - PinkyTrust Platform

## Architecture Analysis

### Three Applications Identified
1. **User App** (Next.js PWA) - Port 5432 (dev) / 6000 (prod)
2. **Municipal App** (Next.js Admin Dashboard) - Port 5172
3. **Organiser App** (Vite React App) - Port 3002

### Shared Resources Structure
```
shared/
├── components/
│   ├── ui/           # Shared UI components (DataVisualization, etc.)
│   └── auth/         # Authentication components
├── lib/
│   ├── supabase.ts   # Centralized Supabase client configuration
│   └── api/          # Shared API utilities
├── types/
│   ├── database.ts   # Database type definitions
│   └── supabase.ts   # Supabase type definitions
└── utils/
    └── index.ts      # Shared utility functions
```

### Current Dependency Patterns
- **User App**: Has local `shared/` directory that imports from root `shared/`
- **Municipal App**: Imports shared resources via relative paths (`../../../shared/`)
- **Organiser App**: Uses Vite with different build system than Next.js apps
- **Root shared**: Contains centralized Supabase client and type definitions

## Deployment Challenges Identified

1. **Mixed Build Systems**: Next.js (User & Municipal) vs Vite (Organiser)
2. **Shared Resource Resolution**: Different import path strategies
3. **Environment Configuration**: Each app needs separate environment variables
4. **Cross-Application Dependencies**: Shared Supabase client and types
5. **Build Output Structure**: Different output formats and requirements

## Deployment Strategy

### Phase 1: Prepare Shared Resources

#### 1.1 Create Shared Package Configuration
```json
// shared/package.json
{
  "name": "@pinkytrust/shared",
  "version": "1.0.0",
  "main": "index.js",
  "types": "index.d.ts",
  "exports": {
    ".": "./index.js",
    "./components": "./components/index.js",
    "./lib": "./lib/index.js",
    "./types": "./types/index.js",
    "./utils": "./utils/index.js"
  }
}
```

#### 1.2 Build Shared Resources for Distribution
- Create build script for shared components
- Generate TypeScript declarations
- Ensure compatibility with both Next.js and Vite

### Phase 2: Application-Specific Deployment Configurations

#### 2.1 User App (Next.js PWA)
**Platform**: Vercel (already configured)
**Build Strategy**: Standalone output with shared resources

```dockerfile
# Enhanced Dockerfile for User App
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy shared resources first
FROM base AS deps
COPY shared/ ./shared/
COPY user-app/package*.json ./
RUN npm ci --only=production

FROM base AS builder
COPY shared/ ./shared/
COPY user-app/ ./
RUN npm ci && npm run build

FROM base AS runner
# Copy shared resources and built app
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# ... rest of configuration
```

#### 2.2 Municipal App (Next.js Admin)
**Platform**: Vercel or Docker
**Build Strategy**: Similar to User App with admin-specific configurations

```json
// municipal-app/vercel.json
{
  "version": 2,
  "name": "pinkytrust-municipal",
  "builds": [
    { "src": "next.config.js", "use": "@vercel/next" }
  ],
  "installCommand": "cd .. && npm install && cd municipal-app && npm install"
}
```

#### 2.3 Organiser App (Vite React)
**Platform**: Netlify or Vercel
**Build Strategy**: Static build with shared resource bundling

```typescript
// organiser-app/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'shared': path.resolve(__dirname, '../shared')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          shared: ['../shared/lib/supabase']
        }
      }
    }
  }
})
```

### Phase 3: Environment and Configuration Management

#### 3.1 Centralized Environment Template
```bash
# env.template
# Supabase Configuration (shared across all apps)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Application-specific
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

#### 3.2 Build-time Environment Injection
Each application will have its own environment configuration while sharing common Supabase settings.

### Phase 4: Deployment Automation

#### 4.1 Deployment Scripts

```bash
#!/bin/bash
# deploy-all.sh

echo "🚀 Deploying PinkyTrust Platform..."

# Build shared resources
echo "📦 Building shared resources..."
cd shared && npm run build && cd ..

# Deploy User App
echo "👤 Deploying User App..."
cd user-app
vercel --prod --env NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
cd ..

# Deploy Municipal App  
echo "🏛️ Deploying Municipal App..."
cd municipal-app
vercel --prod --env NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
cd ..

# Deploy Organiser App
echo "📋 Deploying Organiser App..."
cd organiser-app
npm run build
netlify deploy --prod --dir=dist
cd ..

echo "✅ All applications deployed successfully!"
```

#### 4.2 CI/CD Pipeline Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy All Applications

on:
  push:
    branches: [main]

jobs:
  deploy-shared:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Build shared resources
        run: |
          cd shared
          npm ci
          npm run build
      - name: Upload shared artifacts
        uses: actions/upload-artifact@v3
        with:
          name: shared-resources
          path: shared/dist

  deploy-user-app:
    needs: deploy-shared
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Download shared resources
        uses: actions/download-artifact@v3
        with:
          name: shared-resources
          path: shared/dist
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          working-directory: user-app

  deploy-municipal-app:
    needs: deploy-shared
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Download shared resources
        uses: actions/download-artifact@v3
        with:
          name: shared-resources
          path: shared/dist
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          working-directory: municipal-app

  deploy-organiser-app:
    needs: deploy-shared
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Download shared resources
        uses: actions/download-artifact@v3
        with:
          name: shared-resources
          path: shared/dist
      - name: Build and deploy
        run: |
          cd organiser-app
          npm ci
          npm run build
          npx netlify-cli deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Phase 5: Verification and Monitoring

#### 5.1 Post-Deployment Verification
- Health checks for all applications
- Shared resource accessibility tests
- Cross-application functionality verification
- Database connectivity validation

#### 5.2 Monitoring Setup
- Application performance monitoring
- Error tracking across all apps
- Shared resource usage analytics
- Database connection monitoring

## Implementation Steps

### Step 1: Prepare Shared Resources (Day 1)
1. Create shared package configuration
2. Set up build process for shared components
3. Update import paths in all applications
4. Test local builds with shared resources

### Step 2: Configure Individual Deployments (Day 2)
1. Update Dockerfile for User App
2. Configure Vercel settings for Municipal App
3. Set up Vite build for Organiser App
4. Test individual application deployments

### Step 3: Implement Automation (Day 3)
1. Create deployment scripts
2. Set up CI/CD pipeline
3. Configure environment management
4. Test automated deployment process

### Step 4: Deploy and Verify (Day 4)
1. Execute deployment for all applications
2. Verify shared resource accessibility
3. Test cross-application functionality
4. Monitor performance and errors

## Risk Mitigation

### Build Failures
- **Risk**: Shared resource build failures affecting all apps
- **Mitigation**: Separate build steps with fallback mechanisms

### Environment Conflicts
- **Risk**: Environment variable conflicts between applications
- **Mitigation**: Namespaced environment variables and validation

### Deployment Dependencies
- **Risk**: One app deployment failure affecting others
- **Mitigation**: Independent deployment processes with shared resource caching

### Shared Resource Updates
- **Risk**: Breaking changes in shared resources
- **Mitigation**: Versioned shared packages and gradual rollout

## Success Metrics

1. **All three applications successfully deployed** ✅
2. **Shared resources accessible from all apps** ✅
3. **No duplication of shared code in builds** ✅
4. **Consistent environment configuration** ✅
5. **Automated deployment pipeline functional** ✅
6. **Zero-downtime deployment capability** ✅

This strategy ensures that the monorepo structure benefits are maintained while successfully deploying all three applications with proper shared resource handling. 