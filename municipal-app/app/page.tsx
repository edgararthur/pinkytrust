'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LazyWrapper } from '@/components/common/LazyWrapper';
import { useDashboardStore } from '@/store';
import { usePrefetch, usePerformanceMonitor } from '@/hooks/usePrefetch';
import { usePerformanceOptimizer } from '@/lib/performance/optimizer';
import {
  Building2,
  Award,
  Calendar,
  FileText,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { formatRelativeTime } from '@/utils';

export default function Dashboard() {
  const { stats, recentActivity, notifications, isLoading, fetchAllDashboardData } = useDashboardStore();

  // Performance monitoring
  usePerformanceMonitor('Dashboard');

  // Performance optimization
  const { prefetchRoute, preloadImages } = usePerformanceOptimizer({
    enableCacheWarming: true,
    enableBackgroundRefresh: true,
    cacheWarmingDelay: 1000,
    backgroundRefreshInterval: 300000 // 5 minutes
  });

  // Prefetch critical routes and data
  usePrefetch({
    routes: ['/organizations', '/events', '/certificates', '/reports'],
    priority: 'high',
    delay: 500
  });

  React.useEffect(() => {
    // Use optimized batch fetch instead of separate calls
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  const quickActions = [
    {
      title: 'Review Organizations',
      description: (stats?.pendingOrganisations || 0) > 0
        ? 'Approve pending registrations'
        : 'No pending registrations',
      icon: Building2,
      href: '/organizations?status=pending',
      count: stats?.pendingOrganisations || 0,
      color: 'blue',
    },
    {
      title: 'Issue Certificates',
      description: (stats?.activeCertificates || 0) > 0
        ? 'Manage active certificates'
        : 'Create new certificates',
      icon: Award,
      href: '/certificates/new',
      count: stats?.activeCertificates || 0,
      color: 'green',
    },
    {
      title: 'Monitor Events',
      description: (stats?.activeEvents || 0) > 0
        ? 'View active events'
        : 'No active events',
      icon: Calendar,
      href: '/events?status=active',
      count: stats?.activeEvents || 0,
      color: 'purple',
    },
    {
      title: 'Review Reports',
      description: (stats?.pendingReports || 0) > 0
        ? 'Process pending reports'
        : 'No pending reports',
      icon: FileText,
      href: '/reports?status=pending',
      count: stats?.pendingReports || 0,
      color: 'orange',
    },
  ];

  const getActionColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300',
      green: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300',
      purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-300',
      orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-300',
      pink: 'text-pink-600 bg-pink-50 hover:bg-pink-100 border-pink-200 hover:border-pink-300',
    };
    return colors[color as keyof typeof colors] || colors.pink;
  };



  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Welcome Admin
          </h1>
          <p className="mt-2 text-gray-600 max-w-3xl text-sm font-medium">
            Welcome to the Municipal Administration Portal for the Breast Cancer Awareness Platform. Monitor activities, approve organizations, and manage events from this central dashboard.
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="border-t-4 border-t-pink-500 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md ${getActionColor(action.color)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <action.icon className="h-6 w-6" />
                          <div>
                            <h3 className="font-medium">{action.title}</h3>
                            <p className="text-sm opacity-75">{action.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {action.count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {action.count}
                            </Badge>
                          )}
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <LazyWrapper minHeight="400px">
              <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-1">No recent activity</p>
                      <p className="text-xs text-gray-400">Activity will appear here as users interact with the system</p>
                    </div>
                  ) : (
                    recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {activity.action === 'approved' && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {activity.action === 'rejected' && (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          {activity.action === 'created' && (
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.userName}</span>
                            {' '}
                            <span className="text-gray-600">
                              {activity.action} {activity.resource}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {recentActivity.length > 5 && (
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all activity
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            </LazyWrapper>
          </div>
        </div>

        {/* Notifications */}
        <LazyWrapper minHeight="200px">
          <Card className="border-t-4 border-t-yellow-500 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                System Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">No notifications</p>
                  <p className="text-xs text-gray-400">System notifications will appear here when available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : notification.type === 'error'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-600 mt-2"></div>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </LazyWrapper>
      </div>
    </DashboardLayout>
  );
}