import { supabase } from '@/lib/supabase';
import { requestManager } from './request-manager';

// Request cache and deduplication
const requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const pendingRequests = new Map<string, Promise<any>>();

// Rate limiting
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

export interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
}

export interface RealtimeSubscription {
  channel: any; // Changed from RealtimeChannel to any as RealtimeChannel is removed
  unsubscribe: () => void;
}

export class ApiError extends Error {
  code?: string;
  details?: any;
  statusCode?: number;

  constructor(message: string, code?: string, details?: any, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

export abstract class BaseApiService {
  public static async handleApiCall<T>(
    apiCall: () => Promise<T>,
    fallbackData: T,
    operationName: string,
    cacheKey?: string,
    cacheTTL: number = 30000 // 30 seconds default cache
  ): Promise<T> {
    // Use request manager for deduplication if cache key is provided
    const requestKey = cacheKey || `${operationName}:${Date.now()}`;

    return requestManager.executeRequest(
      requestKey,
      async () => {
    try {
      // Check cache first
      if (cacheKey && this.getCached<T>(cacheKey)) {
        const cached = this.getCached<T>(cacheKey);
        if (cached) return cached;
      }

      // Check rate limiting
      if (!this.checkRateLimit(operationName)) {
        console.warn(`Rate limit exceeded for ${operationName}, using fallback data`);
        return fallbackData;
      }

      // Check for pending request (deduplication)
      const requestKey = cacheKey || operationName;
      if (pendingRequests.has(requestKey)) {
        console.log(`Deduplicating request for ${operationName}`);
        return await pendingRequests.get(requestKey)!;
      }

      // Make the API call
      const requestPromise = apiCall();
      pendingRequests.set(requestKey, requestPromise);

      try {
        const result = await requestPromise;
        
        // Cache the result
        if (cacheKey) {
          this.setCached(cacheKey, result, cacheTTL);
        }
        
        return result;
      } finally {
        // Clean up pending request
        pendingRequests.delete(requestKey);
      }
    } catch (error) {
      console.warn(`${operationName} failed, using fallback data:`, error);
      return fallbackData;
    }
      },
      { enableDeduplication: !!cacheKey }
    );
  }

  private static checkRateLimit(operationName: string): boolean {
    const now = Date.now();
    const limiter = rateLimiter.get(operationName);

    if (!limiter || now > limiter.resetTime) {
      rateLimiter.set(operationName, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      return true;
    }

    if (limiter.count >= RATE_LIMIT_MAX_REQUESTS) {
      return false;
    }

    limiter.count++;
    return true;
  }

  private static getCached<T>(key: string): T | null {
    const cached = requestCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      requestCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private static setCached<T>(key: string, data: T, ttl: number = 30000): void {
    requestCache.set(key, { data, timestamp: Date.now(), ttl });
  }

  public static invalidateCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of requestCache.entries()) {
        if (regex.test(key)) {
          requestCache.delete(key);
        }
      }
    } else {
      requestCache.clear();
    }
  }

  // Batch API calls to reduce server load
  public static async batchApiCalls<T>(
    calls: Array<{ key: string; call: () => Promise<T>; fallback: T }>,
    cacheTTL: number = 30000
  ): Promise<Record<string, T>> {
    const results: Record<string, T> = {};
    const pendingCalls: Array<{ key: string; promise: Promise<T> }> = [];

    for (const { key, call, fallback } of calls) {
      // Check cache first
      const cached = this.getCached<T>(key);
      if (cached) {
        results[key] = cached;
        continue;
      }

      // Add to batch
      pendingCalls.push({
        key,
        promise: this.handleApiCall(call, fallback, key, key, cacheTTL)
      });
    }

    // Execute batch with controlled concurrency
    const batchSize = 3; // Limit concurrent requests
    for (let i = 0; i < pendingCalls.length; i += batchSize) {
      const batch = pendingCalls.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(async ({ key, promise }) => ({ key, result: await promise }))
      );

      batchResults.forEach((result, index) => {
        const { key } = batch[index];
        if (result.status === 'fulfilled') {
          results[key] = result.value.result;
        }
      });
    }

    return results;
  }

