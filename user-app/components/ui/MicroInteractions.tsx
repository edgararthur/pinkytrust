import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils';

// Ripple Effect Component
interface RippleProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  disabled?: boolean;
}

const Ripple = React.forwardRef<HTMLDivElement, RippleProps>(
  ({ children, className, color = 'rgba(255, 255, 255, 0.3)', disabled = false, ...props }, ref) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const nextRippleId = useRef(0);

    const addRipple = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const newRipple = {
        x,
        y,
        id: nextRippleId.current++,
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    };

    return (
      <div
        ref={ref}
        className={cn('relative overflow-hidden cursor-pointer', className)}
        onMouseDown={addRipple}
        {...props}
      >
        {children}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none animate-ping"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: color,
              transform: 'translate(-50%, -50%)',
              animation: 'ripple 0.6s ease-out',
            }}
          />
        ))}
      </div>
    );
  }
);

Ripple.displayName = 'Ripple';

// Magnetic Effect Component
interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  disabled?: boolean;
}

const Magnetic = React.forwardRef<HTMLDivElement, MagneticProps>(
  ({ children, className, strength = 0.3, disabled = false, ...props }, ref) => {
    const [transform, setTransform] = useState('translate3d(0, 0, 0)');
    const elementRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !elementRef.current) return;
      
      const rect = elementRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      setTransform(`translate3d(${x * strength}px, ${y * strength}px, 0)`);
    };

    const handleMouseLeave = () => {
      setTransform('translate3d(0, 0, 0)');
    };

    return (
      <div
        ref={elementRef}
        className={cn('transition-transform duration-300 ease-out', className)}
        style={{ transform }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Magnetic.displayName = 'Magnetic';

// Tilt Effect Component
interface TiltProps {
  children: React.ReactNode;
  className?: string;
  tiltAngle?: number;
  disabled?: boolean;
}

const Tilt = React.forwardRef<HTMLDivElement, TiltProps>(
  ({ children, className, tiltAngle = 15, disabled = false, ...props }, ref) => {
    const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    const elementRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !elementRef.current) return;
      
      const rect = elementRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -tiltAngle;
      const rotateY = ((x - centerX) / centerX) * tiltAngle;
      
      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    };

    const handleMouseLeave = () => {
      setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    };

    return (
      <div
        ref={elementRef}
        className={cn('transition-transform duration-300 ease-out', className)}
        style={{ transform }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Tilt.displayName = 'Tilt';

// Bounce Effect Component
interface BounceProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  disabled?: boolean;
}

const Bounce = React.forwardRef<HTMLDivElement, BounceProps>(
  ({ children, className, scale = 1.05, disabled = false, ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseDown = () => {
      if (!disabled) setIsPressed(true);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const handleMouseLeave = () => {
      setIsPressed(false);
    };

    return (
      <div
        ref={ref}
        className={cn('transition-transform duration-150 ease-out cursor-pointer', className)}
        style={{
          transform: isPressed ? `scale(${scale})` : 'scale(1)',
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Bounce.displayName = 'Bounce';

// Glow Effect Component
interface GlowProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  intensity?: number;
  disabled?: boolean;
}

const Glow = React.forwardRef<HTMLDivElement, GlowProps>(
  ({ children, className, color = 'rgba(236, 72, 153, 0.5)', intensity = 20, disabled = false, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        ref={ref}
        className={cn('transition-all duration-300 ease-out', className)}
        style={{
          boxShadow: isHovered && !disabled ? `0 0 ${intensity}px ${color}` : 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Glow.displayName = 'Glow';

// Float Effect Component
interface FloatProps {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
  disabled?: boolean;
}

const Float = React.forwardRef<HTMLDivElement, FloatProps>(
  ({ children, className, distance = 10, duration = 3000, disabled = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('transition-transform duration-300 ease-out', className)}
        style={{
          animation: disabled ? 'none' : `float ${duration}ms ease-in-out infinite`,
          '--float-distance': `${distance}px`,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Float.displayName = 'Float';

// Shake Effect Component
interface ShakeProps {
  children: React.ReactNode;
  className?: string;
  trigger?: boolean;
  onComplete?: () => void;
}

const Shake = React.forwardRef<HTMLDivElement, ShakeProps>(
  ({ children, className, trigger = false, onComplete, ...props }, ref) => {
    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
      if (trigger) {
        setIsShaking(true);
        const timer = setTimeout(() => {
          setIsShaking(false);
          onComplete?.();
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [trigger, onComplete]);

    return (
      <div
        ref={ref}
        className={cn(
          'transition-transform duration-150',
          isShaking && 'animate-shake',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Shake.displayName = 'Shake';

// Pulse Effect Component
interface PulseProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
  disabled?: boolean;
}

const Pulse = React.forwardRef<HTMLDivElement, PulseProps>(
  ({ children, className, scale = 1.05, duration = 1000, disabled = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('transition-transform duration-300 ease-out', className)}
        style={{
          animation: disabled ? 'none' : `pulse ${duration}ms ease-in-out infinite`,
          '--pulse-scale': scale,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Pulse.displayName = 'Pulse';

// Morphing Button Component
interface MorphingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  morphTo?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const MorphingButton = React.forwardRef<HTMLButtonElement, MorphingButtonProps>(
  ({ 
    children, 
    morphTo, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    className,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-lg font-medium transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
          'transform active:scale-95',
          variantClasses[variant],
          sizeClasses[size],
          isPressed && 'scale-95',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        {...props}
      >
        <span className={cn(
          'relative z-10 flex items-center justify-center transition-all duration-300',
          isHovered && morphTo ? 'opacity-0 transform scale-75' : 'opacity-100 transform scale-100'
        )}>
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            children
          )}
        </span>
        
        {morphTo && (
          <span className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            isHovered ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-75'
          )}>
            {morphTo}
          </span>
        )}
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </button>
    );
  }
);

MorphingButton.displayName = 'MorphingButton';

// Export all components
export {
  Ripple,
  Magnetic,
  Tilt,
  Bounce,
  Glow,
  Float,
  Shake,
  Pulse,
  MorphingButton,
};

export type {
  RippleProps,
  MagneticProps,
  TiltProps,
  BounceProps,
  GlowProps,
  FloatProps,
  ShakeProps,
  PulseProps,
  MorphingButtonProps,
}; 