-- Complete Municipal Breast Cancer Awareness Platform Database Schema
-- This creates all required tables with proper relationships and RLS policies

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.user_invitations CASCADE;
DROP TABLE IF EXISTS public.municipality_accounts CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;

-- Create updated user roles enum
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('super_admin', 'municipal_admin', 'manager', 'staff', 'viewer');

-- Create other enums
CREATE TYPE organization_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE event_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'active', 'completed', 'cancelled');
CREATE TYPE event_type AS ENUM ('screening', 'education', 'fundraising', 'awareness', 'support');
CREATE TYPE certificate_status AS ENUM ('active', 'expired', 'revoked', 'pending');
CREATE TYPE certificate_type AS ENUM ('screening', 'education', 'support', 'general');
CREATE TYPE municipality_status AS ENUM ('pending', 'active', 'suspended', 'inactive');

-- System settings table
CREATE TABLE public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table with comprehensive fields
CREATE TABLE public.users (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    role user_role NOT NULL DEFAULT 'viewer',
    municipality_id TEXT,
    department TEXT,
    phone TEXT,
    profile_image_url TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Municipality accounts table
CREATE TABLE public.municipality_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    municipality_id TEXT UNIQUE NOT NULL,
    municipality_name TEXT NOT NULL,
    region_id TEXT NOT NULL,
    region_name TEXT NOT NULL,
    status municipality_status NOT NULL DEFAULT 'pending',
    admin_user_id UUID REFERENCES auth.users(id),
    contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    subscription JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ
);

-- Organizations table
CREATE TABLE public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT NOT NULL,
    municipality_id TEXT NOT NULL,
    organization_type TEXT NOT NULL,
    registration_number TEXT,
    contact_person TEXT NOT NULL,
    contact_position TEXT,
    website TEXT,
    description TEXT,
    status organization_status NOT NULL DEFAULT 'pending',
    documents JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    rejected_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_type event_type NOT NULL,
    status event_status NOT NULL DEFAULT 'draft',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    coordinates JSONB,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_deadline TIMESTAMPTZ,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    requirements TEXT[],
    images TEXT[],
    documents TEXT[],
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    rejected_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates table
CREATE TABLE public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_number TEXT UNIQUE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    certificate_type certificate_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status certificate_status NOT NULL DEFAULT 'pending',
    issued_by UUID REFERENCES auth.users(id),
    issued_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES auth.users(id),
    revocation_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User invitations table
CREATE TABLE public.user_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    municipality_id TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_role NOT NULL,
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    municipality_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipality_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies

-- System settings policies
CREATE POLICY "Super admins can manage system settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.user_id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Authenticated users can view system settings" ON public.system_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u2
            WHERE u2.user_id = auth.uid() 
            AND u2.role = 'super_admin'
        )
    );

CREATE POLICY "Municipal admins can manage users in their municipality" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u2
            WHERE u2.user_id = auth.uid() 
            AND u2.role IN ('super_admin', 'municipal_admin')
            AND (u2.role = 'super_admin' OR u2.municipality_id = users.municipality_id)
        )
    );

-- Municipality accounts policies
CREATE POLICY "Super admins can manage all municipality accounts" ON public.municipality_accounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.user_id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Municipal admins can view their municipality account" ON public.municipality_accounts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.user_id = auth.uid() 
            AND users.municipality_id = municipality_accounts.municipality_id
        )
    );

-- Organizations policies
CREATE POLICY "Users can view organizations in their municipality" ON public.organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.user_id = auth.uid() 
            AND (users.role = 'super_admin' OR users.municipality_id = organizations.municipality_id)
        )
    );

CREATE POLICY "Municipal staff can manage organizations in their municipality" ON public.organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.user_id = auth.uid() 
            AND users.role IN ('super_admin', 'municipal_admin', 'manager', 'staff')
            AND (users.role = 'super_admin' OR users.municipality_id = organizations.municipality_id)
        )
    );

-- Events policies
CREATE POLICY "Users can view events in their municipality" ON public.events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.organizations o ON o.id = events.organization_id
            WHERE u.user_id = auth.uid() 
            AND (u.role = 'super_admin' OR u.municipality_id = o.municipality_id)
        )
    );

CREATE POLICY "Municipal staff can manage events in their municipality" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.organizations o ON o.id = events.organization_id
            WHERE u.user_id = auth.uid() 
            AND u.role IN ('super_admin', 'municipal_admin', 'manager', 'staff')
            AND (u.role = 'super_admin' OR u.municipality_id = o.municipality_id)
        )
    );

-- Certificates policies
CREATE POLICY "Users can view certificates in their municipality" ON public.certificates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.organizations o ON o.id = certificates.organization_id
            WHERE u.user_id = auth.uid() 
            AND (u.role = 'super_admin' OR u.municipality_id = o.municipality_id)
        )
    );

CREATE POLICY "Municipal staff can manage certificates in their municipality" ON public.certificates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.organizations o ON o.id = certificates.organization_id
            WHERE u.user_id = auth.uid() 
            AND u.role IN ('super_admin', 'municipal_admin', 'manager', 'staff')
            AND (u.role = 'super_admin' OR u.municipality_id = o.municipality_id)
        )
    );

-- User invitations policies
CREATE POLICY "Municipal admins can manage invitations for their municipality" ON public.user_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.user_id = auth.uid() 
            AND users.role IN ('super_admin', 'municipal_admin')
            AND (users.role = 'super_admin' OR users.municipality_id = user_invitations.municipality_id)
        )
    );

-- Activity logs policies
CREATE POLICY "Users can view activity logs in their municipality" ON public.activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.user_id = auth.uid() 
            AND (users.role = 'super_admin' OR users.municipality_id = activity_logs.municipality_id)
        )
    );

CREATE POLICY "System can insert activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_users_municipality_id ON public.users(municipality_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_municipality_accounts_status ON public.municipality_accounts(status);
CREATE INDEX idx_municipality_accounts_municipality_id ON public.municipality_accounts(municipality_id);
CREATE INDEX idx_organizations_municipality_id ON public.organizations(municipality_id);
CREATE INDEX idx_organizations_status ON public.organizations(status);
CREATE INDEX idx_events_organization_id ON public.events(organization_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_certificates_organization_id ON public.certificates(organization_id);
CREATE INDEX idx_certificates_status ON public.certificates(status);
CREATE INDEX idx_user_invitations_email ON public.user_invitations(email);
CREATE INDEX idx_user_invitations_token ON public.user_invitations(token);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_resource_type ON public.activity_logs(resource_type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Insert initial system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('super_admin_created', 'true', 'Tracks whether the initial super admin account has been created'),
('system_version', '1.0.0', 'Current system version'),
('maintenance_mode', 'false', 'Whether the system is in maintenance mode'),
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
('allowed_file_types', '["jpg","jpeg","png","pdf","doc","docx"]', 'Allowed file types for uploads');

-- Create your super admin user
INSERT INTO public.users (user_id, email, first_name, last_name, role, is_active, created_at)
VALUES (
    'ce2f331b-cd40-4a1f-a2c0-ae8ab7749a73'::uuid,
    'supervisor@municipal.gov',
    'Health',
    'Supervisor', 
    'super_admin',
    true,
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    role = 'super_admin',
    first_name = 'Health',
    last_name = 'Supervisor',
    is_active = true,
    updated_at = NOW();

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_municipality_accounts_updated_at BEFORE UPDATE ON public.municipality_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_invitations_updated_at BEFORE UPDATE ON public.user_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
