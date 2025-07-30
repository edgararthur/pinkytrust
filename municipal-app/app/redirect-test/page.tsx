'use client';

import { useEffect, useState } from 'react';

export default function RedirectTest() {
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testRedirect = (method, url) => {
    addLog(`Testing ${method} redirect to ${url}`);
    
    try {
      switch (method) {
        case 'href':
          window.location.href = url;
          break;
        case 'replace':
          window.location.replace(url);
          break;
        case 'assign':
          window.location.assign(url);
          break;
        case 'reload':
          window.location.reload();
          break;
      }
    } catch (error) {
      addLog(`❌ ${method} failed: ${error.message}`);
    }
  };

  useEffect(() => {
    addLog('Redirect test page loaded');
    addLog(`Current URL: ${window.location.href}`);
    addLog(`Current pathname: ${window.location.pathname}`);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Redirect Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Different Redirect Methods</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => testRedirect('href', '/super-admin')}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              window.location.href
            </button>
            
            <button
              onClick={() => testRedirect('replace', '/super-admin')}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              window.location.replace
            </button>
            
            <button
              onClick={() => testRedirect('assign', '/super-admin')}
              className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              window.location.assign
            </button>
            
            <a
              href="/super-admin"
              className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 text-center"
            >
              HTML Link
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Other Tests</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/login"
              className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 text-center"
            >
              Go to Login
            </a>
            
            <a
              href="/test-super-admin"
              className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 text-center"
            >
              Go to Test Super Admin
            </a>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-black text-green-400 p-6 rounded-lg font-mono text-sm">
          <h2 className="text-white text-lg font-semibold mb-4">Debug Logs</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
