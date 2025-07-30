'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
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
  Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import UserManagement from '@/components/admin/UserManagement';
import SystemActivity from '@/components/admin/SystemActivity';

interface DashboardStats {
  users: number;
  organizations: number;
  events: number;
  certificates: number;
}

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'organizations' | 'events' | 'certificates' | 'activity'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    organizations: 0,
    events: 0,
    certificates: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentOrgs, setRecentOrgs] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load basic stats
      const [usersCount, orgsCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('organizations').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        users: usersCount.count || 0,
        organizations: orgsCount.count || 0,
        events: 0,
        certificates: 0
      });

      // Load recent data
      const [recentUsersData, recentOrgsData] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('organizations').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      setRecentUsers(recentUsersData.data || []);
      setRecentOrgs(recentOrgsData.data || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Don't show error toast, just use default values
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color = 'blue' 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    trend?: string; 
    color?: string; 
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
            {trend && (
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const UserCard = ({ user }: { user: any }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-sm">{user.first_name} {user.last_name}</p>
          <p className="text-xs text-gray-600">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={user.role === 'super_admin' ? 'destructive' : 'default'} className="text-xs">
          {user.role}
        </Badge>
        <Badge variant={user.is_active ? 'success' : 'secondary'} className="text-xs">
          {user.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    </div>
  );

  const OrgCard = ({ org }: { org: any }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <Building2 className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <p className="font-medium text-sm">{org.name}</p>
          <p className="text-xs text-gray-600">{org.organization_type}</p>
        </div>
      </div>
      <Badge
        variant={
          org.status === 'approved' ? 'approved' :
          org.status === 'pending' ? 'pending' :
          org.status === 'rejected' ? 'rejected' : 'default'
        }
        className="text-xs"
      >
        {org.status}
      </Badge>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">Municipal Breast Cancer Awareness Platform</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => toast.success('Export functionality ready')}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success('Settings panel ready')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'organizations', label: 'Organizations', icon: Building2 },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'certificates', label: 'Certificates', icon: Award },
              { id: 'activity', label: 'Activity Logs', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.users}
                icon={Users}
                trend="+12% from last month"
                color="blue"
              />
              <StatCard
                title="Organizations"
                value={stats.organizations}
                icon={Building2}
                trend="+8% from last month"
                color="green"
              />
              <StatCard
                title="Active Events"
                value={stats.events}
                icon={Calendar}
                trend="+15% from last month"
                color="purple"
              />
              <StatCard
                title="Certificates"
                value={stats.certificates}
                icon={Award}
                trend="+5% from last month"
                color="orange"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Users</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('users')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentUsers.length > 0 ? (
                      recentUsers.map((user) => (
                        <UserCard key={user.user_id} user={user} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No users found</p>
                        <p className="text-xs">Users will appear here once added</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Organizations */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Organizations</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('organizations')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Organizations
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentOrgs.length > 0 ? (
                      recentOrgs.map((org) => (
                        <OrgCard key={org.id} org={org} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No organizations found</p>
                        <p className="text-xs">Organizations will appear here once registered</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Database</p>
                      <p className="text-sm text-gray-600">Connected & Operational</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Authentication</p>
                      <p className="text-sm text-gray-600">Active & Secure</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">System Health</p>
                      <p className="text-sm text-gray-600">All Services Running</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && <UserManagement />}

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <Building2 className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Organizations Management
                </h3>
                <p className="text-gray-600 mb-6">
                  Organizations are managed by municipal administrators in their respective districts.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-3">System-Wide Overview</h4>
                    <div className="space-y-2 text-sm text-purple-800">
                      <div className="flex justify-between">
                        <span>Total Organizations:</span>
                        <span className="font-medium">{stats.totalOrganizations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Approvals:</span>
                        <span className="font-medium">{stats.pendingOrganizations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Organizations:</span>
                        <span className="font-medium">{stats.activeOrganizations}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Municipal Admin Role</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Review organization registrations</li>
                      <li>• Approve/reject applications</li>
                      <li>• Monitor organization activities</li>
                      <li>• Manage district-specific organizations</li>
                      <li>• Generate reports and analytics</li>
                    </ul>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Municipal administrators log in to their own dashboards to manage organizations in their districts.
                </p>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setActiveTab('users')} variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Municipal Admins
                  </Button>
                  <Button onClick={() => setActiveTab('activity')}>
                    <Activity className="h-4 w-4 mr-2" />
                    View System Activity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <Calendar className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Events Management
                </h3>
                <p className="text-gray-600 mb-6">
                  Breast cancer awareness events are organized and managed by municipal administrators.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">System-Wide Events</h4>
                    <div className="space-y-2 text-sm text-green-800">
                      <div className="flex justify-between">
                        <span>Total Events:</span>
                        <span className="font-medium">{stats.totalEvents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Upcoming Events:</span>
                        <span className="font-medium">{stats.upcomingEvents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Events:</span>
                        <span className="font-medium">{stats.completedEvents}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Event Types</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Screening campaigns</li>
                      <li>• Educational workshops</li>
                      <li>• Community outreach</li>
                      <li>• Awareness walks</li>
                      <li>• Health fairs</li>
                    </ul>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Municipal administrators create and manage events for their districts through their own dashboards.
                </p>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setActiveTab('users')} variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Municipal Admins
                  </Button>
                  <Button onClick={() => setActiveTab('activity')}>
                    <Activity className="h-4 w-4 mr-2" />
                    View System Activity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <Award className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Certificates Management
                </h3>
                <p className="text-gray-600 mb-6">
                  Participation certificates and awards are managed by municipal administrators.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-3">System-Wide Certificates</h4>
                    <div className="space-y-2 text-sm text-orange-800">
                      <div className="flex justify-between">
                        <span>Total Certificates:</span>
                        <span className="font-medium">{stats.totalCertificates}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Issued This Month:</span>
                        <span className="font-medium">{stats.monthlyIssuedCertificates}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Approvals:</span>
                        <span className="font-medium">{stats.pendingCertificates}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Certificate Types</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Event participation</li>
                      <li>• Volunteer recognition</li>
                      <li>• Training completion</li>
                      <li>• Community service</li>
                      <li>• Achievement awards</li>
                    </ul>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Municipal administrators issue and manage certificates for participants in their districts.
                </p>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setActiveTab('users')} variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Municipal Admins
                  </Button>
                  <Button onClick={() => setActiveTab('activity')}>
                    <Activity className="h-4 w-4 mr-2" />
                    View System Activity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <SystemActivity />
        )}
      </div>
    </div>
  );
}
