import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmqiojagmheikgqwepoj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcWlvamFnbWhlaWtncXdlcG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzUyNzIsImV4cCI6MjA2NzcxMTI3Mn0.ijL1Z9HejqkV-gZZZspM4C9IwclvFxqAnl8_wYulGzQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

// Placeholder for dashboard stats function
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // This would normally come from the database
  return {
    total_organisations: 15,
    active_organisations: 12,
    pending_organisations: 3,
    total_events: 28,
    active_events: 5,
    completed_events: 23,
    total_users: 245,
    total_reports: 18,
    pending_reports: 2,
  };
}; 