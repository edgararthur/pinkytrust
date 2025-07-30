'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudIcon,
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useDataMigration, dataMigrationService } from '@/lib/data-migration';
import { EnhancedButton, EnhancedBadge } from './EnhancedComponents';

interface DataStatusIndicatorProps {
  showDetails?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  compact?: boolean;
}

export default function DataStatusIndicator({ 
  showDetails = false, 
  position = 'top-right',
  compact = false 
}: DataStatusIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dataStatus, setDataStatus] = useState(dataMigrationService.getMigrationStatus());
  const { runMigration, validateData, isLoading } = useDataMigration();

  useEffect(() => {
    // Check data status periodically
    const interval = setInterval(() => {
      setDataStatus(dataMigrationService.getMigrationStatus());
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getOverallStatus = () => {
    const statuses = Object.values(dataStatus);
    const hasRealData = statuses.some(status => status === true);
    const allRealData = statuses.every(status => status === true);
    
    if (allRealData) return 'all_real';
    if (hasRealData) return 'mixed';
    return 'all_mock';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'all_real': return 'text-green-600';
      case 'mixed': return 'text-yellow-600';
      case 'all_mock': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'all_real': return CheckCircleIcon;
      case 'mixed': return ExclamationTriangleIcon;
      case 'all_mock': return XCircleIcon;
      default: return CloudIcon;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'all_real': return 'All data from backend';
      case 'mixed': return 'Mixed real and sample data';
      case 'all_mock': return 'Using sample data';
      default: return 'Data status unknown';
    }
  };

  const handleRefreshData = async () => {
    try {
      await runMigration();
      setDataStatus(dataMigrationService.getMigrationStatus());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = getStatusIcon(overallStatus);
  const statusColor = getStatusColor(overallStatus);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4',
  };

  if (compact) {
    return (
      <div className={`fixed ${positionClasses[position]} z-40`}>
        <motion.div
          className={`flex items-center gap-2 bg-white rounded-lg shadow-lg border px-3 py-2 ${statusColor}`}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <StatusIcon className="w-4 h-4" />
          <EnhancedBadge 
            variant={overallStatus === 'all_real' ? 'success' : overallStatus === 'mixed' ? 'warning' : 'error'}
            size="sm"
          >
            {overallStatus === 'all_real' ? 'Live' : overallStatus === 'mixed' ? 'Mixed' : 'Demo'}
          </EnhancedBadge>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      <motion.div
        className="bg-white rounded-lg shadow-lg border overflow-hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${statusColor}`} />
            <div>
              <div className="text-sm font-medium text-gray-900">Data Status</div>
              <div className={`text-xs ${statusColor}`}>
                {getStatusMessage(overallStatus)}
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="border-t border-gray-200"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-3 space-y-3">
                {/* Data Type Status */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Data Sources
                  </div>
                  {Object.entries(dataStatus).map(([dataType, isReal]) => (
                    <div key={dataType} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {dataType.replace('_', ' ')}
                      </span>
                      <EnhancedBadge 
                        variant={isReal ? 'success' : 'error'}
                        size="sm"
                      >
                        {isReal ? 'Backend' : 'Sample'}
                      </EnhancedBadge>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <EnhancedButton
                    variant="secondary"
                    size="sm"
                    icon={ArrowPathIcon}
                    onClick={handleRefreshData}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                  </EnhancedButton>
                  
                  {showDetails && (
                    <EnhancedButton
                      variant="tertiary"
                      size="sm"
                      onClick={() => {
                        const validation = validateData();
                        console.log('Data validation:', validation);
                      }}
                      className="flex-1"
                    >
                      Validate
                    </EnhancedButton>
                  )}
                </div>

                {/* Development Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Development Mode: Real-time data monitoring active
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Hook for checking data status in components
export function useDataStatus() {
  const [dataStatus, setDataStatus] = useState(dataMigrationService.getMigrationStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setDataStatus(dataMigrationService.getMigrationStatus());
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const isUsingRealData = (dataType: keyof typeof dataStatus) => {
    return dataStatus[dataType];
  };

  const getOverallStatus = () => {
    const statuses = Object.values(dataStatus);
    const hasRealData = statuses.some(status => status === true);
    const allRealData = statuses.every(status => status === true);
    
    if (allRealData) return 'all_real';
    if (hasRealData) return 'mixed';
    return 'all_mock';
  };

  return {
    dataStatus,
    isUsingRealData,
    getOverallStatus,
  };
}
