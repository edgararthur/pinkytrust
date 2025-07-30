/**
 * Ghana Administrative Divisions API Service
 * Integrates with the Ghana Regions and Districts API
 */

import { supabase } from '@/lib/supabase/client';

export interface GhanaRegion {
  code: string;
  label: string;
}

export interface MunicipalityData {
  id: string;
  name: string;
  code: string;
  type: string;
  capital: string;
  regionId: string;
  regionName: string;
  isRegistered: boolean;
}

export default class GhanaAdminService {
  /**
   * Get all regions
   */
  static async getAllRegions(): Promise<GhanaRegion[]> {
    try {
      const { data, error } = await supabase
        .from('municipalities')
        .select('region')
        .order('region');

      if (error) throw error;

      // Get unique regions and format them
      const uniqueRegions = Array.from(new Set(data.map(m => m.region)));
      return uniqueRegions.map(region => ({
        code: region.toLowerCase().replace(/\s+/g, '-'),
        label: region
      }));
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw new Error('Failed to fetch regions');
    }
  }

  /**
   * Get all municipalities
   */
  static async getAllMunicipalities(): Promise<MunicipalityData[]> {
    try {
      const { data: municipalities, error: municipalitiesError } = await supabase
        .from('municipalities')
        .select('*')
        .order('name');

      if (municipalitiesError) throw municipalitiesError;

      // Get registered municipalities to check which ones are already registered
      const { data: registeredMunicipalities, error: registeredError } = await supabase
        .from('municipality_accounts')
        .select('municipality_id');

      if (registeredError) throw registeredError;

      const registeredIds = new Set(registeredMunicipalities.map(m => m.municipality_id));

      return municipalities.map(m => ({
        id: m.id,
        name: m.name,
        code: m.code,
        type: m.type || 'Municipal',
        capital: m.capital || m.name,
        regionId: m.region.toLowerCase().replace(/\s+/g, '-'),
        regionName: m.region,
        isRegistered: registeredIds.has(m.id)
      }));
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      throw new Error('Failed to fetch municipalities');
    }
  }

  /**
   * Get municipality by ID
   */
  static async getMunicipalityById(id: string): Promise<MunicipalityData | null> {
    try {
      const { data: municipality, error: municipalityError } = await supabase
        .from('municipalities')
        .select('*')
        .eq('id', id)
        .single();

      if (municipalityError) throw municipalityError;
      if (!municipality) return null;

      // Check if municipality is registered
      const { data: registeredMunicipality, error: registeredError } = await supabase
        .from('municipality_accounts')
        .select('municipality_id')
        .eq('municipality_id', id)
        .single();

      if (registeredError && registeredError.code !== 'PGRST116') throw registeredError;

      return {
        id: municipality.id,
        name: municipality.name,
        code: municipality.code,
        type: municipality.type || 'Municipal',
        capital: municipality.capital || municipality.name,
        regionId: municipality.region.toLowerCase().replace(/\s+/g, '-'),
        regionName: municipality.region,
        isRegistered: !!registeredMunicipality
      };
    } catch (error) {
      console.error('Error fetching municipality:', error);
      throw new Error('Failed to fetch municipality');
    }
  }
}
