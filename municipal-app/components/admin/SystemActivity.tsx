'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Building2,
  Award,
  FileText,
  Clock,
  MapPin,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';

interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  municipality_id: string;
  municipality_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  description: string;
  metadata: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface ActivityFilters {
  search: string;
  municipality: string;
  action: string;
  resourceType: string;
  dateRange: string;
  user: string;
}

export default function SystemActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
    municipality: '',
    action: '',
    resourceType: '',
    dateRange: '',
    user: ''
  });
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalActivities: 0,
    todayActivities: 0,
    activeUsers: 0,
    activeMunicipalities: 0
  });

  useEffect(() => {
    loadActivityData();
    loadFilterOptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      
      // Load activity logs with user information (simplified query)
      const { data: activityData, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const processedActivities = (activityData || []).map(activity => ({
        ...activity,
        user_name: 'System User',
        user_email: 'system@municipal.gov',
        municipality_name: activity.municipality_id || 'Unknown Municipality'
      }));

      setActivities(processedActivities);

      // Calculate stats
      const today = new Date().toDateString();
      const todayActivities = processedActivities.filter(
        activity => new Date(activity.created_at).toDateString() === today
      );
      
      const uniqueUsers = new Set(processedActivities.map(a => a.user_id));
      const uniqueMunicipalities = new Set(processedActivities.map(a => a.municipality_id));

      setStats({
        totalActivities: processedActivities.length,
        todayActivities: todayActivities.length,
        activeUsers: uniqueUsers.size,
        activeMunicipalities: uniqueMunicipalities.size
      });

    } catch (error) {
      console.error('Error loading activity data:', error);
      toast.error('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      // Load users for filter
      const { data: userData } = await supabase
        .from('users')
        .select('user_id, first_name, last_name, email')
        .order('first_name');

      setUsers(userData || []);

      // Set some default municipalities for now
      setMunicipalities([
        { id: 'accra-metro', name: 'Accra Metropolitan Assembly' },
        { id: 'tema-metro', name: 'Tema Metropolitan Assembly' },
        { id: 'kumasi-metro', name: 'Kumasi Metropolitan Assembly' },
        { id: 'cape-coast-metro', name: 'Cape Coast Metropolitan Assembly' }
      ]);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchLower) ||
        activity.user_name.toLowerCase().includes(searchLower) ||
        activity.user_email.toLowerCase().includes(searchLower) ||
        activity.municipality_name.toLowerCase().includes(searchLower)
      );
    }

    // Municipality filter
    if (filters.municipality) {
      filtered = filtered.filter(activity => activity.municipality_id === filters.municipality);
    }

    // Action filter
    if (filters.action) {
      filtered = filtered.filter(activity => activity.action === filters.action);
    }

    // Resource type filter
    if (filters.resourceType) {
      filtered = filtered.filter(activity => activity.resource_type === filters.resourceType);
    }

    // User filter
    if (filters.user) {
      filtered = filtered.filter(activity => activity.user_id === filters.user);
    }

    // Date range filter
    if (filters.dateRange) {
      const now = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      if (filters.dateRange !== '') {
        filtered = filtered.filter(activity => 
          new Date(activity.created_at) >= startDate
        );
      }
    }

    setFilteredActivities(filtered);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="h-4 w-4 text-green-600" />;
      case 'update': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'approve': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'reject': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'view': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'organization': return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'event': return <Calendar className="h-4 w-4 text-green-600" />;
      case 'certificate': return <Award className="h-4 w-4 text-purple-600" />;
      case 'report': return <FileText className="h-4 w-4 text-orange-600" />;
      case 'user': return <User className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'approve': return 'bg-green-100 text-green-800';
      case 'reject': return 'bg-red-100 text-red-800';
      case 'view': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportActivities = () => {
    const csvContent = [
      ['Date', 'User', 'Municipality', 'Action', 'Resource', 'Description'].join(','),
      ...filteredActivities.map(activity => [
        new Date(activity.created_at).toLocaleString(),
        activity.user_name,
        activity.municipality_name,
        activity.action,
        activity.resource_type,
        `"${activity.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Activity log exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Activity</h2>
          <p className="text-gray-600">Monitor all municipal administrator and user activities</p>
        </div>
        <Button onClick={exportActivities} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Activity Log
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalActivities}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Activities</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayActivities}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Municipalities</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeMunicipalities}</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            <select
              value={filters.municipality}
              onChange={(e) => setFilters(prev => ({ ...prev, municipality: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Municipalities</option>
              {municipalities.map(municipality => (
                <option key={municipality.id} value={municipality.id}>
                  {municipality.name}
                </option>
              ))}
            </select>

            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="view">View</option>
            </select>

            <select
              value={filters.resourceType}
              onChange={(e) => setFilters(prev => ({ ...prev, resourceType: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Resources</option>
              <option value="organization">Organizations</option>
              <option value="event">Events</option>
              <option value="certificate">Certificates</option>
              <option value="report">Reports</option>
              <option value="user">Users</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>

            <select
              value={filters.user}
              onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Activity Log ({filteredActivities.length} activities)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center gap-2 mt-1">
                        {getActionIcon(activity.action)}
                        {getResourceIcon(activity.resource_type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getActionBadgeColor(activity.action)}>
                            {activity.action}
                          </Badge>
                          <Badge variant="outline">
                            {activity.resource_type}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-900 font-medium">{activity.description}</p>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {activity.user_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {activity.municipality_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
              <p className="text-gray-600">
                {activities.length === 0 
                  ? 'No system activities recorded yet.'
                  : 'No activities match your current filters.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
