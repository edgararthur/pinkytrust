'use client';

import React from 'react';
import { cn } from '@/utils';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  className?: string;
}

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
  error?: string;
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface FormErrorProps {
  error?: string;
  className?: string;
}

interface FormSuccessProps {
  message?: string;
  className?: string;
}

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function Form({ onSubmit, children, className, ...props }: FormProps) {
  return (
    <form 
      onSubmit={onSubmit} 
      className={cn('space-y-4', className)}
      {...props}
    >
      {children}
    </form>
  );
}

export function FormField({ children, className, error }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
      {error && <FormError error={error} />}
    </div>
  );
}

export function FormLabel({ required, children, className, ...props }: FormLabelProps) {
  return (
    <label 
      className={cn(
        'block text-sm font-medium text-gray-700',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null;
  
  return (
    <div className={cn('flex items-center gap-2 text-sm text-red-600', className)}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null;
  
  return (
    <div className={cn('flex items-center gap-2 text-sm text-green-600', className)}>
      <CheckCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function FormGroup({ children, className }: FormGroupProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {children}
    </div>
  );
}

// Form validation helpers
export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return null;
}

export function validateMinLength(value: string, minLength: number, fieldName: string): string | null {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): string | null {
  if (value && value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return null; // Phone is optional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return 'Please enter a valid phone number';
  }
  return null;
}

export function validateUrl(url: string): string | null {
  if (!url) return null; // URL is optional
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
} 