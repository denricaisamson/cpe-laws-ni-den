// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// SQLite Database Singleton Connection
// File: src/lib/sqlite/db.ts
// =====================================================================

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './schema';

declare global {
  // eslint-disable-next-line no-var
  var __fsl_sqlite_db__: Database.Database | undefined;
}

export function getDatabasePath(): string {
  // Support custom path or railway volume mount path
  if (process.env.SQLITE_DB_PATH) {
    return process.env.SQLITE_DB_PATH;
  }
  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  return path.join(dbDir, 'fsl_workshop.db');
}

export function getSqliteDb(): Database.Database {
  if (global.__fsl_sqlite_db__) {
    return global.__fsl_sqlite_db__;
  }

  const dbPath = getDatabasePath();
  const db = new Database(dbPath);

  // Performance and safety pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');

  // Initialize tables and seed data if fresh
  initializeDatabase(db);

  if (process.env.NODE_ENV !== 'production') {
    global.__fsl_sqlite_db__ = db;
  }

  return db;
}

export const sqliteDb = getSqliteDb();
