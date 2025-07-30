import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrganizationWithStats = Database['public']['Views']['organizations_with_stats']['Row'];
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];

export type { Organization, OrganizationWithStats, OrganizationInsert, OrganizationUpdate };

export interface OrganizationFilters {
  page?: number;
  limit?: number;
  search?: string;
  registration_status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  certificate_status?: 'active' | 'expired' | 'revoked' | 'pending';
  municipalityId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateRange?: {
    start: string;
    end: string;
  };
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

export class OrganizationsService {
  // Get organizations with filters and pagination
  static async getOrganizations(
    filters: OrganizationFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<OrganizationWithStats>> {
    const {
      search,
      registration_status,
      certificate_status,
      municipalityId,
      dateRange,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    try {
      let query = supabase
        .from('organizations_with_stats')
        .select('*', { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,contact_email.ilike.%${search}%,contact_phone.ilike.%${search}%`);
      }

      if (registration_status) {
        query = query.eq('registration_status', registration_status);
      }

      if (certificate_status) {
        query = query.eq('certificate_status', certificate_status);
      }

      if (municipalityId) {
        query = query.eq('municipality_id', municipalityId);
      }

      if (dateRange) {
        query = query.gte('created_at', dateRange.start).lte('created_at', dateRange.end);
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
      console.error('Error fetching organizations:', error);
      throw new Error('Failed to fetch organizations');
    }
  }

  // Create new organization
  static async createOrganization(orgData: OrganizationInsert): Promise<Organization> {
    try {
      // Generate registration number
      const registrationNumber = await this.generateRegistrationNumber(orgData.municipality_id);

      const { data, error } = await supabase
        .from('organizations')
        .insert({
          ...orgData,
          registration_number: registrationNumber,
          submitted_at: new Date().toISOString(),
          registration_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await this.logActivity('create', data.id, data.name, {
        municipality_id: data.municipality_id,
        registration_number: registrationNumber
      });

      return data;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw new Error('Failed to create organization');
    }
  }

  // Generate registration number
  private static async generateRegistrationNumber(municipalityId: string | null): Promise<string> {
    try {
      // Get municipality code
      const { data: municipality } = await supabase
        .from('municipalities')
        .select('code')
        .eq('id', municipalityId)
        .single();

      if (!municipality) throw new Error('Municipality not found');

      // Get current year
      const year = new Date().getFullYear();

      // Get current count for this municipality and year
      const { data: existingOrgs } = await supabase
        .from('organizations')
        .select('registration_number')
        .eq('municipality_id', municipalityId)
        .like('registration_number', `${municipality.code}-${year}-%`);

      const count = (existingOrgs?.length || 0) + 1;
      const paddedCount = count.toString().padStart(4, '0');

      return `${municipality.code}-${year}-${paddedCount}`;
    } catch (error) {
      console.error('Error generating registration number:', error);
      throw new Error('Failed to generate registration number');
    }
  }

  // Update organization
  static async updateOrganization(orgId: string, updates: OrganizationUpdate): Promise<Organization> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', orgId)
        .select()
        .single();

      if (error) throw error;

      await this.logActivity('update', orgId, data.name, updates);

      return data;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw new Error('Failed to update organization');
    }
  }

  // Delete organization
  static async deleteOrganization(orgId: string): Promise<void> {
    try {
      // Get organization info before deletion
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', orgId)
        .single();

      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      await this.logActivity('delete', orgId, org?.name || 'Unknown Organization');
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw new Error('Failed to delete organization');
    }
  }

  // Get organization by ID
  static async getOrganizationById(orgId: string): Promise<OrganizationWithStats | null> {
    try {
      const { data, error } = await supabase
        .from('organizations_with_stats')
        .select('*')
        .eq('id', orgId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw new Error('Failed to fetch organization');
    }
  }

  // Approve organization
  static async approveOrganization(orgId: string, approvedBy: string): Promise<Organization> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          registration_status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', orgId)
        .select()
        .single();

      if (error) throw error;

      await this.logActivity('approve', orgId, data.name, { approved_by: approvedBy });

      return data;
    } catch (error) {
      console.error('Error approving organization:', error);
      throw new Error('Failed to approve organization');
    }
  }

  // Reject organization
  static async rejectOrganization(orgId: string, rejectedBy: string, reason: string): Promise<Organization> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          registration_status: 'rejected',
          rejected_by: rejectedBy,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', orgId)
        .select()
        .single();

      if (error) throw error;

      await this.logActivity('reject', orgId, data.name, {
        rejected_by: rejectedBy,
        reason
      });

      return data;
    } catch (error) {
      console.error('Error rejecting organization:', error);
      throw new Error('Failed to reject organization');
    }
  }

  // Get organization statistics
  static async getOrganizationStats(municipalityId?: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
    byMunicipality: Record<string, number>;
  }> {
    try {
      let query = supabase
        .from('organizations')
        .select('registration_status, municipality_id');

      if (municipalityId) {
        query = query.eq('municipality_id', municipalityId);
      }

      const { data: organizations, error } = await query;

      if (error) throw error;

      const stats = {
        total: organizations.length,
        pending: organizations.filter(o => o.registration_status === 'pending').length,
        approved: organizations.filter(o => o.registration_status === 'approved').length,
        rejected: organizations.filter(o => o.registration_status === 'rejected').length,
        suspended: organizations.filter(o => o.registration_status === 'suspended').length,
        byMunicipality: {} as Record<string, number>
      };

      // Count by municipality
      organizations.forEach(org => {
        if (org.municipality_id) {
          stats.byMunicipality[org.municipality_id] = (stats.byMunicipality[org.municipality_id] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching organization stats:', error);
      throw new Error('Failed to fetch organization statistics');
    }
  }

  // Export organizations data
  static async exportOrganizations(filters: OrganizationFilters = {}): Promise<OrganizationWithStats[]> {
    const {
      search,
      registration_status,
      certificate_status,
      municipalityId,
      dateRange,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    try {
      let query = supabase
        .from('organizations_with_stats')
        .select('*');

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,contact_email.ilike.%${search}%,contact_phone.ilike.%${search}%`);
      }

      if (registration_status) {
        query = query.eq('registration_status', registration_status);
      }

      if (certificate_status) {
        query = query.eq('certificate_status', certificate_status);
      }

      if (municipalityId) {
        query = query.eq('municipality_id', municipalityId);
      }

      if (dateRange) {
        query = query.gte('created_at', dateRange.start).lte('created_at', dateRange.end);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error exporting organizations:', error);
      throw new Error('Failed to export organizations');
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
          resource: 'organization',
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