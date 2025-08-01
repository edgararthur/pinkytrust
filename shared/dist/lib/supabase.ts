import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  signInWithProvider: async (provider: 'google' | 'github') => {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  },

  updatePassword: async (password: string) => {
    return await supabase.auth.updateUser({ password });
  },

  updateProfile: async (updates: any) => {
    return await supabase.auth.updateUser({
      data: updates,
    });
  },
};

// Database helpers
export const db = {
  // Users
  users: {
    getById: (id: string) =>
      supabase.from('users').select('*').eq('user_id', id).single(),
    
    getByEmail: (email: string) =>
      supabase.from('users').select('*').eq('email', email).single(),
    
    getByRole: (role: string) =>
      supabase.from('users').select('*').eq('role', role),
    
    create: (user: any) =>
      supabase.from('users').insert(user).select().single(),
    
    update: (id: string, updates: any) =>
      supabase.from('users').update(updates).eq('user_id', id).select().single(),
    
    delete: (id: string) =>
      supabase.from('users').delete().eq('user_id', id),
  },

  // Organisations
  organisations: {
    getAll: () =>
      supabase.from('organisations').select('*').order('created_at', { ascending: false }),
    
    getById: (id: string) =>
      supabase.from('organisations').select('*').eq('organisation_id', id).single(),
    
    getByStatus: (status: string) =>
      supabase.from('organisations').select('*').eq('registration_status', status),
    
    getApproved: () =>
      supabase.from('organisations').select('*').eq('registration_status', 'approved'),
    
    create: (org: any) =>
      supabase.from('organisations').insert(org).select().single(),
    
    update: (id: string, updates: any) =>
      supabase.from('organisations').update(updates).eq('organisation_id', id).select().single(),
    
    delete: (id: string) =>
      supabase.from('organisations').delete().eq('organisation_id', id),
    
    search: (query: string) =>
      supabase.from('organisations')
        .select('*')
        .or(`name.ilike.%${query}%, contact_email.ilike.%${query}%`),
  },

  // Events
  events: {
    getAll: () =>
      supabase.from('events')
        .select(`
          *,
          organisation:organisations(*),
          creator:users(first_name, last_name, email)
        `)
        .order('start_date', { ascending: true }),
    
    getById: (id: string) =>
      supabase.from('events')
        .select(`
          *,
          organisation:organisations(*),
          creator:users(first_name, last_name, email),
          attendees:event_attendees(*, user:users(first_name, last_name, email)),
          volunteers:volunteers(*, user:users(first_name, last_name, email))
        `)
        .eq('event_id', id)
        .single(),
    
    getByOrganisation: (orgId: string) =>
      supabase.from('events')
        .select('*, organisation:organisations(*)')
        .eq('organisation_id', orgId)
        .order('start_date', { ascending: true }),
    
    getActive: () =>
      supabase.from('events')
        .select('*, organisation:organisations(*)')
        .in('status', ['planned', 'ongoing'])
        .order('start_date', { ascending: true }),
    
    getNearby: (lat: number, lng: number, radius: number) =>
      supabase.rpc('get_nearby_events', {
        lat,
        lng,
        radius_km: radius,
      }),
    
    create: (event: any) =>
      supabase.from('events').insert(event).select().single(),
    
    update: (id: string, updates: any) =>
      supabase.from('events').update(updates).eq('event_id', id).select().single(),
    
    delete: (id: string) =>
      supabase.from('events').delete().eq('event_id', id),
  },

  // Event Attendees
  attendees: {
    getByEvent: (eventId: string) =>
      supabase.from('event_attendees')
        .select('*, user:users(first_name, last_name, email, phone)')
        .eq('event_id', eventId),
    
    getByUser: (userId: string) =>
      supabase.from('event_attendees')
        .select('*, event:events(*, organisation:organisations(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    
    register: (eventId: string, userId: string) =>
      supabase.from('event_attendees')
        .insert({ event_id: eventId, user_id: userId, status: 'rsvp' })
        .select().single(),
    
    checkIn: (attendeeId: string) =>
      supabase.from('event_attendees')
        .update({ 
          status: 'checked_in', 
          check_in_time: new Date().toISOString() 
        })
        .eq('attendee_id', attendeeId)
        .select().single(),
    
    cancel: (attendeeId: string) =>
      supabase.from('event_attendees')
        .update({ status: 'cancelled' })
        .eq('attendee_id', attendeeId)
        .select().single(),
  },

  // Certificates
  certificates: {
    getAll: () =>
      supabase.from('certificates')
        .select('*, organisation:organisations(*), issuer:users(first_name, last_name)')
        .order('issue_date', { ascending: false }),
    
    getById: (id: string) =>
      supabase.from('certificates')
        .select('*, organisation:organisations(*), issuer:users(first_name, last_name)')
        .eq('certificate_id', id)
        .single(),
    
    getByOrganisation: (orgId: string) =>
      supabase.from('certificates')
        .select('*, issuer:users(first_name, last_name)')
        .eq('organisation_id', orgId)
        .order('issue_date', { ascending: false }),
    
    getActive: () =>
      supabase.from('certificates')
        .select('*, organisation:organisations(*)')
        .eq('status', 'active')
        .gt('expiry_date', new Date().toISOString()),
    
    create: (cert: any) =>
      supabase.from('certificates').insert(cert).select().single(),
    
    update: (id: string, updates: any) =>
      supabase.from('certificates').update(updates).eq('certificate_id', id).select().single(),
    
    revoke: (id: string, notes?: string) =>
      supabase.from('certificates')
        .update({ status: 'revoked', notes })
        .eq('certificate_id', id)
        .select().single(),
  },

  // Reports
  reports: {
    getAll: () =>
      supabase.from('reports')
        .select(`
          *,
          event:events(*),
          organisation:organisations(*),
          submitter:users(first_name, last_name, email),
          reviewer:users(first_name, last_name, email)
        `)
        .order('submitted_at', { ascending: false }),
    
    getById: (id: string) =>
      supabase.from('reports')
        .select(`
          *,
          event:events(*),
          organisation:organisations(*),
          submitter:users(first_name, last_name, email),
          reviewer:users(first_name, last_name, email)
        `)
        .eq('report_id', id)
        .single(),
    
    getByStatus: (status: string) =>
      supabase.from('reports')
        .select('*, event:events(*), organisation:organisations(*)')
        .eq('status', status)
        .order('submitted_at', { ascending: false }),
    
    getByOrganisation: (orgId: string) =>
      supabase.from('reports')
        .select('*, event:events(*)')
        .eq('organisation_id', orgId)
        .order('submitted_at', { ascending: false }),
    
    create: (report: any) =>
      supabase.from('reports').insert(report).select().single(),
    
    update: (id: string, updates: any) =>
      supabase.from('reports').update(updates).eq('report_id', id).select().single(),
    
    approve: (id: string, reviewerId: string, notes?: string) =>
      supabase.from('reports')
        .update({
          status: 'approved',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_notes: notes,
        })
        .eq('report_id', id)
        .select().single(),
    
    reject: (id: string, reviewerId: string, notes: string) =>
      supabase.from('reports')
        .update({
          status: 'rejected',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_notes: notes,
        })
        .eq('report_id', id)
        .select().single(),
  },

  // Support Requests
  supportRequests: {
    getAll: () =>
      supabase.from('support_requests')
        .select('*, user:users(first_name, last_name, email), assignee:users(first_name, last_name)')
        .order('submitted_at', { ascending: false }),
    
    getById: (id: string) =>
      supabase.from('support_requests')
        .select('*, user:users(first_name, last_name, email), assignee:users(first_name, last_name)')
        .eq('request_id', id)
        .single(),
    
    getByUser: (userId: string) =>
      supabase.from('support_requests')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false }),
    
    getByStatus: (status: string) =>
      supabase.from('support_requests')
        .select('*, user:users(first_name, last_name, email)')
        .eq('status', status)
        .order('submitted_at', { ascending: false }),
    
    create: (request: any) =>
      supabase.from('support_requests').insert(request).select().single(),
    
    update: (id: string, updates: any) =>
      supabase.from('support_requests').update(updates).eq('request_id', id).select().single(),
    
    assign: (id: string, assigneeId: string) =>
      supabase.from('support_requests')
        .update({ assigned_to: assigneeId, status: 'in_progress' })
        .eq('request_id', id)
        .select().single(),
    
    resolve: (id: string) =>
      supabase.from('support_requests')
        .update({ 
          status: 'resolved', 
          resolved_at: new Date().toISOString() 
        })
        .eq('request_id', id)
        .select().single(),
  },

  // Content
  content: {
    getPublished: () =>
      supabase.from('content')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false }),
    
    getAll: () =>
      supabase.from('content')
        .select('*')
        .order('created_at', { ascending: false }),
    
    getById: (id: string) =>
      supabase.from('content').select('*').eq('content_id', id).single(),
    
    getByType: (type: string) =>
      supabase.from('content')
        .select('*')
        .eq('type', type)
        .eq('is_published', true)
        .order('published_at', { ascending: false }),
    
    search: (query: string) =>
      supabase.from('content')
        .select('*')
        .or(`title.ilike.%${query}%, body.ilike.%${query}%`)
        .eq('is_published', true),
    
    create: (content: any) =>
      supabase.from('content').insert(content).select().single(),
    
    update: (id: string, updates: any) =>
      supabase.from('content').update(updates).eq('content_id', id).select().single(),
    
    publish: (id: string) =>
      supabase.from('content')
        .update({ 
          is_published: true, 
          published_at: new Date().toISOString() 
        })
        .eq('content_id', id)
        .select().single(),
    
    unpublish: (id: string) =>
      supabase.from('content')
        .update({ is_published: false })
        .eq('content_id', id)
        .select().single(),
    
    incrementViews: (id: string) =>
      supabase.rpc('increment_content_views', { content_id: id }),
    
    incrementLikes: (id: string) =>
      supabase.rpc('increment_content_likes', { content_id: id }),
  },

  // Notifications
  notifications: {
    getByUser: (userId: string) =>
      supabase.from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    
    getUnread: (userId: string) =>
      supabase.from('notifications')
        .select('*')
        .eq('user_id', userId)
        .is('read_at', null)
        .order('created_at', { ascending: false }),
    
    create: (notification: any) =>
      supabase.from('notifications').insert(notification).select().single(),
    
    markAsRead: (id: string) =>
      supabase.from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('notification_id', id)
        .select().single(),
    
    markAllAsRead: (userId: string) =>
      supabase.from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null),
  },
};

