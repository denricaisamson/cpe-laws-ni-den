// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// SQLite Database Singleton Connection (Cloud & Railway Resilient)
// File: src/lib/sqlite/db.ts
// =====================================================================

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { initializeDatabase } from './schema';

declare global {
  // eslint-disable-next-line no-var
  var __fsl_sqlite_db__: Database.Database | undefined;
}

export function getDatabasePath(): string {
  // 1. If explicit environment variable is set (e.g. Railway volume)
  if (process.env.SQLITE_DB_PATH) {
    const customPath = process.env.SQLITE_DB_PATH;
    try {
      const dir = path.dirname(customPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return customPath;
    } catch (err) {
      console.warn(`[SQLite] Could not prepare custom path ${customPath}, falling back to local data directory:`, err);
    }
  }

  // 2. Default local project directory
  try {
    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    return path.join(dbDir, 'fsl_workshop.db');
  } catch (err) {
    console.warn('[SQLite] Could not create local ./data directory, falling back to temp directory:', err);
  }

  // 3. Fallback to OS temp directory
  return path.join(os.tmpdir(), 'fsl_workshop.db');
}

export function getSqliteDb(): Database.Database {
  if (global.__fsl_sqlite_db__) {
    return global.__fsl_sqlite_db__;
  }

  let dbPath = getDatabasePath();
  let db: Database.Database;

  try {
    db = new Database(dbPath);
  } catch (err) {
    console.error(`[SQLite] Failed to open database at ${dbPath}, falling back to temp:`, err);
    dbPath = path.join(os.tmpdir(), `fsl_workshop_${Date.now()}.db`);
    db = new Database(dbPath);
  }

  try {
    // Performance and safety pragmas
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');
  } catch (pragmaErr) {
    console.warn('[SQLite] Non-critical pragma configuration notice:', pragmaErr);
  }

  try {
    // Initialize tables and seed data if fresh
    initializeDatabase(db);
  } catch (initErr) {
    console.error('[SQLite] Error during database initialization:', initErr);
  }

  global.__fsl_sqlite_db__ = db;
  return db;
}

// Lazy getter proxy for sqliteDb
export const sqliteDb = new Proxy({} as Database.Database, {
  get(_target, prop) {
    const instance = getSqliteDb();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});
