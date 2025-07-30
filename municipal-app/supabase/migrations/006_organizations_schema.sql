-- Drop existing views if they exist
DROP VIEW IF EXISTS public.organizations_with_stats;

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  address TEXT,
  municipality_id UUID NOT NULL REFERENCES public.users(municipality_id),
  registration_number TEXT UNIQUE,
  registration_status TEXT NOT NULL CHECK (registration_status IN ('pending', 'approved', 'rejected', 'suspended')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.users(user_id),
  rejected_by UUID REFERENCES public.users(user_id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  location_coordinates POINT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.users(user_id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES public.users(user_id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create certificates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'revoked')),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.users(user_id),
  revocation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  content TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('activity', 'event', 'awareness', 'other')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.users(user_id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES public.users(user_id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create organizations_with_stats view
CREATE OR REPLACE VIEW public.organizations_with_stats AS
SELECT 
  o.*,
  COALESCE(c.certificates_count, 0) as certificates_count,
  COALESCE(e.events_count, 0) as events_count,
  COALESCE(r.reports_count, 0) as reports_count,
  u.municipality_name
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
) r ON o.id = r.organization_id
LEFT JOIN public.users u ON o.municipality_id = u.municipality_id;

-- Add RLS policies for organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organizations are viewable by users in the same municipality
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

-- Organizations can be created by municipal admins
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

-- Organizations can be updated by municipal admins
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

-- Organizations can be deleted by municipal admins
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

-- Add RLS policies for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events are viewable by everyone
CREATE POLICY "Events are viewable by everyone"
ON public.events
FOR SELECT
USING (true);

-- Events can be created by organization members
CREATE POLICY "Events can be created by organization members"
ON public.events
FOR INSERT
WITH CHECK (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users 
    WHERE organization_id = events.organization_id
  )
);

-- Events can be updated by organization members and municipal admins
CREATE POLICY "Events can be updated by organization members and municipal admins"
ON public.events
FOR UPDATE
USING (
  auth.uid()::uuid IN (
    SELECT u.user_id 
    FROM public.users u
    LEFT JOIN public.organizations o ON u.municipality_id = o.municipality_id
    WHERE u.organization_id = events.organization_id
    OR (u.role IN ('municipal_admin', 'super_admin') AND o.id = events.organization_id)
  )
);

-- Add indexes
CREATE INDEX idx_organizations_municipality_id ON public.organizations(municipality_id);
CREATE INDEX idx_organizations_registration_status ON public.organizations(registration_status);
CREATE INDEX idx_organizations_registration_number ON public.organizations(registration_number);
CREATE INDEX idx_organizations_created_at ON public.organizations(created_at);
CREATE INDEX idx_events_organization_id ON public.events(organization_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_certificates_organization_id ON public.certificates(organization_id);
CREATE INDEX idx_certificates_status ON public.certificates(status);
CREATE INDEX idx_reports_organization_id ON public.reports(organization_id);
CREATE INDEX idx_reports_status ON public.reports(status);

-- Add triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 