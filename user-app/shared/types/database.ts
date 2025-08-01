// Database types for the Breast Cancer Platform
export type UserRole = 'municipal' | 'organiser' | 'user' | 'volunteer';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
export type CertificateStatus = 'active' | 'revoked' | 'expired';
export type EventStatus = 'planned' | 'ongoing' | 'completed' | 'cancelled';
export type AttendeeStatus = 'rsvp' | 'checked_in' | 'cancelled';
export type VolunteerStatus = 'active' | 'inactive';
export type ReportStatus = 'pending' | 'approved' | 'rejected';
export type SupportRequestType = 'financial' | 'emotional' | 'logistical' | 'medical';
export type SupportRequestStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type RiskLevel = 'low' | 'medium' | 'high';
export type NotificationType = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationStatus = 'sent' | 'pending' | 'failed';
export type ContentType = 'text' | 'video' | 'audio' | 'image';
export type PostCategory = 'story' | 'question' | 'support' | 'general';

export interface User {
  user_id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organisation {
  organisation_id: string;
  name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  website?: string;
  description?: string;
  registration_status: RegistrationStatus;
  registration_number?: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  certificate_id: string;
  organisation_id: string;
  issued_by: string;
  issue_date: string;
  expiry_date?: string;
  status: CertificateStatus;
  certificate_url?: string;
  qr_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  organisation?: Organisation;
  issuer?: User;
}

export interface Event {
  event_id: string;
  organisation_id: string;
  title: string;
  description?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string;
  start_date: string;
  end_date: string;
  status: EventStatus;
  max_attendees?: number;
  flyer_url?: string;
  contact_info?: string;
  requirements?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  organisation?: Organisation;
  creator?: User;
  attendees?: EventAttendee[];
  volunteers?: Volunteer[];
}

export interface EventAttendee {
  attendee_id: string;
  event_id: string;
  user_id: string;
  status: AttendeeStatus;
  check_in_time?: string;
  created_at: string;
  // Relations
  event?: Event;
  user?: User;
}

export interface Volunteer {
  volunteer_id: string;
  user_id: string;
  organisation_id: string;
  event_id: string;
  role?: string;
  assigned_tasks?: string;
  status: VolunteerStatus;
  created_at: string;
  // Relations
  user?: User;
  organisation?: Organisation;
  event?: Event;
}

export interface Report {
  report_id: string;
  event_id: string;
  organisation_id: string;
  submitted_by: string;
  suspected_cases: number;
  attendees_count: number;
  report_details?: string;
  document_url?: string;
  images_urls?: string[];
  submitted_at: string;
  status: ReportStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  // Relations
  event?: Event;
  organisation?: Organisation;
  submitter?: User;
  reviewer?: User;
}

export interface SupportRequest {
  request_id: string;
  user_id: string;
  request_type: SupportRequestType;
  title: string;
  description?: string;
  priority: Priority;
  status: SupportRequestStatus;
  assigned_to?: string;
  submitted_at: string;
  updated_at: string;
  resolved_at?: string;
  // Relations
  user?: User;
  assignee?: User;
}

export interface SelfAssessment {
  assessment_id: string;
  user_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  responses: Record<string, any>;
  recommendations?: string;
  submitted_at: string;
  // Relations
  user?: User;
}

export interface Notification {
  notification_id: string;
  user_id: string;
  type: NotificationType;
  title?: string;
  message: string;
  status: NotificationStatus;
  read_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  // Relations
  user?: User;
}

export interface Content {
  content_id: string;
  title: string;
  type: ContentType;
  body?: string;
  media_url?: string;
  thumbnail_url?: string;
  author?: string;
  tags?: string[];
  is_published: boolean;
  published_at?: string;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityPost {
  post_id: string;
  user_id: string;
  title: string;
  content: string;
  category?: PostCategory;
  is_anonymous: boolean;
  is_moderated: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  user?: User;
  comments?: CommunityComment[];
}

export interface CommunityComment {
  comment_id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  // Relations
  post?: CommunityPost;
  user?: User;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface CreateOrganisationForm {
  name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  website?: string;
  description?: string;
  registration_number?: string;
  document?: File;
}

export interface CreateEventForm {
  title: string;
  description?: string;
  address: string;
  coordinates?: [number, number];
  start_date: string;
  end_date: string;
  max_attendees?: number;
  contact_info?: string;
  requirements?: string;
  flyer?: File;
}

export interface CreateReportForm {
  event_id: string;
  suspected_cases: number;
  attendees_count: number;
  report_details?: string;
  document?: File;
  images?: File[];
}

export interface CreateSupportRequestForm {
  request_type: SupportRequestType;
  title: string;
  description?: string;
  priority: Priority;
}

export interface SelfAssessmentForm {
  age: number;
  family_history: boolean;
  personal_history: boolean;
  lifestyle_factors: {
    exercise: boolean;
    diet: boolean;
    alcohol: boolean;
    smoking: boolean;
  };
  symptoms: {
    lump: boolean;
    pain: boolean;
    discharge: boolean;
    skin_changes: boolean;
  };
  last_screening?: string;
}

// Dashboard analytics types
export interface DashboardStats {
  total_organisations: number;
  active_organisations: number;
  pending_organisations: number;
  total_events: number;
  active_events: number;
  completed_events: number;
  total_users: number;
  total_reports: number;
  pending_reports: number;
}

export interface EventAnalytics {
  event_id: string;
  title: string;
  attendees_registered: number;
  attendees_checked_in: number;
  volunteers_count: number;
  suspected_cases: number;
  completion_status: EventStatus;
}

export interface RegionalStats {
  region: string;
  organisation_count: number;
  event_count: number;
  attendee_count: number;
  suspected_cases: number;
}

// Geospatial types
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface EventWithDistance extends Event {
  distance?: number; // Distance in kilometers
}

// Search and filter types
export interface EventFilters {
  status?: EventStatus[];
  organisation_id?: string;
  start_date?: string;
  end_date?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  search?: string;
}

export interface OrganisationFilters {
  status?: RegistrationStatus[];
  search?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export interface ReportFilters {
  status?: ReportStatus[];
  organisation_id?: string;
  event_id?: string;
  submitted_after?: string;
  submitted_before?: string;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
}

// PWA and offline types
export interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  retries: number;
}

export interface AppSettings {
  notifications_enabled: boolean;
  location_sharing: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  offline_mode: boolean;
}

// QR Code types
export interface QRCodeData {
  type: 'event_checkin' | 'certificate_verification';
  id: string;
  timestamp: string;
  signature?: string;
}

// File upload types
export interface FileUploadResponse {
  url: string;
  path: string;
  size: number;
  type: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
} 