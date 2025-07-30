-- Seed data for municipal breast cancer awareness platform

-- Insert sample users (these would normally be created through auth)
-- Note: In production, users are created through Supabase Auth
INSERT INTO public.users (id, email, name, role, is_active, last_login_at) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@municipal.gov', 'System Administrator', 'admin', true, NOW() - INTERVAL '1 hour'),
    ('00000000-0000-0000-0000-000000000002', 'supervisor@municipal.gov', 'Health Supervisor', 'moderator', true, NOW() - INTERVAL '2 hours'),
    ('00000000-0000-0000-0000-000000000003', 'analyst@municipal.gov', 'Data Analyst', 'viewer', true, NOW() - INTERVAL '1 day'),
    ('00000000-0000-0000-0000-000000000004', 'temp.user@municipal.gov', 'Temporary User', 'viewer', false, NOW() - INTERVAL '1 week');

-- Insert sample organizations
INSERT INTO public.organizations (id, name, description, contact_email, contact_phone, website, address, registration_status, approved_at, approved_by) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Pink Ribbon Foundation', 'Supporting breast cancer awareness and research through community outreach and education programs.', 'contact@pinkribbon.org', '+1-555-0123', 'https://pinkribbon.org', '123 Health Street, Medical City, MC 12345', 'approved', NOW() - INTERVAL '30 days', '00000000-0000-0000-0000-000000000001'),
    ('10000000-0000-0000-0000-000000000002', 'Women''s Health Alliance', 'Dedicated to improving women''s health outcomes through education, screening, and support services.', 'info@womenshealth.org', '+1-555-0124', 'https://womenshealth.org', '456 Wellness Avenue, Health District, HD 67890', 'approved', NOW() - INTERVAL '25 days', '00000000-0000-0000-0000-000000000001'),
    ('10000000-0000-0000-0000-000000000003', 'Community Care Network', 'Providing comprehensive healthcare services and support to underserved communities.', 'support@communitycare.org', '+1-555-0125', 'https://communitycare.org', '789 Community Boulevard, Care City, CC 11111', 'approved', NOW() - INTERVAL '20 days', '00000000-0000-0000-0000-000000000002'),
    ('10000000-0000-0000-0000-000000000004', 'Hope & Healing Center', 'Offering holistic support services for cancer patients and their families.', 'info@hopehealing.org', '+1-555-0126', NULL, '321 Hope Lane, Healing Heights, HH 22222', 'pending', NULL, NULL),
    ('10000000-0000-0000-0000-000000000005', 'Survivors United', 'A support network for breast cancer survivors and their loved ones.', 'connect@survivorsunited.org', '+1-555-0127', 'https://survivorsunited.org', '654 Survivor Street, Unity Valley, UV 33333', 'approved', NOW() - INTERVAL '15 days', '00000000-0000-0000-0000-000000000002');

-- Insert sample certificates
INSERT INTO public.certificates (id, organization_id, certificate_type, status, issue_date, expiry_date, issued_by, document_url) VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'screening', 'active', '2024-01-16', '2025-01-16', '00000000-0000-0000-0000-000000000001', '/certificates/cert-2024-001.pdf'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'education', 'active', '2024-01-20', '2025-01-20', '00000000-0000-0000-0000-000000000001', '/certificates/cert-2024-002.pdf'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'support', 'active', '2024-01-25', '2025-01-25', '00000000-0000-0000-0000-000000000002', '/certificates/cert-2024-003.pdf'),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'general', 'active', '2024-02-01', '2025-02-01', '00000000-0000-0000-0000-000000000002', '/certificates/cert-2024-004.pdf'),
    ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'screening', 'expired', '2023-01-10', '2024-01-10', '00000000-0000-0000-0000-000000000001', '/certificates/cert-2023-045.pdf');

