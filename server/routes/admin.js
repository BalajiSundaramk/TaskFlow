const express = require('express');
const db = require('../db/database');
const authenticateToken = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get('/users', authenticateToken, adminAuth, (req, res) => {
  const users = db.prepare('SELECT id, name, email, password_hash, is_admin, status, created_at, last_login FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

router.patch('/users/:id/status', authenticateToken, adminAuth, (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const user = db.prepare('SELECT id, is_admin FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.is_admin === 1) return res.status(400).json({ error: 'Cannot modify admin account' });

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
  const updated = db.prepare('SELECT id, name, email, password_hash, is_admin, status, created_at, last_login FROM users WHERE id = ?').get(id);
  res.json(updated);
});

router.delete('/users/:id', authenticateToken, adminAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const user = db.prepare('SELECT id, is_admin FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.is_admin === 1) return res.status(400).json({ error: 'Cannot delete admin account' });

  db.prepare('DELETE FROM items WHERE user_id = ?').run(id);
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true, message: 'User and all their data deleted' });
});

router.get('/stats', authenticateToken, adminAuth, (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  const activeUsers = db.prepare("SELECT COUNT(*) AS count FROM users WHERE status = 'active'").get().count;
  const suspendedUsers = db.prepare("SELECT COUNT(*) AS count FROM users WHERE status = 'suspended'").get().count;
  const totalItems = db.prepare('SELECT COUNT(*) AS count FROM items').get().count;
  const totalTasks = db.prepare("SELECT COUNT(*) AS count FROM items WHERE type = 'task'").get().count;
  const totalNotes = db.prepare("SELECT COUNT(*) AS count FROM items WHERE type = 'note'").get().count;
  const totalReminders = db.prepare("SELECT COUNT(*) AS count FROM items WHERE type = 'reminder'").get().count;

  res.json({ totalUsers, activeUsers, suspendedUsers, totalItems, totalTasks, totalNotes, totalReminders });
});

module.exports = router;
