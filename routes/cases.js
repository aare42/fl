const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database');
const { requireAuth } = require('./auth');

const router = express.Router();

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.tex'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TEX files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all cases with filters
router.get('/', (req, res) => {
  const { search, tags } = req.query;

  let query = `
    SELECT
      c.*,
      o.name as organization_name,
      GROUP_CONCAT(t.name) as tags
    FROM cases c
    LEFT JOIN organizations o ON c.organization_id = o.id
    LEFT JOIN case_tags ct ON c.id = ct.case_id
    LEFT JOIN tags t ON ct.tag_id = t.id
  `;

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(c.name LIKE ? OR c.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (tags) {
    const tagList = tags.split(',').map(t => t.trim());
    conditions.push(`c.id IN (
      SELECT case_id FROM case_tags
      JOIN tags ON case_tags.tag_id = tags.id
      WHERE tags.name IN (${tagList.map(() => '?').join(',')})
    )`);
    params.push(...tagList);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' GROUP BY c.id ORDER BY c.created_at DESC';

  db.all(query, params, (err, cases) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Parse tags from comma-separated string to array
    const formattedCases = cases.map(c => ({
      ...c,
      tags: c.tags ? c.tags.split(',') : []
    }));

    res.json(formattedCases);
  });
});

// Get all tags
router.get('/meta/tags', (req, res) => {
  db.all('SELECT * FROM tags ORDER BY name', [], (err, tags) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(tags);
  });
});

// Get single case
router.get('/:id', (req, res) => {
  const query = `
    SELECT
      c.*,
      o.name as organization_name,
      o.logo_url as organization_logo,
      GROUP_CONCAT(t.name) as tags
    FROM cases c
    LEFT JOIN organizations o ON c.organization_id = o.id
    LEFT JOIN case_tags ct ON c.id = ct.case_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    WHERE c.id = ?
    GROUP BY c.id
  `;

  db.get(query, [req.params.id], (err, caseData) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    caseData.tags = caseData.tags ? caseData.tags.split(',') : [];
    res.json(caseData);
  });
});

// Create case (admin only)
router.post('/', requireAuth, upload.single('file'), (req, res) => {
  const { name, description, organization_id, tags } = req.body;

  if (!name || !req.file) {
    return res.status(400).json({ error: 'Name and file are required' });
  }

  const file_path = req.file.path;
  const file_type = path.extname(req.file.originalname).toLowerCase();

  db.run(
    'INSERT INTO cases (name, description, file_path, file_type, organization_id) VALUES (?, ?, ?, ?, ?)',
    [name, description || null, file_path, file_type, organization_id || null],
    function(err) {
      if (err) {
        // Clean up uploaded file
        fs.unlinkSync(file_path);
        return res.status(500).json({ error: 'Database error' });
      }

      const caseId = this.lastID;

      // Add tags
      if (tags) {
        const tagList = JSON.parse(tags);
        addTagsToCase(caseId, tagList, (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error adding tags' });
          }
          res.json({ id: caseId, name, description, file_path, file_type, organization_id, tags: tagList });
        });
      } else {
        res.json({ id: caseId, name, description, file_path, file_type, organization_id });
      }
    }
  );
});

// Update case (admin only)
router.put('/:id', requireAuth, upload.single('file'), (req, res) => {
  const { name, description, organization_id, tags } = req.body;
  const caseId = req.params.id;

  // Get existing case
  db.get('SELECT * FROM cases WHERE id = ?', [caseId], (err, existingCase) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!existingCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    let file_path = existingCase.file_path;
    let file_type = existingCase.file_type;

    // If new file uploaded, delete old and use new
    if (req.file) {
      if (fs.existsSync(existingCase.file_path)) {
        fs.unlinkSync(existingCase.file_path);
      }
      file_path = req.file.path;
      file_type = path.extname(req.file.originalname).toLowerCase();
    }

    db.run(
      'UPDATE cases SET name = ?, description = ?, file_path = ?, file_type = ?, organization_id = ? WHERE id = ?',
      [name, description, file_path, file_type, organization_id || null, caseId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Update tags
        if (tags) {
          const tagList = JSON.parse(tags);
          // Remove existing tags
          db.run('DELETE FROM case_tags WHERE case_id = ?', [caseId], (err) => {
            if (err) {
              return res.status(500).json({ error: 'Error updating tags' });
            }
            // Add new tags
            addTagsToCase(caseId, tagList, (err) => {
              if (err) {
                return res.status(500).json({ error: 'Error adding tags' });
              }
              res.json({ success: true });
            });
          });
        } else {
          res.json({ success: true });
        }
      }
    );
  });
});

// Delete case (admin only)
router.delete('/:id', requireAuth, (req, res) => {
  db.get('SELECT file_path FROM cases WHERE id = ?', [req.params.id], (err, caseData) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Delete file
    if (fs.existsSync(caseData.file_path)) {
      fs.unlinkSync(caseData.file_path);
    }

    // Delete case (cascade will delete case_tags)
    db.run('DELETE FROM cases WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    });
  });
});

// Helper function to add tags to a case
function addTagsToCase(caseId, tagNames, callback) {
  if (!tagNames || tagNames.length === 0) {
    return callback(null);
  }

  let processed = 0;
  const errors = [];

  tagNames.forEach(tagName => {
    // Insert tag if doesn't exist
    db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName], function(err) {
      if (err) {
        errors.push(err);
        processed++;
        if (processed === tagNames.length) {
          callback(errors.length > 0 ? errors[0] : null);
        }
        return;
      }

      // Get tag ID
      db.get('SELECT id FROM tags WHERE name = ?', [tagName], (err, tag) => {
        if (err) {
          errors.push(err);
          processed++;
          if (processed === tagNames.length) {
            callback(errors.length > 0 ? errors[0] : null);
          }
          return;
        }

        // Link tag to case
        db.run('INSERT INTO case_tags (case_id, tag_id) VALUES (?, ?)', [caseId, tag.id], (err) => {
          if (err) errors.push(err);
          processed++;
          if (processed === tagNames.length) {
            callback(errors.length > 0 ? errors[0] : null);
          }
        });
      });
    });
  });
}

module.exports = router;
