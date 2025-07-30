'use client';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'render' | 'api' | 'navigation' | 'interaction';
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  render: number;
  api: number;
  navigation: number;
  interaction: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThresholds = {
    render: 100, // 100ms
    api: 2000,   // 2 seconds
    navigation: 1000, // 1 second
    interaction: 50   // 50ms
  };

  private maxMetrics = 1000; // Keep last 1000 metrics

  /**
   * Record a performance metric
   */
  record(metric: Omit<PerformanceMetric, 'timestamp'>) {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.metrics.push(fullMetric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Check thresholds and warn if exceeded
    this.checkThreshold(fullMetric);

    // In development, log performance issues
    if (process.env.NODE_ENV === 'development') {
      this.logMetric(fullMetric);
    }
  }

  /**
   * Measure and record an operation
   */
  measure<T>(
    name: string,
    type: PerformanceMetric['type'],
    operation: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): T | Promise<T> {
    const start = performance.now();

    const result = operation();

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        this.record({ name, value: duration, type, metadata });
      });
    } else {
      const duration = performance.now() - start;
      this.record({ name, value: duration, type, metadata });
      return result;
    }
  }

  /**
   * Get performance statistics
   */
  getStats(type?: PerformanceMetric['type'], timeWindow?: number) {
    let filteredMetrics = this.metrics;

    if (type) {
      filteredMetrics = filteredMetrics.filter(m => m.type === type);
    }

    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      filteredMetrics = filteredMetrics.filter(m => m.timestamp > cutoff);
    }

    if (filteredMetrics.length === 0) {
      return null;
    }

    const values = filteredMetrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: filteredMetrics.length,
      average: sum / filteredMetrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99)
    };
  }

  /**
   * Get slow operations
   */
  getSlowOperations(type?: PerformanceMetric['type'], limit = 10) {
    let filteredMetrics = this.metrics;

    if (type) {
      filteredMetrics = filteredMetrics.filter(m => m.type === type);
    }

    return filteredMetrics
      .filter(m => m.value > this.thresholds[m.type])
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  export() {
    return {
      metrics: this.metrics,
      stats: {
        render: this.getStats('render'),
        api: this.getStats('api'),
        navigation: this.getStats('navigation'),
        interaction: this.getStats('interaction')
      },
      slowOperations: this.getSlowOperations()
    };
  }

  private checkThreshold(metric: PerformanceMetric) {
    const threshold = this.thresholds[metric.type];
    if (metric.value > threshold) {
      console.warn(
        `⚠️ Performance threshold exceeded: ${metric.name} took ${metric.value.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }
  }

  private logMetric(metric: PerformanceMetric) {
    const emoji = this.getEmoji(metric.type);
    console.log(
      `${emoji} ${metric.name}: ${metric.value.toFixed(2)}ms`,
      metric.metadata ? metric.metadata : ''
    );
  }

  private getEmoji(type: PerformanceMetric['type']): string {
    switch (type) {
      case 'render': return '🎨';
      case 'api': return '🌐';
      case 'navigation': return '🧭';
      case 'interaction': return '👆';
      default: return '📊';
    }
  }

  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Record a performance metric for component rendering
 */
export function recordComponentPerformance(componentName: string, duration: number) {
  performanceMonitor.record({
    name: componentName,
    value: duration,
    type: 'render'
  });
}
