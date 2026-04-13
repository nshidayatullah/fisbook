const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
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

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      const { password, ...safe } = u;
      return safe;
    });
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', authenticateToken, requireSuperadmin, async (req, res) => {
  const { email, password, role, fullName } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role, fullName }
    });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/users/:id', authenticateToken, requireSuperadmin, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body
    });
    const { password, ...safeUser } = user;
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

// --- SLOTS ROUTES ---
app.get('/api/slots', async (req, res) => {
  try {
    const slots = await prisma.slot.findMany({
      orderBy: [{ date: 'asc' }, { hour: 'asc' }]
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/slots/generate', authenticateToken, async (req, res) => {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ACCESS CODES ROUTES ---
app.get('/api/access-codes', authenticateToken, async (req, res) => {
  try {
    const codes = await prisma.accessCode.findMany({
      include: { registration: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/access-codes/validate', async (req, res) => {
  const { code } = req.body;
  try {
    const accessCode = await prisma.accessCode.findFirst({
      where: { code, isUsed: false }
    });
    if (!accessCode) return res.status(404).json({ error: 'Invalid or used code' });
    res.json(accessCode);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

app.post('/api/access-codes/generate', authenticateToken, async (req, res) => {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/access-codes/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.accessCode.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/slots/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.slot.delete({ where: { id: req.params.id } });
    io.emit('slots_updated');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/departments', authenticateToken, async (req, res) => {
  try {
    const dept = await prisma.department.create({ data: req.body });
    res.json(dept);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/departments/:id', authenticateToken, async (req, res) => {
  try {
    const dept = await prisma.department.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(dept);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/departments/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.department.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/registrations/pending', authenticateToken, async (req, res) => {
  try {
    const regs = await prisma.registration.findMany({
      where: { statusKunjungan: 'pending' },
      include: { slot: true, department: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(regs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/registrations', async (req, res) => {
  try {
    const reg = await prisma.registration.create({
      data: req.body,
      include: { slot: true, department: true, accessCode: true }
    });
    io.emit('registration_created', reg);
    res.json(reg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/registrations/:id', async (req, res) => {
  try {
    const reg = await prisma.registration.findUnique({
      where: { id: req.params.id },
      include: { slot: true, department: true, accessCode: true }
    });
    res.json(reg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/registrations/:id/medical-record', authenticateToken, async (req, res) => {
  try {
    const reg = await prisma.registration.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        statusKunjungan: 'selesai',
        tanggalKunjungan: new Date()
      }
    });
    io.emit('registration_updated', reg);
    res.json(reg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/registrations/completed', authenticateToken, async (req, res) => {
  try {
    const regs = await prisma.registration.findMany({
      where: { statusKunjungan: 'selesai' },
      include: { slot: true, department: true },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(regs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/registrations/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.registration.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  } catch (error) {
    res.status(500).json({ error: error.message });
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
