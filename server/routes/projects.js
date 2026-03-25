const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/projects/:id  (full detail including readme)
router.get('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

module.exports = router;
