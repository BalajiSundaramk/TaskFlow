const express = require('express');
const router = express.Router();
const chrono = require('chrono-node');
const client = require('../db/turso');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', async (req, res) => {
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

  try {
    const ins = await client.execute({
      sql: 'INSERT INTO items (type, content, tags, remind_at, user_id) VALUES (?, ?, ?, ?, ?) RETURNING *',
      args: [itemType, content, tagsJson, parsedRemindAt, req.user.id]
    });
    const created = ins && ins.rows && ins.rows[0];
    return res.status(201).json(created);
  } catch (err) {
    console.error('Create item error', err);
    return res.status(500).json({ error: 'Failed to create item' });
  }
});

router.get('/', async (req, res) => {
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

  try {
    const r = await client.execute({ sql: query, args: params });
    const items = (r && r.rows) || [];
    const enrichedItems = items.map((item) => ({
      ...item,
      is_overdue: item.type === 'reminder' && item.remind_at && item.status !== 'completed' && new Date(item.remind_at) < new Date()
    }));
    return res.json(enrichedItems);
  } catch (err) {
    console.error('Fetch items error', err);
    return res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Update status
router.patch('/:id', async (req, res) => {
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

  try {
    params.push(id, req.user.id);
    const sql = `UPDATE items SET ${updates.join(', ')} WHERE id = ? AND user_id = ? RETURNING *`;
    const r = await client.execute({ sql, args: params });
    const updated = r && r.rows && r.rows[0];
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    return res.json(updated);
  } catch (err) {
    console.error('Update item error', err);
    return res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  try {
    const r = await client.execute({ sql: 'DELETE FROM items WHERE id = ? AND user_id = ? RETURNING id', args: [id, req.user.id] });
    const deleted = r && r.rows && r.rows[0];
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    return res.status(204).send();
  } catch (err) {
    console.error('Delete item error', err);
    return res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
