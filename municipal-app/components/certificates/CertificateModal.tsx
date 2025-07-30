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
import { CertificatesService } from '@/lib/api/certificates';
import { formatDate } from '@/utils';
import { toast } from 'react-hot-toast';
import type { Certificate } from '@/lib/api/certificates';
import { useAuth } from '@/lib/auth/context';
import {
  FileText,
  Calendar,
  Upload,
  Download,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'add' | 'edit' | 'revoke';
  certificate?: Certificate | null;
  onSuccess?: () => void;
}

export function CertificateModal({ 
  isOpen, 
  onClose, 
  mode, 
  certificate, 
  onSuccess 
}: CertificateModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    certificate_type: 'general' as const,
    issue_date: '',
    expiry_date: '',
    document_url: '',
    status: 'pending' as const
  });
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [revocationReason, setRevocationReason] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  // Initialize form data when certificate changes
  React.useEffect(() => {
    if (certificate && (mode === 'edit' || mode === 'view' || mode === 'revoke')) {
      setFormData({
        title: certificate.title || '',
        description: certificate.description || '',
        certificate_type: certificate.certificate_type || 'general',
        issue_date: certificate.issue_date ? new Date(certificate.issue_date).toISOString().split('T')[0] : '',
        expiry_date: certificate.expiry_date ? new Date(certificate.expiry_date).toISOString().split('T')[0] : '',
        document_url: certificate.document_url || '',
        status: certificate.status || 'pending'
      });
    } else if (mode === 'add') {
      setFormData({
        title: '',
        description: '',
        certificate_type: 'general',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        document_url: '',
        status: 'pending'
      });
    }
    setErrors({});
    setRevocationReason('');
    setSelectedFile(null);
  }, [certificate, mode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    const titleError = validateRequired(formData.title, 'Certificate title');
    if (titleError) newErrors.title = titleError;

    const issueDateError = validateRequired(formData.issue_date, 'Issue date');
    if (issueDateError) newErrors.issue_date = issueDateError;

    // Date validation
    if (formData.issue_date && formData.expiry_date) {
      const issueDate = new Date(formData.issue_date);
      const expiryDate = new Date(formData.expiry_date);
      if (expiryDate <= issueDate) {
        newErrors.expiry_date = 'Expiry date must be after issue date';
      }
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
      let documentUrl = formData.document_url;

      // Upload document if selected
      if (selectedFile) {
        documentUrl = await CertificatesService.uploadDocument(selectedFile, user.organization_id);
      }

      if (mode === 'add') {
        await CertificatesService.createCertificate({ 
          ...formData,
          organization_id: user.organization_id,
          issued_by: user.user_id,
          document_url: documentUrl
        });
        toast.success('Certificate created successfully');
      } else if (mode === 'edit' && certificate) {
        // Delete old document if replaced
        if (selectedFile && certificate.document_url) {
          await CertificatesService.deleteDocument(certificate.document_url);
        }

        await CertificatesService.updateCertificate(certificate.id, {
          ...formData,
          document_url: documentUrl
        });
        toast.success('Certificate updated successfully');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast.error('Failed to save certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!certificate || !revocationReason.trim() || !user?.user_id) {
      toast.error('Please provide a reason for revocation');
      return;
    }
    
    setLoading(true);
    try {
      await CertificatesService.revokeCertificate(certificate.id, user.user_id, revocationReason);
      toast.success('Certificate revoked');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error revoking certificate:', error);
      toast.error('Failed to revoke certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'default' as const, icon: Clock, label: 'Pending' },
      active: { variant: 'success' as const, icon: CheckCircle, label: 'Active' },
      expired: { variant: 'warning' as const, icon: AlertTriangle, label: 'Expired' },
      revoked: { variant: 'destructive' as const, icon: XCircle, label: 'Revoked' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'add': return 'Issue New Certificate';
      case 'edit': return 'Edit Certificate';
      case 'view': return 'Certificate Details';
      case 'revoke': return 'Revoke Certificate';
      default: return 'Certificate';
    }
  };

  const isReadOnly = mode === 'view';
  const isRevokeMode = mode === 'revoke';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <Form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Certificate Status (for view/revoke modes) */}
            {(mode === 'view' || isRevokeMode) && certificate && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Certificate Status</h3>
                  {getStatusBadge(certificate.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Issued:</span>
                    <div className="font-medium">{formatDate(certificate.issue_date)}</div>
                  </div>
                  {certificate.expiry_date && (
                    <div>
                      <span className="text-gray-500">Expires:</span>
                      <div className="font-medium">{formatDate(certificate.expiry_date)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <FormGroup>
              <FormField error={errors.title}>
                <FormLabel htmlFor="title" required>Certificate Title</FormLabel>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  disabled={isReadOnly || isRevokeMode}
                  placeholder="Enter certificate title"
                />
              </FormField>

              <FormField error={errors.certificate_type}>
                <FormLabel htmlFor="certificate_type" required>Certificate Type</FormLabel>
                <Select
                  value={formData.certificate_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, certificate_type: value as any }))}
                  disabled={isReadOnly || isRevokeMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormGroup>

            <FormField error={errors.description}>
              <FormLabel htmlFor="description">Description</FormLabel>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={isReadOnly || isRevokeMode}
                placeholder="Describe the certificate..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </FormField>

            <FormGroup>
              <FormField error={errors.issue_date}>
                <FormLabel htmlFor="issue_date" required>Issue Date</FormLabel>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                  disabled={isReadOnly || isRevokeMode}
                  max={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              <FormField error={errors.expiry_date}>
                <FormLabel htmlFor="expiry_date">Expiry Date</FormLabel>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                  disabled={isReadOnly || isRevokeMode}
                  min={formData.issue_date}
                />
              </FormField>
            </FormGroup>

            {/* Document Upload */}
            {!isReadOnly && !isRevokeMode && (
              <FormField>
                <FormLabel htmlFor="document">Certificate Document</FormLabel>
                <div className="mt-1 flex items-center">
                  <Input
                    id="document"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                  />
                  <label
                    htmlFor="document"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedFile ? selectedFile.name : 'Upload Document'}
                  </label>
                  {formData.document_url && !selectedFile && (
                    <a
                      href={formData.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 text-sm text-blue-600 hover:text-blue-500"
                    >
                      <Download className="h-4 w-4 inline mr-1" />
                      View Current Document
                    </a>
                  )}
                </div>
              </FormField>
            )}

            {/* Revocation Reason */}
            {isRevokeMode && (
              <FormField>
                <FormLabel htmlFor="revocationReason" required>Reason for Revocation</FormLabel>
                <textarea
                  id="revocationReason"
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  placeholder="Please provide a reason for revoking this certificate..."
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
                Issue Certificate
              </Button>
            )}
            
            {mode === 'edit' && (
              <Button type="submit" disabled={loading}>
                {loading && <LoadingSpinner size="sm" />}
                Save Changes
              </Button>
            )}
            
            {mode === 'revoke' && (
              <Button type="button" variant="destructive" onClick={handleRevoke} disabled={loading}>
                {loading && <LoadingSpinner size="sm" />}
                <X className="h-4 w-4 mr-2" />
                Revoke Certificate
              </Button>
            )}
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 