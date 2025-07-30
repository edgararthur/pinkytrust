'use client';

import React, { useEffect, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { appMaintenance } from '@/lib/app-maintenance';
import { DataInitializer } from '@/lib/data-initialization';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Add default initial data
      initialData: () => [],
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        // Log mutation errors
        appMaintenance.logError(
          error instanceof Error ? error : new Error('Mutation failed'),
          { type: 'mutation_error' }
        );
      },
    },
  },
});

// Add global error handling for queries
queryClient.setMutationDefaults(['*'], {
  onError: (error) => {
    appMaintenance.logError(
      error instanceof Error ? error : new Error('Query failed'),
      { type: 'query_error' }
    );
  },
});

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  useEffect(() => {
    // Initialize app maintenance monitoring
    const initializeApp = async () => {
      try {
        // Start health monitoring (check every 5 minutes)
        appMaintenance.startHealthMonitoring(5 * 60 * 1000);
        
        // Perform initial health check
        const healthStatus = await appMaintenance.performHealthCheck();
        console.log('Initial health check:', healthStatus);
        
        // Record app startup metric
        appMaintenance.recordPerformanceMetric({
          timestamp: new Date().toISOString(),
          type: 'app_startup',
          value: performance.now(),
          metadata: { 
            version: process.env.NEXT_PUBLIC_APP_VERSION,
            healthStatus: healthStatus.status,
          },
        });

        // Clear query cache if health check fails
        if (healthStatus.status === 'error' || !healthStatus.services.database) {
          queryClient.clear();
          queryClient.setDefaultOptions({
            queries: {
              ...queryClient.getDefaultOptions().queries,
              retry: false, // Disable retries when backend is down
            },
          });
        }
        
      } catch (error) {
        console.error('Failed to initialize app maintenance:', error);
        appMaintenance.logError(
          error instanceof Error ? error : new Error('App initialization failed')
        );
        // Clear query cache on initialization error
        queryClient.clear();
        queryClient.setDefaultOptions({
          queries: {
            ...queryClient.getDefaultOptions().queries,
            retry: false, // Disable retries when initialization fails
          },
        });
      }
    };

    initializeApp();

    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      appMaintenance.logError(
        new Error(`Unhandled promise rejection: ${event.reason}`),
        { type: 'unhandled_rejection' }
      );
    };

    // Global error handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      appMaintenance.logError(
        new Error(event.message),
        { 
          type: 'uncaught_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Performance monitoring
    const recordPageLoad = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          appMaintenance.recordPerformanceMetric({
            timestamp: new Date().toISOString(),
            type: 'page_load',
            value: navigation.loadEventEnd - navigation.loadEventStart,
            metadata: { 
              url: window.location.pathname,
              type: navigation.type,
            },
          });
        }
      }
    };

    // Record page load performance
    if (document.readyState === 'complete') {
      recordPageLoad();
    } else {
      window.addEventListener('load', recordPageLoad);
    }

    // Cleanup function
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('load', recordPageLoad);
      appMaintenance.cleanup();
    };
  }, []);

  // Monitor route changes for performance tracking
  useEffect(() => {
    const recordRouteChange = () => {
      appMaintenance.recordPerformanceMetric({
        timestamp: new Date().toISOString(),
        type: 'route_change',
        value: performance.now(),
        metadata: { 
          url: window.location.pathname,
        },
      });
    };

    // Listen for route changes (Next.js specific)
    const handleRouteChange = () => {
      recordRouteChange();
    };

    // For Next.js App Router, we can listen to popstate events
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DataInitializer>
        {children}
      </DataInitializer>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
        />
      )}
    </QueryClientProvider>
  );
}
