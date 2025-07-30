import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  FileText, 
  TrendingUp, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { DashboardStats, Event, Volunteer, Report } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatRelativeTime, getStatusColor } from '../utils';

const DashboardPage: React.FC = () => {
  const { user, organization } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalReports: 0,
    pendingReports: 0,
    totalParticipants: 0,
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [recentVolunteers, setRecentVolunteers] = useState<Volunteer[]>([]);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // Mock data for now
      setStats({
        totalEvents: 24,
        upcomingEvents: 6,
        completedEvents: 18,
        totalVolunteers: 45,
        activeVolunteers: 38,
        totalReports: 12,
        pendingReports: 3,
        totalParticipants: 1250,
      });

      setRecentEvents([
        {
          id: '1',
          organization_id: '1',
          title: 'Breast Cancer Screening Camp',
          description: 'Free screening for women aged 40+',
          event_type: 'screening',
          status: 'approved',
          start_date: '2024-02-15T09:00:00Z',
          end_date: '2024-02-15T17:00:00Z',
          location: 'Community Center',
          address: '123 Main St, City',
          current_participants: 45,
          max_participants: 100,
          contact_email: 'contact@org.com',
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z',
        },
        {
          id: '2',
          organization_id: '1',
          title: 'Awareness Workshop',
          description: 'Educational session on early detection',
          event_type: 'education',
          status: 'pending',
          start_date: '2024-02-20T14:00:00Z',
          end_date: '2024-02-20T16:00:00Z',
          location: 'Health Center',
          address: '456 Oak Ave, City',
          current_participants: 12,
          max_participants: 50,
          contact_email: 'contact@org.com',
          created_at: '2024-01-22T10:00:00Z',
          updated_at: '2024-01-22T10:00:00Z',
        },
      ]);

      setRecentVolunteers([
        {
          id: '1',
          organization_id: '1',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah@example.com',
          phone: '+1234567890',
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          organization_id: '1',
          first_name: 'Michael',
          last_name: 'Brown',
          email: 'michael@example.com',
          status: 'pending',
          created_at: '2024-01-18T10:00:00Z',
          updated_at: '2024-01-18T10:00:00Z',
        },
      ]);

      setPendingReports([
        {
          id: '1',
          organization_id: '1',
          event_id: '1',
          title: 'Screening Camp Report',
          type: 'event',
          status: 'draft',
          data: {},
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z',
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      subtitle: `${stats.upcomingEvents} upcoming`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Volunteers',
      value: stats.activeVolunteers,
      subtitle: `${stats.totalVolunteers} total`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Participants',
      value: stats.totalParticipants,
      subtitle: 'All events combined',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Reports',
      value: stats.totalReports,
      subtitle: `${stats.pendingReports} pending`,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.first_name || 'Organiser'}!
        </h1>
        <p className="text-primary-100">
          {organization?.name ? `Managing ${organization.name}` : 'Ready to make an impact today?'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/events/new">
              <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <Plus className="h-6 w-6" />
                <span>Create Event</span>
              </Button>
            </Link>
            <Link to="/volunteers/invite">
              <Button variant="secondary" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <Users className="h-6 w-6" />
                <span>Invite Volunteers</span>
              </Button>
            </Link>
            <Link to="/reports/new">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <FileText className="h-6 w-6" />
                <span>Create Report</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Events</CardTitle>
            <Link to="/events">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(event.start_date, 'MMM dd')}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {event.current_participants}/{event.max_participants}
                      </span>
                    </div>
                  </div>
                  <Badge variant={event.status === 'approved' ? 'success' : 'warning'}>
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Volunteers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Volunteers</CardTitle>
            <Link to="/volunteers">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVolunteers.map((volunteer) => (
                <div key={volunteer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {volunteer.first_name} {volunteer.last_name}
                      </h4>
                      <p className="text-sm text-gray-500">{volunteer.email}</p>
                    </div>
                  </div>
                  <Badge variant={volunteer.status === 'active' ? 'success' : 'warning'}>
                    {volunteer.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage; 