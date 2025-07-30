'use client';

import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has a theme preference
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 transition-all duration-500 hover:scale-110 hover:rotate-12 group"
      aria-label="Toggle dark mode"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 opacity-30 blur-lg group-hover:opacity-50 transition-opacity duration-500" />
      
      {/* Toggle container */}
      <div className="relative w-12 h-6 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 overflow-hidden">
        {/* Sliding background */}
        <div
          className={`absolute inset-y-0 w-6 bg-white rounded-full shadow-lg transition-all duration-500 ease-out ${
            isDark ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
        
        {/* Sun icon */}
        <div
          className={`absolute left-1 top-1 transition-all duration-500 ${
            isDark ? 'opacity-0 scale-0 rotate-180' : 'opacity-100 scale-100 rotate-0'
          }`}
        >
          <SunIcon className="h-4 w-4 text-yellow-600" />
        </div>
        
        {/* Moon icon */}
        <div
          className={`absolute right-1 top-1 transition-all duration-500 ${
            isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-180'
          }`}
        >
          <MoonIcon className="h-4 w-4 text-indigo-600" />
        </div>
      </div>
      
      {/* Stars animation for dark mode */}
      {isDark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }} />
          <div className="absolute top-2 left-1 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1 right-2 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        </div>
      )}
    </button>
  );
} 