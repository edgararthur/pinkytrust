import { supabase } from '@/lib/supabase';
import { BaseApiService, mockData } from './api/base';
import { OrganizationsService as OrganizationsAPI } from './api/organizations';
import { CertificatesService as CertificatesAPI } from './api/certificates';

// Dashboard API with fallback
export const DashboardAPI = {
  async getStats() {
    const fallbackData = {
      organizations: {
        total: mockData.organizations.length,
        approved: mockData.organizations.filter(o => o.status === 'approved').length,
        pending: mockData.organizations.filter(o => o.status === 'pending').length,
        rejected: mockData.organizations.filter(o => o.status === 'rejected').length
      },
      certificates: {
        total: mockData.certificates.length,
        active: mockData.certificates.filter(c => c.status === 'active').length,
        expired: mockData.certificates.filter(c => c.status === 'expired').length,
        pending: mockData.certificates.filter(c => c.status === 'pending').length,
        revoked: mockData.certificates.filter(c => c.status === 'revoked').length
      },
      events: {
        total: mockData.events.length,
        upcoming: mockData.events.filter(e => new Date(e.start_date) > new Date()).length,
        ongoing: mockData.events.filter(e => {
          const now = new Date();
          return new Date(e.start_date) <= now && new Date(e.end_date) >= now;
        }).length,
        completed: mockData.events.filter(e => new Date(e.end_date) < new Date()).length
      },
      reports: {
        total: mockData.reports.length,
        approved: mockData.reports.filter(r => r.status === 'approved').length,
        pending: mockData.reports.filter(r => r.status === 'pending').length,
        rejected: mockData.reports.filter(r => r.status === 'rejected').length
      }
    };

    return BaseApiService.handleApiCall(
      async () => {
        const [orgStats, certStats] = await Promise.all([
          OrganizationsAPI.getOrganizationStats(),
          CertificatesAPI.getCertificateStats(),
        ]);

        return {
          organizations: orgStats,
          certificates: certStats,
          events: { total: 0, upcoming: 0, ongoing: 0, completed: 0 },
          reports: { total: 0, approved: 0, pending: 0, rejected: 0 }
        };
      },
      fallbackData,
      'getDashboardStats'
    );
  },

  async getRecentActivity() {
    const fallbackData = [
      {
        id: '1',
        type: 'organization_approved',
        title: 'Organization Approved',
        description: 'Health Community Center has been approved',
        timestamp: new Date().toISOString(),
        user: 'admin',
        metadata: { organization_id: '1' }
      },
      {
        id: '2',
        type: 'certificate_issued',
        title: 'Certificate Issued',
        description: 'Screening certificate issued to Health Community Center',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: 'admin',
        metadata: { certificate_id: '1' }
      }
    ];

    return BaseApiService.handleApiCall(
      async () => {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        return data || [];
      },
      fallbackData,
      'getRecentActivity'
    );
  },

  async getNotifications() {
    const fallbackData = [
      {
        id: '1',
        type: 'info',
        title: 'System Status',
        message: 'All systems operational',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'Pending Approvals',
        message: 'You have 2 organizations pending approval',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false
      }
    ];

    return BaseApiService.handleApiCall(
      async () => {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', 'admin')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        return data || [];
      },
      fallbackData,
      'getNotifications'
    );
  }
};

// Events API with fallback
export const EventsAPI = {
  async getEvents(filters = {}, page = 1, limit = 10) {
    const fallbackData = {
      data: mockData.events.slice((page - 1) * limit, page * limit),
      total: mockData.events.length
    };

    return BaseApiService.handleApiCall(
      async () => {
        let query = supabase
          .from('events_with_organization')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        const { data, error, count } = await query
          .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return {
          data: data || [],
          total: count || 0
        };
      },
      fallbackData,
      'getEvents'
    );
  },

  async getEventStats() {
    const fallbackData = {
      total: mockData.events.length,
      upcoming: mockData.events.filter(e => new Date(e.start_date) > new Date()).length,
      ongoing: mockData.events.filter(e => {
        const now = new Date();
        return new Date(e.start_date) <= now && new Date(e.end_date) >= now;
      }).length,
      completed: mockData.events.filter(e => new Date(e.end_date) < new Date()).length
    };

    return BaseApiService.handleApiCall(
      async () => {
        const { data, error } = await supabase
          .from('events')
          .select('start_date, end_date, status');

        if (error) throw error;

        const now = new Date();
        const stats = data.reduce((acc, event) => {
          acc.total++;
          const startDate = new Date(event.start_date);
          const endDate = new Date(event.end_date);
          
          if (startDate > now) {
            acc.upcoming++;
          } else if (startDate <= now && endDate >= now) {
            acc.ongoing++;
          } else {
            acc.completed++;
          }
          
          return acc;
        }, {
          total: 0,
          upcoming: 0,
          ongoing: 0,
          completed: 0
        });

        return stats;
      },
      fallbackData,
      'getEventStats'
    );
  }
};

// Reports API with fallback
export const ReportsAPI = {
  async getReports(filters = {}, page = 1, limit = 10) {
    const fallbackData = {
      data: mockData.reports.slice((page - 1) * limit, page * limit),
      total: mockData.reports.length
    };

    return BaseApiService.handleApiCall(
      async () => {
        let query = supabase
          .from('reports_with_organization')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        const { data, error, count } = await query
          .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return {
          data: data || [],
          total: count || 0
        };
      },
      fallbackData,
      'getReports'
    );
  },

  async approveReport(reportId: string, notes?: string) {
    const fallbackData = {
      id: reportId,
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'admin'
    };

    return BaseApiService.handleApiCall(
      async () => {
        const { data, error } = await supabase
          .from('reports')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: 'admin',
            review_notes: notes
          })
          .eq('id', reportId)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      fallbackData,
      'approveReport'
    );
  },

  async rejectReport(reportId: string, reason: string) {
    const fallbackData = {
      id: reportId,
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'admin'
    };

    return BaseApiService.handleApiCall(
      async () => {
        const { data, error } = await supabase
          .from('reports')
          .update({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            reviewed_by: 'admin',
            review_notes: reason
          })
          .eq('id', reportId)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      fallbackData,
      'rejectReport'
    );
  }
};

// Auth API with fallback
export const AuthAPI = {
  async login(email: string, password: string) {
    const fallbackData = {
      user: {
        id: 'admin',
        email: email,
        role: 'admin',
        name: 'Admin User',
        avatar: null
      },
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000
      }
    };

    return BaseApiService.handleApiCall(
      async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        return {
          user: data.user,
          session: data.session
        };
      },
      fallbackData,
      'login'
    );
  },

  async checkAuth() {
    const fallbackData = {
      user: {
        id: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin User',
        avatar: null
      },
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000
      }
    };

    return BaseApiService.handleApiCall(
      async () => {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        return {
          user: session?.user || null,
          session: session
        };
      },
      fallbackData,
      'checkAuth'
    );
  },

  async logout() {
    return BaseApiService.handleApiCall(
      async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
      },
      { success: true },
      'logout'
    );
  }
};

// Export all services with proper names
export const DashboardService = DashboardAPI;
export const OrganizationsService = OrganizationsAPI;
export const CertificatesService = CertificatesAPI;
export const EventsService = EventsAPI;
export const ReportsService = ReportsAPI;
export const AuthService = AuthAPI;
