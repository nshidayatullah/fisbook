const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// --- SECURITY MIDDLEWARES ---
app.use(helmet({
  contentSecurityPolicy: false, // Disable for easier Socket.io/Client integration or customize if needed
  crossOriginEmbedderPolicy: false
}));

const allowedOrigins = [
  'https://fisioterapi.klinikppabib.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// --- RATE LIMITERS ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per window
  message: { error: 'Terlalu banyak percobaan login, silakan coba lagi setelah 15 menit' },
  standardHeaders: true,
  legacyHeaders: false,
});

const codeValidateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 code validation attempts per window
  message: { error: 'Terlalu banyak percobaan kode akses, silakan coba lagi setelah 5 menit' },
  standardHeaders: true,
  legacyHeaders: false,
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')));

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

const requireSuperadmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Require superadmin role' });
  }
  next();
};

const requireRoles = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Required roles: ${roles.join(', ')}` });
  }
  next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Email atau password salah' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Email atau password salah' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } });
  } catch {
    res.status(500).json({ error: 'Terjadi kesalahan server internal' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, fullName: true, createdAt: true }
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Terjadi kesalahan server internal' });
  }
});

// --- USER MANAGEMENT ---
app.get('/api/users', authenticateToken, requireSuperadmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    // Remove passwords before sending
    const safeUsers = users.map(u => {
      const safe = { ...u };
      delete safe.password;
      return safe;
    });
    res.json(safeUsers);
  } catch {
    res.status(500).json({ error: 'Gagal mengambil daftar pengguna' });
  }
});

app.post('/api/users', authenticateToken, requireSuperadmin, async (req, res) => {
  const { email, password, role, fullName, sipNumber } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role, fullName, sipNumber }
    });
    const safeUser = { ...user };
    delete safeUser.password;
    res.json(safeUser);
  } catch {
    res.status(500).json({ error: 'Gagal membuat pengguna baru' });
  }
});

app.patch('/api/users/:id', authenticateToken, requireSuperadmin, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body
    });
    const safeUser = { ...user };
    delete safeUser.password;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', authenticateToken, requireSuperadmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:id/reset-password', authenticateToken, requireSuperadmin, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password is required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashedPassword }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SLOTS ROUTES ---
app.get('/api/slots', async (req, res) => {
  try {
    const slots = await prisma.slot.findMany({
      orderBy: [{ date: 'asc' }, { hour: 'asc' }]
    });
    res.json(slots);
  } catch {
    res.status(500).json({ error: 'Gagal mengambil jadwal tersedia' });
  }
});

app.post('/api/slots/generate', authenticateToken, requireRoles(['superadmin', 'paramedic']), async (req, res) => {
  const { date, hours } = req.body;
  try {
    const slots = await Promise.all(hours.map(hour => 
      prisma.slot.upsert({
        where: { date_hour: { date, hour } },
        update: { isBooked: false },
        create: { date, hour, isBooked: false }
      })
    ));
    io.emit('slots_updated');
    res.json(slots);
  } catch {
    res.status(500).json({ error: 'Gagal membuat jadwal' });
  }
});

app.patch('/api/slots/:id/book', async (req, res) => {
  try {
    const slot = await prisma.slot.update({
      where: { id: req.params.id },
      data: { isBooked: true }
    });
    io.emit('slots_updated');
    res.json(slot);
  } catch {
    res.status(500).json({ error: 'Gagal memesan jadwal' });
  }
});

// --- ACCESS CODES ROUTES ---
app.get('/api/access-codes', authenticateToken, requireRoles(['superadmin', 'paramedic', 'dokter']), async (req, res) => {
  try {
    const codes = await prisma.accessCode.findMany({
      include: { registration: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(codes);
  } catch {
    res.status(500).json({ error: 'Gagal mengambil daftar kode' });
  }
});

app.post('/api/access-codes/validate', codeValidateLimiter, async (req, res) => {
  const { code } = req.body;
  try {
    const accessCode = await prisma.accessCode.findFirst({
      where: { code, isUsed: false }
    });
    if (!accessCode) return res.status(404).json({ error: 'Kode tidak valid atau sudah digunakan' });
    res.json(accessCode);
  } catch {
    res.status(500).json({ error: 'Terjadi kesalahan server internal' });
  }
});

app.patch('/api/access-codes/:id/use', async (req, res) => {
  try {
    const code = await prisma.accessCode.update({
      where: { id: req.params.id },
      data: { isUsed: true }
    });
    res.json(code);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/access-codes/generate', authenticateToken, requireRoles(['superadmin', 'paramedic']), async (req, res) => {
  const { count = 10 } = req.body;
  try {
    const newCodes = [];
    for (let i = 0; i < count; i++) {
      // Generate 4 digit number (1000-9999)
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      newCodes.push({ code });
    }
    await prisma.accessCode.createMany({ data: newCodes });
    res.json({ success: true, count: newCodes.length });
  } catch {
    res.status(500).json({ error: 'Gagal membuat kode akses' });
  }
});

app.delete('/api/access-codes/:id', authenticateToken, requireRoles(['superadmin', 'paramedic']), async (req, res) => {
  try {
    const codeId = req.params.id;
    // Check if code exists and is used
    const existingCode = await prisma.accessCode.findUnique({
      where: { id: codeId },
      include: { registration: true }
    });

    if (existingCode && existingCode.isUsed) {
      if (req.user.role !== 'superadmin') {
         return res.status(403).json({ error: "Hanya superadmin yang dapat menghapus kode yang terpakai" });
      }
      
      // Cascade delete the associated registration if it exists
      if (existingCode.registration) {
         await prisma.registration.delete({
           where: { id: existingCode.registration.id }
         });
      }
    }

    await prisma.accessCode.delete({ where: { id: codeId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus kode akses' });
  }
});

app.delete('/api/slots/:id', authenticateToken, requireRoles(['superadmin', 'paramedic']), async (req, res) => {
  try {
    await prisma.slot.delete({ where: { id: req.params.id } });
    io.emit('slots_updated');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus jadwal' });
  }
});

// --- DEPARTMENTS ROUTES ---
app.get('/api/departments', async (req, res) => {
  try {
    const depts = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(depts);
  } catch {
    res.status(500).json({ error: 'Gagal mengambil daftar departemen' });
  }
});

app.post('/api/departments', authenticateToken, requireSuperadmin, async (req, res) => {
  const { name, isActive } = req.body;
  try {
    const dept = await prisma.department.create({ 
      data: { name, isActive } 
    });
    res.json(dept);
  } catch {
    res.status(500).json({ error: 'Gagal membuat departemen' });
  }
});

app.patch('/api/departments/:id', authenticateToken, requireSuperadmin, async (req, res) => {
  const { name, isActive } = req.body;
  try {
    const dept = await prisma.department.update({
      where: { id: req.params.id },
      data: { name, isActive }
    });
    res.json(dept);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui departemen' });
  }
});

app.delete('/api/departments/:id', authenticateToken, requireSuperadmin, async (req, res) => {
  try {
    await prisma.department.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus departemen' });
  }
});

// --- REGISTRATIONS ROUTES ---
app.get('/api/registrations', authenticateToken, async (req, res) => {
  try {
    const regs = await prisma.registration.findMany({
      include: { slot: true, department: true, accessCode: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(regs);
  } catch {
    res.status(500).json({ error: 'Terjadi kesalahan server internal' });
  }
});

app.get('/api/registrations/pending', authenticateToken, requireRoles(['superadmin', 'dokter', 'paramedic', 'fisioterapis']), async (req, res) => {
  try {
    const regs = await prisma.registration.findMany({
      where: { statusKunjungan: 'pending' },
      include: { slot: true, department: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(regs);
  } catch {
    res.status(500).json({ error: 'Terjadi kesalahan server internal' });
  }
});

app.post('/api/registrations', async (req, res) => {
  const { namaLengkap, nik, noHp, keluhan, slotId, departmentId, accessCodeId } = req.body;
  
  try {
    // Perform database operations in a transaction to ensure atomicity
    const reg = await prisma.$transaction(async (tx) => {
      // 1. Validate Access Code
      const code = await tx.accessCode.findUnique({
        where: { id: accessCodeId }
      });
      if (!code || code.isUsed) throw new Error('KODE_INVALID');

      // 2. Validate Slot
      const slot = await tx.slot.findUnique({
        where: { id: slotId }
      });
      if (!slot || slot.isBooked) throw new Error('SLOT_INVALID');

      // 3. Create Registration
      const newReg = await tx.registration.create({
        data: {
          namaLengkap,
          nik,
          noHp,
          keluhan,
          slotId,
          departmentId,
          accessCodeId
        },
        include: { slot: true, department: true, accessCode: true }
      });

      // 4. Update Statuses
      await tx.accessCode.update({
        where: { id: accessCodeId },
        data: { isUsed: true }
      });

      await tx.slot.update({
        where: { id: slotId },
        data: { isBooked: true }
      });

      return newReg;
    });

    io.emit('registration_created', reg);
    io.emit('slots_updated'); // Notify all clients that a slot was taken
    res.json(reg);
  } catch (error) {
    if (error.message === 'KODE_INVALID') {
      return res.status(400).json({ error: 'Kode akses tidak valid atau sudah digunakan' });
    }
    if (error.message === 'SLOT_INVALID') {
      return res.status(400).json({ error: 'Jadwal yang dipilih sudah penuh atau tidak tersedia' });
    }
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses pendaftaran' });
  }
});

app.get('/api/registrations/completed', authenticateToken, requireRoles(['superadmin', 'dokter', 'fisioterapis']), async (req, res) => {
  try {
    const regs = await prisma.registration.findMany({
      where: { statusKunjungan: 'selesai' },
      include: { slot: true, department: true, accessCode: true },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(regs);
  } catch {
    res.status(500).json({ error: 'Terjadi kesalahan server internal' });
  }
});

app.get('/api/registrations/:id', authenticateToken, requireRoles(['superadmin', 'dokter', 'paramedic', 'fisioterapis']), async (req, res) => {
  try {
    const reg = await prisma.registration.findUnique({
      where: { id: req.params.id },
      include: { slot: true, department: true, accessCode: true }
    });
    if (!reg) return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan' });
    res.json(reg);
  } catch {
    res.status(500).json({ error: 'Terjadi kesalahan server internal' });
  }
});

app.patch('/api/registrations/:id/medical-record', authenticateToken, requireRoles(['superadmin', 'dokter', 'fisioterapis']), async (req, res) => {
  const { anamnesa, pemeriksaanFisik, tindakanDilakukan, rencanaTindakan } = req.body;
  try {
    const reg = await prisma.registration.update({
      where: { id: req.params.id },
      data: {
        anamnesa,
        pemeriksaanFisik,
        tindakanDilakukan,
        rencanaTindakan,
        statusKunjungan: 'selesai',
        tanggalKunjungan: new Date()
      }
    });
    io.emit('registration_updated', reg);
    res.json(reg);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui rekam medis' });
  }
});

app.delete('/api/registrations/:id', authenticateToken, async (req, res) => {
  try {
    // 1. Fetch registration first to know which code & slot to reset
    const registration = await prisma.registration.findUnique({
      where: { id: req.params.id },
      select: { accessCodeId: true, slotId: true },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
    }

    // 2. Delete registration + reset code + free slot atomically
    const ops = [
      prisma.registration.delete({ where: { id: req.params.id } }),
    ];

    if (registration.accessCodeId) {
      ops.push(
        prisma.accessCode.update({
          where: { id: registration.accessCodeId },
          data: { isUsed: false },
        })
      );
    }

    if (registration.slotId) {
      ops.push(
        prisma.slot.update({
          where: { id: registration.slotId },
          data: { isBooked: false },
        })
      );
    }

    await prisma.$transaction(ops);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus pendaftaran' });
  }
});

// --- WHATSAPP MESSAGES ROUTES ---
app.get('/api/whatsapp-messages', authenticateToken, async (req, res) => {
  try {
    const messages = await prisma.whatsAppMessage.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Gagal mengambil template pesan' });
  }
});

app.get('/api/whatsapp-messages/:name', authenticateToken, async (req, res) => {
  try {
    const message = await prisma.whatsAppMessage.findUnique({
      where: { name: req.params.name }
    });
    if (!message) return res.status(404).json({ error: 'Template pesan tidak ditemukan' });
    res.json(message);
  } catch {
    res.status(500).json({ error: 'Gagal mengambil data template' });
  }
});

app.patch('/api/whatsapp-messages/:id', authenticateToken, requireRoles(['superadmin']), async (req, res) => {
  const { content } = req.body;
  try {
    const message = await prisma.whatsAppMessage.update({
      where: { id: req.params.id },
      data: { content }
    });
    res.json(message);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui template' });
  }
});

app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const [registrations, slots, codes, departments] = await Promise.all([
      prisma.registration.count(),
      prisma.slot.count({ where: { isBooked: false } }),
      prisma.accessCode.count({ where: { isUsed: false } }),
      prisma.department.count({ where: { isActive: true } })
    ]);
    res.json({
      total_registrations: registrations,
      available_slots: slots,
      available_codes: codes,
      total_departments: departments
    });
  } catch {
    res.status(500).json({ error: 'Gagal mengambil statistik dashboard' });
  }
});

// --- FALLBACK TO REACT ---
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// --- SOCKET CONNECTION ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
