require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

// Make io accessible to routes
app.set('io', io);

app.use(cors());
app.use(express.json());

// Initialize Super Admin
const initSuperAdmin = async () => {
  const { SUPERADMIN_NAME, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD } = process.env;
  
  if (!SUPERADMIN_NAME || !SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
    console.warn('Super Admin environment variables not set. Skipping initialization.');
    return;
  }

  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(SUPERADMIN_EMAIL);
  
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, salt);
    
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    stmt.run(SUPERADMIN_NAME, SUPERADMIN_EMAIL, hashedPassword, 'superadmin');
    console.log('Super Admin successfully initialized.');
  } else {
    console.log('Super Admin already exists.');
  }
};

initSuperAdmin();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/roles', require('./routes/roles'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
