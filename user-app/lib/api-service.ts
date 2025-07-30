'use client';

import { apiClient } from './api';
import type { Event, AssessmentQuestion, AssessmentAnswer, RiskResult } from '@/types';

interface HealthCheckResponse {
  timestamp: string;
  status: 'healthy' | 'unhealthy' | 'error' | 'unknown';
  responseTime: number;
  services: Record<string, string>;
  version: string;
  error?: string;
}

interface ApiHealthResponse {
  status?: string;
  services?: {
    database?: string;
    auth?: string;
    api?: string;
  };
  version?: string;
}

// Enhanced API service with proper error handling and caching
class ApiService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  private isValidCache(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < cached.ttl;
  }

  private setCache(cacheKey: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Events API
  async getEvents(filters?: Record<string, any>): Promise<Event[]> {
    const cacheKey = this.getCacheKey('/events', filters);
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await apiClient.get<Event[]>('/events', filters);
      const events = response.data || [];
      this.setCache(cacheKey, events);
      return events;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Return cached data if available, even if stale
      const cached = this.cache.get(cacheKey);
      if (cached) return cached.data;
      throw error;
    }
  }

  async getEvent(id: string): Promise<Event | null> {
    const cacheKey = this.getCacheKey(`/events/${id}`);
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await apiClient.get<Event>(`/events/${id}`);
      const event = response.data;
      this.setCache(cacheKey, event);
      return event;
    } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error);
      const cached = this.cache.get(cacheKey);
      if (cached) return cached.data;
      return null;
    }
  }

  async registerForEvent(eventId: string, userId: string): Promise<any> {
    try {
      const response = await apiClient.post(`/events/${eventId}/register`, { userId });
      // Clear events cache to refresh data
      this.clearCache('/events');
      return response.data;
    } catch (error) {
      console.error(`Failed to register for event ${eventId}:`, error);
      throw error;
    }
  }

  async unregisterFromEvent(eventId: string, userId: string): Promise<void> {
    try {
      await apiClient.delete(`/events/${eventId}/register?userId=${userId}`);
      // Clear events cache to refresh data
      this.clearCache('/events');
    } catch (error) {
      console.error(`Failed to unregister from event ${eventId}:`, error);
      throw error;
    }
  }

  // Assessment API
  async getAssessmentQuestions(): Promise<AssessmentQuestion[]> {
    const cacheKey = this.getCacheKey('/assessment');
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await apiClient.get<AssessmentQuestion[]>('/assessment');
      const questions = response.data || [];
      // Cache for longer since questions don't change often
      this.setCache(cacheKey, questions, 30 * 60 * 1000); // 30 minutes
      return questions;
    } catch (error) {
      console.error('Failed to fetch assessment questions:', error);
      const cached = this.cache.get(cacheKey);
      if (cached) return cached.data;
      throw error;
    }
  }

  async saveAssessment(
    userId: string, 
    answers: AssessmentAnswer[], 
    result: RiskResult
  ): Promise<any> {
    try {
      const response = await apiClient.post('/assessment', {
        userId,
        answers,
        result,
      });
      // Clear user assessments cache
      this.clearCache(`/assessment/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to save assessment:', error);
      throw error;
    }
  }

  async getUserAssessments(userId: string): Promise<any[]> {
    const cacheKey = this.getCacheKey(`/assessment/${userId}`);
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await apiClient.get<any[]>(`/assessment/${userId}`);
      const assessments = response.data || [];
      this.setCache(cacheKey, assessments);
      return assessments;
    } catch (error) {
      console.error(`Failed to fetch assessments for user ${userId}:`, error);
      const cached = this.cache.get(cacheKey);
      if (cached) return cached.data;
      throw error;
    }
  }

  async getLatestAssessment(userId: string): Promise<any | null> {
    const cacheKey = this.getCacheKey(`/assessment/${userId}`, { latest: true });
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await apiClient.get<any>(`/assessment/${userId}?latest=true`);
      const assessment = response.data;
      this.setCache(cacheKey, assessment);
      return assessment;
    } catch (error) {
      console.error(`Failed to fetch latest assessment for user ${userId}:`, error);
      const cached = this.cache.get(cacheKey);
      if (cached) return cached.data;
      return null;
    }
  }

  // Health check
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const startTime = performance.now();
      const response = await apiClient.get<ApiHealthResponse>('/health');
      const responseTime = performance.now() - startTime;
      const data = response.data || {};

      return {
        timestamp: new Date().toISOString(),
        status: (data.status as HealthCheckResponse['status']) || 'healthy',
        responseTime,
        services: {
          database: data.services?.database || 'healthy',
          auth: data.services?.auth || 'healthy',
          api: data.services?.api || 'healthy'
        },
        version: data.version || '1.0.0'
      };
    } catch (error) {
      // Return a structured error response instead of throwing
      return {
        timestamp: new Date().toISOString(),
        status: 'error',
        responseTime: -1,
        services: {
          database: 'error',
          auth: 'error',
          api: 'error'
        },
        version: 'unknown',
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }

  // Cache management
  clearAllCache(): void {
    this.clearCache();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const apiService = new ApiService();
