import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { 
  eventsApi, 
  assessmentApi, 
  communityApi, 
  awarenessApi, 
  scannerApi,
  analyticsApi,
  authApi
} from './api';
import type { EventFilters, ContentFilters, AssessmentAnswer, RiskResult } from '@/types';

// Query keys
export const queryKeys = {
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
  userRegistrations: (userId: string) => ['events', 'registrations', userId] as const,
  
  assessmentQuestions: ['assessment', 'questions'] as const,
  userAssessments: (userId: string) => ['assessments', userId] as const,
  latestAssessment: (userId: string) => ['assessments', 'latest', userId] as const,
  
  communityPosts: ['community', 'posts'] as const,
  
  awarenessContent: ['awareness', 'content'] as const,
  awarenessItem: (id: string) => ['awareness', 'content', id] as const,
  
  scanHistory: (userId: string) => ['scanner', 'history', userId] as const,
  
  userStats: (userId: string) => ['analytics', 'stats', userId] as const,
  communityGroups: ['community', 'groups'] as const,
};

// Events hooks
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: [...queryKeys.events, filters],
    queryFn: () => eventsApi.getEvents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: [], // Provide empty array as initial data
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: () => eventsApi.getEvent(id),
    enabled: !!id,
  });
}

export function useUserRegistrations() {
  const user = useAppStore((state) => state.user);
  
  return useQuery({
    queryKey: queryKeys.userRegistrations(user?.id || ''),
    queryFn: () => eventsApi.getUserRegistrations(user!.id),
    enabled: !!user?.id,
    initialData: [], // Provide empty array as initial data
  });
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  
  return useMutation({
    mutationFn: (eventId: string) => eventsApi.registerForEvent(eventId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.userRegistrations(user.id) });
      }
    },
  });
}

export function useUnregisterFromEvent() {
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  
  return useMutation({
    mutationFn: (eventId: string) => eventsApi.unregisterFromEvent(eventId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.userRegistrations(user.id) });
      }
    },
  });
}

// Assessment hooks
export function useAssessmentQuestions() {
  return useQuery({
    queryKey: queryKeys.assessmentQuestions,
    queryFn: assessmentApi.getQuestions,
    staleTime: 30 * 60 * 1000, // 30 minutes - questions don't change often
  });
}

export function useUserAssessments() {
  const user = useAppStore((state) => state.user);
  
  return useQuery({
    queryKey: queryKeys.userAssessments(user?.id || ''),
    queryFn: () => assessmentApi.getUserAssessments(user!.id),
    enabled: !!user?.id,
  });
}

export function useLatestAssessment() {
  const user = useAppStore((state) => state.user);
  
  return useQuery({
    queryKey: queryKeys.latestAssessment(user?.id || ''),
    queryFn: () => assessmentApi.getLatestAssessment(user!.id),
    enabled: !!user?.id,
  });
}

export function useSaveAssessment() {
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  
  return useMutation({
    mutationFn: ({ answers, result }: { answers: AssessmentAnswer[]; result: RiskResult }) =>
      assessmentApi.saveAssessment(user!.id, answers, result),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.userAssessments(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.latestAssessment(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.userStats(user.id) });
      }
    },
  });
}

// Community hooks
export function useCommunityPosts(limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...queryKeys.communityPosts, limit, offset],
    queryFn: () => communityApi.getPosts(limit, offset),
    staleTime: 5 * 60 * 1000,
    initialData: { data: [], pagination: { page: 1, per_page: limit, total: 0, total_pages: 0 } }, // Provide empty data structure
  });
}

// Community groups hook
export function useCommunityGroups() {
  return useQuery({
    queryKey: queryKeys.communityGroups,
    queryFn: () => communityApi.getGroups(),
    staleTime: 5 * 60 * 1000,
    initialData: [], // Provide empty array as initial data
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: communityApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communityPosts });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  
  return useMutation({
    mutationFn: (postId: string) => communityApi.likePost(postId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communityPosts });
    },
  });
}

export function useUnlikePost() {
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  
  return useMutation({
    mutationFn: (postId: string) => communityApi.unlikePost(postId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communityPosts });
    },
  });
}

// Awareness content hooks
export function useAwarenessContent(filters?: ContentFilters) {
  return useQuery({
    queryKey: [...queryKeys.awarenessContent, filters],
    queryFn: () => awarenessApi.getContent(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    initialData: [], // Provide empty array as initial data
  });
}

export function useAwarenessItem(id: string) {
  return useQuery({
    queryKey: queryKeys.awarenessItem(id),
    queryFn: () => awarenessApi.getContentById(id),
    enabled: !!id,
  });
}

export function useLikeContent() {
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  
  return useMutation({
    mutationFn: (contentId: string) => awarenessApi.likeContent(contentId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.awarenessContent });
    },
  });
}

export function useBookmarkContent() {
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  
  return useMutation({
    mutationFn: (contentId: string) => awarenessApi.bookmarkContent(contentId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.awarenessContent });
    },
  });
}

// Scanner hooks
export function useScanHistory() {
  const user = useAppStore((state) => state.user);
  
  return useQuery({
    queryKey: queryKeys.scanHistory(user?.id || ''),
    queryFn: () => scannerApi.getScanHistory(user!.id),
    enabled: !!user?.id,
  });
}

export function useSaveScan() {
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  
  return useMutation({
    mutationFn: scannerApi.saveScanHistory,
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.scanHistory(user.id) });
      }
    },
  });
}

// Analytics hooks
export function useUserStats() {
  const user = useAppStore((state) => state.user);
  
  return useQuery({
    queryKey: queryKeys.userStats(user?.id || ''),
    queryFn: () => analyticsApi.getUserStats(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrackEvent() {
  const user = useAppStore((state) => state.user);
  
  return useMutation({
    mutationFn: ({ eventName, properties }: { eventName: string; properties: Record<string, any> }) =>
      analyticsApi.trackEvent(eventName, properties, user?.id),
  });
}

// Auth hooks
export function useSignUp() {
  const setUser = useAppStore((state) => state.setUser);
  
  return useMutation({
    mutationFn: ({ email, password, userData }: { email: string; password: string; userData?: any }) =>
      authApi.signUp(email, password, userData),
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user as any);
      }
    },
  });
}

export function useSignIn() {
  const setUser = useAppStore((state) => state.setUser);
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signIn(email, password),
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user as any);
      }
    },
  });
}

export function useSignOut() {
  const setUser = useAppStore((state) => state.setUser);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
    },
  });
}

export function useUpdateProfile() {
  const setUser = useAppStore((state) => state.setUser);
  
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user as any);
      }
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
} 