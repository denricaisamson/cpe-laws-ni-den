import test from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('SQLite Migration: Schema & 14 Relational Tables Verification', async (t) => {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  // 1. Read and execute SQLite schema
  const schemaSql = fs.readFileSync(path.join(rootDir, 'sqlite', 'migrations', 'init_sqlite.sql'), 'utf8');
  db.exec(schemaSql);

  // 2. Verify all 14 tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map((r) => r.name);
  
  const expectedTables = [
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

  for (const table of expectedTables) {
    assert.ok(tables.includes(table), `Table ${table} must exist in SQLite schema`);
  }

  // 3. Read and execute SQLite seed data
  const seedSql = fs.readFileSync(path.join(rootDir, 'sqlite', 'seed_sqlite.sql'), 'utf8');
  db.exec(seedSql);

  // 4. Verify seeded profiles
  const profiles = db.prepare('SELECT * FROM profiles').all();
  assert.equal(profiles.length, 6, 'Should have seeded 6 demo profiles');
  const admin = profiles.find((p) => p.role === 'admin');
  assert.ok(admin, 'Admin profile should exist');
  assert.equal(admin.email, 'admin@fsl.edu.ph');

  // 5. Verify workshops (Levels 1, 2, 3)
  const workshops = db.prepare('SELECT * FROM workshops ORDER BY level ASC').all();
  assert.equal(workshops.length, 3, 'Should have 3 workshop levels');
  assert.equal(workshops[0].level, 1);
  assert.equal(workshops[1].level, 2);
  assert.equal(workshops[2].level, 3);

  // 6. Verify 6 grounded FSL video categories
  const videos = db.prepare('SELECT category FROM videos').all();
  const categories = new Set(videos.map((v) => v.category));
  const expectedCategories = [
    'Alphabet / Fingerspelling',
    'Basic Greetings',
    'Numbers',
    'Common Expressions',
    'Everyday Conversations',
    'Vocabulary Lessons',
  ];
  for (const cat of expectedCategories) {
    assert.ok(categories.has(cat), `Video category ${cat} should be present in seed`);
  }

  // 7. Verify atomic payment verification flow
  const initialPendingPayment = db.prepare("SELECT * FROM payments WHERE status = 'pending'").get();
  assert.ok(initialPendingPayment, 'Should have a pending payment');
  
  // Verify payment atomically
  const tx = db.transaction(() => {
    db.prepare("UPDATE payments SET status = 'verified' WHERE id = ?").run(initialPendingPayment.id);
    db.prepare("UPDATE enrollments SET status = 'enrolled' WHERE id = ?").run(initialPendingPayment.enrollment_id);
  });
  tx();

  const verifiedPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(initialPendingPayment.id);
  assert.equal(verifiedPayment.status, 'verified');
  const enrolledRecord = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(initialPendingPayment.enrollment_id);
  assert.equal(enrolledRecord.status, 'enrolled');

  // 8. Verify foreign key cascade enforcement
  const testWsId = 'ws-test-cascade';
  db.prepare("INSERT INTO workshops (id, level, title, fee, description) VALUES (?, 1, 'Cascade Test', 100, 'Test')").run(testWsId);
  db.prepare("INSERT INTO schedules (id, workshop_id, professor_id, day_time, slots) VALUES ('sch-test', ?, ?, 'Mon 9am', 10)").run(testWsId, admin.id);
  assert.ok(db.prepare('SELECT * FROM schedules WHERE id = ?').get('sch-test'));
  
  db.prepare('DELETE FROM workshops WHERE id = ?').run(testWsId);
  assert.equal(db.prepare('SELECT * FROM schedules WHERE id = ?').get('sch-test'), undefined, 'Schedule must be cascade-deleted');
});
