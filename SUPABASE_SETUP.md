# 🗄️ Panduan Setup Supabase untuk PhysioBook

## Langkah 1: Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com)
2. Klik **"Start your project"** atau **"Sign In"** jika sudah punya akun
3. Login dengan GitHub, atau buat akun baru
4. Klik **"New Project"**
5. Isi detail project:
   - **Name:** `physiobook`
   - **Database Password:** (buat password yang kuat, simpan baik-baik!)
   - **Region:** Pilih yang terdekat (misal: Singapore)
6. Klik **"Create new project"**
7. Tunggu beberapa menit sampai project selesai dibuat

---

## Langkah 2: Dapatkan API Keys

Setelah project dibuat:

1. Klik **"Settings"** (ikon gear) di sidebar kiri
2. Klik **"API"** di submenu
3. Catat dan simpan:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (panjang)

> ⚠️ **JANGAN pernah share `service_role key`!** Kita hanya butuh `anon key`.

---

## Langkah 3: Buat Tabel Database

1. Klik **"SQL Editor"** di sidebar kiri
2. Klik **"+ New query"**
3. Copy-paste SQL di bawah ini:

```sql
-- ================================================
-- PHYSIOBOOK DATABASE SCHEMA
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. DEPARTMENTS TABLE (Master Data)
-- ================================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert beberapa departemen contoh (bisa ditambah/diedit admin nanti)
INSERT INTO departments (name) VALUES
    ('Human Resources'),
    ('Information Technology'),
    ('Finance'),
    ('Marketing'),
    ('Operations'),
    ('Production'),
    ('Quality Control'),
    ('Maintenance'),
    ('Warehouse'),
    ('General Affairs');

-- ================================================
-- 2. ACCESS CODES TABLE
-- ================================================
CREATE TABLE access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(4) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster code lookup
CREATE INDEX idx_access_codes_code ON access_codes(code);
CREATE INDEX idx_access_codes_is_used ON access_codes(is_used);

-- ================================================
-- 3. SLOTS TABLE
-- Jam Operasional: 07:00 - 22:00 (15 slot per hari)
-- Setiap slot = 1 jam, dimulai dari menit :00
-- ================================================
CREATE TABLE slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 7 AND hour <= 21),
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, hour)
);

-- Create index for faster slot lookup
CREATE INDEX idx_slots_date ON slots(date);
CREATE INDEX idx_slots_is_booked ON slots(is_booked);

-- ================================================
-- 4. REGISTRATIONS TABLE
-- ================================================
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    access_code_id UUID REFERENCES access_codes(id) ON DELETE RESTRICT,
    slot_id UUID REFERENCES slots(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    nama_lengkap VARCHAR(255) NOT NULL,
    nik VARCHAR(50) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    keluhan TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_registrations_created_at ON registrations(created_at);

-- ================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 6. RLS POLICIES - DEPARTMENTS
-- ================================================
-- Public can read active departments
CREATE POLICY "Public can read active departments" ON departments
    FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admin full access to departments" ON departments
    FOR ALL USING (auth.role() = 'authenticated');

-- ================================================
-- 7. RLS POLICIES - ACCESS CODES
-- ================================================
-- Public can read unused codes (for validation)
CREATE POLICY "Public can read codes for validation" ON access_codes
    FOR SELECT USING (true);

-- Public can update code to mark as used
CREATE POLICY "Public can mark code as used" ON access_codes
    FOR UPDATE USING (is_used = false);

-- Admin full access
CREATE POLICY "Admin full access to access_codes" ON access_codes
    FOR ALL USING (auth.role() = 'authenticated');

-- ================================================
-- 8. RLS POLICIES - SLOTS
-- ================================================
-- Public can read all slots (to see availability)
CREATE POLICY "Public can read slots" ON slots
    FOR SELECT USING (true);

-- Public can update slot to mark as booked
CREATE POLICY "Public can book slot" ON slots
    FOR UPDATE USING (is_booked = false);

-- Admin full access
CREATE POLICY "Admin full access to slots" ON slots
    FOR ALL USING (auth.role() = 'authenticated');

-- ================================================
-- 9. RLS POLICIES - REGISTRATIONS
-- ================================================
-- Public can insert registrations
CREATE POLICY "Public can create registration" ON registrations
    FOR INSERT WITH CHECK (true);

-- Admin can read all registrations
CREATE POLICY "Admin can read registrations" ON registrations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admin full access
CREATE POLICY "Admin full access to registrations" ON registrations
    FOR ALL USING (auth.role() = 'authenticated');

-- ================================================
-- 10. HELPER FUNCTIONS
-- ================================================

-- Function to generate random 4-digit code
CREATE OR REPLACE FUNCTION generate_unique_code()
RETURNS VARCHAR(4) AS $$
DECLARE
    new_code VARCHAR(4);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 4-digit number (1000-9999)
        new_code := LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM access_codes WHERE code = new_code) INTO code_exists;

        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;

    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate multiple codes at once
CREATE OR REPLACE FUNCTION generate_access_codes(count INTEGER)
RETURNS TABLE(id UUID, code VARCHAR(4)) AS $$
DECLARE
    i INTEGER;
    new_code VARCHAR(4);
    new_id UUID;
BEGIN
    FOR i IN 1..count LOOP
        new_code := generate_unique_code();

        INSERT INTO access_codes (code)
        VALUES (new_code)
        RETURNING access_codes.id, access_codes.code INTO new_id, new_code;

        id := new_id;
        code := new_code;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE(
    total_slots BIGINT,
    booked_slots BIGINT,
    available_slots BIGINT,
    total_codes BIGINT,
    used_codes BIGINT,
    unused_codes BIGINT,
    total_registrations BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM slots)::BIGINT as total_slots,
        (SELECT COUNT(*) FROM slots WHERE is_booked = true)::BIGINT as booked_slots,
        (SELECT COUNT(*) FROM slots WHERE is_booked = false)::BIGINT as available_slots,
        (SELECT COUNT(*) FROM access_codes)::BIGINT as total_codes,
        (SELECT COUNT(*) FROM access_codes WHERE is_used = true)::BIGINT as used_codes,
        (SELECT COUNT(*) FROM access_codes WHERE is_used = false)::BIGINT as unused_codes,
        (SELECT COUNT(*) FROM registrations)::BIGINT as total_registrations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

4. Klik **"Run"** (atau tekan Ctrl+Enter)
5. Pastikan tidak ada error (hijau = sukses)

---

## Langkah 4: Buat Admin User

1. Klik **"Authentication"** di sidebar kiri
2. Klik tab **"Users"**
3. Klik **"Add user"** > **"Create new user"**
4. Isi:
   - **Email:** `admin@physiobook.com` (atau email Anda)
   - **Password:** (buat password yang kuat)
   - ✅ **Auto Confirm User** (checklist ini)
5. Klik **"Create user"**

> 📝 Catat email dan password ini untuk login ke admin panel nanti!

---

## Langkah 5: Test Database (Opsional)

Untuk memastikan semuanya berjalan, coba jalankan query ini di SQL Editor:

```sql
-- Test: Generate 5 kode akses
SELECT * FROM generate_access_codes(5);

