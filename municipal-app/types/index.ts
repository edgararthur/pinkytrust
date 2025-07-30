import React from 'react';

// Core Types for Municipal Application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject';
}

export interface Organisation {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  description?: string;
  registrationStatus: 'pending' | 'approved' | 'rejected';
  registrationNumber?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  documentUrl?: string;
  eventsCount: number;
  certificateStatus?: 'active' | 'revoked' | 'expired' | 'none';
  tags?: string[];
  notes?: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  organisationId: string;
  organisationName: string;
  status: 'active' | 'expired' | 'revoked' | 'pending';
  issueDate: string;
  expiryDate: string;
  issuedBy: string;
  revokedAt?: string;
  revokedBy?: string;
  revokedReason?: string;
  certificateType: 'screening' | 'education' | 'support' | 'general';
  documentUrl?: string;
  metadata?: Record<string, any>;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organisation: {
    id: string;
    name: string;
  };
  organisationName: string;
  startDate: string;
  endDate: string;
  location: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  maxAttendees?: number;
  currentAttendees: number;
  checkedInAttendees: number;
  volunteersCount: number;
  suspectedCases: number;
  reportSubmitted: boolean;
  reportStatus?: 'pending' | 'approved' | 'rejected';
  eventType: 'screening' | 'education' | 'support' | 'awareness' | 'fundraising';
  currentParticipants: number;
  maxParticipants?: number;
  tags?: string[];
  images?: string[];
  documents?: string[];
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  reportType: 'attendance' | 'incident' | 'summary' | 'financial';
  eventId: string;
  eventTitle: string;
  organisationId: string;
  organisationName: string;
  submittedAt: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  documentUrl?: string;
  data: {
    attendeesCount: number;
    volunteersCount: number;
    screeningsPerformed?: number;
    suspectedCases: number;
    referralsMade?: number;
    materialsDistributed?: number;
    feedback?: string;
    challenges?: string;
    recommendations?: string;
    expenses?: {
      category: string;
      amount: number;
      description: string;
    }[];
    outcomes?: {
      metric: string;
      value: number;
      description: string;
    }[];
  };
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

export interface DashboardStats {
  totalOrganisations: number;
  activeOrganisations: number;
  pendingOrganisations: number;
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  totalUsers: number;
  totalReports: number;
  pendingReports: number;
  totalCertificates: number;
  activeCertificates: number;
  expiringSoonCertificates: number;
  totalScreenings: number;
  suspectedCases: number;
  referralsMade: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
}

// Filter and Search Types
export interface BaseFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrganisationFilters extends BaseFilters {
  status?: Organisation['registrationStatus'];
  certificateStatus?: Organisation['certificateStatus'];
  tags?: string[];
}

export interface EventFilters extends BaseFilters {
  status?: Event['status'];
  organisationId?: string;
  eventType?: Event['eventType'];
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface ReportFilters extends BaseFilters {
  status?: Report['status'];
  organisationId?: string;
  eventId?: string;
  submittedAfter?: string;
  submittedBefore?: string;
}

export interface CertificateFilters extends BaseFilters {
  status?: Certificate['status'];
  organisationId?: string;
  certificateType?: Certificate['certificateType'];
  expiringBefore?: string;
}

// Form Types
export interface CreateOrganisationForm {
  name: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  description?: string;
  documents?: File[];
}

export interface CreateCertificateForm {
  organisationId: string;
  certificateType: Certificate['certificateType'];
  expiryDate: string;
  notes?: string;
}

export interface ReviewForm {
  status: 'approved' | 'rejected';
  notes?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

// Chart and Analytics Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface MetricCard {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: AppError | null;
}

// Table Types
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  sorting?: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSort: (column: string) => void;
  };
  selection?: {
    selectedRows: string[];
    onSelectionChange: (selectedRows: string[]) => void;
  };
  actions?: {
    label: string;
    onClick: (row: T) => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }[];
}

export interface MunicipalityRegistration {
  municipalityId: string;
  adminUser: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
  };
  contactInfo: {
    primaryEmail: string;
    secondaryEmail?: string;
    phone: string;
    address: string;
    website?: string;
  };
  verification?: {
    documentType: 'certificate' | 'letter' | 'other';
    documentUrl?: string;
  };
  preferences: {
    timezone: string;
    language: string;
    features: string[];
  };
}

export interface MunicipalityAccount {
  id: string;
  municipalityId: string;
  municipalityName: string;
  regionId: string;
  regionName: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  adminUserId: string;
  contactInfo: {
    primaryEmail: string;
    secondaryEmail?: string;
    phone: string;
    address: string;
    website?: string;
  };
  settings: {
    timezone: string;
    language: string;
    features: string[];
  };
  subscription: {
    plan: string;
    startDate: string;
    isActive: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  position?: string;
}

export interface UserInvitation {
  id: string;
  municipalityId: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token: string;
}
