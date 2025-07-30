import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { DashboardStats, ActivityLog, Notification } from '@/types';

export class DashboardService {
  /**
   * Get dashboard statistics
   * @returns Dashboard statistics
   */
  static async getStats(): Promise<DashboardStats> {
    try {
      // Query the dashboard_stats view
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();

      if (error) throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
      if (!data) throw new Error('No dashboard stats found');
      
      // Map the database fields to the frontend model
      return {
        totalOrganisations: data.total_organisations,
        activeOrganisations: data.active_organisations,
        pendingOrganisations: data.pending_organisations,
        totalEvents: data.total_events,
        activeEvents: data.active_events,
        completedEvents: data.completed_events,
        totalUsers: data.total_users,
        totalReports: data.total_reports,
        pendingReports: data.pending_reports,
        totalCertificates: data.total_certificates,
        activeCertificates: data.active_certificates,
        expiringSoonCertificates: data.expiring_soon_certificates,
        totalScreenings: data.total_screenings || 0,
        suspectedCases: data.suspected_cases || 0,
        referralsMade: data.referrals_made || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get recent activity logs
   * @param limit Number of activity logs to return
   * @returns Recent activity logs
   */
  static async getRecentActivity(limit = 10): Promise<ActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(`Failed to fetch recent activity: ${error.message}`);
      
      // Map the database fields to the frontend model
      return data.map(log => ({
        id: log.id,
        userId: log.user_id,
        userName: log.user_name,
        action: log.action,
        resource: log.resource,
        resourceId: log.resource_id,
        timestamp: log.created_at,
        details: log.details || undefined,
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  /**
   * Get system notifications
   * @returns System notifications
   */
  static async getNotifications(): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
      
      // Map the database fields to the frontend model
      return data.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: notification.created_at,
        read: !!notification.read_at,
        actionUrl: notification.action_url || undefined,
        actionText: notification.action_text || undefined,
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param id Notification ID
   */
  static async markNotificationAsRead(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}