const express = require('express');
const { db } = require('../database');
const { requireAuth } = require('./auth');

const router = express.Router();

// Get all organizations
router.get('/', (req, res) => {
  db.all('SELECT * FROM organizations ORDER BY name', [], (err, organizations) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(organizations);
  });
});

// Get organization by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM organizations WHERE id = ?', [req.params.id], (err, organization) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json(organization);
  });
});

// Create organization (admin only)
router.post('/', requireAuth, (req, res) => {
  const { name, logo_url, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.run(
    'INSERT INTO organizations (name, logo_url, description) VALUES (?, ?, ?)',
    [name, logo_url || null, description || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, name, logo_url, description });
    }
  );
});

// Update organization (admin only)
router.put('/:id', requireAuth, (req, res) => {
  const { name, logo_url, description } = req.body;

  db.run(
    'UPDATE organizations SET name = ?, logo_url = ?, description = ? WHERE id = ?',
    [name, logo_url, description, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      res.json({ success: true });
    }
  );
});

// Delete organization (admin only)
router.delete('/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM organizations WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json({ success: true });
  });
});

module.exports = router;
