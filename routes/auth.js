const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../database');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, admin.password_hash, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Authentication error' });
      }

      if (result) {
        req.session.adminId = admin.id;
        req.session.username = admin.username;
        res.json({ success: true, username: admin.username });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.session.adminId) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

// Middleware to protect routes
const requireAuth = (req, res, next) => {
  if (req.session.adminId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = router;
module.exports.requireAuth = requireAuth;
