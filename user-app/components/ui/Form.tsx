'use client';

import React, { forwardRef, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

// Form Field Wrapper
interface FormFieldProps {
  children: ReactNode;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  description,
  error,
  required,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}

      {children}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-red-600"
          >
            <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Input Component
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  success?: boolean;
  icon?: React.ComponentType<any>;
  rightIcon?: React.ComponentType<any>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'minimal';
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    description,
    error,
    success,
    icon: Icon,
    rightIcon: RightIcon,
    size = 'md',
    variant = 'default',
    type = 'text',
    showPasswordToggle = false,
    className,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    const sizeClasses = {
      sm: 'h-9 text-sm px-3',
      md: 'h-11 text-base px-4',
      lg: 'h-13 text-lg px-5',
    };

    const variantClasses = {
      default: 'bg-white border border-gray-300 focus:border-primary-500 focus:ring-primary-500',
      filled: 'bg-gray-50 border border-transparent focus:bg-white focus:border-primary-500 focus:ring-primary-500',
      minimal: 'bg-transparent border-0 border-b-2 border-gray-300 focus:border-primary-500 rounded-none',
    };

    const inputClasses = cn(
      'w-full rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50',
      sizeClasses[size],
      variantClasses[variant],
      Icon && 'pl-10',
      (RightIcon || (type === 'password' && showPasswordToggle)) && 'pr-10',
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      success && 'border-green-500 focus:border-green-500 focus:ring-green-500',
      props.disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
      className
    );

    return (
      <FormField label={label} description={description} error={error}>
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Icon className={cn(
                'w-5 h-5',
                error ? 'text-red-500' : success ? 'text-green-500' : 'text-gray-400'
              )} />
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Right side icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {success && (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
            
            {type === 'password' && showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            )}
            
            {RightIcon && (
              <RightIcon className={cn(
                'w-5 h-5',
                error ? 'text-red-500' : success ? 'text-green-500' : 'text-gray-400'
              )} />
            )}
          </div>
        </div>
      </FormField>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    label,
    description,
    error,
    success,
    resize = 'vertical',
    className,
    ...props
  }, ref) => {
    const textareaClasses = cn(
      'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200',
      resize === 'none' && 'resize-none',
      resize === 'vertical' && 'resize-y',
      resize === 'horizontal' && 'resize-x',
      resize === 'both' && 'resize',
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      success && 'border-green-500 focus:border-green-500 focus:ring-green-500',
      props.disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
      className
    );

    return (
      <FormField label={label} description={description} error={error}>
        <textarea
          ref={ref}
          className={textareaClasses}
          {...props}
        />
      </FormField>
    );
  }
);

Textarea.displayName = 'Textarea';

// Select Component
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  success?: boolean;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    label,
    description,
    error,
    success,
    options,
    placeholder,
    size = 'md',
    className,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'h-9 text-sm px-3',
      md: 'h-11 text-base px-4',
      lg: 'h-13 text-lg px-5',
    };

    const selectClasses = cn(
      'w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white appearance-none',
      sizeClasses[size],
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      success && 'border-green-500 focus:border-green-500 focus:ring-green-500',
      props.disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
      className
    );

    return (
      <FormField label={label} description={description} error={error}>
        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </FormField>
    );
  }
);

Select.displayName = 'Select';

// Checkbox Component
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    label,
    description,
    error,
    size = 'md',
    className,
    children,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const checkboxClasses = cn(
      'rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2 transition-all duration-200',
      sizeClasses[size],
      error && 'border-red-500',
      className
    );

    return (
      <FormField error={error}>
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            className={checkboxClasses}
            {...props}
          />
          
          {(label || children) && (
            <div className="flex-1">
              {label && (
                <label className="text-sm font-medium text-gray-700">
                  {label}
                </label>
              )}
              {children}
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          )}
        </div>
      </FormField>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Radio Group Component
interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  description?: string;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  description,
  error,
  orientation = 'vertical',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <FormField label={label} description={description} error={error}>
      <div className={cn(
        'space-y-3',
        orientation === 'horizontal' && 'flex flex-wrap gap-6 space-y-0'
      )}>
        {options.map((option) => (
          <div key={option.value} className="flex items-start gap-3">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={option.disabled}
              className={cn(
                'border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2 transition-all duration-200',
                sizeClasses[size],
                error && 'border-red-500'
              )}
            />
            
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                {option.label}
              </label>
              {option.description && (
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </FormField>
  );
};

export default {
  FormField,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
};
