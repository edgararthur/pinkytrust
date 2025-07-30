'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestSuperAdmin() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const checkAuth = async () => {
      addLog('Starting auth check...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        addLog(`Session result: ${session ? 'Found' : 'None'}, Error: ${error ? error.message : 'None'}`);
        
        if (session) {
          addLog(`User: ${session.user.email}`);
          addLog(`User ID: ${session.user.id}`);
          addLog(`Metadata: ${JSON.stringify(session.user.user_metadata)}`);
          setSession(session);
          
          if (session.user.email === 'supervisor@municipal.gov') {
            addLog('✅ Super admin access granted');
          } else {
            addLog('❌ Not super admin');
          }
        } else {
          addLog('❌ No session found');
        }
      } catch (error) {
        addLog(`❌ Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Testing Super Admin Access...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Super Admin Access Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Access Status</h2>
            {session ? (
              <div className="space-y-2">
                <p className="text-green-600 font-semibold">✅ Authenticated</p>
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>User ID:</strong> {session.user.id}</p>
                <p><strong>Is Super Admin:</strong> {session.user.email === 'supervisor@municipal.gov' ? '✅ Yes' : '❌ No'}</p>
              </div>
            ) : (
              <p className="text-red-600 font-semibold">❌ Not Authenticated</p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              {session?.user?.email === 'supervisor@municipal.gov' ? (
                <a
                  href="/super-admin"
                  className="block w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-center"
                >
                  Go to Real Super Admin Dashboard
                </a>
              ) : (
                <div className="text-gray-500">Super admin access required</div>
              )}
              
              <a
                href="/login"
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="mt-8 bg-black text-green-400 p-6 rounded-lg font-mono text-sm">
          <h2 className="text-white text-lg font-semibold mb-4">Debug Logs</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>

        {/* Raw Session Data */}
        {session && (
          <div className="mt-8 bg-gray-200 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Raw Session Data</h2>
            <pre className="text-xs overflow-auto bg-white p-4 rounded">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
