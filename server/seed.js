const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const superadminPassword = await bcrypt.hash('password', 10);
  
  const superadmin = await prisma.user.upsert({
    where: { email: 'dayat.bbm1@gmail.com' },
    update: {},
    create: {
      email: 'dayat.bbm1@gmail.com',
      password: superadminPassword,
      role: 'superadmin',
      fullName: 'Dayat Superadmin',
    },
  });

  const paramedic = await prisma.user.upsert({
    where: { email: 'paramedic@fisbook.com' },
    update: {},
    create: {
      email: 'paramedic@fisbook.com',
      password: adminPassword,
      role: 'paramedic',
      fullName: 'Paramedic User',
    },
  });

  const dokter = await prisma.user.upsert({
    where: { email: 'haamim.sajdah@gmail.com' },
    update: {},
    create: {
      email: 'haamim.sajdah@gmail.com',
      password: adminPassword,
      role: 'dokter',
      fullName: "Haamim Sajdah Sya'ban",
    },
  });

  const fisioterapis = await prisma.user.upsert({
    where: { email: 'fisioterapis@gmail.com' },
    update: {},
    create: {
      email: 'fisioterapis@gmail.com',
      password: adminPassword,
      role: 'fisioterapis',
      fullName: 'Fisioterapis',
    },
  });

  console.log('Seeded users:', superadmin.email, paramedic.email, dokter.email, fisioterapis.email);

  // Seed some departments
  const departments = [
    'HCGA',
    'SHE',
    'COE',
    'Produksi',
    'Plan',
    'FA & LOG',
    'Engineering',
    'AKAPI'
  ];
  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name, isActive: true },
    });
  }

  console.log('Seeded departments');

  // Seed WhatsApp Messages
  const waTemplate = `*📢 PANDUAN PENDAFTARAN LAYANAN FISIOTERAPI (PhysioBook)*

Halo Rekan-rekan Karyawan,

Untuk mendapatkan layanan fisioterapi, harap ikuti langkah-langkah pendaftaran melalui aplikasi *PhysioBook* berikut ini:

*1. Akses Halaman Pendaftaran*
Aplikasi ini dikhususkan bagi karyawan. Silakan buka tautan berikut di browser HP/Komputer Anda:
🔗 https://fisioterapi.klinikppabib.com

*2. Masukkan Kode Akses*
Masukkan kode 4-digit unik berikut:
🔑 *KODE AKSES:* [CODE]
_Catatan: Jika kode kadaluwarsa, silakan hubungi tim Admin._

*3. Isi Data Diri*
- Pilih Departemen Anda
- Isi Nama Lengkap, NIK, dan Nomor WhatsApp aktif
- Tuliskan Keluhan Utama (Contoh: "Sakit pinggang bawah")

*4. Pilih Jadwal (Slot Waktu)*
Klik kartu jam yang berwarna *Hijau* (Tersedia). Jam yang berwarna merah atau tidak muncul berarti sudah dipesan oleh karyawan lain.

*5. Konfirmasi Pendaftaran*
Klik tombol "Daftar Sekarang". Jika berhasil, Anda akan melihat halaman "Pendaftaran Berhasil".

*6. Proses Kedatangan*
- Datanglah ke ruang fisioterapi *10 menit sebelum* waktu yang dipilih.
- Fisioterapis akan memanggil sesuai urutan jam di sistem.
- Harap datang tepat waktu agar tidak mengganggu antrian berikutnya.

💡 *Tips:* Daftarlah segera setelah menerima kode ini karena slot per hari sangat terbatas.

Salam Sehat,
*Tim Fisioterapi PhysioBook*`;

  await prisma.whatsAppMessage.upsert({
    where: { name: 'pendaftaran' },
    update: { content: waTemplate },
    create: {
      name: 'pendaftaran',
      content: waTemplate
    }
  });

  console.log('Seeded WhatsApp messages');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
