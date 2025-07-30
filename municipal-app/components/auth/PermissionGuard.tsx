'use client';

import React from 'react';
import { usePermissions } from '@/lib/auth/usePermissions';
import type { Permission, Role } from '@/lib/auth/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  
  // Permission-based access
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires ALL permissions; if false, requires ANY permission
  
  // Role-based access
  role?: Role;
  roles?: readonly Role[];
  
  // Action-based access (shorthand for common patterns)
  action?: 'view' | 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'activate' | 'deactivate' | 'issue' | 'revoke' | 'export';
  resource?: 'users' | 'organizations' | 'events' | 'certificates' | 'activity' | 'analytics' | 'settings' | 'reports';
  
  // Fallback content when access is denied
  fallback?: React.ReactNode;
  
  // Invert the logic (show when user DOESN'T have permission)
  invert?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * Examples:
 * - <PermissionGuard permission="users.create">...</PermissionGuard>
 * - <PermissionGuard permissions={["users.view", "users.update"]} requireAll>...</PermissionGuard>
 * - <PermissionGuard role="admin">...</PermissionGuard>
 * - <PermissionGuard action="delete" resource="users">...</PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  action,
  resource,
  fallback = null,
  invert = false,
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canPerformAction,
  } = usePermissions();

  let hasAccess = false;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  
  // Check multiple permissions
  else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }
  
  // Check single role
  else if (role) {
    hasAccess = hasRole(role);
  }
  
  // Check multiple roles
  else if (roles && roles.length > 0) {
    hasAccess = hasAnyRole(roles);
  }
  
  // Check action on resource
  else if (action && resource) {
    hasAccess = canPerformAction(action, resource);
  }
  
  // If no conditions specified, default to allowing access
  else {
    hasAccess = true;
  }

  // Invert logic if requested
  if (invert) {
    hasAccess = !hasAccess;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-order component version of PermissionGuard
 */
export function withPermissionGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<PermissionGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <PermissionGuard {...guardProps}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

/**
 * Hook version for conditional logic in components
 */
export function usePermissionGuard(guardProps: Omit<PermissionGuardProps, 'children' | 'fallback'>) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canPerformAction,
  } = usePermissions();

  const {
    permission,
    permissions,
    requireAll = false,
    role,
    roles,
    action,
    resource,
    invert = false,
  } = guardProps;

  let hasAccess = false;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  
  // Check multiple permissions
  else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }
  
  // Check single role
  else if (role) {
    hasAccess = hasRole(role);
  }
  
  // Check multiple roles
  else if (roles && roles.length > 0) {
    hasAccess = hasAnyRole(roles);
  }
  
  // Check action on resource
  else if (action && resource) {
    hasAccess = canPerformAction(action, resource);
  }
  
  // If no conditions specified, default to allowing access
  else {
    hasAccess = true;
  }

  // Invert logic if requested
  if (invert) {
    hasAccess = !hasAccess;
  }

  return hasAccess;
}
