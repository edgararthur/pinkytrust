import { supabase } from './supabase';
import type { 
  Event, 
  AssessmentQuestion, 
  AssessmentAnswer, 
  RiskResult,
  CommunityPost, 
  AwarenessContent, 
  ScanHistory,
  User,
  ApiResponse,
  PaginatedResponse,
  EventFilters,
  ContentFilters
} from '@/types';

// Health check response type
interface HealthCheckResponse {
  status: 'healthy' | 'error' | 'unknown';
  services: Record<string, any>;
  version: string;
  timestamp: string;
  error?: string;
}

// Base API client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      // Check Supabase connection
      const { data: healthData, error: healthError } = await supabase
        .from('health_check')
        .select('*')
        .limit(1);

      if (healthError) {
        return {
          status: 'error',
          services: {
            database: 'error',
            auth: 'unknown'
          },
          version: 'unknown',
          timestamp: new Date().toISOString(),
          error: healthError.message
        };
      }

      // Check auth service
      const { data: authData, error: authError } = await supabase.auth.getSession();

      return {
        status: 'healthy',
        services: {
          database: 'healthy',
          auth: authError ? 'error' : 'healthy'
        },
        version: '1.0.0',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        services: {
          database: 'error',
          auth: 'error'
        },
        version: 'unknown',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }
}

export const apiClient = new ApiClient();

// Supabase API functions
export const authApi = {
  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  updateProfile: async (updates: Partial<User>) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    
    if (error) throw error;
    return data;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
};

