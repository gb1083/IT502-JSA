const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname)); // ✅ Serve static files like HTML/CSS/JS from your folder

require('dotenv').config();

const connection = mysql.createConnection(process.env.MYSQL_URL);

connection.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to Railway MySQL!");
});


db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// 🔥 Corrected Member Sign-Up Handling
app.post('/member-signup', (req, res) => { // ✅ match frontend route
  const { name, email, message } = req.body;  // ✅ match database column

  const query = 'INSERT INTO members (name, email, message) VALUES (?, ?, ?)';
  db.query(query, [name, email, message], (err, result) => {
    if (err) {
      console.error('Error during membership registration:', err);
      return res.status(500).send('Error during registration');
    }
    res.json({ message: 'Membership successfully registered' });
  });
});

// Endpoint to get all members (for E-board view)
app.get('/members', verifyToken, (req, res) => {
  const query = 'SELECT * FROM members';
  db.query(query, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});


// Eboard Sign Up
app.post('/signup', (req, res) => {
  const { username, email, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  const query = 'INSERT INTO eboard_members (username, email, password_hash, role) VALUES (?, ?, ?, ?)';
  db.query(query, [username, email, hashedPassword, role], (err, result) => {
    if (err) {
      res.status(500).send('Error in registration');
    } else {
      res.json({ message: 'You are successfully signed up.' });
    }
  });
});

// Eboard Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM eboard_members WHERE username = ?';
  db.query(query, [username], (err, result) => {
    if (err) throw err;

    if (result.length > 0 && bcrypt.compareSync(password, result[0].password_hash)) {
      const token = jwt.sign({ id: result[0].id, role: result[0].role }, 'secret_key', { expiresIn: '1h' });
      res.json({ message: 'Logged in successfully', token });
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
    }
  });
});

// Get all events (public)
app.get('/events', (req, res) => {
  db.query('SELECT * FROM events', (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Create a new event (admin only)
app.post('/events', verifyToken, (req, res) => {
  const { event_name, event_date, event_location, event_description } = req.body;

  const query = 'INSERT INTO events (event_name, event_date, event_location, event_description) VALUES (?, ?, ?, ?)';
  db.query(query, [event_name, event_date, event_location, event_description], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to save event' });
    }
    res.json({ message: 'Event saved successfully!' });
  });
});

// Delete event by ID
app.delete('/events/:id', verifyToken, (req, res) => {
  const eventId = req.params.id;

  const query = 'DELETE FROM events WHERE id = ?';
  db.query(query, [eventId], (err, result) => {
    if (err) {
      console.error('Error deleting event:', err);
      return res.status(500).json({ message: 'Failed to delete event' });
    }
    res.json({ message: 'Event deleted successfully' });
  });
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send('Token required');
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).send('Invalid token');
    }
    req.user = decoded;
    next();
  });
}

// Delete a member by ID (E-board only)
app.delete('/members/:id', verifyToken, (req, res) => {
  const memberId = req.params.id;

  const query = 'DELETE FROM members WHERE id = ?';
  db.query(query, [memberId], (err, result) => {
    if (err) {
      console.error('Error deleting member:', err);
      return res.status(500).json({ message: 'Failed to delete member' });
    }
    res.json({ message: 'Member deleted successfully' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
