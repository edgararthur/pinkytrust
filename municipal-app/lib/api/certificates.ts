import { supabase } from '@/lib/supabase';
import { BaseApiService, mockData } from './base';
import type { Database } from '@/lib/supabase/types';

export type Certificate = Database['public']['Tables']['certificates']['Row'];
export type CertificateWithOrganization = Certificate & {
  organization_name: string;
  organization_email: string;
};

export interface CertificateFilters {
  status?: string;
  type?: string;
  organization?: string;
  municipalityId?: string; // Add municipalityId
  search?: string;
}

export interface CertificateStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
  revoked: number;
}

export class CertificatesService extends BaseApiService {
  static async getCertificates(
    filters: CertificateFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: CertificateWithOrganization[]; total: number }> {
    const fallbackData = {
      data: mockData.certificates.slice((page - 1) * limit, page * limit),
      total: mockData.certificates.length
    };

    return this.handleApiCall(
      async () => {
        let query = supabase
          .from('certificates_with_organization')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.type) {
          query = query.eq('certificate_type', filters.type);
        }
        if (filters.organization) {
          query = query.eq('organization_id', filters.organization);
        }
        if (filters.municipalityId) {
          query = query.eq('municipality_id', filters.municipalityId);
        }
        if (filters.search) {
          query = query.or(`certificate_number.ilike.%${filters.search}%,organization_name.ilike.%${filters.search}%`);
        }

        const { data, error, count } = await query
          .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return {
          data: data || [],
          total: count || 0
        };
      },
      fallbackData,
      'getCertificates'
    );
  }

  static async getCertificateStats(): Promise<CertificateStats> {
    const fallbackData: CertificateStats = {
      total: mockData.certificates.length,
      active: mockData.certificates.filter(c => c.status === 'active').length,
      expired: mockData.certificates.filter(c => c.status === 'expired').length,
      pending: mockData.certificates.filter(c => c.status === 'pending').length,
      revoked: mockData.certificates.filter(c => c.status === 'revoked').length
    };

    return this.handleApiCall(
      async () => {
        const { data, error } = await supabase
          .from('certificates')
          .select('status');

        if (error) throw error;

        const stats = data.reduce((acc, cert) => {
          acc.total++;
          acc[cert.status as keyof CertificateStats]++;
          return acc;
        }, {
          total: 0,
          active: 0,
          expired: 0,
          pending: 0,
          revoked: 0
        });

        return stats;
      },
      fallbackData,
      'getCertificateStats'
    );
  }

  static async issueCertificate(certificateData: {
    organization_id: string;
    certificate_type: string;
    expiry_date: string;
    notes?: string;
  }): Promise<Certificate> {
    const fallbackData: Certificate = {
      id: Date.now().toString(),
      certificate_number: `CERT-${Date.now()}`,
      organization_id: certificateData.organization_id,
      certificate_type: certificateData.certificate_type as any,
      status: 'active' as any,
      issue_date: new Date().toISOString(),
      expiry_date: certificateData.expiry_date,
      issued_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      document_url: null,
      notes: certificateData.notes || null
    };

    return this.handleApiCall(
      async () => {
        const { data, error } = await supabase
          .from('certificates')
          .insert({
            ...certificateData,
            certificate_number: `CERT-${Date.now()}`,
            status: 'active',
            issue_date: new Date().toISOString(),
            issued_by: 'admin'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      fallbackData,
      'issueCertificate'
    );
  }

  static async revokeCertificate(certificateId: string, reason: string): Promise<Certificate> {
    const fallbackData: Certificate = {
      id: certificateId,
      certificate_number: `CERT-${certificateId}`,
      organization_id: '1',
      certificate_type: 'screening' as any,
      status: 'revoked' as any,
      issue_date: new Date().toISOString(),
      expiry_date: new Date().toISOString(),
      issued_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      document_url: null,
      notes: `Revoked: ${reason}`
    };

    return this.handleApiCall(
      async () => {
        const { data, error } = await supabase
          .from('certificates')
          .update({
            status: 'revoked',
            notes: `Revoked: ${reason}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', certificateId)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      fallbackData,
      'revokeCertificate'
    );
  }

  static async updateCertificate(certificateId: string, updates: Partial<Certificate>): Promise<Certificate> {
    const fallbackData: Certificate = {
      id: certificateId,
      certificate_number: `CERT-${certificateId}`,
      organization_id: '1',
      certificate_type: 'screening' as any,
      status: 'active' as any,
      issue_date: new Date().toISOString(),
      expiry_date: new Date().toISOString(),
      issued_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      document_url: null,
      notes: null,
      ...updates
    };

    return this.handleApiCall(
      async () => {
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
      },
      fallbackData,
      'updateCertificate'
    );
  }
}
