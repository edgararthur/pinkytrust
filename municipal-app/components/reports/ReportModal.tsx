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
import { ReportsService } from '@/lib/api/reports';
import { EventsService } from '@/lib/api/events';
import { OrganizationsService } from '@/lib/api/organizations';
import { formatDate } from '@/utils';
import { toast } from 'react-hot-toast';
import type { Database } from '@/lib/supabase/types';
import {
  FileText,
  Building2,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Check,
  X,
  Upload,
  Download,
  Trash2,
  Eye
} from 'lucide-react';

type ReportWithDetails = Database['public']['Views']['reports_with_details']['Row'];
type EventWithOrganization = Database['public']['Views']['events_with_organization']['Row'];
type OrganizationWithStats = Database['public']['Views']['organizations_with_stats']['Row'];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'add' | 'edit' | 'review' | 'approve' | 'reject';
  report?: ReportWithDetails | null;
  onSuccess?: () => void;
}

export function ReportModal({ 
  isOpen, 
  onClose, 
  mode, 
  report, 
  onSuccess 
}: ReportModalProps) {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    event_id: '',
    organization_id: '',
    report_type: 'event' as 'event' | 'monthly' | 'quarterly' | 'annual' | 'custom',
    data: {
      attendees_count: 0,
      volunteers_count: 0,
      screenings_performed: 0,
      suspected_cases: 0,
      referrals_made: 0,
      materials_distributed: 0,
      feedback: '',
      challenges: '',
      recommendations: '',
      expenses: [] as { category: string; amount: number; description: string }[],
      outcomes: [] as { metric: string; value: number; description: string }[],
    },
  });
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [reviewNotes, setReviewNotes] = React.useState('');
  const [events, setEvents] = React.useState<EventWithOrganization[]>([]);
  const [organizations, setOrganizations] = React.useState<OrganizationWithStats[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = React.useState(false);
  const [attachments, setAttachments] = React.useState<File[]>([]);

  // Load events and organizations for dropdowns
  React.useEffect(() => {
    const loadDropdownData = async () => {
      if (mode === 'add' || mode === 'edit') {
        setLoadingDropdowns(true);
        try {
          const [eventsResult, orgsResult] = await Promise.all([
            EventsService.getEvents({ status: 'completed', limit: 100 }),
            OrganizationsService.getOrganizations({ status: 'approved', limit: 100 })
          ]);
          setEvents(eventsResult.data);
          setOrganizations(orgsResult.data);
        } catch (error) {
          console.error('Error loading dropdown data:', error);
          toast.error('Failed to load form data');
        } finally {
          setLoadingDropdowns(false);
        }
      }
    };

    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen, mode]);

  // Initialize form data when report changes
  React.useEffect(() => {
    if (report && (mode === 'edit' || mode === 'view' || mode === 'review' || mode === 'approve' || mode === 'reject')) {
      setFormData({
        title: report.title || '',
        description: report.description || '',
        event_id: report.event_id || '',
        organization_id: report.organization_id || '',
        report_type: report.report_type || 'event',
        data: {
          attendees_count: report.data?.attendees_count || 0,
          volunteers_count: report.data?.volunteers_count || 0,
          screenings_performed: report.data?.screenings_performed || 0,
          suspected_cases: report.data?.suspected_cases || 0,
          referrals_made: report.data?.referrals_made || 0,
          materials_distributed: report.data?.materials_distributed || 0,
          feedback: report.data?.feedback || '',
          challenges: report.data?.challenges || '',
          recommendations: report.data?.recommendations || '',
          expenses: report.data?.expenses || [],
          outcomes: report.data?.outcomes || [],
        },
      });
    } else if (mode === 'add') {
      setFormData({
        title: '',
        description: '',
        event_id: '',
        organization_id: '',
        report_type: 'event',
        data: {
          attendees_count: 0,
          volunteers_count: 0,
          screenings_performed: 0,
          suspected_cases: 0,
          referrals_made: 0,
          materials_distributed: 0,
          feedback: '',
          challenges: '',
          recommendations: '',
          expenses: [],
          outcomes: [],
        },
      });
    }
    setErrors({});
    setReviewNotes('');
    setAttachments([]);
  }, [report, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    const titleError = validateRequired(formData.title, 'Report title');
    if (titleError) newErrors.title = titleError;

    const orgError = validateRequired(formData.organization_id, 'Organization');
    if (orgError) newErrors.organization_id = orgError;

    // Validate numeric fields
    if (formData.data.attendees_count < 0) {
      newErrors.attendees_count = 'Attendees count cannot be negative';
    }
    if (formData.data.volunteers_count < 0) {
      newErrors.volunteers_count = 'Volunteers count cannot be negative';
    }
    if (formData.data.suspected_cases < 0) {
      newErrors.suspected_cases = 'Suspected cases cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const reportData = {
        ...formData,
        status: 'submitted' as const,
      };

      if (mode === 'add') {
        await ReportsService.createReport(reportData);
        toast.success('Report submitted successfully');
      } else if (mode === 'edit' && report) {
        await ReportsService.updateReport(report.id, reportData);
        toast.success('Report updated successfully');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!report) return;
    
    setLoading(true);
    try {
      // TODO: Get current user ID from auth context
      await ReportsService.approveReport(report.id, 'current-user-id', reviewNotes);
      toast.success('Report approved successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error approving report:', error);
      toast.error('Failed to approve report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!report || !reviewNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setLoading(true);
    try {
      // TODO: Get current user ID from auth context
      await ReportsService.rejectReport(report.id, 'current-user-id', reviewNotes);
      toast.success('Report rejected');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast.error('Failed to reject report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('data.')) {
      const dataField = field.replace('data.', '');
      setFormData(prev => ({
        ...prev,
        data: { ...prev.data, [dataField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddExpense = () => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        expenses: [...prev.data.expenses, { category: '', amount: 0, description: '' }]
      }
    }));
  };

  const handleRemoveExpense = (index: number) => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        expenses: prev.data.expenses.filter((_, i) => i !== index)
      }
    }));
  };

  const handleExpenseChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        expenses: prev.data.expenses.map((expense, i) => 
          i === index ? { ...expense, [field]: value } : expense
        )
      }
    }));
  };

  const handleAddOutcome = () => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        outcomes: [...prev.data.outcomes, { metric: '', value: 0, description: '' }]
      }
    }));
  };

  const handleRemoveOutcome = (index: number) => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        outcomes: prev.data.outcomes.filter((_, i) => i !== index)
      }
    }));
  };

  const handleOutcomeChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        outcomes: prev.data.outcomes.map((outcome, i) => 
          i === index ? { ...outcome, [field]: value } : outcome
        )
      }
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const },
      submitted: { label: 'Submitted', variant: 'warning' as const },
      under_review: { label: 'Under Review', variant: 'warning' as const },
      approved: { label: 'Approved', variant: 'success' as const },
      rejected: { label: 'Rejected', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      event: 'Event Report',
      monthly: 'Monthly Report',
      quarterly: 'Quarterly Report',
      annual: 'Annual Report',
      custom: 'Custom Report',
    };
    return typeLabels[type as keyof typeof typeLabels] || 'Event Report';
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'add': return 'Create New Report';
      case 'edit': return 'Edit Report';
      case 'view': return 'Report Details';
      case 'review': return 'Review Report';
      case 'approve': return 'Approve Report';
      case 'reject': return 'Reject Report';
      default: return 'Report';
    }
  };

  const isReadOnly = mode === 'view';
  const isReviewMode = mode === 'review' || mode === 'approve' || mode === 'reject';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="xl">
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <Form onSubmit={handleSubmit}>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Report Status (for view/review modes) */}
            {(mode === 'view' || isReviewMode) && report && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Report Status</h3>
                  {getStatusBadge(report.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <div className="font-medium">{formatDate(report.created_at)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <div className="font-medium">{getTypeLabel(report.report_type)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <FormGroup>
              <FormField error={errors.title}>
                <FormLabel htmlFor="title" required>Report Title</FormLabel>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Enter report title"
                />
              </FormField>

              <FormField error={errors.report_type}>
                <FormLabel htmlFor="report_type" required>Report Type</FormLabel>
                {isReadOnly ? (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {getTypeLabel(formData.report_type)}
                  </div>
                ) : (
                  <Select 
                    value={formData.report_type} 
                    onValueChange={(value) => handleInputChange('report_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Event Report</SelectItem>
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                      <SelectItem value="quarterly">Quarterly Report</SelectItem>
                      <SelectItem value="annual">Annual Report</SelectItem>
                      <SelectItem value="custom">Custom Report</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            </FormGroup>

            {/* Organization and Event */}
            <FormGroup>
              <FormField error={errors.organization_id}>
                <FormLabel htmlFor="organization_id" required>Organization</FormLabel>
                {isReadOnly && report ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span>{report.organization_name}</span>
                  </div>
                ) : (
                  <Select 
                    value={formData.organization_id} 
                    onValueChange={(value) => handleInputChange('organization_id', value)}
                    disabled={loadingDropdowns}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <FormField>
                <FormLabel htmlFor="event_id">Related Event (Optional)</FormLabel>
                {isReadOnly && report?.event_title ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{report.event_title}</span>
                  </div>
                ) : (
                  <Select 
                    value={formData.event_id} 
                    onValueChange={(value) => handleInputChange('event_id', value)}
                    disabled={loadingDropdowns}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No event selected</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            </FormGroup>

            {/* Description */}
            <FormField>
              <FormLabel htmlFor="description">Description</FormLabel>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isReadOnly}
                placeholder="Provide a detailed description of the report..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </FormField>

            {/* Statistics */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Statistics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField error={errors.attendees_count}>
                  <FormLabel htmlFor="attendees_count">Attendees</FormLabel>
                  <Input
                    id="attendees_count"
                    type="number"
                    value={formData.data.attendees_count}
                    onChange={(e) => handleInputChange('data.attendees_count', parseInt(e.target.value) || 0)}
                    disabled={isReadOnly}
                    min="0"
                    leftIcon={<Users className="h-4 w-4" />}
                  />
                </FormField>

                <FormField error={errors.volunteers_count}>
                  <FormLabel htmlFor="volunteers_count">Volunteers</FormLabel>
                  <Input
                    id="volunteers_count"
                    type="number"
                    value={formData.data.volunteers_count}
                    onChange={(e) => handleInputChange('data.volunteers_count', parseInt(e.target.value) || 0)}
                    disabled={isReadOnly}
                    min="0"
                    leftIcon={<Users className="h-4 w-4" />}
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="screenings_performed">Screenings</FormLabel>
                  <Input
                    id="screenings_performed"
                    type="number"
                    value={formData.data.screenings_performed}
                    onChange={(e) => handleInputChange('data.screenings_performed', parseInt(e.target.value) || 0)}
                    disabled={isReadOnly}
                    min="0"
                    leftIcon={<TrendingUp className="h-4 w-4" />}
                  />
                </FormField>

                <FormField error={errors.suspected_cases}>
                  <FormLabel htmlFor="suspected_cases">Suspected Cases</FormLabel>
                  <Input
                    id="suspected_cases"
                    type="number"
                    value={formData.data.suspected_cases}
                    onChange={(e) => handleInputChange('data.suspected_cases', parseInt(e.target.value) || 0)}
                    disabled={isReadOnly}
                    min="0"
                    leftIcon={<AlertTriangle className="h-4 w-4" />}
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="referrals_made">Referrals Made</FormLabel>
                  <Input
                    id="referrals_made"
                    type="number"
                    value={formData.data.referrals_made}
                    onChange={(e) => handleInputChange('data.referrals_made', parseInt(e.target.value) || 0)}
                    disabled={isReadOnly}
                    min="0"
                    leftIcon={<TrendingUp className="h-4 w-4" />}
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="materials_distributed">Materials Distributed</FormLabel>
                  <Input
                    id="materials_distributed"
                    type="number"
                    value={formData.data.materials_distributed}
                    onChange={(e) => handleInputChange('data.materials_distributed', parseInt(e.target.value) || 0)}
                    disabled={isReadOnly}
                    min="0"
                    leftIcon={<FileText className="h-4 w-4" />}
                  />
                </FormField>
              </div>
            </div>

            {/* Feedback and Recommendations */}
            <div className="space-y-4">
              <FormField>
                <FormLabel htmlFor="feedback">Feedback</FormLabel>
                <textarea
                  id="feedback"
                  value={formData.data.feedback}
                  onChange={(e) => handleInputChange('data.feedback', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Overall feedback and observations..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="challenges">Challenges</FormLabel>
                <textarea
                  id="challenges"
                  value={formData.data.challenges}
                  onChange={(e) => handleInputChange('data.challenges', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Challenges encountered during the event/period..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="recommendations">Recommendations</FormLabel>
                <textarea
                  id="recommendations"
                  value={formData.data.recommendations}
                  onChange={(e) => handleInputChange('data.recommendations', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Recommendations for future improvements..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </FormField>
            </div>

            {/* Review Notes (for review modes) */}
            {isReviewMode && (
              <FormField>
                <FormLabel htmlFor="reviewNotes" required={mode === 'reject'}>
                  {mode === 'approve' ? 'Approval Notes (Optional)' : 'Review Notes'}
                </FormLabel>
                <textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={mode === 'approve' 
                    ? 'Add any notes about the approval...' 
                    : mode === 'reject' 
                      ? 'Please provide a reason for rejection...'
                      : 'Add review notes...'
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
                Submit Report
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