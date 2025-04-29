const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;  // ✅ Uses Render's assigned port

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname)); 

// ✅ Create a Pool to Prevent Dropped Connections
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,  // ✅ Added port for external access
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000  // ✅ Increased timeout to 20 seconds
});

// ✅ Log Database Connection Status
connection.getConnection((err, conn) => {
  if (err) {
    console.error("🚨 Database connection failed:", err);
  } else {
    console.log("✅ Connected to Railway MySQL!");
    conn.release();
  }
});

// 🔥 Member Sign-Up
app.post('/member-signup', (req, res) => { 
  const { name, email, message } = req.body;

  const query = 'INSERT INTO members (name, email, message) VALUES (?, ?, ?)';
  connection.query(query, [name, email, message], (err, result) => {
    if (err) {
      console.error('🚨 Registration error:', err);
      return res.status(500).send('Error during registration');
    }
    res.json({ message: '✅ Membership successfully registered' });
  });
});

// 🔥 Eboard Sign-Up
app.post('/signup', (req, res) => {
  const { username, email, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  const query = 'INSERT INTO eboard_members (username, email, password_hash, role) VALUES (?, ?, ?, ?)';
  connection.query(query, [username, email, hashedPassword, role], (err, result) => {
    if (err) {
      console.error('🚨 Signup error:', err);
      return res.status(500).send('Error in registration');
    }
    res.json({ message: '✅ You are successfully signed up.' });
  });
});

// 🔥 Eboard Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM eboard_members WHERE username = ?';

  connection.query(query, [username], (err, result) => {
    if (err) {
      console.error('🚨 Login error:', err);
      return res.status(500).send('Database error');
    }

    if (result.length > 0 && bcrypt.compareSync(password, result[0].password_hash)) {
      const token = jwt.sign({ id: result[0].id, role: result[0].role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: '✅ Logged in successfully', token });
    } else {
      res.status(401).send({ message: '❌ Invalid credentials' });
    }
  });
});

// 🔥 Get all members (E-board view)
app.get('/members', verifyToken, (req, res) => {
  connection.query('SELECT * FROM members', (err, result) => {
    if (err) {
      console.error('🚨 Fetching members error:', err);
      return res.status(500).send('Database error');
    }
    res.json(result);
  });
});

// 🔥 Get all events (public)
app.get('/events', (req, res) => {
  connection.query('SELECT * FROM events', (err, result) => {
    if (err) {
      console.error('🚨 Fetching events error:', err);
      return res.status(500).send('Database error');
    }
    res.json(result);
  });
});

// 🔥 Create a new event (admin only)
app.post('/events', verifyToken, (req, res) => {
  const { event_name, event_date, event_location, event_description } = req.body;

  const query = 'INSERT INTO events (event_name, event_date, event_location, event_description) VALUES (?, ?, ?, ?)';
  connection.query(query, [event_name, event_date, event_location, event_description], (err, result) => {
    if (err) {
      console.error('🚨 Event creation error:', err);
      return res.status(500).json({ message: 'Failed to save event' });
    }
    res.json({ message: '✅ Event saved successfully!' });
  });
});

// 🔥 Delete event by ID
app.delete('/events/:id', verifyToken, (req, res) => {
  const eventId = req.params.id;

  const query = 'DELETE FROM events WHERE id = ?';
  connection.query(query, [eventId], (err, result) => {
    if (err) {
      console.error('🚨 Event deletion error:', err);
      return res.status(500).json({ message: 'Failed to delete event' });
    }
    res.json({ message: '✅ Event deleted successfully' });
  });
});

// 🔥 Delete a member by ID (E-board only)
app.delete('/members/:id', verifyToken, (req, res) => {
  const memberId = req.params.id;

  const query = 'DELETE FROM members WHERE id = ?';
  connection.query(query, [memberId], (err, result) => {
    if (err) {
      console.error('🚨 Member deletion error:', err);
      return res.status(500).json({ message: 'Failed to delete member' });
    }
    res.json({ message: '✅ Member deleted successfully' });
  });
});

// 🔥 Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send('❌ Token required');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send('❌ Invalid token');
    }
    req.user = decoded;
    next();
  });
}

// 🚀 Start the Server
app.listen(port, () => {
  console.log(`✅ Server running at PORT ${port}`);
});
