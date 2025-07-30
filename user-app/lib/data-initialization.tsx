'use client';

import React, { useEffect, useState } from 'react';
import { dataMigrationService } from './data-migration';
import { appMaintenance } from './app-maintenance';

// Data initialization service for ensuring real backend data
class DataInitializationService {
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize(userId?: string): Promise<InitializationReport> {
    // Prevent multiple initializations
    if (this.initializationPromise) {
      await this.initializationPromise;
      return this.getInitializationStatus();
    }

    this.initializationPromise = this.performInitialization(userId);
    await this.initializationPromise;
    
    return this.getInitializationStatus();
  }

  private async performInitialization(userId?: string): Promise<void> {
    try {
      console.log('🚀 Initializing PinkyTrust application data...');
      
      // Step 1: Check backend connectivity
      const healthStatus = await appMaintenance.performHealthCheck();
      console.log('📊 Backend health check:', healthStatus.status);
      
      if (healthStatus.status === 'error' || !healthStatus.services.database) {
        console.warn('⚠️ Backend connectivity issues detected, using fallback data');
        this.initialized = true;
        return;
      }

      // Step 2: Run data migration to ensure real data is loaded
      console.log('📦 Running data migration...');
      const migrationReport = await dataMigrationService.migrateToRealData(userId);
      
      console.log('✅ Data migration completed:', {
        successful: migrationReport.summary.successful,
        failed: migrationReport.summary.failed,
        total: migrationReport.summary.total,
      });

      // Step 3: Validate data integrity
      const validationReport = dataMigrationService.validateDataIntegrity();
      console.log('🔍 Data validation:', {
        isValid: validationReport.isValid,
        validations: validationReport.validations.length,
      });

      // Step 4: Record initialization metrics
      appMaintenance.recordPerformanceMetric({
        timestamp: new Date().toISOString(),
        type: 'data_initialization',
        value: performance.now(),
        metadata: {
          userId,
          migrationStatus: migrationReport.summary,
          validationStatus: validationReport.isValid,
          healthStatus: healthStatus.status,
        },
      });

      this.initialized = true;
      console.log('🎉 Application data initialization completed successfully!');
      
    } catch (error) {
      console.error('❌ Data initialization failed:', error);
      
      // Log the error but don't throw - app should still work with fallback data
      appMaintenance.logError(
        error instanceof Error ? error : new Error('Data initialization failed'),
        { type: 'initialization_error', userId }
      );
      
      this.initialized = true; // Mark as initialized to prevent retries
    } finally {
      // Clear the initialization promise to allow retries if needed
      this.initializationPromise = null;
    }
  }

  private getInitializationStatus(): InitializationReport {
    const migrationStatus = dataMigrationService.getMigrationStatus();
    const validationReport = dataMigrationService.validateDataIntegrity();
    
    return {
      timestamp: new Date().toISOString(),
      initialized: this.initialized,
      migrationStatus,
      validationReport,
      recommendations: this.generateRecommendations(migrationStatus, validationReport),
    };
  }

  private generateRecommendations(
    migrationStatus: any, 
    validationReport: any
  ): string[] {
    const recommendations: string[] = [];
    
    if (!validationReport.isValid) {
      recommendations.push('Some data is using sample/fallback content. Check backend connectivity.');
    }
    
    const realDataCount = Object.values(migrationStatus).filter(Boolean).length;
    const totalDataTypes = Object.keys(migrationStatus).length;
    
    if (realDataCount === 0) {
      recommendations.push('All data is using sample content. Verify Supabase configuration and database setup.');
    } else if (realDataCount < totalDataTypes) {
      recommendations.push(`${realDataCount}/${totalDataTypes} data types are using real backend data. Some tables may be empty.`);
    } else {
      recommendations.push('All data types are successfully loaded from backend.');
    }
    
    return recommendations;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  reset(): void {
    this.initialized = false;
    this.initializationPromise = null;
    dataMigrationService.resetMigrationStatus();
  }
}

// React hook for data initialization
export function useDataInitialization(userId?: string) {
  const [report, setReport] = useState<InitializationReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializationService] = useState(() => new DataInitializationService());

  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const initReport = await initializationService.initialize(userId);
        
        if (mounted) {
          setReport(initReport);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Initialization failed');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      mounted = false;
    };
  }, [userId, initializationService]);

  const reinitialize = async () => {
    initializationService.reset();
    setIsLoading(true);
    setError(null);
    
    try {
      const initReport = await initializationService.initialize(userId);
      setReport(initReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reinitialization failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    report,
    isLoading,
    error,
    isInitialized: initializationService.isInitialized(),
    reinitialize,
  };
}

// Auto-initialization component
interface DataInitializerProps {
  userId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function DataInitializer({
  userId,
  children,
  fallback
}: DataInitializerProps) {
  const { isLoading, error, isInitialized, report } = useDataInitialization(userId);

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Initializing Application
            </h2>
            <p className="text-gray-600 text-sm">
              Loading real-time data from backend...
            </p>
          </div>
        </div>
      )
    );
  }

  if (error) {
    console.warn('Data initialization error (continuing with fallback):', error);
  }

  // Show data status in development
  if (process.env.NODE_ENV === 'development' && report) {
    console.log('📊 Data Initialization Report:', report);
  }

  return <>{children}</>;
}

// Types
interface InitializationReport {
  timestamp: string;
  initialized: boolean;
  migrationStatus: Record<string, boolean>;
  validationReport: {
    timestamp: string;
    validations: Array<{
      dataType: string;
      isValid: boolean;
      message: string;
    }>;
    isValid: boolean;
  };
  recommendations: string[];
}

export const dataInitializationService = new DataInitializationService();
export type { InitializationReport };
