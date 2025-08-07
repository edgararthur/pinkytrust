'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from '@/store';
import { cn } from '@/utils';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import ErrorBoundary from '@/components/layout/ErrorBoundary';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useAppStore((state) => state.theme);
  const [isOnline, setIsOnline] = useState(true);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip to main content with Alt+M
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        mainContent?.focus();
      }

      // Quick navigation shortcuts
      if (e.altKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const navItems = [
          '/',
          '/events',
          '/assessment',
          '/community',
          '/awareness'
        ];
        const index = parseInt(e.key) - 1;
        if (navItems[index]) {
          window.location.href = navItems[index];
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <div className={cn(
              'min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200',
              'dark:bg-gray-900 dark:text-gray-100',
              'font-sans antialiased'
            )}>
              {/* Skip to main content link */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50 transition-all duration-200 hover:bg-primary-700"
              >
                Skip to main content
              </a>

              {/* Offline indicator */}
              {!isOnline && (
                <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm font-medium z-50">
                  You're currently offline. Some features may not be available.
                </div>
              )}

              {/* Main content */}
              <main 
                id="main-content"
                className="focus:outline-none"
                tabIndex={-1}
                role="main"
                aria-label="Main content"
              >
                {children}
              </main>

              {/* Toast notifications */}
              <Toaster
                position="top-center"
                gutter={8}
                containerClassName="z-50"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'white',
                    color: 'rgb(17 24 39)',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '16px',
                    maxWidth: '400px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#ffffff',
                    },
                    style: {
                      borderColor: '#10b981',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                    style: {
                      borderColor: '#ef4444',
                    },
                  },
                  loading: {
                    iconTheme: {
                      primary: '#6b7280',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />

              {/* Accessibility announcements */}
              <div
                id="accessibility-announcements"
                className="sr-only"
                aria-live="polite"
                aria-atomic="true"
              />

              {/* Background patterns for visual enhancement */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-5">
                  <div className="absolute top-20 left-20 w-32 h-32 bg-primary-500 rounded-full blur-3xl animate-float" />
                  <div className="absolute top-40 right-40 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
                  <div className="absolute bottom-40 left-40 w-40 h-40 bg-pink-500 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
                </div>
              </div>
            </div>
            
            {/* React Query Devtools - only in development */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
} 