'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLazyLoad } from '@/hooks/usePrefetch';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  className?: string;
  minHeight?: string;
}

/**
 * Lazy loading wrapper component that only renders children when visible
 */
export function LazyWrapper({ 
  children, 
  fallback, 
  threshold = 0.1, 
  className = '',
  minHeight = '200px'
}: LazyWrapperProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const { elementRef } = useLazyLoad(threshold);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleLazyLoad = () => {
      setShouldRender(true);
    };

    element.addEventListener('lazyload', handleLazyLoad);
    return () => {
      element.removeEventListener('lazyload', handleLazyLoad);
    };
  }, [elementRef]);

  return (
    <div 
      ref={elementRef} 
      className={className}
      style={{ minHeight: shouldRender ? 'auto' : minHeight }}
    >
      {shouldRender ? children : (fallback || <LazyLoadingSkeleton />)}
    </div>
  );
}

/**
 * Default loading skeleton for lazy components
 */
function LazyLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}

/**
 * Lazy loading component for charts and heavy visualizations
 */
interface LazyChartProps {
  children: React.ReactNode;
  className?: string;
}

export function LazyChart({ children, className = '' }: LazyChartProps) {
  return (
    <LazyWrapper
      className={className}
      minHeight="300px"
      fallback={
        <div className="flex items-center justify-center h-72 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading chart...</p>
          </div>
        </div>
      }
    >
      {children}
    </LazyWrapper>
  );
}

/**
 * Lazy loading component for data tables
 */
interface LazyTableProps {
  children: React.ReactNode;
  className?: string;
  rowCount?: number;
}

export function LazyTable({ children, className = '', rowCount = 5 }: LazyTableProps) {
  const skeletonRows = Array.from({ length: rowCount }, (_, i) => (
    <tr key={i} className="border-b">
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </td>
    </tr>
  ));

  return (
    <LazyWrapper
      className={className}
      fallback={
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                </th>
                <th className="px-4 py-3">
                  <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                </th>
                <th className="px-4 py-3">
                  <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {skeletonRows}
            </tbody>
          </table>
        </div>
      }
    >
      {children}
    </LazyWrapper>
  );
}