export const eventsApi = {
  getEvents: async (filters?: EventFilters): Promise<Event[]> => {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          event_registrations(count)
        `)
        .order('date', { ascending: true });

      // Apply filters
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.date_from) {
        query = query.gte('date', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('date', filters.date_to);
      }

      if (filters?.search_query) {
        query = query.or(`title.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`);
      }

      // Legacy filter support
      if (filters?.date_range && filters.date_range !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.date_range) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = now;
        }

        query = query.gte('date', startDate.toISOString());
      }

      if (filters?.event_type && filters.event_type !== 'all') {
        query = query.eq('category', filters.event_type);
      }

      // Pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match frontend Event type
      const events: Event[] = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        endTime: event.end_time,
        location: event.location,
        address: event.address,
        category: event.category,
        type: event.type,
        price: parseFloat(event.price || '0'),
        maxAttendees: event.max_attendees,
        currentAttendees: event.current_attendees || 0,
        imageUrl: event.image_url,
        organizer: event.organizer,
        tags: event.tags || [],
        featured: event.featured || false,
        registrationRequired: event.registration_required || true,
        registrationUrl: event.registration_url,
        contactInfo: event.contact_info,
        requirements: event.requirements || [],
      }));

      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  getEvent: async (id: string): Promise<Event> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  registerForEvent: async (eventId: string, userId: string) => {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: userId,
        registered_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    return data;
  },

  unregisterFromEvent: async (eventId: string, userId: string) => {
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  getUserRegistrations: async (userId: string): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        events (*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data?.map(reg => reg.events).filter(Boolean) || [];
  },

  createEvent: async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> => {
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateEvent: async (id: string, updates: Partial<Event>): Promise<Event> => {
    const { data, error } = await supabase
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const assessmentApi = {
  getQuestions: async (): Promise<AssessmentQuestion[]> => {
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Transform data to match frontend AssessmentQuestion type
      const questions: AssessmentQuestion[] = (data || []).map(q => ({
        id: q.question_id,
        question: q.question,
        subtitle: q.subtitle,
        type: q.type as 'boolean' | 'number' | 'select' | 'multiselect' | 'scale',
        options: q.options,
        weight: q.weight,
        category: q.category as 'demographic' | 'family_history' | 'personal_history' | 'lifestyle' | 'symptoms' | 'concerns',
        helpText: q.help_text,
        help_text: q.help_text,
        image: q.image,
        image_url: q.image_url,
        min: q.min_value,
        max: q.max_value,
        unit: q.unit,
        required: q.required,
        supportiveMessage: q.supportive_message,
        warningMessage: q.warning_message,
        infoMessage: q.info_message,
        confidencePrompt: q.confidence_prompt,
        examples: q.examples,
        relatedResources: q.related_resources,
      }));

      return questions;
    } catch (error) {
      console.error('Error fetching assessment questions:', error);
      throw error;
    }
  },

  saveAssessment: async (
    userId: string, 
    answers: AssessmentAnswer[], 
    result: RiskResult
  ) => {
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        answers: answers,
        result: result,
        completed_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    return data;
  },

  getUserAssessments: async (userId: string) => {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getLatestAssessment: async (userId: string) => {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  },
};

export const communityApi = {
  getPosts: async (limit = 20, offset = 0): Promise<PaginatedResponse<CommunityPost>> => {
    try {
      const { data, error, count } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles(full_name, avatar_url)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Transform data to match frontend CommunityPost type
      const posts: CommunityPost[] = (data || []).map(post => ({
        id: post.id,
        author: {
          name: post.profiles?.full_name || 'Anonymous User',
          avatar: post.profiles?.avatar_url || '/images/default-avatar.png',
          isVerified: false, // Could be determined by user role
          role: 'Member', // Could come from user profile
        },
        content: post.content,
        timestamp: new Date(post.created_at).toLocaleDateString(),
        likes: post.likes || 0,
        comments: post.comments_count || 0,
        isLiked: false, // Would need to check user's likes
        imageUrl: post.image_url,
        tags: post.tags || [],
        type: post.type || 'post',
      }));

      return {
        data: posts,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          per_page: limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching community posts:', error);
      throw error;
    }
  },

  getGroups: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select('*')
        .order('member_count', { ascending: false });

      if (error) throw error;

      // Transform data to match frontend format
      const groups = (data || []).map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: group.member_count || 0,
        nextMeeting: group.next_meeting ? new Date(group.next_meeting).toLocaleDateString() : null,
        location: group.location,
        isJoined: false, // Would need to check user's memberships
        image: group.image_url,
        category: group.category,
      }));

      return groups;
    } catch (error) {
      console.error('Error fetching community groups:', error);
      throw error;
    }
  },

  createPost: async (post: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        ...post,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    return data;
  },

  likePost: async (postId: string, userId: string) => {
    const { data, error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    return data;
  },

  unlikePost: async (postId: string, userId: string) => {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },
};

export const awarenessApi = {
  getContent: async (filters?: ContentFilters): Promise<AwarenessContent[]> => {
    try {
      let query = supabase
        .from('awareness_content')
        .select('*')
        .order('published_date', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.search_query) {
        query = query.or(`title.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match frontend AwarenessContent type
      const content: AwarenessContent[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        content: item.content,
        category: item.category,
        type: item.type,
        difficulty: item.difficulty,
        readTime: item.read_time,
        author: item.author,
        publishedDate: item.published_date,
        imageUrl: item.image_url,
        videoUrl: item.video_url,
        audioUrl: item.audio_url,
        tags: item.tags || [],
        featured: item.featured || false,
        isNew: item.is_new || false,
        isPremium: item.is_premium || false,
        isExpertReviewed: item.is_expert_reviewed || false,
        medicalReviewDate: item.medical_review_date,
        language: item.language || 'English',
        accessibility: item.accessibility || {},
        engagement: item.engagement || { views: 0, likes: 0, shares: 0, comments: 0 },
        learningObjectives: item.learning_objectives || [],
        certificate: item.certificate || false,
        estimatedCompletionTime: item.estimated_completion_time,
      }));

      return content;
    } catch (error) {
      console.error('Error fetching awareness content:', error);
      throw error;
    }
  },

  getContentById: async (id: string): Promise<AwarenessContent> => {
    const { data, error } = await supabase
      .from('awareness_content')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  likeContent: async (contentId: string, userId: string) => {
    const { data, error } = await supabase
      .from('content_likes')
      .insert({
        content_id: contentId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    return data;
  },

  bookmarkContent: async (contentId: string, userId: string) => {
    const { data, error } = await supabase
      .from('content_bookmarks')
      .insert({
        content_id: contentId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    return data;
  },
};

export const scannerApi = {
  saveScanHistory: async (scanData: Omit<ScanHistory, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('scan_history')
      .insert({
        ...scanData,
        created_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    return data;
  },

  getScanHistory: async (userId: string): Promise<ScanHistory[]> => {
    const { data, error } = await supabase
      .from('scan_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
};

export const analyticsApi = {
  trackEvent: async (eventName: string, properties: Record<string, any>, userId?: string) => {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: eventName,
        properties,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });

    if (error) throw error;
    return data;
  },

  getUserStats: async (userId: string) => {
    const { data, error } = await supabase
      .rpc('get_user_health_stats', { user_id: userId });

    if (error) throw error;
    return data;
  },

  getEngagementMetrics: async (userId: string, timeRange: string = '30d') => {
    const { data, error } = await supabase
      .rpc('get_user_engagement_metrics', {
        user_id: userId,
        time_range: timeRange
      });

    if (error) throw error;
    return data;
  },

  getAppUsageStats: async (userId: string) => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_name, timestamp')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// Data synchronization utilities
export const syncApi = {
  syncUserData: async (userId: string) => {
    try {
      // Sync all user-related data
      const [assessments, posts, scanHistory, bookmarks] = await Promise.all([
        assessmentApi.getUserAssessments(userId),
        communityApi.getPosts(50, 0),
        scannerApi.getScanHistory(userId),
        awarenessApi.getContent({ user_id: userId })
      ]);

      return {
        assessments,
        posts: posts.data,
        scanHistory,
        bookmarks,
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Data sync failed:', error);
      throw error;
    }
  },

  uploadOfflineData: async (offlineData: any[]) => {
    const results = [];

    for (const item of offlineData) {
      try {
        let result;

        switch (item.type) {
          case 'assessment':
            result = await assessmentApi.saveAssessment(
              item.userId,
              item.answers,
              item.result
            );
            break;
          case 'community_post':
            result = await communityApi.createPost(item.data);
            break;
          case 'scan_history':
            result = await scannerApi.saveScanHistory(item.data);
            break;
          case 'analytics_event':
            result = await analyticsApi.trackEvent(
              item.eventName,
              item.properties,
              item.userId
            );
            break;
          default:
            console.warn('Unknown offline data type:', item.type);
            continue;
        }

        results.push({ success: true, id: item.id, result });
      } catch (error) {
        results.push({ success: false, id: item.id, error: error.message });
      }
    }

    return results;
  },
};

// Cache management
export const cacheApi = {
  clearUserCache: async (userId: string) => {
    // Clear user-specific cached data
    const cacheKeys = [
      `user_${userId}_assessments`,
      `user_${userId}_posts`,
      `user_${userId}_bookmarks`,
      `user_${userId}_stats`,
    ];

    if (typeof window !== 'undefined') {
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    }
  },

  getCachedData: (key: string, maxAge: number = 300000) => { // 5 minutes default
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);

      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  },

  setCachedData: (key: string, data: any) => {
    if (typeof window === 'undefined') return;

    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  },
};

// Error handling and retry logic
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (i === maxRetries) break;

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError;
};

// Batch operations
export const batchApi = {
  batchInsert: async (table: string, records: any[]) => {
    const { data, error } = await supabase
      .from(table)
      .insert(records);

    if (error) throw error;
    return data;
  },

  batchUpdate: async (table: string, updates: { id: string; data: any }[]) => {
    const promises = updates.map(({ id, data }) =>
      supabase
        .from(table)
        .update(data)
        .eq('id', id)
    );

    const results = await Promise.allSettled(promises);
    return results;
  },

  batchDelete: async (table: string, ids: string[]) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', ids);

    if (error) throw error;
  },
};