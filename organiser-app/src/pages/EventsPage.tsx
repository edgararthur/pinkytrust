import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Edit, 
  Trash2,
  Eye,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Event } from '../types';
import { formatDate, formatDateTime, getEventTypeColor, getStatusColor } from '../utils';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // Mock data for now
      const mockEvents: Event[] = [
        {
          id: '1',
          organization_id: '1',
          title: 'Breast Cancer Screening Camp',
          description: 'Free screening for women aged 40+ with professional medical staff',
          event_type: 'screening',
          status: 'approved',
          start_date: '2024-02-15T09:00:00Z',
          end_date: '2024-02-15T17:00:00Z',
          location: 'Community Center',
          address: '123 Main St, City',
          current_participants: 45,
          max_participants: 100,
          registration_deadline: '2024-02-10T23:59:59Z',
          contact_email: 'contact@org.com',
          contact_phone: '+1234567890',
          requirements: ['ID Card', 'Previous medical records'],
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z',
        },
        {
          id: '2',
          organization_id: '1',
          title: 'Awareness Workshop',
          description: 'Educational session on early detection and prevention',
          event_type: 'education',
          status: 'pending',
          start_date: '2024-02-20T14:00:00Z',
          end_date: '2024-02-20T16:00:00Z',
          location: 'Health Center',
          address: '456 Oak Ave, City',
          current_participants: 12,
          max_participants: 50,
          registration_deadline: '2024-02-18T23:59:59Z',
          contact_email: 'contact@org.com',
          created_at: '2024-01-22T10:00:00Z',
          updated_at: '2024-01-22T10:00:00Z',
        },
        {
          id: '3',
          organization_id: '1',
          title: 'Support Group Meeting',
          description: 'Monthly support group for survivors and families',
          event_type: 'support',
          status: 'completed',
          start_date: '2024-01-25T18:00:00Z',
          end_date: '2024-01-25T20:00:00Z',
          location: 'Community Hall',
          address: '789 Pine St, City',
          current_participants: 25,
          max_participants: 30,
          contact_email: 'contact@org.com',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-25T20:00:00Z',
        },
        {
          id: '4',
          organization_id: '1',
          title: 'Fundraising Gala',
          description: 'Annual fundraising event to support research',
          event_type: 'fundraising',
          status: 'draft',
          start_date: '2024-03-15T19:00:00Z',
          end_date: '2024-03-15T23:00:00Z',
          location: 'Grand Hotel',
          address: '321 Elm St, City',
          current_participants: 0,
          max_participants: 200,
          registration_deadline: '2024-03-10T23:59:59Z',
          contact_email: 'contact@org.com',
          contact_phone: '+1234567890',
          created_at: '2024-01-25T10:00:00Z',
          updated_at: '2024-01-25T10:00:00Z',
        },
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        // TODO: Replace with actual API call
        setEvents(events.filter(event => event.id !== eventId));
        // Show success toast
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = typeFilter === 'all' || event.event_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'screening': return 'info';
      case 'education': return 'success';
      case 'support': return 'default';
      case 'awareness': return 'warning';
      case 'fundraising': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage your organization's events</p>
        </div>
        <Link to="/events/new">
          <Button className="mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="screening">Screening</option>
              <option value="education">Education</option>
              <option value="support">Support</option>
              <option value="awareness">Awareness</option>
              <option value="fundraising">Fundraising</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={getStatusBadgeVariant(event.status)}>
                      {event.status}
                    </Badge>
                    <Badge variant={getTypeBadgeVariant(event.event_type)}>
                      {event.event_type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {event.description}
              </p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDateTime(event.start_date)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>
                    {event.current_participants}
                    {event.max_participants && `/${event.max_participants}`} participants
                  </span>
                </div>
                {event.registration_deadline && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Registration until {formatDate(event.registration_deadline)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Created {formatDate(event.created_at)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {event.status === 'draft' && (
                      <Button size="sm">
                        Publish
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters to see more events.'
                : "You haven't created any events yet. Create your first event to get started."
              }
            </p>
            <Link to="/events/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventsPage; 