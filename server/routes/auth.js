const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const client = require('../db/turso');

const router = express.Router();
const JWT_SECRET = 'taskflow_secret_key_2024';

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin || 0,
      status: user.status || 'active'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existing = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
    if (existing && existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await client.execute({
      sql: 'INSERT INTO users (name, email, password_hash, is_admin, status) VALUES (?, ?, ?, 0, ?);',
      args: [name, email, passwordHash, 'active']
    });

    const sel = await client.execute({ sql: 'SELECT id, name, email, is_admin, status FROM users WHERE email = ?', args: [email] });
    const user = sel && sel.rows && sel.rows[0];
    const token = createToken(user);

    return res.status(201).json({ token, user });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const sel = await client.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
    const user = sel && sel.rows && sel.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Contact admin.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await client.execute({ sql: 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', args: [user.id] });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin,
      status: user.status
    };
    const token = createToken(safeUser);
    return res.json({ token, user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
