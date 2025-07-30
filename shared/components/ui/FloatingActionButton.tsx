'use client';

import { useState } from 'react';
import { 
  PlusIcon, 
  XMarkIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  QrCodeIcon,
  HeartIcon,
  DocumentPlusIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface FloatingAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  color: string;
  bgColor: string;
}

interface FloatingActionButtonProps {
  actions?: FloatingAction[];
  variant?: 'default' | 'user' | 'organiser' | 'municipal';
}

const defaultActions = {
  user: [
    {
      id: 'assessment',
      label: 'Quick Assessment',
      icon: HeartIcon,
      href: '/assessment',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      id: 'scan',
      label: 'QR Scanner',
      icon: QrCodeIcon,
      href: '/scanner',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'events',
      label: 'Find Events',
      icon: CalendarDaysIcon,
      href: '/events',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      id: 'community',
      label: 'Join Community',
      icon: UserGroupIcon,
      href: '/community',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ],
  organiser: [
    {
      id: 'event',
      label: 'Create Event',
      icon: CalendarDaysIcon,
      href: '/events/new',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'report',
      label: 'Submit Report',
      icon: DocumentPlusIcon,
      href: '/reports/new',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      id: 'volunteers',
      label: 'Invite Volunteers',
      icon: UserGroupIcon,
      href: '/volunteers/invite',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      id: 'photo',
      label: 'Event Photos',
      icon: CameraIcon,
      onClick: () => console.log('Open camera'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ],
  municipal: [
    {
      id: 'approve',
      label: 'Quick Approve',
      icon: DocumentPlusIcon,
      href: '/organisations',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'certificate',
      label: 'Issue Certificate',
      icon: DocumentPlusIcon,
      href: '/certificates',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      id: 'users',
      label: 'Add User',
      icon: UserGroupIcon,
      href: '/users',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ],
};

export default function FloatingActionButton({ 
  actions, 
  variant = 'default' 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const actionList = actions || defaultActions[variant] || [];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Action Items */}
      <div className={`absolute bottom-16 right-0 space-y-3 transition-all duration-500 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actionList.map((action, index) => (
          <div
            key={action.id}
            className="flex items-center space-x-3 animate-slide-in-right"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Label */}
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap opacity-0 animate-fade-in"
                 style={{ animationDelay: `${(index * 100) + 200}ms` }}>
              {action.label}
            </div>
            
            {/* Action Button */}
            {action.href ? (
              <Link href={action.href}>
                <ActionButton action={action} onClick={() => setIsOpen(false)} />
              </Link>
            ) : (
              <ActionButton 
                action={action} 
                onClick={() => {
                  action.onClick?.();
                  setIsOpen(false);
                }} 
              />
            )}
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={toggleMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-3xl group ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        {/* Background pulse effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full opacity-30 animate-ping ${
          isHovered ? 'opacity-50' : ''
        }`} />
        
        {/* Ripple effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full scale-0 group-hover:scale-100 opacity-20 transition-transform duration-500" />
        
        {/* Icon */}
        <div className="relative z-10">
          {isOpen ? (
            <XMarkIcon className="h-8 w-8 text-white transition-transform duration-300" />
          ) : (
            <PlusIcon className="h-8 w-8 text-white transition-transform duration-300 group-hover:rotate-90" />
          )}
        </div>
        
        {/* Floating particles */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }} />
            <div className="absolute top-4 left-3 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-3 right-4 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          </div>
        )}
      </button>

      {/* Background overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm opacity-0 animate-fade-in -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

function ActionButton({ action, onClick }: { action: FloatingAction; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 ${action.bgColor} rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl group border-2 border-white`}
    >
      <action.icon className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform duration-300`} />
      
      {/* Hover ripple */}
      <div className="absolute inset-0 bg-white rounded-full scale-0 group-hover:scale-100 opacity-20 transition-transform duration-300" />
    </button>
  );
} 