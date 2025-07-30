'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardService } from '@/lib/api';

interface PrefetchConfig {
  routes: string[];
  delay?: number;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Hook for intelligent data prefetching
 * Prefetches critical data and routes based on user behavior patterns
 */
export function usePrefetch(config: PrefetchConfig) {
  const router = useRouter();
  const prefetchedRef = useRef(new Set<string>());

  useEffect(() => {
    const prefetchData = async () => {
      // Delay prefetching to avoid blocking initial render
      const delay = config.delay || (config.priority === 'high' ? 100 : 1000);
      
      setTimeout(async () => {
        // Prefetch routes
        config.routes.forEach(route => {
          if (!prefetchedRef.current.has(route)) {
            router.prefetch(route);
            prefetchedRef.current.add(route);
          }
        });

        // Prefetch critical dashboard data if not already cached
        if (config.priority === 'high') {
          try {
            // These calls will use cache if available, otherwise fetch and cache
            await Promise.allSettled([
              DashboardService.getStats(),
              DashboardService.getRecentActivity(),
              DashboardService.getNotifications()
            ]);
          } catch (error) {
            console.log('Prefetch failed (non-critical):', error);
          }
        }
      }, delay);
    };

    prefetchData();
  }, [config, router]);
}

/**
 * Hook for lazy loading components with intersection observer
 */
export function useLazyLoad(threshold = 0.1) {
  const elementRef = useRef<HTMLElement>(null);
  const isVisible = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible.current) {
          isVisible.current = true;
          // Trigger lazy loading
          element.dispatchEvent(new CustomEvent('lazyload'));
        }
      },
      { threshold }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold]);

  return { elementRef, isVisible: isVisible.current };
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;

      // Import and use the performance monitor
      import('@/lib/performance/monitor').then(({ recordComponentPerformance }) => {
        recordComponentPerformance(componentName, duration);
      });

      // Log performance metrics (in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);

        // Warn about slow components
        if (duration > 100) {
          console.warn(`⚠️ Slow component detected: ${componentName} took ${duration.toFixed(2)}ms`);
        }
      }
    };
  });

  const measureOperation = (operationName: string, operation: () => void | Promise<void>) => {
    const start = performance.now();
    const result = operation();

    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        if (process.env.NODE_ENV === 'development') {
          console.log(`${componentName}.${operationName}: ${(end - start).toFixed(2)}ms`);
        }
      });
    } else {
      const end = performance.now();
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName}.${operationName}: ${(end - start).toFixed(2)}ms`);
      }
      return result;
    }
  };

  return { measureOperation };
}
