# Backend Integration & Maintenance Guide

## Overview

The PinkyTrust application is built with a comprehensive backend integration system using Supabase as the primary backend service, with additional API routes for enhanced functionality and proper error handling.

## Architecture

### Backend Services

1. **Supabase Integration**
   - Authentication (Sign up, Sign in, User management)
   - Database operations (Events, Assessments, Community posts)
   - Real-time subscriptions
   - File storage

2. **Next.js API Routes**
   - `/api/health` - Health check endpoint
   - `/api/events` - Events CRUD operations
   - `/api/events/[id]` - Individual event operations
   - `/api/events/[id]/register` - Event registration
   - `/api/assessment` - Assessment operations
   - `/api/assessment/[userId]` - User-specific assessments

3. **API Service Layer**
   - Centralized API client (`lib/api-service.ts`)
   - Caching mechanism
   - Error handling and retry logic
   - Performance monitoring

## Key Components

### 1. API Service (`lib/api-service.ts`)

```typescript
// Usage example
import { apiService } from '@/lib/api-service';

// Get events with caching
const events = await apiService.getEvents();

// Register for event
await apiService.registerForEvent(eventId, userId);
```

**Features:**
- Automatic caching with TTL
- Error handling with fallback to cached data
- Performance monitoring
- Cache invalidation on mutations

### 2. App Maintenance (`lib/app-maintenance.ts`)

```typescript
// Usage example
import { appMaintenance } from '@/lib/app-maintenance';

// Start health monitoring
appMaintenance.startHealthMonitoring();

// Log errors
appMaintenance.logError(error, context);

// Run diagnostics
const report = await appMaintenance.runDiagnostics();
```

**Features:**
- Health monitoring
- Performance metrics collection
- Error logging and tracking
- Cache management
- Diagnostic reporting

### 3. Error Boundary (`components/ui/ErrorBoundary.tsx`)

Provides comprehensive error handling with:
- User-friendly error display
- Error logging to maintenance service
- Retry functionality
- Development error details

### 4. App Provider (`components/providers/AppProvider.tsx`)

Wraps the application with:
- React Query for data fetching
- Global error handling
- Performance monitoring
- Health check initialization

## API Endpoints

### Health Check
```
GET /api/health
```
Returns system health status and service availability.

### Events API
```
GET /api/events?category=screening&limit=20
POST /api/events
GET /api/events/[id]
PUT /api/events/[id]
DELETE /api/events/[id]
POST /api/events/[id]/register
DELETE /api/events/[id]/register?userId=123
```

### Assessment API
```
GET /api/assessment
POST /api/assessment
GET /api/assessment/[userId]?latest=true
```

## Environment Configuration

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="PinkyTrust"
NEXT_PUBLIC_APP_VERSION=1.0.0

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
API_SECRET_KEY=your_api_secret_key
```

## Monitoring & Maintenance

### Development Dashboard

In development mode, access the API Monitor Dashboard:
- Click the server icon in the bottom-left corner
- View real-time health status
- Monitor performance metrics
- Check cache statistics
- Clear application cache

### Health Monitoring

The application automatically:
- Performs health checks every 5 minutes
- Logs errors and performance metrics
- Monitors API response times
- Tracks cache usage

### Error Handling

Multi-layer error handling:
1. **API Level**: Retry logic and fallback to cached data
2. **Component Level**: Error boundaries catch React errors
3. **Global Level**: Unhandled promise rejections and errors
4. **User Level**: Friendly error messages and recovery options

## Best Practices

### 1. API Usage

```typescript
// ✅ Good: Use the API service with error handling
try {
  const events = await apiService.getEvents();
  setEvents(events);
} catch (error) {
  console.error('Failed to load events:', error);
  // Handle error appropriately
}

// ❌ Bad: Direct fetch without error handling
const response = await fetch('/api/events');
const events = await response.json();
```

### 2. Error Logging

```typescript
// ✅ Good: Log errors with context
appMaintenance.logError(error, {
  component: 'EventsList',
  action: 'loadEvents',
  userId: user?.id,
});

// ❌ Bad: Silent failures
try {
  // some operation
} catch (error) {
  // ignore error
}
```

### 3. Performance Monitoring

```typescript
// ✅ Good: Record performance metrics
appMaintenance.recordPerformanceMetric({
  timestamp: new Date().toISOString(),
  type: 'api_call',
  value: responseTime,
  metadata: { endpoint: '/api/events' },
});
```

## Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Check environment variables
   - Verify Supabase project status
   - Check network connectivity

2. **API Route Errors**
   - Check Next.js server logs
   - Verify API route implementations
   - Check request/response formats

3. **Cache Issues**
   - Use the development dashboard to clear cache
   - Check cache TTL settings
   - Verify cache key generation

### Debug Tools

1. **Development Dashboard**: Real-time monitoring
2. **React Query DevTools**: Query state inspection
3. **Browser DevTools**: Network and console logs
4. **Supabase Dashboard**: Database and auth logs

## Deployment Considerations

### Production Setup

1. **Environment Variables**: Ensure all required variables are set
2. **Health Monitoring**: Set up external monitoring
3. **Error Tracking**: Configure error reporting service
4. **Performance**: Monitor API response times
5. **Caching**: Configure appropriate cache TTLs

### Security

1. **API Keys**: Use environment variables
2. **CORS**: Configure allowed origins
3. **Rate Limiting**: Implement API rate limits
4. **Input Validation**: Validate all API inputs
5. **Authentication**: Secure all protected endpoints

## Maintenance Tasks

### Regular Tasks

1. **Health Checks**: Monitor system health
2. **Error Review**: Review error logs weekly
3. **Performance**: Monitor response times
4. **Cache**: Review cache hit rates
5. **Updates**: Keep dependencies updated

### Emergency Procedures

1. **Service Outage**: Check health dashboard
2. **High Error Rate**: Review error logs
3. **Performance Issues**: Check metrics
4. **Cache Problems**: Clear cache if needed

## Support

For issues or questions:
1. Check the development dashboard
2. Review error logs
3. Check Supabase status
4. Contact the development team

---

**Developed by GI-KACE**
