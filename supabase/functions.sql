-- Additional PostgreSQL functions for the Breast Cancer Platform
-- Run this after the main setup.sql

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_organisations', (SELECT COUNT(*) FROM organisations),
        'active_organisations', (SELECT COUNT(*) FROM organisations WHERE registration_status = 'approved'),
        'pending_organisations', (SELECT COUNT(*) FROM organisations WHERE registration_status = 'pending'),
        'total_events', (SELECT COUNT(*) FROM events),
        'active_events', (SELECT COUNT(*) FROM events WHERE status IN ('planned', 'ongoing')),
        'completed_events', (SELECT COUNT(*) FROM events WHERE status = 'completed'),
        'total_users', (SELECT COUNT(*) FROM users),
        'total_reports', (SELECT COUNT(*) FROM reports),
        'pending_reports', (SELECT COUNT(*) FROM reports WHERE status = 'pending')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get nearby events using geospatial queries
CREATE OR REPLACE FUNCTION get_nearby_events(lat DOUBLE PRECISION, lng DOUBLE PRECISION, radius_km DOUBLE PRECISION)
RETURNS TABLE (
    event_id UUID,
    title VARCHAR,
    description TEXT,
    address TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR,
    organisation_name VARCHAR,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.event_id,
        e.title,
        e.description,
        e.address,
        e.start_date,
        e.end_date,
        e.status,
        o.name as organisation_name,
        ST_Distance(e.location, ST_SetSRID(ST_Point(lng, lat), 4326)::geography) / 1000 as distance_km
    FROM events e
    JOIN organisations o ON e.organisation_id = o.organisation_id
    WHERE e.location IS NOT NULL
    AND e.status IN ('planned', 'ongoing')
    AND ST_DWithin(e.location, ST_SetSRID(ST_Point(lng, lat), 4326)::geography, radius_km * 1000)
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get event analytics
CREATE OR REPLACE FUNCTION get_event_analytics(event_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    IF event_id IS NOT NULL THEN
        -- Analytics for specific event
        SELECT json_build_object(
            'event_id', e.event_id,
            'title', e.title,
            'attendees_registered', (
                SELECT COUNT(*) FROM event_attendees ea 
                WHERE ea.event_id = e.event_id AND ea.status = 'rsvp'
            ),
            'attendees_checked_in', (
                SELECT COUNT(*) FROM event_attendees ea 
                WHERE ea.event_id = e.event_id AND ea.status = 'checked_in'
            ),
            'volunteers_count', (
                SELECT COUNT(*) FROM volunteers v 
                WHERE v.event_id = e.event_id AND v.status = 'active'
            ),
            'suspected_cases', COALESCE((
                SELECT r.suspected_cases FROM reports r 
                WHERE r.event_id = e.event_id AND r.status = 'approved'
                LIMIT 1
            ), 0),
            'completion_status', e.status
        ) INTO result
        FROM events e
        WHERE e.event_id = get_event_analytics.event_id;
    ELSE
        -- Overall event analytics
        SELECT json_build_object(
            'total_events', (SELECT COUNT(*) FROM events),
            'completed_events', (SELECT COUNT(*) FROM events WHERE status = 'completed'),
            'total_attendees', (SELECT COUNT(*) FROM event_attendees),
            'total_volunteers', (SELECT COUNT(*) FROM volunteers),
            'avg_attendees_per_event', (
                SELECT ROUND(AVG(attendee_count), 2)
                FROM (
                    SELECT COUNT(*) as attendee_count
                    FROM event_attendees ea
                    GROUP BY ea.event_id
                ) as event_stats
            ),
            'events_by_status', (
                SELECT json_object_agg(status, count)
                FROM (
                    SELECT status, COUNT(*) as count
                    FROM events
                    GROUP BY status
                ) as status_counts
            )
        ) INTO result;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get regional statistics
CREATE OR REPLACE FUNCTION get_regional_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'region', region,
            'organisation_count', organisation_count,
            'event_count', event_count,
            'attendee_count', attendee_count,
            'suspected_cases', suspected_cases
        )
    ) INTO result
    FROM (
        SELECT 
            COALESCE(SPLIT_PART(o.address, ',', -1), 'Unknown') as region,
            COUNT(DISTINCT o.organisation_id) as organisation_count,
            COUNT(DISTINCT e.event_id) as event_count,
            COUNT(DISTINCT ea.attendee_id) as attendee_count,
            COALESCE(SUM(r.suspected_cases), 0) as suspected_cases
        FROM organisations o
        LEFT JOIN events e ON o.organisation_id = e.organisation_id
        LEFT JOIN event_attendees ea ON e.event_id = ea.event_id
        LEFT JOIN reports r ON e.event_id = r.event_id AND r.status = 'approved'
        WHERE o.registration_status = 'approved'
        GROUP BY region
        ORDER BY organisation_count DESC
    ) as regional_data;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user engagement metrics
