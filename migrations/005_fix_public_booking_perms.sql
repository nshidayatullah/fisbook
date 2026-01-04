-- FIX: Public Booking Permissions
-- Run this in Supabase SQL Editor to fix "Gagal memesan slot" errors

-- 1. SLOTS Table Permissions
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

-- Allow public to VIEW slots
DROP POLICY IF EXISTS "Public can view slots" ON slots;
CREATE POLICY "Public can view slots"
ON slots FOR SELECT
TO anon, authenticated
USING (true);

-- Allow public to UPDATE slots (for booking)
DROP POLICY IF EXISTS "Public can book slots" ON slots;
CREATE POLICY "Public can book slots"
ON slots FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 2. ACCESS_CODES Table Permissions
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Allow public to VIEW access codes (for validation)
DROP POLICY IF EXISTS "Public can view access codes" ON access_codes;
CREATE POLICY "Public can view access codes"
ON access_codes FOR SELECT
TO anon, authenticated
USING (true);

-- Allow public to UPDATE access codes (mark as used)
DROP POLICY IF EXISTS "Public can use access codes" ON access_codes;
CREATE POLICY "Public can use access codes"
ON access_codes FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 3. REGISTRATIONS Table Permissions
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow public to INSERT registrations
DROP POLICY IF EXISTS "Public can create registrations" ON registrations;
CREATE POLICY "Public can create registrations"
ON registrations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow public to VIEW registrations (for success page)
DROP POLICY IF EXISTS "Public can view registrations" ON registrations;
CREATE POLICY "Public can view registrations"
ON registrations FOR SELECT
TO anon, authenticated
USING (true);

-- Grant usage just in case
GRANT ALL ON slots TO anon, authenticated;
GRANT ALL ON access_codes TO anon, authenticated;
GRANT ALL ON registrations TO anon, authenticated;
