'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate, formatRelativeTime } from '@/utils';
import { UsersService } from '@/lib/api/users';
import type { Database } from '@/lib/supabase/types';
import { ROLE_PERMISSIONS, PERMISSION_CATEGORIES, PERMISSION_DESCRIPTIONS, type Role, type Permission } from '@/lib/auth/permissions';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';

type UserType = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'add' | 'edit';
  user?: UserType | null;
  onSuccess?: () => void;
}

export function UserModal({ isOpen, onClose, mode, user, onSuccess }: UserModalProps) {
  const [formData, setFormData] = React.useState<{
    email: string;
    name: string;
    role: 'admin' | 'moderator' | 'viewer';
    is_active: boolean;
  }>({
    email: '',
    name: '',
    role: 'viewer',
    is_active: true,
  });
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Initialize form data when user changes
  React.useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      setFormData({
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
      });
    } else if (mode === 'add') {
      setFormData({
        email: '',
        name: '',
        role: 'viewer',
        is_active: true,
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (mode === 'add') {
        const userData: UserInsert = {
          id: crypto.randomUUID(), // Generate a UUID for new users
          email: formData.email.trim(),
          name: formData.name.trim(),
          role: formData.role,
          is_active: formData.is_active,
        };
        await UsersService.createUser(userData);
        toast.success('User created successfully');
      } else if (mode === 'edit' && user) {
        const updates: UserUpdate = {
          email: formData.email.trim(),
          name: formData.name.trim(),
          role: formData.role,
          is_active: formData.is_active,
        };
        await UsersService.updateUser(user.id, updates);
        toast.success('User updated successfully');
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(error.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {mode === 'view' && 'User Details'}
            {mode === 'add' && 'Add New User'}
            {mode === 'edit' && 'Edit User'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'view' && user ? (
          <div className="space-y-6">
            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Role</Label>
                  <Badge className={`mt-1 ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={`mt-1 ${getStatusColor(user.is_active)}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Login</Label>
                  <p className="text-sm text-gray-900">
                    {user.last_login_at ? (
                      <>
                        {formatDate(user.last_login_at)}
                        <span className="text-gray-500 ml-2">
                          ({formatRelativeTime(user.last_login_at)})
                        </span>
                      </>
                    ) : (
                      'Never'
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="text-sm text-gray-900">
                    {formatDate(user.created_at)}
                    <span className="text-gray-500 ml-2">
                      ({formatRelativeTime(user.created_at)})
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@example.com"
                disabled={loading}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Doe"
                disabled={loading}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'moderator' | 'viewer') => 
                  handleInputChange('role', value)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permissions Preview */}
            <div className="space-y-2">
              <Label>Permissions Preview</Label>
              <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                <div className="text-xs text-gray-600 mb-2">
                  This role will have access to:
                </div>
                <div className="space-y-1">
                  {ROLE_PERMISSIONS[formData.role as Role]?.slice(0, 8).map((permission) => (
                    <div key={permission} className="text-xs text-gray-700 flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      {PERMISSION_DESCRIPTIONS[permission]}
                    </div>
                  ))}
                  {ROLE_PERMISSIONS[formData.role as Role]?.length > 8 && (
                    <div className="text-xs text-gray-500 italic">
                      +{ROLE_PERMISSIONS[formData.role as Role].length - 8} more permissions...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                disabled={loading}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active">Active User</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <LoadingSpinner size="sm" className="mr-2" />}
                {mode === 'add' ? 'Create User' : 'Update User'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
