export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'organiser' | 'volunteer';
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  municipality: string;
  logo_url?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  event_type: 'screening' | 'education' | 'support' | 'awareness' | 'fundraising';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  location: string;
  address: string;
  max_participants?: number;
  current_participants: number;
  registration_deadline?: string;
  contact_email: string;
  contact_phone?: string;
  requirements?: string[];
  images?: string[];
  documents?: string[];
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

export interface Volunteer {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  profile_image_url?: string;
  skills?: string[];
  availability?: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  organization_id: string;
  event_id?: string;
  title: string;
  description?: string;
  type: 'event' | 'monthly' | 'quarterly' | 'annual';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  data: Record<string, any>;
  submitted_at?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  event?: Event;
}

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalVolunteers: number;
  activeVolunteers: number;
  totalReports: number;
  pendingReports: number;
  totalParticipants: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
} 