# 📋 Brief Aplikasi Pendaftaran Fisioterapi Karyawan

## 1. Ringkasan Proyek

**Nama Proyek:** PhysioBook - Sistem Pendaftaran Fisioterapi Karyawan

**Tujuan:** Membangun aplikasi web untuk memfasilitasi pendaftaran jadwal fisioterapi bagi karyawan perusahaan dengan sistem kode akses yang dikelola oleh admin.

**Tech Stack:**

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL + Auth + Realtime)
- **Deployment:** (TBD - bisa Vercel/Netlify)

---

## 2. User Roles & Access

### 2.1 Admin

| Fitur               | Deskripsi                                                        |
| ------------------- | ---------------------------------------------------------------- |
| Login               | Autentikasi menggunakan Supabase Auth (email/password)           |
| Generate Slot       | Membuat slot jadwal per hari dengan checkbox jam (08:00 - 17:00) |
| Generate Kode       | Membuat kode akses 4 digit unik untuk setiap karyawan            |
| Lihat Pendaftaran   | Melihat daftar karyawan yang sudah mendaftar                     |
| Dashboard Analytics | Melihat statistik slot tersisa & slot terisi                     |

### 2.2 Karyawan (Public)

| Fitur            | Deskripsi                                            |
| ---------------- | ---------------------------------------------------- |
| Input Kode       | Memasukkan kode akses 4 digit untuk masuk            |
| Form Pendaftaran | Mengisi data diri & memilih slot yang tersedia       |
| Konfirmasi       | Melihat notifikasi sukses di web setelah pendaftaran |

---

## 3. Data Models

### 3.1 Tabel `admins` (via Supabase Auth)

Menggunakan Supabase Auth bawaan untuk admin login.

### 3.2 Tabel `access_codes`

| Kolom      | Tipe       | Deskripsi                     |
| ---------- | ---------- | ----------------------------- |
| id         | UUID       | Primary key                   |
| code       | VARCHAR(4) | Kode akses 4 digit (unique)   |
| is_used    | BOOLEAN    | Status apakah sudah digunakan |
| created_at | TIMESTAMP  | Waktu pembuatan               |

### 3.3 Tabel `slots`

| Kolom      | Tipe      | Deskripsi                      |
| ---------- | --------- | ------------------------------ |
| id         | UUID      | Primary key                    |
| date       | DATE      | Tanggal slot                   |
| hour       | INTEGER   | Jam (8-17, selalu dimulai :00) |
| is_booked  | BOOLEAN   | Status apakah sudah dipesan    |
| created_at | TIMESTAMP | Waktu pembuatan                |

**Unique Constraint:** `(date, hour)` - satu slot per jam per hari

### 3.4 Tabel `registrations`

| Kolom          | Tipe      | Deskripsi                  |
| -------------- | --------- | -------------------------- |
| id             | UUID      | Primary key                |
| access_code_id | UUID      | FK ke access_codes         |
| slot_id        | UUID      | FK ke slots                |
| nama_lengkap   | VARCHAR   | Nama karyawan (uppercase)  |
| nik            | VARCHAR   | NIK Karyawan               |
| no_hp          | VARCHAR   | Nomor HP                   |
| departemen     | VARCHAR   | Departemen karyawan        |
| keluhan        | TEXT      | Keluhan/alasan fisioterapi |
| created_at     | TIMESTAMP | Waktu pendaftaran          |

---

## 4. Fitur Detail

### 4.1 Admin - Generate Slot

```
┌─────────────────────────────────────────┐
│  Generate Slot Fisioterapi              │
├─────────────────────────────────────────┤
│  Pilih Tanggal: [📅 Date Picker]        │
│                                         │
│  Pilih Jam:                             │
│  ☑ 08:00  ☑ 09:00  ☑ 10:00  ☐ 11:00    │
│  ☐ 12:00  ☑ 13:00  ☑ 14:00  ☑ 15:00    │
│  ☐ 16:00  ☐ 17:00                       │
│                                         │
│  [Select All] [Deselect All]            │
│                                         │
│  [✓ Generate Slots]                     │
└─────────────────────────────────────────┘
```

### 4.2 Admin - Generate Kode Akses

```
┌─────────────────────────────────────────┐
│  Generate Kode Akses                    │
├─────────────────────────────────────────┤
│  Jumlah Kode: [___10___]                │
│                                         │
│  [✓ Generate Kode]                      │
│                                         │
│  Kode yang di-generate:                 │
│  ┌──────┬────────────┬─────────┐        │
│  │ Kode │ Status     │ Aksi    │        │
│  ├──────┼────────────┼─────────┤        │
│  │ 1234 │ Belum      │ [Copy]  │        │
│  │ 5678 │ Sudah      │ [Copy]  │        │
│  │ 9012 │ Belum      │ [Copy]  │        │
│  └──────┴────────────┴─────────┘        │
└─────────────────────────────────────────┘
```

### 4.3 Admin - Dashboard Analytics

