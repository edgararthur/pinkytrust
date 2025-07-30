# Breast Cancer Platform Setup Guide

This guide will walk you through setting up the complete Breast Cancer Platform, including all three applications and the Supabase backend.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm/yarn
- **Git** for version control
- **Supabase account** (free tier available)
- **Vercel account** (for deployment)
- **Mapbox account** (for maps functionality)

## Step 1: Clone and Setup Project Structure

```bash
# Clone the repository
git clone <repository-url>
cd pinkytrust

# Verify the project structure
ls -la
# You should see:
# - municipal-app/
# - user-app/
# - organiser-app/
# - shared/
# - supabase/
# - README.md
# - SETUP.md (this file)
```

## Step 2: Supabase Backend Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and set:
   - **Project Name**: `breast-cancer-platform`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Wait for project creation (2-3 minutes)

### 2.2 Configure Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase/setup.sql`
3. Click **Run** to execute the schema
4. Copy and paste the contents of `supabase/functions.sql`
5. Click **Run** to add the functions

### 2.3 Setup Authentication

1. Go to **Authentication > Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:3001` (for development)
   - **Redirect URLs**: Add your production URLs later
3. Enable **Email** authentication
4. Optional: Enable **Google OAuth** in **Authentication > Providers**

### 2.4 Setup Storage

1. Go to **Storage**
2. Create the following buckets:
   - `certificates` (public: false)
   - `documents` (public: false)
   - `flyers` (public: true)
   - `content-media` (public: true)
   - `profile-images` (public: true)

### 2.5 Get API Keys

1. Go to **Settings > API**
2. Copy the following values:
   - **Project URL**
   - **Anon/Public Key**
   - **Service Role Key** (keep this secret!)

## Step 3: Environment Configuration

Create environment files for each application:

### Municipal App Environment

```bash
# Create municipal-app/.env.local
cd municipal-app
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOL
```

### User App Environment

```bash
# Create user-app/.env.local
cd ../user-app
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
EOL
```

### Organiser App Environment

```bash
# Create organiser-app/.env.local
cd ../organiser-app
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
EOL
```

## Step 4: Install Dependencies

Install dependencies for each application:

```bash
# Municipal App
cd municipal-app
npm install

# User App
cd ../user-app
npm install

# Organiser App
cd ../organiser-app
npm install
```

## Step 5: Mapbox Setup

1. Sign up at [mapbox.com](https://www.mapbox.com)
2. Go to **Account > Access Tokens**
3. Create a new token with these scopes:
   - `styles:read`
   - `fonts:read`
   - `datasets:read`
   - `vision:read`
4. Add your domain restrictions for security
5. Copy the token and add it to your environment files

## Step 6: Development Setup

### 6.1 Start Development Servers

Open three terminal windows and start each app:

```bash
# Terminal 1 - Municipal App (port 3000)
cd municipal-app
npm run dev

# Terminal 2 - User App (port 3001)
cd user-app
npm run dev

# Terminal 3 - Organiser App (port 3002)
cd organiser-app
npm run dev
```

### 6.2 Access Applications

- **Municipal Office App**: http://localhost:3000
- **User App**: http://localhost:3001
- **Organiser App**: http://localhost:3002

### 6.3 Create Test Users

Go to your Supabase dashboard > Authentication > Users and create test accounts:

1. **Municipal User**:
   - Email: `municipal@test.com`
   - Password: `Test123!`
   - Update `users` table to set `role = 'municipal'`

2. **Organiser User**:
   - Email: `organiser@test.com`
   - Password: `Test123!`
   - Update `users` table to set `role = 'organiser'`

3. **Regular User**:
   - Email: `user@test.com`
   - Password: `Test123!`
   - Update `users` table to set `role = 'user'`

## Step 7: Production Deployment

### 7.1 Deploy to Vercel

For each application:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy Municipal App
cd municipal-app
vercel

# Deploy User App
cd ../user-app
vercel

# Deploy Organiser App
cd ../organiser-app
vercel
```

### 7.2 Configure Production Environment

1. In each Vercel project dashboard, go to **Settings > Environment Variables**
2. Add the same environment variables as in your `.env.local` files
3. Update Supabase **Site URL** and **Redirect URLs** with your production domains

### 7.3 Update Supabase Configuration

1. Go to **Authentication > Settings**
2. Update **Site URL** to your main app domain
3. Add all your production URLs to **Redirect URLs**:
   - `https://your-municipal-app.vercel.app/auth/callback`
   - `https://your-user-app.vercel.app/auth/callback`
   - `https://your-organiser-app.vercel.app/auth/callback`

## Step 8: Testing the Platform

### 8.1 Test User Flows

1. **Municipal Office App**:
   - Login with municipal user
   - Review organisation registrations
   - Issue certificates
   - View analytics

2. **User App**:
   - Register new user account
   - Browse awareness content
   - Take self-assessment
   - Find nearby events
   - Submit support request

3. **Organiser App**:
   - Login with organiser user
   - Create new event
   - Manage volunteers
   - Submit event report

### 8.2 Test PWA Features (User App)

1. Open User App in mobile browser
2. Add to home screen
3. Test offline functionality
4. Test push notifications (if configured)

## Step 9: Optional Enhancements

### 9.1 Email Notifications

1. Configure SendGrid or similar email service
2. Create Supabase Edge Function for email sending
3. Update notification triggers

### 9.2 SMS Notifications

1. Configure Twilio or similar SMS service
2. Create Supabase Edge Function for SMS sending
3. Update notification preferences

### 9.3 Push Notifications

1. Configure Firebase Cloud Messaging
2. Update PWA service worker
3. Implement push notification subscriptions

### 9.4 Analytics

1. Add Google Analytics or similar
2. Implement custom event tracking
3. Create analytics dashboard

## Step 10: Maintenance and Monitoring

### 10.1 Database Maintenance

- Monitor Supabase usage and performance
- Run `VACUUM` and `ANALYZE` regularly
- Monitor and optimize slow queries

### 10.2 Backup Strategy

- Enable Supabase automated backups
- Export critical data regularly
- Document recovery procedures

### 10.3 Security Updates

- Regularly update dependencies
- Monitor for security vulnerabilities
- Review and update RLS policies

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**:
   - Check environment variables
   - Verify project URL and API keys
   - Check network connectivity

2. **Authentication Issues**:
   - Verify redirect URLs
   - Check user roles in database
   - Clear browser cookies/localStorage

3. **Map Not Loading**:
   - Check Mapbox token
   - Verify token permissions
   - Check browser console for errors

4. **PWA Not Working**:
   - Check manifest.json
   - Verify HTTPS in production
   - Check service worker registration

### Getting Help

- Check Supabase documentation: https://supabase.com/docs
- Next.js documentation: https://nextjs.org/docs
- Create GitHub issue for platform-specific problems

## Security Considerations

1. **Environment Variables**:
   - Never commit `.env` files
   - Use different keys for development/production
   - Rotate keys regularly

2. **Database Security**:
   - Review RLS policies regularly
   - Monitor for suspicious activity
   - Use least-privilege access

3. **API Security**:
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS in production

4. **User Data**:
   - Follow GDPR/HIPAA guidelines
   - Implement data retention policies
   - Provide data export/deletion

## Support

For technical support:
- Email: support@breastcancerplatform.com
- Documentation: See individual app README files
- Issues: GitHub repository issues page 