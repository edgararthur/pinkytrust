# Breast Cancer Awareness Platform

A comprehensive, multi-application platform designed to support breast cancer awareness, early detection, and community engagement. The platform consists of three interconnected Next.js applications serving different user types and use cases.

## 🏗️ Architecture Overview

### Applications

1. **User App** (Mobile-First PWA) - Port 3001
   - Mobile-optimized progressive web application
   - Self-assessment tools and risk evaluation
   - Event discovery and QR code check-ins
   - Community engagement and support
   - Awareness content and educational resources

2. **Municipal Office App** (Admin Dashboard) - Port 3000
   - Administrative oversight and management
   - Organisation registration and approval
   - Certificate management and tracking
   - Event monitoring and report review
   - User management and platform analytics

3. **Organiser App** (Event Management) - Port 3002
   - Event creation and management
   - Volunteer coordination and invitations
   - Report generation and submission
   - Analytics and performance tracking

## ✨ Features Overview

### User App Features
- **Home Dashboard**: Personalized greeting and quick actions
- **Self Assessment**: Comprehensive breast cancer risk assessment
- **Event Discovery**: Location-based event finder with filters
- **QR Scanner**: Event check-in with camera integration
- **Community**: Posts, support groups, and survivor stories
- **Awareness Content**: Educational articles with categories and search
- **PWA Support**: Offline capability and app-like experience

### Municipal App Features
- **Dashboard**: Platform statistics and activity overview
- **Organisation Management**: Registration review and approval
- **Certificate Management**: Issue, renew, and track certificates
- **Event Oversight**: Monitor events across the region
- **Report Review**: Approve or reject event reports
- **User Management**: Manage municipal staff and permissions
- **Analytics**: Comprehensive platform performance metrics

### Organiser App Features
- **Dashboard**: Event and volunteer overview
- **Event Management**: Create, edit, and manage events
- **Volunteer Coordination**: Invite and manage volunteers
- **Report Generation**: Create detailed event reports
- **Analytics**: Event performance and volunteer engagement

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend services)
- Mapbox account (for maps functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pinkytrust
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env.local
   
   # Edit .env.local with your actual values
   nano .env.local
   ```

3. **Install dependencies for all applications**
   ```bash
   # User App
   cd user-app
   npm install
   cd ..
   
   # Municipal App
   cd municipal-app
   npm install
   cd ..
   
   # Organiser App
   cd organiser-app
   npm install
   cd ..
   ```

4. **Set up the database** (see SETUP.md for detailed instructions)
   ```bash
   # Run the Supabase setup scripts
   # Follow instructions in SETUP.md
   ```

5. **Start all applications**
   ```bash
   # Terminal 1 - User App (PWA)
   cd user-app && npm run dev
   
   # Terminal 2 - Municipal App
   cd municipal-app && npm run dev
   
   # Terminal 3 - Organiser App  
   cd organiser-app && npm run dev
   ```

6. **Access the applications**
   - User App: http://localhost:3001
   - Municipal App: http://localhost:3000
   - Organiser App: http://localhost:3002

## 🛠️ Development

### Build Commands
```bash
# Build individual applications
cd user-app && npm run build
cd municipal-app && npm run build
cd organiser-app && npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Heroicons
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Charts**: Recharts
- **Maps**: Mapbox GL JS
- **PWA**: next-pwa
- **Forms**: Formik + Yup validation
- **State**: React hooks, SWR for data fetching

## 📱 Application Details

### User App (Mobile PWA)
- **Target Users**: General public, individuals seeking health information
- **Key Features**: Assessment tools, event discovery, community engagement
- **Design**: Mobile-first, touch-optimized, offline-capable
- **PWA Features**: Installation prompt, offline functionality, push notifications

### Municipal App (Admin Dashboard)
- **Target Users**: Municipal health officials, administrators
- **Key Features**: Platform oversight, organisation management, analytics
- **Design**: Desktop-optimized, data-dense interfaces
- **Access Control**: Role-based permissions, secure admin functions

### Organiser App (Event Management)
- **Target Users**: Health organisations, event coordinators
- **Key Features**: Event creation, volunteer management, reporting
- **Design**: Desktop-first with mobile responsiveness
- **Workflow**: Complete event lifecycle management

## 🔐 Security & Authentication

- JWT-based authentication via Supabase
- Row-level security (RLS) policies
- Role-based access control (RBAC)
- Input validation and sanitization
- HTTPS enforcement in production

## 📊 Database Schema

The platform uses a comprehensive PostgreSQL schema with:
- User management and roles
- Organisation registration and verification
- Event lifecycle management
- Certificate tracking
- Report generation and approval
- Analytics and metrics collection

See `supabase/` directory for complete schema and setup scripts.

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Production environment variables
   NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   ```

2. **Build for Production**
   ```bash
   # Build all applications
   cd user-app && npm run build
   cd ../municipal-app && npm run build  
   cd ../organiser-app && npm run build
   ```

3. **Deploy to Vercel (Recommended)**
   ```bash
   # Deploy each application separately
   cd user-app && vercel deploy --prod
   cd ../municipal-app && vercel deploy --prod
   cd ../organiser-app && vercel deploy --prod
   ```

### Docker Deployment
```bash
# Build Docker images (if Dockerfiles are available)
docker-compose up -d
```

## 📋 Production Checklist

- [ ] Environment variables configured
- [ ] Supabase database setup completed
- [ ] SSL certificates configured
- [ ] Domain names configured
- [ ] Analytics and monitoring setup
- [ ] Backup strategies implemented
- [ ] Security headers configured
- [ ] PWA manifest and service worker tested

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the SETUP.md for detailed setup instructions
- Review the API_DOCUMENTATION.md for API details
- Create an issue in the repository
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with all three applications
  - Complete user authentication and registration
  - Full event management lifecycle
  - Community features and content management
  - Administrative oversight and analytics
  - PWA capabilities for mobile users

---

**Built with ❤️ for breast cancer awareness and early detection** # pinkytrust
# pinkytrust
# pinkytrust
