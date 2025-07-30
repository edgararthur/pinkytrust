import { 
  apiClient, 
  authApi, 
  eventsApi, 
  assessmentApi, 
  communityApi, 
  awarenessApi, 
  scannerApi, 
  analyticsApi,
  syncApi,
  cacheApi,
  batchApi,
  withRetry 
} from '@/lib/api';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      updateUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
    })),
    rpc: jest.fn(),
  },
}));

// Mock fetch for API client tests
global.fetch = jest.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('GET requests', () => {
    it('makes successful GET request', async () => {
      const mockResponse = { success: true, data: { id: 1, name: 'Test' } };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.get('/test');
      
      expect(fetch).toHaveBeenCalledWith('/api/test', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles GET request with parameters', async () => {
      const mockResponse = { success: true, data: [] };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await apiClient.get('/test', { page: 1, limit: 10 });
      
      expect(fetch).toHaveBeenCalledWith('/api/test?page=1&limit=10', expect.any(Object));
    });

    it('handles failed GET request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Resource not found' }),
      });

      await expect(apiClient.get('/test')).rejects.toThrow('HTTP 404: Not Found');
    });
  });

  describe('POST requests', () => {
    it('makes successful POST request', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      const postData = { name: 'Test', email: 'test@example.com' };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.post('/test', postData);
      
      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      expect(result).toEqual(mockResponse);
    });
  });
});

describe('AuthApi', () => {
  const mockSupabase = require('@/lib/supabase').supabase;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('successfully signs up user', async () => {
      const mockData = { user: { id: '123', email: 'test@example.com' } };
      mockSupabase.auth.signUp.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await authApi.signUp('test@example.com', 'password123');
      
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { data: undefined },
      });
      expect(result).toEqual(mockData);
    });

    it('handles sign up error', async () => {
      const mockError = new Error('Email already exists');
      mockSupabase.auth.signUp.mockResolvedValueOnce({ data: null, error: mockError });

      await expect(authApi.signUp('test@example.com', 'password123')).rejects.toThrow('Email already exists');
    });
  });

  describe('signIn', () => {
    it('successfully signs in user', async () => {
      const mockData = { user: { id: '123', email: 'test@example.com' } };
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await authApi.signIn('test@example.com', 'password123');
      
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockData);
    });
  });
});

describe('EventsApi', () => {
  const mockSupabase = require('@/lib/supabase').supabase;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('fetches events without filters', async () => {
      const mockEvents = [{ id: '1', title: 'Test Event' }];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValueOnce(mockQuery);
      mockQuery.select.mockResolvedValueOnce({ data: mockEvents, error: null });

      const result = await eventsApi.getEvents();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('events');
      expect(result).toEqual(mockEvents);
    });

    it('applies date range filter', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValueOnce(mockQuery);
      mockQuery.select.mockResolvedValueOnce({ data: [], error: null });

      await eventsApi.getEvents({ date_range: 'week' });
      
      expect(mockQuery.gte).toHaveBeenCalled();
    });
  });

  describe('registerForEvent', () => {
    it('successfully registers user for event', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValueOnce(mockQuery);
      mockQuery.insert.mockResolvedValueOnce({ data: { id: '1' }, error: null });

      const result = await eventsApi.registerForEvent('event123', 'user456');
      
      expect(mockSupabase.from).toHaveBeenCalledWith('event_registrations');
      expect(mockQuery.insert).toHaveBeenCalledWith({
        event_id: 'event123',
        user_id: 'user456',
        registered_at: expect.any(String),
      });
    });
  });
});

describe('CommunityApi', () => {
  const mockSupabase = require('@/lib/supabase').supabase;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('fetches paginated posts', async () => {
      const mockPosts = [{ id: '1', content: 'Test post' }];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValueOnce(mockQuery);
      mockQuery.select.mockResolvedValueOnce({ data: mockPosts, error: null, count: 1 });

      const result = await communityApi.getPosts(10, 0);
      
      expect(result.data).toEqual(mockPosts);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('createPost', () => {
    it('successfully creates a post', async () => {
      const mockPost = { content: 'New post', author_id: 'user123' };
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValueOnce(mockQuery);
      mockQuery.insert.mockResolvedValueOnce({ data: { id: '1' }, error: null });

      await communityApi.createPost(mockPost);
      
      expect(mockQuery.insert).toHaveBeenCalledWith({
        ...mockPost,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
  });
});

describe('Utility Functions', () => {
  describe('withRetry', () => {
    it('succeeds on first attempt', async () => {
      const operation = jest.fn().mockResolvedValueOnce('success');
      
      const result = await withRetry(operation, 3, 100);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and eventually succeeds', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');
      
      const result = await withRetry(operation, 3, 10);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('throws error after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(withRetry(operation, 2, 10)).rejects.toThrow('Always fails');
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('cacheApi', () => {
    beforeEach(() => {
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });
    });

    it('sets and gets cached data', () => {
      const testData = { id: 1, name: 'Test' };
      
      cacheApi.setCachedData('test-key', testData);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify({
          data: testData,
          timestamp: expect.any(Number),
        })
      );
    });

    it('returns null for expired cache', () => {
      const expiredCache = JSON.stringify({
        data: { id: 1 },
        timestamp: Date.now() - 400000, // 6+ minutes ago
      });
      
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(expiredCache);
      
      const result = cacheApi.getCachedData('test-key', 300000); // 5 minute max age
      
      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('returns cached data when fresh', () => {
      const testData = { id: 1, name: 'Test' };
      const freshCache = JSON.stringify({
        data: testData,
        timestamp: Date.now() - 100000, // 1.6 minutes ago
      });
      
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(freshCache);
      
      const result = cacheApi.getCachedData('test-key', 300000); // 5 minute max age
      
      expect(result).toEqual(testData);
    });
  });
});
