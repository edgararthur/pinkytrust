'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BookOpenIcon,
  PlusIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import { cn } from '@/utils';
import { Magnetic, Bounce } from '@/components/ui/MicroInteractions';

const navigation = [
  {
    name: 'Home',
    href: '/',
    icon: HomeIcon,
    solidIcon: HomeIconSolid,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    gradient: 'from-pink-500 to-pink-600',
    description: 'Dashboard & Overview',
  },
  {
    name: 'Events',
    href: '/events',
    icon: CalendarDaysIcon,
    solidIcon: CalendarDaysIconSolid,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    gradient: 'from-purple-500 to-purple-600',
    description: 'Health Events & Workshops',
  },
  {
    name: 'Assessment',
    href: '/assessment',
    icon: ShieldCheckIcon,
    solidIcon: ShieldCheckIconSolid,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    gradient: 'from-blue-500 to-blue-600',
    isCenter: true,
    label: 'Check',
    description: 'Health Self-Assessment',
    priority: true,
  },
  {
    name: 'Community',
    href: '/community',
    icon: UserGroupIcon,
    solidIcon: UserGroupIconSolid,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    gradient: 'from-green-500 to-green-600',
    description: 'Support & Connection',
  },
  {
    name: 'Learn',
    href: '/awareness',
    icon: BookOpenIcon,
    solidIcon: BookOpenIconSolid,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    gradient: 'from-orange-500 to-orange-600',
    description: 'Educational Resources',
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Find active index based on pathname
  useEffect(() => {
    const currentIndex = navigation.findIndex(item => item.href === pathname);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [pathname]);

  // Handle scroll to show/hide navigation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (index: number) => {
    setActiveIndex(index);
    
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <>
      {/* Backdrop blur when navigation is visible */}
      <div 
        className={cn(
          'fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm pointer-events-none transition-opacity duration-300 z-40',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
      />
      
      {/* Main Navigation */}
      <nav 
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out',
          isVisible ? 'translate-y-0' : 'translate-y-full'
        )}
        role="navigation"
        aria-label="Bottom navigation"
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg">
          <div className="max-w-screen-xl mx-auto px-4 safe-bottom">
            <div className="flex items-center justify-around py-2">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href;
                const IconComponent = isActive ? item.solidIcon : item.icon;
                
                return (
                  <Magnetic key={item.name} strength={0.1}>
                    <Link
                      href={item.href}
                      onClick={() => handleNavClick(index)}
                      className={cn(
                        'relative flex flex-col items-center justify-center min-w-0 flex-1 group transition-all duration-300',
                        item.isCenter ? 'mx-2' : 'mx-1'
                      )}
                      aria-label={`${item.name} - ${item.description}`}
                    >
                      {/* Center button special styling */}
                      {item.isCenter ? (
                        <Bounce scale={1.1}>
                          <div className={cn(
                            'relative p-4 rounded-2xl shadow-lg transition-all duration-300 transform',
                            isActive 
                              ? `bg-gradient-to-r ${item.gradient} text-white scale-110 shadow-xl` 
                              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                          )}>
                            <IconComponent className="h-6 w-6" />
                            
                            {/* Pulse effect for priority item */}
                            {item.priority && !isActive && (
                              <div className="absolute inset-0 rounded-2xl bg-blue-500 opacity-20 animate-ping" />
                            )}
                            
                            {/* Active indicator */}
                            {isActive && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                            )}
                          </div>
                        </Bounce>
                      ) : (
                        <div className={cn(
                          'relative p-3 rounded-xl transition-all duration-300',
                          isActive 
                            ? `${item.bgColor} ${item.color} scale-105` 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        )}>
                          <IconComponent className="h-5 w-5" />
                          
                          {/* Active indicator dot */}
                          {isActive && (
                            <div className={cn(
                              'absolute -top-1 -right-1 w-2 h-2 rounded-full',
                              item.color.replace('text-', 'bg-')
                            )} />
                          )}
                        </div>
                      )}
                      
                      {/* Label */}
                      <span className={cn(
                        'text-xs font-medium mt-1 transition-all duration-300',
                        isActive ? item.color : 'text-gray-500',
                        item.isCenter && 'mt-2'
                      )}>
                        {item.label || item.name}
                      </span>
                      
                      {/* Tooltip on hover for desktop */}
                      <div className={cn(
                        'absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 pointer-events-none transition-opacity duration-200 whitespace-nowrap',
                        'group-hover:opacity-100 hidden sm:block'
                      )}>
                        {item.description}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    </Link>
                  </Magnetic>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Active indicator line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent">
          <div 
            className={cn(
              'h-full transition-all duration-300 ease-out',
              `bg-gradient-to-r ${navigation[activeIndex]?.gradient || 'from-gray-400 to-gray-600'}`
            )}
            style={{
              width: `${100 / navigation.length}%`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
        </div>
      </nav>
      
      {/* Emergency Quick Action Button */}
      <div className={cn(
        'fixed bottom-20 right-4 z-40 transition-all duration-300',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      )}>
        <Magnetic strength={0.2}>
          <button
            className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            aria-label="Emergency help"
            onClick={() => {
              // Handle emergency action
              window.open('tel:911', '_self');
            }}
          >
            <HeartIconSolid className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" />
          </button>
        </Magnetic>
      </div>
      
      {/* Accessibility improvements */}
      <div className="sr-only" aria-live="polite">
        Current page: {navigation.find(item => item.href === pathname)?.name || 'Unknown'}
      </div>
    </>
  );
} 