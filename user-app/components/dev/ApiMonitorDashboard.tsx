'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ServerIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { appMaintenance, type DiagnosticReport, type HealthStatus } from '@/lib/app-maintenance';
import { EnhancedCard, EnhancedButton, EnhancedBadge } from '@/components/ui/EnhancedComponents';

export default function ApiMonitorDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticReport | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const report = await appMaintenance.runDiagnostics();
      setDiagnostics(report);
      setHealthStatus(report.health);
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    appMaintenance.clearApplicationCache();
    runDiagnostics(); // Refresh after clearing
  };

  useEffect(() => {
    if (isOpen && !diagnostics) {
      runDiagnostics();
    }
  }, [isOpen]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'unhealthy': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircleIcon;
      case 'unhealthy': return ExclamationTriangleIcon;
      case 'error': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        className="fixed bottom-4 left-4 z-50 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ServerIcon className="w-5 h-5" />
      </motion.button>

      {/* Dashboard Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">API Monitor Dashboard</h2>
                    <p className="text-sm text-gray-600">Development Environment</p>
                  </div>
                  <div className="flex gap-2">
                    <EnhancedButton
                      variant="secondary"
                      size="sm"
                      icon={ArrowPathIcon}
                      onClick={runDiagnostics}
                      disabled={loading}
                    >
                      {loading ? 'Running...' : 'Refresh'}
                    </EnhancedButton>
                    <EnhancedButton
                      variant="tertiary"
                      size="sm"
                      icon={TrashIcon}
                      onClick={clearCache}
                    >
                      Clear Cache
                    </EnhancedButton>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {loading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Running diagnostics...</p>
                  </div>
                )}

                {diagnostics && (
                  <>
                    {/* Health Status */}
                    <EnhancedCard>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">System Health</h3>
                        <EnhancedBadge
                          variant={healthStatus?.status === 'healthy' ? 'success' : 'error'}
                        >
                          {healthStatus?.status || 'unknown'}
                        </EnhancedBadge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {healthStatus?.responseTime.toFixed(0)}ms
                          </div>
                          <div className="text-sm text-gray-600">Response Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {Object.keys(healthStatus?.services || {}).length}
                          </div>
                          <div className="text-sm text-gray-600">Services</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {healthStatus?.version || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">Version</div>
                        </div>
                      </div>

                      {healthStatus?.services && (
                        <div className="mt-4 space-y-2">
                          <h4 className="font-medium text-gray-900">Services Status</h4>
                          {Object.entries(healthStatus.services).map(([service, status]) => {
                            const StatusIcon = getStatusIcon(status);
                            return (
                              <div key={service} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 capitalize">{service}</span>
                                <div className="flex items-center gap-1">
                                  <StatusIcon className={`w-4 h-4 ${getStatusColor(status)}`} />
                                  <span className={`text-sm ${getStatusColor(status)} capitalize`}>
                                    {status}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </EnhancedCard>

                    {/* Performance Metrics */}
                    <EnhancedCard>
                      <h3 className="text-lg font-semibold mb-4">Performance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {diagnostics.performance.averageResponseTime.toFixed(0)}ms
                          </div>
                          <div className="text-sm text-gray-600">Avg Response Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {diagnostics.performance.totalMetrics}
                          </div>
                          <div className="text-sm text-gray-600">Total Metrics</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {diagnostics.performance.recentErrors}
                          </div>
                          <div className="text-sm text-gray-600">Recent Errors</div>
                        </div>
                      </div>
                    </EnhancedCard>

                    {/* Cache Statistics */}
                    <EnhancedCard>
                      <h3 className="text-lg font-semibold mb-4">Cache Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">API Cache</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Entries:</span>
                              <span className="text-sm font-medium">{diagnostics.cache.apiCache.size}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Keys: {diagnostics.cache.apiCache.keys.slice(0, 3).join(', ')}
                              {diagnostics.cache.apiCache.keys.length > 3 && '...'}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Local Storage</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Size:</span>
                              <span className="text-sm font-medium">
                                {(diagnostics.cache.localStorage.size / 1024).toFixed(1)}KB
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Keys:</span>
                              <span className="text-sm font-medium">{diagnostics.cache.localStorage.keys}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </EnhancedCard>

                    {/* Memory Usage */}
                    {diagnostics.memory.total > 0 && (
                      <EnhancedCard>
                        <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {(diagnostics.memory.used / 1024 / 1024).toFixed(1)}MB
                            </div>
                            <div className="text-sm text-gray-600">Used</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {(diagnostics.memory.total / 1024 / 1024).toFixed(1)}MB
                            </div>
                            <div className="text-sm text-gray-600">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {((diagnostics.memory.used / diagnostics.memory.total) * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">Usage</div>
                          </div>
                        </div>
                      </EnhancedCard>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
