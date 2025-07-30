'use client';

import React from 'react';
import { cn } from '@/utils';
import { useUIStore } from '@/store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      
      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        <Header />
        
        <main className={cn('p-4 lg:p-8 max-w-7xl mx-auto', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
