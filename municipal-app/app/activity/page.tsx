'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { 
  Activity,
  Search,
  Filter,
  Clock,
  Calendar,
  User,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart2,
  FileText,
  Settings,
  Users,
  Building2
} from 'lucide-react';
import { ActivityLogsService, ActivityLog, ActivityLogFilters } from '@/lib/api/activity-logs';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'react-hot-toast';
import { formatDate, formatRelativeTime } from '@/utils';

export default function ActivityPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    warning: 0,
    byResource: {} as Record<string, number>,
    byAction: {} as Record<string, number>,
    timeline: [] as Array<{ date: string; count: number; }>
  });
  const [resources, setResources] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);

  useEffect(() => {
    loadLogs();
    loadStats();
    loadFilters();
  }, [currentPage, searchTerm, statusFilter, resourceFilter, actionFilter]);

  const loadLogs = async () => {
    if (!user?.municipality_id) return;

    try {
      setLoading(true);
      const filters: ActivityLogFilters = {
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
        resource: resourceFilter !== 'all' ? resourceFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      const response = await ActivityLogsService.getActivityLogs(filters);
      setLogs(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.municipality_id) return;

    try {
      const activityStats = await ActivityLogsService.getActivityStats();
      setStats(activityStats);
    } catch (error) {
      console.error('Error loading activity stats:', error);
    }
  };

  const loadFilters = async () => {
    try {
      const [resourceList, actionList] = await Promise.all([
        ActivityLogsService.getUniqueResources(),
        ActivityLogsService.getUniqueActions()
      ]);
      setResources(resourceList);
      setActions(actionList);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { variant: 'success' as const, icon: CheckCircle, label: 'Success' },
      failed: { variant: 'destructive' as const, icon: XCircle, label: 'Failed' },
      warning: { variant: 'warning' as const, icon: AlertTriangle, label: 'Warning' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.success;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getResourceIcon = (resource: string) => {
    const resourceIcons = {
      organization: Building2,
      user: Users,
      event: Calendar,
      certificate: FileText,
      settings: Settings,
      default: Activity
    };
    
    const Icon = resourceIcons[resource.toLowerCase() as keyof typeof resourceIcons] || resourceIcons.default;
    return <Icon className="h-4 w-4" />;
  };

  const ActivityLogCard = ({ log }: { log: ActivityLog }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              {getResourceIcon(log.resource)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{log.resource_name}</h3>
              <p className="text-sm text-gray-500 capitalize">{log.action}</p>
            </div>
          </div>
          {getStatusBadge(log.status)}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            {log.user_name}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            {log.user_email}
          </div>
          {log.details && (
            <div className="text-sm text-gray-600">
              <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-2 rounded">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(log.created_at)}
          </div>
          {log.ip_address && (
            <div className="font-mono">
              {log.ip_address}
            </div>
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
          <h2 className="text-2xl font-bold text-gray-900">Activity Monitoring</h2>
          <p className="text-gray-600">Monitor system activity and user actions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Activities" value={stats.total} icon={BarChart2} />
        <StatCard title="Successful" value={stats.success} icon={CheckCircle} />
        <StatCard title="Failed" value={stats.failed} icon={XCircle} />
        <StatCard title="Warnings" value={stats.warning} icon={AlertTriangle} />
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            {/* TODO: Add chart component */}
            <div className="flex items-center justify-center h-full text-gray-500">
              Chart component will be added here
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
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
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {resources.map(resource => (
                  <SelectItem key={resource} value={resource}>
                    {resource}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map(action => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadLogs}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Grid */}
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
          {logs.map((log) => (
            <ActivityLogCard key={log.id} log={log} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && logs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || resourceFilter !== 'all' || actionFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No activity logs have been recorded yet.'}
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
    </div>
  );
}
