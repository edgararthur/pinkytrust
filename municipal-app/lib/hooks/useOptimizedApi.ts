import { useState, useEffect, useCallback, useRef } from 'react';
import { BaseApiService } from '@/lib/api/base';

interface UseOptimizedApiOptions<T> {
  fallbackData: T;
  cacheKey?: string;
  cacheTTL?: number;
  dependencies?: any[];
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseOptimizedApiReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidateCache: () => void;
}

export function useOptimizedApi<T>(
  apiCall: () => Promise<T>,
  operationName: string,
  options: UseOptimizedApiOptions<T>
): UseOptimizedApiReturn<T> {
  const {
    fallbackData,
    cacheKey,
    cacheTTL = 30000,
    dependencies = [],
    enabled = true,
    refetchInterval,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchData = useCallback(async (force: boolean = false) => {
    if (!enabled || !mountedRef.current) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const result = await BaseApiService.handleApiCall(
        apiCall,
        fallbackData,
        operationName,
        cacheKey,
        cacheTTL
      );

      if (mountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setData(fallbackData);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [apiCall, operationName, fallbackData, cacheKey, cacheTTL, enabled, onSuccess, onError]);

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Interval-based refetch
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        fetchData();
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, enabled, fetchData]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const invalidateCache = useCallback(() => {
    if (cacheKey) {
      BaseApiService.invalidateCache(cacheKey);
    }
  }, [cacheKey]);

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidateCache
  };
}

// Hook for batch API calls
export function useBatchApi<T extends Record<string, any>>(
  calls: Array<{ key: string; call: () => Promise<any>; fallback: any }>,
  dependencies: any[] = [],
  enabled: boolean = true
): UseOptimizedApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      const results = await BaseApiService.batchApiCalls(calls);

      if (mountedRef.current) {
        setData(results as T);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        
        // Use fallback data
        const fallbackResults = calls.reduce((acc, { key, fallback }) => {
          acc[key] = fallback;
          return acc;
        }, {} as Record<string, any>);
        
        setData(fallbackResults as T);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [calls, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const invalidateCache = useCallback(() => {
    BaseApiService.invalidateCache();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidateCache
  };
}

// Hook for paginated data
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number, filters?: any) => Promise<{ data: T[]; total: number }>,
  operationName: string,
  initialFilters: any = {},
  options: Partial<UseOptimizedApiOptions<{ data: T[]; total: number }>> = {}
) {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    ...initialFilters
  });

  const cacheKey = `${operationName}_${JSON.stringify(filters)}`;
  
  const { data, isLoading, error, refetch, invalidateCache } = useOptimizedApi(
    () => apiCall(filters.page, filters.limit, filters),
    operationName,
    {
      fallbackData: { data: [], total: 0 },
      cacheKey,
      cacheTTL: 60000, // 1 minute cache for paginated data
      dependencies: [filters],
      ...options
    }
  );

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ page: 1, limit: 10, ...initialFilters });
  }, [initialFilters]);

  return {
    data: data?.data || [],
    total: data?.total || 0,
    filters,
    isLoading,
    error,
    refetch,
    invalidateCache,
    updateFilters,
    resetFilters
  };
} 