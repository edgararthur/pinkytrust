-- Simple Activity Logs Table Creation
-- Run this in your Supabase SQL editor

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  municipality_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_municipality_id ON activity_logs(municipality_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Grant permissions
GRANT SELECT ON activity_logs TO authenticated;
GRANT INSERT ON activity_logs TO authenticated;

-- Insert some sample data for testing
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

-- Simple function to log activities manually
CREATE OR REPLACE FUNCTION log_activity(
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION log_activity TO authenticated;

COMMENT ON TABLE activity_logs IS 'Activity logging for all user actions in the municipal platform';
COMMENT ON FUNCTION log_activity IS 'Function to manually log user activities';
