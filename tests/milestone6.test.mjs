// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Unit Test Suite: Milestone 6 (Community, Merchandise & Messaging)
// File: tests/milestone6.test.mjs
// =====================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FSLDatabaseEngine } from './e2e/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------
// Test 1: Routes and Source Files Existence
// ---------------------------------------------------------------------
test('Milestone 6 - Community, Merchandise & Messaging Files Existence', () => {
  const requiredFiles = [
    path.join(rootDir, 'src', 'lib', 'community-data.ts'),
    path.join(rootDir, 'src', 'app', 'messages', 'page.tsx'),
    path.join(rootDir, 'src', 'app', 'messages', 'MessagesClient.tsx'),
    path.join(rootDir, 'src', 'app', 'news', 'page.tsx'),
    path.join(rootDir, 'src', 'app', 'news', 'NewsClient.tsx'),
    path.join(rootDir, 'src', 'app', 'merchandise', 'page.tsx'),
    path.join(rootDir, 'src', 'app', 'merchandise', 'MerchandiseClient.tsx'),
  ];

  for (const filePath of requiredFiles) {
    assert.ok(fs.existsSync(filePath), `Required Milestone 6 file must exist: ${filePath}`);
  }
});

// ---------------------------------------------------------------------
// Test 2: Shared Data Layer Contract in src/lib/community-data.ts
// ---------------------------------------------------------------------
test('Milestone 6 - Shared Data Layer Contract in src/lib/community-data.ts', () => {
  const fileContent = fs.readFileSync(
    path.join(rootDir, 'src', 'lib', 'community-data.ts'),
    'utf8'
  );

  // Storage & Reactive State Event Subscriptions
  assert.ok(
    fileContent.includes('subscribeToCommunityStore'),
    'community-data.ts must export subscribeToCommunityStore'
  );
  assert.ok(
    fileContent.includes('resetCommunityStore'),
    'community-data.ts must export resetCommunityStore'
  );
  assert.ok(
    fileContent.includes('COMMUNITY_STORAGE_KEY'),
    'community-data.ts must export COMMUNITY_STORAGE_KEY'
  );
  assert.ok(
    fileContent.includes('fsl_community_store_v1'),
    'community-data.ts must use fsl_community_store_v1'
  );

  // Direct Messaging API
  assert.ok(fileContent.includes('sendMessage'), 'Must export sendMessage');
  assert.ok(fileContent.includes('getMessageThread'), 'Must export getMessageThread');
  assert.ok(fileContent.includes('getConversations'), 'Must export getConversations');
  assert.ok(fileContent.includes('markThreadAsRead'), 'Must export markThreadAsRead');

  // News & Events API
  assert.ok(fileContent.includes('getNewsEvents'), 'Must export getNewsEvents');
  assert.ok(fileContent.includes('getNewsEventById'), 'Must export getNewsEventById');
  assert.ok(fileContent.includes('INITIAL_NEWS_EVENTS'), 'Must export INITIAL_NEWS_EVENTS');

  // Merchandise Catalog API
  assert.ok(fileContent.includes('getProducts'), 'Must export getProducts');
  assert.ok(fileContent.includes('getProductById'), 'Must export getProductById');
  assert.ok(fileContent.includes('submitMerchandiseInquiry'), 'Must export submitMerchandiseInquiry');
  assert.ok(fileContent.includes('INITIAL_PRODUCTS'), 'Must export INITIAL_PRODUCTS');
});

// ---------------------------------------------------------------------
// Test 3: Direct Messaging Dispatch and Thread Retrieval
// ---------------------------------------------------------------------
test('Milestone 6 - Direct Messaging Dispatch and Thread Retrieval', () => {
  const db = new FSLDatabaseEngine();

  const learnerId = 'learner-1';
  const profId = 'prof-1';
  const adminId = 'admin-1';

  // 1. Initial state
  const initialThread = db.getMessageThread(learnerId, profId);
  const initialCount = initialThread.length;

  // 2. Learner sends a question to Professor
  const text1 = 'Teacher Rommel, can you review the palm orientation for number 7?';
  const sentMsg = db.sendMessage(learnerId, profId, text1);
  assert.ok(sentMsg.id, 'Sent message must have a generated ID');
  assert.equal(sentMsg.body, text1);
  assert.equal(sentMsg.sender_id, learnerId);
  assert.equal(sentMsg.receiver_id, profId);

  // 3. Updated thread length
  const updatedThread = db.getMessageThread(learnerId, profId);
  assert.equal(updatedThread.length, initialCount + 1, 'Thread length must increment by 1');
  assert.equal(updatedThread[updatedThread.length - 1].body, text1);

  // 4. Professor replies
  const text2 = 'Hello Juan! For number 7, the palm faces inward with the index and middle finger touching thumb.';
  const replyMsg = db.sendMessage(profId, learnerId, text2);
  assert.ok(replyMsg.id);

  // 5. Thread order must be chronological
  const finalThread = db.getMessageThread(learnerId, profId);
  assert.equal(finalThread.length, initialCount + 2);
  const last2 = finalThread.slice(-2);
  assert.equal(last2[0].sender_id, learnerId);
  assert.equal(last2[1].sender_id, profId);

  // 6. Admin communication
  const adminMsg = db.sendMessage(adminId, learnerId, 'Official announcement: Deaf Awareness Week schedule is posted.');
  assert.ok(adminMsg.id);
  const adminThread = db.getMessageThread(adminId, learnerId);
  assert.ok(adminThread.some((m) => m.id === adminMsg.id));

  // 7. Invariant & Boundary checks
  assert.throws(() => {
    db.sendMessage(learnerId, profId, '    ');
  }, /empty/i);

  assert.throws(() => {
    db.sendMessage('unknown-user', profId, 'Hello');
  }, /not found/i);
});

