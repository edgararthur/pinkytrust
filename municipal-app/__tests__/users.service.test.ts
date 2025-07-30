import { UsersService } from '@/lib/api/users';
import { supabase } from '@/lib/supabase/client';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('UsersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should fetch users with default filters', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'viewer',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          last_login_at: null,
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockUsers,
          error: null,
          count: 1,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await UsersService.getUsers({});

      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockQuery.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(result.data).toEqual(mockUsers);
      expect(result.pagination.total).toBe(1);
    });

    it('should apply search filter', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await UsersService.getUsers({ search: 'test' });

      expect(mockQuery.or).toHaveBeenCalledWith('name.ilike.%test%,email.ilike.%test%');
    });

    it('should apply role filter', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await UsersService.getUsers({ role: 'admin' });

      expect(mockQuery.eq).toHaveBeenCalledWith('role', 'admin');
    });

    it('should handle errors', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
          count: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(UsersService.getUsers({})).rejects.toThrow('Database error');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = {
        id: '1',
        email: 'new@example.com',
        name: 'New User',
        role: 'viewer' as const,
        is_active: true,
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: newUser,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const result = await UsersService.createUser(newUser);

      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockQuery.insert).toHaveBeenCalledWith(newUser);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_activity', {
        p_action: 'create',
        p_resource: 'user',
        p_resource_id: '1',
        p_resource_name: 'New User',
        p_details: { role: 'viewer', is_active: true },
      });
      expect(result).toEqual(newUser);
    });

    it('should handle creation errors', async () => {
      const newUser = {
        id: '1',
        email: 'new@example.com',
        name: 'New User',
        role: 'viewer' as const,
        is_active: true,
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Email already exists' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(UsersService.createUser(newUser)).rejects.toThrow('Email already exists');
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updates = {
        name: 'Updated Name',
        role: 'moderator' as const,
      };

      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'moderator',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login_at: null,
      };

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedUser,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const result = await UsersService.updateUser('1', updates);

      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockQuery.update).toHaveBeenCalledWith(updates);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_activity', {
        p_action: 'update',
        p_resource: 'user',
        p_resource_id: '1',
        p_resource_name: 'Updated Name',
        p_details: updates,
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: '1', name: 'Deleted User' },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      await UsersService.deleteUser('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_activity', {
        p_action: 'delete',
        p_resource: 'user',
        p_resource_id: '1',
        p_resource_name: 'Deleted User',
        p_details: {},
      });
    });
  });

  describe('activateUser', () => {
    it('should activate a user', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: '1', name: 'Test User', is_active: true },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      await UsersService.activateUser('1');

      expect(mockQuery.update).toHaveBeenCalledWith({ is_active: true });
      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_activity', {
        p_action: 'activate',
        p_resource: 'user',
        p_resource_id: '1',
        p_resource_name: 'Test User',
        p_details: { is_active: true },
      });
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockStats = {
        total: 10,
        active: 8,
        inactive: 2,
        admins: 1,
        moderators: 3,
        viewers: 6,
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await UsersService.getUserStats();

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_stats');
      expect(result).toEqual(mockStats);
    });

    it('should handle stats errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Stats error' },
      });

      await expect(UsersService.getUserStats()).rejects.toThrow('Stats error');
    });
  });
});
