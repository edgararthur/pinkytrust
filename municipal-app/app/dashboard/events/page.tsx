'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Calendar, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Eye,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  max_participants: number;
  registered_participants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  type: 'screening' | 'awareness' | 'workshop' | 'support_group';
  municipality_id: string;
  created_at: string;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API call
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Breast Cancer Awareness Walk',
          description: 'Community walk to raise awareness about breast cancer prevention and early detection',
          date: '2024-02-15',
          time: '08:00',
          location: 'Independence Square, Accra',
          organizer: 'Pink Ribbon Foundation',
          max_participants: 500,
          registered_participants: 234,
          status: 'upcoming',
          type: 'awareness',
          municipality_id: user?.municipality_id || 'accra-metro',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Free Breast Cancer Screening',
          description: 'Free mammography and clinical breast examination for women aged 40+',
          date: '2024-02-20',
          time: '09:00',
          location: 'Korle-Bu Teaching Hospital',
          organizer: 'Ministry of Health',
          max_participants: 100,
          registered_participants: 87,
          status: 'upcoming',
          type: 'screening',
          municipality_id: user?.municipality_id || 'accra-metro',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          title: 'Survivor Support Group Meeting',
          description: 'Monthly support group meeting for breast cancer survivors and their families',
          date: '2024-01-28',
          time: '15:00',
          location: 'Community Center, Tema',
          organizer: 'Hope Cancer Support',
          max_participants: 30,
          registered_participants: 22,
          status: 'completed',
          type: 'support_group',
          municipality_id: user?.municipality_id || 'accra-metro',
          created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '4',
          title: 'Breast Health Education Workshop',
          description: 'Educational workshop on breast self-examination and healthy lifestyle',
          date: '2024-02-25',
          time: '14:00',
          location: 'University of Ghana, Legon',
          organizer: 'Women Health Initiative',
          max_participants: 150,
          registered_participants: 45,
          status: 'upcoming',
          type: 'workshop',
          municipality_id: user?.municipality_id || 'accra-metro',
          created_at: new Date(Date.now() - 259200000).toISOString()
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-800">Ongoing</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      screening: 'Screening',
      awareness: 'Awareness',
      workshop: 'Workshop',
      support_group: 'Support Group'
    };
    
    return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels] || type}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
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
              <Calendar className="h-6 w-6 text-green-600" />
              Events
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Manage breast cancer awareness events and activities
            </p>
          </div>
          
          <PermissionGuard permission="events.create">
            <Button onClick={() => toast.success('Create event feature coming soon!')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </PermissionGuard>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="screening">Screening</option>
                <option value="awareness">Awareness</option>
                <option value="workshop">Workshop</option>
                <option value="support_group">Support Group</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {events.filter(event => event.status === 'upcoming').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Participants</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {events.reduce((sum, event) => sum + event.registered_participants, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {events.filter(event => event.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Events ({filteredEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          {getStatusBadge(event.status)}
                          {getTypeBadge(event.type)}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{event.registered_participants}/{event.max_participants} participants</span>
                            </div>
                            <div className="text-gray-600">
                              <span>Organized by: {event.organizer}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress bar for participants */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Registration Progress</span>
                            <span>{Math.round((event.registered_participants / event.max_participants) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(event.registered_participants / event.max_participants) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <PermissionGuard permission="events.update">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'No events match your current filters.'
                    : 'No events have been created yet.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
