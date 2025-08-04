import { supabase } from '../supabase';

export interface ActivityLog {
  id: string;
  action: string;
  resource: string;
  resource_id: string;
  resource_name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  ip_address: string | null;
  user_agent: string | null;
  status: 'success' | 'failed' | 'warning';
  details: Record<string, any> | null;
  created_at: string;
}

export interface ActivityLogFilters {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  resource?: string;
  status?: ActivityLog['status'];
  user_id?: string;
  start_date?: string;
  end_date?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ActivityLogsService {
  // Get activity logs with filters and pagination
  static async getActivityLogs(
    filters: ActivityLogFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<ActivityLog>> {
    const {
      search,
      action,
      resource,
      status,
      user_id,
      start_date,
      end_date,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    try {
      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`resource_name.ilike.%${search}%,user_name.ilike.%${search}%,user_email.ilike.%${search}%`);
      }

      if (action) {
        query = query.eq('action', action);
      }

      if (resource) {
        query = query.eq('resource', resource);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      if (start_date) {
        query = query.gte('created_at', start_date);
      }

      if (end_date) {
        query = query.lte('created_at', end_date);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw new Error('Failed to fetch activity logs');
    }
  }

  // Get activity log by ID
  static async getActivityLogById(logId: string): Promise<ActivityLog | null> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('id', logId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching activity log:', error);
      throw new Error('Failed to fetch activity log');
    }
  }

  // Get activity statistics
  static async getActivityStats(filters: {
    start_date?: string;
    end_date?: string;
    user_id?: string;
  } = {}): Promise<{
    total: number;
    success: number;
    failed: number;
    warning: number;
    byResource: Record<string, number>;
    byAction: Record<string, number>;
    timeline: Array<{
      date: string;
      count: number;
    }>;
  }> {
    try {
      let query = supabase
        .from('activity_logs')
        .select('status, resource, action, created_at');

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data: logs, error } = await query;

      if (error) throw error;

      const stats = {
        total: logs.length,
        success: logs.filter(log => log.status === 'success').length,
        failed: logs.filter(log => log.status === 'failed').length,
        warning: logs.filter(log => log.status === 'warning').length,
        byResource: {} as Record<string, number>,
        byAction: {} as Record<string, number>,
        timeline: [] as Array<{ date: string; count: number; }>
      };

      // Count by resource and action
      logs.forEach(log => {
        if (log.resource) {
          stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;
        }
        if (log.action) {
          stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
        }
      });

      // Generate timeline data
      const timelineData = new Map<string, number>();
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Initialize all dates with 0
      for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
        timelineData.set(d.toISOString().split('T')[0], 0);
      }

      // Count logs by date
      logs.forEach(log => {
        const date = new Date(log.created_at).toISOString().split('T')[0];
        if (timelineData.has(date)) {
          timelineData.set(date, (timelineData.get(date) || 0) + 1);
        }
      });

      // Convert Map to array and sort by date
      stats.timeline = Array.from(timelineData.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return stats;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw new Error('Failed to fetch activity statistics');
    }
  }

  // Create activity log
  static async createActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert(log)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw new Error('Failed to create activity log');
    }
  }

  // Get unique resources
  static async getUniqueResources(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('resource')
        .order('resource')
        .not('resource', 'is', null);

      if (error) throw error;

      return Array.from(new Set(data.map(log => log.resource)));
    } catch (error) {
      console.error('Error fetching unique resources:', error);
      throw new Error('Failed to fetch unique resources');
    }
  }

  // Get unique actions
  static async getUniqueActions(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('action')
        .order('action')
        .not('action', 'is', null);

      if (error) throw error;

      return Array.from(new Set(data.map(log => log.action)));
    } catch (error) {
      console.error('Error fetching unique actions:', error);
      throw new Error('Failed to fetch unique actions');
    }
  }
} 