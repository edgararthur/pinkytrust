'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle
} from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you'd send this to your error monitoring service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component'
    };

    console.error('Error Report:', errorReport);
    
    // Example: Send to monitoring service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // });
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false
    });
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  private copyErrorDetails = async () => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  private getErrorTitle = () => {
    const { level } = this.props;
    switch (level) {
      case 'critical':
        return 'Critical System Error';
      case 'page':
        return 'Page Error';
      case 'component':
      default:
        return 'Something went wrong';
    }
  };

  private getErrorMessage = () => {
    const { level } = this.props;
    const { error } = this.state;

    if (level === 'critical') {
      return 'A critical error has occurred that prevents the application from functioning properly. Please contact support.';
    }

    if (level === 'page') {
      return 'This page encountered an error and cannot be displayed. You can try refreshing or return to the dashboard.';
    }

    return error?.message || 'An unexpected error occurred. Please try again.';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component', showDetails: showDetailsProp = true } = this.props;
      const { error, errorInfo, showDetails, copied } = this.state;

      return (
        <div className={`flex items-center justify-center p-4 ${level === 'page' ? 'min-h-screen bg-gray-50' : ''}`}>
          <Card className={`w-full ${level === 'page' ? 'max-w-2xl' : 'max-w-lg'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  level === 'critical' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    level === 'critical' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {this.getErrorTitle()}
                  </h2>
                  <p className="text-sm text-gray-500 font-normal">
                    Error ID: {Date.now().toString(36)}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                {this.getErrorMessage()}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                {level === 'page' && (
                  <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Go to Dashboard
                  </Button>
                )}

                {showDetailsProp && process.env.NODE_ENV === 'development' && (
                  <Button 
                    variant="outline" 
                    onClick={this.toggleDetails}
                    className="flex items-center gap-2"
                  >
                    <Bug className="h-4 w-4" />
                    {showDetails ? 'Hide' : 'Show'} Details
                    {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                )}
              </div>

              {/* Error Details (Development Only) */}
              {showDetails && showDetailsProp && process.env.NODE_ENV === 'development' && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">Error Details</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={this.copyErrorDetails}
                      className="flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono space-y-2">
                    <div>
                      <strong>Error:</strong>
                      <pre className="mt-1 text-red-600 whitespace-pre-wrap">{error?.message}</pre>
                    </div>
                    
                    {error?.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 text-gray-600 whitespace-pre-wrap overflow-x-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-gray-600 whitespace-pre-wrap overflow-x-auto">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Need help?</strong> If this error persists, please contact support with the error ID above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience components for different error levels
export const PageErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="page" />
);

export const ComponentErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="component" />
);

export const CriticalErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="critical" />
);

// Hook for handling async errors in components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }

  return { handleError, clearError };
}
