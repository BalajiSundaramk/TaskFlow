const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Create item
router.post('/', (req, res) => {
  const { content, type, tags = [], remind_at = null } = req.body;
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Content is required' });
  }
  const itemType = type && ['task','note','reminder'].includes(type) ? type : 'note';
  const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);

  const stmt = db.prepare(`INSERT INTO items (type, content, tags, remind_at) VALUES (?, ?, ?, ?)`);
  const info = stmt.run(itemType, content, tagsJson, remind_at);
  const created = db.prepare('SELECT * FROM items WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// Get all items with optional filters
router.get('/', (req, res) => {
  const { type, tag } = req.query;
  let query = 'SELECT * FROM items';
  const conditions = [];
  const params = [];

  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }

  if (tag) {
    conditions.push("tags LIKE ?");
    params.push(`%"${tag}"%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  const items = db.prepare(query).all(...params);
  res.json(items);
});

// Update status
router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const allowed = ['pending','completed','cancelled'];
  if (!status || !allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const stmt = db.prepare('UPDATE items SET status = ? WHERE id = ?');
  const info = stmt.run(status, id);
  if (info.changes === 0) return res.status(404).json({ error: 'Item not found' });
  const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  res.json(updated);
});

// Delete
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const stmt = db.prepare('DELETE FROM items WHERE id = ?');
  const info = stmt.run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Item not found' });
  res.status(204).send();
});

module.exports = router;
