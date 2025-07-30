'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 shadow-sm hover:shadow-md',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
        destructive: 'bg-red-600 text-white hover:bg-red-700 border border-red-600',
        outline: 'border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300',
        ghost: 'text-gray-900 hover:bg-gray-100 border border-transparent',
        link: 'text-blue-700 underline-offset-4 hover:underline font-medium',
        success: 'bg-green-600 text-white hover:bg-green-700 border border-green-600',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 border border-yellow-600',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 py-2 text-sm',
        lg: 'h-14 px-8 py-4 text-lg',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
