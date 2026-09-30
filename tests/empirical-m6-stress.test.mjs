// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Empirical Forensic Stress Test Suite: Milestone 6
// (Community News, Merchandise Catalog & Direct Messaging)
// File: tests/empirical-m6-stress.test.mjs
// =====================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FSLDatabaseEngine, NEWS_TYPES } from './e2e/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------
// TARGET 1: DIRECT MESSAGING & THREAD INTEGRITY
// ---------------------------------------------------------------------
test('Target 1 - Direct Messaging: Dynamic dispatch, thread isolation, and chronological ordering', () => {
  const db = new FSLDatabaseEngine();

  const learnerId = 'learner-1';
  const prof1Id = 'prof-1';
  const prof2Id = 'prof-2';
  const adminId = 'admin-1';

  // 1. Initial thread isolation
  const initialThread1 = db.getMessageThread(learnerId, prof1Id);
  const initialThread2 = db.getMessageThread(learnerId, prof2Id);
  const count1 = initialThread1.length;
  const count2 = initialThread2.length;

  // 2. Dispatch message to prof-1
  const msg1Text = 'Prof Juan, will the afternoon schedule have interpretation?';
  const sent1 = db.sendMessage(learnerId, prof1Id, msg1Text);
  assert.ok(sent1.id, 'Message ID must be generated');
  assert.equal(sent1.sender_id, learnerId);
  assert.equal(sent1.receiver_id, prof1Id);
  assert.equal(sent1.body, msg1Text);

  // 3. Verify thread 1 incremented, thread 2 unchanged (Thread Isolation)
  const thread1After = db.getMessageThread(learnerId, prof1Id);
  const thread2After = db.getMessageThread(learnerId, prof2Id);
  assert.equal(thread1After.length, count1 + 1, 'Thread 1 must increment');
  assert.equal(thread2After.length, count2, 'Thread 2 must remain isolated and unchanged');

  // 4. Professor 1 replies
  const replyText = 'Yes Mark, certified FSL interpreters will be present on-screen.';
  const reply1 = db.sendMessage(prof1Id, learnerId, replyText);
  assert.ok(reply1.id);

  // 5. Verify chronological ordering
  const thread1Final = db.getMessageThread(learnerId, prof1Id);
  assert.equal(thread1Final.length, count1 + 2);
  assert.equal(thread1Final[thread1Final.length - 2].sender_id, learnerId);
  assert.equal(thread1Final[thread1Final.length - 1].sender_id, prof1Id);

  // 6. Admin messages learner
  const adminMsg = db.sendMessage(adminId, learnerId, 'Official Note: Deaf Awareness Week seminar registration is now open.');
  assert.ok(adminMsg.id);
  const adminThread = db.getMessageThread(adminId, learnerId);
  assert.ok(adminThread.some((m) => m.id === adminMsg.id));
});

test('Target 1 - Direct Messaging Boundary & Invariant Rejections', () => {
  const db = new FSLDatabaseEngine();

  // 1. Empty or whitespace message rejection
  assert.throws(
    () => db.sendMessage('learner-1', 'prof-1', ''),
    /empty/i,
    'Empty message must be rejected'
  );
  assert.throws(
    () => db.sendMessage('learner-1', 'prof-1', '   \t  \n  '),
    /empty/i,
    'Whitespace-only message must be rejected'
  );

  // 2. Non-existent sender/receiver
  assert.throws(
    () => db.sendMessage('ghost-user', 'prof-1', 'Hello'),
    /not found/i,
    'Non-existent sender must throw error'
  );
  assert.throws(
    () => db.sendMessage('learner-1', 'ghost-recipient', 'Hello'),
    /not found/i,
    'Non-existent receiver must throw error'
  );
});

// ---------------------------------------------------------------------
// TARGET 2: GROUNDED SDEAS & DEAF FESTIVAL NEWS SPEC COMPLIANCE
// ---------------------------------------------------------------------
test('Target 2 - Grounded SDEAS & Deaf Festival News: Authentic content & categories', () => {
  const communityDataPath = path.join(rootDir, 'src', 'lib', 'community-data.ts');
  const content = fs.readFileSync(communityDataPath, 'utf8');

  // 1. Grounded event titles & organizations from FSL_SPEC.md § 4
  assert.ok(
    content.includes('Benilde Deaf Festival Highlights & Performance Schedules'),
    'Must include Benilde Deaf Festival Highlights'
  );
  assert.ok(
    content.includes('SDEAS Deaf Awareness Week Celebration: 30+ Years of Inclusive Education'),
    'Must include SDEAS 30-year celebration'
  );
  assert.ok(
    content.includes('Republic Act 11106') || content.includes('RA 11106'),
    'Must include Republic Act 11106 Forums'
  );
  assert.ok(
    content.includes('Bachelor in Sign Language Interpretation (BSLI)'),
    'Must include BSLI Admissions Briefing'
  );

  // 2. Accessibility accommodations
  assert.ok(
    content.includes('accommodations'),
    'News events must support accommodations property'
  );
  assert.ok(
    content.includes('FSL interpreters') || content.includes('Filipino Sign Language'),
    'Accommodations must mention FSL interpreting'
  );

  // 3. Harness NEWS_TYPES consistency
  for (const t of ['sdeas_news', 'deaf_festival', 'event', 'seminar']) {
    assert.ok(NEWS_TYPES.includes(t), `NEWS_TYPES in harness must include "${t}"`);
  }
});

