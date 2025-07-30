import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);

    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected
      throw error;
    }

    // Test auth service
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        auth: authError ? 'error' : 'connected',
        api: 'operational'
      },
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: 'error',
        auth: 'unknown',
        api: 'operational'
      }
    }, { status: 503 });
  }
}
