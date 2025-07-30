// Permission system for the municipal breast cancer awareness platform

export type Permission = 
  // User Management
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'users.activate'
  | 'users.deactivate'
  
  // Organization Management
  | 'organizations.view'
  | 'organizations.create'
  | 'organizations.update'
  | 'organizations.delete'
  | 'organizations.approve'
  | 'organizations.reject'
  
  // Event Management
  | 'events.view'
  | 'events.create'
  | 'events.update'
  | 'events.delete'
  | 'events.approve'
  | 'events.reject'
  
  // Certificate Management
  | 'certificates.view'
  | 'certificates.create'
  | 'certificates.update'
  | 'certificates.delete'
  | 'certificates.issue'
  | 'certificates.revoke'
  
  // Activity Logs
  | 'activity.view'
  | 'activity.export'
  
  // Dashboard & Analytics
  | 'dashboard.view'
  | 'analytics.view'
  | 'analytics.export'
  
  // System Settings
  | 'settings.view'
  | 'settings.update'
  
  // Reports
  | 'reports.view'
  | 'reports.create'
  | 'reports.export'

  // Municipality Management
  | 'municipality.view'
  | 'municipality.update'
  | 'municipality.settings'
  | 'municipality.billing'
  | 'municipality.users.manage'

  // Health Screenings
  | 'screenings.view'
  | 'screenings.create'
  | 'screenings.update'
  | 'screenings.delete'
  | 'screenings.export'

  // Notifications
  | 'notifications.view'
  | 'notifications.create'
  | 'notifications.send'
  | 'notifications.manage';

export type Role = 'super_admin' | 'municipal_admin' | 'manager' | 'staff' | 'viewer' | 'volunteer';



// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    // Full access to everything including system administration
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'users.activate',
    'users.deactivate',
    'organizations.view',
    'organizations.create',
    'organizations.update',
    'organizations.delete',
    'organizations.approve',
    'organizations.reject',
    'events.view',
    'events.create',
    'events.update',
    'events.delete',
    'events.approve',
    'events.reject',
    'certificates.view',
    'certificates.create',
    'certificates.update',
    'certificates.delete',
    'certificates.issue',
    'certificates.revoke',
    'activity.view',
    'activity.export',
    'dashboard.view',
    'analytics.view',
    'analytics.export',
    'settings.view',
    'settings.update',
    'reports.view',
    'reports.create',
    'reports.export',
    'municipality.view',
    'municipality.update',
    'municipality.settings',
    'municipality.billing',
    'municipality.users.manage',
    'screenings.view',
    'screenings.create',
    'screenings.update',
    'screenings.delete',
    'screenings.export',
    'notifications.view',
    'notifications.create',
    'notifications.send',
    'notifications.manage',
  ],
  municipal_admin: [
    // Full access to everything
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'users.activate',
    'users.deactivate',
    'organizations.view',
    'organizations.create',
    'organizations.update',
    'organizations.delete',
    'organizations.approve',
    'organizations.reject',
    'events.view',
    'events.create',
    'events.update',
    'events.delete',
    'events.approve',
    'events.reject',
    'certificates.view',
    'certificates.create',
    'certificates.update',
    'certificates.delete',
    'certificates.issue',
    'certificates.revoke',
    'activity.view',
    'activity.export',
    'dashboard.view',
    'analytics.view',
    'analytics.export',
    'settings.view',
    'settings.update',
    'reports.view',
    'reports.create',
    'reports.export',
  ],
  manager: [
    // Can manage content but not users or system settings
    'users.view',
    'organizations.view',
    'organizations.create',
    'organizations.update',
    'organizations.approve',
    'organizations.reject',
    'events.view',
    'events.create',
    'events.update',
    'events.approve',
    'events.reject',
    'certificates.view',
    'certificates.create',
    'certificates.update',
    'certificates.issue',
    'certificates.revoke',
    'activity.view',
    'dashboard.view',
    'analytics.view',
    'reports.view',
    'reports.create',
    'reports.export',
  ],
  viewer: [
    // Read-only access to most content
    'users.view',
    'organizations.view',
    'events.view',
    'certificates.view',
    'activity.view',
    'dashboard.view',
    'analytics.view',
    'reports.view',
  ],
  staff: [
    // Staff has basic operational permissions
    'organizations.view',
    'organizations.create',
    'events.view',
    'events.create',
    'certificates.view',
    'dashboard.view',
    'reports.view',
    'reports.create',
    'municipality.view',
    'screenings.view',
    'screenings.create',
    'notifications.view',
  ],
  volunteer: [
    // Volunteers have limited read-only access
    'dashboard.view',
    'organizations.view',
    'events.view',
    'certificates.view',
    'reports.view',
    'municipality.view',
    'screenings.view',
    'notifications.view',
  ],
};