```
┌─────────────────────────────────────────────────────┐
│  Dashboard                                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │     12      │  │      8      │  │      4      │  │
│  │ Total Slot  │  │ Slot Terisi │  │ Slot Kosong │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                     │
│  📊 Chart Pendaftaran per Hari (optional)          │
│                                                     │
│  Daftar Pendaftaran Terbaru:                       │
│  ┌──────────────┬────────┬──────────┬───────────┐  │
│  │ Nama         │ Tanggal│ Jam      │ Dept      │  │
│  ├──────────────┼────────┼──────────┼───────────┤  │
│  │ JOHN DOE     │ 02 Jan │ 09:00    │ IT        │  │
│  │ JANE SMITH   │ 02 Jan │ 10:00    │ HR        │  │
│  └──────────────┴────────┴──────────┴───────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.4 Karyawan - Halaman Input Kode

```
┌─────────────────────────────────────┐
│                                     │
│       🏥 PhysioBook                 │
│   Pendaftaran Fisioterapi           │
│                                     │
│   Masukkan Kode Akses:              │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│   │ 1 │ │ 2 │ │ 3 │ │ 4 │          │
│   └───┘ └───┘ └───┘ └───┘          │
│                                     │
│   [Lanjutkan →]                     │
│                                     │
│   ⓘ Hubungi admin untuk            │
│     mendapatkan kode akses         │
│                                     │
└─────────────────────────────────────┘
```

### 4.5 Karyawan - Form Pendaftaran (Mobile-First)

```
┌─────────────────────────────────────┐
│  ← Kembali                          │
│                                     │
│  📝 Form Pendaftaran                │
│                                     │
│  Nama Lengkap *                     │
│  ┌─────────────────────────────┐    │
│  │ JOHN DOE                    │    │
│  └─────────────────────────────┘    │
│  (Auto uppercase saat mengetik)     │
│                                     │
│  NIK Karyawan *                     │
│  ┌─────────────────────────────┐    │
│  │ 12345678                    │    │
│  └─────────────────────────────┘    │
│                                     │
│  No. HP *                           │
│  ┌─────────────────────────────┐    │
│  │ 081234567890                │    │
│  └─────────────────────────────┘    │
│                                     │
│  Departemen *                       │
│  ┌─────────────────────────────┐    │
│  │ IT Department          ▼   │    │
│  └─────────────────────────────┘    │
│                                     │
│  Keluhan *                          │
│  ┌─────────────────────────────┐    │
│  │ Nyeri punggung bagian       │    │
│  │ bawah setelah duduk lama    │    │
│  └─────────────────────────────┘    │
│                                     │
│  Pilih Tanggal & Slot *             │
│  ┌─────────────────────────────┐    │
│  │ 📅 Kamis, 02 Januari 2025   │    │
│  │                             │    │
│  │ ⚪ 08:00 - 09:00            │    │
│  │ ⚪ 09:00 - 10:00            │    │
│  │ 🔵 10:00 - 11:00 ✓          │    │
│  │ ⚫ 11:00 - 12:00 (Penuh)    │    │
│  │ ⚪ 13:00 - 14:00            │    │
│  └─────────────────────────────┘    │
│                                     │
│  [✓ Daftar Sekarang]                │
│                                     │
└─────────────────────────────────────┘
```

### 4.6 Karyawan - Konfirmasi Sukses

```
┌─────────────────────────────────────┐
│                                     │
│            ✅                       │
│                                     │
│   Pendaftaran Berhasil!             │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Nama: JOHN DOE              │   │
│   │ Tanggal: 02 Januari 2025    │   │
│   │ Jam: 10:00 - 11:00          │   │
│   │ Lokasi: Ruang Fisioterapi   │   │
│   └─────────────────────────────┘   │
│                                     │
│   ⚠️ Screenshot halaman ini        │
│      sebagai bukti pendaftaran      │
│                                     │
│   [🏠 Kembali ke Beranda]           │
│                                     │
└─────────────────────────────────────┘
```

---

## 5. Alur Aplikasi (User Flow)

### 5.1 Flow Admin

```
Login → Dashboard → Generate Slot / Generate Kode / Lihat Pendaftaran
         ↓
    [Statistik]
    - Total Slot
    - Slot Terisi
    - Slot Tersisa
```

### 5.2 Flow Karyawan

```
Input Kode (4 digit)
    ↓
[Validasi Kode]
    ↓
Kode Valid?
    → Ya: Form Pendaftaran
    → Tidak: Error "Kode tidak valid / sudah digunakan"
    ↓
Isi Form + Pilih Slot
    ↓
[Submit]
    ↓
