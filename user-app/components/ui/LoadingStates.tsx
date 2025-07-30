import React from 'react';
import { cn } from '@/utils';

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bounce' | 'bars';
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', variant = 'default', className, color = 'primary', ...props }, ref) => {
    const sizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    };

    const colorClasses = {
      primary: 'text-primary-600 border-primary-600',
      secondary: 'text-gray-600 border-gray-600',
      success: 'text-success-600 border-success-600',
      warning: 'text-warning-600 border-warning-600',
      error: 'text-error-600 border-error-600',
      white: 'text-white border-white',
    };

    if (variant === 'dots') {
      return (
        <div ref={ref} className={cn('flex space-x-1', className)} {...props}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full animate-pulse',
                sizeClasses[size],
                colorClasses[color].split(' ')[0].replace('text-', 'bg-')
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.4s',
              }}
            />
          ))}
        </div>
      );
    }

    if (variant === 'pulse') {
      return (
        <div
          ref={ref}
          className={cn(
            'rounded-full animate-pulse',
            sizeClasses[size],
            colorClasses[color].split(' ')[0].replace('text-', 'bg-'),
            className
          )}
          {...props}
        />
      );
    }

    if (variant === 'bounce') {
      return (
        <div ref={ref} className={cn('flex space-x-1', className)} {...props}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full animate-bounce',
                sizeClasses[size],
                colorClasses[color].split(' ')[0].replace('text-', 'bg-')
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      );
    }

    if (variant === 'bars') {
      return (
        <div ref={ref} className={cn('flex space-x-1 items-end', className)} {...props}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'animate-pulse rounded-sm',
                size === 'xs' && 'w-1 h-2',
                size === 'sm' && 'w-1 h-3',
                size === 'md' && 'w-1 h-4',
                size === 'lg' && 'w-1.5 h-5',
                size === 'xl' && 'w-2 h-6',
                colorClasses[color].split(' ')[0].replace('text-', 'bg-')
              )}
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1.2s',
              }}
            />
          ))}
        </div>
      );
    }

    // Default spinner
    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full border-2 border-t-transparent',
          sizeClasses[size],
          colorClasses[color].split(' ')[1],
          className
        )}
        {...props}
      />
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// Loading Overlay Component
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  spinner?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  spinnerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  blur?: boolean;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({
    isLoading,
    children,
    spinner,
    className,
    overlayClassName,
    spinnerSize = 'lg',
    text,
    blur = true,
    ...props
  }, ref) => {
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
        
        {isLoading && (
          <div
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center z-50',
              blur ? 'backdrop-blur-sm bg-white/80' : 'bg-white/90',
              overlayClassName
            )}
          >
            {spinner || <LoadingSpinner size={spinnerSize} />}
            {text && (
              <p className="mt-4 text-sm text-gray-600 font-medium">{text}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

// Loading Button Component
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  spinner?: React.ReactNode;
  spinnerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({
    isLoading,
    loadingText,
    spinner,
    spinnerSize = 'sm',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    children,
    className,
    disabled,
    ...props
  }, ref) => {
    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-400',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-100',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-50',
      ghost: 'text-gray-700 hover:bg-gray-100 disabled:bg-gray-50',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <div className="mr-2">
            {spinner || <LoadingSpinner size={spinnerSize} color="white" />}
          </div>
        )}
        {isLoading ? loadingText || 'Loading...' : children}
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

// Loading Card Component
interface LoadingCardProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  skeletonLines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
}

const LoadingCard = React.forwardRef<HTMLDivElement, LoadingCardProps>(
  ({
    isLoading,
    children,
    className,
    skeletonLines = 3,
    showAvatar = false,
    showImage = false,
    ...props
  }, ref) => {
    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            'bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse',
            className
          )}
          {...props}
        >
          {showAvatar && (
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/6" />
              </div>
            </div>
          )}
          
          {showImage && (
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
          )}
          
          <div className="space-y-3">
            {Array.from({ length: skeletonLines }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-4 bg-gray-200 rounded',
                  i === skeletonLines - 1 ? 'w-2/3' : 'w-full'
                )}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

LoadingCard.displayName = 'LoadingCard';

// Loading List Component
interface LoadingListProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  itemCount?: number;
  showAvatar?: boolean;
}

const LoadingList = React.forwardRef<HTMLDivElement, LoadingListProps>(
  ({
    isLoading,
    children,
    className,
    itemCount = 5,
    showAvatar = true,
    ...props
  }, ref) => {
    if (isLoading) {
      return (
        <div ref={ref} className={cn('space-y-4', className)} {...props}>
          {Array.from({ length: itemCount }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              {showAvatar && (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

LoadingList.displayName = 'LoadingList';

// Loading Screen Component
interface LoadingScreenProps {
  isLoading: boolean;
  children: React.ReactNode;
  title?: string;
  description?: string;
  spinner?: React.ReactNode;
  className?: string;
}

const LoadingScreen = React.forwardRef<HTMLDivElement, LoadingScreenProps>(
  ({
    isLoading,
    children,
    title = 'Loading',
    description,
    spinner,
    className,
    ...props
  }, ref) => {
    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            'min-h-screen flex flex-col items-center justify-center bg-gray-50',
            className
          )}
          {...props}
        >
          {spinner || <LoadingSpinner size="xl" />}
          <h2 className="mt-6 text-lg font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
              {description}
            </p>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

LoadingScreen.displayName = 'LoadingScreen';

export {
  LoadingSpinner,
  LoadingOverlay,
  LoadingButton,
  LoadingCard,
  LoadingList,
  LoadingScreen,
};

export type {
  LoadingSpinnerProps,
  LoadingOverlayProps,
  LoadingButtonProps,
  LoadingCardProps,
  LoadingListProps,
  LoadingScreenProps,
}; 