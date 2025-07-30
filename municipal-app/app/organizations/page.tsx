'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { OrganizationsService, type OrganizationFilters as Filters } from '@/lib/api/organizations';
import { OrganizationModal } from '@/components/organizations/OrganizationModal';
import { OrganizationFiltersDialog } from '@/components/organizations/OrganizationFilters';
import { usePaginatedApi } from '@/lib/hooks/useOptimizedApi';
import type { Database } from '@/lib/supabase/types';
import { formatDate, formatRelativeTime } from '@/utils';
import { toast } from 'react-hot-toast';
import { 
  Building2, 
  Plus, 
  Eye, 
  Check, 
  X, 
  MoreHorizontal,
  Filter,
  Download,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  RefreshCw,
  Trash
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

type OrganizationWithStats = Database['public']['Views']['organizations_with_stats']['Row'];

interface TableColumn<T> {
  key: string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

const downloadCSV = (data: any[], filename: string) => {
  // Convert data to CSV format
  const headers = ['Name', 'Contact Email', 'Contact Phone', 'Website', 'Address', 'Registration Status', 'Certificate Status', 'Submitted Date', 'Events', 'Certificates', 'Reports'];
  const csvRows = [
    headers,
    ...data.map(org => [
      org.name,
      org.contact_email,
      org.contact_phone || '',
      org.website || '',
      org.address || '',
      org.registration_status,
      org.certificate_status || '',
      new Date(org.submitted_at).toLocaleDateString(),
      org.events_count,
      org.certificates_count,
      org.reports_count
    ])
  ];

  const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getStatusBadge = (status: 'pending' | 'approved' | 'rejected' | 'suspended') => {
  const statusConfig = {
    pending: { label: 'Pending', variant: 'warning' as const },
    approved: { label: 'Approved', variant: 'success' as const },
    rejected: { label: 'Rejected', variant: 'destructive' as const },
    suspended: { label: 'Suspended', variant: 'destructive' as const },
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function OrganizationsPage() {
  const { user } = useAuth();
  const [selectedOrgs, setSelectedOrgs] = React.useState<string[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    mode: 'view' | 'add' | 'edit' | 'approve' | 'reject';
    organization: OrganizationWithStats | null;
  }>({
    isOpen: false,
    mode: 'view',
    organization: null,
  });
  const [exporting, setExporting] = React.useState(false);

  // Use optimized API hook with municipality filter
  const {
    data: organizations,
    total,
    filters,
    isLoading,
    error,
    refetch,
    invalidateCache,
    updateFilters,
    resetFilters
  } = usePaginatedApi(
    (page, limit, filters) =>
      OrganizationsService.getOrganizations({
        ...filters,
        municipalityId: user?.municipality_id
      }, page, limit).then(res => ({
        data: res.data,
        total: res.pagination.total
      })),
    'organizations',
    {
      sortBy: 'created_at',
      sortOrder: 'desc' as const,
    },
    {
      cacheTTL: 60000, // 1 minute cache
      onSuccess: (data) => {
        console.log(`Loaded ${data.data.length} organizations`);
      },
      onError: (error) => {
        toast.error('Failed to load organizations');
      }
    }
  );

  // Ensure user has municipality assigned
  React.useEffect(() => {
    if (!user?.municipality_id) {
      toast.error('No municipality assigned to your account. Please contact your administrator.');
    }
  }, [user?.municipality_id]);

  // Modal handlers
  const openModal = (mode: 'view' | 'add' | 'edit' | 'approve' | 'reject', organization: OrganizationWithStats | null = null) => {
    setModalState({ isOpen: true, mode, organization });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'view', organization: null });
  };

  const handleModalSuccess = () => {
    invalidateCache(); // Clear cache to force refresh
    refetch(); // Refetch data
    closeModal();
    toast.success('Organization updated successfully');
  };

  const handleRefresh = () => {
    invalidateCache();
    refetch();
  };

  const handleApprove = async (org: OrganizationWithStats) => {
    openModal('approve', org);
  };

  const handleReject = async (org: OrganizationWithStats) => {
    openModal('reject', org);
  };

  const handleBulkApprove = async () => {
    if (!selectedOrgs.length) return;

    try {
      await Promise.all(
        selectedOrgs.map(id => OrganizationsService.approveOrganization(id, user?.user_id || ''))
      );
      toast.success(`Approved ${selectedOrgs.length} organizations`);
      setSelectedOrgs([]);
      invalidateCache();
      refetch();
    } catch (error) {
      console.error('Error approving organizations:', error);
      toast.error('Failed to approve organizations');
    }
  };

  const handleBulkReject = async () => {
    if (!selectedOrgs.length) return;

    try {
      await Promise.all(
        selectedOrgs.map(id => OrganizationsService.rejectOrganization(id, user?.user_id || '', 'Bulk rejection'))
      );
      toast.success(`Rejected ${selectedOrgs.length} organizations`);
      setSelectedOrgs([]);
      invalidateCache();
      refetch();
    } catch (error) {
      console.error('Error rejecting organizations:', error);
      toast.error('Failed to reject organizations');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedOrgs.length) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedOrgs.length} organizations? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(
        selectedOrgs.map(id => OrganizationsService.deleteOrganization(id))
      );
      toast.success(`Deleted ${selectedOrgs.length} organizations`);
      setSelectedOrgs([]);
      invalidateCache();
      refetch();
    } catch (error) {
      console.error('Error deleting organizations:', error);
      toast.error('Failed to delete organizations');
    }
  };

  const handleBulkExport = async () => {
    if (!selectedOrgs.length) return;

    try {
      setExporting(true);
      const allData = await OrganizationsService.exportOrganizations(filters);
      const selectedData = allData.filter(org => selectedOrgs.includes(org.id));
      downloadCSV(selectedData, `selected-organizations-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting selected organizations:', error);
      toast.error('Failed to export selected organizations');
    } finally {
      setExporting(false);
    }
  };

  const handleSearch = React.useCallback((query: string) => {
    updateFilters({ search: query, page: 1 });
  }, [updateFilters]);

  const handleSort = React.useCallback((column: string) => {
    updateFilters({
      sortBy: column,
      sortOrder: filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  }, [filters.sortBy, filters.sortOrder, updateFilters]);

  const handlePageChange = React.useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const handleLimitChange = React.useCallback((limit: number) => {
    updateFilters({ limit, page: 1 });
  }, [updateFilters]);

  const handleFilterChange = React.useCallback((newFilters: Partial<Filters>) => {
    updateFilters({ ...newFilters, page: 1 });
  }, [updateFilters]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await OrganizationsService.exportOrganizations(filters);
      downloadCSV(data, `organizations-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting organizations:', error);
      toast.error('Failed to export organizations');
    } finally {
      setExporting(false);
    }
  };

  const columns: TableColumn<OrganizationWithStats>[] = [
    {
      key: 'name',
      label: 'Organization',
      sortable: true,
      render: (_, org) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
            <Building2 className="h-5 w-5 text-pink-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{org.name}</div>
            <div className="text-sm text-gray-500">{org.contact_email}</div>
            {org.registration_number && (
              <div className="text-xs text-gray-400">
                Reg #: {org.registration_number}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'registration_status',
      label: 'Status',
      render: (_, org) => {
        const statusConfig = {
          pending: { label: 'Pending', variant: 'warning' as const },
          approved: { label: 'Approved', variant: 'success' as const },
          rejected: { label: 'Rejected', variant: 'destructive' as const },
          suspended: { label: 'Suspended', variant: 'destructive' as const },
        };
        
        const config = statusConfig[org.registration_status] || statusConfig.pending;
        return (
          <div className="space-y-1">
            <Badge variant={config.variant}>{config.label}</Badge>
            <div className="text-xs text-gray-500">
              {org.submitted_at ? formatDate(org.submitted_at) : ''}
            </div>
          </div>
        );
      },
    },
    {
      key: 'contact_info',
      label: 'Contact Info',
      render: (_, org) => (
        <div className="space-y-1">
          {org.contact_phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-3 w-3" />
              {org.contact_phone}
            </div>
          )}
          {org.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-3 w-3" />
              <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Website
              </a>
            </div>
          )}
          {org.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-3 w-3" />
              {org.address}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'stats',
      label: 'Activity',
      render: (_, org) => (
        <div className="space-y-1">
          <div className="text-sm text-gray-600">
            {org.events_count} Events
          </div>
          <div className="text-sm text-gray-600">
            {org.certificates_count} Certificates
          </div>
          <div className="text-sm text-gray-600">
            {org.reports_count} Reports
          </div>
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (org: OrganizationWithStats) => openModal('view', org),
      icon: <Eye className="h-4 w-4" />,
      variant: 'ghost' as const,
    },
    {
      label: 'Edit',
      onClick: (org: OrganizationWithStats) => openModal('edit', org),
      icon: <Edit className="h-4 w-4" />,
      variant: 'ghost' as const,
    },
    {
      label: 'Approve',
      onClick: handleApprove,
      icon: <Check className="h-4 w-4" />,
      variant: 'ghost' as const,
      show: (org: OrganizationWithStats) => org.registration_status === 'pending',
    },
    {
      label: 'Reject',
      onClick: handleReject,
      icon: <X className="h-4 w-4" />,
      variant: 'ghost' as const,
      show: (org: OrganizationWithStats) => org.registration_status === 'pending',
    },
  ];

  const stats = [
    {
      label: 'Total Organizations',
      value: total,
      color: 'blue',
    },
    {
      label: 'Pending Approval',
      value: organizations.filter(org => org.registration_status === 'pending').length,
      color: 'yellow',
    },
    {
      label: 'Approved',
      value: organizations.filter(org => org.registration_status === 'approved').length,
      color: 'green',
    },
    {
      label: 'Rejected',
      value: organizations.filter(org => org.registration_status === 'rejected').length,
      color: 'red',
    },
  ];

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-2">Error Loading Organizations</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
            <p className="mt-2 text-gray-600">
              Manage organization registrations and approvals
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedOrgs.length > 0 && (
              <>
                <Button
                  variant="outline"
                  leftIcon={<Check className="h-4 w-4" />}
                  onClick={handleBulkApprove}
                >
                  Approve Selected
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<X className="h-4 w-4" />}
                  onClick={handleBulkReject}
                >
                  Reject Selected
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={handleBulkExport}
                  disabled={exporting}
                >
                  Export Selected
                </Button>
                <Button
                  variant="destructive"
                  leftIcon={<Trash className="h-4 w-4" />}
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </>
            )}
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button 
              variant="outline" 
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export All'}
            </Button>
            <Button 
              variant="outline" 
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={() => setShowFilters(true)}
            >
              Filter
            </Button>
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => openModal('add')}
            >
              Add Organization
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Organizations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={organizations}
              columns={columns}
              loading={isLoading}
              pagination={{
                page: filters.page || 1,
                limit: filters.limit || 10,
                total: total,
                onPageChange: handlePageChange,
                onLimitChange: handleLimitChange,
              }}
              sorting={{
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                onSort: handleSort,
              }}
              selection={{
                selectedRows: selectedOrgs,
                onSelectionChange: setSelectedOrgs,
              }}
              actions={actions}
              onSearch={handleSearch}
            />
          </CardContent>
        </Card>

        {/* Organization Modal */}
        <OrganizationModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          mode={modalState.mode}
          organization={modalState.organization}
          onSuccess={handleModalSuccess}
        />

        {/* Filters Dialog */}
        <OrganizationFiltersDialog
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onApply={handleFilterChange}
        />
      </div>
    </DashboardLayout>
  );
}
