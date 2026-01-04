# 📖 Panduan Penggunaan PhysioBook

Sistem Booking Fisioterapi Karyawan

---

## 🏥 Untuk Pasien/Karyawan

### Cara Daftar Fisioterapi

1. **Buka Website**

   - Akses: https://booking-fisioterapi-ppabib.vercel.app

2. **Masukkan Kode Akses**

   - Dapatkan kode akses 4 digit dari Admin
   - Ketik kode di halaman utama
   - Klik "Lanjutkan"

3. **Isi Form Pendaftaran**

   - **Slot Waktu**: Pilih tanggal dan jam yang tersedia
   - **Departemen**: Pilih layanan fisioterapi yang dibutuhkan
   - **NIK**: Masukkan nomor identitas
   - **Nama Lengkap**: Tulis nama lengkap Anda
   - **No. HP**: Masukkan nomor telepon aktif
   - **Keluhan**: Jelaskan keluhan/kondisi yang dialami

4. **Submit**
   - Klik "Daftar Sekarang"
   - Tunggu halaman sukses muncul
   - Datang sesuai jadwal yang dipilih

---

## 👨‍⚕️ Untuk Fisioterapis

### Login

1. **Buka halaman login**: https://booking-fisioterapi-ppabib.vercel.app/fisioterapis/login
2. **Masukkan**:
   - Email: (email yang didaftarkan Admin)
   - Password: (password yang diberikan)
3. **Klik "Login"**

### Melayani Pasien

1. **Dashboard**

   - Lihat daftar pasien yang menunggu
   - Klik nama pasien untuk detail

2. **Input Rekam Medis**

   - **Anamnesa**: Tulis hasil wawancara/keluhan pasien
   - **Pemeriksaan Fisik**: Catat hasil pemeriksaan fisik
   - **Tindakan Dilakukan**: Tulis tindakan yang sudah dilakukan
   - **Rencana Tindakan**: Tuliskan rencana follow-up

3. **Simpan**
   - Pastikan semua field terisi
   - Klik "Simpan Rekam Medis"
   - Status pasien otomatis berubah menjadi "Selesai"

### Riwayat Pelayanan

1. **Menu Riwayat**

   - Klik "Riwayat Pelayanan" di sidebar
   - Lihat daftar pasien yang sudah dilayani

2. **Download Excel**

   - Klik tombol "Download Excel" di header
   - File akan otomatis terunduh
   - Buka dengan Excel atau Google Sheets

3. **Hapus Riwayat** (jika perlu)
   - Klik icon trash di samping nama pasien
   - Konfirmasi penghapusan
   - Data terhapus permanent

---

## 👨‍💼 Untuk Dokter

### Login

1. **Buka halaman login**: https://booking-fisioterapi-ppabib.vercel.app/admin/login
2. **Masukkan email dan password**
3. **Klik "Login"**

### Fitur Utama

#### 1. Lihat Antrian Pasien

- **Menu**: "Antrian Pasien"
- **Tampilan**: Daftar pasien yang menunggu dilayani
- **Detail**: Klik pasien untuk lihat info lengkap
- **Status**: Read-only (tidak bisa edit)

#### 2. Lihat Riwayat Pelayanan

- **Menu**: "Riwayat Pelayanan"
- **Tampilan**: Pasien yang sudah selesai dilayani
- **Rekam Medis**: Klik untuk lihat detail rekam medis
- **Download**: Tombol "Download Excel" untuk export data

#### 3. Kelola Slot, Kode, Departemen

- Sama seperti Admin
- CRUD lengkap untuk semua data

---

## 👨‍💻 Untuk Admin

### Login

1. **Buka halaman login**: https://booking-fisioterapi-ppabib.vercel.app/admin/login
2. **Masukkan email dan password**
3. **Klik "Login"**

### Kelola Slot Waktu

1. **Menu**: "Kelola Slot"
2. **Tambah Slot Baru**:
   - Klik "Tambah Slot"
   - Pilih tanggal
   - Pilih jam
   - Tentukan kuota
   - Klik "Simpan"
3. **Edit/Hapus**: Klik icon di samping slot

### Kelola Kode Akses

1. **Menu**: "Kode Akses"
2. **Generate Kode**:
   - Klik "Generate Kode Akses"
   - Pilih slot yang tersedia
   - Pilih departemen
   - Klik "Generate"
   - **Salin kode** dan berikan ke karyawan
3. **Status**: Kode otomatis "Terpakai" setelah digunakan

### Kelola Departemen

1. **Menu**: "Departemen"
2. **Tambah Departemen**:
   - Klik "Tambah Departemen"
   - Isi nama departemen
   - Isi deskripsi (opsional)
   - Klik "Simpan"

### Lihat Pendaftaran

1. **Menu**: "Pendaftaran"
2. **Daftar**: Lihat semua registrasi
3. **Hapus**: Klik icon trash untuk hapus registrasi

### Manajemen User

1. **Menu**: "Manajemen User"

2. **Buat User Baru**:

   - Klik "Tambah User"
   - Isi form:
     - Email
     - Password (minimal 6 karakter)
     - Nama Lengkap
     - Role: Admin / Dokter / Fisioterapis
   - Klik "Buat User"

3. **Edit User**:

   - Klik icon pensil
   - Edit nama atau role
   - Klik "Simpan"

4. **Hapus User**:

   - Klik icon trash
   - Konfirmasi penghapusan

5. **Reset Password**:
   - Klik icon kunci
   - Ikuti instruksi di modal
   - Buka Supabase Dashboard
   - Reset password manual

---

## ❓ FAQ

### Q: Kode akses saya tidak bisa digunakan?

**A:** Pastikan kode 4 digit yang Anda masukkan benar. Jika masih error, hubungi Admin untuk generate kode baru.

### Q: Lupa password login?

**A:** Hubungi Admin untuk reset password Anda via Supabase Dashboard.

### Q: Bagaimana cara cek jadwal saya?

**A:** Setelah berhasil daftar, catat jadwal yang Anda pilih. Sistem belum ada fitur reminder otomatis.

### Q: Bisa reschedule jadwal?

**A:** Hubungi Admin untuk hapus registrasi lama, lalu daftar ulang dengan jadwal baru.

### Q: Data rekam medis bisa diedit?

**A:** Tidak. Setelah disimpan, rekam medis bersifat permanent. Pastikan input dengan benar.

### Q: File Excel tidak bisa dibuka?

**A:** Pastikan Anda punya aplikasi Excel, Google Sheets, atau LibreOffice. File format `.xlsx` (Excel 2007+).

---

## 📞 Kontak

Jika ada kendala, hubungi:

- **Admin**: [email/kontak admin]
- **IT Support**: [email/kontak IT]

---

## 🔐 Keamanan

- **Jangan bagikan** password Anda
- **Logout** setelah selesai menggunakan sistem
- **Jangan tinggalkan** komputer dalam keadaan login

---

**Versi**: 1.0.0  
**Last Updated**: 2026-01-04
