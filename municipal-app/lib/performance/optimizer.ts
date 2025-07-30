'use client';

import { DashboardService } from '@/lib/api';
import { BaseApiService } from '@/lib/api/base';
import { performanceMonitor } from './monitor';

interface OptimizationConfig {
  enableCacheWarming: boolean;
  enableBackgroundRefresh: boolean;
  enablePrefetching: boolean;
  cacheWarmingDelay: number;
  backgroundRefreshInterval: number;
}

class PerformanceOptimizer {
  private config: OptimizationConfig = {
    enableCacheWarming: true,
    enableBackgroundRefresh: true,
    enablePrefetching: true,
    cacheWarmingDelay: 2000, // 2 seconds after page load
    backgroundRefreshInterval: 300000 // 5 minutes
  };

  private backgroundRefreshTimer?: NodeJS.Timeout;
  private isInitialized = false;

  /**
   * Initialize the performance optimizer
   */
  init(config?: Partial<OptimizationConfig>) {
    if (this.isInitialized) return;

    this.config = { ...this.config, ...config };
    this.isInitialized = true;

    if (this.config.enableCacheWarming) {
      this.startCacheWarming();
    }

    if (this.config.enableBackgroundRefresh) {
      this.startBackgroundRefresh();
    }

    // Listen for visibility changes to pause/resume optimization
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    console.log('🚀 Performance optimizer initialized');
  }

  /**
   * Warm up critical caches
   */
  private async startCacheWarming() {
    setTimeout(async () => {
      try {
        console.log('🔥 Starting cache warming...');
        
        await performanceMonitor.measure(
          'cache-warming',
          'api',
          async () => {
            // Warm up dashboard data cache
            await Promise.allSettled([
              DashboardService.getStats(),
              DashboardService.getRecentActivity(),
              DashboardService.getNotifications()
            ]);
          }
        );

        console.log('✅ Cache warming completed');
      } catch (error) {
        console.warn('Cache warming failed:', error);
      }
    }, this.config.cacheWarmingDelay);
  }

  /**
   * Start background refresh of critical data
   */
  private startBackgroundRefresh() {
    this.backgroundRefreshTimer = setInterval(async () => {
      if (document.hidden) return; // Don't refresh when tab is hidden

      try {
        console.log('🔄 Background refresh started');
        
        await performanceMonitor.measure(
          'background-refresh',
          'api',
          async () => {
            // Invalidate and refresh critical caches
            BaseApiService.invalidateCache('dashboard:');
            
            await Promise.allSettled([
              DashboardService.getStats(),
              DashboardService.getRecentActivity(),
              DashboardService.getNotifications()
            ]);
          }
        );

        console.log('✅ Background refresh completed');
      } catch (error) {
        console.warn('Background refresh failed:', error);
      }
    }, this.config.backgroundRefreshInterval);
  }

  /**
   * Handle visibility changes to optimize performance
   */
  private handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, pause background operations
      this.pauseBackgroundOperations();
    } else {
      // Page is visible, resume operations and refresh stale data
      this.resumeBackgroundOperations();
      this.refreshStaleData();
    }
  }

  /**
   * Pause background operations when page is hidden
   */
  private pauseBackgroundOperations() {
    if (this.backgroundRefreshTimer) {
      clearInterval(this.backgroundRefreshTimer);
      this.backgroundRefreshTimer = undefined;
    }
    console.log('⏸️ Background operations paused');
  }

  /**
   * Resume background operations when page becomes visible
   */
  private resumeBackgroundOperations() {
    if (this.config.enableBackgroundRefresh && !this.backgroundRefreshTimer) {
      this.startBackgroundRefresh();
      console.log('▶️ Background operations resumed');
    }
  }

  /**
   * Refresh stale data when page becomes visible again
   */
  private async refreshStaleData() {
    try {
      // Check if data is stale (older than 2 minutes)
      const staleThreshold = 2 * 60 * 1000; // 2 minutes
      const now = Date.now();
      
      // This would need to be implemented in the cache manager
      // For now, we'll just refresh the data
      BaseApiService.invalidateCache('dashboard:');
      
      await Promise.allSettled([
        DashboardService.getStats(),
        DashboardService.getRecentActivity()
      ]);

      console.log('🔄 Stale data refreshed');
    } catch (error) {
      console.warn('Failed to refresh stale data:', error);
    }
  }

  /**
   * Prefetch data for a specific route
   */
  async prefetchRoute(route: string) {
    if (!this.config.enablePrefetching) return;

    try {
      await performanceMonitor.measure(
        `prefetch-${route}`,
        'api',
        async () => {
          switch (route) {
            case '/organizations':
              // Prefetch organizations data
              break;
            case '/events':
              // Prefetch events data
              break;
            case '/certificates':
              // Prefetch certificates data
              break;
            case '/reports':
              // Prefetch reports data
              break;
            default:
              console.log(`No prefetch strategy for route: ${route}`);
          }
        }
      );
    } catch (error) {
      console.warn(`Prefetch failed for route ${route}:`, error);
    }
  }

  /**
   * Optimize images by preloading critical ones
   */
  preloadCriticalImages(imageUrls: string[]) {
    imageUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.backgroundRefreshTimer) {
      clearInterval(this.backgroundRefreshTimer);
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.isInitialized = false;
    
    console.log('🧹 Performance optimizer destroyed');
  }

  /**
   * Get optimization statistics
   */
  getStats() {
    return {
      config: this.config,
      isInitialized: this.isInitialized,
      backgroundRefreshActive: !!this.backgroundRefreshTimer,
      performanceMetrics: performanceMonitor.export()
    };
  }
}

// Global performance optimizer instance
export const performanceOptimizer = new PerformanceOptimizer();

/**
 * React hook for using the performance optimizer
 */
export function usePerformanceOptimizer(config?: Partial<OptimizationConfig>) {
  React.useEffect(() => {
    performanceOptimizer.init(config);

    return () => {
      // Don't destroy on unmount as it's a global service
      // performanceOptimizer.destroy();
    };
  }, [config]);

  return {
    prefetchRoute: performanceOptimizer.prefetchRoute.bind(performanceOptimizer),
    preloadImages: performanceOptimizer.preloadCriticalImages.bind(performanceOptimizer),
    getStats: performanceOptimizer.getStats.bind(performanceOptimizer)
  };
}

// Add React import
import React from 'react';
