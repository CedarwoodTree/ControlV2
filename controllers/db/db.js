import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', '..', 'data', 'controldb.sqlite');

const dbDir = dirname(dbPath);

// 2. Create the directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create Database
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Import and run SCHEMA
const SCHEMA_FILE = join(__dirname, 'schema.sql');

if (fs.existsSync(SCHEMA_FILE)) {
  const initSql = fs.readFileSync(SCHEMA_FILE, 'utf8');

  try {
    db.exec(initSql);
  } catch (e) {
    console.error(e);
  }
}

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

export default db;
