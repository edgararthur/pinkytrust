'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate, formatRelativeTime } from '@/utils';
import type { Database } from '@/lib/supabase/types';
import {
  Activity,
  User,
  Globe,
  Monitor,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  Eye
} from 'lucide-react';

type ActivityLogType = Database['public']['Tables']['activity_logs']['Row'];

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityLog: ActivityLogType | null;
}

export function ActivityLogModal({ isOpen, onClose, activityLog }: ActivityLogModalProps) {
  const [copying, setCopying] = React.useState(false);

  if (!activityLog) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return 'bg-blue-100 text-blue-800';
      case 'update':
      case 'updated':
        return 'bg-orange-100 text-orange-800';
      case 'delete':
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'approve':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'reject':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'login':
        return 'bg-purple-100 text-purple-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = async (text: string) => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const exportLogData = () => {
    const logData = {
      id: activityLog.id,
      action: activityLog.action,
      resource: activityLog.resource,
      user_name: activityLog.user_name,
      user_email: activityLog.user_email,
      timestamp: activityLog.created_at,
      ip_address: activityLog.ip_address,
      user_agent: activityLog.user_agent,
      status: activityLog.status,
      details: activityLog.details,
    };

    const dataStr = JSON.stringify(logData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${activityLog.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(activityLog.status)}
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={getActionColor(activityLog.action)}>
                    {activityLog.action.charAt(0).toUpperCase() + activityLog.action.slice(1)}
                  </Badge>
                  <Badge className={getStatusColor(activityLog.status)}>
                    {activityLog.status.charAt(0).toUpperCase() + activityLog.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(activityLog.created_at)} • {formatRelativeTime(activityLog.created_at)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(activityLog.id)}
                disabled={copying}
                leftIcon={copying ? <LoadingSpinner size="sm" /> : <Copy className="h-4 w-4" />}
              >
                {copying ? 'Copied!' : 'Copy ID'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportLogData}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Export
              </Button>
            </div>
          </div>

          {/* Resource Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resource Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Resource Type</label>
                <p className="text-sm text-gray-900 capitalize">{activityLog.resource}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm text-gray-900">{activityLog.description || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Resource ID</label>
                <p className="text-sm text-gray-900 font-mono">{activityLog.resource_id || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Action</label>
                <p className="text-sm text-gray-900 capitalize">{activityLog.action}</p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              User Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">User Name</label>
                <p className="text-sm text-gray-900">{activityLog.user_name || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{activityLog.user_email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm text-gray-900 font-mono">{activityLog.user_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Technical Information */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Technical Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  IP Address
                </label>
                <p className="text-sm text-gray-900 font-mono">{activityLog.ip_address || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  User Agent
                </label>
                <p className="text-sm text-gray-900 break-all">
                  {activityLog.user_agent || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Timestamp
                </label>
                <p className="text-sm text-gray-900 font-mono">{activityLog.created_at}</p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {activityLog.details && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Additional Details
              </h3>
              <pre className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-3 rounded border overflow-x-auto">
                {JSON.stringify(activityLog.details, null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