  protected static async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('organizations').select('count').limit(1);
      return !error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Enhanced error handling with proper error types
   */
  protected static handleError(error: any): never {
    if (error.code === 'PGRST116') {
      throw new ApiError('Resource not found', 'NOT_FOUND', error, 404);
    }
    
    if (error.code === 'PGRST301') {
      throw new ApiError('Unauthorized access', 'UNAUTHORIZED', error, 401);
    }
    
    if (error.code === 'PGRST204') {
      throw new ApiError('Forbidden', 'FORBIDDEN', error, 403);
    }
    
    if (error.code === '23505') {
      throw new ApiError('Resource already exists', 'CONFLICT', error, 409);
    }
    
    if (error.code === '23503') {
      throw new ApiError('Referenced resource not found', 'BAD_REQUEST', error, 400);
    }
    
    throw new ApiError(
      error.message || 'An unexpected error occurred',
      error.code || 'UNKNOWN_ERROR',
      error,
      500
    );
  }

  /**
   * Retry mechanism for failed API calls
   */
  protected static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const { maxRetries = 3, delay = 1000, backoff = true } = options;
    
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Don't retry on certain error types
        if (error instanceof ApiError && 
            ['NOT_FOUND', 'UNAUTHORIZED', 'FORBIDDEN', 'CONFLICT'].includes(error.code || '')) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const retryDelay = backoff ? delay * Math.pow(2, attempt) : delay;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Enhanced query builder with proper error handling
   */
  protected static async executeQuery<T>(
    queryBuilder: any,
    options: RetryOptions = {}
  ): Promise<T> {
    return this.withRetry(async () => {
      const { data, error } = await queryBuilder;
      
      if (error) {
        this.handleError(error);
      }
      
      return data;
    }, options);
  }

  /**
   * Enhanced paginated query with proper error handling
   */
  protected static async executePaginatedQuery<T>(
    queryBuilder: any,
    options: RetryOptions = {}
  ): Promise<{ data: T[]; count: number }> {
    return this.withRetry(async () => {
      const { data, error, count } = await queryBuilder;
      
      if (error) {
        this.handleError(error);
      }
      
      return { data: data || [], count: count || 0 };
    }, options);
  }

  /**
   * Real-time subscription helper
   */
  protected static subscribeToTable<T>(
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ): RealtimeSubscription {
    // Mock subscription for now, as RealtimeChannel is removed
    console.warn('Real-time subscription is not fully implemented in mock mode.');
    return {
      channel: null, // Mock channel
      unsubscribe: () => {
        console.log(`Unsubscribing from ${table} changes (mock)`);
      },
    };
  }

  /**
   * Real-time subscription for specific record
   */
  protected static subscribeToRecord<T>(
    table: string,
    id: string,
    callback: (payload: any) => void
  ): RealtimeSubscription {
    return this.subscribeToTable(table, callback, `id=eq.${id}`);
  }

  /**
   * Batch operations with transaction support
   */
  protected static async executeBatch<T>(
    operations: (() => Promise<any>)[]
  ): Promise<T[]> {
    const results: T[] = [];
    
    // Execute operations in sequence for now
    // In the future, we could use Supabase's batch operations
    for (const operation of operations) {
      try {
        const result = await operation();
        results.push(result);
      } catch (error) {
        // Rollback logic would go here
        throw error;
      }
    }
    
    return results;
  }

