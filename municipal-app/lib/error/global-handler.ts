/**
 * Global Error Handler
 * Centralized error handling and reporting
 */

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  level: 'error' | 'warning' | 'info';
  context?: Record<string, any>;
  tags?: string[];
}

export interface ErrorHandlerConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  enableUserNotification: boolean;
  maxErrorsPerSession: number;
  remoteEndpoint?: string;
}

class GlobalErrorHandler {
  private config: ErrorHandlerConfig = {
    enableConsoleLogging: true,
    enableRemoteLogging: process.env.NODE_ENV === 'production',
    enableUserNotification: true,
    maxErrorsPerSession: 50,
    remoteEndpoint: '/api/errors'
  };

  private errorCount = 0;
  private reportedErrors = new Set<string>();

  constructor(config?: Partial<ErrorHandlerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Only setup handlers on client side
    if (typeof window !== 'undefined') {
      this.setupGlobalHandlers();
    }
  }

  private setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          level: 'error',
          context: { type: 'unhandledrejection', reason: event.reason },
          tags: ['promise', 'unhandled']
        }
      );
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(
        new Error(event.message),
        {
          level: 'error',
          context: {
            type: 'javascript',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          },
          tags: ['javascript', 'global']
        }
      );
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement;
        this.handleError(
          new Error(`Resource failed to load: ${target.tagName}`),
          {
            level: 'warning',
            context: {
              type: 'resource',
              tagName: target.tagName,
              src: (target as any).src || (target as any).href
            },
            tags: ['resource', 'loading']
          }
        );
      }
    }, true);
  }

  public handleError(
    error: Error,
    options: {
      level?: 'error' | 'warning' | 'info';
      context?: Record<string, any>;
      tags?: string[];
      userId?: string;
    } = {}
  ) {
    const { level = 'error', context, tags, userId } = options;

    // Check if we've exceeded the error limit
    if (this.errorCount >= this.config.maxErrorsPerSession) {
      return;
    }

    // Generate error ID
    const errorId = this.generateErrorId(error);

    // Skip if we've already reported this exact error
    if (this.reportedErrors.has(errorId)) {
      return;
    }

    this.errorCount++;
    this.reportedErrors.add(errorId);

    const errorReport: ErrorReport = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId,
      level,
      context,
      tags
    };

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorReport);
    }

    // Remote logging
    if (this.config.enableRemoteLogging) {
      this.logToRemote(errorReport);
    }

    // User notification
    if (this.config.enableUserNotification && level === 'error') {
      this.notifyUser(errorReport);
    }
  }

  private generateErrorId(error: Error): string {
    const hash = this.simpleHash(error.message + (error.stack || ''));
    return `err_${hash}_${Date.now()}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private logToConsole(errorReport: ErrorReport) {
    const { level, message, context, tags } = errorReport;
    
    const logMethod = level === 'error' ? console.error : 
                     level === 'warning' ? console.warn : 
                     console.info;

    logMethod(
      `[${level.toUpperCase()}] ${message}`,
      {
        id: errorReport.id,
        timestamp: errorReport.timestamp,
        context,
        tags,
        stack: errorReport.stack
      }
    );
  }

  private async logToRemote(errorReport: ErrorReport) {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      });
    } catch (error) {
      console.warn('Failed to send error report to remote endpoint:', error);
    }
  }

  private notifyUser(errorReport: ErrorReport) {
    // In a real app, you might show a toast notification or modal
    // For now, we'll just log it
    console.info('User notification would be shown for error:', errorReport.id);
  }

  public getErrorStats() {
    return {
      errorCount: this.errorCount,
      reportedErrors: this.reportedErrors.size,
      maxErrors: this.config.maxErrorsPerSession
    };
  }

  public clearErrors() {
    this.errorCount = 0;
    this.reportedErrors.clear();
  }

  public updateConfig(config: Partial<ErrorHandlerConfig>) {
    this.config = { ...this.config, ...config };
  }
}

// Global instance
export const globalErrorHandler = new GlobalErrorHandler();

// Utility functions for manual error reporting
export function reportError(error: Error, context?: Record<string, any>) {
  globalErrorHandler.handleError(error, { level: 'error', context });
}

export function reportWarning(message: string, context?: Record<string, any>) {
  globalErrorHandler.handleError(new Error(message), { level: 'warning', context });
}

export function reportInfo(message: string, context?: Record<string, any>) {
  globalErrorHandler.handleError(new Error(message), { level: 'info', context });
}

// React hook for error reporting
export function useErrorReporting() {
  const report = React.useCallback((error: Error, context?: Record<string, any>) => {
    reportError(error, context);
  }, []);

  const reportWarning = React.useCallback((message: string, context?: Record<string, any>) => {
    globalErrorHandler.handleError(new Error(message), { level: 'warning', context });
  }, []);

  const reportInfo = React.useCallback((message: string, context?: Record<string, any>) => {
    globalErrorHandler.handleError(new Error(message), { level: 'info', context });
  }, []);

  return { report, reportWarning, reportInfo };
}

// Add React import
import React from 'react';
