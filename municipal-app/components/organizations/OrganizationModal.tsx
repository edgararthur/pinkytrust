'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Form, FormField, FormLabel, FormError, FormGroup, validateEmail, validateRequired, validateUrl, validatePhone } from '@/components/ui/Form';
import { OrganizationsService } from '@/lib/api/organizations';
import { formatDate, formatRelativeTime } from '@/utils';
import { toast } from 'react-hot-toast';
import type { Database } from '@/lib/supabase/types';
import { useAuth } from '@/lib/auth/context';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Calendar,
  User,
  Check,
  X,
  Eye,
  Edit,
  Save,
  AlertTriangle,
  ExternalLink,
  Download
} from 'lucide-react';

type OrganizationWithStats = Database['public']['Views']['organizations_with_stats']['Row'];

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'add' | 'edit' | 'approve' | 'reject';
  organization?: OrganizationWithStats | null;
  onSuccess?: () => void;
}

export function OrganizationModal({ 
  isOpen, 
  onClose, 
  mode, 
  organization, 
  onSuccess 
}: OrganizationModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = React.useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    address: '',
    description: '',
    registration_status: 'pending' as 'pending' | 'approved' | 'rejected' | 'suspended'
  });
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [reviewNotes, setReviewNotes] = React.useState('');

  // Initialize form data when organization changes
  React.useEffect(() => {
    if (organization && (mode === 'edit' || mode === 'view' || mode === 'approve' || mode === 'reject')) {
      setFormData({
        name: organization.name || '',
        contact_email: organization.contact_email || '',
        contact_phone: organization.contact_phone || '',
        website: organization.website || '',
        address: organization.address || '',
        description: organization.description || '',
        registration_status: organization.registration_status || 'pending'
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        address: '',
        description: '',
        registration_status: 'pending'
      });
    }
    setErrors({});
    setReviewNotes('');
  }, [organization, mode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    const nameError = validateRequired(formData.name, 'Organization name');
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.contact_email);
    if (emailError) newErrors.contact_email = emailError;

    const descriptionError = validateRequired(formData.description, 'Description');
    if (descriptionError) newErrors.description = descriptionError;

    // Optional fields validation
    if (formData.contact_phone) {
      const phoneError = validatePhone(formData.contact_phone);
      if (phoneError) newErrors.contact_phone = phoneError;
    }

    if (formData.website) {
      const urlError = validateUrl(formData.website);
      if (urlError) newErrors.website = urlError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!user?.municipality_id) {
      toast.error('Could not determine your municipality. Please contact your administrator.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'add') {
        await OrganizationsService.createOrganization({ 
          ...formData, 
          municipality_id: user.municipality_id 
        });
        toast.success('Organization created successfully');
      } else if (mode === 'edit' && organization) {
        await OrganizationsService.updateOrganization(organization.id, formData);
        toast.success('Organization updated successfully');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving organization:', error);
      toast.error('Failed to save organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!organization || !user) return;
    
    setLoading(true);
    try {
      await OrganizationsService.approveOrganization(organization.id, user.user_id);
      toast.success('Organization approved successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error approving organization:', error);
      toast.error('Failed to approve organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!organization || !reviewNotes.trim() || !user) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setLoading(true);
    try {
      await OrganizationsService.rejectOrganization(organization.id, user.user_id, reviewNotes);
      toast.success('Organization rejected');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error rejecting organization:', error);
      toast.error('Failed to reject organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!organization) return;

    if (!window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await OrganizationsService.deleteOrganization(organization.id);
      toast.success('Organization deleted successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Failed to delete organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'warning' as const },
      approved: { label: 'Approved', variant: 'success' as const },
      rejected: { label: 'Rejected', variant: 'destructive' as const },
      suspended: { label: 'Suspended', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'add': return 'Add New Organization';
      case 'edit': return 'Edit Organization';
      case 'view': return 'Organization Details';
      case 'approve': return 'Approve Organization';
      case 'reject': return 'Reject Organization';
      default: return 'Organization';
    }
  };

  const isReadOnly = mode === 'view';
  const isReviewMode = mode === 'approve' || mode === 'reject';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <Form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Organization Status (for view/review modes) */}
            {(mode === 'view' || isReviewMode) && organization && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Registration Status</h3>
                  {getStatusBadge(organization.registration_status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <div className="font-medium">{formatDate(organization.submitted_at)}</div>
                  </div>
                  {organization.registration_number && (
                    <div>
                      <span className="text-gray-500">Registration #:</span>
                      <div className="font-medium">{organization.registration_number}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <FormGroup>
              <FormField error={errors.name}>
                <FormLabel htmlFor="name" required>Organization Name</FormLabel>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Enter organization name"
                />
              </FormField>

              <FormField error={errors.contact_email}>
                <FormLabel htmlFor="contact_email" required>Contact Email</FormLabel>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="contact@organization.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </FormField>
            </FormGroup>

            <FormGroup>
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

              <FormField error={errors.website}>
                <FormLabel htmlFor="website">Website</FormLabel>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="https://organization.com"
                  leftIcon={<Globe className="h-4 w-4" />}
                />
              </FormField>
            </FormGroup>

            <FormField error={errors.address}>
              <FormLabel htmlFor="address">Address</FormLabel>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={isReadOnly}
                placeholder="Street address, city, state"
                leftIcon={<MapPin className="h-4 w-4" />}
              />
            </FormField>

            <FormField error={errors.description}>
              <FormLabel htmlFor="description" required>Description</FormLabel>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isReadOnly}
                placeholder="Describe the organization's mission and activities..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </FormField>

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

            {/* Organization Stats (for view mode) */}
            {mode === 'view' && organization && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Organization Statistics</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Events:</span>
                    <div className="font-medium">{organization.events_count || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Certificates:</span>
                    <div className="font-medium">{organization.certificates_count || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Reports:</span>
                    <div className="font-medium">{organization.reports_count || 0}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {(mode === 'edit' || mode === 'view') && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading && <LoadingSpinner size="sm" />}
                Delete
              </Button>
            )}

            {mode === 'add' && (
              <Button type="submit" disabled={loading}>
                {loading && <LoadingSpinner size="sm" />}
                Create Organization
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