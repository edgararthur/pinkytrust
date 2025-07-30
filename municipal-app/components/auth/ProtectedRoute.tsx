'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Lock } from 'lucide-react';
import { hasPermission, hasAnyPermission } from '@/lib/auth/permissions';
import type { Permission, Role } from '@/lib/auth/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  requiredPermissions?: Permission[];
  requireAnyPermission?: boolean; // If true, user needs ANY of the permissions, not ALL
  fallbackPath?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAnyPermission = false,
  fallbackPath = '/login',
  fallback,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(fallbackPath);
    }
  }, [user, loading, router, fallbackPath]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600 mb-4">
                You need to be signed in to access this page.
              </p>
              <Button
                onClick={() => window.location.href = '/login'}
                className="w-full"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role as Role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have the required permissions to access this page.
            </p>
            <div className="text-sm text-gray-500 mb-4">
              Required role(s): {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}
            </div>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const userRole = user.role as Role;
    let hasRequiredPermissions = false;

    if (requireAnyPermission) {
      // User needs ANY of the specified permissions
      hasRequiredPermissions = hasAnyPermission(userRole, requiredPermissions);
    } else {
      // User needs ALL of the specified permissions
      hasRequiredPermissions = requiredPermissions.every(permission =>
        hasPermission(userRole, permission)
      );
    }

    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Insufficient Permissions
              </h2>
              <p className="text-gray-600 mb-4">
                You don't have the required permissions to access this page.
              </p>
              <div className="text-sm text-gray-500 mb-4">
                Required permission(s): {permissions.join(', ')}
              </div>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
}

// Higher-order component for easier usage
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Convenience wrapper for admin-only routes
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles={['super_admin', 'municipal_admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

// Convenience wrapper for manager+ routes
export function ManagerRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles={['super_admin', 'municipal_admin', 'manager']} {...props}>
      {children}
    </ProtectedRoute>
  );
}
