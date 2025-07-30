import { z } from 'zod';

// Base types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Event types
export const EventSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().datetime(),
  time: z.string(),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
  organizer: z.string().min(1, 'Organizer is required'),
  max_attendees: z.number().positive(),
  current_attendees: z.number().nonnegative(),
  distance: z.number().nonnegative().optional(),
  image_url: z.string().url().optional(),
  is_registered: z.boolean().default(false),
  category: z.enum(['screening', 'education', 'support', 'workshop']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Event = z.infer<typeof EventSchema>;

// Assessment types
export const AssessmentQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(['boolean', 'number', 'select', 'multiselect']),
  options: z.array(z.string()).optional(),
  weight: z.number().positive(),
  category: z.enum(['demographic', 'family_history', 'personal_history', 'lifestyle', 'symptoms']),
  help_text: z.string().optional(),
  image_url: z.string().url().optional(),
  required: z.boolean().default(true),
});

export type AssessmentQuestion = z.infer<typeof AssessmentQuestionSchema>;

export const AssessmentAnswerSchema = z.object({
  question_id: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});

export type AssessmentAnswer = z.infer<typeof AssessmentAnswerSchema>;

export const RiskResultSchema = z.object({
  score: z.number().min(0).max(100),
  level: z.enum(['low', 'moderate', 'high']),
  recommendations: z.array(z.string()),
  next_steps: z.array(z.string()),
  created_at: z.string().datetime(),
});

export type RiskResult = z.infer<typeof RiskResultSchema>;

// Community types
export const CommunityPostSchema = z.object({
  id: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().url().optional(),
    is_verified: z.boolean(),
    role: z.string().optional(),
  }),
  content: z.string().min(1, 'Content is required'),
  timestamp: z.string().datetime(),
  likes: z.number().nonnegative(),
  comments: z.number().nonnegative(),
  is_liked: z.boolean(),
  image_url: z.string().url().optional(),
  tags: z.array(z.string()),
  type: z.enum(['story', 'question', 'update', 'milestone']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type CommunityPost = z.infer<typeof CommunityPostSchema>;

// Awareness content types
export const AwarenessContentSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  content: z.string().min(1, 'Content is required'),
  image_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
  read_time: z.string(),
  publish_date: z.string().datetime(),
  author: z.string().min(1, 'Author is required'),
  category: z.enum(['education', 'prevention', 'treatment', 'support', 'lifestyle']),
  likes: z.number().nonnegative(),
  is_liked: z.boolean(),
  is_bookmarked: z.boolean(),
  tags: z.array(z.string()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type AwarenessContent = z.infer<typeof AwarenessContentSchema>;

// Scanner types
export interface ScanHistory {
  id: string;
  event_name: string;
  scan_time: string;
  event_date: string;
  location: string;
  status: 'success' | 'error';
  qr_data?: string;
  created_at: string;
}

// Filter types
export interface EventFilters {
  date_range: 'today' | 'week' | 'month' | 'all';
  distance: number;
  event_type: 'all' | 'screening' | 'education' | 'support' | 'workshop';
  location?: string;
}

export interface ContentFilters {
  category: 'all' | 'education' | 'prevention' | 'treatment' | 'support' | 'lifestyle';
  search_query: string;
  author?: string;
  tags?: string[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// UI Component types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

// Navigation types
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  solid_icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg_color: string;
  is_center?: boolean;
}

// State management types
export interface AppState {
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  action_url?: string;
}

// Form types
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Search types
export interface SearchSuggestion {
  id: string;
  text: string;
  category: string;
  trending?: boolean;
  url?: string;
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
  user_id?: string;
}

// Health data types
export interface HealthStats {
  health_score: number;
  assessments_completed: number;
  events_attended: number;
  community_points: number;
  streak_days: number;
}

export interface HealthProgress {
  label: string;
  value: number;
  max: number;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartData {
  label: string;
  value: number;
  color: string;
}

export interface HealthChart {
  title: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: ChartData[];
  period?: 'daily' | 'weekly' | 'monthly';
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Environment types
export interface EnvironmentConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_MAPBOX_TOKEN?: string;
  NEXT_PUBLIC_ANALYTICS_ID?: string;
} 