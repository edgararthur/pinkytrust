'use client';

import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'reminder';
  time: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Monthly Screening Reminder',
    message: 'It\'s time for your monthly self-examination. Take care of your health!',
    type: 'reminder',
    time: '2 hours ago',
    read: false,
    action: {
      label: 'Start Assessment',
      href: '/assessment',
    },
  },
  {
    id: '2',
    title: 'New Community Post',
    message: 'Sarah shared her screening experience in the support group.',
    type: 'info',
    time: '4 hours ago',
    read: false,
    action: {
      label: 'View Post',
      href: '/community',
    },
  },
  {
    id: '3',
    title: 'Event Registration Confirmed',
    message: 'You\'re registered for the Breast Cancer Awareness Walk on Feb 15.',
    type: 'success',
    time: '1 day ago',
    read: true,
  },
  {
    id: '4',
    title: 'Health Tip',
    message: 'Regular exercise can reduce breast cancer risk by up to 20%.',
    type: 'info',
    time: '2 days ago',
    read: true,
  },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'reminder':
        return <HeartIcon className="h-5 w-5 text-pink-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'reminder':
        return 'bg-pink-50 border-pink-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110 group"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="h-6 w-6 text-white animate-pulse" />
        ) : (
          <BellIcon className="h-6 w-6 text-white group-hover:animate-wiggle" />
        )}
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in-down">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-pink-500 to-purple-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-white/80 hover:text-white transition-colors underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-all duration-300 hover:bg-gray-50 group animate-fade-in ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.time}
                              </p>
                              
                              {/* Action Button */}
                              {notification.action && (
                                <button
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    // Navigate to action.href
                                  }}
                                  className="mt-2 text-xs text-pink-600 hover:text-pink-700 font-medium transition-colors"
                                >
                                  {notification.action.label} →
                                </button>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-start space-x-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Mark as read"
                                >
                                  <CheckCircleIcon className="h-4 w-4 text-gray-400" />
                                </button>
                              )}
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="p-1 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove"
                              >
                                <XMarkIcon className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="absolute left-2 top-6 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <button className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
                View All Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 