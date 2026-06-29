const express = require('express');
const client = require('../db/turso');
const authenticateToken = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get('/users', authenticateToken, adminAuth, async (req, res) => {
  try {
    const r = await client.execute({ sql: 'SELECT id, name, email, password_hash, is_admin, status, created_at, last_login FROM users ORDER BY created_at DESC' });
    const users = (r && r.rows) || [];
    return res.json(users);
  } catch (err) {
    console.error('Fetch users error', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/users/:id/status', authenticateToken, adminAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const sel = await client.execute({ sql: 'SELECT id, is_admin FROM users WHERE id = ?', args: [id] });
    const user = sel && sel.rows && sel.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.is_admin === 1) return res.status(400).json({ error: 'Cannot modify admin account' });

    await client.execute({ sql: 'UPDATE users SET status = ? WHERE id = ?', args: [status, id] });
    const updatedRes = await client.execute({ sql: 'SELECT id, name, email, password_hash, is_admin, status, created_at, last_login FROM users WHERE id = ?', args: [id] });
    const updated = updatedRes && updatedRes.rows && updatedRes.rows[0];
    return res.json(updated);
  } catch (err) {
    console.error('Update user status error', err);
    return res.status(500).json({ error: 'Failed to update user status' });
  }
});

router.delete('/users/:id', authenticateToken, adminAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const sel = await client.execute({ sql: 'SELECT id, is_admin FROM users WHERE id = ?', args: [id] });
    const user = sel && sel.rows && sel.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.is_admin === 1) return res.status(400).json({ error: 'Cannot delete admin account' });

    await client.execute({ sql: 'DELETE FROM items WHERE user_id = ?', args: [id] });
    await client.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [id] });
    return res.json({ success: true, message: 'User and all their data deleted' });
  } catch (err) {
    console.error('Delete user error', err);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.get('/stats', authenticateToken, adminAuth, async (req, res) => {
  try {
    const t1 = await client.execute({ sql: 'SELECT COUNT(*) AS count FROM users' });
    const totalUsers = (t1 && t1.rows && t1.rows[0] && t1.rows[0].count) || 0;
    const t2 = await client.execute({ sql: "SELECT COUNT(*) AS count FROM users WHERE status = 'active'" });
    const activeUsers = (t2 && t2.rows && t2.rows[0] && t2.rows[0].count) || 0;
    const t3 = await client.execute({ sql: "SELECT COUNT(*) AS count FROM users WHERE status = 'suspended'" });
    const suspendedUsers = (t3 && t3.rows && t3.rows[0] && t3.rows[0].count) || 0;
    const t4 = await client.execute({ sql: 'SELECT COUNT(*) AS count FROM items' });
    const totalItems = (t4 && t4.rows && t4.rows[0] && t4.rows[0].count) || 0;
    const t5 = await client.execute({ sql: "SELECT COUNT(*) AS count FROM items WHERE type = 'task'" });
    const totalTasks = (t5 && t5.rows && t5.rows[0] && t5.rows[0].count) || 0;
    const t6 = await client.execute({ sql: "SELECT COUNT(*) AS count FROM items WHERE type = 'note'" });
    const totalNotes = (t6 && t6.rows && t6.rows[0] && t6.rows[0].count) || 0;
    const t7 = await client.execute({ sql: "SELECT COUNT(*) AS count FROM items WHERE type = 'reminder'" });
    const totalReminders = (t7 && t7.rows && t7.rows[0] && t7.rows[0].count) || 0;

    return res.json({ totalUsers, activeUsers, suspendedUsers, totalItems, totalTasks, totalNotes, totalReminders });
  } catch (err) {
    console.error('Stats error', err);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
