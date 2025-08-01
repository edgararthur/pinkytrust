# PinkyTrust Platform Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying all three applications in the PinkyTrust monorepo while maintaining shared resource integrity and monorepo benefits.

## 🏗️ Architecture

### Applications
1. **User App** - Next.js PWA (Port 5432 dev, 6000 prod)
2. **Municipal App** - Next.js Admin Dashboard (Port 5172)
3. **Organiser App** - Vite React App (Port 3002)

### Shared Resources
- **Components**: UI components, authentication components
- **Libraries**: Supabase client, API utilities
- **Types**: Database types, Supabase types
- **Utils**: Shared utility functions

## 🚀 Quick Start

### Prerequisites
```bash
# Install required tools
npm install -g vercel@latest
npm install -g netlify-cli@latest

# Verify installations
node --version    # Should be 18+
npm --version
vercel --version
netlify --version
```

### One-Command Deployment
```bash
# Deploy all applications at once
./deploy-all.sh
```

## 📋 Step-by-Step Deployment

### Step 1: Environment Setup
```bash
# Copy environment template to each app
cp env.template user-app/.env.local
cp env.template municipal-app/.env.local  
cp env.template organiser-app/.env.local

# Edit each .env.local file with your actual values
```

### Step 2: Build Shared Resources
```bash
cd shared
npm install
npm run build
cd ..
```

### Step 3: Deploy Individual Applications

#### User App (PWA)
```bash
cd user-app
./deploy-production.sh
```

#### Municipal App (Admin)
```bash
cd municipal-app
./deploy-production.sh
```

#### Organiser App (Event Management)
```bash
cd organiser-app
./deploy-production.sh
```

## 🔧 Configuration Files

### Shared Resources (`shared/`)
- `package.json` - Package configuration for shared resources
- `tsconfig.json` - TypeScript configuration
- `index.ts` - Main export file

### User App (`user-app/`)
- `vercel.json` - Vercel deployment configuration (existing)
- `next.config.js` - Next.js configuration with PWA support
- `deploy-production.sh` - Individual deployment script

### Municipal App (`municipal-app/`)
- `vercel.json` - Vercel deployment configuration (new)
- `next.config.js` - Next.js configuration
- `deploy-production.sh` - Individual deployment script

### Organiser App (`organiser-app/`)
- `vite.config.ts` - Vite configuration with shared resource aliases
- `deploy-production.sh` - Individual deployment script

## 🌐 CI/CD Pipeline

### GitHub Actions
The `.github/workflows/deploy.yml` file provides automated deployment:

```yaml
# Triggered on push to main/production branches
# Builds shared resources first
# Deploys all three applications in parallel
# Verifies deployments
```

### Required Secrets
Set these in your GitHub repository settings:

```bash
# Vercel
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_USER_APP_PROJECT_ID=user_app_project_id
VERCEL_MUNICIPAL_APP_PROJECT_ID=municipal_app_project_id

# Netlify
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_ORGANISER_SITE_ID=organiser_site_id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔍 Verification

### Automated Verification
```bash
# Run comprehensive deployment verification
./verify-deployment.sh
```

### Manual Verification Checklist
- [ ] All three applications are accessible
- [ ] Shared Supabase client works across all apps
- [ ] Authentication flows work
- [ ] Cross-application data consistency
- [ ] PWA features work (User App)
- [ ] Admin features work (Municipal App)
- [ ] Event management features work (Organiser App)

## 📁 File Structure

```
pinkytrust/
├── shared/                          # Shared resources
│   ├── components/                  # Shared UI components
│   ├── lib/                        # Shared libraries
│   ├── types/                      # Shared TypeScript types
│   ├── utils/                      # Shared utilities
│   ├── package.json                # Shared package config
│   ├── tsconfig.json               # TypeScript config
│   └── index.ts                    # Main exports
├── user-app/                       # Next.js PWA
│   ├── deploy-production.sh        # Deployment script
│   ├── vercel.json                 # Vercel config
│   └── ...
├── municipal-app/                  # Next.js Admin
│   ├── deploy-production.sh        # Deployment script
│   ├── vercel.json                 # Vercel config
│   └── ...
├── organiser-app/                  # Vite React App
│   ├── deploy-production.sh        # Deployment script
│   ├── vite.config.ts              # Vite config
│   └── ...
├── .github/workflows/deploy.yml    # CI/CD pipeline
├── deploy-all.sh                   # Master deployment script
├── verify-deployment.sh            # Verification script
├── env.template                    # Environment template
├── DEPLOYMENT_STRATEGY.md          # Detailed strategy
└── DEPLOYMENT_README.md            # This file
```

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check shared resources first
cd shared && npm run build

# Check individual app builds
cd user-app && npm run build
cd municipal-app && npm run build  
cd organiser-app && npm run build
```

#### Environment Variables
```bash
# Verify environment files exist
ls -la */.*env*

# Check Vercel environment variables
vercel env ls

# Check Netlify environment variables
netlify env:list
```

#### Shared Resource Access
```bash
# Verify TypeScript can resolve shared imports
npm run type-check  # In each app directory

# Check shared resource builds
ls -la shared/dist/
```

### Getting Help
1. Check the deployment logs in your hosting provider dashboard
2. Run `./verify-deployment.sh` for comprehensive checks
3. Review the detailed strategy in `DEPLOYMENT_STRATEGY.md`
4. Check individual app deployment documentation

## 🔄 Updates and Maintenance

### Updating Shared Resources
```bash
# After making changes to shared resources
cd shared
npm run build

# Redeploy affected applications
./deploy-all.sh
```

### Rolling Back Deployments
```bash
# Vercel rollback
vercel rollback [deployment-url]

# Netlify rollback (via dashboard or CLI)
netlify sites:list
netlify api rollbackSiteDeploy --site-id [site-id] --deploy-id [deploy-id]
```

## 📊 Monitoring

### Built-in Monitoring
- **Vercel**: Analytics, performance metrics, error tracking
- **Netlify**: Deploy logs, form submissions, analytics
- **GitHub Actions**: Build status, deployment history

### Recommended External Tools
- **Sentry**: Error tracking across all apps
- **Google Analytics**: User behavior tracking
- **Uptime Robot**: Availability monitoring
- **Supabase Dashboard**: Database and auth monitoring

## 🎯 Success Metrics

After successful deployment, you should have:

✅ **All three applications deployed and accessible**
✅ **Shared resources working across all apps**
✅ **No code duplication in builds**
✅ **Consistent environment configuration**
✅ **Automated deployment pipeline**
✅ **Zero-downtime deployment capability**

## 🔐 Security Considerations

- Environment variables are properly configured
- HTTPS enforced on all applications
- Security headers applied via Next.js/Vercel
- Supabase RLS policies active
- API routes properly secured
- No sensitive data exposed to client-side

---

For detailed technical information, see `DEPLOYMENT_STRATEGY.md`. 