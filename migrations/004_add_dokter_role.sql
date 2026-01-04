-- Migration: Add Dokter Role
-- Run this in Supabase SQL Editor

-- 1. Update profiles table check constraint untuk include 'dokter'
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'fisioterapis', 'dokter'));

-- 2. Verify
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role';

-- 3. Check existing users
SELECT id, email, role, full_name 
FROM profiles
ORDER BY created_at DESC;
