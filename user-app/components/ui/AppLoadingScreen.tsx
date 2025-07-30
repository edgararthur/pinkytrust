'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/solid';

interface AppLoadingScreenProps {
  text?: string;
  subText?: string;
  showProgress?: boolean;
  progress?: number;
}

export default function AppLoadingScreen({ 
  text = "Loading...", 
  subText,
  showProgress = false,
  progress = 0
}: AppLoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Main Logo with Animation */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="relative"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image
              src="/images/logo.png"
              alt="PinkyTrust Logo"
              width={80}
              height={80}
              className="rounded-2xl mx-auto"
              priority
            />
            
            {/* Animated ring around logo */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-primary-300"
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-primary-200"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0, 0.2]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </motion.div>
        </motion.div>

        {/* App Branding */}
        <motion.div
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-primary-600 mb-2">PinkyTrust</h1>
          <p className="text-sm text-gray-500">Breast Health Companion</p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <HeartIcon className="w-8 h-8 text-pink-500" />
            </motion.div>
          </div>
          
          {/* Loading dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary-400 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <p className="text-gray-700 font-medium mb-1">{text}</p>
          {subText && (
            <p className="text-sm text-gray-500">{subText}</p>
          )}
        </motion.div>

        {/* Progress Bar */}
        {showProgress && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-gray-500">{progress}% complete</p>
          </motion.div>
        )}

        {/* Company Attribution */}
        <motion.div
          className="flex items-center justify-center gap-2 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <span>Developed by</span>
          <div className="flex items-center gap-1">
            <Image
              src="/images/gi-kace-logo.jpeg"
              alt="GI-KACE Logo"
              width={14}
              height={14}
              className="rounded"
            />
            <span className="font-medium text-gray-500">GI-KACE</span>
          </div>
        </motion.div>

        {/* Inspirational Message */}
        <motion.div
          className="mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <p className="text-xs text-gray-600 italic">
            "Early detection saves lives. Every step you take towards awareness matters."
          </p>
        </motion.div>
      </div>
    </div>
  );
}