-- Insert sample events
INSERT INTO public.events (id, title, description, organization_id, event_type, status, start_date, end_date, location, max_participants, current_participants, contact_email, contact_phone, submitted_at, approved_at, approved_by) VALUES
    ('30000000-0000-0000-0000-000000000001', 'Community Breast Cancer Screening Day', 'Free mammograms and health consultations for all women over 40. Professional medical staff will be available for screenings and health education.', '10000000-0000-0000-0000-000000000001', 'screening', 'completed', '2024-01-25 09:00:00+00', '2024-01-25 17:00:00+00', 'Community Health Center', 100, 87, 'events@pinkribbon.org', '+1-555-0123', '2024-01-20 10:00:00+00', '2024-01-21 14:30:00+00', '00000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000002', 'Breast Health Awareness Workshop', 'Educational session on self-examination techniques, early detection methods, and healthy lifestyle choices.', '10000000-0000-0000-0000-000000000002', 'education', 'completed', '2024-01-27 14:00:00+00', '2024-01-27 16:00:00+00', 'Central Library Conference Room', 50, 34, 'workshops@womenshealth.org', '+1-555-0124', '2024-01-22 09:15:00+00', '2024-01-23 11:00:00+00', '00000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000003', 'Survivors Support Group Meeting', 'Monthly gathering for breast cancer survivors and their families. Sharing experiences and providing emotional support.', '10000000-0000-0000-0000-000000000005', 'support', 'active', '2024-02-15 18:30:00+00', '2024-02-15 20:00:00+00', 'Hope Community Center', 30, 18, 'support@survivorsunited.org', '+1-555-0127', '2024-01-25 16:00:00+00', '2024-01-26 10:00:00+00', '00000000-0000-0000-0000-000000000002'),
    ('30000000-0000-0000-0000-000000000004', 'Mobile Screening Unit - North District', 'Mobile mammography unit serving underserved communities in the North District area.', '10000000-0000-0000-0000-000000000001', 'screening', 'approved', '2024-02-20 08:00:00+00', '2024-02-20 16:00:00+00', 'North District Community Park', 75, 23, 'mobile@pinkribbon.org', '+1-555-0123', '2024-02-01 12:00:00+00', '2024-02-02 09:30:00+00', '00000000-0000-0000-0000-000000000002'),
    ('30000000-0000-0000-0000-000000000005', 'Fundraising Gala for Research', 'Annual fundraising event to support breast cancer research initiatives and patient support programs.', '10000000-0000-0000-0000-000000000003', 'fundraising', 'pending', '2024-03-15 19:00:00+00', '2024-03-15 23:00:00+00', 'Grand Ballroom, City Hotel', 200, 45, 'gala@communitycare.org', '+1-555-0125', '2024-02-10 14:00:00+00', NULL, NULL);

-- Insert sample reports
INSERT INTO public.reports (id, title, description, event_id, organization_id, report_type, status, submitted_at, reviewed_at, reviewed_by, data) VALUES
    ('40000000-0000-0000-0000-000000000001', 'Community Screening Event Report', 'Comprehensive report on the community breast cancer screening event outcomes and statistics.', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'event', 'approved', '2024-01-25 18:00:00+00', '2024-01-26 10:00:00+00', '00000000-0000-0000-0000-000000000001', '{"attendees_count": 87, "checked_in_count": 82, "volunteers_count": 12, "suspected_cases": 3, "referrals_count": 5, "satisfaction_rating": 4.8}'),
    ('40000000-0000-0000-0000-000000000002', 'Awareness Workshop Report', 'Report on the breast health awareness workshop including participant feedback and educational outcomes.', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'event', 'approved', '2024-01-27 20:30:00+00', '2024-01-28 10:15:00+00', '00000000-0000-0000-0000-000000000001', '{"attendees_count": 34, "checked_in_count": 28, "volunteers_count": 5, "suspected_cases": 0, "referrals_count": 2, "knowledge_improvement": "85%"}'),
    ('40000000-0000-0000-0000-000000000003', 'Monthly Activity Report - January 2024', 'Monthly summary of all activities, events, and outcomes for January 2024.', NULL, '10000000-0000-0000-0000-000000000001', 'monthly', 'submitted', '2024-02-01 09:00:00+00', NULL, NULL, '{"events_conducted": 2, "total_participants": 121, "screenings_performed": 87, "educational_sessions": 1, "community_reach": 500}'),
    ('40000000-0000-0000-0000-000000000004', 'Support Group Session Report', 'Report on the monthly support group meeting and participant engagement.', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 'event', 'draft', NULL, NULL, NULL, '{"attendees_count": 18, "new_members": 3, "session_topics": ["coping_strategies", "family_support", "treatment_updates"], "feedback_score": 4.9}');

