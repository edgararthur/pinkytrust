import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // This is the service role key, not anon key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    // Get the current user to verify they're a super admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user with the regular client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Check if user is super admin
    if (user.email !== 'supervisor@municipal.gov') {
      return NextResponse.json(
        { success: false, error: 'Insufficient privileges' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      regionId,
      regionName,
      municipalityId,
      municipalityName,
      department
    } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !regionId || !municipalityId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth using admin client
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Bypass email verification
      user_metadata: {
        role: 'municipal_admin',
        first_name: firstName,
        last_name: lastName,
        municipality_id: municipalityId,
        municipality_name: municipalityName,
        region_id: regionId,
        region_name: regionName
      }
    });

    if (authCreateError) {
      console.error('Auth creation error:', authCreateError);
      return NextResponse.json(
        { success: false, error: authCreateError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create auth user' },
        { status: 500 }
      );
    }

    // Create user record in public.users table
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        user_id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'municipal_admin',
        municipality_id: municipalityId,
        department: department || null,
        phone: phone || null,
        is_active: true
      });

    if (dbError) {
      console.error('Database creation error:', dbError);
      
      // If database insert fails, try to delete the auth user to maintain consistency
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError);
      }

      return NextResponse.json(
        { success: false, error: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user_id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        municipality_name: municipalityName,
        region_name: regionName
      }
    });

  } catch (error) {
    console.error('Create user API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
