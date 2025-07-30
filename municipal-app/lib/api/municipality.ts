import { supabase } from '@/lib/supabase/client';
import { BaseApiService } from './base';
import type { MunicipalityAccount, MunicipalityRegistration, CreateUserRequest, UserInvitation } from '@/types';

export class MunicipalityService extends BaseApiService {
  /**
   * Register a new municipality
   */
  static async registerMunicipality(registration: MunicipalityRegistration): Promise<MunicipalityAccount> {
    try {
      // Create admin user first
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: registration.adminUser.email,
        password: this.generateTemporaryPassword(),
        options: {
          data: {
            firstName: registration.adminUser.firstName,
            lastName: registration.adminUser.lastName,
            role: 'municipal_admin',
            municipalityId: registration.municipalityId,
            position: registration.adminUser.position
          }
        }
      });

      if (authError) throw authError;
      if (!authUser.user) throw new Error('Failed to create user');

      // Create user record in users table
      const { error: userError } = await supabase.from('users').insert({
        user_id: authUser.user.id,
        email: registration.adminUser.email,
        first_name: registration.adminUser.firstName,
        last_name: registration.adminUser.lastName,
        role: 'municipal_admin',
        municipality_id: registration.municipalityId,
        is_active: true
      });

      if (userError) throw userError;

      // Create municipality account record
      const municipalityAccount = {
        municipality_id: registration.municipalityId,
        admin_user_id: authUser.user.id,
        status: 'pending',
        contact_info: registration.contactInfo,
        settings: {
          timezone: registration.preferences.timezone,
          language: registration.preferences.language,
          features: registration.preferences.features
        },
        subscription: {
          plan: 'basic',
          startDate: new Date().toISOString(),
          isActive: true
        }
      };

      const { data: account, error: accountError } = await supabase
        .from('municipality_accounts')
        .insert(municipalityAccount)
        .select('*, municipalities(name, code, region, district)')
        .single();

      if (accountError) throw accountError;

      // Send welcome email with temporary password
      await this.sendWelcomeEmail(registration.adminUser.email, {
        municipalityName: account.municipalities.name,
        adminName: `${registration.adminUser.firstName} ${registration.adminUser.lastName}`,
        temporaryPassword: 'Will be sent separately for security'
      });

      return {
        id: account.id,
        municipalityId: account.municipality_id,
        municipalityName: account.municipalities.name,
        regionId: account.municipalities.region,
        regionName: account.municipalities.region,
        status: account.status,
        adminUserId: account.admin_user_id,
        contactInfo: account.contact_info,
        settings: account.settings,
        subscription: account.subscription,
        createdAt: account.created_at,
        updatedAt: account.updated_at
      };
    } catch (error) {
      console.error('Error registering municipality:', error);
      throw new Error('Failed to register municipality');
    }
  }

  /**
   * Get all municipality accounts
   */
  static async getMunicipalityAccounts(): Promise<MunicipalityAccount[]> {
    try {
      const { data, error } = await supabase
        .from('municipality_accounts')
        .select('*, municipalities(name, code, region, district)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(account => ({
        id: account.id,
        municipalityId: account.municipality_id,
        municipalityName: account.municipalities.name,
        regionId: account.municipalities.region,
        regionName: account.municipalities.region,
        status: account.status,
        adminUserId: account.admin_user_id,
        contactInfo: account.contact_info,
        settings: account.settings,
        subscription: account.subscription,
        createdAt: account.created_at,
        updatedAt: account.updated_at
      }));
    } catch (error) {
      console.error('Error fetching municipality accounts:', error);
      throw new Error('Failed to fetch municipality accounts');
    }
  }

  /**
   * Get municipality account by ID
   */
  static async getMunicipalityAccount(id: string): Promise<MunicipalityAccount> {
    try {
      const { data, error } = await supabase
        .from('municipality_accounts')
        .select('*, municipalities(name, code, region, district)')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Municipality account not found');

      return {
        id: data.id,
        municipalityId: data.municipality_id,
        municipalityName: data.municipalities.name,
        regionId: data.municipalities.region,
        regionName: data.municipalities.region,
        status: data.status,
        adminUserId: data.admin_user_id,
        contactInfo: data.contact_info,
        settings: data.settings,
        subscription: data.subscription,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching municipality account:', error);
      throw new Error('Failed to fetch municipality account');
    }
  }

  /**
   * Update municipality account status
   */
  static async updateMunicipalityStatus(
    id: string, 
    status: MunicipalityAccount['status']
  ): Promise<MunicipalityAccount> {
    try {
      const { data, error } = await supabase
        .from('municipality_accounts')
        .update({ status })
        .eq('id', id)
        .select('*, municipalities(name, code, region, district)')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Municipality account not found');

      return {
        id: data.id,
        municipalityId: data.municipality_id,
        municipalityName: data.municipalities.name,
        regionId: data.municipalities.region,
        regionName: data.municipalities.region,
        status: data.status,
        adminUserId: data.admin_user_id,
        contactInfo: data.contact_info,
        settings: data.settings,
        subscription: data.subscription,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error updating municipality status:', error);
      throw new Error('Failed to update municipality status');
    }
  }

  /**
   * Create user within municipality
   */
  static async createMunicipalityUser(
    municipalityId: string,
    userRequest: CreateUserRequest
  ): Promise<UserInvitation> {
    try {
      // Get current user for invited_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate invitation token and expiry
      const token = this.generateInvitationToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const invitation = {
        municipality_id: municipalityId,
        email: userRequest.email,
        role: userRequest.role,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        token
      };

      const { data, error } = await supabase
        .from('user_invitations')
        .insert(invitation)
        .select()
        .single();

      if (error) throw error;

      // Send invitation email
      await this.sendInvitationEmail(userRequest.email, {
        municipalityName: 'Municipality Name', // Would be resolved from context
        inviterName: `${user.user_metadata.firstName} ${user.user_metadata.lastName}`,
        role: userRequest.role,
        invitationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${token}`
      });

      return {
        id: data.id,
        municipalityId: data.municipality_id,
        email: data.email,
        role: data.role,
        invitedBy: data.invited_by,
        invitedAt: data.invited_at,
        expiresAt: data.expires_at,
        status: data.status,
        token: data.token
      };
    } catch (error) {
      console.error('Error creating municipality user:', error);
      throw new Error('Failed to create municipality user');
    }
  }

  /**
   * Helper methods
   */
  private static generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase();
  }

  private static generateInvitationToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private static async sendWelcomeEmail(email: string, data: any): Promise<void> {
    // Implementation would integrate with email service
    console.log('Sending welcome email to:', email, data);
  }

  private static async sendInvitationEmail(email: string, data: any): Promise<void> {
    // Implementation would integrate with email service
    console.log('Sending invitation email to:', email, data);
  }
}
