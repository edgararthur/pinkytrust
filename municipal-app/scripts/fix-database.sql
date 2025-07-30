-- Fix for missing municipality_id column error
-- Run this in your Supabase SQL Editor

-- First, let's check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check the current structure of users table if it exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop and recreate users table with correct structure
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table with all required columns
CREATE TABLE public.users (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer',
    municipality_id TEXT,
    department TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add role constraint
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('super_admin', 'municipal_admin', 'manager', 'staff', 'viewer'));

-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create municipality_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.municipality_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    municipality_id TEXT UNIQUE NOT NULL,
    municipality_name TEXT NOT NULL,
    region_id TEXT NOT NULL,
    region_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_user_id UUID REFERENCES auth.users(id),
    contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    subscription JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ
);

-- Add status constraint
ALTER TABLE public.municipality_accounts 
ADD CONSTRAINT municipality_accounts_status_check 
CHECK (status IN ('pending', 'active', 'suspended', 'inactive'));

-- Enable Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipality_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Service role can manage system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view municipality accounts" ON public.municipality_accounts;
DROP POLICY IF EXISTS "Service role can manage municipality accounts" ON public.municipality_accounts;

-- Create simple RLS policies
CREATE POLICY "Authenticated users can view system settings" ON public.system_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage system settings" ON public.system_settings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view municipality accounts" ON public.municipality_accounts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage municipality accounts" ON public.municipality_accounts
    FOR ALL USING (auth.role() = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_municipality_id ON public.users(municipality_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_municipality_accounts_status ON public.municipality_accounts(status);
CREATE INDEX IF NOT EXISTS idx_municipality_accounts_municipality_id ON public.municipality_accounts(municipality_id);

-- Insert initial system setting
INSERT INTO public.system_settings (key, value, description) 
VALUES ('super_admin_created', 'false', 'Tracks whether the initial super admin account has been created')
ON CONFLICT (key) DO NOTHING;

-- Verify the tables were created correctly
SELECT 'system_settings' as table_name, count(*) as row_count FROM public.system_settings
UNION ALL
SELECT 'users' as table_name, count(*) as row_count FROM public.users
UNION ALL
SELECT 'municipality_accounts' as table_name, count(*) as row_count FROM public.municipality_accounts;
