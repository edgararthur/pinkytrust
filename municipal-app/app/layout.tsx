import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth/context';
import { CriticalErrorBoundary } from '@/components/error/ErrorBoundary';
import '@/lib/error/global-handler'; // Initialize global error handler

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PinkyTrust | Municipal Office',
  description: 'Administrative dashboard for breast cancer awareness platform management',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#db2777',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gray-50">
        <CriticalErrorBoundary>
          <AuthProvider>
            {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          </AuthProvider>
        </CriticalErrorBoundary>
      </body>
    </html>
  );
} 