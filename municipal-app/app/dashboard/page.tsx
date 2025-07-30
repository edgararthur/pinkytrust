'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  Users,
  Calendar,
  Activity,
  Award,
  Download,
  Settings,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Plus,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  Bell
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/lib/auth/context';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OrganizationsService } from '@/lib/api/organizations';
import { EventsService } from '@/lib/api/events';
import { CertificatesService } from '@/lib/api/certificates';
import { UsersService } from '@/lib/api/users';
import { ReportsService } from '@/lib/api/reports';
import { DashboardService } from '@/lib/api/dashboard';
import { ActivityLogsService } from '@/lib/api/activity-logs';

interface MunicipalStats {
  totalOrganizations: number;
  pendingOrganizations: number;
  activeOrganizations: number;
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalCertificates: number;
  issuedThisMonth: number;
  totalUsers: number;
  activeUsers: number;
  totalReports: number;
  pendingReports: number;
}

export default function MunicipalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<MunicipalStats>({
    totalOrganizations: 0,
    pendingOrganizations: 0,
    activeOrganizations: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    totalCertificates: 0,
    issuedThisMonth: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalReports: 0,
    pendingReports: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Add municipality filtering if user object includes municipality_id in the future
      // For now, skip municipality filtering
      // Fetch organizations
      const orgsResult = await OrganizationsService.getOrganizations({ limit: 1000 });
      // Fetch events
      const eventsResult = await EventsService.getEvents({ limit: 1000 });
      // Fetch certificates
      const certificatesResult = await CertificatesService.getCertificates({}, 1, 1000);
      // Fetch users
      const usersResult = await UsersService.getUsers({ limit: 1000 });
      // Fetch reports
      const reportsResult = await ReportsService.getReports({ limit: 1000 });
      // Calculate detailed stats
      const organizations = orgsResult.data || [];
      const events = eventsResult.data || [];
      const certificates = certificatesResult.data || [];
      const users = usersResult.data || [];
      const reports = reportsResult.data || [];
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setStats({
        totalOrganizations: organizations.length,
        pendingOrganizations: organizations.filter(org => org.registration_status === 'pending').length,
        activeOrganizations: organizations.filter(org => org.registration_status === 'approved').length,
        totalEvents: events.length,
        upcomingEvents: events.filter(event => new Date(event.start_date) > now).length,
        completedEvents: events.filter(event => new Date(event.start_date) <= now).length,
        totalCertificates: certificates.length,
        issuedThisMonth: certificates.filter(cert => new Date(cert.created_at) >= thisMonth).length,
        totalUsers: users.length,
        activeUsers: users.filter(user => user.is_active).length,
        totalReports: reports.length,
        pendingReports: reports.filter(report => report.status === 'submitted' || report.status === 'under_review').length
      });
      // Fetch recent activity (limit 5)
      const recentActivity = await DashboardService.getRecentActivity(5);
      setRecentActivity(recentActivity);
      // Fetch pending approvals (organizations and reports)
      const pendingOrgs = organizations.filter(org => org.registration_status === 'pending').map(org => ({
        type: 'organization',
        title: org.name,
        description: 'Organization pending approval',
        id: org.id
      }));
      const pendingReports = reports.filter(report => report.status === 'submitted' || report.status === 'under_review').map(report => ({
        type: 'report',
        title: report.title,
        description: 'Report pending approval',
        id: report.id
      }));
      setPendingApprovals([...pendingOrgs, ...pendingReports]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getMunicipalityName = () => {
    // Map municipality IDs to actual names
    const municipalityNames: { [key: string]: string } = {
      'accra-metro': 'Accra Metropolitan Assembly',
      'tema-metro': 'Tema Metropolitan Assembly',
      'kumasi-metro': 'Kumasi Metropolitan Assembly',
      'cape-coast-metro': 'Cape Coast Metropolitan Assembly'
    };

    // TODO: Replace with actual municipality ID from user object if available
    const municipalityId = user?.municipality_id;
    if (municipalityId && municipalityNames[municipalityId]) {
      return municipalityNames[municipalityId];
    }

    return 'Your Municipality';
  };

  const getUserRoleDisplay = () => {
    switch (user?.role) {
      case 'municipal_admin':
        return 'Municipal Administrator';
      case 'manager':
        return 'Manager';
      case 'staff':
        return 'Staff Member';
      case 'viewer':
        return 'Viewer';
      default:
        return 'User';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              {getMunicipalityName()}
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Municipal Breast Cancer Awareness Platform • {getUserRoleDisplay()}
            </p>
          </div>

          <div className="flex gap-3">
            <PermissionGuard permission="reports.export">
              <Button variant="outline" size="sm" onClick={() => toast.success('Export functionality ready')}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="settings.update">
              <Button variant="outline" size="sm" onClick={() => toast.success('Settings panel ready')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PermissionGuard permission="organizations.view">
            <StatCard
              title="Organizations"
              value={stats.totalOrganizations}
              subtitle={`${stats.pendingOrganizations} pending approval`}
              icon={Building2}
              color="blue"
              trend={stats.activeOrganizations > 0 ? `${stats.activeOrganizations} active` : undefined}
            />
          </PermissionGuard>

          <PermissionGuard permission="events.view">
            <StatCard
              title="Events"
              value={stats.totalEvents}
              subtitle={`${stats.upcomingEvents} upcoming`}
              icon={Calendar}
              color="green"
              trend={stats.completedEvents > 0 ? `${stats.completedEvents} completed` : undefined}
            />
          </PermissionGuard>

          <PermissionGuard permission="certificates.view">
            <StatCard
              title="Certificates"
              value={stats.totalCertificates}
              subtitle={`${stats.issuedThisMonth} this month`}
              icon={Award}
              color="purple"
            />
          </PermissionGuard>

          <PermissionGuard permission="users.view">
            <StatCard
              title="Users"
              value={stats.totalUsers}
              subtitle={`${stats.activeUsers} active`}
              icon={Users}
              color="orange"
            />
          </PermissionGuard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <PermissionGuard permissions={["organizations.approve", "reports.view"]} requireAll={false}>
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Pending Approvals ({pendingApprovals.length})
                </CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {pendingApprovals.length > 0 ? (
                  <div className="space-y-4">
                    {pendingApprovals.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-3">
                          {item.type === 'organization' ? (
                            <Building2 className="h-5 w-5 text-orange-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-orange-600" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                          <Button size="sm">
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium">All caught up!</p>
                    <p className="text-sm">No pending approvals at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </PermissionGuard>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-gray-900">{activity.description}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PermissionGuard permission="organizations.create">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Add Organization</span>
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="events.create">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Create Event</span>
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="certificates.create">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Award className="h-6 w-6" />
                  <span className="text-sm">Issue Certificate</span>
                </Button>
              </PermissionGuard>

              <PermissionGuard permission="reports.create">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Generate Report</span>
                </Button>
              </PermissionGuard>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className="text-xs text-gray-400 mt-1">{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
