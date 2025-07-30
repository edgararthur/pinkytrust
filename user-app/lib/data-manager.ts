import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  syncApi, 
  cacheApi, 
  analyticsApi, 
  assessmentApi, 
  communityApi, 
  eventsApi,
  awarenessApi,
  scannerApi 
} from './api';

// Types for data management
export interface OfflineData {
  id: string;
  type: 'assessment' | 'community_post' | 'scan_history' | 'analytics_event';
  data: any;
  timestamp: number;
  userId?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  pendingSync: number;
  syncInProgress: boolean;
  syncError: string | null;
}

export interface DataManagerState {
  // Sync status
  syncStatus: SyncStatus;
  
  // Offline data queue
  offlineQueue: OfflineData[];
  
  // Cached data
  cachedData: {
    assessments: any[];
    communityPosts: any[];
    events: any[];
    awarenessContent: any[];
    scanHistory: any[];
    userStats: any;
  };
  
  // Data freshness timestamps
  dataTimestamps: {
    assessments: number | null;
    communityPosts: number | null;
    events: number | null;
    awarenessContent: number | null;
    scanHistory: number | null;
    userStats: number | null;
  };
  
  // Actions
  setSyncStatus: (status: Partial<SyncStatus>) => void;
  addToOfflineQueue: (data: Omit<OfflineData, 'id' | 'timestamp'>) => void;
  removeFromOfflineQueue: (id: string) => void;
  clearOfflineQueue: () => void;
  setCachedData: (key: keyof DataManagerState['cachedData'], data: any) => void;
  // Synchronous accessor for cached data
  getCachedData: (key: keyof DataManagerState['cachedData']) => any;
  updateDataTimestamp: (key: keyof DataManagerState['dataTimestamps']) => void;
  syncData: (userId: string) => Promise<void>;
  loadCachedData: (key: keyof DataManagerState['cachedData'], userId: string) => Promise<any>;
  refreshData: (userId: string, force?: boolean) => Promise<void>;
}

