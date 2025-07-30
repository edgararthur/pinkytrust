'use client';

import React, { useState, useEffect, useRef, forwardRef, ReactNode } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/utils';
import { 
  HeartIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  ClockIcon,
  BellIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid, 
  StarIcon as StarSolid,
  ShieldCheckIcon as ShieldCheckSolid,
  CheckCircleIcon as CheckCircleSolid,
} from '@heroicons/react/24/solid';

// Enhanced Button Component with Emotional Design
interface EnhancedButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'success' | 'warm' | 'cool';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentType<any>;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  glow?: boolean;
  magnetic?: boolean;
  ripple?: boolean;
  haptic?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  onClick,
  href,
  fullWidth = false,
  rounded = 'lg',
  glow = false,
  magnetic = false,
  ripple = true,
  haptic = false,
  type = 'button',
  ...props
}, ref) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { stiffness: 100, damping: 30 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!magnetic) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set((e.clientX - centerX) * 0.1);
    mouseY.set((e.clientY - centerY) * 0.1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) return;
    
    // Haptic feedback
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Ripple effect
    if (ripple) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const rippleX = e.clientX - rect.left;
        const rippleY = e.clientY - rect.top;
        const newRipple = { id: Date.now(), x: rippleX, y: rippleY };
        
        setRipples(prev => [...prev, newRipple]);
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
      }
    }
    
    onClick?.(e);
  };

  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 border-transparent',
    secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg shadow-secondary-500/25 hover:shadow-xl hover:shadow-secondary-500/40 border-transparent',
    tertiary: 'bg-white text-gray-900 shadow-lg border-gray-200 hover:bg-gray-50 hover:shadow-xl',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border-transparent',
    danger: 'bg-gradient-to-r from-error-500 to-error-600 text-white shadow-lg shadow-error-500/25 hover:shadow-xl hover:shadow-error-500/40 border-transparent',
    success: 'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg shadow-success-500/25 hover:shadow-xl hover:shadow-success-500/40 border-transparent',
    warm: 'bg-gradient-to-r from-support-warm-400 to-support-warm-500 text-white shadow-lg shadow-support-warm-500/25 hover:shadow-xl hover:shadow-support-warm-500/40 border-transparent',
    cool: 'bg-gradient-to-r from-accent-mint-400 to-accent-mint-500 text-white shadow-lg shadow-accent-mint-500/25 hover:shadow-xl hover:shadow-accent-mint-500/40 border-transparent',
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs font-medium',
    sm: 'px-3 py-2 text-sm font-medium',
    md: 'px-4 py-2.5 text-sm font-medium',
    lg: 'px-6 py-3 text-base font-medium',
    xl: 'px-8 py-4 text-lg font-medium',
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  };

  const buttonClasses = cn(
    'relative overflow-hidden inline-flex items-center justify-center',
    'font-medium transition-all duration-300 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    'active:scale-95 transform-gpu',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    variants[variant],
    sizes[size],
    roundedClasses[rounded],
    fullWidth && 'w-full',
    glow && 'animate-glow',
    magnetic && 'hover:scale-105',
    'touch-manipulation tap-highlight-transparent',
    className
  );

  const content = (
    <motion.button
      ref={buttonRef}
      type={type}
      disabled={disabled || loading}
      className={buttonClasses}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{ x, y }}
      whileHover={{ scale: magnetic ? 1.05 : 1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {Icon && iconPosition === 'left' && (
              <Icon className="w-4 h-4 flex-shrink-0" />
            )}
            {children}
            {Icon && iconPosition === 'right' && (
              <Icon className="w-4 h-4 flex-shrink-0" />
            )}
          </>
        )}
      </span>

      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-inherit opacity-0 bg-gradient-to-r from-primary-400 to-primary-600"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  );

  return content;
});

EnhancedButton.displayName = 'EnhancedButton';

// Enhanced Card Component with Tilt and Parallax Effects
interface EnhancedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  tilt?: boolean;
  glow?: boolean;
  parallax?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: boolean;
  gradient?: boolean;
  interactive?: boolean;
}