// Permission categories for UI organization
export const PERMISSION_CATEGORIES = {
  'User Management': [
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'users.activate',
    'users.deactivate',
  ],
  'Organization Management': [
    'organizations.view',
    'organizations.create',
    'organizations.update',
    'organizations.delete',
    'organizations.approve',
    'organizations.reject',
  ],
  'Event Management': [
    'events.view',
    'events.create',
    'events.update',
    'events.delete',
    'events.approve',
    'events.reject',
  ],
  'Certificate Management': [
    'certificates.view',
    'certificates.create',
    'certificates.update',
    'certificates.delete',
    'certificates.issue',
    'certificates.revoke',
  ],
  'Activity & Monitoring': [
    'activity.view',
    'activity.export',
  ],
  'Dashboard & Analytics': [
    'dashboard.view',
    'analytics.view',
    'analytics.export',
  ],
  'System Administration': [
    'settings.view',
    'settings.update',
  ],
  'Reports': [
    'reports.view',
    'reports.create',
    'reports.export',
  ],
} as const;

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  'users.view': 'View user accounts and profiles',
  'users.create': 'Create new user accounts',
  'users.update': 'Edit user account information',
  'users.delete': 'Delete user accounts',
  'users.activate': 'Activate user accounts',
  'users.deactivate': 'Deactivate user accounts',
  
  'organizations.view': 'View organization profiles and information',
  'organizations.create': 'Register new organizations',
  'organizations.update': 'Edit organization information',
  'organizations.delete': 'Remove organizations from the system',
  'organizations.approve': 'Approve organization registrations',
  'organizations.reject': 'Reject organization registrations',
  
  'events.view': 'View events and activities',
  'events.create': 'Create new events',
  'events.update': 'Edit event information',
  'events.delete': 'Cancel or remove events',
  'events.approve': 'Approve event submissions',
  'events.reject': 'Reject event submissions',
  
  'certificates.view': 'View certificates and certifications',
  'certificates.create': 'Create new certificates',
  'certificates.update': 'Edit certificate information',
  'certificates.delete': 'Remove certificates',
  'certificates.issue': 'Issue certificates to organizations',
  'certificates.revoke': 'Revoke issued certificates',
  
  'activity.view': 'View system activity logs',
  'activity.export': 'Export activity log data',
  
  'dashboard.view': 'Access the main dashboard',
  'analytics.view': 'View analytics and statistics',
  'analytics.export': 'Export analytics data',
  
  'settings.view': 'View system settings',
  'settings.update': 'Modify system settings',
  
  'reports.view': 'View generated reports',
  'reports.create': 'Generate new reports',
  'reports.export': 'Export report data',

  // Municipality management
  'municipality.view': 'View municipality information',
  'municipality.update': 'Update municipality details',
  'municipality.settings': 'Manage municipality settings',
  'municipality.billing': 'Access billing and subscription information',
  'municipality.users.manage': 'Manage municipality users and roles',

  // Health screenings
  'screenings.view': 'View health screening records',
  'screenings.create': 'Create new screening records',
  'screenings.update': 'Update screening information',
  'screenings.delete': 'Remove screening records',
  'screenings.export': 'Export screening data',

  // Notifications
  'notifications.view': 'View system notifications',
  'notifications.create': 'Create new notifications',
  'notifications.send': 'Send notifications to users',
  'notifications.manage': 'Manage notification settings',
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get permissions that are different between two roles
 */
export function getPermissionDiff(fromRole: Role, toRole: Role): {
  added: Permission[];
  removed: Permission[];
} {
  const fromPermissions = new Set(getRolePermissions(fromRole));
  const toPermissions = new Set(getRolePermissions(toRole));
  
  const added = Array.from(toPermissions).filter(p => !fromPermissions.has(p));
  const removed = Array.from(fromPermissions).filter(p => !toPermissions.has(p));
  
  return { added, removed };
}

/**
 * Check if a role can perform an action on a resource
 */
export function canPerformAction(
  userRole: Role,
  action: 'view' | 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'activate' | 'deactivate' | 'issue' | 'revoke' | 'export',
  resource: 'users' | 'organizations' | 'events' | 'certificates' | 'activity' | 'analytics' | 'settings' | 'reports'
): boolean {
  const permission = `${resource}.${action}` as Permission;
  return hasPermission(userRole, permission);
}
