import { supabase } from '@/lib/supabase';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string;
  contact_email: string | null;
  contact_phone: string | null;
  max_participants: number | null;
  current_participants: number;
  organization_id: string;
  organization_name: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: Event['status'];
  event_type?: string;
  organization_id?: string;
  sortBy?: keyof Event;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
}

export const EventsService = {
  async getEvents(filters: EventFilters): Promise<PaginatedResponse<Event>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        event_type,
        organization_id,
        sortBy = 'start_date',
        sortOrder = 'asc'
      } = filters;

      let query = supabase
        .from('events')
        .select(`
          *,
          organizations (
            name
          )
        `, { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
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

      // Apply pagination
      const start = (page - 1) * limit;
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(start, start + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform the response to include organization_name
      const transformedData = data.map(event => ({
        ...event,
        organization_name: event.organizations.name,
        organizations: undefined
      }));

      return {
        data: transformedData as Event[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  async getEventById(id: string): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizations (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        organization_name: data.organizations.name,
        organizations: undefined
      } as Event;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  async registerForEvent(eventId: string, registration: RegistrationData): Promise<void> {
    try {
      // First, check if the event is still available
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('max_participants, current_participants')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      if (event.max_participants && event.current_participants >= event.max_participants) {
        throw new Error('Event is full');
      }

      // Start a transaction
      const { error: registrationError } = await supabase.rpc('register_for_event', {
        p_event_id: eventId,
        p_name: registration.name,
        p_email: registration.email,
        p_phone: registration.phone
      });

      if (registrationError) throw registrationError;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  async getEventStats(): Promise<{
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
    byType: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('start_date, end_date, event_type')
        .eq('status', 'approved');

      if (error) throw error;

      const now = new Date();
      const stats = {
        total: data.length,
        upcoming: 0,
        ongoing: 0,
        completed: 0,
        byType: {} as Record<string, number>
      };

      data.forEach((event) => {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);

        // Count by status
        if (now < startDate) {
          stats.upcoming++;
        } else if (now >= startDate && now <= endDate) {
          stats.ongoing++;
        } else {
          stats.completed++;
        }

        // Count by type
        if (event.event_type) {
          stats.byType[event.event_type] = (stats.byType[event.event_type] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching event stats:', error);
      throw error;
    }
  }
}; 