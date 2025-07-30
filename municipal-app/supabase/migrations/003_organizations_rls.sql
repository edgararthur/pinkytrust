-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organizations are viewable by users in the same municipality" ON public.organizations;
DROP POLICY IF EXISTS "Organizations can be created by municipal admins" ON public.organizations;
DROP POLICY IF EXISTS "Organizations can be updated by municipal admins" ON public.organizations;
DROP POLICY IF EXISTS "Organizations can be deleted by municipal admins" ON public.organizations;
DROP POLICY IF EXISTS "Activity logs are viewable by users in the same municipality" ON public.activity_logs;
DROP POLICY IF EXISTS "Activity logs can be created by authenticated users" ON public.activity_logs;
DROP POLICY IF EXISTS "Municipalities are viewable by all authenticated users" ON public.municipalities;

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.organizations_with_stats;

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Organizations are viewable by users in the same municipality"
ON public.organizations
FOR SELECT
USING (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users 
    WHERE municipality_id = organizations.municipality_id 
    OR role = 'super_admin'
  )
);

CREATE POLICY "Organizations can be created by municipal admins"
ON public.organizations
FOR INSERT
WITH CHECK (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users 
    WHERE role IN ('municipal_admin', 'super_admin')
    AND municipality_id = organizations.municipality_id
  )
);

CREATE POLICY "Organizations can be updated by municipal admins"
ON public.organizations
FOR UPDATE
USING (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users 
    WHERE role IN ('municipal_admin', 'super_admin')
    AND municipality_id = organizations.municipality_id
  )
)
WITH CHECK (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users 
    WHERE role IN ('municipal_admin', 'super_admin')
    AND municipality_id = organizations.municipality_id
  )
);

CREATE POLICY "Organizations can be deleted by municipal admins"
ON public.organizations
FOR DELETE
USING (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users 
    WHERE role IN ('municipal_admin', 'super_admin')
    AND municipality_id = organizations.municipality_id
  )
);

-- Activity logs policies
CREATE POLICY "Activity logs are viewable by users in the same municipality"
ON public.activity_logs
FOR SELECT
USING (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users 
    WHERE municipality_id IN (
      SELECT municipality_id FROM public.organizations 
      WHERE id::text = activity_logs.resource_id 
      AND resource = 'organization'
    )
    OR role = 'super_admin'
  )
);

CREATE POLICY "Activity logs can be created by authenticated users"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Municipalities policies
CREATE POLICY "Municipalities are viewable by all authenticated users"
ON public.municipalities
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create organizations_with_stats view
CREATE OR REPLACE VIEW public.organizations_with_stats AS
SELECT 
  o.*,
  m.name as municipality_name,
  m.code as municipality_code,
  COALESCE(c.certificates_count, 0) as certificates_count,
  COALESCE(e.events_count, 0) as events_count,
  COALESCE(r.reports_count, 0) as reports_count
FROM 
  public.organizations o
LEFT JOIN public.municipalities m ON o.municipality_id = m.id
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

-- Create volunteers table to link users with organisations
CREATE TABLE public.volunteers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organisation_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organisation_id)
);

-- Enable RLS
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for volunteers
CREATE POLICY "Users can view their own volunteer records" ON public.volunteers
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Municipal staff can manage volunteer records in their municipality" ON public.volunteers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.organizations o ON o.id = volunteers.organisation_id
            WHERE u.user_id = auth.uid() 
            AND u.role IN ('super_admin', 'municipal_admin', 'manager', 'staff')
            AND (u.role = 'super_admin' OR u.municipality_id = o.municipality_id)
        )
    );

-- Create index for better performance
CREATE INDEX idx_volunteers_user_id ON public.volunteers(user_id);
CREATE INDEX idx_volunteers_organisation_id ON public.volunteers(organisation_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_volunteers_updated_at 
    BEFORE UPDATE ON public.volunteers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 