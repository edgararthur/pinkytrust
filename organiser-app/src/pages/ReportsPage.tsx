import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Report } from '../types';
import { formatDate, formatRelativeTime } from '../utils';

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // Mock data for now
      const mockReports: Report[] = [
        {
          id: '1',
          organization_id: '1',
          event_id: '1',
          title: 'Breast Cancer Screening Camp Report',
          description: 'Comprehensive report on the screening camp held on February 15th',
          type: 'event',
          status: 'submitted',
          data: {
            participants: 45,
            screenings_conducted: 42,
            referrals_made: 8,
            follow_ups_scheduled: 12,
          },
          submitted_at: '2024-02-16T10:00:00Z',
          created_at: '2024-02-15T18:00:00Z',
          updated_at: '2024-02-16T10:00:00Z',
        },
        {
          id: '2',
          organization_id: '1',
          title: 'Monthly Activity Report - January 2024',
          description: 'Summary of all activities conducted in January 2024',
          type: 'monthly',
          status: 'approved',
          data: {
            total_events: 3,
            total_participants: 120,
            volunteer_hours: 240,
            awareness_sessions: 5,
          },
          submitted_at: '2024-02-01T09:00:00Z',
          approved_at: '2024-02-03T14:30:00Z',
          created_at: '2024-01-31T16:00:00Z',
          updated_at: '2024-02-03T14:30:00Z',
        },
        {
          id: '3',
          organization_id: '1',
          event_id: '2',
          title: 'Awareness Workshop Report',
          description: 'Report on the educational workshop about early detection',
          type: 'event',
          status: 'draft',
          data: {
            participants: 12,
            materials_distributed: 50,
            feedback_score: 4.8,
            follow_up_requests: 8,
          },
          created_at: '2024-02-20T17:00:00Z',
          updated_at: '2024-02-20T17:00:00Z',
        },
        {
          id: '4',
          organization_id: '1',
          title: 'Quarterly Impact Report - Q4 2023',
          description: 'Comprehensive quarterly report showing impact and outcomes',
          type: 'quarterly',
          status: 'rejected',
          data: {
            total_beneficiaries: 450,
            events_conducted: 12,
            volunteer_engagement: 85,
            community_reach: 2500,
          },
          submitted_at: '2024-01-15T11:00:00Z',
          created_at: '2024-01-10T14:00:00Z',
          updated_at: '2024-01-18T09:00:00Z',
        },
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        // TODO: Replace with actual API call
        setReports(reports.filter(report => report.id !== reportId));
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleSubmitReport = async (reportId: string) => {
    try {
      // TODO: Replace with actual API call
      setReports(reports.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status: 'submitted', 
              submitted_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : report
      ));
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'submitted': return 'warning';
      case 'rejected': return 'danger';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'event': return 'info';
      case 'monthly': return 'success';
      case 'quarterly': return 'warning';
      case 'annual': return 'danger';
      default: return 'default';
    }
  };

  const stats = {
    total: reports.length,
    draft: reports.filter(r => r.status === 'draft').length,
    submitted: reports.filter(r => r.status === 'submitted').length,
    approved: reports.filter(r => r.status === 'approved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Create and manage your organization's reports</p>
        </div>
        <Link to="/reports/new">
          <Button className="mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Reports</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              <p className="text-sm text-gray-600">Draft</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
              <p className="text-sm text-gray-600">Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reports..."
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
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="event">Event Reports</option>
              <option value="monthly">Monthly Reports</option>
              <option value="quarterly">Quarterly Reports</option>
              <option value="annual">Annual Reports</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                    <Badge variant={getStatusBadgeVariant(report.status)}>
                      {report.status}
                    </Badge>
                    <Badge variant={getTypeBadgeVariant(report.type)}>
                      {report.type}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{report.description}</p>
                  
                  {/* Data Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {Object.entries(report.data).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-semibold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Created {formatDate(report.created_at)}</span>
                    </div>
                    {report.submitted_at && (
                      <div className="flex items-center">
                        <Send className="h-4 w-4 mr-1" />
                        <span>Submitted {formatRelativeTime(report.submitted_at)}</span>
                      </div>
                    )}
                    {report.approved_at && (
                      <div className="flex items-center text-green-600">
                        <span>Approved {formatRelativeTime(report.approved_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  {report.status === 'draft' && (
                    <Button 
                      size="sm"
                      onClick={() => handleSubmitReport(report.id)}
                    >
                      Submit
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters to see more reports.'
                : "You haven't created any reports yet. Create your first report to get started."
              }
            </p>
            <Link to="/reports/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage; 