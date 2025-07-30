import { supabase } from '@/lib/supabase/client';
import { BaseApiService, RealtimeSubscription } from './base';
import type { Database } from '@/lib/supabase/types';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export interface NotificationFilters {
  page?: number;
  limit?: number;
  userId?: string;
  type?: string;
  read?: boolean;
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

export class NotificationService extends BaseApiService {
  /**
   * Get notifications with filtering and pagination
   */
  static async getNotifications(filters: NotificationFilters = {}): Promise<PaginatedResponse<Notification>> {
    const {
      page = 1,
      limit = 10,
      userId,
      type,
      read,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' });

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (read !== undefined) {
      if (read) {
        query = query.not('read_at', 'is', null);
      } else {
        query = query.is('read_at', null);
      }
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count } = await this.executePaginatedQuery(query);

    return {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Create a new notification
   */
  static async createNotification(notification: NotificationInsert): Promise<Notification> {
    const query = supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    const data = await this.executeQuery<Notification>(query);
    
    // Log activity
    await this.logActivity('created', 'notification', data.id, data.title);

    return data;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: string): Promise<Notification> {
    const query = supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    const data = await this.executeQuery<Notification>(query);
    
    // Log activity
    await this.logActivity('read', 'notification', data.id, data.title);

    return data;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    const query = supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);

    await this.executeQuery(query);
    
    // Log activity
    await this.logActivity('read_all', 'notification', userId);
  }

  /**
   * Delete notification
   */
  static async deleteNotification(id: string): Promise<void> {
    // Get notification info for logging
    const notification = await this.getNotification(id);

    const query = supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    await this.executeQuery(query);
    
    // Log activity
    await this.logActivity('deleted', 'notification', id, notification.title);
  }

  /**
   * Get single notification
   */
  static async getNotification(id: string): Promise<Notification> {
    const query = supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    return await this.executeQuery<Notification>(query);
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const cacheKey = `unread_count_${userId}`;
    const cached = this.getCached<number>(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    const query = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);

    const { count } = await this.executePaginatedQuery(query);
    
    // Cache for 1 minute
    this.setCached(cacheKey, count, 60 * 1000);
    
    return count;
  }

  /**
   * Send notification to user
   */
  static async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'info',
    actionUrl?: string,
    actionText?: string
  ): Promise<Notification> {
    const notification: NotificationInsert = {
      user_id: userId,
      title,
      message,
      type,
      action_url: actionUrl,
      action_text: actionText,
    };

    return await this.createNotification(notification);
  }

  /**
   * Send notification to multiple users
   */
  static async sendBulkNotification(
    userIds: string[],
    title: string,
    message: string,
    type: string = 'info',
    actionUrl?: string,
    actionText?: string
  ): Promise<Notification[]> {
    const notifications: NotificationInsert[] = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type,
      action_url: actionUrl,
      action_text: actionText,
    }));

    const query = supabase
      .from('notifications')
      .insert(notifications)
      .select();

    const data = await this.executeQuery<Notification[]>(query);
    
    // Log activity
    await this.logActivity('bulk_created', 'notification', 'bulk', `${userIds.length} notifications`, {
      userIds,
      title,
      type
    });

    return data;
  }

  /**
   * Send notification to all users with a specific role
   */
  static async sendRoleNotification(
    role: string,
    title: string,
    message: string,
    type: string = 'info',
    actionUrl?: string,
    actionText?: string
  ): Promise<Notification[]> {
    // Get all users with the specified role
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('role', role)
      .eq('is_active', true);

    if (!users || users.length === 0) {
      return [];
    }

    const userIds = users.map(user => user.id);
    return await this.sendBulkNotification(userIds, title, message, type, actionUrl, actionText);
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  static subscribeToUserNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): RealtimeSubscription {
    return this.subscribeToTable(
      'notifications',
      (payload) => {
        if (payload.eventType === 'INSERT' && payload.new.user_id === userId) {
          callback(payload.new);
        }
      },
      `user_id=eq.${userId}`
    );
  }

  /**
   * Subscribe to all notification changes (admin only)
   */
  static subscribeToAllNotifications(
    callback: (payload: any) => void
  ): RealtimeSubscription {
    return this.subscribeToTable('notifications', callback);
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    recent: number;
  }> {
    const cacheKey = 'notification_stats';
    const cached = this.getCached<any>(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    const { data: notifications } = await supabase
      .from('notifications')
      .select('type, read_at, created_at');

    if (!notifications) {
      return { total: 0, unread: 0, byType: {}, recent: 0 };
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read_at).length,
      byType: {} as Record<string, number>,
      recent: notifications.filter(n => new Date(n.created_at) > oneDayAgo).length,
    };

    // Count by type
    notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });

    // Cache for 5 minutes
    this.setCached(cacheKey, stats, 5 * 60 * 1000);

    return stats;
  }

  /**
   * Clean up old notifications
   */
  static async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const query = supabase
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    const { count } = await this.executePaginatedQuery(query);
    
    // Log activity
    await this.logActivity('cleanup', 'notification', 'system', `Cleaned up ${count} old notifications`);

    return count;
  }

  /**
   * Create system notification templates
   */
  static async createSystemNotifications() {
    const templates = {
      organizationApproved: (orgName: string) => ({
        title: 'Organization Approved',
        message: `Organization "${orgName}" has been approved and is now active.`,
        type: 'success',
      }),
      organizationRejected: (orgName: string, reason: string) => ({
        title: 'Organization Rejected',
        message: `Organization "${orgName}" has been rejected. Reason: ${reason}`,
        type: 'error',
      }),
      eventApproved: (eventTitle: string) => ({
        title: 'Event Approved',
        message: `Event "${eventTitle}" has been approved and is now live.`,
        type: 'success',
      }),
      eventRejected: (eventTitle: string, reason: string) => ({
        title: 'Event Rejected',
        message: `Event "${eventTitle}" has been rejected. Reason: ${reason}`,
        type: 'error',
      }),
      certificateExpiring: (certNumber: string, daysLeft: number) => ({
        title: 'Certificate Expiring',
        message: `Certificate ${certNumber} will expire in ${daysLeft} days.`,
        type: 'warning',
      }),
      reportSubmitted: (reportTitle: string) => ({
        title: 'New Report Submitted',
        message: `Report "${reportTitle}" has been submitted for review.`,
        type: 'info',
      }),
    };

    return templates;
  }
}

export default NotificationService; 