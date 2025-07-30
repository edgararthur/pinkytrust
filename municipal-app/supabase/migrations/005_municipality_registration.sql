-- Create municipality_accounts table
CREATE TABLE IF NOT EXISTS public.municipality_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipality_id UUID NOT NULL REFERENCES public.municipalities(id),
  admin_user_id UUID NOT NULL REFERENCES public.users(user_id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
  contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  subscription JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(municipality_id)
);

-- Create user_invitations table
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipality_id UUID NOT NULL REFERENCES public.municipalities(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.users(user_id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  token TEXT NOT NULL UNIQUE,
  UNIQUE(email, municipality_id)
);

-- Add RLS policies
ALTER TABLE public.municipality_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Municipality accounts policies
CREATE POLICY "Municipality accounts are viewable by their users"
ON public.municipality_accounts
FOR SELECT
USING (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users 
    WHERE municipality_id = municipality_accounts.municipality_id
    OR role = 'super_admin'
  )
);

CREATE POLICY "Municipality accounts can be created by super admins"
ON public.municipality_accounts
FOR INSERT
WITH CHECK (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users WHERE role = 'super_admin'
  )
);

CREATE POLICY "Municipality accounts can be updated by super admins"
ON public.municipality_accounts
FOR UPDATE
USING (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users WHERE role = 'super_admin'
  )
)
WITH CHECK (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users WHERE role = 'super_admin'
  )
);

-- User invitations policies
CREATE POLICY "User invitations are viewable by municipal admins"
ON public.user_invitations
FOR SELECT
USING (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users 
    WHERE municipality_id = user_invitations.municipality_id
    AND role IN ('municipal_admin', 'super_admin')
  )
);

CREATE POLICY "User invitations can be created by municipal admins"
ON public.user_invitations
FOR INSERT
WITH CHECK (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users 
    WHERE municipality_id = user_invitations.municipality_id
    AND role IN ('municipal_admin', 'super_admin')
  )
);

CREATE POLICY "User invitations can be updated by municipal admins"
ON public.user_invitations
FOR UPDATE
USING (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users 
    WHERE municipality_id = user_invitations.municipality_id
    AND role IN ('municipal_admin', 'super_admin')
  )
)
WITH CHECK (
  auth.uid()::uuid IN (
    SELECT user_id FROM public.users 
    WHERE municipality_id = user_invitations.municipality_id
    AND role IN ('municipal_admin', 'super_admin')
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_municipality_accounts_updated_at
  BEFORE UPDATE ON public.municipality_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX idx_municipality_accounts_municipality_id ON public.municipality_accounts(municipality_id);
CREATE INDEX idx_municipality_accounts_admin_user_id ON public.municipality_accounts(admin_user_id);
CREATE INDEX idx_municipality_accounts_status ON public.municipality_accounts(status);
CREATE INDEX idx_user_invitations_municipality_id ON public.user_invitations(municipality_id);
CREATE INDEX idx_user_invitations_email ON public.user_invitations(email);
CREATE INDEX idx_user_invitations_status ON public.user_invitations(status);
CREATE INDEX idx_user_invitations_token ON public.user_invitations(token); 