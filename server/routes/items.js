const express = require('express');
const router = express.Router();
const chrono = require('chrono-node');
const db = require('../db/database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', (req, res) => {
  const { content, type, tags = [], remind_at = null } = req.body;
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Content is required' });
  }
  const itemType = type && ['task','note','reminder'].includes(type) ? type : 'note';
  const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
  let parsedRemindAt = remind_at;

  if (itemType === 'reminder') {
    const parsedDate = chrono.parseDate(content);
    if (parsedDate) {
      parsedRemindAt = parsedDate.toISOString();
    }
  }

  const stmt = db.prepare(`INSERT INTO items (type, content, tags, remind_at, user_id) VALUES (?, ?, ?, ?, ?)`);
  const info = stmt.run(itemType, content, tagsJson, parsedRemindAt, req.user.id);
  const created = db.prepare('SELECT * FROM items WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

router.get('/', (req, res) => {
  const { type, tag } = req.query;
  let query = 'SELECT * FROM items';
  const conditions = ['user_id = ?'];
  const params = [req.user.id];

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
  const enrichedItems = items.map((item) => ({
    ...item,
    is_overdue: item.type === 'reminder' && item.remind_at && item.status !== 'completed' && new Date(item.remind_at) < new Date()
  }));
  res.json(enrichedItems);
});

// Update status
router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { status, remind_at } = req.body;
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  const updates = [];
  const params = [];

  if (status) {
    const allowed = ['pending','in-progress','completed','cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    updates.push('status = ?');
    params.push(status);
  }

  if (typeof remind_at !== 'undefined') {
    updates.push('remind_at = ?');
    params.push(remind_at);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  params.push(id, req.user.id);
  const stmt = db.prepare(`UPDATE items SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`);
  const info = stmt.run(...params);
  if (info.changes === 0) return res.status(404).json({ error: 'Item not found' });
  const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  res.json(updated);
});

// Delete
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const stmt = db.prepare('DELETE FROM items WHERE id = ? AND user_id = ?');
  const info = stmt.run(id, req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Item not found' });
  res.status(204).send();
});

module.exports = router;