// ---------------------------------------------------------------------
// Test 4: SDEAS News & Events Hub Filtering and Grounded Content
// ---------------------------------------------------------------------
test('Milestone 6 - SDEAS News & Events Filtering and Grounded Content', () => {
  const communityDataContent = fs.readFileSync(
    path.join(rootDir, 'src', 'lib', 'community-data.ts'),
    'utf8'
  );

  // Grounded content checks from FSL_SPEC.md & DISPATCH.md:
  // 1. SDEAS Deaf Awareness Week Celebration
  assert.ok(
    communityDataContent.includes('SDEAS Deaf Awareness Week Celebration'),
    'Must contain SDEAS Deaf Awareness Week Celebration'
  );

  // 2. Benilde Deaf Festival Highlights & Performance Schedules
  assert.ok(
    communityDataContent.includes('Benilde Deaf Festival Highlights & Performance Schedules'),
    'Must contain Benilde Deaf Festival Highlights announcement'
  );

  // 3. Republic Act 11106 Forums & Advocacy Sessions
  assert.ok(
    communityDataContent.includes('Republic Act 11106') || communityDataContent.includes('RA 11106'),
    'Must contain RA 11106 Forums & Advocacy Sessions'
  );

  // 4. Deaf Community Career & Immersion Programs
  assert.ok(
    communityDataContent.includes('Deaf Community Career & Immersion Programs'),
    'Must contain Deaf Community Career & Immersion Programs'
  );

  // 5. Accessibility accommodations note
  assert.ok(
    communityDataContent.includes('FSL interpreters') || communityDataContent.includes('Filipino Sign Language'),
    'News events must provide accessibility accommodations'
  );

  // Verify categories in FSLDatabaseEngine
  const db = new FSLDatabaseEngine();
  const sdeasNews = db.news_events.filter((n) => n.type === 'sdeas_news');
  assert.ok(sdeasNews.length >= 1, 'Must have sdeas_news in database engine');

  const deafFest = db.news_events.filter((n) => n.type === 'deaf_festival');
  assert.ok(deafFest.length >= 1, 'Must have deaf_festival in database engine');

  const seminars = db.news_events.filter((n) => n.type === 'seminar');
  assert.ok(seminars.length >= 1, 'Must have seminar in database engine');
});

// ---------------------------------------------------------------------
// Test 5: Merchandise Catalog Stock, Filtering & Simulated Inquiry Flow
// ---------------------------------------------------------------------
test('Milestone 6 - Merchandise Catalog Stock, Filtering & Simulated Inquiry Flow', () => {
  const communityDataContent = fs.readFileSync(
    path.join(rootDir, 'src', 'lib', 'community-data.ts'),
    'utf8'
  );

  // 1. Grounded items with exact prices and stocks from FSL_SPEC.md & DISPATCH.md
  // A. FSL "I Love You" Sign Graphic T-Shirt (₱450, stock: 45)
  assert.ok(
    communityDataContent.includes('FSL "I Love You" Sign Graphic T-Shirt'),
    'Must contain FSL "I Love You" Sign Graphic T-Shirt'
  );
  assert.ok(communityDataContent.includes('450'), 'Must contain price 450');
  assert.ok(communityDataContent.includes('45'), 'Must contain stock 45');

  // B. Deaf Pride Canvas Tote Bag (₱350, stock: 60)
  assert.ok(
    communityDataContent.includes('Deaf Pride Canvas Tote Bag'),
    'Must contain Deaf Pride Canvas Tote Bag'
  );
  assert.ok(communityDataContent.includes('350'), 'Must contain price 350');
  assert.ok(communityDataContent.includes('60'), 'Must contain stock 60');

  // C. FSL Fingerspelling Enamel Pin Set (₱250, stock: 120)
  assert.ok(
    communityDataContent.includes('FSL Fingerspelling Enamel Pin Set'),
    'Must contain FSL Fingerspelling Enamel Pin Set'
  );
  assert.ok(communityDataContent.includes('250'), 'Must contain price 250');
  assert.ok(communityDataContent.includes('120'), 'Must contain stock 120');

  // D. FSL Alphabet Lanyard & Badge Holder (₱180, stock: 85)
  assert.ok(
    communityDataContent.includes('FSL Alphabet Lanyard & Badge Holder'),
    'Must contain FSL Alphabet Lanyard & Badge Holder'
  );
  assert.ok(communityDataContent.includes('180'), 'Must contain price 180');
  assert.ok(communityDataContent.includes('85'), 'Must contain stock 85');

  // E. Benilde SDEAS Deaf Festival Commemorative Hoodie (₱950, stock: 25)
  assert.ok(
    communityDataContent.includes('Benilde SDEAS Deaf Festival Commemorative Hoodie'),
    'Must contain Benilde SDEAS Deaf Festival Commemorative Hoodie'
  );
  assert.ok(communityDataContent.includes('950'), 'Must contain price 950');
  assert.ok(communityDataContent.includes('25'), 'Must contain stock 25');

  // 2. Categories represented
  assert.ok(communityDataContent.includes("'Apparel'"), 'Must include Apparel category');
  assert.ok(communityDataContent.includes("'Accessories'"), 'Must include Accessories category');
  assert.ok(communityDataContent.includes("'Pins & Badges'"), 'Must include Pins & Badges category');

  // 3. Stock decrement behavior using FSLDatabaseEngine
  const db = new FSLDatabaseEngine();
  const shirt = db.products.find((p) => p.name.includes('Shirt'));
  assert.ok(shirt);
  const initialStock = shirt.stock;
  assert.ok(initialStock > 0);

  // Simulated purchase / order
  const updated = db.purchaseProduct(shirt.id, 2);
  assert.equal(updated.stock, initialStock - 2, 'Stock must decrement by purchased quantity');

  // Reject purchase exceeding stock
  assert.throws(() => {
    db.purchaseProduct(shirt.id, 999999);
  }, /insufficient stock/i);

  // Reject non-positive quantity
  assert.throws(() => {
    db.purchaseProduct(shirt.id, 0);
  }, /at least 1/i);
});

