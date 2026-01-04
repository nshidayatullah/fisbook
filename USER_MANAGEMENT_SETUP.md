# Setup Instructions untuk User Management

## Langkah-langkah Setup Supabase:

### 1. **Disable Email Confirmation** (PENTING!)

Agar admin bisa langsung membuat user tanpa perlu email confirmation:

1. Buka **Supabase Dashboard**
2. Pilih project Anda
3. Klik **Authentication** → **Settings**
4. Di bagian **Email Auth**, hilangkan centang pada:
   - ✅ **"Enable email confirmations"**
5. Klik **Save**

### 2. **Jalankan Migration SQL**

Jalankan SQL berikut di **SQL Editor** secara berurutan:

#### A. Migration 001 (Jika belum dijalankan):

```sql
-- Copy paste isi file: migrations/001_add_fisioterapis_role.sql
```

#### B. Migration 002 (WAJIB untuk User Management):

```sql
-- Copy paste isi file: migrations/002_fix_user_creation_trigger.sql
```

### 3. **Test Create User**

Setelah setup di atas selesai:

1. Login sebagai Admin
2. Buka menu **"Manajemen User"**
3. Klik **"Tambah User Baru"**
4. Isi form:
   - Email: `test@example.com`
   - Password: `password123`
   - Nama Lengkap: `Test User`
   - Role: `Fisioterapis`
5. Klik **"Buat User"**

User baru seharusnya langsung bisa login tanpa perlu confirm email!

---

## Troubleshooting

### Problem: "User created but can't login"

**Solution:** Email confirmation masih aktif. Disable di Authentication Settings.

### Problem: "Profile not created"

**Solution:** Jalankan migration 002 untuk update trigger.

### Problem: "Permission denied"

**Solution:** Pastikan RLS policies sudah dijalankan dari migration.

---

## Alternative: Manual User Creation

Jika create user via UI masih bermasalah, buat user manual:

1. **Buat di Authentication:**

   - Dashboard → Authentication → Users → Add user
   - Isi email & password
   - Disable "Send email confirmation"

2. **Update Profile:**

   ```sql
   UPDATE profiles
   SET role = 'fisioterapis', full_name = 'Nama Fisioterapis'
   WHERE email = 'user@example.com';
   ```

3. User siap login!