Halaman Konfirmasi Sukses
```

---

## 6. Halaman yang Dibutuhkan

### Frontend Routes

| Route                  | Halaman              | Akses               |
| ---------------------- | -------------------- | ------------------- |
| `/`                    | Landing + Input Kode | Public              |
| `/register`            | Form Pendaftaran     | Public (valid code) |
| `/success`             | Konfirmasi Sukses    | Public              |
| `/admin/login`         | Login Admin          | Public              |
| `/admin/dashboard`     | Dashboard Analytics  | Admin               |
| `/admin/slots`         | Manage Slots         | Admin               |
| `/admin/codes`         | Manage Kode Akses    | Admin               |
| `/admin/registrations` | Daftar Pendaftaran   | Admin               |

---

## 7. Validasi & Error Handling

### 7.1 Kode Akses

- Kode harus 4 digit angka
- Kode harus ada di database
- Kode belum pernah digunakan

### 7.2 Form Pendaftaran

- Semua field wajib diisi
- Nama auto uppercase
- NIK: format angka
- No HP: format Indonesia (08xx atau +62)
- Slot harus dipilih

### 7.3 Unique Constraints

- 1 kode = 1 pendaftaran
- 1 slot = 1 orang

---

## 8. UI/UX Requirements

### 8.1 Karyawan (Mobile-First)

- Responsive design (mobile-first approach)
- Touch-friendly buttons (min 44x44px)
- Large, readable fonts
- Clear visual feedback (loading, success, error)
- Minimal scrolling

### 8.2 Admin (Desktop-Focused)

- Sidebar navigation
- Data tables dengan pagination
- Quick actions
- Real-time update stats (opsional dengan Supabase Realtime)

### 8.3 Color Scheme (Suggestion)

```
Primary: Blue (#3B82F6) - Trust, Professional
Success: Green (#10B981) - Confirmation
Warning: Amber (#F59E0B) - Slot hampir penuh
Error: Red (#EF4444) - Error messages
Background: White/Gray (#F9FAFB)
```

---

## 9. Struktur Proyek

```
physiobook/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI (Button, Input, Card, etc)
│   │   ├── admin/           # Admin-specific components
│   │   └── employee/        # Employee-specific components
│   ├── pages/
│   │   ├── Home.jsx         # Landing + Code Input
│   │   ├── Register.jsx     # Registration Form
│   │   ├── Success.jsx      # Success Page
│   │   └── admin/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Slots.jsx
│   │       ├── Codes.jsx
│   │       └── Registrations.jsx
│   ├── hooks/               # Custom hooks
│   ├── lib/
│   │   └── supabase.js      # Supabase client
│   ├── context/             # Auth context
│   ├── utils/               # Helper functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css            # Tailwind imports
├── .env                     # Supabase credentials
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 10. Database Setup (Supabase SQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Access Codes Table
CREATE TABLE access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(4) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slots Table
CREATE TABLE slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, hour)
);

-- Registrations Table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    access_code_id UUID REFERENCES access_codes(id),
    slot_id UUID REFERENCES slots(id),
    nama_lengkap VARCHAR(255) NOT NULL,
    nik VARCHAR(50) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    departemen VARCHAR(100) NOT NULL,
    keluhan TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Policies for public access (read available slots, validate codes)
CREATE POLICY "Public can read available slots" ON slots
    FOR SELECT USING (is_booked = false);

CREATE POLICY "Public can validate codes" ON access_codes
    FOR SELECT USING (is_used = false);

-- Policies for authenticated admin
CREATE POLICY "Admin full access to slots" ON slots
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to codes" ON access_codes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to registrations" ON registrations
    FOR ALL USING (auth.role() = 'authenticated');
```

---

## 11. Timeline Estimasi

| Fase             | Durasi   | Deliverable                            |
| ---------------- | -------- | -------------------------------------- |
| Setup Proyek     | 1 hari   | Vite + React + Tailwind + Supabase     |
| Database & Auth  | 1 hari   | Tables + RLS + Admin Auth              |
| UI Components    | 1-2 hari | Reusable components                    |
| Halaman Karyawan | 1-2 hari | Home, Register, Success                |
| Halaman Admin    | 2-3 hari | Dashboard, Slots, Codes, Registrations |
| Testing & Polish | 1 hari   | Bug fixes, responsive testing          |

**Total Estimasi: 7-10 hari**

---

## 12. Catatan Tambahan

### Security

- Kode akses di-generate secara random dan unique
- Gunakan Supabase RLS untuk proteksi data
- Admin auth menggunakan Supabase Auth

### Scalability

- Database sudah normalized
- Bisa tambah fitur export ke Excel di masa depan
- Bisa tambah notifikasi email/WhatsApp di masa depan

### Nice-to-Have (Future)

- Export data ke Excel/PDF
- Reminder via WhatsApp
- Multiple lokasi fisioterapi
- Rescheduling

---

## ✅ Checklist Sebelum Mulai

- [ ] Buat project Supabase baru
- [ ] Dapatkan Supabase URL dan Anon Key
- [ ] Setup tabel dan RLS policies
- [ ] Buat admin user di Supabase Auth
- [ ] Tentukan list departemen (static atau dynamic)

---

**Status:** ⏳ Menunggu Konfirmasi

Apakah brief ini sudah sesuai? Jika sudah, saya akan mulai implementasi.