// ---------------------------------------------------------------------
// Test 6: Navbar Navigation Accessibility for Milestone 6 Routes
// ---------------------------------------------------------------------
test('Milestone 6 - Navbar Navigation Accessibility for Messages, News & Merchandise', () => {
  const navbarContent = fs.readFileSync(
    path.join(rootDir, 'src', 'components', 'layout', 'Navbar.tsx'),
    'utf8'
  );

  // Active top-level links across navigation
  assert.ok(navbarContent.includes('href="/news"'), 'Navbar must link to /news');
  assert.ok(navbarContent.includes('href="/merchandise"'), 'Navbar must link to /merchandise');
  assert.ok(navbarContent.includes('href="/messages"'), 'Navbar must link to /messages');

  // Labels present
  assert.ok(navbarContent.includes('News & Events'), 'Navbar must have "News & Events" label');
  assert.ok(navbarContent.includes('Merchandise'), 'Navbar must have "Merchandise" label');
  assert.ok(navbarContent.includes('Messages'), 'Navbar must have "Messages" label');
});

// ---------------------------------------------------------------------
// Test 7: UI Client Components Accessibility and Interaction Contracts
// ---------------------------------------------------------------------
test('Milestone 6 - UI Client Components Accessibility and Interaction Contracts', () => {
  const messagesClient = fs.readFileSync(
    path.join(rootDir, 'src', 'app', 'messages', 'MessagesClient.tsx'),
    'utf8'
  );
  const newsClient = fs.readFileSync(
    path.join(rootDir, 'src', 'app', 'news', 'NewsClient.tsx'),
    'utf8'
  );
  const merchClient = fs.readFileSync(
    path.join(rootDir, 'src', 'app', 'merchandise', 'MerchandiseClient.tsx'),
    'utf8'
  );

  // Messages UI features
  assert.ok(messagesClient.includes('Conversations'), 'MessagesClient must render Conversations sidebar');
  assert.ok(messagesClient.includes('Enter'), 'MessagesClient must support Enter-to-send shortcut');
  assert.ok(messagesClient.includes('Current Role:'), 'MessagesClient must provide quick role switcher for testing');
  assert.ok(messagesClient.includes('Active Consultation'), 'MessagesClient must show active status indicator');
  assert.ok(messagesClient.includes('Consultation Messages'), 'MessagesClient must show heading');

  // News UI features
  assert.ok(newsClient.includes('All Announcements'), 'NewsClient must have All tab');
  assert.ok(newsClient.includes('SDEAS News'), 'NewsClient must have SDEAS News tab');
  assert.ok(newsClient.includes('Deaf Festival'), 'NewsClient must have Deaf Festival tab');
  assert.ok(newsClient.includes('Events & Seminars'), 'NewsClient must have Events & Seminars tab');
  assert.ok(newsClient.includes('Accessibility Accommodations'), 'NewsClient must render Accommodations in modal');

  // Merchandise UI features
  assert.ok(merchClient.includes('Apparel'), 'MerchandiseClient must have Apparel tab');
  assert.ok(merchClient.includes('Accessories'), 'MerchandiseClient must have Accessories tab');
  assert.ok(merchClient.includes('Pins & Badges'), 'MerchandiseClient must have Pins & Badges tab');
  assert.ok(merchClient.includes('Inquire / Order'), 'MerchandiseClient must have Inquire / Order button');
  assert.ok(merchClient.includes('Advocacy Pre-Order Inquiry'), 'MerchandiseClient must render Pre-Order modal');
});
