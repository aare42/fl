const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Track download
router.post('/track/:caseId', (req, res) => {
  const caseId = req.params.caseId;

  db.run(
    'UPDATE cases SET download_count = download_count + 1 WHERE id = ?',
    [caseId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

// Get statistics
router.get('/', (req, res) => {
  const query = `
    SELECT
      o.id,
      o.name,
      o.logo_url,
      o.description,
      COUNT(c.id) as case_count,
      COALESCE(SUM(c.download_count), 0) as total_downloads
    FROM organizations o
    LEFT JOIN cases c ON o.id = c.organization_id
    GROUP BY o.id
    HAVING case_count > 0
    ORDER BY total_downloads DESC, case_count DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;
