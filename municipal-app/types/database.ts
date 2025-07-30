export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'manager' | 'staff' | 'viewer'
          department: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role?: 'admin' | 'manager' | 'staff' | 'viewer'
          department?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'admin' | 'manager' | 'staff' | 'viewer'
          department?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organisations: {
        Row: {
          id: string
          name: string
          contact_email: string
          contact_phone: string | null
          address: string | null
          website: string | null
          description: string | null
          registration_status: 'pending' | 'approved' | 'rejected'
          registration_number: string | null
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          document_url: string | null
          events_count: number
          certificate_status: 'active' | 'revoked' | 'expired' | 'none' | null
          tags: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_email: string
          contact_phone?: string | null
          address?: string | null
          website?: string | null
          description?: string | null
          registration_status?: 'pending' | 'approved' | 'rejected'
          registration_number?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          document_url?: string | null
          events_count?: number
          certificate_status?: 'active' | 'revoked' | 'expired' | 'none' | null
          tags?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_email?: string
          contact_phone?: string | null
          address?: string | null
          website?: string | null
          description?: string | null
          registration_status?: 'pending' | 'approved' | 'rejected'
          registration_number?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          document_url?: string | null
          events_count?: number
          certificate_status?: 'active' | 'revoked' | 'expired' | 'none' | null
          tags?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          certificate_number: string
          organisation_id: string
          organisation_name: string
          status: 'active' | 'expired' | 'revoked' | 'pending'
          issue_date: string
          expiry_date: string
          issued_by: string
          revoked_at: string | null
          revoked_by: string | null
          revoked_reason: string | null
          certificate_type: 'screening' | 'education' | 'support' | 'general'
          document_url: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          certificate_number: string
          organisation_id: string
          organisation_name: string
          status?: 'active' | 'expired' | 'revoked' | 'pending'
          issue_date: string
          expiry_date: string
          issued_by: string
          revoked_at?: string | null
          revoked_by?: string | null
          revoked_reason?: string | null
          certificate_type: 'screening' | 'education' | 'support' | 'general'
          document_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          certificate_number?: string
          organisation_id?: string
          organisation_name?: string
          status?: 'active' | 'expired' | 'revoked' | 'pending'
          issue_date?: string
          expiry_date?: string
          issued_by?: string
          revoked_at?: string | null
          revoked_by?: string | null
          revoked_reason?: string | null
          certificate_type?: 'screening' | 'education' | 'support' | 'general'
          document_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          organisation_id: string
          organisation_name: string
          start_date: string
          end_date: string
          location: string
          address: string
          coordinates: Json | null
          status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
          max_attendees: number | null
          current_attendees: number
          checked_in_attendees: number
          volunteers_count: number
          suspected_cases: number
          report_submitted: boolean
          report_status: 'pending' | 'approved' | 'rejected' | null
          event_type: 'screening' | 'education' | 'support' | 'awareness' | 'fundraising'
          tags: string[] | null
          images: string[] | null
          documents: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          organisation_id: string
          organisation_name: string
          start_date: string
          end_date: string
          location: string
          address: string
          coordinates?: Json | null
          status?: 'planned' | 'ongoing' | 'completed' | 'cancelled'
          max_attendees?: number | null
          current_attendees?: number
          checked_in_attendees?: number
          volunteers_count?: number
          suspected_cases?: number
          report_submitted?: boolean
          report_status?: 'pending' | 'approved' | 'rejected' | null
          event_type: 'screening' | 'education' | 'support' | 'awareness' | 'fundraising'
          tags?: string[] | null
          images?: string[] | null
          documents?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          organisation_id?: string
          organisation_name?: string
          start_date?: string
          end_date?: string
          location?: string
          address?: string
          coordinates?: Json | null
          status?: 'planned' | 'ongoing' | 'completed' | 'cancelled'
          max_attendees?: number | null
          current_attendees?: number
          checked_in_attendees?: number
          volunteers_count?: number
          suspected_cases?: number
          report_submitted?: boolean
          report_status?: 'pending' | 'approved' | 'rejected' | null
          event_type?: 'screening' | 'education' | 'support' | 'awareness' | 'fundraising'
          tags?: string[] | null
          images?: string[] | null
          documents?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          event_id: string
          event_title: string
          organisation_id: string
          organisation_name: string
          submitted_at: string
          submitted_by: string
          status: 'pending' | 'approved' | 'rejected'
          reviewed_at: string | null
          reviewed_by: string | null
          review_notes: string | null
          data: Json
          attachments: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          event_title: string
          organisation_id: string
          organisation_name: string
          submitted_at?: string
          submitted_by: string
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_at?: string | null
          reviewed_by?: string | null
          review_notes?: string | null
          data: Json
          attachments?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          event_title?: string
          organisation_id?: string
          organisation_name?: string
          submitted_at?: string
          submitted_by?: string
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_at?: string | null
          reviewed_by?: string | null
          review_notes?: string | null
          data?: Json
          attachments?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          user_name: string
          action: string
          resource: string
          resource_id: string
          details: Json | null
          timestamp: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          action: string
          resource: string
          resource_id: string
          details?: Json | null
          timestamp?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string
          action?: string
          resource?: string
          resource_id?: string
          details?: Json | null
          timestamp?: string
          ip_address?: string | null
          user_agent?: string | null
        }
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          total_organisations: number
          active_organisations: number
          pending_organisations: number
          total_events: number
          active_events: number
          completed_events: number
          total_users: number
          total_reports: number
          pending_reports: number
          total_certificates: number
          active_certificates: number
          expiring_soon_certificates: number
          total_screenings: number
          suspected_cases: number
          referrals_made: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'manager' | 'staff' | 'viewer'
      registration_status: 'pending' | 'approved' | 'rejected'
      certificate_status: 'active' | 'expired' | 'revoked' | 'pending'
      event_status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
      report_status: 'pending' | 'approved' | 'rejected'
    }
  }
}
