'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Form, FormField, FormLabel, FormError, FormGroup, validateRequired } from '@/components/ui/Form';
import { EventsService } from '@/lib/api/events';
import { formatDate, formatRelativeTime } from '@/utils';
import { toast } from 'react-hot-toast';
import type { Database } from '@/lib/supabase/types';
import { useAuth } from '@/lib/auth/context';
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  FileText,
  Users,
  Check,
  X,
  Eye,
  Edit,
  Save,
  AlertTriangle
} from 'lucide-react';

type Event = Database['public']['Tables']['events']['Row'];

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'add' | 'edit' | 'approve' | 'reject';
  event?: Event | null;
  onSuccess?: () => void;
}

type EventType = 'screening' | 'education' | 'fundraising' | 'awareness' | 'support';
type EventStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

interface FormData {
  title: string;
  description: string;
  event_type: EventType;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number | null;
  contact_email: string;
  contact_phone: string;
  requirements: string[];
  status: EventStatus;
}

export function EventModal({ 
  isOpen, 
  onClose, 
  mode, 
  event, 
  onSuccess 
}: EventModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = React.useState<FormData>({
    title: '',
    description: '',
    event_type: 'awareness',
    start_date: '',
    end_date: '',
    location: '',
    max_participants: null,
    contact_email: '',
    contact_phone: '',
    requirements: [],
    status: 'draft'
  });
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [reviewNotes, setReviewNotes] = React.useState('');

  // Initialize form data when event changes
  React.useEffect(() => {
    if (event && (mode === 'edit' || mode === 'view' || mode === 'approve' || mode === 'reject')) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        event_type: event.event_type || 'awareness',
        start_date: event.start_date ? new Date(event.start_date).toISOString().split('T')[0] : '',
        end_date: event.end_date ? new Date(event.end_date).toISOString().split('T')[0] : '',
        location: event.location || '',
        max_participants: event.max_participants || null,
        contact_email: event.contact_email || '',
        contact_phone: event.contact_phone || '',
        requirements: event.requirements || [],
        status: event.status as EventStatus
      });
    } else if (mode === 'add') {
      setFormData({
        title: '',
        description: '',
        event_type: 'awareness',
        start_date: '',
        end_date: '',
        location: '',
        max_participants: null,
        contact_email: user?.email || '',
        contact_phone: '',
        requirements: [],
        status: 'draft'
      });
    }
    setErrors({});
    setReviewNotes('');
  }, [event, mode, user?.email]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    const titleError = validateRequired(formData.title, 'Event title');
    if (titleError) newErrors.title = titleError;

    const descriptionError = validateRequired(formData.description, 'Description');
    if (descriptionError) newErrors.description = descriptionError;

    const locationError = validateRequired(formData.location, 'Location');
    if (locationError) newErrors.location = locationError;

    const startDateError = validateRequired(formData.start_date, 'Start date');
    if (startDateError) newErrors.start_date = startDateError;

    const endDateError = validateRequired(formData.end_date, 'End date');
    if (endDateError) newErrors.end_date = endDateError;

    // Date validation
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    // Email validation
    if (!formData.contact_email) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!user?.organization_id) {
      toast.error('Could not determine your organization. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'add') {
        await EventsService.createEvent({ 
          ...formData,
          organization_id: user.organization_id,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          max_participants: formData.max_participants || null
        });
        toast.success('Event submitted for approval');
      } else if (mode === 'edit' && event) {
        await EventsService.updateEvent(event.id, {
          ...formData,
          status: formData.status === 'draft' ? 'pending' : formData.status,
          submitted_at: formData.status === 'draft' ? new Date().toISOString() : event.submitted_at,
          max_participants: formData.max_participants || null
        });
        toast.success('Event updated successfully');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!event || !user?.user_id) return;
    
    setLoading(true);
    try {
      await EventsService.approveEvent(event.id, user.user_id);
      toast.success('Event approved successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error approving event:', error);
      toast.error('Failed to approve event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!event || !reviewNotes.trim() || !user?.user_id) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setLoading(true);
    try {
      await EventsService.rejectEvent(event.id, user.user_id, reviewNotes);
      toast.success('Event rejected');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error rejecting event:', error);
      toast.error('Failed to reject event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'max_participants' ? (value ? parseInt(value) : null) : value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    const statusConfig = {
      draft: { variant: 'default' as const, label: 'Draft' },
      pending: { variant: 'warning' as const, label: 'Pending Approval' },
      approved: { variant: 'success' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
      completed: { variant: 'secondary' as const, label: 'Completed' }
    };
    
    return <Badge variant={statusConfig[status].variant}>{statusConfig[status].label}</Badge>;
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'add': return 'Create New Event';
      case 'edit': return 'Edit Event';
      case 'view': return 'Event Details';
      case 'approve': return 'Approve Event';
      case 'reject': return 'Reject Event';
      default: return 'Event';
    }
  };

  const isReadOnly = mode === 'view';
  const isReviewMode = mode === 'approve' || mode === 'reject';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <Form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Event Status (for view/review modes) */}
            {(mode === 'view' || isReviewMode) && event && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Event Status</h3>
                  {getStatusBadge(event.status as EventStatus)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <div className="font-medium">{event.submitted_at ? formatDate(event.submitted_at) : 'Not submitted'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Updated:</span>
                    <div className="font-medium">{formatDate(event.updated_at)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <FormGroup>
              <FormField error={errors.title}>
                <FormLabel htmlFor="title" required>Event Title</FormLabel>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Enter event title"
                />
              </FormField>

              <FormField error={errors.event_type}>
                <FormLabel htmlFor="event_type" required>Event Type</FormLabel>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => handleInputChange('event_type', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="fundraising">Fundraising</SelectItem>
                    <SelectItem value="awareness">Awareness</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormGroup>

            <FormField error={errors.description}>
              <FormLabel htmlFor="description" required>Description</FormLabel>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isReadOnly}
                placeholder="Describe the event..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </FormField>

            <FormGroup>
              <FormField error={errors.start_date}>
                <FormLabel htmlFor="start_date" required>Start Date</FormLabel>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  disabled={isReadOnly}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              <FormField error={errors.end_date}>
                <FormLabel htmlFor="end_date" required>End Date</FormLabel>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  disabled={isReadOnly}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                />
              </FormField>
            </FormGroup>

            <FormField error={errors.location}>
              <FormLabel htmlFor="location" required>Location</FormLabel>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={isReadOnly}
                placeholder="Event location"
                leftIcon={<MapPin className="h-4 w-4" />}
              />
            </FormField>

            <FormGroup>
              <FormField error={errors.contact_email}>
                <FormLabel htmlFor="contact_email" required>Contact Email</FormLabel>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="contact@example.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </FormField>

              <FormField error={errors.contact_phone}>
                <FormLabel htmlFor="contact_phone">Contact Phone</FormLabel>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="+233 XX XXX XXXX"
                  leftIcon={<Phone className="h-4 w-4" />}
                />
              </FormField>
            </FormGroup>

            <FormGroup>
              <FormField error={errors.max_participants}>
                <FormLabel htmlFor="max_participants">Maximum Participants</FormLabel>
                <Input
                  id="max_participants"
                  type="number"
                  value={formData.max_participants || ''}
                  onChange={(e) => handleInputChange('max_participants', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Leave blank for unlimited"
                  leftIcon={<Users className="h-4 w-4" />}
                  min="0"
                />
              </FormField>
            </FormGroup>

            {/* Review Notes (for approve/reject modes) */}
            {isReviewMode && (
              <FormField>
                <FormLabel htmlFor="reviewNotes" required={mode === 'reject'}>
                  {mode === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason'}
                </FormLabel>
                <textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={mode === 'approve' 
                    ? 'Add any notes about the approval...' 
                    : 'Please provide a reason for rejection...'
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </FormField>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            {mode === 'add' && (
              <Button type="submit" disabled={loading}>
                {loading && <LoadingSpinner size="sm" />}
                Create Event
              </Button>
            )}
            
            {mode === 'edit' && (
              <Button type="submit" disabled={loading}>
                {loading && <LoadingSpinner size="sm" />}
                Save Changes
              </Button>
            )}
            
            {mode === 'approve' && (
              <Button type="button" onClick={handleApprove} disabled={loading}>
                {loading && <LoadingSpinner size="sm" />}
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            
            {mode === 'reject' && (
              <Button type="button" variant="destructive" onClick={handleReject} disabled={loading}>
                {loading && <LoadingSpinner size="sm" />}
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 