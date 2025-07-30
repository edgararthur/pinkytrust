-- Activity Logs Table for System Monitoring
-- This table tracks all user actions across the municipal platform

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  municipality_id TEXT NOT NULL,
  action TEXT NOT NULL, -- create, update, delete, approve, reject, view, login, logout
  resource_type TEXT NOT NULL, -- organization, event, certificate, report, user, system
  resource_id TEXT, -- ID of the resource being acted upon
  description TEXT NOT NULL, -- Human-readable description of the action
  metadata JSONB DEFAULT '{}', -- Additional context data
  ip_address INET, -- User's IP address
  user_agent TEXT, -- User's browser/device info
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_municipality_id ON activity_logs(municipality_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_composite ON activity_logs(municipality_id, action, resource_type, created_at DESC);

-- RLS Policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Super admin can see all activity logs
CREATE POLICY "Super admin can view all activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'supervisor@municipal.gov'
    )
  );

-- Municipal admins can only see activity logs from their municipality
CREATE POLICY "Municipal admins can view their municipality activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role = 'municipal_admin'
      AND users.municipality_id = activity_logs.municipality_id
    )
  );

-- Users can insert their own activity logs
CREATE POLICY "Users can insert their own activity logs" ON activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to automatically log user activities
CREATE OR REPLACE FUNCTION log_user_activity(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_municipality_id TEXT;
  v_activity_id UUID;
  v_description TEXT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found';
  END IF;
  
  -- Get user's municipality
  SELECT municipality_id INTO v_municipality_id
  FROM users 
  WHERE user_id = v_user_id;
  
  IF v_municipality_id IS NULL THEN
    v_municipality_id := 'system';
  END IF;
  
  -- Generate description if not provided
  IF p_description IS NULL THEN
    v_description := format('%s %s', initcap(p_action), p_resource_type);
  ELSE
    v_description := p_description;
  END IF;
  
  -- Insert activity log
  INSERT INTO activity_logs (
    user_id,
    municipality_id,
    action,
    resource_type,
    resource_id,
    description,
    metadata
  ) VALUES (
    v_user_id,
    v_municipality_id,
    p_action,
    p_resource_type,
    p_resource_id,
    v_description,
    p_metadata
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to automatically log certain table changes
CREATE OR REPLACE FUNCTION trigger_log_activity() RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_resource_name TEXT;
  v_metadata JSONB;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_resource_name := COALESCE(NEW.name, NEW.title, NEW.email, 'Unknown');
    v_metadata := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_resource_name := COALESCE(NEW.name, NEW.title, NEW.email, 'Unknown');
    v_metadata := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW),
      'changed_fields', (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_resource_name := COALESCE(OLD.name, OLD.title, OLD.email, 'Unknown');
    v_metadata := to_jsonb(OLD);
  END IF;
  
  -- Log the activity
  PERFORM log_user_activity(
    v_action,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    format('%s %s: %s', initcap(v_action), TG_TABLE_NAME, v_resource_name),
    v_metadata
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for important tables
-- Organizations
DROP TRIGGER IF EXISTS trigger_organizations_activity ON organizations;
CREATE TRIGGER trigger_organizations_activity
  AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_log_activity();

-- Events
DROP TRIGGER IF EXISTS trigger_events_activity ON events;
CREATE TRIGGER trigger_events_activity
  AFTER INSERT OR UPDATE OR DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION trigger_log_activity();

-- Certificates
DROP TRIGGER IF EXISTS trigger_certificates_activity ON certificates;
CREATE TRIGGER trigger_certificates_activity
  AFTER INSERT OR UPDATE OR DELETE ON certificates
  FOR EACH ROW EXECUTE FUNCTION trigger_log_activity();

-- Reports
DROP TRIGGER IF EXISTS trigger_reports_activity ON reports;
CREATE TRIGGER trigger_reports_activity
  AFTER INSERT OR UPDATE OR DELETE ON reports
  FOR EACH ROW EXECUTE FUNCTION trigger_log_activity();

-- Users (only for important changes)
DROP TRIGGER IF EXISTS trigger_users_activity ON users;
CREATE TRIGGER trigger_users_activity
  AFTER INSERT OR UPDATE OF role, is_active, municipality_id OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_log_activity();

-- View for activity logs with user information
CREATE OR REPLACE VIEW activity_logs_with_users AS
SELECT 
  al.*,
  u.first_name,
  u.last_name,
  u.email,
  u.role as user_role,
  (u.first_name || ' ' || u.last_name) as user_name
FROM activity_logs al
LEFT JOIN users u ON al.user_id = u.user_id
ORDER BY al.created_at DESC;

-- Grant permissions
GRANT SELECT ON activity_logs TO authenticated;
GRANT INSERT ON activity_logs TO authenticated;
GRANT SELECT ON activity_logs_with_users TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_activity TO authenticated;

-- Sample activity log entries for testing
INSERT INTO activity_logs (
  user_id,
  municipality_id,
  action,
  resource_type,
  resource_id,
  description,
  metadata
) VALUES
(
  (SELECT id FROM auth.users WHERE email = 'supervisor@municipal.gov' LIMIT 1),
  'system',
  'create',
  'user',
  'sample-user-id',
  'Created municipal admin account for Accra Metropolitan Assembly',
  '{"municipality": "Accra Metropolitan Assembly", "role": "municipal_admin"}'
),
(
  (SELECT id FROM auth.users WHERE email = 'supervisor@municipal.gov' LIMIT 1),
  'system',
  'view',
  'dashboard',
  'super-admin-dashboard',
  'Accessed super admin dashboard',
  '{"section": "overview"}'
);

COMMENT ON TABLE activity_logs IS 'Comprehensive activity logging for all user actions in the municipal platform';
COMMENT ON FUNCTION log_user_activity IS 'Function to manually log user activities with proper context';
COMMENT ON FUNCTION trigger_log_activity IS 'Trigger function to automatically log database changes';
COMMENT ON VIEW activity_logs_with_users IS 'Activity logs joined with user information for easier querying';
