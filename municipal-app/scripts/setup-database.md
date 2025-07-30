# Database Setup Instructions

## Quick Setup

To set up the required database tables for the Municipal Breast Cancer Awareness Platform, follow these steps:

### 1. Access Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to the **SQL Editor** tab

### 2. Run the Migration

Copy and paste the following SQL into the SQL Editor and click "Run":

```sql
-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table with new role structure
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'municipal_admin', 'manager', 'staff', 'viewer')),
    municipality_id TEXT,
    department TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create municipality_accounts table
CREATE TABLE IF NOT EXISTS public.municipality_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    municipality_id TEXT UNIQUE NOT NULL,
    municipality_name TEXT NOT NULL,
    region_id TEXT NOT NULL,
    region_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
    admin_user_id UUID REFERENCES auth.users(id),
    contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    subscription JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE
);

-- Create user_invitations table
CREATE TABLE IF NOT EXISTS public.user_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    municipality_id TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'municipal_admin', 'manager', 'staff', 'viewer')),
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipality_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies
CREATE POLICY "Authenticated users can view system settings" ON public.system_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage system settings" ON public.system_settings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view municipality accounts" ON public.municipality_accounts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage municipality accounts" ON public.municipality_accounts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view invitations" ON public.user_invitations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage invitations" ON public.user_invitations
    FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_municipality_id ON public.users(municipality_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_municipality_accounts_status ON public.municipality_accounts(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON public.user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON public.user_invitations(token);

-- Insert initial system setting
INSERT INTO public.system_settings (key, value, description) 
VALUES ('super_admin_created', 'false', 'Tracks whether the initial super admin account has been created')
ON CONFLICT (key) DO NOTHING;
```

### 3. Verify Setup

After running the SQL, verify that the tables were created:

1. Go to the **Table Editor** tab in Supabase
2. You should see the following tables:
   - `system_settings`
   - `users`
   - `municipality_accounts`
   - `user_invitations`

### 4. Access the Application

1. Navigate to your application URL
2. You should be redirected to `/setup` to create the super admin account
3. Complete the super admin setup
4. Start registering municipalities!

## Troubleshooting

### Tables Not Created
- Make sure you're running the SQL in the correct project
- Check for any error messages in the SQL Editor
- Ensure you have the necessary permissions

### RLS Policies Issues
- The policies are set to allow service role access for management
- Authenticated users can view most data
- Individual user access is controlled by the application logic

### Need Help?
If you encounter any issues, please check:
1. Your Supabase project settings
2. Environment variables in your application
3. Network connectivity to Supabase

## Next Steps

After setting up the database:

1. **Create Super Admin**: Visit `/setup` to create the initial super admin account
2. **Register Municipalities**: Use the super admin account to register municipalities
3. **Invite Users**: Municipal admins can invite staff members
4. **Configure Settings**: Customize the platform for your needs

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Policies are designed to be secure by default
- The service role key should be kept secure and only used server-side
- Regular users only have access to their own data and public information
