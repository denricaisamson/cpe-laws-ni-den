// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Database Initializer & Verification CLI Script
// File: scripts/init-sqlite.mjs
// =====================================================================

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const dbDir = path.join(rootDir, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'fsl_workshop.db');
console.log(`[SQLite Init] Target database: ${dbPath}`);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Run Schema
const schemaPath = path.join(rootDir, 'sqlite', 'migrations', 'init_sqlite.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);
console.log('[SQLite Init] Successfully executed schema definitions (14 tables).');

// 2. Run Seed
const seedPath = path.join(rootDir, 'sqlite', 'seed_sqlite.sql');
const seedSql = fs.readFileSync(seedPath, 'utf8');
db.exec(seedSql);
console.log('[SQLite Init] Successfully populated seed datasets.');

// 3. Verify Table Counts
const tables = [
  'profiles',
  'workshops',
  'schedules',
  'enrollments',
  'payments',
  'attendance',
  'assignments',
  'submissions',
  'materials',
  'videos',
  'announcements',
  'messages',
  'news_events',
  'products',
];

console.log('\n--- SQLite Database Verification Summary ---');
let totalRows = 0;
for (const table of tables) {
  const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
  console.log(`✔ Table: ${table.padEnd(16)} | Rows: ${row.count}`);
  totalRows += row.count;
}

console.log(`--------------------------------------------`);
console.log(`Total Records: ${totalRows}`);
console.log(`Database initialization and migration verified successfully!\n`);

db.close();