// ---------------------------------------------------------------------
// TARGET 3: MERCHANDISE CATALOG & SIMULATED INQUIRY STATE MUTATIONS
// ---------------------------------------------------------------------
test('Target 3 - Merchandise Catalog & Inventory Mutations: Authentic prices, stock decrement, and boundary checks', () => {
  const db = new FSLDatabaseEngine();

  // 1. Grounded merchandise items from FSL_SPEC.md § 5
  assert.ok(db.products.length >= 4, 'Must have at least 4 products in seed');

  const shirt = db.products.find((p) => p.name.includes('Shirt'));
  assert.ok(shirt, 'Shirt product must exist');
  assert.equal(shirt.price, 450, 'Shirt price must be ₱450');
  const initialShirtStock = shirt.stock;
  assert.ok(initialShirtStock > 0);

  const tote = db.products.find((p) => p.name.includes('Tote Bag'));
  assert.ok(tote, 'Tote bag must exist');
  assert.equal(tote.price, 350, 'Tote bag price must be ₱350');

  const pin = db.products.find((p) => p.name.includes('Pin'));
  assert.ok(pin, 'Enamel pin must exist');

  const lanyard = db.products.find((p) => p.name.includes('Lanyard'));
  assert.ok(lanyard, 'Lanyard must exist');

  // 2. Genuine state mutation: purchasing decrements stock
  const purchased = db.purchaseProduct(shirt.id, 2);
  assert.equal(purchased.stock, initialShirtStock - 2, 'Stock must decrement by purchased count');

  // 3. Invariant: Rejection on insufficient stock
  assert.throws(
    () => db.purchaseProduct(shirt.id, 999999),
    /insufficient stock/i,
    'Must throw on purchase exceeding inventory'
  );

  // 4. Invariant: Rejection on non-positive quantity
  assert.throws(
    () => db.purchaseProduct(shirt.id, 0),
    /at least 1/i,
    'Zero quantity must be rejected'
  );
  assert.throws(
    () => db.purchaseProduct(shirt.id, -3),
    /at least 1/i,
    'Negative quantity must be rejected'
  );

  // 5. Complete stock depletion to 0
  const remaining = purchased.stock;
  db.purchaseProduct(shirt.id, remaining);
  assert.equal(shirt.stock, 0, 'Stock must reach 0 upon full depletion');

  // 6. Out of stock rejection when stock is 0
  assert.throws(
    () => db.purchaseProduct(shirt.id, 1),
    /insufficient stock/i,
    'Depleted item must reject subsequent purchase'
  );
});

// ---------------------------------------------------------------------
// TARGET 4: SOURCE CODE INTEGRITY (NO CHEATING, FACADES, OR DUMMY RETURNS)
// ---------------------------------------------------------------------
test('Target 4 - Forensic Cleanliness: No hardcoded test bypasses, dummy returns, or facades in Milestone 6 files', () => {
  const filesToScan = [
    'src/lib/community-data.ts',
    'src/app/messages/page.tsx',
    'src/app/messages/MessagesClient.tsx',
    'src/app/news/page.tsx',
    'src/app/news/NewsClient.tsx',
    'src/app/merchandise/page.tsx',
    'src/app/merchandise/MerchandiseClient.tsx',
  ];

  const prohibitedPatterns = [
    /return\s+(true|false|null|undefined|""|\[\]|\{\})\s*;\s*\/\/\s*dummy/i,
    /\/\/\s*@ts-ignore/i,
    /\/\/\s*@ts-nocheck/i,
    /\/\* eslint-disable \*\//i,
    /test\.skip/i,
    /it\.skip/i,
    /describe\.skip/i,
  ];

  for (const relPath of filesToScan) {
    const fullPath = path.join(rootDir, relPath);
    assert.ok(fs.existsSync(fullPath), `Target file must exist: ${relPath}`);
    const content = fs.readFileSync(fullPath, 'utf8');

    for (const pattern of prohibitedPatterns) {
      assert.ok(
        !pattern.test(content),
        `Prohibited pattern ${pattern} found in ${relPath}`
      );
    }
  }
});

// ---------------------------------------------------------------------
// TARGET 5: REAL-WORLD MULTI-USER CROSS-FEATURE INTEGRATION SCENARIO
// ---------------------------------------------------------------------
test('Target 5 - End-to-End Milestone 6 Simulation: News discovery -> Merchandise purchase -> Consultation messaging', () => {
  const db = new FSLDatabaseEngine();

  // 1. Learner browses news for Deaf Festival
  const festivalNews = db.news_events.filter((n) => n.type === 'deaf_festival');
  assert.ok(festivalNews.length >= 1, 'Learner finds Deaf Festival announcements');

  // 2. Learner decides to purchase merchandise
  const tote = db.products.find((p) => p.name.includes('Tote Bag'));
  const origStock = tote.stock;
  db.purchaseProduct(tote.id, 1);
  assert.equal(tote.stock, origStock - 1, 'Merchandise stock decrements after purchase');

  // 3. Learner messages professor about attending the Deaf Festival together
  const question = 'Prof Juan, will the workshop class attend the Deaf Festival opening ceremony together?';
  const sentMsg = db.sendMessage('learner-1', 'prof-1', question);
  assert.ok(sentMsg.id);

  // 4. Professor checks and replies
  const thread = db.getMessageThread('learner-1', 'prof-1');
  assert.equal(thread[thread.length - 1].body, question);

  const answer = 'Yes Mark! All SDEAS workshop learners have reserved seating near the stage.';
  const profReply = db.sendMessage('prof-1', 'learner-1', answer);
  assert.ok(profReply.id);

  // 5. Final conversation thread verification
  const finalThread = db.getMessageThread('learner-1', 'prof-1');
  assert.equal(finalThread[finalThread.length - 1].body, answer);
});
