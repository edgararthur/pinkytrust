import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];
type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert'];

export type { ActivityLog, ActivityLogInsert };

export interface ActivityLogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  resourceType?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  municipalityId?: string;
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
  static async getActivityLogs(filters: ActivityLogFilters = {}): Promise<PaginatedResponse<ActivityLog>> {
    const {
      page = 1,
      limit = 50,
      userId,
      resourceType,
      action,
      startDate,
      endDate,
      municipalityId,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    try {
      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (resourceType) {
        query = query.eq('resource_type', resourceType);
      }

      if (action) {
        query = query.eq('action', action);
      }

      if (municipalityId) {
        query = query.eq('municipality_id', municipalityId);
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

  // Create activity log
  static async createActivityLog(logData: ActivityLogInsert): Promise<ActivityLog> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert(logData)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw new Error('Failed to create activity log');
    }
  }

  // Log user activity (convenience method)
  static async logActivity(
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any,
    municipalityId?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await this.createActivityLog({
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId || null,
        details: details ? JSON.stringify(details) : null,
        municipality_id: municipalityId || null,
        ip_address: null, // Would be populated by server-side logging
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error for logging failures
    }
  }

  // Get activity logs for a specific user
  static async getUserActivityLogs(userId: string, limit: number = 20): Promise<ActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user activity logs:', error);
      throw new Error('Failed to fetch user activity logs');
    }
  }

  // Get activity logs for a specific resource
  static async getResourceActivityLogs(resourceType: string, resourceId: string): Promise<ActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching resource activity logs:', error);
      throw new Error('Failed to fetch resource activity logs');
    }
  }

  // Get activity statistics
  static async getActivityStats(municipalityId?: string): Promise<{
    totalActivities: number;
    activitiesByAction: Record<string, number>;
    activitiesByResourceType: Record<string, number>;
    activitiesByUser: Record<string, number>;
    recentActivities: ActivityLog[];
  }> {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*');

      if (municipalityId) {
        query = query.eq('municipality_id', municipalityId);
      }

      const { data: activities, error } = await query;

      if (error) throw error;

      const stats = {
        totalActivities: activities.length,
        activitiesByAction: {} as Record<string, number>,
        activitiesByResourceType: {} as Record<string, number>,
        activitiesByUser: {} as Record<string, number>,
        recentActivities: activities
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
      };

      // Count by action, resource type, and user
      activities.forEach(activity => {
        stats.activitiesByAction[activity.action] = (stats.activitiesByAction[activity.action] || 0) + 1;
        stats.activitiesByResourceType[activity.resource_type] = (stats.activitiesByResourceType[activity.resource_type] || 0) + 1;
        if (activity.user_id) {
          stats.activitiesByUser[activity.user_id] = (stats.activitiesByUser[activity.user_id] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw new Error('Failed to fetch activity statistics');
    }
  }

  // Delete old activity logs (cleanup)
  static async deleteOldActivityLogs(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await supabase
        .from('activity_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error('Error deleting old activity logs:', error);
      throw new Error('Failed to delete old activity logs');
    }
  }

  // Get activity logs by date range
  static async getActivityLogsByDateRange(
    startDate: string,
    endDate: string,
    municipalityId?: string
  ): Promise<ActivityLog[]> {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (municipalityId) {
        query = query.eq('municipality_id', municipalityId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activity logs by date range:', error);
      throw new Error('Failed to fetch activity logs');
    }
  }

  // Export activity logs to CSV format
  static async exportActivityLogs(filters: ActivityLogFilters = {}): Promise<string> {
    try {
      const { data: logs } = await this.getActivityLogs({ ...filters, limit: 10000 });

      const headers = ['Date', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'Details'];
      const csvRows = [headers.join(',')];

      logs.forEach(log => {
        const row = [
          new Date(log.created_at).toISOString(),
          log.user_id || '',
          log.action,
          log.resource_type,
          log.resource_id || '',
          log.details ? JSON.stringify(log.details).replace(/"/g, '""') : ''
        ];
        csvRows.push(row.map(field => `"${field}"`).join(','));
      });

      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting activity logs:', error);
      throw new Error('Failed to export activity logs');
    }
  }
}
