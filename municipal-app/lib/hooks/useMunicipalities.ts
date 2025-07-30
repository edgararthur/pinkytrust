import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Municipality = Database['public']['Tables']['municipalities']['Row'];

export function useMunicipalities() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMunicipalities() {
      try {
        const { data, error } = await supabase
          .from('municipalities')
          .select('*')
          .order('name');

        if (error) throw error;

        setMunicipalities(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching municipalities:', err);
        setError('Failed to load municipalities');
        setMunicipalities([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMunicipalities();
  }, []);

  return { municipalities, loading, error };
} 