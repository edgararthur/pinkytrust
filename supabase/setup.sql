-- Breast Cancer Platform Database Setup
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('municipal', 'organiser', 'user', 'volunteer')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    profile_image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create organisations table
CREATE TABLE organisations (
    organisation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    address TEXT,
    location GEOGRAPHY(POINT),
    website VARCHAR(255),
    description TEXT,
    registration_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected')),
    registration_number VARCHAR(100),
    document_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create certificates table
CREATE TABLE certificates (
    certificate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID REFERENCES organisations(organisation_id) ON DELETE CASCADE,
    issued_by UUID REFERENCES users(user_id),
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    certificate_url VARCHAR(255),
    qr_code VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID REFERENCES organisations(organisation_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT),
    address TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')),
    max_attendees INTEGER,
    flyer_url VARCHAR(255),
    contact_info TEXT,
    requirements TEXT,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create event_attendees table
CREATE TABLE event_attendees (
    attendee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'rsvp' CHECK (status IN ('rsvp', 'checked_in', 'cancelled')),
    check_in_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create volunteers table
CREATE TABLE volunteers (
    volunteer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    organisation_id UUID REFERENCES organisations(organisation_id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
    role VARCHAR(100),
    assigned_tasks TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
    organisation_id UUID REFERENCES organisations(organisation_id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES users(user_id),
    suspected_cases INTEGER DEFAULT 0,
    attendees_count INTEGER DEFAULT 0,
    report_details TEXT,
    document_url VARCHAR(255),
    images_urls TEXT[], -- Array of image URLs
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(user_id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT
);

-- Create support_requests table
CREATE TABLE support_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('financial', 'emotional', 'logistical', 'medical')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
    assigned_to UUID REFERENCES users(user_id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create self_assessments table
CREATE TABLE self_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
    responses JSONB NOT NULL,
    recommendations TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms', 'push', 'in_app')),
    title VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('sent', 'pending', 'failed')),
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create content table for awareness feed
CREATE TABLE content (
    content_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'video', 'audio', 'image')),
    body TEXT,
    media_url VARCHAR(255),
    thumbnail_url VARCHAR(255),
    author VARCHAR(255),
    tags TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create community_posts table for user discussions
CREATE TABLE community_posts (
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) CHECK (category IN ('story', 'question', 'support', 'general')),
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_moderated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create community_comments table
CREATE TABLE community_comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(post_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_organisations_status ON organisations(registration_status);
CREATE INDEX idx_events_location ON events USING GIST (location);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_certificates_organisation ON certificates(organisation_id);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_support_requests_status ON support_requests(status);
CREATE INDEX idx_support_requests_user ON support_requests(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_content_published ON content(is_published, published_at);
CREATE INDEX idx_community_posts_category ON community_posts(category);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organisations_updated_at BEFORE UPDATE ON organisations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_requests_updated_at BEFORE UPDATE ON support_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Municipal users can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'municipal'
        )
    );

CREATE POLICY "Municipal users can create users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'municipal'
        )
    );

-- Organisations table policies
CREATE POLICY "Everyone can view approved organisations" ON organisations
    FOR SELECT USING (registration_status = 'approved');

CREATE POLICY "Organisers can view their own organisation" ON organisations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'organiser'
        )
    );

CREATE POLICY "Municipal users can view all organisations" ON organisations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'municipal'
        )
    );

CREATE POLICY "Municipal users can create/update organisations" ON organisations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'municipal'
        )
    );

-- Events table policies
CREATE POLICY "Everyone can view active events" ON events
    FOR SELECT USING (status IN ('planned', 'ongoing'));

CREATE POLICY "Organisers can manage their organisation's events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN organisations o ON o.organisation_id = events.organisation_id
            WHERE u.user_id = auth.uid() AND u.role = 'organiser'
        )
    );

CREATE POLICY "Municipal users can view all events" ON events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'municipal'
        )
    );

-- Event attendees policies
CREATE POLICY "Users can view their own attendance" ON event_attendees
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" ON event_attendees
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance" ON event_attendees
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Organisers can view attendees for their events" ON event_attendees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events e
            JOIN organisations o ON o.organisation_id = e.organisation_id
            JOIN users u ON u.user_id = auth.uid()
            WHERE e.event_id = event_attendees.event_id 
            AND u.role = 'organiser'
        )
    );

-- Support requests policies
CREATE POLICY "Users can view their own support requests" ON support_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create support requests" ON support_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Municipal users can view all support requests" ON support_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'municipal'
        )
    );

