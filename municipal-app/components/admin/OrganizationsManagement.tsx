'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { OrganizationModal } from '@/components/organizations/OrganizationModal';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  AlertCircle,
  Globe,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Pause,
  BarChart2
} from 'lucide-react';
import { OrganizationsService, OrganizationWithStats, OrganizationFilters } from '@/lib/api/organizations';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'react-hot-toast';
import { formatDate, formatRelativeTime } from '@/utils';

interface OrganizationsManagementProps {
  municipalityId?: string;
}

export function OrganizationsManagement({ municipalityId }: OrganizationsManagementProps) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithStats | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'add' | 'edit' | 'approve' | 'reject'>('view');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, [currentPage, searchTerm, statusFilter, municipalityId]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const filters: OrganizationFilters = {
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        registration_status: statusFilter !== 'all' ? statusFilter as any : undefined,
        municipalityId: municipalityId || user?.municipality_id,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      const response = await OrganizationsService.getOrganizations(filters);
      setOrganizations(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedOrg(null);
    setModalMode('view');
  };

  const handleModalSuccess = () => {
    loadOrganizations();
    handleModalClose();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'default' as const, icon: Clock, label: 'Pending' },
      approved: { variant: 'success' as const, icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' },
      suspended: { variant: 'destructive' as const, icon: Pause, label: 'Suspended' }
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

  const OrganizationCard = ({ org }: { org: OrganizationWithStats }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{org.name}</h3>
              <p className="text-sm text-gray-500">{org.contact_email}</p>
              {org.registration_number && (
                <p className="text-xs text-gray-400">Reg #: {org.registration_number}</p>
              )}
            </div>
          </div>
          {getStatusBadge(org.registration_status)}
        </div>

        <div className="space-y-2 mb-4">
          {org.contact_phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              {org.contact_phone}
            </div>
          )}
          {org.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Website
              </a>
            </div>
          )}
          {org.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {org.address}
            </div>
          )}
        </div>

        {org.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{org.description}</p>
        )}

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{org.events_count}</div>
            <div className="text-xs text-gray-500">Events</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{org.certificates_count}</div>
            <div className="text-xs text-gray-500">Certificates</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{org.reports_count}</div>
            <div className="text-xs text-gray-500">Reports</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Submitted {formatRelativeTime(org.submitted_at)}
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Created {formatDate(org.created_at)}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedOrg(org);
              setModalMode('view');
              setShowModal(true);
            }}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          
          {org.registration_status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedOrg(org);
                  setModalMode('approve');
                  setShowModal(true);
                }}
                className="text-green-600 hover:text-green-700"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedOrg(org);
                  setModalMode('reject');
                  setShowModal(true);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedOrg(org);
              setModalMode('edit');
              setShowModal(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
          <p className="text-gray-600">Manage organization registrations and approvals</p>
        </div>
        <Button onClick={() => {
          setSelectedOrg(null);
          setModalMode('add');
          setShowModal(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search organizations..."
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
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadOrganizations}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Grid */}
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
          {organizations.map((org) => (
            <OrganizationCard key={org.id} org={org} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && organizations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding your first organization.'}
            </p>
            <Button onClick={() => {
              setSelectedOrg(null);
              setModalMode('add');
              setShowModal(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </Button>
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

      {/* Organization Modal */}
      <OrganizationModal
        isOpen={showModal}
        onClose={handleModalClose}
        mode={modalMode}
        organization={selectedOrg}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
