#!/usr/bin/env node

/**
 * Authentication Setup Script for Municipal Breast Cancer Awareness Platform
 * 
 * This script helps set up authentication users in Supabase for development/testing.
 * It creates test users that correspond to the seed data in the database.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this to .env.local

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add these to your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@municipal.gov',
    password: 'admin123456',
    name: 'System Administrator',
    role: 'admin'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'supervisor@municipal.gov',
    password: 'supervisor123',
    name: 'Health Supervisor',
    role: 'moderator'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'analyst@municipal.gov',
    password: 'analyst123',
    name: 'Data Analyst',
    role: 'viewer'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'temp.user@municipal.gov',
    password: 'temp123456',
    name: 'Temporary User',
    role: 'viewer'
  }
];

async function createAuthUser(user) {
  try {
    console.log(`Creating auth user: ${user.email}...`);
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        role: user.role
      }
    });

    if (authError) {
      console.error(`❌ Failed to create auth user ${user.email}:`, authError.message);
      return false;
    }

    console.log(`✅ Created auth user: ${user.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating user ${user.email}:`, error.message);
    return false;
  }
}

async function setupAuthentication() {
  console.log('🚀 Setting up authentication for Municipal Breast Cancer Awareness Platform\n');

  let successCount = 0;
  let totalCount = testUsers.length;

  for (const user of testUsers) {
    const success = await createAuthUser(user);
    if (success) successCount++;
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n📊 Setup Summary:`);
  console.log(`   ✅ Successfully created: ${successCount}/${totalCount} users`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 Authentication setup completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@municipal.gov / admin123456');
    console.log('   Moderator: supervisor@municipal.gov / supervisor123');
    console.log('   Viewer: analyst@municipal.gov / analyst123');
    console.log('\n🌐 You can now log in to the application at http://localhost:3000/login');
  } else {
    console.log('\n⚠️  Some users failed to create. Check the errors above.');
    console.log('   You may need to delete existing users in Supabase Auth first.');
  }
}

// Run the setup
setupAuthentication().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
