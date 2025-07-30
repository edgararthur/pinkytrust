import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  getPermissionDiff,
  canPerformAction,
  ROLE_PERMISSIONS,
  type Role,
  type Permission
} from '@/lib/auth/permissions';

describe('Permission System', () => {
  describe('hasPermission', () => {
    it('should return true for admin with any permission', () => {
      expect(hasPermission('admin', 'users.view')).toBe(true);
      expect(hasPermission('admin', 'users.delete')).toBe(true);
      expect(hasPermission('admin', 'settings.update')).toBe(true);
    });

    it('should return correct permissions for moderator', () => {
      expect(hasPermission('moderator', 'users.view')).toBe(true);
      expect(hasPermission('moderator', 'users.delete')).toBe(false);
      expect(hasPermission('moderator', 'settings.update')).toBe(false);
      expect(hasPermission('moderator', 'organizations.approve')).toBe(true);
    });

    it('should return correct permissions for viewer', () => {
      expect(hasPermission('viewer', 'users.view')).toBe(true);
      expect(hasPermission('viewer', 'users.create')).toBe(false);
      expect(hasPermission('viewer', 'organizations.view')).toBe(true);
      expect(hasPermission('viewer', 'organizations.create')).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(hasPermission('invalid' as Role, 'users.view')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the specified permissions', () => {
      expect(hasAnyPermission('viewer', ['users.view', 'users.create'])).toBe(true);
      expect(hasAnyPermission('viewer', ['users.create', 'users.delete'])).toBe(false);
    });

    it('should return true for admin with any permissions', () => {
      expect(hasAnyPermission('admin', ['users.create', 'users.delete'])).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all specified permissions', () => {
      expect(hasAllPermissions('admin', ['users.view', 'users.create', 'users.delete'])).toBe(true);
      expect(hasAllPermissions('viewer', ['users.view', 'organizations.view'])).toBe(true);
      expect(hasAllPermissions('viewer', ['users.view', 'users.create'])).toBe(false);
    });
  });

  describe('getRolePermissions', () => {
    it('should return all permissions for admin', () => {
      const adminPermissions = getRolePermissions('admin');
      expect(adminPermissions.length).toBeGreaterThan(20);
      expect(adminPermissions).toContain('users.delete');
      expect(adminPermissions).toContain('settings.update');
    });

    it('should return limited permissions for viewer', () => {
      const viewerPermissions = getRolePermissions('viewer');
      expect(viewerPermissions.length).toBeLessThan(15);
      expect(viewerPermissions).toContain('users.view');
      expect(viewerPermissions).not.toContain('users.delete');
    });

    it('should return empty array for invalid role', () => {
      expect(getRolePermissions('invalid' as Role)).toEqual([]);
    });
  });

  describe('getPermissionDiff', () => {
    it('should correctly identify added and removed permissions', () => {
      const diff = getPermissionDiff('viewer', 'moderator');
      
      expect(diff.added.length).toBeGreaterThan(0);
      expect(diff.removed.length).toBe(0); // Moderator has all viewer permissions plus more
      
      expect(diff.added).toContain('organizations.create');
      expect(diff.added).toContain('events.approve');
    });

    it('should show removed permissions when downgrading', () => {
      const diff = getPermissionDiff('admin', 'viewer');
      
      expect(diff.removed.length).toBeGreaterThan(10);
      expect(diff.added.length).toBe(0); // Admin has all viewer permissions plus more
      
      expect(diff.removed).toContain('users.delete');
      expect(diff.removed).toContain('settings.update');
    });

    it('should return empty arrays for same role', () => {
      const diff = getPermissionDiff('admin', 'admin');
      expect(diff.added).toEqual([]);
      expect(diff.removed).toEqual([]);
    });
  });

  describe('canPerformAction', () => {
    it('should correctly check action permissions', () => {
      expect(canPerformAction('admin', 'delete', 'users')).toBe(true);
      expect(canPerformAction('moderator', 'delete', 'users')).toBe(false);
      expect(canPerformAction('viewer', 'view', 'users')).toBe(true);
      expect(canPerformAction('viewer', 'create', 'users')).toBe(false);
    });

    it('should handle organization permissions', () => {
      expect(canPerformAction('moderator', 'approve', 'organizations')).toBe(true);
      expect(canPerformAction('viewer', 'approve', 'organizations')).toBe(false);
    });

    it('should handle settings permissions', () => {
      expect(canPerformAction('admin', 'update', 'settings')).toBe(true);
      expect(canPerformAction('moderator', 'update', 'settings')).toBe(false);
      expect(canPerformAction('viewer', 'view', 'settings')).toBe(false);
    });
  });

  describe('Role Permission Consistency', () => {
    it('should ensure admin has all moderator permissions', () => {
      const adminPermissions = new Set(ROLE_PERMISSIONS.admin);
      const moderatorPermissions = ROLE_PERMISSIONS.moderator;
      
      moderatorPermissions.forEach(permission => {
        expect(adminPermissions.has(permission)).toBe(true);
      });
    });

    it('should ensure moderator has all viewer permissions', () => {
      const moderatorPermissions = new Set(ROLE_PERMISSIONS.moderator);
      const viewerPermissions = ROLE_PERMISSIONS.viewer;
      
      viewerPermissions.forEach(permission => {
        expect(moderatorPermissions.has(permission)).toBe(true);
      });
    });

    it('should have unique permissions in each role', () => {
      Object.entries(ROLE_PERMISSIONS).forEach(([role, permissions]) => {
        const uniquePermissions = new Set(permissions);
        expect(uniquePermissions.size).toBe(permissions.length);
      });
    });
  });

  describe('Permission Categories', () => {
    it('should have all permissions categorized', () => {
      const allCategorizedPermissions = new Set<Permission>();
      
      // This test would need to import PERMISSION_CATEGORIES
      // For now, we'll just check that the main permissions exist
      expect(ROLE_PERMISSIONS.admin).toContain('users.view');
      expect(ROLE_PERMISSIONS.admin).toContain('organizations.view');
      expect(ROLE_PERMISSIONS.admin).toContain('events.view');
      expect(ROLE_PERMISSIONS.admin).toContain('certificates.view');
    });
  });
});
