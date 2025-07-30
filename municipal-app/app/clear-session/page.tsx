'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function ClearSession() {
  const [status, setStatus] = useState('Checking session...');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setStatus(`Session found for: ${session.user.email}`);
    } else {
      setStatus('No active session');
    }
  };

  const clearSession = async () => {
    setStatus('Clearing session...');
    await supabase.auth.signOut();
    
    // Clear local storage
    localStorage.clear();
    sessionStorage.clear();
    
    setStatus('Session cleared! Redirecting to login...');
    
    setTimeout(() => {
      window.location.replace('/login');
    }, 1000);
  };

  const goToLogin = () => {
    window.location.replace('/login');
  };

  const goToDashboard = () => {
    window.location.replace('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Session Manager</h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Status:</p>
          <p className="font-mono text-sm bg-gray-100 p-2 rounded">{status}</p>
        </div>

        <div className="space-y-3">
          <Button onClick={clearSession} className="w-full" variant="outline">
            Clear Session & Logout
          </Button>
          
          <Button onClick={goToLogin} className="w-full">
            Go to Login
          </Button>
          
          <Button onClick={goToDashboard} className="w-full" variant="outline">
            Go to Dashboard
          </Button>
          
          <Button onClick={checkSession} className="w-full" variant="outline">
            Refresh Status
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Use this page to:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Clear stuck sessions</li>
            <li>Test redirects</li>
            <li>Debug login issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
