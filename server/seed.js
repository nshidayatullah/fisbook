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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
