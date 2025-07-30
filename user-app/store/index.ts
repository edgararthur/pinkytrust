import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, Notification, AppError } from '@/types';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // UI state
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  isLoading: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // Error handling
  error: AppError | null;
  
  // Search
  searchQuery: string;
  searchHistory: string[];
  
  // Actions
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  setError: (error: AppError | null) => void;
  setSearchQuery: (query: string) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  theme: 'system' as const,
  sidebarOpen: false,
  isLoading: false,
  notifications: [],
  error: null,
  searchQuery: '',
  searchHistory: [],
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setUser: (user) => set(
          { user, isAuthenticated: !!user },
          false,
          'setUser'
        ),
        
        setTheme: (theme) => set(
          { theme },
          false,
          'setTheme'
        ),
        
        setSidebarOpen: (sidebarOpen) => set(
          { sidebarOpen },
          false,
          'setSidebarOpen'
        ),
        
        setLoading: (isLoading) => set(
          { isLoading },
          false,
          'setLoading'
        ),
        
        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: Math.random().toString(36).substring(2),
            timestamp: new Date().toISOString(),
            read: false,
          };
          
          set(
            (state) => ({
              notifications: [newNotification, ...state.notifications],
            }),
            false,
            'addNotification'
          );
        },
        
        removeNotification: (id) => set(
          (state) => ({
            notifications: state.notifications.filter(n => n.id !== id),
          }),
          false,
          'removeNotification'
        ),
        
        markNotificationAsRead: (id) => set(
          (state) => ({
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
          }),
          false,
          'markNotificationAsRead'
        ),
        
        clearNotifications: () => set(
          { notifications: [] },
          false,
          'clearNotifications'
        ),
        
        setError: (error) => set(
          { error },
          false,
          'setError'
        ),
        
        setSearchQuery: (searchQuery) => set(
          { searchQuery },
          false,
          'setSearchQuery'
        ),
        
        addToSearchHistory: (query) => {
          const { searchHistory } = get();
          const trimmedQuery = query.trim();
          
          if (!trimmedQuery || searchHistory.includes(trimmedQuery)) return;
          
          const newHistory = [trimmedQuery, ...searchHistory.slice(0, 9)]; // Keep last 10
          
          set(
            { searchHistory: newHistory },
            false,
            'addToSearchHistory'
          );
        },
        
        clearSearchHistory: () => set(
          { searchHistory: [] },
          false,
          'clearSearchHistory'
        ),
        
        reset: () => set(
          initialState,
          false,
          'reset'
        ),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          theme: state.theme,
          searchHistory: state.searchHistory,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// Selectors for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useTheme = () => useAppStore((state) => state.theme);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useUnreadNotifications = () => 
  useAppStore((state) => state.notifications.filter(n => !n.read));
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
export const useSearchQuery = () => useAppStore((state) => state.searchQuery);
export const useSearchHistory = () => useAppStore((state) => state.searchHistory); 