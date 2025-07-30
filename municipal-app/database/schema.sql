-- Municipal Application Database Schema
-- This schema supports the breast cancer awareness platform municipal dashboard

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'viewer');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE certificate_status AS ENUM ('active', 'expired', 'revoked', 'pending');
CREATE TYPE event_status AS ENUM ('planned', 'ongoing', 'completed', 'cancelled');
CREATE TYPE report_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE certificate_type AS ENUM ('screening', 'education', 'support', 'general');
CREATE TYPE event_type AS ENUM ('screening', 'education', 'support', 'awareness', 'fundraising');

-- Users table for municipal staff
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    address TEXT,
    website VARCHAR(255),
    description TEXT,
    registration_status registration_status DEFAULT 'pending',
    registration_number VARCHAR(50) UNIQUE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    document_url TEXT,
    events_count INTEGER DEFAULT 0,
    certificate_status certificate_status DEFAULT 'none',
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates table
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    organisation_name VARCHAR(255) NOT NULL,
    status certificate_status DEFAULT 'pending',
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    issued_by UUID NOT NULL REFERENCES users(id),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES users(id),
    revoked_reason TEXT,
    certificate_type certificate_type NOT NULL,
    document_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    organisation_name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    coordinates JSONB, -- {lat: number, lng: number}
    status event_status DEFAULT 'planned',
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    checked_in_attendees INTEGER DEFAULT 0,
    volunteers_count INTEGER DEFAULT 0,
    suspected_cases INTEGER DEFAULT 0,
    report_submitted BOOLEAN DEFAULT false,
    report_status report_status,
    event_type event_type NOT NULL,
    tags TEXT[],
    images TEXT[],
    documents TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_title VARCHAR(255) NOT NULL,
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    organisation_name VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_by VARCHAR(255) NOT NULL,
    status report_status DEFAULT 'pending',
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    data JSONB NOT NULL, -- Report data structure
    attachments JSONB, -- Array of attachment objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table for audit trail
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User permissions junction table
CREATE TABLE user_permissions (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, permission_id)
);

