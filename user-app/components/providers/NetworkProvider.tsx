'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NetworkContextType {
  isOnline: boolean;
  isSlowConnection: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isSlowConnection: false,
});

export const useNetwork = () => useContext(NetworkContext);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSlowConnection, setIsSlowConnection] = useState<boolean>(false);

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);

    // Create event listeners for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check connection speed
    const checkConnectionSpeed = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const isSlowSpeed = connection.effectiveType === 'slow-2g' || 
                          connection.effectiveType === '2g' || 
                          connection.effectiveType === '3g';
        setIsSlowConnection(isSlowSpeed);

        connection.addEventListener('change', checkConnectionSpeed);
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    checkConnectionSpeed();

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection.removeEventListener('change', checkConnectionSpeed);
      }
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, isSlowConnection }}>
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            className="fixed top-0 left-0 right-0 bg-warning-500 text-white text-center py-2 text-sm font-medium z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            You are currently offline. Some features may be unavailable.
          </motion.div>
        )}
        {isOnline && isSlowConnection && (
          <motion.div
            className="fixed top-0 left-0 right-0 bg-warning-400 text-white text-center py-2 text-sm font-medium z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            Slow internet connection detected. Some features may be slower than usual.
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </NetworkContext.Provider>
  );
} 