  /**
   * Activity logging with enhanced error handling
   */
  protected static async logActivity(
    action: string,
    resource: string,
    resourceId: string,
    resourceName?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.rpc('log_activity', {
          p_action: action,
          p_resource: resource,
          p_resource_id: resourceId,
          p_resource_name: resourceName || resourceId,
          p_user_id: user.id,
          p_user_name: user.user_metadata?.name || user.email || 'Unknown',
          p_user_email: user.email || 'unknown@example.com',
          p_details: details ? JSON.stringify(details) : null,
        });
      }
    } catch (error) {
      // Don't throw on activity logging errors
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Cache management utilities
   */
  protected static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  protected static getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  protected static setCached<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  protected static invalidateCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of this.cache.entries()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Validation helpers
   */
  protected static validateRequired(data: Record<string, any>, fields: string[]): void {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new ApiError(
        `Missing required fields: ${missing.join(', ')}`,
        'VALIDATION_ERROR',
        { missingFields: missing },
        400
      );
    }
  }

  protected static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * File upload helper
   */
  protected static async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: { upsert?: boolean }
  ): Promise<string> {
    // Mock file upload for now
    console.warn('File upload is not fully implemented in mock mode.');
    return `https://example.com/uploads/${path}`; // Return a dummy URL
  }

  /**
   * File deletion helper
   */
  protected static async deleteFile(bucket: string, path: string): Promise<void> {
    // Mock file deletion for now
    console.warn('File deletion is not fully implemented in mock mode.');
    console.log(`Mock deleting file from bucket ${bucket}: ${path}`);
  }
}