-- Create indexes for better performance
CREATE INDEX idx_organisations_status ON organisations(registration_status);
CREATE INDEX idx_organisations_certificate_status ON organisations(certificate_status);
CREATE INDEX idx_organisations_created_at ON organisations(created_at);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_organisation_id ON certificates(organisation_id);
CREATE INDEX idx_certificates_expiry_date ON certificates(expiry_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_organisation_id ON events(organisation_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_event_id ON reports(event_id);
CREATE INDEX idx_reports_organisation_id ON reports(organisation_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource, resource_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organisations_updated_at BEFORE UPDATE ON organisations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create dashboard statistics view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM organisations) as total_organisations,
    (SELECT COUNT(*) FROM organisations WHERE registration_status = 'approved') as active_organisations,
    (SELECT COUNT(*) FROM organisations WHERE registration_status = 'pending') as pending_organisations,
    (SELECT COUNT(*) FROM events) as total_events,
    (SELECT COUNT(*) FROM events WHERE status IN ('planned', 'ongoing')) as active_events,
    (SELECT COUNT(*) FROM events WHERE status = 'completed') as completed_events,
    (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
    (SELECT COUNT(*) FROM reports) as total_reports,
    (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports,
    (SELECT COUNT(*) FROM certificates) as total_certificates,
    (SELECT COUNT(*) FROM certificates WHERE status = 'active') as active_certificates,
    (SELECT COUNT(*) FROM certificates WHERE status = 'active' AND expiry_date <= CURRENT_DATE + INTERVAL '30 days') as expiring_soon_certificates,
    (SELECT COALESCE(SUM((data->>'attendeesCount')::integer), 0) FROM reports WHERE status = 'approved') as total_screenings,
    (SELECT COALESCE(SUM(suspected_cases), 0) FROM events WHERE status = 'completed') as suspected_cases,
    (SELECT COALESCE(SUM((data->>'referralsMade')::integer), 0) FROM reports WHERE status = 'approved') as referrals_made;

-- Insert default permissions
INSERT INTO permissions (name, resource, action, description) VALUES
('view_dashboard', 'dashboard', 'read', 'View dashboard statistics and overview'),
('manage_organisations', 'organisations', 'create', 'Create new organisations'),
('view_organisations', 'organisations', 'read', 'View organisation details'),
('update_organisations', 'organisations', 'update', 'Update organisation information'),
('delete_organisations', 'organisations', 'delete', 'Delete organisations'),
('approve_organisations', 'organisations', 'approve', 'Approve organisation registrations'),
('reject_organisations', 'organisations', 'reject', 'Reject organisation registrations'),
('manage_certificates', 'certificates', 'create', 'Issue new certificates'),
('view_certificates', 'certificates', 'read', 'View certificate details'),
('update_certificates', 'certificates', 'update', 'Update certificate information'),
('revoke_certificates', 'certificates', 'delete', 'Revoke certificates'),
('view_events', 'events', 'read', 'View event details'),
('update_events', 'events', 'update', 'Update event information'),
('manage_reports', 'reports', 'create', 'Manage event reports'),
('view_reports', 'reports', 'read', 'View event reports'),
('approve_reports', 'reports', 'approve', 'Approve event reports'),
('reject_reports', 'reports', 'reject', 'Reject event reports'),
('manage_users', 'users', 'create', 'Manage user accounts'),
('view_users', 'users', 'read', 'View user information'),
('update_users', 'users', 'update', 'Update user information'),
('view_activity_logs', 'activity_logs', 'read', 'View system activity logs');

-- Function to automatically update events count for organisations
CREATE OR REPLACE FUNCTION update_organisation_events_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE organisations 
        SET events_count = events_count + 1 
        WHERE id = NEW.organisation_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE organisations 
        SET events_count = events_count - 1 
        WHERE id = OLD.organisation_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update events count
CREATE TRIGGER update_events_count_trigger
    AFTER INSERT OR DELETE ON events
    FOR EACH ROW EXECUTE FUNCTION update_organisation_events_count();

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_user_name VARCHAR,
    p_action VARCHAR,
    p_resource VARCHAR,
    p_resource_id UUID,
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO activity_logs (
        user_id, user_name, action, resource, resource_id,
        details, ip_address, user_agent
    ) VALUES (
        p_user_id, p_user_name, p_action, p_resource, p_resource_id,
        p_details, p_ip_address, p_user_agent
    ) RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role
        FROM users
        WHERE id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM users u
        JOIN user_permissions up ON u.id = up.user_id
        JOIN permissions p ON up.permission_id = p.id
        WHERE u.id = auth.uid()
        AND u.is_active = true
        AND p.name = permission_name
    ) OR get_current_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "Managers can view staff users" ON users
    FOR SELECT USING (
        get_current_user_role() IN ('admin', 'manager')
        AND role IN ('staff', 'viewer')
    );

CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (get_current_user_role() = 'admin');

-- RLS Policies for organisations table
CREATE POLICY "Staff can view organisations" ON organisations
    FOR SELECT USING (user_has_permission('view_organisations'));

CREATE POLICY "Staff can manage organisations" ON organisations
    FOR ALL USING (user_has_permission('manage_organisations'));

-- RLS Policies for certificates table
CREATE POLICY "Staff can view certificates" ON certificates
    FOR SELECT USING (user_has_permission('view_certificates'));

CREATE POLICY "Staff can manage certificates" ON certificates
    FOR ALL USING (user_has_permission('manage_certificates'));

-- RLS Policies for events table
CREATE POLICY "Staff can view events" ON events
    FOR SELECT USING (user_has_permission('view_events'));

CREATE POLICY "Staff can update events" ON events
    FOR UPDATE USING (user_has_permission('update_events'));

-- RLS Policies for reports table
CREATE POLICY "Staff can view reports" ON reports
    FOR SELECT USING (user_has_permission('view_reports'));

CREATE POLICY "Staff can manage reports" ON reports
    FOR ALL USING (user_has_permission('manage_reports'));

-- RLS Policies for activity logs table
CREATE POLICY "Staff can view activity logs" ON activity_logs
    FOR SELECT USING (user_has_permission('view_activity_logs'));

CREATE POLICY "System can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- RLS Policies for permissions table
CREATE POLICY "All authenticated users can view permissions" ON permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for user_permissions table
CREATE POLICY "Users can view their own permissions" ON user_permissions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user permissions" ON user_permissions
    FOR ALL USING (get_current_user_role() = 'admin');
