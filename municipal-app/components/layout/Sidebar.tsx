'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import { useUIStore } from '@/store';
import { 
  LayoutDashboard,
  Building2,
  Award,
  Calendar,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Bell,
  LogOut,
  Shield
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

import Logo from '@public/images/logo.png';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and statistics',
    permission: 'dashboard.view' as const
  },
  {
    name: 'Organizations',
    href: '/dashboard/organizations',
    icon: Building2,
    description: 'Manage organization registrations',
    permission: 'organizations.view' as const
  },
  {
    name: 'Certificates',
    href: '/dashboard/certificates',
    icon: Award,
    description: 'Issue and manage certificates',
    permission: 'certificates.view' as const
  },
  {
    name: 'Events',
    href: '/dashboard/events',
    icon: Calendar,
    description: 'Monitor and approve events',
    permission: 'events.view' as const
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
    description: 'Review event reports',
    permission: 'reports.view' as const
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: Users,
    description: 'Manage municipal staff',
    permission: 'users.view' as const
  },
  {
    name: 'Activity Logs',
    href: '/dashboard/activity',
    icon: Activity,
    description: 'System activity and audit trail',
    permission: 'activity.view' as const
  },
  {
    name: 'Permissions',
    href: '/permissions',
    icon: Shield,
    description: 'Role-based access control',
    roles: ['admin'] as const
  },
];

const bottomNavigation = [
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    description: 'System notifications'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Application settings'
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-16'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          <div className={cn('flex items-center', !sidebarOpen && 'lg:justify-center')}>
            <div className="flex items-center">
              <Image src="/images/logo.png" alt="PinkyTrust Logo" width={50} height={40} className="z-10 rounded-full" />
              {(sidebarOpen || window.innerWidth < 1024) && (
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-gray-900">PinkyTrust</h1>
                  <p className="text-xs text-gray-500">Municipal Platform</p>
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <PermissionGuard
                key={item.name}
                permission={item.permission}
                roles={item.roles}
                fallback={
                  // Show a disabled/grayed out version if no permission
                  <div
                    key={`${item.name}-disabled`}
                    className="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium opacity-50 cursor-not-allowed"
                    title={`${item.name} - Access Restricted`}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-300" />
                    {(sidebarOpen || window.innerWidth < 1024) && (
                      <div className="flex-1">
                        <div className="font-medium mt-1 mb-1 text-gray-400">{item.name}</div>
                      </div>
                    )}
                  </div>
                }
              >
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-pink-50 text-pink-700 border-l-4 border-pink-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:pl-4'
                  )}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200',
                      isActive ? 'text-pink-600' : 'text-gray-400 group-hover:text-pink-500'
                    )}
                  />
                  {(sidebarOpen || window.innerWidth < 1024) && (
                    <div className="flex-1">
                      <div className="font-medium mt-1 mb-1">{item.name}</div>
                    </div>
                  )}
                </Link>
              </PermissionGuard>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 p-2">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-pink-50 text-pink-700 border-l-4 border-pink-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:pl-4'
                )}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200',
                    isActive ? 'text-pink-600' : 'text-gray-400 group-hover:text-pink-500'
                  )}
                />
                {(sidebarOpen || window.innerWidth < 1024) && item.name}
              </Link>
            );
          })}
          
          {/* Logout */}
          <button
            className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
            {(sidebarOpen || window.innerWidth < 1024) && 'Logout'}
          </button>
        </div>

        {/* User Info */}
        {(sidebarOpen || window.innerWidth < 1024) && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-sm font-medium text-pink-600">A</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@municipality.gov</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
