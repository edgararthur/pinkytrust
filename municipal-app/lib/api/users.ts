import { supabase } from '@/lib/supabase/client';
import type { Database, UserRole } from '@/lib/supabase/types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export type { User, UserInsert, UserUpdate, UserRole };

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  municipalityId?: string; // Add municipalityId
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UsersService {
  static async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      municipalityId, // Add municipalityId
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    if (municipalityId) {
      query = query.eq('municipality_id', municipalityId);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  static async getUser(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*') // Select all columns
      .eq('user_id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return null;
    }

    return this.getUser(authUser.id);
  }

  static async createUser(userData: UserInsert): Promise<User> {
    const { data, error } = await supabase.rpc('create_user', userData);

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
    return data;
  }

  static async updateUser(userId: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
    return data;
  }

  static async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  static async activateUser(id: string): Promise<User> {
    return this.updateUser(id, { is_active: true });
  }

  static async deactivateUser(id: string): Promise<User> {
    return this.updateUser(id, { is_active: false });
  }

  static async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    return this.updateUser(userId, { role: newRole });
  }

  static async updateLastLogin(id: string): Promise<User> {
    return this.updateUser(id, { last_login_at: new Date().toISOString() });
  }

  static async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
    byMunicipality: Record<string, number>;
  }> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('role, municipality_id, is_active');

      if (error) throw error;

      const stats = {
        total: users.length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
        byRole: {} as Record<string, number>,
        byMunicipality: {} as Record<string, number>
      };

      // Count by role
      users.forEach(user => {
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
        if (user.municipality_id) {
          stats.byMunicipality[user.municipality_id] = (stats.byMunicipality[user.municipality_id] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      throw new Error('Failed to fetch user statistics');
    }
  }
}
