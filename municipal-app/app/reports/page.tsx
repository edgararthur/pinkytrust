'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { formatDate, formatRelativeTime } from '@/utils';
import {
  FileText,
  Plus,
  Eye,
  Check,
  X,
  Building2,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import type { Report, ReportFilters, TableColumn } from '@/types';
import { ReportsService } from '@/lib/api';
import { useAuthStore } from '@/store';

export default function ReportsPage() {
  const [filters, setFilters] = React.useState<ReportFilters>({
    page: 1,
    limit: 10,
    sortBy: 'submittedAt',
    sortOrder: 'desc',
  });
  const [selectedReports, setSelectedReports] = React.useState<string[]>([]);

  const [reportsData, setReportsData] = React.useState<{
    data: Report[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({ 
    data: [], 
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } 
  });
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Fetch reports data
  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const result = await ReportsService.getReports(filters);
        setReportsData(result);
      } catch (error) {
        console.error('Error fetching reports:', error);
        alert(`Failed to fetch reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, [filters]);

  const handleSearch = async (query: string) => {
    const newFilters = { ...filters, search: query, page: 1 };
    setFilters(newFilters);
    try {
      setIsLoading(true);
      const result = await ReportsService.getReports(newFilters);
      setReportsData(result);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert(`Failed to fetch reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = async (column: string) => {
    const newFilters = {
      ...filters,
      sortBy: column,
      sortOrder: filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc',
    };
    setFilters(newFilters);
    try {
      setIsLoading(true);
      const result = await ReportsService.getReports(newFilters);
      setReportsData(result);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert(`Failed to fetch reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    try {
      setIsLoading(true);
      const result = await ReportsService.getReports(newFilters);
      setReportsData(result);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert(`Failed to fetch reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimitChange = async (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 };
    setFilters(newFilters);
    try {
      setIsLoading(true);
      const result = await ReportsService.getReports(newFilters);
      setReportsData(result);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert(`Failed to fetch reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (report: Report) => {
    const feedback = prompt(`Optional feedback for approving "${report.title}":`);
    try {
      // Get current user ID from auth store
      const { user } = useAuthStore.getState();
      if (!user) {
        alert('You must be logged in to approve reports');
        return;
      }
      
      await ReportsService.approveReport(report.id, user.id, feedback || undefined);
      alert(`Report "${report.title}" has been approved`);
      
      // Refresh the reports list
      const result = await ReportsService.getReports(filters);
      setReportsData(result);
    } catch (error) {
      console.error('Error approving report:', error);
      alert(`Failed to approve report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleReject = async (report: Report) => {
    const reason = prompt(`Reason for rejecting "${report.title}":`);
    if (reason) {
      try {
        // Get current user ID from auth store
        const { user } = useAuthStore.getState();
        if (!user) {
          alert('You must be logged in to reject reports');
          return;
        }
        
        await ReportsService.rejectReport(report.id, user.id, reason);
        alert(`Report "${report.title}" has been rejected`);
        
        // Refresh the reports list
        const result = await ReportsService.getReports(filters);
        setReportsData(result);
      } catch (error) {
        console.error('Error rejecting report:', error);
        alert(`Failed to reject report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const columns: TableColumn<Report>[] = [
    {
      key: 'title',
      label: 'Report',
      sortable: true,
      render: (_, report) => (
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{report.title}</div>
            <div className="text-sm text-gray-500 capitalize">
              {report.reportType} Report
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'organisationName',
      label: 'Organization',
      sortable: true,
      render: (_, report) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{report.organisationName}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_, report) => <StatusBadge status={report.status} />,
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      sortable: true,
      render: (_, report) => (
        <div>
          <div className="text-sm">{formatDate(report.submittedAt!)}</div>
          <div className="text-xs text-gray-500">
            {formatRelativeTime(report.submittedAt!)}
          </div>
        </div>
      ),
    },
    {
      key: 'reviewedAt',
      label: 'Reviewed',
      render: (_, report) => (
        report.reviewedAt ? (
          <div>
            <div className="text-sm">{formatDate(report.reviewedAt)}</div>
            <div className="text-xs text-gray-500">
              by {report.reviewedBy}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )
      ),
    },
    {
      key: 'documentUrl',
      label: 'Document',
      render: (_, report) => (
        report.documentUrl ? (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Download className="h-3 w-3" />}
            onClick={() => window.open(report.documentUrl, '_blank')}
          >
            Download
          </Button>
        ) : (
          <span className="text-gray-400">—</span>
        )
      ),
    },
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (report: Report) => {
        console.log('View details for:', report.id);
      },
      icon: <Eye className="h-4 w-4" />,
      variant: 'ghost' as const,
    },
    {
      label: 'Approve',
      onClick: handleApprove,
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'ghost' as const,
    },
    {
      label: 'Reject',
      onClick: handleReject,
      icon: <X className="h-4 w-4" />,
      variant: 'ghost' as const,
    },
  ];

  const stats = [
    {
      label: 'Total Reports',
      value: reportsData?.pagination.total || 0,
      color: 'blue',
    },
    {
      label: 'Pending Review',
      value: reportsData?.data.filter(report => report.status === 'submitted' || report.status === 'under_review').length || 0,
      color: 'yellow',
    },
    {
      label: 'Approved',
      value: reportsData?.data.filter(report => report.status === 'approved').length || 0,
      color: 'green',
    },
    {
      label: 'Rejected',
      value: reportsData?.data.filter(report => report.status === 'rejected').length || 0,
      color: 'red',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="mt-2 text-gray-600">
              Review and approve reports submitted by organisations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
              Filter
            </Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Generate Report
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

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={reportsData?.data || []}
              columns={columns}
              loading={isLoading}
              pagination={{
                page: filters.page || 1,
                limit: filters.limit || 10,
                total: reportsData?.pagination.total || 0,
                onPageChange: handlePageChange,
                onLimitChange: handleLimitChange,
              }}
              sorting={{
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                onSort: handleSort,
              }}
              selection={{
                selectedRows: selectedReports,
                onSelectionChange: setSelectedReports,
              }}
              actions={actions}
              onSearch={handleSearch}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}