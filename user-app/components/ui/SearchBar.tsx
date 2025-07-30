'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  FireIcon as TrendingUpIcon,
  HashtagIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'suggestion' | 'category';
  icon?: React.ComponentType<any>;
  category?: string;
  count?: number;
}

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  suggestions?: SearchSuggestion[];
  showSuggestions?: boolean;
  showFilters?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'elevated';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
  clearable?: boolean;
  debounceMs?: number;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({
    placeholder = 'Search...',
    value = '',
    onChange,
    onSearch,
    onFocus,
    onBlur,
    suggestions = [],
    showSuggestions = true,
    showFilters = false,
    size = 'md',
    variant = 'default',
    className,
    disabled = false,
    loading = false,
    autoFocus = false,
    clearable = true,
    debounceMs = 300,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestionsList, setShowSuggestionsList] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Default suggestions
    const defaultSuggestions: SearchSuggestion[] = [
      { id: '1', text: 'breast cancer screening', type: 'trending', icon: TrendingUpIcon, count: 1250 },
      { id: '2', text: 'self examination', type: 'trending', icon: TrendingUpIcon, count: 890 },
      { id: '3', text: 'support groups', type: 'recent', icon: ClockIcon },
      { id: '4', text: 'prevention tips', type: 'recent', icon: ClockIcon },
      { id: '5', text: 'mammography', type: 'suggestion', icon: HashtagIcon, category: 'Screening' },
      { id: '6', text: 'early detection', type: 'suggestion', icon: HashtagIcon, category: 'Prevention' },
      { id: '7', text: 'community events', type: 'category', icon: CalendarDaysIcon },
      { id: '8', text: 'educational resources', type: 'category', icon: DocumentTextIcon },
    ];

    const allSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

    // Handle value changes with debouncing
    useEffect(() => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        if (onChange) {
          onChange(internalValue);
        }
      }, debounceMs);

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [internalValue, onChange, debounceMs]);

    // Handle external value changes
    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    // Handle click outside to close suggestions
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setShowSuggestionsList(false);
          setIsFocused(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      setShowSuggestionsList(newValue.length > 0 || isFocused);
    };

    const handleInputFocus = () => {
      setIsFocused(true);
      setShowSuggestionsList(true);
      onFocus?.();
    };

    const handleInputBlur = () => {
      // Delay blur to allow suggestion clicks
      setTimeout(() => {
        setIsFocused(false);
        onBlur?.();
      }, 150);
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
      setInternalValue(suggestion.text);
      setShowSuggestionsList(false);
      onSearch?.(suggestion.text);
    };

    const handleClear = () => {
      setInternalValue('');
      setShowSuggestionsList(false);
      onChange?.('');
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(internalValue);
      setShowSuggestionsList(false);
    };

    const sizeClasses = {
      sm: 'h-10 text-sm',
      md: 'h-12 text-base',
      lg: 'h-14 text-lg',
    };

    const variantClasses = {
      default: 'bg-white border border-gray-200 shadow-sm',
      minimal: 'bg-transparent border-b border-gray-300',
      elevated: 'bg-white border border-gray-200 shadow-lg',
    };

    const filteredSuggestions = allSuggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(internalValue.toLowerCase())
    );

    const getSuggestionIcon = (suggestion: SearchSuggestion) => {
      if (suggestion.icon) {
        const Icon = suggestion.icon;
        return <Icon className="w-4 h-4" />;
      }

      switch (suggestion.type) {
        case 'recent':
          return <ClockIcon className="w-4 h-4" />;
        case 'trending':
          return <TrendingUpIcon className="w-4 h-4" />;
        case 'category':
          return <HashtagIcon className="w-4 h-4" />;
        default:
          return <MagnifyingGlassIcon className="w-4 h-4" />;
      }
    };

    const getSuggestionTypeColor = (type: string) => {
      switch (type) {
        case 'recent':
          return 'text-gray-500';
        case 'trending':
          return 'text-orange-500';
        case 'category':
          return 'text-blue-500';
        default:
          return 'text-gray-400';
      }
    };

    return (
      <div ref={containerRef} className={cn('relative w-full', className)}>
        <form onSubmit={handleSubmit} className="relative">
          <div className={cn(
            'relative flex items-center rounded-xl transition-all duration-200',
            sizeClasses[size],
            variantClasses[variant],
            isFocused && 'ring-2 ring-primary-500 border-primary-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}>
            {/* Search Icon */}
            <div className="absolute left-3 flex items-center">
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {/* Input */}
            <input
              ref={ref}
              type="text"
              value={internalValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              disabled={disabled}
              autoFocus={autoFocus}
              className={cn(
                'w-full pl-10 pr-12 bg-transparent border-none outline-none placeholder-gray-500',
                disabled && 'cursor-not-allowed'
              )}
              {...props}
            />

            {/* Clear Button */}
            {clearable && internalValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-8 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}

            {/* Filters Button */}
            {showFilters && (
              <button
                type="button"
                className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && showSuggestionsList && (isFocused || internalValue) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {filteredSuggestions.length > 0 ? (
                <div className="py-2">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                    >
                      <div className={cn('flex-shrink-0', getSuggestionTypeColor(suggestion.type))}>
                        {getSuggestionIcon(suggestion)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 group-hover:text-primary-600 transition-colors">
                            {suggestion.text}
                          </span>
                          {suggestion.count && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {suggestion.count.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {suggestion.category && (
                          <div className="text-xs text-gray-500 mt-1">
                            in {suggestion.category}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0 text-xs text-gray-400 capitalize">
                        {suggestion.type}
                      </div>
                    </button>
                  ))}
                </div>
              ) : internalValue && (
                <div className="py-8 text-center text-gray-500">
                  <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No suggestions found</p>
                  <p className="text-sm">Try searching for something else</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
export type { SearchBarProps, SearchSuggestion };
