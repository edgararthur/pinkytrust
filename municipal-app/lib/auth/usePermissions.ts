'use client';

import { useAuth } from './context';
import { 
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
  canPerformAction as checkCanPerformAction,
  getRolePermissions,
  type Permission,
  type Role
} from './permissions';

/**
 * Hook for checking user permissions throughout the application
 */
export function usePermissions() {
  const { user } = useAuth();
  
  const userRole = user?.role as Role;

  /**
   * Check if the current user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false;
    return checkPermission(userRole, permission);
  };

  /**
   * Check if the current user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!userRole) return false;
    return checkAnyPermission(userRole, permissions);
  };

  /**
   * Check if the current user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!userRole) return false;
    return checkAllPermissions(userRole, permissions);
  };

  /**
   * Check if the current user can perform a specific action on a resource
   */
  const canPerformAction = (
    action: 'view' | 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'activate' | 'deactivate' | 'issue' | 'revoke' | 'export',
    resource: 'users' | 'organizations' | 'events' | 'certificates' | 'activity' | 'analytics' | 'settings' | 'reports'
  ): boolean => {
    if (!userRole) return false;
    return checkCanPerformAction(userRole, action, resource);
  };

  /**
   * Get all permissions for the current user's role
   */
  const getUserPermissions = (): Permission[] => {
    if (!userRole) return [];
    return getRolePermissions(userRole);
  };

  /**
   * Check if the current user has a specific role
   */
  const hasRole = (role: Role): boolean => {
    return userRole === role;
  };

  /**
   * Check if the current user has any of the specified roles
   */
  const hasAnyRole = (roles: Role[]): boolean => {
    if (!userRole) return false;
    return roles.includes(userRole);
  };

  /**
   * Check if the current user is an admin
   */
  const isAdmin = (): boolean => {
    return userRole === 'admin';
  };

  /**
   * Check if the current user is a moderator or admin
   */
  const isModerator = (): boolean => {
    return userRole === 'moderator' || userRole === 'admin';
  };

  /**
   * Check if the current user is a viewer (lowest permission level)
   */
  const isViewer = (): boolean => {
    return userRole === 'viewer';
  };

  return {
    // User info
    user,
    userRole,
    
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,
    getUserPermissions,
    
    // Role checks
    hasRole,
    hasAnyRole,
    isAdmin,
    isModerator,
    isViewer,
  };
}
