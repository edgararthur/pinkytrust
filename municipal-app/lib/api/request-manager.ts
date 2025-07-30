/**
 * Request Manager for API call optimization
 * Handles request deduplication, batching, and caching
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface BatchRequest {
  requests: Array<{
    id: string;
    endpoint: string;
    params: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>;
  timer: NodeJS.Timeout;
}

class RequestManager {
  private pendingRequests = new Map<string, PendingRequest>();
  private batchRequests = new Map<string, BatchRequest>();
  private readonly DEDUP_WINDOW = 100; // 100ms window for deduplication
  private readonly BATCH_DELAY = 50; // 50ms delay for batching
  private readonly MAX_BATCH_SIZE = 10;

  /**
   * Execute a request with deduplication
   */
  async executeRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: {
      enableDeduplication?: boolean;
      enableBatching?: boolean;
      batchKey?: string;
    } = {}
  ): Promise<T> {
    const { enableDeduplication = true, enableBatching = false, batchKey } = options;

    // Handle request deduplication
    if (enableDeduplication) {
      const existing = this.pendingRequests.get(key);
      if (existing && Date.now() - existing.timestamp < this.DEDUP_WINDOW) {
        console.log(`🔄 Deduplicating request: ${key}`);
        return existing.promise;
      }
    }

    // Handle request batching
    if (enableBatching && batchKey) {
      return this.addToBatch(batchKey, key, requestFn);
    }

    // Execute single request
    return this.executeSingleRequest(key, requestFn, enableDeduplication);
  }

  /**
   * Execute a single request with optional deduplication
   */
  private async executeSingleRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    enableDeduplication: boolean
  ): Promise<T> {
    const promise = new Promise<T>((resolve, reject) => {
      if (enableDeduplication) {
        this.pendingRequests.set(key, {
          promise: promise as Promise<any>,
          timestamp: Date.now(),
          resolve,
          reject
        });
      }

      requestFn()
        .then((result) => {
          resolve(result);
          if (enableDeduplication) {
            this.pendingRequests.delete(key);
          }
        })
        .catch((error) => {
          reject(error);
          if (enableDeduplication) {
            this.pendingRequests.delete(key);
          }
        });
    });

    return promise;
  }

  /**
   * Add request to batch
   */
  private addToBatch<T>(
    batchKey: string,
    requestKey: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let batch = this.batchRequests.get(batchKey);

      if (!batch) {
        batch = {
          requests: [],
          timer: setTimeout(() => this.executeBatch(batchKey), this.BATCH_DELAY)
        };
        this.batchRequests.set(batchKey, batch);
      }

      batch.requests.push({
        id: requestKey,
        endpoint: batchKey,
        params: {},
        resolve,
        reject
      });

      // Execute immediately if batch is full
      if (batch.requests.length >= this.MAX_BATCH_SIZE) {
        clearTimeout(batch.timer);
        this.executeBatch(batchKey);
      }
    });
  }

  /**
   * Execute batched requests
   */
  private async executeBatch(batchKey: string) {
    const batch = this.batchRequests.get(batchKey);
    if (!batch) return;

    this.batchRequests.delete(batchKey);
    console.log(`📦 Executing batch: ${batchKey} (${batch.requests.length} requests)`);

    try {
      // For now, execute requests in parallel
      // In a real implementation, you'd send a single batched request to the server
      const results = await Promise.allSettled(
        batch.requests.map(async (req) => {
          // This would be replaced with actual batch API call
          return { id: req.id, data: null };
        })
      );

      results.forEach((result, index) => {
        const request = batch.requests[index];
        if (result.status === 'fulfilled') {
          request.resolve(result.value);
        } else {
          request.reject(result.reason);
        }
      });
    } catch (error) {
      batch.requests.forEach(req => req.reject(error));
    }
  }

  /**
   * Clear all pending requests
   */
  clear() {
    this.pendingRequests.clear();
    this.batchRequests.forEach(batch => clearTimeout(batch.timer));
    this.batchRequests.clear();
  }

  /**
   * Get statistics about request optimization
   */
  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      batchRequests: this.batchRequests.size,
      totalBatchedRequests: Array.from(this.batchRequests.values())
        .reduce((sum, batch) => sum + batch.requests.length, 0)
    };
  }
}

// Global request manager instance
export const requestManager = new RequestManager();

/**
 * Higher-order function to wrap API calls with optimization
 */
export function optimizeApiCall<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    keyGenerator?: (...args: T) => string;
    enableDeduplication?: boolean;
    enableBatching?: boolean;
    batchKey?: string;
  } = {}
) {
  const {
    keyGenerator = (...args) => JSON.stringify(args),
    enableDeduplication = true,
    enableBatching = false,
    batchKey
  } = options;

  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    
    return requestManager.executeRequest(
      key,
      () => fn(...args),
      {
        enableDeduplication,
        enableBatching,
        batchKey
      }
    );
  };
}

/**
 * Decorator for class methods
 */
export function OptimizeApiCall(options: {
  enableDeduplication?: boolean;
  enableBatching?: boolean;
  batchKey?: string;
} = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = optimizeApiCall(originalMethod, {
      keyGenerator: (...args) => `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`,
      ...options
    });

    return descriptor;
  };
}
