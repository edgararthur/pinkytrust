# Quick Deployment Guide

## 🚀 Deploy to Vercel (Manual Steps)

If the deployment scripts don't work, follow these manual steps:

### 1. Install Dependencies
```bash
npm install --force
```

### 2. Create Environment File
```bash
cp env.local.example .env.local
```

### 3. Deploy Using npx (No Global Installation Required)

**Option A: Production Deployment**
```bash
npx vercel --prod
```

**Option B: Preview Deployment**
```bash
npx vercel
```

### 4. Follow Vercel CLI Prompts

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (first time) or Yes (if exists)
- **Project name?** → `breast-cancer-user-app` or your preferred name
- **Directory?** → `.` (current directory)
- **Override settings?** → No (use default)

### 5. Set Environment Variables

After deployment, go to [Vercel Dashboard](https://vercel.com/dashboard):

1. Select your project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://jmqiojagmheikgqwepoj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcWlvamFnbWhlaWtncXdlcG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzUyNzIsImV4cCI6MjA2NzcxMTI3Mn0.ijL1Z9HejqkV-gZZZspM4C9IwclvFxqAnl8_wYulGzQ
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=Breast Cancer Awareness Platform
```

4. Click **Save** for each variable
5. Redeploy: `npx vercel --prod`

### 6. Test Your Deployment

Visit your Vercel URL and test:
- [ ] App loads
- [ ] Pages navigate correctly
- [ ] Authentication works (if configured)
- [ ] PWA features work

## 🔧 Troubleshooting

### TypeScript Errors
If you get TypeScript errors during build:

1. **Temporary Fix** - Modify `next.config.js`:
```javascript
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ... rest of config
};
```

2. **Proper Fix** - Fix the TypeScript errors in the codebase

### Permission Issues
- Use `npx vercel` instead of global installation
- Don't use `sudo` with npm commands

### Build Failures
- Run `npm install --force` to resolve dependency conflicts
- Check that all environment variables are set
- Ensure Supabase is accessible

## 📋 Useful Commands

```bash
# Check deployment status
npx vercel ls

# View deployment logs
npx vercel logs

# Add environment variable
npx vercel env add VARIABLE_NAME

# Remove deployment
npx vercel rm project-name

# Help
npx vercel --help
```

## 🌐 Next Steps

After successful deployment:
1. Configure custom domain (optional)
2. Set up monitoring and analytics
3. Test all functionality thoroughly
4. Fix TypeScript errors for production readiness
5. Set up CI/CD pipeline (optional) 