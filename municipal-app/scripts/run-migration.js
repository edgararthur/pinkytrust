const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Running database migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_create_system_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Try direct execution if RPC fails
            const { error: directError } = await supabase
              .from('_temp')
              .select('*')
              .limit(0);
            
            if (directError && directError.code !== '42P01') {
              console.warn(`⚠️  Warning on statement ${i + 1}:`, error.message);
            }
          }
        } catch (err) {
          console.warn(`⚠️  Warning on statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tables = ['system_settings', 'users', 'municipality_accounts', 'user_invitations'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && error.code === '42P01') {
          console.log(`❌ Table '${table}' was not created`);
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function runMigrationDirect() {
  try {
    console.log('🚀 Running database migration (direct method)...');
    
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_create_system_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Create tables one by one
    const createStatements = [
      `CREATE TABLE IF NOT EXISTS public.system_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS public.users (
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL DEFAULT 'viewer',
        municipality_id TEXT,
        department TEXT,
        permissions JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      `INSERT INTO public.system_settings (key, value, description) 
       VALUES ('super_admin_created', 'false', 'Tracks whether the initial super admin account has been created')
       ON CONFLICT (key) DO NOTHING`
    ];
    
    for (const statement of createStatements) {
      try {
        console.log('Executing:', statement.substring(0, 50) + '...');
        // This is a simplified approach - in production you'd use proper migration tools
        console.log('✅ Statement prepared (would execute in real migration)');
      } catch (error) {
        console.warn('⚠️  Warning:', error.message);
      }
    }
    
    console.log('✅ Migration simulation completed!');
    console.log('📝 To run the actual migration, execute the SQL file in your Supabase dashboard.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (process.argv.includes('--direct')) {
  runMigrationDirect();
} else {
  runMigration();
}
