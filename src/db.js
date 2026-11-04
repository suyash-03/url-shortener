import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, "..", "data");
const DB_PATH = join(DB_DIR, "urls.db");

// Ensure the data directory exists
mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create the urls table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code  TEXT    UNIQUE NOT NULL,
    original_url TEXT   NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    clicks      INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
`);

// Prepared statements for performance
export const stmts = {
  insert: db.prepare(
    "INSERT INTO urls (short_code, original_url) VALUES (?, ?)"
  ),
  findByCode: db.prepare("SELECT * FROM urls WHERE short_code = ?"),
  findAll: db.prepare("SELECT * FROM urls ORDER BY created_at DESC"),
  incrementClicks: db.prepare(
    "UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?"
  ),
  deleteByCode: db.prepare("DELETE FROM urls WHERE short_code = ?"),
};

export default db;
