-- Seed data for municipal application
-- This creates test users and sample data for development

-- Insert test users
INSERT INTO users (id, email, name, role, is_active, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'admin@municipal.gov', 'System Administrator', 'admin', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'moderator@municipal.gov', 'Content Moderator', 'moderator', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'viewer@municipal.gov', 'Data Viewer', 'viewer', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'john.doe@municipal.gov', 'John Doe', 'moderator', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'jane.smith@municipal.gov', 'Jane Smith', 'viewer', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample organizations
INSERT INTO organizations (id, name, description, contact_email, contact_phone, website, address, registration_status, submitted_at, created_at, updated_at) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', 'Pink Ribbon Foundation', 'Dedicated to breast cancer awareness and support', 'contact@pinkribbon.org', '+1-555-0101', 'https://pinkribbon.org', '123 Hope Street, City, State 12345', 'approved', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW()),
  ('660e8400-e29b-41d4-a716-446655440001', 'Women''s Health Alliance', 'Promoting women''s health and wellness', 'info@womenshealth.org', '+1-555-0102', 'https://womenshealth.org', '456 Wellness Ave, City, State 12345', 'approved', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', NOW()),
  ('660e8400-e29b-41d4-a716-446655440002', 'Community Care Network', 'Local community health support', 'hello@communitycare.org', '+1-555-0103', 'https://communitycare.org', '789 Community Blvd, City, State 12345', 'pending', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW()),
  ('660e8400-e29b-41d4-a716-446655440003', 'Hope & Healing Center', 'Cancer support and counseling services', 'support@hopehealing.org', '+1-555-0104', 'https://hopehealing.org', '321 Healing Way, City, State 12345', 'rejected', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO events (id, title, description, organization_id, event_type, status, start_date, end_date, location, max_participants, current_participants, created_at, updated_at) VALUES
  ('770e8400-e29b-41d4-a716-446655440000', 'Free Breast Cancer Screening', 'Community screening event with certified medical professionals', '660e8400-e29b-41d4-a716-446655440000', 'screening', 'approved', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days', 'Community Health Center', 100, 45, NOW() - INTERVAL '10 days', NOW()),
  ('770e8400-e29b-41d4-a716-446655440001', 'Breast Health Education Workshop', 'Educational workshop on breast health and self-examination', '660e8400-e29b-41d4-a716-446655440001', 'education', 'approved', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days', 'City Library Conference Room', 50, 32, NOW() - INTERVAL '8 days', NOW()),
  ('770e8400-e29b-41d4-a716-446655440002', 'Pink Walk Fundraiser', 'Annual charity walk to raise funds for breast cancer research', '660e8400-e29b-41d4-a716-446655440000', 'fundraising', 'pending', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days', 'City Park', 500, 0, NOW() - INTERVAL '3 days', NOW()),
  ('770e8400-e29b-41d4-a716-446655440003', 'Support Group Meeting', 'Monthly support group for breast cancer survivors', '660e8400-e29b-41d4-a716-446655440003', 'support', 'draft', NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days', 'Hope & Healing Center', 20, 0, NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample certificates
INSERT INTO certificates (id, organization_id, certificate_type, status, issued_date, expiry_date, issued_by, created_at, updated_at) VALUES
  ('880e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'screening', 'active', NOW() - INTERVAL '60 days', NOW() + INTERVAL '305 days', '550e8400-e29b-41d4-a716-446655440000', NOW() - INTERVAL '60 days', NOW()),
  ('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'education', 'active', NOW() - INTERVAL '45 days', NOW() + INTERVAL '320 days', '550e8400-e29b-41d4-a716-446655440000', NOW() - INTERVAL '45 days', NOW()),
  ('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'general', 'pending', NULL, NULL, NULL, NOW() - INTERVAL '5 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample reports
INSERT INTO reports (id, title, description, event_id, organization_id, report_type, status, submitted_at, created_at, updated_at) VALUES
  ('990e8400-e29b-41d4-a716-446655440000', 'Screening Event Report - October 2024', 'Comprehensive report on the October breast cancer screening event', '770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'event', 'approved', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW()),
  ('990e8400-e29b-41d4-a716-446655440001', 'Monthly Activity Report - November 2024', 'Monthly summary of all breast cancer awareness activities', NULL, '660e8400-e29b-41d4-a716-446655440001', 'monthly', 'under_review', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW()),
  ('990e8400-e29b-41d4-a716-446655440002', 'Q4 2024 Impact Report', 'Quarterly impact assessment and statistics', NULL, '660e8400-e29b-41d4-a716-446655440000', 'quarterly', 'draft', NULL, NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample activity logs
INSERT INTO activity_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, status, created_at) VALUES
  ('aa0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'approve_organization', 'organization', '660e8400-e29b-41d4-a716-446655440000', '{"organization_name": "Pink Ribbon Foundation", "previous_status": "pending", "new_status": "approved"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', NOW() - INTERVAL '30 days'),
  ('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'create_event', 'event', '770e8400-e29b-41d4-a716-446655440001', '{"event_title": "Breast Health Education Workshop", "organization": "Women''s Health Alliance"}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'success', NOW() - INTERVAL '8 days'),
  ('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'issue_certificate', 'certificate', '880e8400-e29b-41d4-a716-446655440000', '{"certificate_type": "screening", "organization": "Pink Ribbon Foundation"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', NOW() - INTERVAL '60 days'),
  ('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'view_reports', 'report', NULL, '{"filter": "monthly", "date_range": "2024-11"}', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', 'success', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;
