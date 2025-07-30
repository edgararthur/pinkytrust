# Deployment Guide

This guide covers deploying the Municipal Breast Cancer Awareness Platform to production environments.

## 🚀 Deployment Options

### 1. Vercel (Recommended)

Vercel provides the easiest deployment experience for Next.js applications.

#### Prerequisites
- Vercel account
- GitHub repository
- Supabase project configured

#### Steps

1. **Connect Repository**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Configure Environment Variables**
   
   In Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add the following variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

3. **Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

4. **Deploy**
   ```bash
   vercel --prod
   ```

### 2. Docker Deployment

For containerized deployments on any cloud provider.

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  municipal-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - municipal-app
    restart: unless-stopped
```

#### Build and Run

```bash
# Build the image
docker build -t municipal-app .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_service_key \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  municipal-app

# Or use docker-compose
docker-compose up -d
```

### 3. AWS Deployment

#### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Connect your GitHub repository
   - Select the main branch

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   Add in Amplify Console → App Settings → Environment Variables

#### Using EC2 + Load Balancer

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security groups: HTTP (80), HTTPS (443), SSH (22)

2. **Setup Script**
   ```bash
   #!/bin/bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Clone repository
   git clone <your-repo-url>
   cd municipal-app
   
   # Install dependencies
   npm ci --only=production
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "municipal-app" -- start
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 Production Configuration

### Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Next.js Configuration

Update `next.config.js` for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
    unoptimized: process.env.NODE_ENV === 'development'
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

## 🔒 Security Considerations

### SSL/TLS Configuration

1. **Obtain SSL Certificate**
   - Use Let's Encrypt for free certificates
   - Or use your cloud provider's certificate service

2. **Configure HTTPS Redirect**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

### Security Headers

Ensure these headers are set:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: default-src 'self'`

### Database Security

1. **Row Level Security**: Ensure RLS is enabled on all tables
2. **Connection Limits**: Configure appropriate connection limits
3. **Backup Strategy**: Set up automated backups
4. **Monitoring**: Enable database monitoring and alerts

## 📊 Monitoring & Logging

### Application Monitoring

1. **Vercel Analytics** (if using Vercel)
2. **Custom Error Tracking**
   ```javascript
   // Add to your error boundary
   if (process.env.NODE_ENV === 'production') {
     // Send to your monitoring service
     fetch('/api/errors', {
       method: 'POST',
       body: JSON.stringify(errorInfo)
     });
   }
   ```

### Performance Monitoring

1. **Core Web Vitals**: Monitor LCP, FID, CLS
2. **API Response Times**: Track database query performance
3. **Error Rates**: Monitor 4xx and 5xx responses

### Log Management

```javascript
// Production logging configuration
const logger = {
  info: (message, meta) => {
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify({ level: 'info', message, meta, timestamp: new Date().toISOString() }));
    }
  },
  error: (message, error) => {
    console.error(JSON.stringify({ level: 'error', message, error: error.stack, timestamp: new Date().toISOString() }));
  }
};
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all environment variables are set
   - Clear `.next` cache and rebuild

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Ensure RLS policies are correct

3. **Performance Issues**
   - Enable Next.js caching
   - Optimize images and assets
   - Use CDN for static assets

### Health Checks

Create a health check endpoint:

```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
}
```

## 📋 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database tables created and migrated
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Health checks configured
- [ ] Performance optimization applied
- [ ] Error tracking enabled
- [ ] Documentation updated

---

For additional support, refer to the [troubleshooting guide](./troubleshooting.md) or contact the development team.
