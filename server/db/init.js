const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const schemaPath = path.join(__dirname, 'schema.sql');
const dbPath = path.join(__dirname, 'data.db');

const schema = fs.readFileSync(schemaPath, 'utf8');
const db = new Database(dbPath);

try {
  db.exec(schema);
  console.log('Database initialized successfully');
} catch (err) {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
} finally {
  db.close();
}
