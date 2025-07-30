'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ROLE_PERMISSIONS, 
  PERMISSION_CATEGORIES, 
  PERMISSION_DESCRIPTIONS,
  type Role,
  type Permission,
  getPermissionDiff
} from '@/lib/auth/permissions';
import {
  Shield,
  Users,
  Eye,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  Crown,
  User,
  Settings
} from 'lucide-react';

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = React.useState<Role>('viewer');
  const [compareRole, setCompareRole] = React.useState<Role | null>(null);

  const roles: { value: Role; label: string; description: string; icon: React.ReactNode; color: string }[] = [
    {
      value: 'admin',
      label: 'Administrator',
      description: 'Full system access with all permissions',
      icon: <Crown className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      value: 'moderator',
      label: 'Moderator',
      description: 'Content management and approval permissions',
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      value: 'viewer',
      label: 'Viewer',
      description: 'Read-only access to most content',
      icon: <User className="h-5 w-5" />,
      color: 'bg-gray-100 text-gray-800',
    },
  ];

  const getPermissionIcon = (permission: Permission) => {
    if (permission.includes('view')) return <Eye className="h-4 w-4" />;
    if (permission.includes('create')) return <Plus className="h-4 w-4" />;
    if (permission.includes('update') || permission.includes('edit')) return <Edit className="h-4 w-4" />;
    if (permission.includes('delete')) return <Trash2 className="h-4 w-4" />;
    if (permission.includes('approve')) return <Check className="h-4 w-4" />;
    if (permission.includes('reject')) return <X className="h-4 w-4" />;
    return <Settings className="h-4 w-4" />;
  };

  const getPermissionColor = (permission: Permission) => {
    if (permission.includes('view')) return 'bg-blue-100 text-blue-800';
    if (permission.includes('create')) return 'bg-green-100 text-green-800';
    if (permission.includes('update') || permission.includes('edit')) return 'bg-orange-100 text-orange-800';
    if (permission.includes('delete')) return 'bg-red-100 text-red-800';
    if (permission.includes('approve')) return 'bg-emerald-100 text-emerald-800';
    if (permission.includes('reject')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const permissionDiff = compareRole ? getPermissionDiff(selectedRole, compareRole) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Permissions Management</h1>
            <p className="text-gray-600">
              Manage role-based access control and permissions for the system
            </p>
          </div>
        </div>

        {/* Role Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card 
              key={role.value}
              className={`cursor-pointer transition-all ${
                selectedRole === role.value ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedRole(role.value)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${role.color}`}>
                      {role.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.label}</CardTitle>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Permissions:</span>
                    <Badge variant="outline">
                      {ROLE_PERMISSIONS[role.value]?.length || 0}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(PERMISSION_CATEGORIES).slice(0, 3).map((category) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {Object.keys(PERMISSION_CATEGORIES).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{Object.keys(PERMISSION_CATEGORIES).length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Compare with:</label>
                <select
                  value={compareRole || ''}
                  onChange={(e) => setCompareRole(e.target.value as Role || null)}
                  className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select a role to compare</option>
                  {roles.filter(r => r.value !== selectedRole).map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              {compareRole && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompareRole(null)}
                >
                  Clear Comparison
                </Button>
              )}
            </div>

            {permissionDiff && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Additional Permissions in {roles.find(r => r.value === compareRole)?.label}
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {permissionDiff.added.map((permission) => (
                      <div key={permission} className="text-sm text-green-700 bg-green-50 p-2 rounded">
                        {PERMISSION_DESCRIPTIONS[permission]}
                      </div>
                    ))}
                    {permissionDiff.added.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No additional permissions</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Permissions Removed from {roles.find(r => r.value === selectedRole)?.label}
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {permissionDiff.removed.map((permission) => (
                      <div key={permission} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                        {PERMISSION_DESCRIPTIONS[permission]}
                      </div>
                    ))}
                    {permissionDiff.removed.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No permissions removed</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {roles.find(r => r.value === selectedRole)?.label} Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => {
                const rolePermissions = ROLE_PERMISSIONS[selectedRole] || [];
                const categoryPermissions = permissions.filter(p => rolePermissions.includes(p));
                
                return (
                  <div key={category}>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      {category}
                      <Badge variant="outline" className="text-xs">
                        {categoryPermissions.length}/{permissions.length}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions.map((permission) => {
                        const hasPermission = rolePermissions.includes(permission);
                        return (
                          <div
                            key={permission}
                            className={`p-3 rounded-lg border ${
                              hasPermission 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`p-1 rounded ${getPermissionColor(permission)}`}>
                                {getPermissionIcon(permission)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${
                                    hasPermission ? 'text-green-800' : 'text-gray-500'
                                  }`}>
                                    {permission.split('.')[1]}
                                  </span>
                                  {hasPermission ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <X className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                <p className={`text-xs ${
                                  hasPermission ? 'text-green-700' : 'text-gray-500'
                                }`}>
                                  {PERMISSION_DESCRIPTIONS[permission]}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
