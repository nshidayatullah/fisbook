-- Migration: Add Fisioterapis Role and Medical Records
-- Run this in Supabase SQL Editor

-- 1. Add medical record columns to registrations table
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS anamnesa TEXT,
ADD COLUMN IF NOT EXISTS pemeriksaan_fisik TEXT,
ADD COLUMN IF NOT EXISTS tindakan_dilakukan TEXT,
ADD COLUMN IF NOT EXISTS rencana_tindakan TEXT,
ADD COLUMN IF NOT EXISTS status_kunjungan VARCHAR(20) DEFAULT 'pending' CHECK (status_kunjungan IN ('pending', 'selesai')),
ADD COLUMN IF NOT EXISTS tanggal_kunjungan TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS fisioterapis_id UUID REFERENCES auth.users(id);

-- 2. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status_kunjungan);
CREATE INDEX IF NOT EXISTS idx_registrations_fisioterapis ON registrations(fisioterapis_id);

-- 3. Add role column to profiles table (or create profiles table if not exists)
-- Note: Supabase uses auth.users for authentication, but we need a profiles table for roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'fisioterapis')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Enable RLS (Row Level Security) on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile  
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 6. Grant permissions
GRANT SELECT, INSERT, UPDATE ON registrations TO authenticated;
GRANT SELECT ON profiles TO authenticated;

COMMENT ON COLUMN registrations.anamnesa IS 'Hasil anamnesa pasien oleh fisioterapis';
COMMENT ON COLUMN registrations.pemeriksaan_fisik IS 'Hasil pemeriksaan fisik pasien';
COMMENT ON COLUMN registrations.tindakan_dilakukan IS 'Tindakan yang telah dilakukan ke pasien';
COMMENT ON COLUMN registrations.rencana_tindakan IS 'Rencana tindakan selanjutnya untuk pasien';
COMMENT ON COLUMN registrations.status_kunjungan IS 'Status kunjungan: pending (belum dilayani) atau selesai (sudah dilayani)';
