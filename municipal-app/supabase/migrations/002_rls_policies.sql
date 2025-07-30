-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
    user_role_result user_role;
BEGIN
    SELECT role INTO user_role_result
    FROM public.users
    WHERE id = user_id;
    
    RETURN COALESCE(user_role_result, 'viewer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin or moderator
CREATE OR REPLACE FUNCTION is_admin_or_moderator(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can insert users" ON public.users
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update users" ON public.users
    FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can delete users" ON public.users
    FOR DELETE USING (is_admin(auth.uid()));

-- Organizations table policies
CREATE POLICY "Anyone can view approved organizations" ON public.organizations
    FOR SELECT USING (registration_status = 'approved');

CREATE POLICY "Admins and moderators can view all organizations" ON public.organizations
    FOR SELECT USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Anyone can insert organizations" ON public.organizations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins and moderators can update organizations" ON public.organizations
    FOR UPDATE USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can delete organizations" ON public.organizations
    FOR DELETE USING (is_admin(auth.uid()));

-- Certificates table policies
CREATE POLICY "Anyone can view active certificates" ON public.certificates
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins and moderators can view all certificates" ON public.certificates
    FOR SELECT USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins and moderators can insert certificates" ON public.certificates
    FOR INSERT WITH CHECK (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins and moderators can update certificates" ON public.certificates
    FOR UPDATE USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can delete certificates" ON public.certificates
    FOR DELETE USING (is_admin(auth.uid()));

-- Events table policies
CREATE POLICY "Anyone can view approved and active events" ON public.events
    FOR SELECT USING (status IN ('approved', 'active', 'completed'));

CREATE POLICY "Admins and moderators can view all events" ON public.events
    FOR SELECT USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Anyone can insert events" ON public.events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins and moderators can update events" ON public.events
    FOR UPDATE USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can delete events" ON public.events
    FOR DELETE USING (is_admin(auth.uid()));

-- Reports table policies
CREATE POLICY "Admins and moderators can view all reports" ON public.reports
    FOR SELECT USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Anyone can insert reports" ON public.reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins and moderators can update reports" ON public.reports
    FOR UPDATE USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can delete reports" ON public.reports
    FOR DELETE USING (is_admin(auth.uid()));

-- Activity logs table policies
CREATE POLICY "Admins and moderators can view activity logs" ON public.activity_logs
    FOR SELECT USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "System can insert activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);

-- No update or delete policies for activity logs to maintain audit integrity

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant specific permissions for anon users (public access)
GRANT SELECT ON public.organizations TO anon;
GRANT SELECT ON public.certificates TO anon;
GRANT SELECT ON public.events TO anon;
GRANT INSERT ON public.organizations TO anon;
GRANT INSERT ON public.events TO anon;
GRANT INSERT ON public.reports TO anon;

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'viewer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create a function to sync user updates
CREATE OR REPLACE FUNCTION sync_user_updates()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION sync_user_updates();

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Organizations are viewable by users in the same municipality"
ON public.organizations
FOR SELECT
USING (
  municipality_id = (SELECT municipality_id FROM public.users WHERE user_id = auth.uid())
  OR (SELECT role FROM public.users WHERE user_id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Organizations can be created by municipal admins"
ON public.organizations
FOR INSERT
WITH CHECK (
  (SELECT role FROM public.users WHERE user_id = auth.uid()) IN ('municipal_admin', 'super_admin')
);

CREATE POLICY "Organizations can be updated by municipal admins"
ON public.organizations
FOR UPDATE
USING (
  municipality_id = (SELECT municipality_id FROM public.users WHERE user_id = auth.uid())
  AND (SELECT role FROM public.users WHERE user_id = auth.uid()) IN ('municipal_admin', 'super_admin')
)
WITH CHECK (
  municipality_id = (SELECT municipality_id FROM public.users WHERE user_id = auth.uid())
  AND (SELECT role FROM public.users WHERE user_id = auth.uid()) IN ('municipal_admin', 'super_admin')
);

CREATE POLICY "Organizations can be deleted by municipal admins"
ON public.organizations
FOR DELETE
USING (
  municipality_id = (SELECT municipality_id FROM public.users WHERE user_id = auth.uid())
  AND (SELECT role FROM public.users WHERE user_id = auth.uid()) IN ('municipal_admin', 'super_admin')
);

-- Activity logs policies
CREATE POLICY "Activity logs are viewable by users in the same municipality"
ON public.activity_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = resource_id
    AND o.municipality_id = (SELECT municipality_id FROM public.users WHERE user_id = auth.uid())
  )
  OR (SELECT role FROM public.users WHERE user_id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Activity logs can be created by authenticated users"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create organizations_with_stats view
CREATE OR REPLACE VIEW public.organizations_with_stats AS
SELECT 
  o.*,
  COALESCE(c.certificates_count, 0) as certificates_count,
  COALESCE(e.events_count, 0) as events_count,
  COALESCE(r.reports_count, 0) as reports_count
FROM 
  public.organizations o
LEFT JOIN (
  SELECT organization_id, COUNT(*) as certificates_count
  FROM public.certificates
  GROUP BY organization_id
) c ON o.id = c.organization_id
LEFT JOIN (
  SELECT organization_id, COUNT(*) as events_count
  FROM public.events
  GROUP BY organization_id
) e ON o.id = e.organization_id
LEFT JOIN (
  SELECT organization_id, COUNT(*) as reports_count
  FROM public.reports
  GROUP BY organization_id
) r ON o.id = r.organization_id;

-- Create views for easier data access
CREATE VIEW public.organizations_with_stats AS
SELECT 
    o.*,
    COUNT(DISTINCT c.id) as certificates_count,
    COUNT(DISTINCT e.id) as events_count,
    COUNT(DISTINCT r.id) as reports_count
FROM public.organizations o
LEFT JOIN public.certificates c ON o.id = c.organization_id
LEFT JOIN public.events e ON o.id = e.organization_id
LEFT JOIN public.reports r ON o.id = r.organization_id
GROUP BY o.id;

CREATE VIEW public.certificates_with_organization AS
SELECT 
    c.*,
    o.name as organization_name,
    o.contact_email as organization_email
FROM public.certificates c
JOIN public.organizations o ON c.organization_id = o.id;

CREATE VIEW public.events_with_organization AS
SELECT 
    e.*,
    o.name as organization_name,
    o.contact_email as organization_email
FROM public.events e
JOIN public.organizations o ON e.organization_id = o.id;

CREATE VIEW public.reports_with_details AS
SELECT 
    r.*,
    o.name as organization_name,
    e.title as event_title,
    e.start_date as event_date
FROM public.reports r
JOIN public.organizations o ON r.organization_id = o.id
LEFT JOIN public.events e ON r.event_id = e.id;

-- Grant permissions on views
GRANT SELECT ON public.organizations_with_stats TO authenticated, anon;
GRANT SELECT ON public.certificates_with_organization TO authenticated, anon;
GRANT SELECT ON public.events_with_organization TO authenticated, anon;
GRANT SELECT ON public.reports_with_details TO authenticated;
