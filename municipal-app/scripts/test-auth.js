#!/usr/bin/env node

/**
 * Authentication Test Script
 * 
 * This script tests the authentication flow and database connectivity
 * to ensure everything is working correctly.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
}

async function testUserData() {
  console.log('🔍 Testing user data...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Failed to fetch users:', error.message);
      return false;
    }
    
    console.log(`✅ Found ${data.length} users in database`);
    if (data.length > 0) {
      console.log('   Sample user:', {
        email: data[0].email,
        name: data[0].name,
        role: data[0].role,
        is_active: data[0].is_active
      });
    }
    return true;
  } catch (error) {
    console.error('❌ User data test error:', error.message);
    return false;
  }
}

async function testAuthentication() {
  console.log('🔍 Testing authentication with test user...');
  
  try {
    // Try to sign in with test credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@municipal.gov',
      password: 'admin123456'
    });
    
    if (error) {
      console.error('❌ Authentication failed:', error.message);
      console.log('   Make sure you have run the setup-auth.js script first');
      return false;
    }
    
    console.log('✅ Authentication successful');
    console.log('   User ID:', data.user.id);
    console.log('   Email:', data.user.email);
    
    // Test fetching user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      console.error('❌ Failed to fetch user profile:', userError.message);
      return false;
    }
    
    console.log('✅ User profile fetched successfully');
    console.log('   Name:', userData.name);
    console.log('   Role:', userData.role);
    
    // Sign out
    await supabase.auth.signOut();
    console.log('✅ Sign out successful');
    
    return true;
  } catch (error) {
    console.error('❌ Authentication test error:', error.message);
    return false;
  }
}

async function testOrganizationData() {
  console.log('🔍 Testing organization data...');
  
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('❌ Failed to fetch organizations:', error.message);
      return false;
    }
    
    console.log(`✅ Found ${data.length} organizations in database`);
    return true;
  } catch (error) {
    console.error('❌ Organization data test error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Running Authentication and Database Tests\n');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'User Data', fn: testUserData },
    { name: 'Organization Data', fn: testOrganizationData },
    { name: 'Authentication Flow', fn: testAuthentication }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) passed++;
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your authentication system is ready.');
    console.log('\n🌐 You can now start the development server:');
    console.log('   npm run dev');
    console.log('\n🔑 Login at http://localhost:3000/login with:');
    console.log('   Email: admin@municipal.gov');
    console.log('   Password: admin123456');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the setup:');
    console.log('   1. Run: npx supabase db reset');
    console.log('   2. Run: node scripts/setup-auth.js');
    console.log('   3. Run this test again');
  }
}

runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
