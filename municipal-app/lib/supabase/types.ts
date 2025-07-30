export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Type aliases for easier use
export type UserRole = 'admin' | 'moderator' | 'viewer';
export type OrganizationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type CertificateStatus = 'active' | 'expired' | 'revoked' | 'pending';
export type CertificateType = 'screening' | 'education' | 'support' | 'general';
export type EventStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
export type EventType = 'screening' | 'education' | 'fundraising' | 'awareness' | 'support';
export type ReportStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
export type ReportType = 'event' | 'monthly' | 'quarterly' | 'annual' | 'custom';
export type ActivityStatus = 'success' | 'failed' | 'warning';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string
          email: string
          password_hash: string
          role: string
          first_name: string
          last_name: string
          phone: string | null
          profile_image_url: string | null
          is_active: boolean
          municipality_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string
          email: string
          password_hash?: string
          role?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          profile_image_url?: string | null
          is_active?: boolean
          municipality_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email?: string
          password_hash?: string
          role?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          profile_image_url?: string | null
          is_active?: boolean
          municipality_id?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          contact_email: string
          contact_phone: string | null
          website: string | null
          address: string | null
          municipality_id: string | null
          registration_number: string | null
          registration_status: 'pending' | 'approved' | 'rejected' | 'suspended'
          certificate_status: 'active' | 'expired' | 'revoked' | 'pending' | null
          submitted_at: string
          approved_at: string | null
          rejected_at: string | null
          approved_by: string | null
          rejected_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          contact_email: string
          contact_phone?: string | null
          website?: string | null
          address?: string | null
          municipality_id?: string | null
          registration_number?: string | null
          registration_status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          certificate_status?: 'active' | 'expired' | 'revoked' | 'pending' | null
          submitted_at?: string
          approved_at?: string | null
          rejected_at?: string | null
          approved_by?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          contact_email?: string
          contact_phone?: string | null
          website?: string | null
          address?: string | null
          municipality_id?: string | null
          registration_number?: string | null
          registration_status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          certificate_status?: 'active' | 'expired' | 'revoked' | 'pending' | null
          submitted_at?: string
          approved_at?: string | null
          rejected_at?: string | null
          approved_by?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      municipalities: {
        Row: {
          id: string
          name: string
          code: string
          region: string
          district: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          region: string
          district: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          region?: string
          district?: string
          created_at?: string
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          certificate_number: string
          organization_id: string
          certificate_type: 'screening' | 'education' | 'support' | 'general'
          status: 'active' | 'expired' | 'revoked' | 'pending'
          issue_date: string
          expiry_date: string
          issued_by: string
          revoked_at: string | null
          revoked_by: string | null
          revoked_reason: string | null
          document_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          certificate_number?: string
          organization_id: string
          certificate_type: 'screening' | 'education' | 'support' | 'general'
          status?: 'active' | 'expired' | 'revoked' | 'pending'
          issue_date: string
          expiry_date: string
          issued_by: string
          revoked_at?: string | null
          revoked_by?: string | null
          revoked_reason?: string | null
          document_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          certificate_number?: string
          organization_id?: string
          certificate_type?: 'screening' | 'education' | 'support' | 'general'
          status?: 'active' | 'expired' | 'revoked' | 'pending'
          issue_date?: string
          expiry_date?: string
          issued_by?: string
          revoked_at?: string | null
          revoked_by?: string | null
          revoked_reason?: string | null
          document_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          organization_id: string
          event_type: 'screening' | 'education' | 'fundraising' | 'awareness' | 'support'
          status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled'
          start_date: string
          end_date: string
          location: string
          max_participants: number | null
          current_participants: number
          registration_deadline: string | null
          contact_email: string
          contact_phone: string | null
          requirements: string[] | null
          submitted_at: string | null
          approved_at: string | null
          rejected_at: string | null
          approved_by: string | null
          rejected_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          organization_id: string
          event_type: 'screening' | 'education' | 'fundraising' | 'awareness' | 'support'
          status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled'
          start_date: string
          end_date: string
          location: string
          max_participants?: number | null
          current_participants?: number
          registration_deadline?: string | null
          contact_email: string
          contact_phone?: string | null
          requirements?: string[] | null
          submitted_at?: string | null
          approved_at?: string | null
          rejected_at?: string | null
          approved_by?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          organization_id?: string
          event_type?: 'screening' | 'education' | 'fundraising' | 'awareness' | 'support'
          status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled'
          start_date?: string
          end_date?: string
          location?: string
          max_participants?: number | null
          current_participants?: number
          registration_deadline?: string | null
          contact_email?: string
          contact_phone?: string | null
          requirements?: string[] | null
          submitted_at?: string | null
          approved_at?: string | null
          rejected_at?: string | null
          approved_by?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          title: string
          description: string | null
          event_id: string | null
          organization_id: string
          report_type: 'event' | 'monthly' | 'quarterly' | 'annual' | 'custom'
          status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          submitted_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          feedback: string | null
          document_url: string | null
          data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_id?: string | null
          organization_id: string
          report_type: 'event' | 'monthly' | 'quarterly' | 'annual' | 'custom'
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          submitted_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          feedback?: string | null
          document_url?: string | null
          data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_id?: string | null
          organization_id?: string
          report_type?: 'event' | 'monthly' | 'quarterly' | 'annual' | 'custom'
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          submitted_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          feedback?: string | null
          document_url?: string | null
          data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          action: string
          resource: string
          resource_id: string
          resource_name: string
          user_id: string | null
          user_name: string
          user_email: string
          ip_address: string | null
          user_agent: string | null
          status: 'success' | 'failed' | 'warning'
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          resource: string
          resource_id: string
          resource_name: string
          user_id?: string | null
          user_name: string
          user_email: string
          ip_address?: string | null
          user_agent?: string | null
          status?: 'success' | 'failed' | 'warning'
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          resource?: string
          resource_id?: string
          resource_name?: string
          user_id?: string | null
          user_name?: string
          user_email?: string
          ip_address?: string | null
          user_agent?: string | null
          status?: 'success' | 'failed' | 'warning'
          details?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      organizations_with_stats: {
        Row: {
          id: string
          name: string
          description: string | null
          contact_email: string
          contact_phone: string | null
          website: string | null
          address: string | null
          municipality_id: string | null
          municipality_name: string | null
          municipality_code: string | null
          registration_number: string | null
          registration_status: 'pending' | 'approved' | 'rejected' | 'suspended'
          certificate_status: 'active' | 'expired' | 'revoked' | 'pending' | null
          submitted_at: string
          approved_at: string | null
          rejected_at: string | null
          approved_by: string | null
          rejected_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
          certificates_count: number
          events_count: number
          reports_count: number
        }
      }
      certificates_with_organization: {
        Row: {
          id: string
          certificate_number: string
          organization_id: string
          certificate_type: 'screening' | 'education' | 'support' | 'general'
          status: 'active' | 'expired' | 'revoked' | 'pending'
          issue_date: string
          expiry_date: string
          issued_by: string
          revoked_at: string | null
          revoked_by: string | null
          revoked_reason: string | null
          document_url: string | null
          created_at: string
          updated_at: string
          organization_name: string
          organization_email: string
        }
      }
      events_with_organization: {
        Row: {
          id: string
          title: string
          description: string
          organization_id: string
          event_type: 'screening' | 'education' | 'fundraising' | 'awareness' | 'support'
          status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled'
          start_date: string
          end_date: string
          location: string
          max_participants: number | null
          current_participants: number
          registration_deadline: string | null
          contact_email: string
          contact_phone: string | null
          requirements: string[] | null
          submitted_at: string | null
          approved_at: string | null
          rejected_at: string | null
          approved_by: string | null
          rejected_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
          organization_name: string
          organization_email: string
        }
      }
      reports_with_details: {
        Row: {
          id: string
          title: string
          description: string | null
          event_id: string | null
          organization_id: string
          report_type: 'event' | 'monthly' | 'quarterly' | 'annual' | 'custom'
          status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          submitted_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          feedback: string | null
          document_url: string | null
          data: Json | null
          created_at: string
          updated_at: string
          organization_name: string
          event_title: string | null
          event_date: string | null
        }
      }
    }
    Functions: {
      generate_certificate_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: 'admin' | 'moderator' | 'viewer'
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_admin_or_moderator: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_action: string
          p_resource: string
          p_resource_id: string
          p_resource_name: string
          p_user_id: string
          p_user_name: string
          p_user_email: string
          p_ip_address?: string
          p_user_agent?: string
          p_status?: 'success' | 'failed' | 'warning'
          p_details?: Json
        }
        Returns: string
      }
    }
    Enums: {
      user_role: 'admin' | 'moderator' | 'viewer'
      organization_status: 'pending' | 'approved' | 'rejected' | 'suspended'
      certificate_status: 'active' | 'expired' | 'revoked' | 'pending'
      certificate_type: 'screening' | 'education' | 'support' | 'general'
      event_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled'
      event_type: 'screening' | 'education' | 'fundraising' | 'awareness' | 'support'
      report_status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
      report_type: 'event' | 'monthly' | 'quarterly' | 'annual' | 'custom'
      activity_status: 'success' | 'failed' | 'warning'
    }
  }
}
