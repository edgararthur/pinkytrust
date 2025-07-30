import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import type { 
  User, 
  Organisation, 
  Certificate, 
  Event, 
  Report, 
  DashboardStats,
  Notification,
  ActivityLog
} from '@/types';
import { DashboardService, AuthService } from '@/lib/api';

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,

        login: async (email: string, password: string) => {
          set({ isLoading: true });
          try {
            const user = await AuthService.login(email, password);
            
            if (user) {
              set({ 
                user, 
                isAuthenticated: true, 
                isLoading: false 
              });
            } else {
              set({ user: null, isAuthenticated: false, isLoading: false });
              throw new Error('Invalid credentials');
            }
          } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            throw error;
          }
        },

        logout: async () => {
    try {
      await AuthService.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the local state even if the API call fails
      set({ user: null, isAuthenticated: false });
    }
        },

        updateUser: (userData: Partial<User>) => {
          const { user } = get();
          if (user) {
            set({ user: { ...user, ...userData } });
          }
        },

        checkAuth: async () => {
          set({ isLoading: true });
          try {
            const user = await AuthService.checkAuth();
            
            if (user) {
              set({ user, isAuthenticated: true, isLoading: false });
            } else {
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          } catch (error) {
            console.error('Auth check error:', error);
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user, 
          isAuthenticated: state.isAuthenticated 
        }),
      }
    ),
    { name: 'auth-store' }
  )
);

// Dashboard Store
interface DashboardState {
  stats: DashboardStats | null;
  recentActivity: ActivityLog[];
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchRecentActivity: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchAllDashboardData: () => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      stats: null,
      recentActivity: [],
      notifications: [],
      isLoading: false,
      error: null,

      fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
          // Use the DashboardService to fetch real data
          const stats = await DashboardService.getStats();
          set({ stats, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch stats',
            isLoading: false 
          });
        }
      },

      fetchRecentActivity: async () => {
        try {
          // Use the DashboardService to fetch real data
          const recentActivity = await DashboardService.getRecentActivity();
          set({ recentActivity });
        } catch (error) {
          console.error('Failed to fetch recent activity:', error);
        }
      },

      fetchNotifications: async () => {
        try {
          // Use the DashboardService to fetch real data
          const notifications = await DashboardService.getNotifications();
          set({ notifications });
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      },

      fetchAllDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
          // Fetch all dashboard data in parallel
          const [stats, recentActivity, notifications] = await Promise.all([
            DashboardService.getStats(),
            DashboardService.getRecentActivity(),
            DashboardService.getNotifications()
          ]);

          set({
            stats,
            recentActivity,
            notifications,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
            isLoading: false
          });
        }
      },

      markNotificationAsRead: async (id: string) => {
        try {
          // Update in the database
          await DashboardService.markNotificationAsRead(id);
          
          // Update local state
          const { notifications } = get();
          set({
            notifications: notifications.map(notification =>
              notification.id === id 
                ? { ...notification, read: true }
                : notification
            ),
          });
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'dashboard-store' }
  )
);

// UI Store
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: Record<string, boolean>;
  modals: Record<string, boolean>;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (key: string, loading: boolean) => void;
  setModal: (key: string, open: boolean) => void;
  toggleModal: (key: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        sidebarOpen: true,
        theme: 'light',
        loading: {},
        modals: {},

        setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
        
        toggleSidebar: () => {
          const { sidebarOpen } = get();
          set({ sidebarOpen: !sidebarOpen });
        },

        setTheme: (theme: 'light' | 'dark') => set({ theme }),

        setLoading: (key: string, loading: boolean) => {
          const { loading: currentLoading } = get();
          set({
            loading: {
              ...currentLoading,
              [key]: loading,
            },
          });
        },

        setModal: (key: string, open: boolean) => {
          const { modals } = get();
          set({
            modals: {
              ...modals,
              [key]: open,
            },
          });
        },

        toggleModal: (key: string) => {
          const { modals } = get();
          set({
            modals: {
              ...modals,
              [key]: !modals[key],
            },
          });
        },
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({ 
          sidebarOpen: state.sidebarOpen,
          theme: state.theme,
        }),
      }
    ),
    { name: 'ui-store' }
  )
);

// Data Store for caching
interface DataState {
  organisations: Organisation[];
  certificates: Certificate[];
  events: Event[];
  reports: Report[];
  lastFetch: Record<string, number>;
  setOrganisations: (organisations: Organisation[]) => void;
  setCertificates: (certificates: Certificate[]) => void;
  setEvents: (events: Event[]) => void;
  setReports: (reports: Report[]) => void;
  updateOrganisation: (id: string, data: Partial<Organisation>) => void;
  updateCertificate: (id: string, data: Partial<Certificate>) => void;
  updateEvent: (id: string, data: Partial<Event>) => void;
  updateReport: (id: string, data: Partial<Report>) => void;
  isDataStale: (key: string, maxAge?: number) => boolean;
  markFetched: (key: string) => void;
}

export const useDataStore = create<DataState>()(
  devtools(
    (set, get) => ({
      organisations: [],
      certificates: [],
      events: [],
      reports: [],
      lastFetch: {},

      setOrganisations: (organisations: Organisation[]) => set({ organisations }),
      setCertificates: (certificates: Certificate[]) => set({ certificates }),
      setEvents: (events: Event[]) => set({ events }),
      setReports: (reports: Report[]) => set({ reports }),

      updateOrganisation: (id: string, data: Partial<Organisation>) => {
        const { organisations } = get();
        set({
          organisations: organisations.map(org =>
            org.id === id ? { ...org, ...data } : org
          ),
        });
      },

      updateCertificate: (id: string, data: Partial<Certificate>) => {
        const { certificates } = get();
        set({
          certificates: certificates.map(cert =>
            cert.id === id ? { ...cert, ...data } : cert
          ),
        });
      },

      updateEvent: (id: string, data: Partial<Event>) => {
        const { events } = get();
        set({
          events: events.map(event =>
            event.id === id ? { ...event, ...data } : event
          ),
        });
      },

      updateReport: (id: string, data: Partial<Report>) => {
        const { reports } = get();
        set({
          reports: reports.map(report =>
            report.id === id ? { ...report, ...data } : report
          ),
        });
      },

      isDataStale: (key: string, maxAge = 5 * 60 * 1000) => { // 5 minutes default
        const { lastFetch } = get();
        const fetchTime = lastFetch[key];
        if (!fetchTime) return true;
        return Date.now() - fetchTime > maxAge;
      },

      markFetched: (key: string) => {
        const { lastFetch } = get();
        set({
          lastFetch: {
            ...lastFetch,
            [key]: Date.now(),
          },
        });
      },
    }),
    { name: 'data-store' }
  )
);