-- Insert sample activity logs
INSERT INTO public.activity_logs (action, resource, resource_id, resource_name, user_id, user_name, user_email, ip_address, status, details) VALUES
    ('approved', 'organization', '10000000-0000-0000-0000-000000000001', 'Pink Ribbon Foundation', '00000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@municipal.gov', '192.168.1.100', 'success', '{"previous_status": "pending", "new_status": "approved", "notes": "All documentation verified"}'),
    ('created', 'certificate', '20000000-0000-0000-0000-000000000001', 'CERT-2024-001', '00000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@municipal.gov', '192.168.1.100', 'success', '{"certificate_type": "screening", "organization_id": "10000000-0000-0000-0000-000000000001", "expiry_date": "2025-01-16"}'),
    ('approved', 'event', '30000000-0000-0000-0000-000000000001', 'Community Breast Cancer Screening Day', '00000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@municipal.gov', '192.168.1.100', 'success', '{"previous_status": "pending", "new_status": "approved", "event_date": "2024-01-25"}'),
    ('login', 'user', '00000000-0000-0000-0000-000000000002', 'Health Supervisor', '00000000-0000-0000-0000-000000000002', 'Health Supervisor', 'supervisor@municipal.gov', '192.168.1.101', 'success', '{"login_time": "2024-01-28T08:30:00Z", "session_duration": "4h 30m"}'),
    ('rejected', 'event', '30000000-0000-0000-0000-000000000005', 'Fundraising Gala for Research', '00000000-0000-0000-0000-000000000002', 'Health Supervisor', 'supervisor@municipal.gov', '192.168.1.101', 'warning', '{"previous_status": "pending", "new_status": "rejected", "reason": "Insufficient safety protocols"}'),
    ('failed_login', 'user', 'unknown', 'Unknown User', NULL, 'Unknown', 'invalid@email.com', '203.0.113.45', 'failed', '{"reason": "Invalid credentials", "attempts": 3, "blocked": false}'),
    ('approved', 'report', '40000000-0000-0000-0000-000000000001', 'Community Screening Event Report', '00000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@municipal.gov', '192.168.1.100', 'success', '{"report_type": "event", "organization": "Pink Ribbon Foundation", "review_notes": "Comprehensive and well-documented"}'),
    ('updated', 'organization', '10000000-0000-0000-0000-000000000002', 'Women''s Health Alliance', '00000000-0000-0000-0000-000000000002', 'Health Supervisor', 'supervisor@municipal.gov', '192.168.1.101', 'success', '{"fields_updated": ["contact_phone", "website"], "previous_phone": "+1-555-0000", "new_phone": "+1-555-0124"}');

-- Update certificate status for organizations
UPDATE public.organizations 
SET certificate_status = 'active' 
WHERE id IN (
    SELECT DISTINCT organization_id 
    FROM public.certificates 
    WHERE status = 'active'
);

-- Update events count for organizations (this would normally be done via triggers)
UPDATE public.organizations o
SET updated_at = NOW()
FROM (
    SELECT organization_id, COUNT(*) as event_count
    FROM public.events
    GROUP BY organization_id
) e
WHERE o.id = e.organization_id;
