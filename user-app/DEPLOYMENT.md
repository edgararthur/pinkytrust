# User App Deployment Guide - Vercel

This guide will help you deploy the Breast Cancer Awareness Platform User App to Vercel.

## Prerequisites

- [Vercel Account](https://vercel.com)
- [Vercel CLI](https://vercel.com/cli) installed globally
- Node.js 18+ installed
- Supabase project set up

## Quick Deployment

### Option 1: Using the Deployment Script (Recommended)

```bash
# Make sure you're in the user-app directory
cd user-app

# Run the Vercel deployment script
./deploy-vercel.sh
```

### Option 2: Manual Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Environment Variables Setup

### Required Environment Variables

Add these environment variables in your Vercel project settings:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://jmqiojagmheikgqwepoj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcWlvamFnbWhlaWtncXdlcG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzUyNzIsImV4cCI6MjA2NzcxMTI3Mn0.ijL1Z9HejqkV-gZZZspM4C9IwclvFxqAnl8_wYulGzQ

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=Breast Cancer Awareness Platform
```

### Optional Environment Variables

```bash
# External Services
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
```

## Setting Environment Variables in Vercel

### Via Vercel Dashboard

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with its value
5. Select the appropriate environments (Production, Preview, Development)

### Via Vercel CLI

```bash
# Add environment variables via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_APP_URL
# ... add other variables
```

## Project Configuration

The project includes several configuration files optimized for Vercel:

- `vercel.json` - Vercel-specific configuration
- `next.config.js` - Next.js configuration with PWA support
- `package.json` - Dependencies and build scripts

## Deployment Steps

### 1. Pre-deployment Checklist

- [ ] Supabase project is set up and running
- [ ] Environment variables are configured
- [ ] All dependencies are installed
- [ ] Code passes type checking and linting
- [ ] Local build succeeds

### 2. Deploy to Vercel

```bash
# For production deployment
vercel --prod

# For preview deployment
vercel

# For development preview
vercel --dev
```

### 3. Post-deployment Verification

After deployment, verify:

- [ ] App loads correctly
- [ ] PWA functionality works
- [ ] Supabase connection is working
- [ ] Authentication flows work
- [ ] All pages are accessible
- [ ] Mobile responsiveness
- [ ] Performance metrics are good

## Domain Configuration

### Custom Domain Setup

1. **Add Domain in Vercel**:
   ```bash
   vercel domains add yourdomain.com
   ```

2. **Configure DNS**:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or add A record pointing to Vercel's IP

3. **Update Environment Variables**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

## PWA Configuration

The app is configured as a Progressive Web App with:

- Service Worker for offline functionality
- Web App Manifest for installation
- Optimized caching strategies
- Push notification support (when configured)

### PWA Verification

After deployment, test:
- [ ] App can be installed on mobile devices
- [ ] Offline functionality works
- [ ] App icons display correctly
- [ ] Splash screen appears

## Performance Optimization

The deployment includes several optimizations:

- **Bundle Splitting**: Automatic code splitting
- **Image Optimization**: Next.js Image component
- **Compression**: Gzip compression enabled
- **Caching**: Optimized caching headers
- **PWA Caching**: Service worker caching

## Monitoring and Analytics

### Built-in Monitoring

Vercel provides built-in monitoring:
- Performance metrics
- Error tracking
- Analytics dashboard

### External Monitoring (Optional)

Configure external services:
- Google Analytics
- Sentry for error tracking
- Custom monitoring solutions

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check TypeScript errors
   - Verify all dependencies are installed
   - Check environment variables

2. **Runtime Errors**:
   - Verify Supabase connection
   - Check environment variables in production
   - Review browser console for errors

3. **PWA Issues**:
   - Ensure HTTPS is enabled
   - Check service worker registration
   - Verify manifest.json

### Getting Help

- Check Vercel documentation
- Review build logs in Vercel dashboard
- Check browser developer tools
- Verify Supabase connectivity

## Deployment Commands Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project to Vercel
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Add environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls

# Remove environment variable
vercel env rm VARIABLE_NAME

# Add custom domain
vercel domains add yourdomain.com

# List domains
vercel domains ls
```

## Security Considerations

- Environment variables are properly configured
- HTTPS is enforced in production
- Security headers are set via `next.config.js`
- Sensitive data is not exposed to client-side

## Backup and Recovery

- Vercel automatically keeps deployment history
- Source code should be backed up in Git repository
- Database backups should be managed via Supabase
- Environment variables should be documented and backed up

---

For more detailed information, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs) 