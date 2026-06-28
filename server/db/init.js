const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const schemaPath = path.join(__dirname, 'schema.sql');
const dbPath = path.join(__dirname, 'data.db');

const schema = fs.readFileSync(schemaPath, 'utf8');
const db = new Database(dbPath);

try {
  db.exec(schema);

  const userColumns = db.prepare("PRAGMA table_info(users)").all();
  const hasIsAdmin = userColumns.some((column) => column.name === 'is_admin');
  const hasStatus = userColumns.some((column) => column.name === 'status');
  const hasLastLogin = userColumns.some((column) => column.name === 'last_login');

  if (!hasIsAdmin) {
    db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0");
  }
  if (!hasStatus) {
    db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'");
  }
  if (!hasLastLogin) {
    db.exec('ALTER TABLE users ADD COLUMN last_login DATETIME');
  }

  const itemsColumns = db.prepare("PRAGMA table_info(items)").all();
  const hasUserId = itemsColumns.some((column) => column.name === 'user_id');
  if (!hasUserId) {
    db.exec('ALTER TABLE items ADD COLUMN user_id INTEGER REFERENCES users(id)');
  }

  const adminExists = db.prepare("SELECT id FROM users WHERE email = 'admin@taskflow.com'").get();
  if (!adminExists) {
    const hash = bcrypt.hashSync('Admin@1234', 10);
    db.prepare("INSERT INTO users (name, email, password_hash, is_admin, status) VALUES (?, ?, ?, 1, 'active')").run('Admin', 'admin@taskflow.com', hash);
    console.log('Default admin created: admin@taskflow.com / Admin@1234');
  }

  console.log('Database initialized successfully');
} catch (err) {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
} finally {
  db.close();
}
