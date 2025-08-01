# 🚀 Quick GitHub Deployment Guide

## The Easiest Way to Deploy PinkyTrust

### Step 1: Push to GitHub (2 minutes)

```bash
# Initialize and push to GitHub
git init
git add .
git commit -m "PinkyTrust platform ready for deployment"
git remote add origin https://github.com/yourusername/pinkytrust.git
git push -u origin main
```

### Step 2: Deploy via Web Dashboards (5 minutes each)

## 📱 User App → Vercel
1. Go to [vercel.com](https://vercel.com) → "New Project"
2. Import your GitHub repo
3. **Set Root Directory**: `user-app`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click Deploy ✅

## 🏛️ Municipal App → Vercel  
1. Create another Vercel project
2. Same GitHub repo
3. **Set Root Directory**: `municipal-app`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click Deploy ✅

## 📋 Organiser App → Netlify
1. Go to [netlify.com](https://netlify.com) → "New site from Git"
2. Choose your GitHub repo
3. **Base directory**: `organiser-app`
4. **Build command**: `npm run build`
5. **Publish directory**: `organiser-app/dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click Deploy ✅

## ✅ Done!

That's it! All three applications will be deployed with:
- Automatic deployments on code changes
- Custom URLs provided by the platforms
- SSL certificates automatically configured
- No local CLI setup required

## 🔧 If You Prefer Command Line

Use the fixed deployment script:
```bash
./deploy-all.sh
```

The script now handles permission issues and provides multiple deployment options.

---

**GitHub deployment is the recommended approach - it's simpler and more reliable! 🎉** 