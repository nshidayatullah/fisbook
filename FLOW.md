# PhysioBook - Process Flow Documentation

Dokumentasi lengkap alur proses aplikasi **PhysioBook** - Sistem Booking Fisioterapi.

---

## 📊 Daftar Isi

1. [Public Registration Flow](#1-public-registration-flow)
2. [Admin Flow](#2-admin-flow)
3. [Dokter Flow](#3-dokter-flow)
4. [Fisioterapis Flow](#4-fisioterapis-flow)
5. [User Management Flow](#5-user-management-flow)

---

## 1. Public Registration Flow

Alur pendaftaran pasien oleh umum/karyawan.

```mermaid
flowchart TD
    Start([Pasien Buka Website]) --> Input[Input Kode Akses 4 Digit]
    Input --> ValidateCode{Kode Valid?}

    ValidateCode -->|Tidak| ErrorCode[Tampil Error: Kode Tidak Valid]
    ErrorCode --> Input

    ValidateCode -->|Ya| FormPage[Halaman Form Pendaftaran]
    FormPage --> SelectSlot[Pilih Slot Waktu]
    SelectSlot --> SelectDept[Pilih Departemen]
    SelectDept --> FillForm[Isi Data: NIK, Nama, HP, Keluhan]

    FillForm --> ValidateForm{Data Lengkap?}
    ValidateForm -->|Tidak| ErrorForm[Tampil Error Validasi]
    ErrorForm --> FillForm

    ValidateForm -->|Ya| Submit[Submit Registrasi]
    Submit --> SaveDB[(Simpan ke Database)]
    SaveDB --> Success[Halaman Success]
    Success --> End([Selesai])
```

### Detail Proses:

1. **Input Kode Akses**: Pasien input 4 digit kode akses yang valid
2. **Validasi**: Sistem check kode di database (tabel `access_codes`)
3. **Form**: Pasien isi data diri dan pilih slot
4. **Submit**: Data tersimpan ke tabel `registrations` dengan status `pending`

---

## 2. Admin Flow

Alur kerja untuk role **Admin**.

```mermaid
flowchart TD
    Start([Login Admin]) --> Auth{Autentikasi}
    Auth -->|Gagal| LoginError[Error: Email/Password Salah]
    LoginError --> Start

    Auth -->|Berhasil| CheckRole{Role = Admin?}
    CheckRole -->|Tidak| AccessDenied[Access Denied]
    CheckRole -->|Ya| Dashboard[Dashboard Admin]

    Dashboard --> Menu{Pilih Menu}

    Menu -->|Kelola Slot| ManageSlots[CRUD Slot Waktu]
    Menu -->|Kode Akses| ManageCodes[CRUD Kode Akses]
    Menu -->|Pendaftaran| ViewReg[Lihat & Hapus Registrasi]
    Menu -->|Departemen| ManageDept[CRUD Departemen]
    Menu -->|Manajemen User| ManageUsers[CRUD User: Admin, Dokter, Fisioterapis]

    ManageUsers --> UserActions{Aksi User}
    UserActions -->|Create| CreateUser[Buat User Baru]
    UserActions -->|Edit| EditUser[Edit Role/Nama]
    UserActions -->|Delete| DeleteUser[Hapus User]
    UserActions -->|Reset PW| ResetPassword[Instruksi Reset via Supabase]

    UserActions --> Dashboard
    ManageSlots --> Dashboard
    ManageCodes --> Dashboard
    ViewReg --> Dashboard
    ManageDept --> Dashboard

    Dashboard --> Logout([Logout])
```

### Fitur Admin:

- ✅ Dashboard dengan statistik
- ✅ Kelola slot waktu
- ✅ Kelola kode akses
- ✅ Lihat & hapus registrasi
- ✅ Kelola departemen
- ✅ **User management** (create, edit, delete, reset password)

---

## 3. Dokter Flow

Alur kerja untuk role **Dokter** (Admin tanpa user management).

```mermaid
flowchart TD
    Start([Login Dokter]) --> Auth{Autentikasi}
    Auth -->|Gagal| LoginError[Error: Email/Password Salah]
    LoginError --> Start

    Auth -->|Berhasil| CheckRole{Role = Dokter?}
    CheckRole -->|Tidak| AccessDenied[Access Denied]
    CheckRole -->|Ya| Dashboard[Dashboard Dokter]

    Dashboard --> Menu{Pilih Menu}

    Menu -->|Kelola Slot| ManageSlots[CRUD Slot Waktu]
    Menu -->|Kode Akses| ManageCodes[CRUD Kode Akses]
    Menu -->|Pendaftaran| ViewReg[Lihat & Hapus Registrasi]
    Menu -->|Departemen| ManageDept[CRUD Departemen]
    Menu -->|Antrian Pasien| ViewQueue[Lihat Antrian Pasien READ-ONLY]
    Menu -->|Riwayat| ViewHistory[Lihat Riwayat Pelayanan READ-ONLY]

    ViewQueue --> ViewDetail[Lihat Detail Pasien]
    ViewDetail --> CheckStatus{Status = Selesai?}
    CheckStatus -->|Ya| ShowMedical[Tampil Rekam Medis]
    CheckStatus -->|Tidak| PendingMsg[Info: Belum Dilayani]

    ViewHistory --> Export[Download Excel]
    Export --> ExcelFile[File: Riwayat_Pelayanan_YYYY-MM-DD.xlsx]

    ShowMedical --> Dashboard
    PendingMsg --> Dashboard
    ManageSlots --> Dashboard
    ManageCodes --> Dashboard
    ViewReg --> Dashboard
    ManageDept --> Dashboard
    ExcelFile --> Dashboard

    Dashboard --> Logout([Logout])
```

### Fitur Dokter:

- ✅ Semua fitur Admin **kecuali** user management
- ✅ **Antrian Pasien** (read-only)
- ✅ **Riwayat Pelayanan** (read-only)
- ✅ **Download Excel** rekap riwayat

---

## 4. Fisioterapis Flow

Alur kerja untuk role **Fisioterapis** (Input rekam medis).

```mermaid
flowchart TD
    Start([Login Fisioterapis]) --> Auth{Autentikasi}
    Auth -->|Gagal| LoginError[Error: Email/Password Salah]
    LoginError --> Start

    Auth -->|Berhasil| CheckRole{Role = Fisioterapis?}
    CheckRole -->|Tidak| AccessDenied[Access Denied]
    CheckRole -->|Ya| Dashboard[Dashboard Fisioterapis]

    Dashboard --> ShowQueue[Tampil Antrian Pasien Pending]
    ShowQueue --> Menu{Pilih Menu}

    Menu -->|Pilih Pasien| PatientDetail[Detail Pasien]
    PatientDetail --> ViewInfo[Lihat Info: NIK, HP, Keluhan, Jadwal]
    ViewInfo --> InputMedical[Input Rekam Medis]

    InputMedical --> FillAnamnesa[Isi Anamnesa]
    FillAnamnesa --> FillPhysical[Isi Pemeriksaan Fisik]
    FillPhysical --> FillAction[Isi Tindakan Dilakukan]
    FillAction --> FillPlan[Isi Rencana Tindakan]

    FillPlan --> ValidateMedical{Semua Field Terisi?}
    ValidateMedical -->|Tidak| ErrorValidation[Error: Lengkapi Semua Field]
    ErrorValidation --> InputMedical

    ValidateMedical -->|Ya| SaveMedical[Simpan Rekam Medis]
    SaveMedical --> UpdateStatus[Update Status: pending → selesai]
    UpdateStatus --> SetDate[Set Tanggal Kunjungan]
    SetDate --> Success[Berhasil: Pasien Selesai Dilayani]
    Success --> Dashboard

    Menu -->|Riwayat| ViewHistory[Lihat Riwayat Pelayanan]
    ViewHistory --> HistoryActions{Aksi}
    HistoryActions -->|Lihat Detail| ViewMedical[Lihat Rekam Medis]
    HistoryActions -->|Delete| DeleteHistory[Hapus Riwayat]
    HistoryActions -->|Export| ExportExcel[Download Excel]

    ViewMedical --> Dashboard
    DeleteHistory --> ConfirmDelete{Konfirmasi?}
    ConfirmDelete -->|Ya| DoDelete[Hapus dari Database]
    ConfirmDelete -->|Tidak| Dashboard
    DoDelete --> Dashboard

    ExportExcel --> ExcelFile[File: Riwayat_Pelayanan_YYYY-MM-DD.xlsx]
    ExcelFile --> Dashboard

    Dashboard --> Logout([Logout])
```

### Fitur Fisioterapis:

- ✅ Dashboard antrian pasien pending
- ✅ **Input rekam medis** lengkap
- ✅ Riwayat pelayanan
- ✅ **Hapus** riwayat pasien
- ✅ **Download Excel** rekap riwayat

---

## 5. User Management Flow

Alur khusus untuk management user (hanya Admin).

```mermaid
flowchart TD
    Start([Admin Menu User Management]) --> ViewUsers[Tampil Daftar User]
    ViewUsers --> Action{Pilih Aksi}

    Action -->|Create| CreateForm[Form Buat User Baru]
    CreateForm --> InputData[Input: Email, Password, Nama, Role]
    InputData --> SelectRole{Pilih Role}
    SelectRole -->|Admin| SetAdmin[Set Role: Admin]
    SelectRole -->|Dokter| SetDokter[Set Role: Dokter]
    SelectRole -->|Fisioterapis| SetFisio[Set Role: Fisioterapis]

    SetAdmin --> CreateUser[Create User via Supabase Auth]
    SetDokter --> CreateUser
    SetFisio --> CreateUser
    CreateUser --> CreateProfile[Create Profile Entry]
    CreateProfile --> SuccessCreate[Success: User Created]
    SuccessCreate --> ViewUsers

    Action -->|Edit| EditForm[Form Edit User]
    EditForm --> EditData[Edit: Nama, Role]
    EditData --> UpdateProfile[Update Profile Table]
    UpdateProfile --> SuccessEdit[Success: User Updated]
    SuccessEdit --> ViewUsers

    Action -->|Delete| ConfirmDelete{Konfirmasi Hapus?}
    ConfirmDelete -->|Tidak| ViewUsers
    ConfirmDelete -->|Ya| DeleteProfile[Delete dari Profile Table]
    DeleteProfile --> SuccessDelete[Success: User Deleted]
    SuccessDelete --> ViewUsers

    Action -->|Reset Password| ResetModal[Modal Reset Password]
    ResetModal --> ShowInstructions[Tampil Instruksi]
    ShowInstructions --> SupabaseLink[Link ke Supabase Dashboard]
    SupabaseLink --> ManualReset[Admin Reset Manual via Supabase]
    ManualReset --> ViewUsers
```

### Detail User Management:

1. **Create User**: Admin input email, password, nama, role → User otomatis confirmed
2. **Edit User**: Admin bisa ubah nama dan role user
3. **Delete User**: Hapus dari `profiles` table (optimistic update)
4. **Reset Password**: Instruksi untuk reset via Supabase Dashboard

---

## 📋 Database Tables

### Tabel Utama:

1. **`access_codes`**

   - `id`, `code`, `department_id`, `slot_id`, `is_used`, `created_at`

2. **`slots`**

   - `id`, `date`, `hour`, `quota`, `created_at`

3. **`departments`**

   - `id`, `name`, `description`, `created_at`

4. **`registrations`**

   - `id`, `access_code_id`, `slot_id`, `department_id`
   - `nik`, `nama_lengkap`, `no_hp`, `keluhan`
   - `status_kunjungan` (`pending` / `selesai`)
   - `anamnesa`, `pemeriksaan_fisik`, `tindakan_dilakukan`, `rencana_tindakan`
   - `tanggal_kunjungan`, `fisioterapis_id`
   - `created_at`

5. **`profiles`**
   - `id`, `email`, `role` (`admin` / `dokter` / `fisioterapis`)
   - `full_name`, `created_at`, `updated_at`

---

## 🔐 Authentication & Authorization

### Authentication Method:

- **Supabase Auth** (email + password)

### Role-Based Access:

| Role             | Access                                                         |
| ---------------- | -------------------------------------------------------------- |
| **Public**       | Registrasi pasien (input kode akses)                           |
| **Admin**        | Full access (dashboard, CRUD semua, user management)           |
| **Dokter**       | Admin tanpa user management + view antrian/riwayat (read-only) |
| **Fisioterapis** | Input rekam medis + view/delete riwayat                        |

### Route Protection:

- `/admin/*` → Admin & Dokter only
- `/fisioterapis/*` → Fisioterapis only
- Public routes tanpa auth

---

## 📊 Export Excel

### Fitur Export:

- **Tersedia untuk**: Dokter & Fisioterapis
- **Halaman**: Riwayat Pelayanan
- **Format**: `.xlsx` (Excel 2007+)
- **Data**:
  - No, Nama, NIK, HP, Departemen
  - Keluhan, Tanggal Kunjungan
  - Anamnesa, Pemeriksaan Fisik
  - Tindakan Dilakukan, Rencana Tindakan

### Filename Format:

```
Riwayat_Pelayanan_2026-01-04.xlsx
```

---

## 🚀 Deployment

- **Platform**: Vercel
- **URL**: https://booking-fisioterapi-ppabib.vercel.app
- **Database**: Supabase
- **Auto Deploy**: Push to `main` branch

---

## 📝 Notes

1. **Email Confirmation**: Disabled di Supabase untuk user creation
2. **RLS**: Disabled pada `profiles` table untuk kemudahan management
3. **Password Reset**: Manual via Supabase Dashboard (admin guided)
4. **Status Kunjungan**: `pending` → `selesai` (set by Fisioterapis)

---

**Last Updated**: 2026-01-04  
**Version**: 1.0.0
