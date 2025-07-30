# Breast Cancer Awareness Platform - User App

A modern, responsive Progressive Web App (PWA) for breast cancer awareness, early detection, and community support.

## 🚀 Features

- **🔐 Authentication**: Secure user authentication with Supabase
- **📱 Responsive Design**: Mobile-first design that works on all devices
- **🏠 Dashboard**: Personalized health dashboard with statistics
- **📋 Self-Assessment**: Interactive health assessment tool
- **📅 Events**: Discover and register for local health events
- **👥 Community**: Connect with support groups and share experiences
- **📚 Awareness Content**: Educational resources and articles
- **📷 QR Scanner**: Check-in to events with QR codes
- **🌙 Dark Mode**: Full dark mode support
- **📱 PWA**: Installable as a native app
- **🔄 Offline Support**: Works offline with cached data
- **🎯 Analytics**: User behavior tracking and insights

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query (React Query)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React + Heroicons
- **Animations**: Framer Motion
- **Testing**: Vitest + Testing Library
- **PWA**: next-pwa
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Git

## 🏗️ Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd pinkytrust/user-app
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration

Copy the environment example file:

```bash
cp env.local.example .env.local
```

Update `.env.local` with your configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="Breast Cancer Awareness Platform"

# External Services (Optional)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

### 4. Database Setup

Run the SQL scripts in the `supabase/` directory to set up your database schema:

```sql
-- Run these in your Supabase SQL editor
-- 1. setup.sql - Creates tables and initial schema
-- 2. functions.sql - Creates database functions
```

### 5. Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 🧪 Testing

Run the test suite:

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start

# Analyze bundle size
npm run analyze
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to a Git repository
2. Connect your repository to [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Upload the `.next` folder and other necessary files to your server

3. Install dependencies on the server:
   ```bash
   npm ci --only=production
   ```

4. Start the application:
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## 📱 PWA Configuration

The app is configured as a Progressive Web App with:

- **Service Worker**: Automatic caching and offline support
- **Manifest**: App installation capabilities
- **Icons**: Multiple sizes for different devices
- **Splash Screens**: Custom startup screens
- **Offline Fallback**: Cached pages when offline

## 🔧 Configuration

### Tailwind CSS

The app uses a custom Tailwind configuration with:
- Custom color palette
- Extended spacing and sizing
- Mobile-first breakpoints
- Dark mode support
- Custom animations

### TypeScript

Strict TypeScript configuration with:
- Strict mode enabled
- Path aliases configured
- Comprehensive type definitions

## 📊 Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: React Query for server state caching
- **Compression**: Gzip compression enabled
- **Lazy Loading**: Components and routes

## 🔒 Security

- **Authentication**: Secure JWT-based auth with Supabase
- **CORS**: Properly configured CORS policies
- **Validation**: Client and server-side validation
- **Sanitization**: Input sanitization and XSS protection
- **HTTPS**: Enforced in production

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript checks
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run analyze` - Analyze bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run tests and linting
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

## 🔄 Updates

To update dependencies:

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions (carefully)
npx npm-check-updates -u
npm install
```

## 🏆 Best Practices

This application follows:
- **React Best Practices**: Hooks, context, performance optimization
- **Next.js Best Practices**: App Router, SSR/SSG, API routes
- **TypeScript Best Practices**: Strict typing, proper interfaces
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Core Web Vitals optimization
- **Security**: OWASP security guidelines 