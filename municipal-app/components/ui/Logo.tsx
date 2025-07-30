'use client';

import React from 'react';
import { Heart, Shield } from 'lucide-react';
import Image from 'next/image';

interface LogoProps {
  variant?: 'login' | 'setup' | 'dashboard';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ 
  variant = 'login', 
  size = 'md', 
  showText = true, 
  className = '' 
}: LogoProps) {
  const getIcon = () => {
    switch (variant) {
      case 'setup':
        return Shield;
      case 'dashboard':
        return Heart;
      default:
        return Heart;
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'setup':
        return {
          gradient: 'from-purple-500 to-blue-600',
          textGradient: 'from-purple-600 to-blue-600',
          blur: 'from-purple-400 to-blue-600'
        };
      case 'dashboard':
        return {
          gradient: 'from-pink-500 to-red-600',
          textGradient: 'from-pink-600 to-red-600',
          blur: 'from-pink-400 to-red-600'
        };
      default:
        return {
          gradient: 'from-pink-500 to-purple-600',
          textGradient: 'from-pink-600 to-purple-600',
          blur: 'from-pink-400 to-purple-600'
        };
    }
  };

  const getSizes = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          icon: 'h-6 w-6',
          text: 'text-sm',
          subtext: 'text-xs'
        };
      case 'lg':
        return {
          container: 'p-5',
          icon: 'h-12 w-12',
          text: 'text-2xl',
          subtext: 'text-base'
        };
      default:
        return {
          container: 'p-4',
          icon: 'h-10 w-10',
          text: 'text-xl',
          subtext: 'text-sm'
        };
    }
  };

  const Icon = getIcon();
  const colors = getColors();
  const sizes = getSizes();

  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.blur} rounded-2xl blur-sm opacity-75`}></div>
        <div className={`relative bg-gradient-to-br ${colors.gradient} ${sizes.container} rounded-2xl shadow-lg`}>
          <Icon className={`${sizes.icon} text-white`} />
        </div>
      </div>
      {showText && (
        <div className="text-left">
          <div className={`${sizes.text} font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>
            GI-KACE
          </div>
          <div className={`${sizes.subtext} text-gray-600 font-medium`}>
            Healthcare Platform
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized logo components for different contexts
export function LoginLogo(props: Omit<LogoProps, 'variant'>) {
  return <Logo {...props} variant="login" />;
}

export function SetupLogo(props: Omit<LogoProps, 'variant'>) {
  return <Logo {...props} variant="setup" />;
}

export function DashboardLogo(props: Omit<LogoProps, 'variant'>) {
  return <Logo {...props} variant="dashboard" />;
}

// Actual Logo Component using the real logo images
export function ActualLogo({
  size = 'md',
  showText = true,
  className = '',
  logoType = 'gi-kace'
}: {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  logoType?: 'gi-kace' | 'pinky';
}) {
  const getSizes = () => {
    switch (size) {
      case 'sm':
        return {
          logo: 'w-12 h-12',
          text: 'text-sm',
          subtext: 'text-xs'
        };
      case 'lg':
        return {
          logo: 'w-20 h-20',
          text: 'text-2xl',
          subtext: 'text-base'
        };
      default:
        return {
          logo: 'w-16 h-16',
          text: 'text-xl',
          subtext: 'text-sm'
        };
    }
  };

  const getLogoInfo = () => {
    if (logoType === 'pinky') {
      return {
        src: '/images/logo.png',
        alt: 'PinkyTrust Logo',
        title: 'PinkyTrust',
        subtitle: 'Healthcare Platform'
      };
    }
    return {
      src: '/images/gi-kace-logo.jpeg',
      alt: 'GI-KACE Logo',
      title: 'GI-KACE',
      subtitle: 'Healthcare Platform'
    };
  };

  const sizes = getSizes();
  const logoInfo = getLogoInfo();

  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-white rounded-2xl blur-sm opacity-90 shadow-2xl"></div>
        <div className="relative bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-white/30">
          {/* Always show fallback icon as backup */}
          <div className="fallback-icon flex items-center justify-center">
            <Heart className={`${sizes.logo} text-pink-600`} />
          </div>
          {/* Try to load image on top */}
          <Image
            src={logoInfo.src}
            alt={logoInfo.alt}
            width={80}
            height={80}
            className={`${sizes.logo} object-contain rounded-lg absolute inset-0 m-auto`}
            unoptimized={true}
            onLoad={(e) => {
              // Hide fallback when image loads successfully
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
              if (fallback) {
                (fallback as HTMLElement).style.display = 'none';
              }
            }}
            onError={(e) => {
              // Keep fallback visible if image fails
              console.warn('Logo image failed to load, using fallback icon');
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>
      {showText && (
        <div className="text-left">
          <div className={`${sizes.text} font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent`}>
            {logoInfo.title}
          </div>
          <div className={`${sizes.subtext} text-gray-600 font-medium`}>
            {logoInfo.subtitle}
          </div>
        </div>
      )}
    </div>
  );
}



// Logo with medical background pattern and actual logo images
export function LogoWithBackground({
  children,
  variant = 'login'
}: {
  children: React.ReactNode;
  variant?: 'login' | 'setup' | 'success' | 'initialized';
}) {

  const getGradient = () => {
    const gradients = {
      login: 'from-pink-600/85 via-purple-700/75 to-blue-800/65',
      setup: 'from-purple-600/85 via-blue-700/75 to-indigo-800/65',
      success: 'from-green-600/85 via-emerald-700/75 to-teal-800/65',
      initialized: 'from-blue-600/85 via-indigo-700/75 to-purple-800/65'
    };
    return gradients[variant] || gradients.login;
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background with Medical Apparatus and Logo */}
      <div className="absolute inset-0 z-0">
        {/* Medical apparatus background pattern */}
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><pattern id="medical-bg" patternUnits="userSpaceOnUse" width="200" height="200"><rect width="200" height="200" fill="none"/><g opacity="0.3"><rect x="20" y="20" width="40" height="30" rx="5" fill="%23ffffff"/><circle cx="80" cy="35" r="15" fill="%23ffffff"/><rect x="120" y="25" width="35" height="20" rx="3" fill="%23ffffff"/><path d="M30 80h120v60h-120z" fill="%23ffffff" opacity="0.4"/><circle cx="40" cy="160" r="20" fill="%23ffffff" opacity="0.5"/><rect x="80" y="150" width="60" height="15" rx="7" fill="%23ffffff" opacity="0.4"/><path d="M140 80 L170 50 M140 50 L170 80" stroke="%23ffffff" stroke-width="4" opacity="0.6"/><rect x="160" y="140" width="25" height="40" rx="3" fill="%23ffffff" opacity="0.5"/></g></pattern></defs><rect width="100%" height="100%" fill="url(%23medical-bg)"/></svg>')`
          }}
        />

        {/* GI-KACE Logo as background element - using CSS background for better fallback */}
        <div
          className="absolute top-10 left-10 w-32 h-32 opacity-5 bg-contain bg-no-repeat bg-center"
          style={{
            backgroundImage: `url('/images/gi-kace-logo.jpeg'), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ec4899"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>')`
          }}
        />

        <div
          className="absolute bottom-10 right-10 w-24 h-24 opacity-5 bg-contain bg-no-repeat bg-center"
          style={{
            backgroundImage: `url('/images/gi-kace-logo.jpeg'), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ec4899"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>')`
          }}
        />

        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()}`} />
        <div className="absolute inset-0 bg-black/15" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        {children}
      </div>
    </div>
  );
}
