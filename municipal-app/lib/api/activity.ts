import { supabase } from '@/lib/supabase/client';
import type { Database, ActivityStatus } from '@/lib/supabase/types';

type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];
type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert'];

export interface ActivityFilters {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  resource?: string;
  userId?: string;
  status?: ActivityStatus;
  startDate?: string;
  endDate?: string;
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

export class ActivityService {
  static async getActivityLogs(filters: ActivityFilters = {}): Promise<PaginatedResponse<ActivityLog>> {
    const {
      page = 1,
      limit = 10,
      search,
      action,
      resource,
      userId,
      status,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`action.ilike.%${search}%,resource.ilike.%${search}%,resource_name.ilike.%${search}%,user_name.ilike.%${search}%,user_email.ilike.%${search}%`);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (resource) {
      query = query.eq('resource', resource);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch activity logs: ${error.message}`);
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  static async getActivityLog(id: string): Promise<ActivityLog> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch activity log: ${error.message}`);
    }

    return data;
  }

  static async logActivity(activity: ActivityLogInsert): Promise<ActivityLog> {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert(activity)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log activity: ${error.message}`);
    }

    return data;
  }

  static async getRecentActivity(limit: number = 20): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent activity: ${error.message}`);
    }

    return data || [];
  }

  static async getUserActivity(userId: string, limit: number = 50): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch user activity: ${error.message}`);
    }

    return data || [];
  }

  static async getResourceActivity(resource: string, resourceId: string): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('resource', resource)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch resource activity: ${error.message}`);
    }

    return data || [];
  }

  static async getFailedActivities(limit: number = 100): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch failed activities: ${error.message}`);
    }

    return data || [];
  }

  static async getActivityStats(): Promise<{
    total: number;
    success: number;
    failed: number;
    warning: number;
    todayCount: number;
    weekCount: number;
    monthCount: number;
  }> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('status, created_at');

    if (error) {
      throw new Error(`Failed to fetch activity stats: ${error.message}`);
    }

    const stats = {
      total: data.length,
      success: 0,
      failed: 0,
      warning: 0,
      todayCount: 0,
      weekCount: 0,
      monthCount: 0,
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    data.forEach(log => {
      stats[log.status]++;
      
      const logDate = new Date(log.created_at);
      
      if (logDate >= today) {
        stats.todayCount++;
      }
      
      if (logDate >= weekAgo) {
        stats.weekCount++;
      }
      
      if (logDate >= monthAgo) {
        stats.monthCount++;
      }
    });

    return stats;
  }

  static async getActionStats(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('action');

    if (error) {
      throw new Error(`Failed to fetch action stats: ${error.message}`);
    }

    const actionStats: Record<string, number> = {};

    data.forEach(log => {
      actionStats[log.action] = (actionStats[log.action] || 0) + 1;
    });

    return actionStats;
  }

  static async getResourceStats(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('resource');

    if (error) {
      throw new Error(`Failed to fetch resource stats: ${error.message}`);
    }

    const resourceStats: Record<string, number> = {};

    data.forEach(log => {
      resourceStats[log.resource] = (resourceStats[log.resource] || 0) + 1;
    });

    return resourceStats;
  }

  static async getTopUsers(limit: number = 10): Promise<Array<{ user_name: string; user_email: string; count: number }>> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('user_name, user_email')
      .not('user_id', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch top users: ${error.message}`);
    }

    const userStats: Record<string, { user_name: string; user_email: string; count: number }> = {};

    data.forEach(log => {
      const key = log.user_email;
      if (!userStats[key]) {
        userStats[key] = {
          user_name: log.user_name,
          user_email: log.user_email,
          count: 0,
        };
      }
      userStats[key].count++;
    });

    return Object.values(userStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  static async getActivityTrend(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('activity_logs')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      throw new Error(`Failed to fetch activity trend: ${error.message}`);
    }

    const dailyStats: Record<string, number> = {};

    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats[dateStr] = 0;
    }

    // Count activities per day
    data.forEach(log => {
      const dateStr = log.created_at.split('T')[0];
      dailyStats[dateStr] = (dailyStats[dateStr] || 0) + 1;
    });

    return Object.entries(dailyStats)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