// Storage helpers
export const storage = {
  upload: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return { ...data, publicUrl };
  },

  download: async (bucket: string, path: string) => {
    return await supabase.storage
      .from(bucket)
      .download(path);
  },

  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  delete: async (bucket: string, paths: string[]) => {
    return await supabase.storage
      .from(bucket)
      .remove(paths);
  },

  list: async (bucket: string, folder?: string) => {
    return await supabase.storage
      .from(bucket)
      .list(folder);
  },
};

// Real-time subscriptions
export const realtime = {
  subscribeToEvents: (callback: (payload: any) => void) => {
    return supabase
      .channel('events')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' }, 
        callback
      )
      .subscribe();
  },

  subscribeToReports: (callback: (payload: any) => void) => {
    return supabase
      .channel('reports')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reports' }, 
        callback
      )
      .subscribe();
  },

  subscribeToNotifications: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  },

  unsubscribe: (channel: any) => {
    return supabase.removeChannel(channel);
  },
};

// Analytics helpers
export const analytics = {
  getDashboardStats: async () => {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    return { data, error };
  },

  getEventAnalytics: async (eventId?: string) => {
    const { data, error } = await supabase.rpc('get_event_analytics', {
      event_id: eventId,
    });
    return { data, error };
  },

  getRegionalStats: async () => {
    const { data, error } = await supabase.rpc('get_regional_stats');
    return { data, error };
  },

  getUserEngagement: async (userId: string) => {
    const { data, error } = await supabase.rpc('get_user_engagement', {
      user_id: userId,
    });
    return { data, error };
  },
};

export default supabase; 