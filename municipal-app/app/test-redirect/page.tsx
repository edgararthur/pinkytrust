'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function TestRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Session check:', session);
        console.log('User email:', session?.user?.email);
        
        if (session?.user?.email === 'supervisor@municipal.gov') {
          console.log('Redirecting to super-admin...');
          router.replace('/super-admin');
        } else if (session) {
          console.log('Redirecting to dashboard...');
          router.replace('/dashboard');
        } else {
          console.log('No session, redirecting to login...');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/login');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Testing Redirect...</h1>
        <p className="text-gray-600">Checking authentication and redirecting...</p>
      </div>
    </div>
  );
}
