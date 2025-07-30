'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { formatDate, formatRelativeTime } from '@/utils';
import { UsersService, type UserFilters as ApiUserFilters } from '@/lib/api/users';
import { UserModal } from '@/components/users/UserModal';
import { toast } from 'react-hot-toast';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  Shield,
  Filter,
  Download,
  UserCheck,
  UserX,
  Crown,
  User,
  RefreshCw
} from 'lucide-react';
import type { Database } from '@/lib/supabase/types';
import type { TableColumn } from '@/types';

type UserType = Database['public']['Tables']['users']['Row'];

export default function UsersPage() {
  const [filters, setFilters] = React.useState<ApiUserFilters>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [usersData, setUsersData] = React.useState<{
    data: UserType[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    mode: 'view' | 'add' | 'edit';
    user: UserType | null;
  }>({
    isOpen: false,
    mode: 'view',
    user: null,
  });
  const [userStats, setUserStats] = React.useState<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
    moderators: number;
    viewers: number;
  } | null>(null);

  // Fetch users data
  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await UsersService.getUsers(filters);
      setUsersData(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch user stats
  const fetchUserStats = React.useCallback(async () => {
    try {
      const stats = await UsersService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  }, []);

  // Initial data fetch
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  React.useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query, page: 1 }));
  };

  const handleSort = (column: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleActivate = async (user: UserType) => {
    if (confirm(`Are you sure you want to activate ${user.name}?`)) {
      try {
        await UsersService.activateUser(user.id);
        toast.success(`${user.name} has been activated`);
        fetchUsers();
        fetchUserStats();
      } catch (error) {
        console.error('Failed to activate user:', error);
        toast.error('Failed to activate user');
      }
    }
  };

  const handleDeactivate = async (user: UserType) => {
    if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
      try {
        await UsersService.deactivateUser(user.id);
        toast.success(`${user.name} has been deactivated`);
        fetchUsers();
        fetchUserStats();
      } catch (error) {
        console.error('Failed to deactivate user:', error);
        toast.error('Failed to deactivate user');
      }
    }
  };

  const handleDelete = async (user: UserType) => {
    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        await UsersService.deleteUser(user.id);
        toast.success(`${user.name} has been deleted`);
        fetchUsers();
        fetchUserStats();
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchUserStats();
  };

  // Modal handlers
  const openModal = (mode: 'view' | 'add' | 'edit', user: UserType | null = null) => {
    setModalState({ isOpen: true, mode, user });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'view', user: null });
  };

  const handleModalSuccess = () => {
    fetchUsers();
    fetchUserStats();
  };
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'viewer':
        return <User className="h-4 w-4 text-gray-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'destructive',
      moderator: 'default',
      viewer: 'secondary',
    };
    return (
      <Badge variant={variants[role as keyof typeof variants] || 'secondary'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const columns: TableColumn<UserType>[] = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center gap-2">
          {getRoleIcon(user.role)}
          {getRoleBadge(user.role)}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (_, user) => (
        <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'last_login_at',
      label: 'Last Login',
      sortable: true,
      render: (_, user) => (
        user.last_login_at ? (
          <div>
            <div className="text-sm">{formatDate(user.last_login_at)}</div>
            <div className="text-xs text-gray-500">
              {formatRelativeTime(user.last_login_at)}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Never</span>
        )
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (_, user) => (
        <div>
          <div className="text-sm">{formatDate(user.created_at)}</div>
          <div className="text-xs text-gray-500">
            {formatRelativeTime(user.created_at)}
          </div>
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (user: UserType) => {
        openModal('view', user);
      },
      icon: <Eye className="h-4 w-4" />,
      variant: 'ghost' as const,
    },
    {
      label: 'Edit',
      onClick: (user: UserType) => {
        openModal('edit', user);
      },
      icon: <Edit className="h-4 w-4" />,
      variant: 'ghost' as const,
    },
    {
      label: (user: UserType) => user.is_active ? 'Deactivate' : 'Activate',
      onClick: (user: UserType) => {
        if (user.is_active) {
          handleDeactivate(user);
        } else {
          handleActivate(user);
        }
      },
      icon: (user: UserType) => user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />,
      variant: 'ghost' as const,
    },
    {
      label: 'Delete',
      onClick: handleDelete,
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'ghost' as const,
    },
  ];
  const stats = [
    {
      label: 'Total Users',
      value: usersData?.pagination.total || 0,
      color: 'blue',
    },
    {
      label: 'Active Users',
      value: usersData?.data.filter(user => user.isActive).length || 0,
      color: 'green',
    },
    {
      label: 'Administrators',
      value: usersData?.data.filter(user => user.role === 'admin').length || 0,
      color: 'purple',
    },
    {
      label: 'Inactive Users',
      value: usersData?.data.filter(user => !user.isActive).length || 0,
      color: 'red',
    },
  ];

  return (
    <ProtectedRoute requiredPermissions={["users.view"]}>
      <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="mt-2 text-gray-600">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
              Filter
            </Button>
            <PermissionGuard permission="users.create">
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => openModal('add')}
              >
                Add User
              </Button>
            </PermissionGuard>
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

        {/* User Stats */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inactive</p>
                    <p className="text-2xl font-bold text-red-600">{userStats.inactive}</p>
                  </div>
                  <UserX className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-purple-600">{userStats.admins}</p>
                  </div>
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Moderators</p>
                    <p className="text-2xl font-bold text-orange-600">{userStats.moderators}</p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Viewers</p>
                    <p className="text-2xl font-bold text-gray-600">{userStats.viewers}</p>
                  </div>
                  <User className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={usersData?.data || []}
              columns={columns}
              loading={isLoading}
              pagination={{
                page: filters.page || 1,
                limit: filters.limit || 10,
                total: usersData?.pagination.total || 0,
                onPageChange: handlePageChange,
                onLimitChange: handleLimitChange,
              }}
              sorting={{
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                onSort: handleSort,
              }}
              selection={{
                selectedRows: selectedUsers,
                onSelectionChange: setSelectedUsers,
              }}
              actions={actions}
              onSearch={handleSearch}
            />
          </CardContent>
        </Card>

        {/* User Modal */}
        <UserModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          mode={modalState.mode}
          user={modalState.user}
          onSuccess={handleModalSuccess}
        />
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}