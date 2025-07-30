import { supabase } from '../supabase/client';
import { UsersService } from './users';
import { User } from '../../shared/types/user';

/**
 * Service for handling authentication-related operations
 */
export class AuthService {
  /**
   * Authenticates a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns The authenticated user or null if authentication fails
   */
  static async login(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return null;
      }

      if (!data.user) {
        return null;
      }

      // Get the full user profile from the users table
      return await UsersService.getCurrentUser();
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  /**
   * Checks if a user is currently authenticated
   * @returns The current authenticated user or null if not authenticated
   */
  static async checkAuth(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        return null;
      }
      
      // Get the full user profile from the users table
      return await UsersService.getCurrentUser();
    } catch (error) {
      console.error('Auth check error:', error);
      return null;
    }
  }

  /**
   * Signs out the current user
   */
  static async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}