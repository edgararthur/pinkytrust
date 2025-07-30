'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { NotificationService } from '@/lib/api/notifications';
import { Button } from '@/components/ui/Button';
import { NotificationCenter } from './NotificationCenter';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  
  const { user } = useAuth();

  // Load unread count
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      
      // Set up real-time subscription
      const subscription = NotificationService.subscribeToUserNotifications(
        user.id,
        (notification) => {
          setUnreadCount(prev => prev + 1);
          setHasNewNotification(true);
          
          // Reset animation after 3 seconds
          setTimeout(() => setHasNewNotification(false), 3000);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      if (user) {
        const count = await NotificationService.getUnreadCount(user.id);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleClick = () => {
    setIsOpen(true);
    setHasNewNotification(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Refresh unread count when closing
    loadUnreadCount();
  };

  if (!user) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={`relative p-2 ${className} ${hasNewNotification ? 'animate-pulse' : ''}`}
      >
        {hasNewNotification ? (
          <BellRing className="h-5 w-5 text-blue-600" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      <NotificationCenter
        isOpen={isOpen}
        onClose={handleClose}
      />
    </>
  );
}

export default NotificationBell; 