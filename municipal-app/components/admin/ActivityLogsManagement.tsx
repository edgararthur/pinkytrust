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
  Download, 
  Calendar,
  User,
  FileText,
  Eye,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit,
  Plus,
  Minus,
  RotateCcw,
  Settings,
  Shield,
  Building2,
  Users,
  Award
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  municipality_id: string | null;
  created_at: string;
}

interface ActivityLogsManagementProps {
  municipalityId?: string;
}

export function ActivityLogsManagement({ municipalityId }: ActivityLogsManagementProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    loadActivityLogs();
  }, [currentPage, searchTerm, actionFilter, resourceFilter, dateFilter, municipalityId]);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (municipalityId) {
        query = query.eq('municipality_id', municipalityId);
      }

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (resourceFilter !== 'all') {
        query = query.eq('resource_type', resourceFilter);
      }

      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%,resource_id.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const limit = 20;
      const from = (currentPage - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setLogs(data || []);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (error) {
      console.error('Error loading activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      // This would implement CSV export functionality
      toast.success('Export functionality would be implemented here');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export logs');
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'update':
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete':
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'approve':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'reject':
      case 'rejected':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'login':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'logout':
        return <RotateCcw className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case 'user':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'organization':
        return <Building2 className="h-4 w-4 text-purple-600" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'certificate':
        return <Award className="h-4 w-4 text-orange-600" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
      case 'approve':
      case 'approved':
        return 'green';
      case 'update':
      case 'updated':
      case 'login':
        return 'blue';
      case 'delete':
      case 'deleted':
      case 'reject':
      case 'rejected':
        return 'red';
      case 'suspend':
      case 'suspended':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const ActivityLogCard = ({ log }: { log: ActivityLog }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex items-center gap-2 mt-1">
              {getActionIcon(log.action)}
              {getResourceIcon(log.resource_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getActionBadgeColor(log.action) as any}>
                  {log.action}
                </Badge>
                <Badge variant="outline">
                  {log.resource_type}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-900 mb-1">
                {log.resource_id ? (
                  <>Resource ID: <span className="font-mono text-xs">{log.resource_id}</span></>
                ) : (
                  'System action'
                )}
              </p>
              
              {log.details && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(log.created_at).toLocaleString()}
                </div>
                {log.user_id && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    User: {log.user_id.slice(0, 8)}...
                  </div>
                )}
                {log.municipality_id && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {log.municipality_id}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedLog(log);
              setShowDetailsDialog(true);
            }}
          >
            <Eye className="h-4 w-4" />
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
          <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
          <p className="text-gray-600">Monitor system activities and user actions</p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="organization">Organizations</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="certificate">Certificates</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={loadActivityLogs}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
            <p className="text-gray-600">
              {searchTerm || actionFilter !== 'all' || resourceFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Activity logs will appear here as users interact with the system.'}
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
