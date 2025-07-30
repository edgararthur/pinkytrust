'use client';

import { NetworkProvider } from '@/components/providers/NetworkProvider';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AuthProvider } from '@/lib/auth/context';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';
import BottomNavigation from './components/BottomNavigation';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PinkyTrust</title>
        <meta name="description" content="Breast Cancer Awareness Platform" />
      </head>
      <body>
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NetworkProvider>
                <main className="pb-24">
                  {children}
                </main>
                <BottomNavigation />
                <Toaster />
              </NetworkProvider>
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 