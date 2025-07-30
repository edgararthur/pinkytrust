import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types';

/**
 * Super Admin Management Service
 * Handles creation and management of super admin accounts
 */
export class SuperAdminService {
  /**
   * Create the initial super admin account
   * This should only be called once during system setup
   */
  static async createSuperAdmin(adminData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // Check if super admin already exists
      const existingSuperAdmin = await this.getSuperAdmin();
      if (existingSuperAdmin) {
        return {
          success: false,
          error: 'Super admin account already exists'
        };
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminData.email,
        password: adminData.password,
        email_confirm: true,
        user_metadata: {
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          role: 'super_admin',
          phone: adminData.phone
        }
      });

      if (authError) {
        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Failed to create auth user'
        };
      }

      // Create user record in our database
      const userRecord = {
        user_id: authData.user.id,
        email: adminData.email,
        first_name: adminData.firstName,
        last_name: adminData.lastName,
        role: 'super_admin',
        municipality_id: null, // Super admin is not tied to a specific municipality
        department: 'System Administration',
        permissions: [], // Super admin gets all permissions via role
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert(userRecord)
        .select()
        .single();

      if (userError) {
        // Clean up auth user if database insert fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          success: false,
          error: userError.message
        };
      }

      // Create system settings record to track super admin creation
      await supabase
        .from('system_settings')
        .upsert({
          key: 'super_admin_created',
          value: 'true',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      const user: User = {
        id: authData.user.id,
        email: adminData.email,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: 'super_admin',
        department: 'System Administration',
        permissions: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Check if super admin account exists
   */
  static async getSuperAdmin(): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'super_admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking for super admin:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.user_id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        department: data.department,
        permissions: data.permissions || [],
        isActive: data.is_active,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error getting super admin:', error);
      return null;
    }
  }

  /**
   * Check if system has been initialized (super admin created)
   */
  static async isSystemInitialized(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'super_admin_created')
        .single();

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist, system not initialized
          console.warn('System settings table does not exist, system not initialized');
          return false;
        } else if (error.code !== 'PGRST116') {
          console.error('Error checking system initialization:', error);
          return false;
        }
      }

      return data?.value === 'true';
    } catch (error) {
      console.error('Error checking system initialization:', error);
      return false;
    }
  }

  /**
   * Reset super admin password (emergency function)
   */
  static async resetSuperAdminPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const superAdmin = await this.getSuperAdmin();
      if (!superAdmin) {
        return {
          success: false,
          error: 'Super admin account not found'
        };
      }

      const { error } = await supabase.auth.admin.updateUserById(
        superAdmin.id,
        { password: newPassword }
      );

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get system statistics for super admin dashboard
   */
  static async getSystemStats() {
    try {
      const [
        municipalitiesResult,
        usersResult,
        organizationsResult,
        eventsResult
      ] = await Promise.allSettled([
        supabase.from('municipality_accounts').select('status', { count: 'exact' }),
        supabase.from('users').select('role, is_active', { count: 'exact' }),
        supabase.from('organizations').select('status', { count: 'exact' }),
        supabase.from('events').select('status', { count: 'exact' })
      ]);

      const stats = {
        municipalities: {
          total: 0,
          active: 0,
          pending: 0,
          suspended: 0
        },
        users: {
          total: 0,
          active: 0,
          superAdmins: 0,
          municipalAdmins: 0,
          managers: 0,
          staff: 0
        },
        organizations: {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0
        },
        events: {
          total: 0,
          active: 0,
          completed: 0,
          cancelled: 0
        }
      };

      // Process municipalities
      if (municipalitiesResult.status === 'fulfilled' && municipalitiesResult.value.data) {
        const municipalities = municipalitiesResult.value.data;
        stats.municipalities.total = municipalities.length;
        stats.municipalities.active = municipalities.filter(m => m.status === 'active').length;
        stats.municipalities.pending = municipalities.filter(m => m.status === 'pending').length;
        stats.municipalities.suspended = municipalities.filter(m => m.status === 'suspended').length;
      }

      // Process users
      if (usersResult.status === 'fulfilled' && usersResult.value.data) {
        const users = usersResult.value.data;
        stats.users.total = users.length;
        stats.users.active = users.filter(u => u.is_active).length;
        stats.users.superAdmins = users.filter(u => u.role === 'super_admin').length;
        stats.users.municipalAdmins = users.filter(u => u.role === 'municipal_admin').length;
        stats.users.managers = users.filter(u => u.role === 'manager').length;
        stats.users.staff = users.filter(u => u.role === 'staff').length;
      }

      // Process organizations
      if (organizationsResult.status === 'fulfilled' && organizationsResult.value.data) {
        const organizations = organizationsResult.value.data;
        stats.organizations.total = organizations.length;
        stats.organizations.approved = organizations.filter(o => o.status === 'approved').length;
        stats.organizations.pending = organizations.filter(o => o.status === 'pending').length;
        stats.organizations.rejected = organizations.filter(o => o.status === 'rejected').length;
      }

      // Process events
      if (eventsResult.status === 'fulfilled' && eventsResult.value.data) {
        const events = eventsResult.value.data;
        stats.events.total = events.length;
        stats.events.active = events.filter(e => e.status === 'active').length;
        stats.events.completed = events.filter(e => e.status === 'completed').length;
        stats.events.cancelled = events.filter(e => e.status === 'cancelled').length;
      }

      return stats;
    } catch (error) {
      console.error('Error getting system stats:', error);
      return null;
    }
  }
}