export const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(({
  children,
  className,
  hover = true,
  tilt = false,
  glow = false,
  parallax = false,
  onClick,
  padding = 'md',
  rounded = 'lg',
  shadow = 'md',
  border = true,
  gradient = false,
  interactive = false,
  ...props
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!tilt) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };

  const cardClasses = cn(
    'relative transition-all duration-300 ease-out',
    'transform-gpu',
    gradient ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-white',
    border && 'border border-gray-200',
    paddingClasses[padding],
    roundedClasses[rounded],
    shadowClasses[shadow],
    hover && 'hover:shadow-xl hover:-translate-y-1',
    glow && 'hover:shadow-primary-500/20',
    interactive && 'cursor-pointer',
    className
  );

  return (
    <motion.div
      ref={cardRef}
      className={cardClasses}
      style={tilt ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : {}}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      whileTap={interactive ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {/* Parallax background */}
      {parallax && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 opacity-50 rounded-inherit"
          style={{
            x: useTransform(mouseX, [-300, 300], [-10, 10]),
            y: useTransform(mouseY, [-300, 300], [-10, 10]),
          }}
        />
      )}
      
      {/* Glow effect */}
      {glow && isHovered && (
        <motion.div
          className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-inherit opacity-20 blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
});

EnhancedCard.displayName = 'EnhancedCard';

// Enhanced Input Component with Advanced Validation
interface EnhancedInputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentType<any>;
  iconPosition?: 'left' | 'right';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  variant?: 'default' | 'filled' | 'outlined' | 'minimal';
  showPasswordToggle?: boolean;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  hint,
  required = false,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  size = 'md',
  rounded = 'lg',
  variant = 'default',
  showPasswordToggle = false,
  maxLength,
  minLength,
  min,
  max,
  pattern,
  autoComplete,
  autoFocus = false,
  readOnly = false,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [characterCount, setCharacterCount] = useState(value?.length || 0);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  useEffect(() => {
    setCharacterCount(value?.length || 0);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCharacterCount(newValue.length);
    onChange?.(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const variants = {
    default: 'bg-white border-gray-300 focus:border-primary-500 focus:ring-primary-500',
    filled: 'bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-primary-500',
    outlined: 'bg-transparent border-2 border-gray-300 focus:border-primary-500 focus:ring-0',
    minimal: 'bg-transparent border-0 border-b-2 border-gray-300 focus:border-primary-500 focus:ring-0 rounded-none',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  const inputClasses = cn(
    'w-full transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-gray-400',
    variants[variant],
    sizes[size],
    roundedClasses[rounded],
    error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
    success && 'border-success-500 focus:border-success-500 focus:ring-success-500',
    Icon && iconPosition === 'left' && 'pl-10',
    Icon && iconPosition === 'right' && 'pr-10',
    (showPasswordToggle || loading) && 'pr-10',
    className
  );

  const actualType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <motion.label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium mb-2 transition-colors duration-200',
            error ? 'text-error-600' : success ? 'text-success-600' : 'text-gray-700',
            required && "after:content-['*'] after:text-error-500 after:ml-1"
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* Input field */}
        <motion.input
          ref={inputRef}
          id={inputId}
          name={name}
          type={actualType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          minLength={minLength}
          min={min}
          max={max}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={inputClasses}
          aria-label={ariaLabel}
          aria-describedby={cn(
            error && errorId,
            hint && hintId,
            ariaDescribedBy
          )}
          aria-invalid={error ? 'true' : 'false'}
          whileFocus={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          {...props}
        />

        {/* Right icon/loading/password toggle */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {loading && (
            <motion.div
              className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
          
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          )}
          
          {Icon && iconPosition === 'right' && !loading && (
            <div className="text-gray-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Focus indicator */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-inherit border-2 border-primary-500 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Character count */}
      {maxLength && (
        <div className="flex justify-end mt-1">
          <span className={cn(
            'text-xs transition-colors duration-200',
            characterCount > maxLength * 0.8 ? 'text-warning-600' : 'text-gray-500',
            characterCount >= maxLength && 'text-error-600'
          )}>
            {characterCount}/{maxLength}
          </span>
        </div>
      )}

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            id={errorId}
            className="flex items-center gap-1 mt-2 text-sm text-error-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success message */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="flex items-center gap-1 mt-2 text-sm text-success-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {hint && !error && !success && (
        <div id={hintId} className="mt-2 text-sm text-gray-500">
          {hint}
        </div>
      )}
    </div>
  );
});

EnhancedInput.displayName = 'EnhancedInput';

// Enhanced Progress Component with Animations
interface EnhancedProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  showValue?: boolean;
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
  striped?: boolean;
  glow?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const EnhancedProgress = forwardRef<HTMLDivElement, EnhancedProgressProps>(({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showValue = false,
  showLabel = false,
  label,
  className,
  animated = true,
  striped = false,
  glow = false,
  rounded = 'full',
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isComplete = percentage >= 100;

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const variants = {
    default: 'bg-gradient-to-r from-primary-500 to-primary-600',
    success: 'bg-gradient-to-r from-success-500 to-success-600',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600',
    error: 'bg-gradient-to-r from-error-500 to-error-600',
    gradient: 'bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-mint-500',
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const containerClasses = cn(
    'relative w-full bg-gray-200 overflow-hidden',
    sizes[size],
    roundedClasses[rounded],
    className
  );

  const barClasses = cn(
    'h-full transition-all duration-500 ease-out',
    variants[variant],
    striped && 'bg-stripes',
    animated && 'animate-pulse-soft',
    glow && 'shadow-lg',
    roundedClasses[rounded]
  );

  return (
    <div className="w-full">
      {/* Label and value */}
      {(showLabel || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {showLabel && label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-500">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div ref={ref} className={containerClasses} {...props}>
        <motion.div
          className={barClasses}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Glow effect */}
          {glow && (
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-inherit"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Completion celebration */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                className="absolute inset-0 bg-white/30 rounded-inherit"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
});

EnhancedProgress.displayName = 'EnhancedProgress';

// Enhanced Badge Component with Animations
interface EnhancedBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  pulse?: boolean;
  glow?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ComponentType<any>;
  dot?: boolean;
}

export const EnhancedBadge = forwardRef<HTMLSpanElement, EnhancedBadgeProps>(({
  children,
  variant = 'default',
  size = 'sm',
  rounded = 'full',
  className,
  pulse = false,
  glow = false,
  removable = false,
  onRemove,
  icon: Icon,
  dot = false,
  ...props
}, ref) => {
  const variants = {
    default: 'bg-primary-100 text-primary-800 border-primary-200',
    primary: 'bg-primary-500 text-white border-primary-600',
    secondary: 'bg-secondary-500 text-white border-secondary-600',
    success: 'bg-success-100 text-success-800 border-success-200',
    warning: 'bg-warning-100 text-warning-800 border-warning-200',
    error: 'bg-error-100 text-error-800 border-error-200',
    info: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm',
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const badgeClasses = cn(
    'inline-flex items-center gap-1 font-medium border transition-all duration-200',
    variants[variant],
    sizes[size],
    roundedClasses[rounded],
    pulse && 'animate-pulse-soft',
    glow && 'shadow-lg',
    className
  );

  return (
    <motion.span
      ref={ref}
      className={badgeClasses}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {/* Dot indicator */}
      {dot && (
        <span className={cn(
          'w-2 h-2 rounded-full',
          variant === 'default' && 'bg-primary-500',
          variant === 'success' && 'bg-success-500',
          variant === 'warning' && 'bg-warning-500',
          variant === 'error' && 'bg-error-500',
          variant === 'info' && 'bg-secondary-500',
          variant === 'neutral' && 'bg-gray-500'
        )} />
      )}

      {/* Icon */}
      {Icon && <Icon className="w-3 h-3" />}

      {/* Content */}
      {children}

      {/* Remove button */}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors duration-200"
          aria-label="Remove"
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      )}
    </motion.span>
  );
});

EnhancedBadge.displayName = 'EnhancedBadge';

// Enhanced Loading Component with Multiple Animations
interface EnhancedLoadingProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'heart' | 'wave' | 'logo';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
  text?: string;
  showLogo?: boolean;
}

export const EnhancedLoading = forwardRef<HTMLDivElement, EnhancedLoadingProps>(({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  className,
  text,
  showLogo = false,
  ...props
}, ref) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colors = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
  };

  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <motion.div
            className={cn('border-2 border-current border-t-transparent rounded-full', sizes[size], colors[color])}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn('rounded-full bg-current', 
                  size === 'xs' ? 'w-1 h-1' : 
                  size === 'sm' ? 'w-1.5 h-1.5' : 
                  size === 'md' ? 'w-2 h-2' : 
                  size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3',
                  colors[color]
                )}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={cn('rounded-full bg-current', sizes[size], colors[color])}
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        );

      case 'bars':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={cn('bg-current', 
                  size === 'xs' ? 'w-0.5 h-3' : 
                  size === 'sm' ? 'w-0.5 h-4' : 
                  size === 'md' ? 'w-1 h-6' : 
                  size === 'lg' ? 'w-1 h-8' : 'w-1.5 h-12',
                  colors[color]
                )}
                animate={{ scaleY: [1, 2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        );

      case 'heart':
        return (
          <motion.div
            className={cn(colors[color])}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <HeartSolid className={sizes[size]} />
          </motion.div>
        );

      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={cn('rounded-full bg-current', 
                  size === 'xs' ? 'w-1 h-1' : 
                  size === 'sm' ? 'w-1.5 h-1.5' : 
                  size === 'md' ? 'w-2 h-2' : 
                  size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3',
                  colors[color]
                )}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        );

      case 'logo':
        return (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="relative"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Image
                src="/images/logo.png"
                alt="PinkyTrust Logo"
                width={size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 80}
                height={size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 80}
                className="rounded-xl"
              />

              {/* Animated ring around logo */}
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-primary-300"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-primary-200"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </motion.div>

            {/* App name with typing effect */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-lg font-bold text-primary-600">PinkyTrust</h3>
              <p className="text-xs text-gray-500">Breast Health Companion</p>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div ref={ref} className={cn('flex flex-col items-center gap-3', className)} {...props}>
      {/* Show logo by default or when showLogo is true */}
      {(showLogo || type === 'logo') ? (
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image
              src="/images/logo.png"
              alt="PinkyTrust Logo"
              width={size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 80}
              height={size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 80}
              className="rounded-xl"
            />

            {/* Animated ring around logo */}
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-primary-300"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-primary-200"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </motion.div>

          {/* App name */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-bold text-primary-600">PinkyTrust</h3>
            <p className="text-xs text-gray-500">Breast Health Companion</p>
          </motion.div>

          {/* Loading animation below logo */}
          <div className="mt-2">
            {renderLoader()}
          </div>

          {/* Loading text */}
          {text && (
            <motion.p
              className="text-sm text-gray-600 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {text}
            </motion.p>
          )}

          {/* Company attribution */}
          <motion.div
            className="flex items-center gap-2 mt-4 text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span>Developed by</span>
            <div className="flex items-center gap-1">
              <Image
                src="/images/gi-kace-logo.jpeg"
                alt="GI-KACE Logo"
                width={12}
                height={12}
                className="rounded"
              />
              <span className="font-medium">GI-KACE</span>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          {renderLoader()}
          {text && (
            <motion.p
              className="text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {text}
            </motion.p>
          )}
        </>
      )}
    </div>
  );
});

EnhancedLoading.displayName = 'EnhancedLoading';

// Enhanced Tooltip Component
interface EnhancedTooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  maxWidth?: string;
}

export const EnhancedTooltip = forwardRef<HTMLDivElement, EnhancedTooltipProps>(({
  content,
  children,
  position = 'top',
  delay = 300,
  className,
  maxWidth = 'max-w-xs',
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800',
  };

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      {...props}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              'absolute z-tooltip px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg pointer-events-none',
              maxWidth,
              positions[position],
              className
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {content}
            
            {/* Arrow */}
            <div className={cn('absolute w-0 h-0 border-4', arrows[position])} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

EnhancedTooltip.displayName = 'EnhancedTooltip';

// Components are already exported above