-- Test: Lihat departemen
SELECT * FROM departments;

-- Test: Lihat statistik dashboard
SELECT * FROM get_dashboard_stats();
```

---

## Langkah 6: Catat Kredensial

Setelah semua selesai, Anda akan membutuhkan:

| Item               | Nilai                       | Dimana                   |
| ------------------ | --------------------------- | ------------------------ |
| **Supabase URL**   | `https://xxxxx.supabase.co` | Settings > API           |
| **Anon Key**       | `eyJhbGc...`                | Settings > API           |
| **Admin Email**    | `admin@physiobook.com`      | Yang Anda buat di step 4 |
| **Admin Password** | `********`                  | Yang Anda buat di step 4 |

---

## ✅ Checklist Setup Supabase

- [ ] Project Supabase dibuat
- [ ] API URL dan Anon Key dicatat
- [ ] Semua tabel dibuat (departments, access_codes, slots, registrations)
- [ ] RLS Policies aktif
- [ ] Helper functions dibuat
- [ ] Admin user dibuat
- [ ] Test query berhasil

---

## 🔜 Langkah Selanjutnya

Setelah setup Supabase selesai, beritahu saya dengan memberikan:

1. **Supabase URL** (aman untuk dishare)
2. **Konfirmasi** bahwa admin user sudah dibuat

Kemudian saya akan mulai membuat aplikasi React-nya!

---

## ❓ Troubleshooting

### Error: "permission denied"

- Pastikan RLS policies sudah dibuat dengan benar
- Coba jalankan ulang bagian "RLS POLICIES" di SQL

### Error: "function already exists"

- Tidak masalah, artinya function sudah ada. Lanjut saja.

### Tidak bisa login sebagai admin

- Pastikan "Auto Confirm User" dicentang saat membuat user
- Atau pergi ke Authentication > Users > klik user > "Confirm email"
