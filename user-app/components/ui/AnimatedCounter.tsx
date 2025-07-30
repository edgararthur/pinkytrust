import React, { useEffect, useState } from 'react';
import { cn } from '@/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
  separator?: string;
  onComplete?: () => void;
}

const AnimatedCounter = React.forwardRef<HTMLSpanElement, AnimatedCounterProps>(
  ({
    value,
    duration = 2000,
    prefix = '',
    suffix = '',
    className,
    decimals = 0,
    separator = ',',
    onComplete,
    ...props
  }, ref) => {
    const [count, setCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      setIsAnimating(true);
      const startTime = Date.now();
      const startValue = count;
      const difference = value - startValue;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + difference * easeOut;
        
        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(value);
          setIsAnimating(false);
          onComplete?.();
        }
      };

      requestAnimationFrame(animate);
    }, [value, duration, onComplete]);

    const formatNumber = (num: number) => {
      const fixed = num.toFixed(decimals);
      const [integer, decimal] = fixed.split('.');
      
      // Add thousand separators
      const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      
      return decimals > 0 ? `${formattedInteger}.${decimal}` : formattedInteger;
    };

    return (
      <span
        ref={ref}
        className={cn(
          'tabular-nums',
          isAnimating && 'animate-pulse',
          className
        )}
        {...props}
      >
        {prefix}
        {formatNumber(count)}
        {suffix}
      </span>
    );
  }
);

AnimatedCounter.displayName = 'AnimatedCounter';

// Animated progress bar component
interface AnimatedProgressProps {
  value: number;
  max?: number;
  duration?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  onComplete?: () => void;
}

const AnimatedProgress = React.forwardRef<HTMLDivElement, AnimatedProgressProps>(
  ({
    value,
    max = 100,
    duration = 1500,
    className,
    barClassName,
    showLabel = false,
    label,
    size = 'md',
    variant = 'default',
    onComplete,
    ...props
  }, ref) => {
    const [progress, setProgress] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const percentage = Math.min((value / max) * 100, 100);

    useEffect(() => {
      setIsAnimating(true);
      const startTime = Date.now();
      const startValue = progress;
      const difference = percentage - startValue;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const animationProgress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - animationProgress, 3);
        const currentValue = startValue + difference * easeOut;
        
        setProgress(currentValue);

        if (animationProgress < 1) {
          requestAnimationFrame(animate);
        } else {
          setProgress(percentage);
          setIsAnimating(false);
          onComplete?.();
        }
      };

      requestAnimationFrame(animate);
    }, [percentage, duration, onComplete]);

    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };

    const variantClasses = {
      default: 'bg-primary-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      error: 'bg-error-600',
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {label || 'Progress'}
            </span>
            <span className="text-sm text-gray-500">
              <AnimatedCounter value={value} suffix={`/${max}`} />
            </span>
          </div>
        )}
        
        <div className={cn(
          'bg-gray-200 rounded-full overflow-hidden',
          sizeClasses[size]
        )}>
          <div
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              variantClasses[variant],
              isAnimating && 'animate-pulse',
              barClassName
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }
);

AnimatedProgress.displayName = 'AnimatedProgress';

// Animated stat card component
interface AnimatedStatProps {
  title: string;
  value: number;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'minimal';
}

const AnimatedStat = React.forwardRef<HTMLDivElement, AnimatedStatProps>(
  ({
    title,
    value,
    previousValue,
    prefix = '',
    suffix = '',
    icon,
    trend,
    trendValue,
    className,
    size = 'md',
    variant = 'default',
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }, []);

    const sizeClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const titleSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    const valueSizeClasses = {
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-3xl',
    };

    const variantClasses = {
      default: 'bg-white border border-gray-200 rounded-xl shadow-sm',
      card: 'bg-white border border-gray-100 rounded-xl shadow-md',
      minimal: 'bg-transparent',
    };

    const trendColors = {
      up: 'text-success-600',
      down: 'text-error-600',
      neutral: 'text-gray-500',
    };

    const trendIcons = {
      up: '↗',
      down: '↘',
      neutral: '→',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-500',
          variantClasses[variant],
          sizeClasses[size],
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className={cn(
              'font-medium text-gray-600 mb-1',
              titleSizeClasses[size]
            )}>
              {title}
            </div>
            
            <div className={cn(
              'font-bold text-gray-900',
              valueSizeClasses[size]
            )}>
              <AnimatedCounter
                value={isVisible ? value : 0}
                prefix={prefix}
                suffix={suffix}
                duration={1500}
              />
            </div>
            
            {trend && trendValue && (
              <div className={cn(
                'flex items-center mt-2 text-sm',
                trendColors[trend]
              )}>
                <span className="mr-1">{trendIcons[trend]}</span>
                <AnimatedCounter
                  value={isVisible ? Math.abs(trendValue) : 0}
                  suffix="%"
                  duration={1000}
                />
                <span className="ml-1 text-gray-500">
                  {previousValue && `from ${previousValue}`}
                </span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className="ml-4 text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

AnimatedStat.displayName = 'AnimatedStat';

export { AnimatedCounter, AnimatedProgress, AnimatedStat };
export type { AnimatedCounterProps, AnimatedProgressProps, AnimatedStatProps }; 