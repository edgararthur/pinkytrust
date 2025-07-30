import { supabase } from '@/lib/supabase/client';

export interface Certificate {
  id: string;
  title: string;
  description: string | null;
  organization_id: string;
  certificate_type: 'screening' | 'education' | 'support' | 'general';
  status: 'active' | 'expired' | 'revoked' | 'pending';
  issue_date: string;
  expiry_date: string | null;
  issued_by: string;
  revoked_at: string | null;
  revoked_by: string | null;
  revocation_reason: string | null;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CertificateFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: Certificate['status'];
  certificate_type?: Certificate['certificate_type'];
  organization_id?: string;
  issue_date?: string;
  expiry_date?: string;
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

export class CertificatesService {
  // Get certificates with filters and pagination
  static async getCertificates(
    filters: CertificateFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Certificate>> {
    const {
      search,
      status,
      certificate_type,
      organization_id,
      issue_date,
      expiry_date,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    try {
      let query = supabase
        .from('certificates')
        .select('*', { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (certificate_type) {
        query = query.eq('certificate_type', certificate_type);
      }

      if (organization_id) {
        query = query.eq('organization_id', organization_id);
      }

      if (issue_date) {
        query = query.gte('issue_date', issue_date);
      }

      if (expiry_date) {
        query = query.lte('expiry_date', expiry_date);
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
      console.error('Error fetching certificates:', error);
      throw new Error('Failed to fetch certificates');
    }
  }

  // Create new certificate
  static async createCertificate(certificate: Omit<Certificate, 'id' | 'created_at' | 'updated_at'>): Promise<Certificate> {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .insert(certificate)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw new Error('Failed to create certificate');
    }
  }

  // Update certificate
  static async updateCertificate(certificateId: string, updates: Partial<Certificate>): Promise<Certificate> {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', certificateId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating certificate:', error);
      throw new Error('Failed to update certificate');
    }
  }

  // Get certificate by ID
  static async getCertificateById(certificateId: string): Promise<Certificate | null> {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('id', certificateId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      throw new Error('Failed to fetch certificate');
    }
  }

  // Revoke certificate
  static async revokeCertificate(certificateId: string, revokedBy: string, reason: string): Promise<Certificate> {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .update({
          status: 'revoked',
          revoked_by: revokedBy,
          revoked_at: new Date().toISOString(),
          revocation_reason: reason
        })
        .eq('id', certificateId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error revoking certificate:', error);
      throw new Error('Failed to revoke certificate');
    }
  }

  // Get certificate statistics
  static async getCertificateStats(organizationId?: string): Promise<{
    total: number;
    active: number;
    expired: number;
    revoked: number;
    pending: number;
    byType: Record<string, number>;
  }> {
    try {
      let query = supabase
        .from('certificates')
        .select('status, certificate_type');

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data: certificates, error } = await query;

      if (error) throw error;

      const stats = {
        total: certificates.length,
        active: certificates.filter(c => c.status === 'active').length,
        expired: certificates.filter(c => c.status === 'expired').length,
        revoked: certificates.filter(c => c.status === 'revoked').length,
        pending: certificates.filter(c => c.status === 'pending').length,
        byType: {} as Record<string, number>
      };

      // Count by type
      certificates.forEach(cert => {
        if (cert.certificate_type) {
          stats.byType[cert.certificate_type] = (stats.byType[cert.certificate_type] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching certificate stats:', error);
      throw new Error('Failed to fetch certificate statistics');
    }
  }

  // Upload certificate document
  static async uploadDocument(file: File, organizationId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizationId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading certificate document:', error);
      throw new Error('Failed to upload certificate document');
    }
  }

  // Delete certificate document
  static async deleteDocument(url: string): Promise<void> {
    try {
      const fileName = url.split('/').pop();
      if (!fileName) throw new Error('Invalid document URL');

      const { error } = await supabase.storage
        .from('certificates')
        .remove([fileName]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting certificate document:', error);
      throw new Error('Failed to delete certificate document');
    }
  }
} 