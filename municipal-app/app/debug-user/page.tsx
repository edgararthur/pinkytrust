'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function DebugUser() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get auth user
      const { data: { session } } = await supabase.auth.getSession();
      setAuthUser(session?.user || null);
      
      if (session?.user) {
        // Get database user
        const { data: dbUserData, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error loading db user:', error);
        } else {
          setDbUser(dbUserData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserMunicipality = async () => {
    if (!authUser) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ municipality_id: 'accra-metro' })
        .eq('user_id', authUser.id);
      
      if (error) {
        console.error('Error updating municipality:', error);
        alert('Error updating municipality: ' + error.message);
      } else {
        alert('Municipality updated successfully!');
        loadUserData();
      }
    } catch (error) {
      console.error('Error updating municipality:', error);
      alert('Error updating municipality');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">User Debug Information</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Auth User */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Auth User (Supabase Auth)</h2>
            {authUser ? (
              <div className="space-y-2">
                <div><strong>ID:</strong> {authUser.id}</div>
                <div><strong>Email:</strong> {authUser.email}</div>
                <div><strong>Created:</strong> {new Date(authUser.created_at).toLocaleString()}</div>
                
                <div className="mt-4">
                  <strong>User Metadata:</strong>
                  <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-auto">
                    {JSON.stringify(authUser.user_metadata, null, 2)}
                  </pre>
                </div>
                
                <div className="mt-4">
                  <strong>App Metadata:</strong>
                  <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-auto">
                    {JSON.stringify(authUser.app_metadata, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No auth user found</p>
            )}
          </div>

          {/* Database User */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Database User (public.users)</h2>
            {dbUser ? (
              <div className="space-y-2">
                <div><strong>User ID:</strong> {dbUser.user_id}</div>
                <div><strong>Email:</strong> {dbUser.email}</div>
                <div><strong>Name:</strong> {dbUser.first_name} {dbUser.last_name}</div>
                <div><strong>Role:</strong> {dbUser.role}</div>
                <div><strong>Municipality ID:</strong> {dbUser.municipality_id || 'NOT SET'}</div>
                <div><strong>Department:</strong> {dbUser.department || 'None'}</div>
                <div><strong>Phone:</strong> {dbUser.phone || 'None'}</div>
                <div><strong>Active:</strong> {dbUser.is_active ? 'Yes' : 'No'}</div>
                <div><strong>Created:</strong> {new Date(dbUser.created_at).toLocaleString()}</div>
                
                <div className="mt-4">
                  <strong>Full Record:</strong>
                  <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-auto">
                    {JSON.stringify(dbUser, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-red-500 mb-4">No database user record found!</p>
                <p className="text-sm text-gray-600">
                  This means the user exists in Supabase Auth but not in the public.users table.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Button onClick={loadUserData} variant="outline">
              Refresh Data
            </Button>
            
            {dbUser && !dbUser.municipality_id && (
              <Button onClick={updateUserMunicipality}>
                Assign Accra Metro Municipality
              </Button>
            )}
            
            <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
              Go to Dashboard
            </Button>
            
            <Button onClick={() => window.location.href = '/clear-session'} variant="outline">
              Clear Session
            </Button>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Diagnosis</h2>
          <div className="space-y-2 text-sm">
            {!authUser && (
              <div className="text-red-600">❌ No authenticated user found</div>
            )}
            {authUser && !dbUser && (
              <div className="text-red-600">❌ User exists in auth but not in database</div>
            )}
            {dbUser && !dbUser.municipality_id && (
              <div className="text-red-600">❌ User has no municipality assigned</div>
            )}
            {dbUser && dbUser.municipality_id && (
              <div className="text-green-600">✅ User has municipality assigned: {dbUser.municipality_id}</div>
            )}
            {authUser && dbUser && dbUser.municipality_id && (
              <div className="text-green-600">✅ User setup is complete</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
