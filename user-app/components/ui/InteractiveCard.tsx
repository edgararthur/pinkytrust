import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  hover?: boolean;
  tilt?: boolean;
  glow?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  badge?: {
    text: string;
    color?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  gradient?: {
    from: string;
    to: string;
    direction?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-tr' | 'to-tl' | 'to-br' | 'to-bl';
  };
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  tilt = false,
  glow = false,
  onClick,
  disabled = false,
  loading = false,
  badge,
  gradient,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !tilt) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white shadow-lg hover:shadow-xl border border-gray-100';
      case 'outlined':
        return 'bg-white border-2 border-gray-200 hover:border-gray-300';
      case 'glass':
        return 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg';
      default:
        return 'bg-white shadow-sm hover:shadow-md border border-gray-200';
    }
  };

  const getTiltTransform = () => {
    if (!tilt || !isHovered) return 'none';
    const maxTilt = 10;
    const rotateX = (mousePosition.y / 100) * maxTilt;
    const rotateY = (mousePosition.x / 100) * maxTilt;
    return `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const getBadgePosition = () => {
    if (!badge) return '';
    
    switch (badge.position) {
      case 'top-left':
        return 'top-3 left-3';
      case 'top-right':
        return 'top-3 right-3';
      case 'bottom-left':
        return 'bottom-3 left-3';
      case 'bottom-right':
        return 'bottom-3 right-3';
      default:
        return 'top-3 right-3';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative rounded-2xl transition-all duration-300 overflow-hidden group',
        getVariantStyles(),
        hover && 'hover:scale-[1.02] cursor-pointer',
        glow && isHovered && 'shadow-2xl shadow-primary-500/20',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        transform: getTiltTransform(),
        background: gradient 
          ? `linear-gradient(${gradient.direction || 'to-r'}, ${gradient.from}, ${gradient.to})`
          : undefined,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={!disabled && !loading ? onClick : undefined}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={onClick && !disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient overlay for hover effect */}
      {hover && (
        <div className={cn(
          'absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        )} />
      )}

      {/* Shine effect */}
      {hover && (
        <div className={cn(
          'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent',
          '-translate-x-full group-hover:translate-x-full transition-transform duration-1000'
        )} />
      )}

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge */}
      {badge && (
        <div className={cn(
          'absolute z-10 px-2 py-1 rounded-full text-xs font-medium',
          getBadgePosition(),
          badge.color || 'bg-primary-600 text-white'
        )}>
          {badge.text}
        </div>
      )}

      {/* Content */}
      <div className="relative z-0">
        {children}
      </div>

      {/* Ripple effect */}
      {onClick && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-current opacity-0 group-active:opacity-10 transition-opacity duration-150" />
        </div>
      )}
    </motion.div>
  );
};

export default InteractiveCard; 