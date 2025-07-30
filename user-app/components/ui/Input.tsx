import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:ring-primary-500',
        error: 'border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 focus-visible:ring-green-500',
        warning: 'border-yellow-500 focus-visible:ring-yellow-500',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    size,
    type = 'text',
    label,
    error,
    success,
    warning,
    leftIcon,
    rightIcon,
    showPasswordToggle,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [internalType, setInternalType] = React.useState(type);

    React.useEffect(() => {
      if (type === 'password' && showPasswordToggle) {
        setInternalType(showPassword ? 'text' : 'password');
      } else {
        setInternalType(type);
      }
    }, [type, showPassword, showPasswordToggle]);

    // Determine variant based on validation states
    let inputVariant = variant;
    if (error) inputVariant = 'error';
    else if (success) inputVariant = 'success';
    else if (warning) inputVariant = 'warning';

    const hasLeftIcon = leftIcon;
    const hasRightIcon = rightIcon || showPasswordToggle || error || success || warning;

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {hasLeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <input
            type={internalType}
            className={cn(
              inputVariants({ variant: inputVariant, size }),
              hasLeftIcon && 'pl-10',
              hasRightIcon && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          
          {hasRightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {error && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              {success && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {warning && (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              {showPasswordToggle && type === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
              {rightIcon && !error && !success && !warning && (
                <span className="text-gray-500">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        
        {(error || success || warning) && (
          <div className="mt-1 flex items-center space-x-1">
            {error && (
              <>
                <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </>
            )}
            {success && (
              <>
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                <p className="text-xs text-green-600">{success}</p>
              </>
            )}
            {warning && (
              <>
                <AlertCircle className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                <p className="text-xs text-yellow-600">{warning}</p>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants }; 