-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'viewer');
CREATE TYPE organization_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE certificate_status AS ENUM ('active', 'expired', 'revoked', 'pending');
CREATE TYPE certificate_type AS ENUM ('screening', 'education', 'support', 'general');
CREATE TYPE event_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'active', 'completed', 'cancelled');
CREATE TYPE event_type AS ENUM ('screening', 'education', 'fundraising', 'awareness', 'support');
CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected');
CREATE TYPE report_type AS ENUM ('event', 'monthly', 'quarterly', 'annual', 'custom');
CREATE TYPE activity_status AS ENUM ('success', 'failed', 'warning');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organizations table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    website TEXT,
    address TEXT,
    registration_status organization_status NOT NULL DEFAULT 'pending',
    certificate_status certificate_status,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.users(id),
    rejected_by UUID REFERENCES public.users(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Certificates table
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_number TEXT UNIQUE NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    certificate_type certificate_type NOT NULL,
    status certificate_status NOT NULL DEFAULT 'pending',
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    issued_by UUID NOT NULL REFERENCES public.users(id),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.users(id),
    revoked_reason TEXT,
    document_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_type event_type NOT NULL,
    status event_status NOT NULL DEFAULT 'draft',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    max_participants INTEGER,
    current_participants INTEGER NOT NULL DEFAULT 0,
    registration_deadline TIMESTAMPTZ,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    requirements TEXT[],
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.users(id),
    rejected_by UUID REFERENCES public.users(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reports table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    report_type report_type NOT NULL,
    status report_status NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.users(id),
    feedback TEXT,
    document_url TEXT,
    data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    resource_name TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    status activity_status NOT NULL DEFAULT 'success',
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_organizations_status ON public.organizations(registration_status);
CREATE INDEX idx_organizations_created_at ON public.organizations(created_at);
CREATE INDEX idx_certificates_organization_id ON public.certificates(organization_id);
CREATE INDEX idx_certificates_status ON public.certificates(status);
CREATE INDEX idx_certificates_expiry_date ON public.certificates(expiry_date);
CREATE INDEX idx_events_organization_id ON public.events(organization_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_reports_organization_id ON public.reports(organization_id);
CREATE INDEX idx_reports_event_id ON public.reports(event_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_resource ON public.activity_logs(resource);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate certificate numbers
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    next_number INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM 'CERT-' || year_part || '-(.*)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.certificates
    WHERE certificate_number LIKE 'CERT-' || year_part || '-%';
    
    sequence_part := LPAD(next_number::TEXT, 3, '0');
    
    RETURN 'CERT-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set certificate number
CREATE OR REPLACE FUNCTION set_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
        NEW.certificate_number := generate_certificate_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add certificate number trigger
CREATE TRIGGER set_certificate_number_trigger
    BEFORE INSERT ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION set_certificate_number();

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity(
    p_action TEXT,
    p_resource TEXT,
    p_resource_id TEXT,
    p_resource_name TEXT,
    p_user_id UUID,
    p_user_name TEXT,
    p_user_email TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_status activity_status DEFAULT 'success',
    p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.activity_logs (
        action, resource, resource_id, resource_name,
        user_id, user_name, user_email,
        ip_address, user_agent, status, details
    ) VALUES (
        p_action, p_resource, p_resource_id, p_resource_name,
        p_user_id, p_user_name, p_user_email,
        p_ip_address, p_user_agent, p_status, p_details
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
