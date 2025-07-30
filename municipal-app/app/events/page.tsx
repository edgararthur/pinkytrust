'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { EventModal } from '@/components/events/EventModal';
import { 
  Calendar,
  Search,
  Filter,
  Clock,
  MapPin,
  Mail,
  Phone,
  Users,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart2,
  Building2
} from 'lucide-react';
import { EventsService, Event, EventFilters } from '@/lib/api/events';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'react-hot-toast';
import { formatDate, formatRelativeTime } from '@/utils';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'approve' | 'reject'>('view');
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
    byType: {} as Record<string, number>
  });

  useEffect(() => {
    loadEvents();
    loadStats();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const loadEvents = async () => {
    if (!user?.municipality_id) return;

    try {
      setLoading(true);
      const filters: EventFilters = {
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
        event_type: typeFilter !== 'all' ? typeFilter as any : undefined,
        organization_id: user.organization_id,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      const response = await EventsService.getEvents(filters);
      setEvents(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.municipality_id) return;

    try {
      const eventStats = await EventsService.getEventStats(user.organization_id);
      setStats(eventStats);
    } catch (error) {
      console.error('Error loading event stats:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setModalMode('view');
  };

  const handleModalSuccess = () => {
    loadEvents();
    loadStats();
    handleModalClose();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'default' as const, icon: Clock, label: 'Draft' },
      pending: { variant: 'warning' as const, icon: Clock, label: 'Pending Approval' },
      approved: { variant: 'success' as const, icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' },
      cancelled: { variant: 'destructive' as const, icon: AlertTriangle, label: 'Cancelled' },
      completed: { variant: 'secondary' as const, icon: CheckCircle, label: 'Completed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
              <p className="text-sm text-gray-500">{event.event_type}</p>
            </div>
          </div>
          {getStatusBadge(event.status)}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {formatDate(event.start_date)} - {formatDate(event.end_date)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            {event.location}
          </div>
          {event.contact_email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              {event.contact_email}
            </div>
          )}
          {event.contact_phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              {event.contact_phone}
            </div>
          )}
          {event.max_participants && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              {event.current_participants} / {event.max_participants} participants
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Created {formatRelativeTime(event.created_at)}
          </div>
          {event.submitted_at && (
            <div className="flex items-center gap-1">
              <Send className="h-3 w-3" />
              Submitted {formatRelativeTime(event.submitted_at)}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedEvent(event);
              setModalMode('view');
              setShowModal(true);
            }}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          
          {event.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedEvent(event);
                  setModalMode('approve');
                  setShowModal(true);
                }}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedEvent(event);
                  setModalMode('reject');
                  setShowModal(true);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const StatCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: any }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
          </div>
          <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-pink-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events</h2>
          <p className="text-gray-600">Review and manage events in your municipality</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Events" value={stats.total} icon={BarChart2} />
        <StatCard title="Pending Approval" value={stats.pending} icon={Clock} />
        <StatCard title="Approved Events" value={stats.approved} icon={CheckCircle} />
        <StatCard title="Rejected Events" value={stats.rejected} icon={XCircle} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="fundraising">Fundraising</SelectItem>
                <SelectItem value="awareness">Awareness</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadEvents}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No events have been submitted for approval yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Event Modal */}
      <EventModal
        isOpen={showModal}
        onClose={handleModalClose}
        mode={modalMode}
        event={selectedEvent}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}