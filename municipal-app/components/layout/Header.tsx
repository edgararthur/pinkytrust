'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Menu,
  Bell,
  Search,
  Settings,
  User,
  Moon,
  Sun,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { SearchInput } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function Header() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { sidebarOpen, setSidebarOpen, theme, setTheme } = useUIStore();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const result = await signOut();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Signed out successfully');
        router.push('/login');
      }
    } catch (error) {
      toast.error('Failed to sign out');
    } finally {
      setIsSigningOut(false);
      setShowUserMenu(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = (user as any).first_name || (user as any).firstName || '';
    const lastName = (user as any).last_name || (user as any).lastName || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || user.email[0].toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      super_admin: 'Super Admin',
      municipal_admin: 'Municipal Admin',
      manager: 'Manager',
      staff: 'Staff',
      viewer: 'Viewer'
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  const getMunicipalityName = () => {
    if (!user?.municipality_id) return 'Dashboard';
    const map: Record<string,string> = {
      'ga-west-municipal':'Ga West Municipal Assembly',
      'accra-metro':'Accra Metropolitan Assembly',
      'tema-metro':'Tema Metropolitan Assembly',
      'kumasi-metro':'Kumasi Metropolitan Assembly',
      'cape-coast-metro':'Cape Coast Metropolitan Assembly'
    };
    return map[user.municipality_id] || user.municipality_id;
  };

  const notifications = [
    {
      id: '1',
      title: 'New Organization Registration',
      message: 'Hope Foundation has submitted a registration request',
      time: '5 minutes ago',
      unread: true,
    },
    {
      id: '2',
      title: 'Certificate Expiring Soon',
      message: 'Pink Ribbon Society certificate expires in 15 days',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: '3',
      title: 'Event Report Submitted',
      message: 'Screening event report from Community Health Center',
      time: '2 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6 shadow-sm">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title - will be dynamic based on route */}
      <div className="flex-1">
        <h1 className="text-xl font-bold text-pink-700">{getMunicipalityName()}</h1>
        <p className="text-sm text-gray-600">Municipal Administration Portal</p>
      </div>

      {/* Search */}
      <div className="hidden md:block">
        <SearchInput 
          placeholder="Search organizations, events, reports..."
          className="w-80 focus-within:ring-2 focus-within:ring-pink-500 focus-within:border-pink-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-md border border-gray-200 bg-white shadow-lg z-50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Mark all read
                  </Button>
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      notification.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notification.time}
                        </p>
                      </div>
                      {notification.unread && (
                        <div className="h-2 w-2 rounded-full bg-blue-600 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <Button variant="ghost" size="sm" className="w-full text-center">
                  View all notifications
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3"
          >
            <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-sm font-medium text-pink-600">{getUserInitials()}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {user ? `${(user as any).first_name || (user as any).firstName || ''} ${(user as any).last_name || (user as any).lastName || ''}`.trim() || 'User' : 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user ? getRoleLabel(user.role) : 'Role'}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>

          {/* User dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-50">
              <div className="p-4 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {user ? `${(user as any).first_name || (user as any).firstName || ''} ${(user as any).last_name || (user as any).lastName || ''}`.trim() || 'User' : 'User'}
                </p>
                <p className="text-sm text-gray-500">{user?.email || 'No email'}</p>
                <p className="text-xs text-gray-500 mt-1">{user ? getRoleLabel(user.role) : 'No role'}</p>
              </div>
              
              <div className="py-2">
                <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <User className="mr-3 h-4 w-4" />
                  Profile Settings
                </button>
                <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Settings className="mr-3 h-4 w-4" />
                  Account Settings
                </button>
              </div>
              
              <div className="border-t border-gray-200 py-2">
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}
