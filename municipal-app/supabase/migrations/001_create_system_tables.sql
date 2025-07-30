-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing users table if it exists to avoid conflicts
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table with new role structure
CREATE TABLE public.users (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'municipal_admin', 'manager', 'staff', 'viewer')),
    municipality_id TEXT,
    department TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create municipality_accounts table
CREATE TABLE IF NOT EXISTS public.municipality_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    municipality_id TEXT UNIQUE NOT NULL,
    municipality_name TEXT NOT NULL,
    region_id TEXT NOT NULL,
    region_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
    admin_user_id UUID REFERENCES auth.users(id),
    contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    subscription JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE
);

-- Create user_invitations table
CREATE TABLE IF NOT EXISTS public.user_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    municipality_id TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'municipal_admin', 'manager', 'staff', 'viewer')),
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipality_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies to avoid recursion
-- System settings - only authenticated users can read, only service role can write
CREATE POLICY "Authenticated users can view system settings" ON public.system_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage system settings" ON public.system_settings
    FOR ALL USING (auth.role() = 'service_role');

-- Users table - users can view their own data, service role can manage all
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Municipality accounts - authenticated users can view, service role can manage
CREATE POLICY "Authenticated users can view municipality accounts" ON public.municipality_accounts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage municipality accounts" ON public.municipality_accounts
    FOR ALL USING (auth.role() = 'service_role');

-- User invitations - authenticated users can view, service role can manage
CREATE POLICY "Authenticated users can view invitations" ON public.user_invitations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage invitations" ON public.user_invitations
    FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for better performance (only if columns exist)
DO $$
BEGIN
    -- Check if municipality_id column exists before creating index
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'users' AND column_name = 'municipality_id') THEN
        CREATE INDEX IF NOT EXISTS idx_users_municipality_id ON public.users(municipality_id);
    END IF;

    -- Create other indexes
    CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
    CREATE INDEX IF NOT EXISTS idx_municipality_accounts_status ON public.municipality_accounts(status);
    CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON public.user_invitations(email);
    CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON public.user_invitations(token);
END $$;

-- Insert initial system setting to track setup
INSERT INTO public.system_settings (key, value, description) 
VALUES ('super_admin_created', 'false', 'Tracks whether the initial super admin account has been created')
ON CONFLICT (key) DO NOTHING;

-- Create a function to safely check if super admin exists
CREATE OR REPLACE FUNCTION public.check_super_admin_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE role = 'super_admin' 
        AND is_active = true
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_super_admin_exists() TO authenticated;
