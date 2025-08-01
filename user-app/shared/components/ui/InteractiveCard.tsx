'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface InteractiveCardProps {
  title: string;
  description: string;
  image?: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  title,
  description,
  image,
  icon,
  href,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
  children,
  isLoading = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm hover:shadow-lg',
    glass: 'bg-white/80 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl',
    gradient: 'bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 shadow-sm hover:shadow-lg',
    elevated: 'bg-white shadow-lg hover:shadow-2xl border-0',
  };

  const CardContent = () => (
    <motion.div
      className={`
        ${sizeClasses[size]} ${variantClasses[variant]} ${className}
        rounded-2xl cursor-pointer transition-all duration-300
        transform hover:scale-[1.02] relative overflow-hidden
        group
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />

      {/* Image section */}
      {image && (
        <div className="relative mb-4 rounded-xl overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Icon section */}
      {icon && !image && (
        <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
          <motion.div
            animate={{ rotate: isHovered ? 10 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
        </div>
      )}

      {/* Content section */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-pink-600 transition-colors duration-300">
            {title}
          </h3>
          <motion.div
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors duration-300" />
          </motion.div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {description}
        </p>

        {children}

        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        )}
      </div>

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%', skewX: -45 }}
        animate={{ x: isHovered ? '200%' : '-100%' }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        <CardContent />
      </a>
    );
  }

  return (
    <div onClick={onClick}>
      <CardContent />
    </div>
  );
};

export default InteractiveCard; 