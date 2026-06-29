const bcrypt = require('bcryptjs');
const client = require('./turso');

async function ensureTables() {
  // Create users table
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );`
  });

  // Create items table
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('task','note','reminder')),
      content TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      remind_at DATETIME,
      user_id INTEGER REFERENCES users(id)
    );`
  });
}

async function ensureAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@taskflow.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';

  // Check if admin exists
  const sel = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [adminEmail] });
  const exists = sel && sel.rows && sel.rows.length > 0;
  if (exists) return;

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  // Insert admin and return id
  const ins = await client.execute({
    sql: 'INSERT INTO users (name, email, password_hash, is_admin, status) VALUES (?, ?, ?, 1, ?);',
    args: ['Admin', adminEmail, passwordHash, 'active']
  });
  return ins;
}

async function init() {
  try {
    await ensureTables();
    await ensureAdmin();
    console.log('Turso DB initialized');
  } catch (err) {
    console.error('Error initializing Turso DB', err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  init();
}

module.exports = init;
