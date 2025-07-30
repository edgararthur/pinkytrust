// Auto-generated Supabase types for TypeScript integration
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
      certificates: {
        Row: {
          certificate_id: string
          organisation_id: string
          issued_by: string
          issue_date: string
          expiry_date: string | null
          status: 'active' | 'revoked' | 'expired'
          certificate_url: string | null
          qr_code: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          certificate_id?: string
          organisation_id: string
          issued_by: string
          issue_date?: string
          expiry_date?: string | null
          status?: 'active' | 'revoked' | 'expired'
          certificate_url?: string | null
          qr_code?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          certificate_id?: string
          organisation_id?: string
          issued_by?: string
          issue_date?: string
          expiry_date?: string | null
          status?: 'active' | 'revoked' | 'expired'
          certificate_url?: string | null
          qr_code?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      community_comments: {
        Row: {
          comment_id: string
          post_id: string
          user_id: string
          content: string
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          comment_id?: string
          post_id: string
          user_id: string
          content: string
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          comment_id?: string
          post_id?: string
          user_id?: string
          content?: string
          is_anonymous?: boolean
          created_at?: string
        }
      }
      community_posts: {
        Row: {
          post_id: string
          user_id: string
          title: string
          content: string
          category: 'story' | 'question' | 'support' | 'general' | null
          is_anonymous: boolean
          is_moderated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          post_id?: string
          user_id: string
          title: string
          content: string
          category?: 'story' | 'question' | 'support' | 'general' | null
          is_anonymous?: boolean
          is_moderated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          post_id?: string
          user_id?: string
          title?: string
          content?: string
          category?: 'story' | 'question' | 'support' | 'general' | null
          is_anonymous?: boolean
          is_moderated?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      content: {
        Row: {
          content_id: string
          title: string
          type: 'text' | 'video' | 'audio' | 'image'
          body: string | null
          media_url: string | null
          thumbnail_url: string | null
          author: string | null
          tags: string[] | null
          is_published: boolean
          published_at: string | null
          view_count: number
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          content_id?: string
          title: string
          type: 'text' | 'video' | 'audio' | 'image'
          body?: string | null
          media_url?: string | null
          thumbnail_url?: string | null
          author?: string | null
          tags?: string[] | null
          is_published?: boolean
          published_at?: string | null
          view_count?: number
          like_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          content_id?: string
          title?: string
          type?: 'text' | 'video' | 'audio' | 'image'
          body?: string | null
          media_url?: string | null
          thumbnail_url?: string | null
          author?: string | null
          tags?: string[] | null
          is_published?: boolean
          published_at?: string | null
          view_count?: number
          like_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      event_attendees: {
        Row: {
          attendee_id: string
          event_id: string
          user_id: string
          status: 'rsvp' | 'checked_in' | 'cancelled'
          check_in_time: string | null
          created_at: string
        }
        Insert: {
          attendee_id?: string
          event_id: string
          user_id: string
          status?: 'rsvp' | 'checked_in' | 'cancelled'
          check_in_time?: string | null
          created_at?: string
        }
        Update: {
          attendee_id?: string
          event_id?: string
          user_id?: string
          status?: 'rsvp' | 'checked_in' | 'cancelled'
          check_in_time?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          event_id: string
          organisation_id: string
          title: string
          description: string | null
          location: unknown | null
          address: string | null
          start_date: string
          end_date: string
          status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
          max_attendees: number | null
          flyer_url: string | null
          contact_info: string | null
          requirements: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          event_id?: string
          organisation_id: string
          title: string
          description?: string | null
          location?: unknown | null
          address?: string | null
          start_date: string
          end_date: string
          status?: 'planned' | 'ongoing' | 'completed' | 'cancelled'
          max_attendees?: number | null
          flyer_url?: string | null
          contact_info?: string | null
          requirements?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          event_id?: string
          organisation_id?: string
          title?: string
          description?: string | null
          location?: unknown | null
          address?: string | null
          start_date?: string
          end_date?: string
          status?: 'planned' | 'ongoing' | 'completed' | 'cancelled'
          max_attendees?: number | null
          flyer_url?: string | null
          contact_info?: string | null
          requirements?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          notification_id: string
          user_id: string
          type: 'email' | 'sms' | 'push' | 'in_app'
          title: string | null
          message: string
          status: 'sent' | 'pending' | 'failed'
          read_at: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          notification_id?: string
          user_id: string
          type: 'email' | 'sms' | 'push' | 'in_app'
          title?: string | null
          message: string
          status?: 'sent' | 'pending' | 'failed'
          read_at?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          notification_id?: string
          user_id?: string
          type?: 'email' | 'sms' | 'push' | 'in_app'
          title?: string | null
          message?: string
          status?: 'sent' | 'pending' | 'failed'
          read_at?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      organisations: {
        Row: {
          organisation_id: string
          name: string
          contact_email: string
          contact_phone: string | null
          address: string | null
          location: unknown | null
          website: string | null
          description: string | null
          registration_status: 'pending' | 'approved' | 'rejected'
          registration_number: string | null
          document_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          organisation_id?: string
          name: string
          contact_email: string
          contact_phone?: string | null
          address?: string | null
          location?: unknown | null
          website?: string | null
          description?: string | null
          registration_status?: 'pending' | 'approved' | 'rejected'
          registration_number?: string | null
          document_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          organisation_id?: string
          name?: string
          contact_email?: string
          contact_phone?: string | null
          address?: string | null
          location?: unknown | null
          website?: string | null
          description?: string | null
          registration_status?: 'pending' | 'approved' | 'rejected'
          registration_number?: string | null
          document_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          report_id: string
          event_id: string
          organisation_id: string
          submitted_by: string
          suspected_cases: number
          attendees_count: number
          report_details: string | null
          document_url: string | null
          images_urls: string[] | null
          submitted_at: string
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
        }
        Insert: {
          report_id?: string
          event_id: string
          organisation_id: string
          submitted_by: string
          suspected_cases?: number
          attendees_count?: number
          report_details?: string | null
          document_url?: string | null
          images_urls?: string[] | null
          submitted_at?: string
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
        }
        Update: {
          report_id?: string
          event_id?: string
          organisation_id?: string
          submitted_by?: string
          suspected_cases?: number
          attendees_count?: number
          report_details?: string | null
          document_url?: string | null
          images_urls?: string[] | null
          submitted_at?: string
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
        }
      }
      self_assessments: {
        Row: {
          assessment_id: string
          user_id: string
          risk_score: number | null
          risk_level: 'low' | 'medium' | 'high' | null
          responses: Json
          recommendations: string | null
          submitted_at: string
        }
        Insert: {
          assessment_id?: string
          user_id: string
          risk_score?: number | null
          risk_level?: 'low' | 'medium' | 'high' | null
          responses: Json
          recommendations?: string | null
          submitted_at?: string
        }
        Update: {
          assessment_id?: string
          user_id?: string
          risk_score?: number | null
          risk_level?: 'low' | 'medium' | 'high' | null
          responses?: Json
          recommendations?: string | null
          submitted_at?: string
        }
      }
      support_requests: {
        Row: {
          request_id: string
          user_id: string
          request_type: 'financial' | 'emotional' | 'logistical' | 'medical'
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
          assigned_to: string | null
          submitted_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          request_id?: string
          user_id: string
          request_type: 'financial' | 'emotional' | 'logistical' | 'medical'
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'resolved' | 'rejected'
          assigned_to?: string | null
          submitted_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          request_id?: string
          user_id?: string
          request_type?: 'financial' | 'emotional' | 'logistical' | 'medical'
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'resolved' | 'rejected'
          assigned_to?: string | null
          submitted_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
      users: {
        Row: {
          user_id: string
          email: string
          password_hash: string
          role: 'municipal' | 'organiser' | 'user' | 'volunteer'
          first_name: string | null
          last_name: string | null
          phone: string | null
          profile_image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string
          email: string
          password_hash: string
          role: 'municipal' | 'organiser' | 'user' | 'volunteer'
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          profile_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email?: string
          password_hash?: string
          role?: 'municipal' | 'organiser' | 'user' | 'volunteer'
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          profile_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      volunteers: {
        Row: {
          volunteer_id: string
          user_id: string
          organisation_id: string
          event_id: string
          role: string | null
          assigned_tasks: string | null
          status: 'active' | 'inactive' | null
          created_at: string
        }
        Insert: {
          volunteer_id?: string
          user_id: string
          organisation_id: string
          event_id: string
          role?: string | null
          assigned_tasks?: string | null
          status?: 'active' | 'inactive' | null
          created_at?: string
        }
        Update: {
          volunteer_id?: string
          user_id?: string
          organisation_id?: string
          event_id?: string
          role?: string | null
          assigned_tasks?: string | null
          status?: 'active' | 'inactive' | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_risk_level: {
        Args: {
          score: number
        }
        Returns: string
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_event_analytics: {
        Args: {
          event_id?: string
        }
        Returns: Json
      }
      get_nearby_events: {
        Args: {
          lat: number
          lng: number
          radius_km: number
        }
        Returns: Json
      }
      get_regional_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_engagement: {
        Args: {
          user_id: string
        }
        Returns: Json
      }
      increment_content_likes: {
        Args: {
          content_id: string
        }
        Returns: undefined
      }
      increment_content_views: {
        Args: {
          content_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 