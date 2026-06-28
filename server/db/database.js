const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    remind_at DATETIME,
    status TEXT DEFAULT 'pending',
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

module.exports = db;
const bcrypt = require('bcryptjs');

const admin = db.prepare(
  "SELECT * FROM users WHERE email=?"
).get("admin@taskflow.com");

if (!admin) {
    const hash = bcrypt.hashSync("admin123", 10);

    db.prepare(`
        INSERT INTO users
        (name,email,password_hash,is_admin,status)
        VALUES (?,?,?,?,?)
    `).run(
        "Administrator",
        "admin@taskflow.com",
        hash,
        1,
        "active"
    );
}