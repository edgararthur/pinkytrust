'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function DebugAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Session check:', { session, error });
        setSession(session);

        if (session?.user) {
          setUser(session.user);
          
          // Try to fetch user from database
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            console.log('User data from DB:', { userData, userError });
          } catch (dbError) {
            console.log('Database error:', dbError);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const handleRedirect = () => {
    if (user?.email === 'supervisor@municipal.gov') {
      window.location.href = '/super-admin';
    } else {
      window.location.href = '/dashboard';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Checking Authentication...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Session Status</h2>
            <div className="space-y-2">
              <p><strong>Authenticated:</strong> {session ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              <p><strong>Email:</strong> {user?.email || 'None'}</p>
              <p><strong>Is Super Admin:</strong> {user?.email === 'supervisor@municipal.gov' ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              {session ? (
                <>
                  <button
                    onClick={handleRedirect}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <a
                  href="/login"
                  className="block w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-center"
                >
                  Go to Login
                </a>
              )}
            </div>
          </div>

          {/* Raw Data */}
          <div className="md:col-span-2 bg-gray-100 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Raw Session Data</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
