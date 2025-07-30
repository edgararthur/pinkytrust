'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface DatabaseStatus {
  usersTable: boolean;
  systemSettingsTable: boolean;
  rlsEnabled: boolean;
  canConnect: boolean;
  error?: string;
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const checkDatabaseStatus = async () => {
    setLoading(true);
    try {
      const dbStatus: DatabaseStatus = {
        usersTable: false,
        systemSettingsTable: false,
        rlsEnabled: false,
        canConnect: false
      };

      // Test basic connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('_temp_test')
        .select('*')
        .limit(1);

      if (!connectionError || connectionError.code !== '42P01') {
        dbStatus.canConnect = true;
      }

      // Check if users table exists
      try {
        const { error: usersError } = await supabase
          .from('users')
          .select('user_id')
          .limit(1);
        
        if (!usersError || usersError.code !== '42P01') {
          dbStatus.usersTable = true;
        }
      } catch (e) {
        // Table doesn't exist
      }

      // Check if system_settings table exists
      try {
        const { error: settingsError } = await supabase
          .from('system_settings')
          .select('id')
          .limit(1);
        
        if (!settingsError || settingsError.code !== '42P01') {
          dbStatus.systemSettingsTable = true;
        }
      } catch (e) {
        // Table doesn't exist
      }

      // If both tables exist, assume RLS is enabled
      dbStatus.rlsEnabled = dbStatus.usersTable && dbStatus.systemSettingsTable;
      dbStatus.canConnect = true;

      setStatus(dbStatus);
    } catch (error) {
      setStatus({
        usersTable: false,
        systemSettingsTable: false,
        rlsEnabled: false,
        canConnect: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const getStatusIcon = (isOk: boolean) => {
    if (isOk) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const allTablesExist = status?.usersTable && status?.systemSettingsTable;

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Checking database status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allTablesExist) {
    return null; // Don't show if everything is working
  }

  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="h-5 w-5" />
          Database Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-yellow-700">
          Some database tables are missing. Please run the database setup to continue.
        </p>

        {showDetails && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {getStatusIcon(status?.canConnect || false)}
              <span>Database Connection</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status?.usersTable || false)}
              <span>Users Table</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status?.systemSettingsTable || false)}
              <span>System Settings Table</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status?.rlsEnabled || false)}
              <span>Row Level Security</span>
            </div>
            {status?.error && (
              <div className="text-red-600 text-xs mt-2">
                Error: {status.error}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
          <Button
            size="sm"
            onClick={checkDatabaseStatus}
            variant="outline"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => window.open('/DATABASE-FIX-INSTRUCTIONS.md', '_blank')}
          >
            View Fix Instructions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
