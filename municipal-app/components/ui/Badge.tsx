'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
        pending: 'border-transparent bg-orange-100 text-orange-800 hover:bg-orange-200',
        approved: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        rejected: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
        active: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        inactive: 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200',
        expired: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
        revoked: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}

// Status-specific badge components for convenience
export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ 
  status, 
  className 
}) => {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'active':
        return 'active';
      case 'inactive':
        return 'inactive';
      case 'expired':
        return 'expired';
      case 'revoked':
        return 'revoked';
      case 'completed':
        return 'success';
      case 'ongoing':
        return 'info';
      case 'planned':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant(status)} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export { Badge, badgeVariants };
