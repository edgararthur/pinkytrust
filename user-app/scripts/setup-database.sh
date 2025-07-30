#!/bin/bash

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "Error: SUPABASE_DB_URL must be set"
  echo "Example: postgresql://postgres:your-password@your-project.supabase.co:5432/postgres"
  exit 1
fi

# Apply the schema
echo "Applying database schema..."
psql "$SUPABASE_DB_URL" -f supabase/schema.sql

# Check if the schema was applied successfully
if [ $? -eq 0 ]; then
  echo "Database schema applied successfully"
else
  echo "Error: Failed to apply database schema"
  exit 1
fi 