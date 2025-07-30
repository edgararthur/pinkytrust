import React from 'react';
import { cn } from '@/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700',
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Skeleton variants for common use cases
const SkeletonCard = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('p-4 space-y-4', className)} {...props}>
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

const SkeletonText = ({ 
  lines = 3, 
  className, 
  ...props 
}: SkeletonProps & { lines?: number }) => (
  <div className={cn('space-y-2', className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn(
          'h-4',
          i === lines - 1 ? 'w-2/3' : 'w-full'
        )}
      />
    ))}
  </div>
);

const SkeletonAvatar = ({ 
  size = 'md', 
  className, 
  ...props 
}: SkeletonProps & { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <Skeleton
      className={cn(
        'rounded-full',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};

const SkeletonButton = ({ 
  variant = 'primary',
  size = 'md',
  className, 
  ...props 
}: SkeletonProps & { 
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-6',
  };

  return (
    <Skeleton
      className={cn(
        'rounded-xl',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};

const SkeletonImage = ({ 
  aspectRatio = 'video',
  className, 
  ...props 
}: SkeletonProps & { aspectRatio?: 'square' | 'video' | 'photo' | 'wide' }) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-photo',
    wide: 'aspect-wide',
  };

  return (
    <Skeleton
      className={cn(
        'w-full rounded-lg',
        aspectClasses[aspectRatio],
        className
      )}
      {...props}
    />
  );
};

const SkeletonList = ({ 
  items = 5, 
  showAvatar = true,
  className, 
  ...props 
}: SkeletonProps & { items?: number; showAvatar?: boolean }) => (
  <div className={cn('space-y-4', className)} {...props}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        {showAvatar && <SkeletonAvatar />}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const SkeletonTable = ({ 
  rows = 5, 
  columns = 4,
  className, 
  ...props 
}: SkeletonProps & { rows?: number; columns?: number }) => (
  <div className={cn('space-y-4', className)} {...props}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
    </div>
    
    {/* Rows */}
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const SkeletonStats = ({ 
  stats = 4,
  className, 
  ...props 
}: SkeletonProps & { stats?: number }) => (
  <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)} {...props}>
    {Array.from({ length: stats }).map((_, i) => (
      <div key={i} className="p-4 rounded-xl border border-gray-200 space-y-2">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </div>
);

const SkeletonChart = ({ 
  type = 'bar',
  className, 
  ...props 
}: SkeletonProps & { type?: 'bar' | 'line' | 'pie' }) => {
  if (type === 'pie') {
    return (
      <div className={cn('flex items-center justify-center p-8', className)} {...props}>
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4 p-4', className)} {...props}>
      <div className="flex items-end justify-between h-32 space-x-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-8" />
        ))}
      </div>
    </div>
  );
};

const SkeletonPost = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('p-6 space-y-4', className)} {...props}>
    {/* Header */}
    <div className="flex items-center space-x-3">
      <SkeletonAvatar />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    
    {/* Content */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    
    {/* Image */}
    <SkeletonImage className="rounded-lg" />
    
    {/* Actions */}
    <div className="flex items-center space-x-4">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

const SkeletonEvent = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('p-4 space-y-4', className)} {...props}>
    <SkeletonImage aspectRatio="video" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
    <SkeletonButton className="w-full" />
  </div>
);

const SkeletonProfile = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('p-6 space-y-6', className)} {...props}>
    {/* Cover Image */}
    <SkeletonImage aspectRatio="wide" />
    
    {/* Profile Info */}
    <div className="flex items-center space-x-4 -mt-8 relative">
      <SkeletonAvatar size="xl" className="border-4 border-white" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <SkeletonButton />
    </div>
    
    {/* Bio */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    
    {/* Stats */}
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center space-y-1">
          <Skeleton className="h-6 w-12 mx-auto" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

export {
  Skeleton,
  SkeletonCard,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonList,
  SkeletonTable,
  SkeletonStats,
  SkeletonChart,
  SkeletonPost,
  SkeletonEvent,
  SkeletonProfile,
}; 