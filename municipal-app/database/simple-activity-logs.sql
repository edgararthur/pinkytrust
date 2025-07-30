-- Simple Activity Logs Table - Run this in Supabase SQL Editor
-- This will create a clean activity_logs table without resource_name

-- Drop existing table if it exists (be careful in production!)
DROP TABLE IF EXISTS activity_logs CASCADE;

-- Create municipalities table first (if it doesn't exist)
CREATE TABLE IF NOT EXISTS municipalities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region_id TEXT,
  region_name TEXT,
  type TEXT DEFAULT 'Municipal',
  capital TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample municipalities
INSERT INTO municipalities (id, name, region_id, region_name, type, capital) VALUES
('accra-metro', 'Accra Metropolitan Assembly', 'greater-accra', 'Greater Accra Region', 'Metropolitan', 'Accra'),
('tema-metro', 'Tema Metropolitan Assembly', 'greater-accra', 'Greater Accra Region', 'Metropolitan', 'Tema'),
('kumasi-metro', 'Kumasi Metropolitan Assembly', 'ashanti', 'Ashanti Region', 'Metropolitan', 'Kumasi'),
('cape-coast-metro', 'Cape Coast Metropolitan Assembly', 'central', 'Central Region', 'Metropolitan', 'Cape Coast')
ON CONFLICT (id) DO NOTHING;

-- Create new activity_logs table
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  municipality_id TEXT REFERENCES municipalities(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_municipality_id ON activity_logs(municipality_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Super admin can view all activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'supervisor@municipal.gov'
    )
  );

CREATE POLICY "Municipal admins can view their municipality activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role = 'municipal_admin'
      AND users.municipality_id = activity_logs.municipality_id
    )
  );

CREATE POLICY "Users can insert their own activity logs" ON activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT SELECT ON activity_logs TO authenticated;
GRANT INSERT ON activity_logs TO authenticated;

-- Simple function to log activities
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
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found';
  END IF;
  
  SELECT municipality_id INTO v_municipality_id
  FROM users 
  WHERE user_id = v_user_id;
  
  IF v_municipality_id IS NULL THEN
    v_municipality_id := 'system';
  END IF;
  
  IF p_description IS NULL THEN
    v_description := format('%s %s', initcap(p_action), p_resource_type);
  ELSE
    v_description := p_description;
  END IF;
  
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

GRANT EXECUTE ON FUNCTION log_activity TO authenticated;

-- Insert sample data for testing
INSERT INTO activity_logs (
  user_id,
  municipality_id,
  action,
  resource_type,
  resource_id,
  description,
  metadata
) 
SELECT 
  id,
  'system',
  'create',
  'user',
  'sample-user-id',
  'Created municipal admin account for Accra Metropolitan Assembly',
  '{"municipality": "Accra Metropolitan Assembly", "role": "municipal_admin"}'::jsonb
FROM auth.users 
WHERE email = 'supervisor@municipal.gov' 
LIMIT 1;

INSERT INTO activity_logs (
  user_id,
  municipality_id,
  action,
  resource_type,
  resource_id,
  description,
  metadata
) 
SELECT 
  id,
  'system',
  'view',
  'dashboard',
  'super-admin-dashboard',
  'Accessed super admin dashboard',
  '{"section": "overview"}'::jsonb
FROM auth.users 
WHERE email = 'supervisor@municipal.gov' 
LIMIT 1;

COMMENT ON TABLE activity_logs IS 'Activity logging for all user actions in the municipal platform';
COMMENT ON FUNCTION log_activity IS 'Function to manually log user activities';