CREATE OR REPLACE FUNCTION get_user_engagement(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'events_attended', (
            SELECT COUNT(*) FROM event_attendees ea 
            WHERE ea.user_id = get_user_engagement.user_id 
            AND ea.status = 'checked_in'
        ),
        'events_registered', (
            SELECT COUNT(*) FROM event_attendees ea 
            WHERE ea.user_id = get_user_engagement.user_id
        ),
        'support_requests', (
            SELECT COUNT(*) FROM support_requests sr 
            WHERE sr.user_id = get_user_engagement.user_id
        ),
        'assessments_completed', (
            SELECT COUNT(*) FROM self_assessments sa 
            WHERE sa.user_id = get_user_engagement.user_id
        ),
        'community_posts', (
            SELECT COUNT(*) FROM community_posts cp 
            WHERE cp.user_id = get_user_engagement.user_id
        ),
        'last_activity', (
            SELECT MAX(created_at) FROM (
                SELECT created_at FROM event_attendees WHERE user_id = get_user_engagement.user_id
                UNION ALL
                SELECT submitted_at FROM support_requests WHERE user_id = get_user_engagement.user_id
                UNION ALL
                SELECT submitted_at FROM self_assessments WHERE user_id = get_user_engagement.user_id
                UNION ALL
                SELECT created_at FROM community_posts WHERE user_id = get_user_engagement.user_id
            ) as activities
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment content views
CREATE OR REPLACE FUNCTION increment_content_views(content_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE content 
    SET view_count = view_count + 1 
    WHERE content.content_id = increment_content_views.content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment content likes
CREATE OR REPLACE FUNCTION increment_content_likes(content_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE content 
    SET like_count = like_count + 1 
    WHERE content.content_id = increment_content_likes.content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search events with filters
CREATE OR REPLACE FUNCTION search_events(
    search_query TEXT DEFAULT NULL,
    event_status VARCHAR DEFAULT NULL,
    organisation_id UUID DEFAULT NULL,
    start_date_filter TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_date_filter TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    lat DOUBLE PRECISION DEFAULT NULL,
    lng DOUBLE PRECISION DEFAULT NULL,
    radius_km DOUBLE PRECISION DEFAULT 50
)
RETURNS TABLE (
    event_id UUID,
    title VARCHAR,
    description TEXT,
    address TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR,
    organisation_name VARCHAR,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.event_id,
        e.title,
        e.description,
        e.address,
        e.start_date,
        e.end_date,
        e.status,
        o.name as organisation_name,
        CASE 
            WHEN lat IS NOT NULL AND lng IS NOT NULL AND e.location IS NOT NULL 
            THEN ST_Distance(e.location, ST_SetSRID(ST_Point(lng, lat), 4326)::geography) / 1000
            ELSE NULL 
        END as distance_km
    FROM events e
    JOIN organisations o ON e.organisation_id = o.organisation_id
    WHERE 
        (search_query IS NULL OR (
            e.title ILIKE '%' || search_query || '%' OR 
            e.description ILIKE '%' || search_query || '%' OR
            o.name ILIKE '%' || search_query || '%'
        ))
        AND (event_status IS NULL OR e.status = event_status)
        AND (search_events.organisation_id IS NULL OR e.organisation_id = search_events.organisation_id)
        AND (start_date_filter IS NULL OR e.start_date >= start_date_filter)
        AND (end_date_filter IS NULL OR e.end_date <= end_date_filter)
        AND (
            lat IS NULL OR lng IS NULL OR e.location IS NULL OR
            ST_DWithin(e.location, ST_SetSRID(ST_Point(lng, lat), 4326)::geography, radius_km * 1000)
        )
    ORDER BY 
        CASE WHEN distance_km IS NOT NULL THEN distance_km END ASC,
        e.start_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get certificate expiry alerts
CREATE OR REPLACE FUNCTION get_certificate_expiry_alerts(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
    certificate_id UUID,
    organisation_name VARCHAR,
    organisation_email VARCHAR,
    expiry_date TIMESTAMP WITH TIME ZONE,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.certificate_id,
        o.name as organisation_name,
        o.contact_email as organisation_email,
        c.expiry_date,
        EXTRACT(DAY FROM (c.expiry_date - CURRENT_TIMESTAMP))::INTEGER as days_until_expiry
    FROM certificates c
    JOIN organisations o ON c.organisation_id = o.organisation_id
    WHERE c.status = 'active'
    AND c.expiry_date IS NOT NULL
    AND c.expiry_date <= CURRENT_TIMESTAMP + INTERVAL '1 day' * days_ahead
    AND c.expiry_date > CURRENT_TIMESTAMP
    ORDER BY c.expiry_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate assessment risk score
CREATE OR REPLACE FUNCTION calculate_assessment_score(responses JSONB)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    age INTEGER;
    family_history BOOLEAN;
    personal_history BOOLEAN;
    lifestyle_factors JSONB;
    symptoms JSONB;
BEGIN
    -- Extract values from responses
    age := (responses->>'age')::INTEGER;
    family_history := (responses->>'family_history')::BOOLEAN;
    personal_history := (responses->>'personal_history')::BOOLEAN;
    lifestyle_factors := responses->'lifestyle_factors';
    symptoms := responses->'symptoms';
    
    -- Age scoring
    IF age >= 50 THEN
        score := score + 20;
    ELSIF age >= 40 THEN
        score := score + 10;
    ELSIF age >= 30 THEN
        score := score + 5;
    END IF;
    
    -- Family history
    IF family_history THEN
        score := score + 25;
    END IF;
    
    -- Personal history
    IF personal_history THEN
        score := score + 30;
    END IF;
    
    -- Lifestyle factors (negative scoring - good habits reduce risk)
    IF (lifestyle_factors->>'exercise')::BOOLEAN THEN
        score := score - 5;
    END IF;
    
    IF (lifestyle_factors->>'diet')::BOOLEAN THEN
        score := score - 5;
    END IF;
    
    IF (lifestyle_factors->>'alcohol')::BOOLEAN THEN
        score := score + 5;
    END IF;
    
    IF (lifestyle_factors->>'smoking')::BOOLEAN THEN
        score := score + 10;
    END IF;
    
    -- Symptoms (concerning symptoms increase score)
    IF (symptoms->>'lump')::BOOLEAN THEN
        score := score + 15;
    END IF;
    
    IF (symptoms->>'pain')::BOOLEAN THEN
        score := score + 5;
    END IF;
    
    IF (symptoms->>'discharge')::BOOLEAN THEN
        score := score + 10;
    END IF;
    
    IF (symptoms->>'skin_changes')::BOOLEAN THEN
        score := score + 10;
    END IF;
    
    -- Ensure score is within bounds
    IF score < 0 THEN
        score := 0;
    ELSIF score > 100 THEN
        score := 100;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_nearby_events(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;
GRANT EXECUTE ON FUNCTION get_event_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_regional_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_engagement(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_content_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_content_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_events(TEXT, VARCHAR, UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;
GRANT EXECUTE ON FUNCTION get_certificate_expiry_alerts(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_assessment_score(JSONB) TO authenticated; 