import { supabase } from '@/lib/supabase/client';
import type { Database, ReportStatus, ReportType } from '@/lib/supabase/types';

type Report = Database['public']['Tables']['reports']['Row'];
type ReportInsert = Database['public']['Tables']['reports']['Insert'];
type ReportUpdate = Database['public']['Tables']['reports']['Update'];
type ReportWithDetails = Database['public']['Views']['reports_with_details']['Row'];

export interface ReportFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: ReportStatus;
  type?: ReportType;
  organizationId?: string;
  municipalityId?: string; // Add municipalityId
  eventId?: string;
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

export class ReportsService {
  static async getReports(filters: ReportFilters = {}): Promise<PaginatedResponse<ReportWithDetails>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      organizationId,
      municipalityId, // Add municipalityId
      eventId,
      sortBy = 'submitted_at', // Default sort by submission date
      sortOrder = 'desc'
    } = filters;

    let query = supabase
      .from('reports_with_details')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,organization_name.ilike.%${search}%,event_title.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('report_type', type);
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (municipalityId) {
      query = query.eq('municipality_id', municipalityId);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
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

  static async getReport(id: string): Promise<ReportWithDetails> {
    const { data, error } = await supabase
      .from('reports_with_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch report: ${error.message}`);
    }

    return data;
  }

  static async createReport(report: ReportInsert): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert(report)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create report: ${error.message}`);
    }

    // Log activity
    await this.logActivity('created', data.id, data.title);

    return data;
  }

  static async updateReport(id: string, updates: ReportUpdate): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update report: ${error.message}`);
    }

    // Log activity
    await this.logActivity('updated', data.id, data.title);

    return data;
  }

  static async deleteReport(id: string): Promise<void> {
    // Get report info for logging
    const report = await this.getReport(id);

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete report: ${error.message}`);
    }

    // Log activity
    await this.logActivity('deleted', id, report.title);
  }

  static async submitReport(id: string): Promise<Report> {
    const updates: ReportUpdate = {
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit report: ${error.message}`);
    }

    // Log activity
    await this.logActivity('submitted', data.id, data.title);

    return data;
  }

  static async approveReport(id: string, reviewedBy: string, feedback?: string): Promise<Report> {
    const updates: ReportUpdate = {
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      feedback: feedback || null,
    };

    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve report: ${error.message}`);
    }

    // Log activity
    await this.logActivity('approved', data.id, data.title, feedback ? { feedback } : undefined);

    return data;
  }

  static async rejectReport(id: string, reviewedBy: string, feedback: string): Promise<Report> {
    const updates: ReportUpdate = {
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      feedback,
    };

    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reject report: ${error.message}`);
    }

    // Log activity
    await this.logActivity('rejected', data.id, data.title, { feedback });

    return data;
  }

  static async setReportUnderReview(id: string, reviewedBy: string): Promise<Report> {
    const updates: ReportUpdate = {
      status: 'under_review',
      reviewed_by: reviewedBy,
    };

    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to set report under review: ${error.message}`);
    }

    // Log activity
    await this.logActivity('under_review', data.id, data.title);

    return data;
  }

  static async getPendingReports(): Promise<ReportWithDetails[]> {
    const { data, error } = await supabase
      .from('reports_with_details')
      .select('*')
      .in('status', ['submitted', 'under_review'])
      .order('submitted_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch pending reports: ${error.message}`);
    }

    return data || [];
  }

  static async getReportsByOrganization(organizationId: string): Promise<ReportWithDetails[]> {
    const { data, error } = await supabase
      .from('reports_with_details')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch organization reports: ${error.message}`);
    }

    return data || [];
  }

  static async getReportsByEvent(eventId: string): Promise<ReportWithDetails[]> {
    const { data, error } = await supabase
      .from('reports_with_details')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch event reports: ${error.message}`);
    }

    return data || [];
  }

  static async getReportStats(): Promise<{
    total: number;
    draft: number;
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
    pendingReview: number;
  }> {
    const { data, error } = await supabase
      .from('reports')
      .select('status');

    if (error) {
      throw new Error(`Failed to fetch report stats: ${error.message}`);
    }

    const stats = {
      total: data.length,
      draft: 0,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      pendingReview: 0,
    };

    data.forEach(report => {
      stats[report.status]++;
      
      if (report.status === 'submitted' || report.status === 'under_review') {
        stats.pendingReview++;
      }
    });

    return stats;
  }

  private static async logActivity(
    action: string,
    resourceId: string,
    resourceName: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.rpc('log_activity', {
          p_action: action,
          p_resource: 'report',
          p_resource_id: resourceId,
          p_resource_name: resourceName,
          p_user_id: user.id,
          p_user_name: user.user_metadata?.name || user.email || 'Unknown',
          p_user_email: user.email || 'unknown@example.com',
          p_details: details ? JSON.stringify(details) : null,
        });
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}
