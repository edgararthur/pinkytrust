'use client';

import { apiService } from './api-service';

// Application maintenance and monitoring service
class AppMaintenanceService {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private performanceMetrics: PerformanceMetric[] = [];
  private errorLog: ErrorLog[] = [];
  private readonly MAX_METRICS = 100;
  private readonly MAX_ERRORS = 50;

  // Health monitoring
  async performHealthCheck(): Promise<HealthStatus> {
    try {
      const startTime = performance.now();
      const healthData = await apiService.healthCheck();
      const responseTime = performance.now() - startTime;

      const status: HealthStatus = {
        timestamp: new Date().toISOString(),
        status: healthData?.status || 'unknown',
        responseTime,
        services: healthData?.services || {},
        version: healthData?.version || 'unknown',
      };

      this.recordPerformanceMetric({
        timestamp: new Date().toISOString(),
        type: 'health_check',
        value: responseTime,
        metadata: { status: status.status },
      });

      return status;
    } catch (error) {
      const errorStatus: HealthStatus = {
        timestamp: new Date().toISOString(),
        status: 'error',
        responseTime: -1,
        services: {},
        version: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.logError(error instanceof Error ? error : new Error('Health check failed'));
      return errorStatus;
    }
  }

  startHealthMonitoring(intervalMs: number = 60000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, intervalMs);
  }

  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Performance monitoring
  recordPerformanceMetric(metric: PerformanceMetric): void {
    this.performanceMetrics.push(metric);
    
    // Keep only the latest metrics
    if (this.performanceMetrics.length > this.MAX_METRICS) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.MAX_METRICS);
    }
  }

  getPerformanceMetrics(type?: string): PerformanceMetric[] {
    if (type) {
      return this.performanceMetrics.filter(m => m.type === type);
    }
    return [...this.performanceMetrics];
  }

  getAverageResponseTime(type?: string): number {
    const metrics = this.getPerformanceMetrics(type);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  // Error logging and monitoring
  logError(error: Error, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack || '',
      context: context || {},
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    this.errorLog.push(errorLog);
    
    // Keep only the latest errors
    if (this.errorLog.length > this.MAX_ERRORS) {
      this.errorLog = this.errorLog.slice(-this.MAX_ERRORS);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('App Error:', errorLog);
    }
  }

  getErrorLog(): ErrorLog[] {
    return [...this.errorLog];
  }

  getRecentErrors(minutes: number = 60): ErrorLog[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return this.errorLog.filter(e => e.timestamp > cutoff);
  }

  // Cache management
  clearApplicationCache(): void {
    try {
      // Clear API service cache
      apiService.clearAllCache();
      
      // Clear localStorage (be careful with user data)
      if (typeof window !== 'undefined') {
        const keysToKeep = ['user_preferences', 'auth_token'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
          if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
          }
        });
      }
      
      console.log('Application cache cleared successfully');
    } catch (error) {
      this.logError(error instanceof Error ? error : new Error('Cache clear failed'));
    }
  }

  // Application diagnostics
  async runDiagnostics(): Promise<DiagnosticReport> {
    const startTime = performance.now();
    
    try {
      const [healthStatus, cacheStats] = await Promise.all([
        this.performHealthCheck(),
        this.getCacheStats(),
      ]);

      const diagnostics: DiagnosticReport = {
        timestamp: new Date().toISOString(),
        health: healthStatus,
        performance: {
          averageResponseTime: this.getAverageResponseTime(),
          totalMetrics: this.performanceMetrics.length,
          recentErrors: this.getRecentErrors(60).length,
        },
        cache: cacheStats,
        memory: this.getMemoryUsage(),
        diagnosticTime: performance.now() - startTime,
      };

      return diagnostics;
    } catch (error) {
      this.logError(error instanceof Error ? error : new Error('Diagnostics failed'));
      throw error;
    }
  }

  private getCacheStats(): CacheStats {
    const apiCacheStats = apiService.getCacheStats();
    
    return {
      apiCache: apiCacheStats,
      localStorage: this.getLocalStorageStats(),
    };
  }

  private getLocalStorageStats(): { size: number; keys: number } {
    if (typeof window === 'undefined') {
      return { size: 0, keys: 0 };
    }

    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        totalSize += localStorage.getItem(key)?.length || 0;
      });

      return {
        size: totalSize,
        keys: keys.length,
      };
    } catch {
      return { size: 0, keys: 0 };
    }
  }

  private getMemoryUsage(): MemoryUsage {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    
    return {
      used: 0,
      total: 0,
      limit: 0,
    };
  }

  // Cleanup
  cleanup(): void {
    this.stopHealthMonitoring();
    this.performanceMetrics = [];
    this.errorLog = [];
  }
}

// Types
interface HealthStatus {
  timestamp: string;
  status: 'healthy' | 'unhealthy' | 'error' | 'unknown';
  responseTime: number;
  services: Record<string, string>;
  version: string;
  error?: string;
}

interface PerformanceMetric {
  timestamp: string;
  type: string;
  value: number;
  metadata?: Record<string, any>;
}

interface ErrorLog {
  timestamp: string;
  message: string;
  stack: string;
  context: Record<string, any>;
  userAgent: string;
  url: string;
}

interface CacheStats {
  apiCache: { size: number; keys: string[] };
  localStorage: { size: number; keys: number };
}

interface MemoryUsage {
  used: number;
  total: number;
  limit: number;
}

interface DiagnosticReport {
  timestamp: string;
  health: HealthStatus;
  performance: {
    averageResponseTime: number;
    totalMetrics: number;
    recentErrors: number;
  };
  cache: CacheStats;
  memory: MemoryUsage;
  diagnosticTime: number;
}

export const appMaintenance = new AppMaintenanceService();
export type { HealthStatus, PerformanceMetric, ErrorLog, DiagnosticReport };
