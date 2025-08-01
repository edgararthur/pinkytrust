# GitHub Deployment Guide - PinkyTrust Platform

## 🚀 Deploy from GitHub Repository

Yes! You can absolutely push your repo to GitHub and deploy each application individually from there. This is often the easiest and most reliable method.

## 📋 Step-by-Step GitHub Deployment

### Step 1: Push to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - PinkyTrust platform ready for deployment"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/pinkytrust.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy Each Application

## 🎯 User App (Next.js PWA) - Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. **Important**: Set the root directory to `user-app`
5. Configure environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```
6. Deploy!

### Option B: Vercel CLI from Repository
```bash
cd user-app
npx vercel@latest
# Follow the prompts to link to your GitHub repo
npx vercel@latest --prod
```

## 🏛️ Municipal App (Next.js Admin) - Deploy to Vercel

### Vercel Dashboard Method:
1. Create another new project in Vercel
2. Import the same GitHub repository
3. **Important**: Set the root directory to `municipal-app`
4. Configure environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=https://municipal.your-domain.com
   ```
5. Deploy!

## 📋 Organiser App (Vite React) - Deploy to Netlify

### Option A: Netlify Dashboard (Recommended)
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose your GitHub repository
4. Configure build settings:
   - **Base directory**: `organiser-app`
   - **Build command**: `npm run build`
   - **Publish directory**: `organiser-app/dist`
5. Configure environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_APP_URL=https://organiser.your-domain.com
   ```
6. Deploy!

### Option B: Netlify CLI
```bash
cd organiser-app
npm install -g netlify-cli  # or use npx
netlify login
netlify init
netlify deploy --prod
```

### Option C: Deploy to Vercel (Alternative)
You can also deploy the Organiser App to Vercel:
1. Create new Vercel project
2. Set root directory to `organiser-app`
3. Vercel will auto-detect it's a Vite project
4. Deploy!

## 🔄 Automated Deployment with GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys all applications when you push to the main branch.

### Setup GitHub Actions:
1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add the following secrets:

```bash
# Vercel Secrets
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_USER_APP_PROJECT_ID=user_app_project_id
VERCEL_MUNICIPAL_APP_PROJECT_ID=municipal_app_project_id

# Netlify Secrets
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_ORGANISER_SITE_ID=organiser_site_id

# Supabase Secrets
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Push to main branch to trigger automatic deployment!

## 🌐 Alternative Hosting Platforms

### For Next.js Apps (User & Municipal):
- **Railway**: Connect GitHub repo, set root directory
- **Render**: Static site or web service deployment
- **DigitalOcean App Platform**: GitHub integration available
- **AWS Amplify**: Full-stack deployment with GitHub

### For Vite App (Organiser):
- **GitHub Pages**: Free static hosting
- **Surge.sh**: Simple static deployment
- **Firebase Hosting**: Google's static hosting
- **Cloudflare Pages**: Fast global deployment

## 📊 Deployment Comparison

| Platform | Best For | Pros | Cons |
|----------|----------|------|------|
| **Vercel** | Next.js apps | Excellent Next.js support, fast | Limited free tier |
| **Netlify** | Static sites | Great for Vite/React, generous free tier | Less optimal for Next.js |
| **GitHub Actions** | Automation | Full control, free for public repos | Requires setup |
| **Railway** | Full-stack | Simple deployment, good for monorepos | Newer platform |

## 🔧 Troubleshooting GitHub Deployment

### Common Issues:

1. **Build fails due to shared resources**:
   ```bash
   # Add this to your build command
   cd .. && npm run build:shared && cd your-app-name && npm run build
   ```

2. **Environment variables not working**:
   - Make sure they're prefixed correctly (`NEXT_PUBLIC_` for Next.js, `VITE_` for Vite)
   - Check they're set in the hosting platform's dashboard

3. **Monorepo not detected properly**:
   - Always set the correct root directory in your hosting platform
   - For GitHub Actions, use `working-directory` in workflow steps

## 🎯 Recommended Deployment Strategy

### For Beginners:
1. **User App**: Vercel Dashboard → Import from GitHub
2. **Municipal App**: Vercel Dashboard → Import from GitHub  
3. **Organiser App**: Netlify Dashboard → Import from GitHub

### For Advanced Users:
1. Set up GitHub Actions for automated deployment
2. Use custom domains
3. Set up monitoring and alerts
4. Implement staging environments

## 📋 Post-Deployment Checklist

- [ ] All three applications are accessible
- [ ] Environment variables are configured
- [ ] Custom domains set up (if needed)
- [ ] SSL certificates are active
- [ ] Database connections working
- [ ] Authentication flows working
- [ ] Cross-application functionality tested

## 🎉 Benefits of GitHub Deployment

✅ **Automatic deployments** on code changes  
✅ **Version control** and rollback capabilities  
✅ **Team collaboration** with pull requests  
✅ **Branch-based deployments** for testing  
✅ **No local CLI setup required**  
✅ **Platform-specific optimizations** automatically applied  

---

**Ready to deploy from GitHub? Push your code and start deploying! 🚀** 