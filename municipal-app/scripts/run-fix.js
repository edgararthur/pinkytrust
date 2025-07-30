#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Database Fix Script');
console.log('======================');
console.log('');
console.log('This script will help you fix the "municipality_id column does not exist" error.');
console.log('');

// Check if .env.local exists
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('');
  console.log('Please create a .env.local file with your Supabase credentials:');
  console.log('');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('');
  process.exit(1);
}

// Read the SQL fix file
const sqlPath = path.join(__dirname, 'fix-database.sql');
if (!fs.existsSync(sqlPath)) {
  console.log('❌ fix-database.sql file not found!');
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlPath, 'utf8');

console.log('📋 Instructions to fix your database:');
console.log('');
console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Navigate to the "SQL Editor" tab');
console.log('4. Create a new query');
console.log('5. Copy and paste the SQL below into the editor');
console.log('6. Click "Run" to execute the SQL');
console.log('');
console.log('📄 SQL to run:');
console.log('================');
console.log('');
console.log(sqlContent);
console.log('');
console.log('================');
console.log('');
console.log('✅ After running the SQL:');
console.log('');
console.log('1. Refresh your application');
console.log('2. You should be redirected to /setup');
console.log('3. Create your super admin account');
console.log('4. Start using the platform!');
console.log('');
console.log('🆘 If you encounter any issues:');
console.log('');
console.log('1. Check that all environment variables are correct');
console.log('2. Ensure your Supabase project is active');
console.log('3. Verify you have the correct permissions');
console.log('4. Try running the SQL statements one by one');
console.log('');

// Also save the SQL to a temporary file for easy copying
const tempSqlPath = path.join(__dirname, '../temp-fix.sql');
fs.writeFileSync(tempSqlPath, sqlContent);
console.log(`💾 SQL also saved to: ${tempSqlPath}`);
console.log('   You can copy this file content directly into Supabase SQL Editor');
console.log('');