-- Self assessments policies
CREATE POLICY "Users can view their own assessments" ON self_assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" ON self_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Content policies (awareness feed)
CREATE POLICY "Everyone can view published content" ON content
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Municipal users can manage all content" ON content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'municipal'
        )
    );

-- Community posts policies
CREATE POLICY "Everyone can view community posts" ON community_posts
    FOR SELECT USING (is_moderated = TRUE);

CREATE POLICY "Users can create community posts" ON community_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON community_posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Community comments policies
CREATE POLICY "Everyone can view comments on moderated posts" ON community_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM community_posts 
            WHERE post_id = community_comments.post_id 
            AND is_moderated = TRUE
        )
    );

CREATE POLICY "Users can create comments" ON community_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON community_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Organisers can view their own reports" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND user_id = reports.submitted_by
        )
    );

CREATE POLICY "Organisers can create reports" ON reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'organiser'
        )
    );

CREATE POLICY "Municipal users can view all reports" ON reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'municipal'
        )
    );

-- Certificates policies
CREATE POLICY "Organisers can view their organisation's certificates" ON certificates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organisations o
            JOIN users u ON u.user_id = auth.uid()
            WHERE o.organisation_id = certificates.organisation_id 
            AND u.role = 'organiser'
        )
    );

CREATE POLICY "Municipal users can manage all certificates" ON certificates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'municipal'
        )
    );

-- Volunteers policies
CREATE POLICY "Volunteers can view their own volunteer records" ON volunteers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organisers can manage volunteers for their organisation" ON volunteers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organisations o
            JOIN users u ON u.user_id = auth.uid()
            WHERE o.organisation_id = volunteers.organisation_id 
            AND u.role = 'organiser'
        )
    );

-- Insert sample data for development
INSERT INTO users (email, password_hash, role, first_name, last_name, phone) VALUES
('municipal@example.com', '$2a$10$dummy', 'municipal', 'John', 'Admin', '+1234567890'),
('organiser@example.com', '$2a$10$dummy', 'organiser', 'Sarah', 'Organiser', '+1234567891'),
('user@example.com', '$2a$10$dummy', 'user', 'Jane', 'User', '+1234567892');

INSERT INTO content (title, type, body, is_published, published_at) VALUES
('Understanding Breast Cancer', 'text', 'Breast cancer is one of the most common cancers affecting women worldwide...', TRUE, CURRENT_TIMESTAMP),
('Self-Examination Guide', 'video', 'Learn how to perform monthly self-examinations...', TRUE, CURRENT_TIMESTAMP),
('Nutrition and Prevention', 'text', 'Maintaining a healthy diet can help reduce breast cancer risk...', TRUE, CURRENT_TIMESTAMP);

-- Function to automatically update certificate status based on expiry
CREATE OR REPLACE FUNCTION update_certificate_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expiry_date <= CURRENT_DATE AND NEW.status = 'active' THEN
        NEW.status = 'expired';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_certificate_expiry
    BEFORE UPDATE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_certificate_status();

-- Function to calculate risk level from risk score
CREATE OR REPLACE FUNCTION calculate_risk_level(score INTEGER)
RETURNS VARCHAR(20) AS $$
BEGIN
    IF score < 30 THEN
        RETURN 'low';
    ELSIF score < 70 THEN
        RETURN 'medium';
    ELSE
        RETURN 'high';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set risk level when inserting self assessments
CREATE OR REPLACE FUNCTION set_risk_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.risk_level = calculate_risk_level(NEW.risk_score);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_assessment_risk_level
    BEFORE INSERT OR UPDATE ON self_assessments
    FOR EACH ROW
    EXECUTE FUNCTION set_risk_level();

COMMENT ON TABLE users IS 'Core user accounts with role-based access';
COMMENT ON TABLE organisations IS 'Registered organisations that can host events';
COMMENT ON TABLE events IS 'Breast cancer awareness and screening events';
COMMENT ON TABLE certificates IS 'Certificates issued to organisations by municipal office';
COMMENT ON TABLE reports IS 'Event reports submitted by organisers to municipal office';
COMMENT ON TABLE support_requests IS 'Support requests from users for various needs';
COMMENT ON TABLE self_assessments IS 'User self-assessment questionnaires for risk evaluation';
COMMENT ON TABLE content IS 'Educational content for awareness feed in user app';
COMMENT ON TABLE community_posts IS 'User-generated community posts and discussions';
COMMENT ON TABLE notifications IS 'System notifications sent to users via various channels'; 