import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

interface SelectValueProps {
  children?: React.ReactNode;
  placeholder?: string;
}

export function Select({
  className = '',
  children,
  error,
  disabled,
  ...props
}: SelectProps) {
  const baseStyles = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm';
  const errorStyles = error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : '';
  const disabledStyles = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '';

  return (
    <select
      className={`${baseStyles} ${errorStyles} ${disabledStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </select>
  );
}

export function SelectTrigger({
  className = '',
  children,
  disabled,
  ...props
}: SelectTriggerProps) {
  const baseStyles = 'flex items-center justify-between w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500';
  const disabledStyles = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '';

  return (
    <button
      type="button"
      className={`${baseStyles} ${disabledStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 text-gray-400" />
    </button>
  );
}

export function SelectContent({
  className = '',
  children,
  ...props
}: SelectContentProps) {
  return (
    <div
      className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectItem({
  className = '',
  children,
  value,
  ...props
}: SelectItemProps) {
  return (
    <div
      className={`relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-pink-50 ${className}`}
      data-value={value}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectValue({ children, placeholder }: SelectValueProps) {
  return (
    <span className="block truncate">
      {children || <span className="text-gray-500">{placeholder}</span>}
    </span>
  );
} 