// Mock data generators
export const mockData = {
  organizations: [
    {
      id: '1',
      name: 'Health Community Center',
      email: 'contact@healthcenter.org',
      phone: '+1-555-0123',
      address: '123 Health Street, City, State 12345',
      organization_type: 'healthcare' as const,
      status: 'approved' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      approved_by: 'admin',
      website: 'https://healthcenter.org',
      description: 'Community health center providing breast cancer screening services',
      contact_person: 'Dr. Sarah Johnson',
      services_offered: ['screening', 'education', 'support'],
      operating_hours: 'Mon-Fri 8AM-6PM',
      capacity: 50,
      certifications: ['ISO 9001', 'HIPAA Compliant'],
      social_media: {
        facebook: 'healthcenter',
        twitter: '@healthcenter',
        instagram: 'healthcenter_official'
      }
    },
    {
      id: '2',
      name: 'Women\'s Wellness Foundation',
      email: 'info@womenswellness.org',
      phone: '+1-555-0456',
      address: '456 Wellness Ave, City, State 12345',
      organization_type: 'ngo' as const,
      status: 'pending' as const,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      approved_at: null,
      approved_by: null,
      website: 'https://womenswellness.org',
      description: 'Non-profit organization focused on women\'s health education',
      contact_person: 'Maria Rodriguez',
      services_offered: ['education', 'support'],
      operating_hours: 'Mon-Sat 9AM-5PM',
      capacity: 30,
      certifications: ['501(c)(3)', 'State Licensed'],
      social_media: {
        facebook: 'womenswellness',
        instagram: 'womens_wellness_foundation'
      }
    },
    {
      id: '3',
      name: 'Rejected Organization',
      email: 'rejected@example.org',
      phone: '+1-555-0789',
      address: '789 Example St, City, State 12345',
      organization_type: 'healthcare' as const,
      status: 'rejected' as const,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
      approved_at: null,
      approved_by: null,
      website: null,
      description: 'Test rejected organization',
      contact_person: 'John Doe',
      services_offered: ['screening'],
      operating_hours: 'Mon-Fri 9AM-5PM',
      capacity: 20,
      certifications: [],
      social_media: null
    }
  ],

  certificates: [
    {
      id: '1',
      certificate_number: 'CERT-2024-001',
      organization_id: '1',
      certificate_type: 'screening' as const,
      status: 'active' as const,
      issue_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      issued_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      document_url: 'https://example.com/certificate.pdf',
      notes: 'Initial screening certification',
      organization_name: 'Health Community Center',
      organization_email: 'contact@healthcenter.org'
    },
    {
      id: '2',
      certificate_number: 'CERT-2024-002',
      organization_id: '2',
      certificate_type: 'education' as const,
      status: 'pending' as const,
      issue_date: null,
      expiry_date: null,
      issued_by: null,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      document_url: null,
      notes: 'Pending approval for education certification',
      organization_name: 'Women\'s Wellness Foundation',
      organization_email: 'info@womenswellness.org'
    },
    {
      id: '3',
      certificate_number: 'CERT-2024-003',
      organization_id: '1',
      certificate_type: 'support' as const,
      status: 'expired' as const,
      issue_date: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
      expiry_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      issued_by: 'admin',
      created_at: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      document_url: null,
      notes: 'Expired support certification',
      organization_name: 'Health Community Center',
      organization_email: 'contact@healthcenter.org'
    },
    {
      id: '4',
      certificate_number: 'CERT-2024-004',
      organization_id: '2',
      certificate_type: 'general' as const,
      status: 'revoked' as const,
      issue_date: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      expiry_date: new Date(Date.now() + 165 * 24 * 60 * 60 * 1000).toISOString(),
      issued_by: 'admin',
      created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      document_url: null,
      notes: 'Revoked due to compliance issues',
      organization_name: 'Women\'s Wellness Foundation',
      organization_email: 'info@womenswellness.org'
    }
  ],

  events: [
    {
      id: '1',
      title: 'Breast Cancer Awareness Workshop',
      description: 'Educational workshop on breast cancer prevention and early detection',
      event_type: 'workshop' as const,
      organization_id: '1',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      location: 'Health Community Center',
      capacity: 50,
      current_participants: 25,
      status: 'approved' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      approved_by: 'admin',
      requirements: ['Registration required', 'Bring ID'],
      contact_email: 'events@healthcenter.org',
      contact_phone: '+1-555-0123',
      organization_name: 'Health Community Center'
    }
  ],

  reports: [
    {
      id: '1',
      title: 'Monthly Screening Report - December 2024',
      organization_id: '1',
      report_type: 'screening' as const,
      status: 'approved' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'admin',
      content: {
        summary: 'Comprehensive monthly screening report',
        statistics: {
          total_screenings: 150,
          positive_results: 5,
          follow_ups_required: 8,
          completed_follow_ups: 6
        },
        feedback: 'Excellent performance this month',
        recommendations: 'Continue current screening protocols',
        expenses: {
          total: 5000,
          breakdown: {
            equipment: 2000,
            staff: 2500,
            supplies: 500
          }
        }
      },
      attachments: ['screening_data.pdf', 'monthly_summary.xlsx'],
      organization_name: 'Health Community Center'
    },
    {
      id: '2',
      title: 'Quarterly Education Report - Q4 2024',
      organization_id: '2',
      report_type: 'education' as const,
      status: 'pending' as const,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      submitted_at: new Date(Date.now() - 86400000).toISOString(),
      reviewed_at: null,
      reviewed_by: null,
      content: {
        summary: 'Quarterly education program report',
        statistics: {
          total_participants: 200,
          completion_rate: 85,
          satisfaction_score: 4.2
        },
        feedback: 'Good engagement from participants',
        recommendations: 'Expand program to reach more communities',
        expenses: {
          total: 3000,
          breakdown: {
            materials: 1000,
            staff: 1500,
            venue: 500
          }
        }
      },
      attachments: ['education_report.pdf'],
      organization_name: 'Women\'s Wellness Foundation'
    },
    {
      id: '3',
      title: 'Annual Support Services Report - 2024',
      organization_id: '1',
      report_type: 'support' as const,
      status: 'rejected' as const,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
      submitted_at: new Date(Date.now() - 172800000).toISOString(),
      reviewed_at: new Date(Date.now() - 86400000).toISOString(),
      reviewed_by: 'admin',
      content: {
        summary: 'Annual support services report',
        statistics: {
          total_clients: 50,
          active_cases: 30,
          resolved_cases: 20
        },
        feedback: 'Needs improvement in documentation',
        recommendations: 'Improve case tracking and documentation',
        expenses: {
          total: 8000,
          breakdown: {
            counseling: 4000,
            materials: 2000,
            administration: 2000
          }
        }
      },
      attachments: ['support_report.pdf'],
      organization_name: 'Health Community Center'
    }
  ]
}; 