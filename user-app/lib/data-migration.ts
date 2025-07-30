'use client';

import React from 'react';
import {
  eventsApi,
  assessmentApi,
  communityApi,
  awarenessApi,
  scannerApi,
  analyticsApi
} from './api';
import { useDataManager } from './data-manager';
import type { Event, AssessmentQuestion, CommunityPost, AwarenessContent } from '@/types';

// Types
interface MigrationReport {
  timestamp: string;
  userId?: string | undefined;
  migrations: MigrationResult[];
  errors: MigrationError[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

interface MigrationResult {
  dataType: string;
  status: 'pending' | 'success' | 'error' | 'no_data';
  startTime: string;
  endTime?: string;
  recordsProcessed: number;
  recordsMigrated: number;
  message?: string;
  error?: string;
}

interface MigrationError {
  type: string;
  message: string;
  timestamp: string;
}

interface DataValidationReport {
  timestamp: string;
  validations: DataValidation[];
  isValid: boolean;
}

interface DataValidation {
  dataType: string;
  isValid: boolean;
  message: string;
}

// Data migration and validation service
class DataMigrationService {
  private migrationStatus = {
    events: false,
    assessments: false,
    community: false,
    awareness: false,
    scanner: false,
  };

  // Check if real data is available and migrate from mock data
  async migrateToRealData(userId?: string): Promise<MigrationReport> {
    const report: MigrationReport = {
      timestamp: new Date().toISOString(),
      userId,
      migrations: [],
      errors: [],
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
      },
    };

    try {
      // Migrate Events
      const eventsResult = await this.migrateEvents();
      report.migrations.push(eventsResult);
      
      // Migrate Assessment Questions
      const assessmentResult = await this.migrateAssessmentQuestions();
      report.migrations.push(assessmentResult);
      
      // Migrate Community Posts
      const communityResult = await this.migrateCommunityPosts();
      report.migrations.push(communityResult);
      
      // Migrate Awareness Content
      const awarenessResult = await this.migrateAwarenessContent();
      report.migrations.push(awarenessResult);

      // Calculate summary
      report.summary.total = report.migrations.length;
      report.summary.successful = report.migrations.filter(m => m.status === 'success').length;
      report.summary.failed = report.migrations.filter(m => m.status === 'error').length;

      return report;
    } catch (error) {
      report.errors.push({
        type: 'migration_error',
        message: error instanceof Error ? error.message : 'Unknown migration error',
        timestamp: new Date().toISOString(),
      });
      
      return report;
    }
  }

  private async migrateEvents(): Promise<MigrationResult> {
    const result: MigrationResult = {
      dataType: 'events',
      status: 'pending',
      startTime: new Date().toISOString(),
      recordsProcessed: 0,
      recordsMigrated: 0,
    };

    try {
      const events = await eventsApi.getEvents();
      
      result.recordsProcessed = events?.length || 0;
      result.recordsMigrated = events?.length || 0;
      result.status = events?.length > 0 ? 'success' : 'no_data';
      result.endTime = new Date().toISOString();
      result.message = `Successfully loaded ${events?.length || 0} events from backend`;
      
      this.migrationStatus.events = events?.length > 0;
      
    } catch (error) {
      result.status = 'error';
      result.endTime = new Date().toISOString();
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.message = 'Failed to load events from backend, using mock data';
    }

    return result;
  }

  private async migrateAssessmentQuestions(): Promise<MigrationResult> {
    const result: MigrationResult = {
      dataType: 'assessment_questions',
      status: 'pending',
      startTime: new Date().toISOString(),
      recordsProcessed: 0,
      recordsMigrated: 0,
    };

    try {
      const questions = await assessmentApi.getQuestions();
      
      result.recordsProcessed = questions?.length || 0;
      result.recordsMigrated = questions?.length || 0;
      result.status = questions?.length > 0 ? 'success' : 'no_data';
      result.endTime = new Date().toISOString();
      result.message = `Successfully loaded ${questions?.length || 0} assessment questions from backend`;
      
      this.migrationStatus.assessments = questions?.length > 0;
      
    } catch (error) {
      result.status = 'error';
      result.endTime = new Date().toISOString();
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.message = 'Failed to load assessment questions from backend, using mock data';
    }

    return result;
  }

  private async migrateCommunityPosts(): Promise<MigrationResult> {
    const result: MigrationResult = {
      dataType: 'community_posts',
      status: 'pending',
      startTime: new Date().toISOString(),
      recordsProcessed: 0,
      recordsMigrated: 0,
    };

    try {
      const postsResponse = await communityApi.getPosts(50, 0);
      const posts = postsResponse?.data || [];
      
      result.recordsProcessed = posts.length;
      result.recordsMigrated = posts.length;
      result.status = posts.length > 0 ? 'success' : 'no_data';
      result.endTime = new Date().toISOString();
      result.message = `Successfully loaded ${posts.length} community posts from backend`;
      
      this.migrationStatus.community = posts.length > 0;
      
    } catch (error) {
      result.status = 'error';
      result.endTime = new Date().toISOString();
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.message = 'Failed to load community posts from backend, using mock data';
    }

    return result;
  }

  private async migrateAwarenessContent(): Promise<MigrationResult> {
    const result: MigrationResult = {
      dataType: 'awareness_content',
      status: 'pending',
      startTime: new Date().toISOString(),
      recordsProcessed: 0,
      recordsMigrated: 0,
    };

    try {
      const content = await awarenessApi.getContent();
      
      result.recordsProcessed = content?.length || 0;
      result.recordsMigrated = content?.length || 0;
      result.status = content?.length > 0 ? 'success' : 'no_data';
      result.endTime = new Date().toISOString();
      result.message = `Successfully loaded ${content?.length || 0} awareness content items from backend`;
      
      this.migrationStatus.awareness = content?.length > 0;
      
    } catch (error) {
      result.status = 'error';
      result.endTime = new Date().toISOString();
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.message = 'Failed to load awareness content from backend, using mock data';
    }

    return result;
  }

  // Validate data integrity
  validateDataIntegrity(): DataValidationReport {
    const report: DataValidationReport = {
      timestamp: new Date().toISOString(),
      validations: [],
      isValid: true,
    };

    // Check if all critical data types are available
    const criticalDataTypes = ['events', 'assessments', 'community', 'awareness'];
    
    criticalDataTypes.forEach(dataType => {
      const isAvailable = this.migrationStatus[dataType as keyof typeof this.migrationStatus];
      
      report.validations.push({
        dataType,
        isValid: isAvailable,
        message: isAvailable 
          ? `${dataType} data is available from backend`
          : `${dataType} data is using mock/fallback data`,
      });
      
      if (!isAvailable) {
        report.isValid = false;
      }
    });

    return report;
  }

  // Get migration status
  getMigrationStatus() {
    return { ...this.migrationStatus };
  }

  // Reset migration status
  resetMigrationStatus() {
    Object.keys(this.migrationStatus).forEach(key => {
      this.migrationStatus[key as keyof typeof this.migrationStatus] = false;
    });
  }
}

// React hook for data migration
export function useDataMigration() {
  const [migrationService] = React.useState(() => new DataMigrationService());
  const [migrationReport, setMigrationReport] = React.useState<MigrationReport | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const runMigration = async (userId?: string) => {
    setIsLoading(true);
    try {
      const report = await migrationService.migrateToRealData(userId);
      setMigrationReport(report);
      return report;
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validateData = () => {
    return migrationService.validateDataIntegrity();
  };

  const getMigrationStatus = () => {
    return migrationService.getMigrationStatus();
  };

  return {
    runMigration,
    validateData,
    getMigrationStatus,
    migrationReport,
    isLoading,
  };
}

export const dataMigrationService = new DataMigrationService();
export type { MigrationReport, MigrationResult, DataValidationReport };
