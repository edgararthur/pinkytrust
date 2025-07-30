-- Fix activity_logs table
ALTER TABLE public.activity_logs 
  ALTER COLUMN resource_id TYPE UUID USING resource_id::uuid;

-- Fix users table
ALTER TABLE public.users 
  RENAME COLUMN id TO user_id;

-- Add municipality_id column to users and organizations if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'municipality_id') 
  THEN
    ALTER TABLE public.users 
      ADD COLUMN municipality_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'municipality_id') 
  THEN
    ALTER TABLE public.organizations 
      ADD COLUMN municipality_id UUID;
  END IF;
END $$;

-- Add foreign key constraints
ALTER TABLE public.organizations 
  ADD CONSTRAINT fk_organizations_municipality 
  FOREIGN KEY (municipality_id) 
  REFERENCES public.municipalities(id) 
  ON DELETE SET NULL;

ALTER TABLE public.users 
  ADD CONSTRAINT fk_users_municipality 
  FOREIGN KEY (municipality_id) 
  REFERENCES public.municipalities(id) 
  ON DELETE SET NULL;

-- Create municipalities table if not exists
CREATE TABLE IF NOT EXISTS public.municipalities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  region TEXT NOT NULL,
  district TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_municipalities_updated_at 
  BEFORE UPDATE ON public.municipalities 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on municipality code
CREATE INDEX IF NOT EXISTS idx_municipalities_code ON public.municipalities(code);

-- Insert some initial municipalities
INSERT INTO public.municipalities (name, code, region, district)
VALUES 
  ('Ga West Municipal Assembly', 'ga-west-municipal', 'Greater Accra', 'Ga West'),
  ('Accra Metropolitan Assembly', 'accra-metro', 'Greater Accra', 'Accra'),
  ('Tema Metropolitan Assembly', 'tema-metro', 'Greater Accra', 'Tema'),
  ('Kumasi Metropolitan Assembly', 'kumasi-metro', 'Ashanti', 'Kumasi'),
  ('Cape Coast Metropolitan Assembly', 'cape-coast-metro', 'Central', 'Cape Coast')
ON CONFLICT (code) DO NOTHING; 