import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

export type { Event, EventInsert, EventUpdate };

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  event_type?: 'screening' | 'education' | 'fundraising' | 'awareness' | 'support';
  organization_id?: string;
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

export class EventsService {
  // Get events with filters and pagination
  static async getEvents(
    filters: EventFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Event>> {
    const {
      search,
      status,
      event_type,
      organization_id,
      start_date,
      end_date,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    try {
      let query = supabase
        .from('events')
        .select('*', { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (event_type) {
        query = query.eq('event_type', event_type);
      }

      if (organization_id) {
        query = query.eq('organization_id', organization_id);
      }

      if (start_date) {
        query = query.gte('start_date', start_date);
      }

      if (end_date) {
        query = query.lte('end_date', end_date);
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
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  }

  // Create new event
  static async createEvent(eventData: EventInsert): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      await this.logActivity('create', data.id, data.title, {
        organization_id: data.organization_id,
        event_type: data.event_type
      });

      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  // Update event
  static async updateEvent(eventId: string, updates: EventUpdate): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      await this.logActivity('update', eventId, data.title, updates);

      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  // Get event by ID
  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error('Failed to fetch event');
    }
  }

  // Approve event
  static async approveEvent(eventId: string, approvedBy: string): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      await this.logActivity('approve', eventId, data.title, { approved_by: approvedBy });

      return data;
    } catch (error) {
      console.error('Error approving event:', error);
      throw new Error('Failed to approve event');
    }
  }

  // Reject event
  static async rejectEvent(eventId: string, rejectedBy: string, reason: string): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          status: 'rejected',
          rejected_by: rejectedBy,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      await this.logActivity('reject', eventId, data.title, {
        rejected_by: rejectedBy,
        reason
      });

      return data;
    } catch (error) {
      console.error('Error rejecting event:', error);
      throw new Error('Failed to reject event');
    }
  }

  // Cancel event
  static async cancelEvent(eventId: string, reason: string): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      await this.logActivity('cancel', eventId, data.title, { reason });

      return data;
    } catch (error) {
      console.error('Error cancelling event:', error);
      throw new Error('Failed to cancel event');
    }
  }

  // Complete event
  static async completeEvent(eventId: string): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      await this.logActivity('complete', eventId, data.title);

      return data;
    } catch (error) {
      console.error('Error completing event:', error);
      throw new Error('Failed to complete event');
    }
  }

  // Get event statistics
  static async getEventStats(organizationId?: string): Promise<{
    total: number;
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    completed: number;
    byType: Record<string, number>;
  }> {
    try {
      let query = supabase
        .from('events')
        .select('status, event_type');

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data: events, error } = await query;

      if (error) throw error;

      const stats = {
        total: events.length,
        draft: events.filter(e => e.status === 'draft').length,
        pending: events.filter(e => e.status === 'pending').length,
        approved: events.filter(e => e.status === 'approved').length,
        rejected: events.filter(e => e.status === 'rejected').length,
        cancelled: events.filter(e => e.status === 'cancelled').length,
        completed: events.filter(e => e.status === 'completed').length,
        byType: {} as Record<string, number>
      };

      // Count by type
      events.forEach(event => {
        if (event.event_type) {
          stats.byType[event.event_type] = (stats.byType[event.event_type] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching event stats:', error);
      throw new Error('Failed to fetch event statistics');
    }
  }

  // Log activity
  private static async logActivity(
    action: string,
    resourceId: string,
    resourceName: string,
    details?: any
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('activity_logs').insert({
          action,
          resource: 'event',
          resource_id: resourceId,
          resource_name: resourceName,
          user_id: user.id,
          user_name: `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim() || user.email,
          user_email: user.email,
          status: 'success',
          details: details ? JSON.stringify(details) : null,
        });
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}