// Create the data manager store
export const useDataManager = create<DataManagerState>()(
  persist(
    (set, get) => ({
      syncStatus: {
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        lastSync: null,
        pendingSync: 0,
        syncInProgress: false,
        syncError: null,
      },
      
      offlineQueue: [],
      
      cachedData: {
        assessments: [],
        communityPosts: [],
        events: [],
        awarenessContent: [],
        scanHistory: [],
        userStats: null,
      },
      
      dataTimestamps: {
        assessments: null,
        communityPosts: null,
        events: null,
        awarenessContent: null,
        scanHistory: null,
        userStats: null,
      },
      
      setSyncStatus: (status) => {
        set((state) => ({
          syncStatus: { ...state.syncStatus, ...status }
        }));
      },
      
      addToOfflineQueue: (data) => {
        const offlineData: OfflineData = {
          ...data,
          id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          offlineQueue: [...state.offlineQueue, offlineData],
          syncStatus: {
            ...state.syncStatus,
            pendingSync: state.syncStatus.pendingSync + 1,
          },
        }));
      },
      
      removeFromOfflineQueue: (id) => {
        set((state) => ({
          offlineQueue: state.offlineQueue.filter(item => item.id !== id),
          syncStatus: {
            ...state.syncStatus,
            pendingSync: Math.max(0, state.syncStatus.pendingSync - 1),
          },
        }));
      },
      
      clearOfflineQueue: () => {
        set((state) => ({
          offlineQueue: [],
          syncStatus: {
            ...state.syncStatus,
            pendingSync: 0,
          },
        }));
      },
      
      setCachedData: (key, data) => {
        set((state) => ({
          cachedData: {
            ...state.cachedData,
            [key]: data || [], // Ensure data is never undefined
          },
        }));
        
        get().updateDataTimestamp(key);
      },

      // Return cached data synchronously (empty array if not present)
      getCachedData: (key) => {
        const state = get();
        return state.cachedData[key] || [];
      },
      
      updateDataTimestamp: (key) => {
        set((state) => ({
          dataTimestamps: {
            ...state.dataTimestamps,
            [key]: Date.now(),
          },
        }));
      },
      
      syncData: async (userId: string) => {
        const state = get();
        
        if (state.syncStatus.syncInProgress || !state.syncStatus.isOnline) {
          return;
        }
        
        try {
          set((state) => ({
            syncStatus: {
              ...state.syncStatus,
              syncInProgress: true,
              syncError: null,
            },
          }));
          
          // Upload offline data first
          if (state.offlineQueue.length > 0) {
            const results = await syncApi.uploadOfflineData(state.offlineQueue);
            
            // Remove successfully synced items
            const successfulIds = results
              .filter(result => result.success)
              .map(result => result.id);
            
            successfulIds.forEach(id => {
              get().removeFromOfflineQueue(id);
            });
          }
          
          // Sync fresh data from server
          const syncedData = await syncApi.syncUserData(userId);
          
          // Update cached data with fallbacks
          set((state) => ({
            cachedData: {
              assessments: syncedData?.assessments || [],
              communityPosts: syncedData?.posts || [],
              events: [], // Will be loaded separately
              awarenessContent: syncedData?.bookmarks || [],
              scanHistory: syncedData?.scanHistory || [],
              userStats: null, // Will be loaded separately
            },
            syncStatus: {
              ...state.syncStatus,
              lastSync: syncedData?.lastSync || new Date().toISOString(),
              syncInProgress: false,
            },
          }));
          
          // Update all timestamps
          Object.keys(get().dataTimestamps).forEach(key => {
            get().updateDataTimestamp(key as keyof DataManagerState['dataTimestamps']);
          });
          
        } catch (error) {
          console.error('Sync failed:', error);
          set((state) => ({
            syncStatus: {
              ...state.syncStatus,
              syncInProgress: false,
              syncError: error instanceof Error ? error.message : 'Sync failed',
            },
          }));
        }
      },
      
      loadCachedData: async (key, userId) => {
        const state = get();
        const timestamp = state.dataTimestamps[key];
        const maxAge = 5 * 60 * 1000; // 5 minutes
        
        // Check if cached data is fresh
        if (timestamp && Date.now() - timestamp < maxAge) {
          return state.cachedData[key] || [];
        }
        
        // Load fresh data
        try {
          let data;
          
          switch (key) {
            case 'assessments':
              data = await assessmentApi.getUserAssessments(userId);
              break;
            case 'communityPosts':
              const postsResponse = await communityApi.getPosts(20, 0);
              data = postsResponse?.data || [];
              break;
            case 'events':
              data = await eventsApi.getEvents();
              break;
            case 'awarenessContent':
              data = await awarenessApi.getContent();
              break;
            case 'scanHistory':
              data = await scannerApi.getScanHistory(userId);
              break;
            case 'userStats':
              data = await analyticsApi.getUserStats(userId);
              break;
            default:
              return state.cachedData[key] || [];
          }
          
          get().setCachedData(key, data || []); // Ensure data is never undefined
          return data || [];
          
        } catch (error) {
          console.error(`Failed to load ${key}:`, error);
          
          // Return cached data if available, or empty array
          return state.cachedData[key] || [];
        }
      },
      
      refreshData: async (userId: string, force = false) => {
        const state = get();
        
        if (!force && state.syncStatus.syncInProgress) {
          return;
        }
        
        try {
          // Load all data types in parallel
          const dataPromises = Object.keys(state.cachedData).map(async (key) => {
            if (force) {
              // Clear timestamp to force refresh
              set((state) => ({
                dataTimestamps: {
                  ...state.dataTimestamps,
                  [key]: null,
                },
              }));
            }
            
            return get().loadCachedData(
              key as keyof DataManagerState['cachedData'], 
              userId
            );
          });
          
          await Promise.allSettled(dataPromises);
          
        } catch (error) {
          console.error('Data refresh failed:', error);
        }
      },
    }),
    {
      name: 'data-manager-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        offlineQueue: state.offlineQueue,
        cachedData: state.cachedData,
        dataTimestamps: state.dataTimestamps,
        syncStatus: {
          ...state.syncStatus,
          syncInProgress: false, // Reset on app restart
        },
      }),
    }
  )
);

// Network status monitoring
export const initializeNetworkMonitoring = () => {
  if (typeof window === 'undefined') return;
  
  const updateOnlineStatus = () => {
    useDataManager.getState().setSyncStatus({
      isOnline: navigator.onLine,
    });
    
    // Trigger sync when coming back online
    if (navigator.onLine) {
      const userId = getCurrentUserId(); // You'll need to implement this
      if (userId) {
        useDataManager.getState().syncData(userId);
      }
    }
  };
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial status
  updateOnlineStatus();
  
  return () => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  };
};

// Helper function to get current user ID (implement based on your auth system)
const getCurrentUserId = (): string | null => {
  // This should integrate with your authentication system
  if (typeof window !== 'undefined') {
    return localStorage.getItem('current_user_id');
  }
  return null;
};

// Auto-sync interval
export const startAutoSync = (userId: string, intervalMs: number = 5 * 60 * 1000) => {
  const interval = setInterval(() => {
    const state = useDataManager.getState();
    if (state.syncStatus.isOnline && !state.syncStatus.syncInProgress) {
      state.syncData(userId);
    }
  }, intervalMs);
  
  return () => clearInterval(interval);
};

export default useDataManager;
