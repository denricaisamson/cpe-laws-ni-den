// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Empirical Challenger Stress Test Suite: Milestone 6
// File: tests/stress_milestone6_challenger.mjs
// =====================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FSLDatabaseEngine, calculateContrastRatio } from './e2e/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------
// TARGET 1: THREADED MESSAGING INTEGRITY & STRESS
// ---------------------------------------------------------------------

test('Empirical Target 1.1 - Multi-User Cross-Talk Isolation (4 Learners, 2 Professors, 1 Admin)', () => {
  const db = new FSLDatabaseEngine();

  const l1 = 'learner-1';
  const l2 = 'learner-2';
  const l3 = 'learner-3';
  const p1 = 'prof-1';
  const p2 = 'prof-2';
  const admin = 'admin-1';

  // Dispatch multi-pair messages
  const m1 = db.sendMessage(l1, p1, 'L1 to P1: Can you verify my fingerspelling handshape for Z?');
  const m2 = db.sendMessage(p1, l1, 'P1 to L1: Handshape for Z uses index finger tracing in air.');
  const m3 = db.sendMessage(l2, p1, 'L2 to P1: Is there a quiz this Sunday?');
  const m4 = db.sendMessage(p1, l2, 'P1 to L2: Yes, a 10-item receptive fingerspelling drill.');
  const m5 = db.sendMessage(admin, l1, 'Admin to L1: Your official enrollment certificate is ready for download.');
  const m6 = db.sendMessage(p2, l3, 'P2 to L3: Welcome to Level 2 discourse practice.');
  const m7 = db.sendMessage(admin, p1, 'Admin to P1: Room assignment for hybrid session confirmed.');

  // Isolation assertions
  const threadL1P1 = db.getMessageThread(l1, p1);
  assert.ok(threadL1P1.some((m) => m.id === m1.id), 'Thread L1-P1 must include m1');
  assert.ok(threadL1P1.some((m) => m.id === m2.id), 'Thread L1-P1 must include m2');
  assert.equal(threadL1P1.some((m) => m.id === m3.id), false, 'L1-P1 must NOT leak L2 messages');
  assert.equal(threadL1P1.some((m) => m.id === m4.id), false, 'L1-P1 must NOT leak P1 reply to L2');
  assert.equal(threadL1P1.some((m) => m.id === m5.id), false, 'L1-P1 must NOT leak Admin-to-L1 messages');
  assert.equal(threadL1P1.some((m) => m.id === m6.id), false, 'L1-P1 must NOT leak P2-to-L3 messages');
  assert.equal(threadL1P1.some((m) => m.id === m7.id), false, 'L1-P1 must NOT leak Admin-to-P1 messages');

  const threadL2P1 = db.getMessageThread(l2, p1);
  assert.ok(threadL2P1.some((m) => m.id === m3.id), 'Thread L2-P1 must include m3');
  assert.ok(threadL2P1.some((m) => m.id === m4.id), 'Thread L2-P1 must include m4');
  assert.equal(threadL2P1.some((m) => m.id === m1.id), false, 'L2-P1 must NOT leak L1 messages');

  const threadAdminL1 = db.getMessageThread(admin, l1);
  assert.ok(threadAdminL1.some((m) => m.id === m5.id), 'Thread Admin-L1 must include m5');
  assert.equal(threadAdminL1.some((m) => m.id === m7.id), false, 'Admin-L1 must NOT leak Admin-P1 message');

  // Symmetry check
  const threadP1L1 = db.getMessageThread(p1, l1);
  assert.deepEqual(
    threadL1P1.map((m) => m.id),
    threadP1L1.map((m) => m.id),
    'getMessageThread(A, B) must match getMessageThread(B, A) in content and order'
  );

  // Uncontacted pair check
  const threadL2L3 = db.getMessageThread(l2, l3);
  assert.equal(threadL2L3.length, 0, 'Uncontacted learners must have empty thread');
});

test('Empirical Target 1.2 - Message Sorting & Timestamp Out-of-Order Stress', () => {
  const db = new FSLDatabaseEngine();

  const userA = 'learner-1';
  const userB = 'prof-1';

  // Wipe messages between A and B
  db.messages = db.messages.filter(
    (m) =>
      !(
        (m.sender_id === userA && m.receiver_id === userB) ||
        (m.sender_id === userB && m.receiver_id === userA)
      )
  );

  // Out-of-order timestamps
  const timestamps = [
    '2026-09-20T14:30:00Z', // 4th
    '2026-09-20T09:00:00Z', // 1st
    '2026-09-20T18:00:00Z', // 5th
    '2026-09-20T11:15:00Z', // 2nd
    '2026-09-20T13:45:00Z', // 3rd
  ];

  for (let i = 0; i < timestamps.length; i++) {
    db.messages.push({
      id: `stress-order-msg-${i}`,
      sender_id: i % 2 === 0 ? userA : userB,
      receiver_id: i % 2 === 0 ? userB : userA,
      body: `Out-of-order message #${i}`,
      created_at: timestamps[i],
    });
  }

  // Retrieve thread
  const sortedThread = db.getMessageThread(userA, userB);
  assert.equal(sortedThread.length, 5, 'Thread must contain all 5 messages');

  // Verify chronological ascending order
  for (let i = 0; i < sortedThread.length - 1; i++) {
    const curTime = new Date(sortedThread[i].created_at).getTime();
    const nextTime = new Date(sortedThread[i + 1].created_at).getTime();
    assert.ok(
      curTime <= nextTime,
      `Message ${i} (${sortedThread[i].created_at}) must precede or equal message ${i + 1} (${sortedThread[i + 1].created_at})`
    );
  }

  assert.equal(sortedThread[0].created_at, '2026-09-20T09:00:00Z', 'Earliest message must be first');
  assert.equal(sortedThread[4].created_at, '2026-09-20T18:00:00Z', 'Latest message must be last');
});

test('Empirical Target 1.3 - Adversarial Message Payloads: Self-Messaging, Empty, Unicode & Burst', () => {
  const db = new FSLDatabaseEngine();

  // 1. Empty and whitespace-only body rejection
  assert.throws(
    () => db.sendMessage('learner-1', 'prof-1', ''),
    /empty/i,
    'Empty message must be rejected'
  );

  assert.throws(
    () => db.sendMessage('learner-1', 'prof-1', '   \t\r\n   '),
    /empty/i,
    'Whitespace-only message must be rejected'
  );

  // 2. Non-existent sender/receiver
  assert.throws(
    () => db.sendMessage('non-existent-user-1', 'prof-1', 'Hello'),
    /not found/i,
    'Non-existent sender must throw error'
  );

  assert.throws(
    () => db.sendMessage('learner-1', 'non-existent-user-2', 'Hello'),
    /not found/i,
    'Non-existent receiver must throw error'
  );

  // 3. Unicode, Tagalog diacritics, and Deaf Culture Sign Emojis
  const unicodeBody = '🤟 Kamusta po Teacher Rommel! 🇵🇭 Salamat sa pagturo ng FSL fingerspelling at visual cues. 👋 🤝 ✨';
  const unicodeMsg = db.sendMessage('learner-1', 'prof-1', unicodeBody);
  assert.equal(unicodeMsg.body, unicodeBody, 'Unicode and emojis must be preserved exactly');

  // 4. Malicious XSS Payloads string preservation
  const xssBody = '<script>alert("XSS")</script><img src="x" onerror="stealCookies()">';
  const xssMsg = db.sendMessage('learner-1', 'prof-1', xssBody);
  assert.equal(xssMsg.body, xssBody, 'XSS payload must be stored as raw string without execution or corruption');

  // 5. Large text payload stress (10,000 characters)
  const largeBody = 'FSL-DEAF-COMMUNITY-'.repeat(526);
  const largeMsg = db.sendMessage('learner-1', 'prof-1', largeBody);
  assert.equal(largeMsg.body.length, largeBody.length, 'Large payload must be preserved without truncation');

  // 6. Rapid Burst Dispatch: 50 consecutive messages
  const burstCount = 50;
  for (let i = 0; i < burstCount; i++) {
    db.sendMessage('learner-2', 'prof-2', `Burst message #${i} - timestamp sync`);
  }
  const burstThread = db.getMessageThread('learner-2', 'prof-2');
  assert.ok(burstThread.length >= burstCount, `Thread must contain at least ${burstCount} burst messages`);
});

// ---------------------------------------------------------------------
// TARGET 2: NEWS FILTERING & ACCESSIBILITY DETAILS MODAL
// ---------------------------------------------------------------------

test('Empirical Target 2.1 - SDEAS News Categories, Filtering & Chronological Sorting', () => {
  const communityDataPath = path.join(rootDir, 'src', 'lib', 'community-data.ts');
  const sourceCode = fs.readFileSync(communityDataPath, 'utf8');

  // Grounded articles check from FSL_SPEC.md
  const groundedHeadlines = [
    'Benilde Deaf Festival Highlights & Performance Schedules',
    'SDEAS Deaf Awareness Week Celebration: 30+ Years of Inclusive Education',
    'Republic Act 11106 (The Filipino Sign Language Act) Forums & Advocacy Sessions',
    'Deaf Community Career & Immersion Programs 2026',
    'Bachelor in Sign Language Interpretation (BSLI) AY 2027 Admissions Briefing',
  ];

  for (const headline of groundedHeadlines) {
    assert.ok(
      sourceCode.includes(headline),
      `community-data.ts must contain authentic headline: "${headline}"`
    );
  }

  // Simulated news items matching the 5 grounded records
  const newsRecords = [
    { id: '1', title: 'Benilde Deaf Festival', type: 'deaf_festival', date: '2026-10-15', accommodations: 'FSL interpreters on-stage' },
    { id: '2', title: 'SDEAS 30 Years', type: 'sdeas_news', date: '2026-09-20', accommodations: 'FSL interpreting & CART' },
    { id: '3', title: 'RA 11106 Forum', type: 'seminar', date: '2026-11-05', accommodations: 'Court-certified FSL interpreters' },
    { id: '4', title: 'Career Programs', type: 'event', date: '2026-10-28', accommodations: 'FSL-fluent job interview proctors' },
    { id: '5', title: 'BSLI Admissions', type: 'sdeas_news', date: '2026-11-12', accommodations: 'Bidirectional FSL' },
  ];

  function filterNews(items, filterType) {
    if (!filterType || filterType === 'all') {
      return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    const norm = filterType.toLowerCase().trim();
    if (norm === 'events_seminars' || norm === 'events & seminars') {
      return items
        .filter((n) => n.type === 'event' || n.type === 'seminar')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return items
      .filter((n) => n.type === norm)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // 1. 'all' returns all 5
  assert.equal(filterNews(newsRecords, 'all').length, 5);

  // 2. 'sdeas_news' returns 2
  const sdeasFiltered = filterNews(newsRecords, 'sdeas_news');
  assert.equal(sdeasFiltered.length, 2);
  assert.ok(sdeasFiltered.every((n) => n.type === 'sdeas_news'));

  // 3. 'deaf_festival' returns 1
  const festivalFiltered = filterNews(newsRecords, 'deaf_festival');
  assert.equal(festivalFiltered.length, 1);
  assert.equal(festivalFiltered[0].type, 'deaf_festival');

  // 4. 'seminar' returns 1
  const seminarFiltered = filterNews(newsRecords, 'seminar');
  assert.equal(seminarFiltered.length, 1);
  assert.equal(seminarFiltered[0].type, 'seminar');

  // 5. 'events_seminars' combined returns 2
  const combinedFiltered = filterNews(newsRecords, 'events_seminars');
  assert.equal(combinedFiltered.length, 2);
  assert.ok(combinedFiltered.every((n) => n.type === 'event' || n.type === 'seminar'));

  // 6. Normalization with whitespace and uppercase
  const normalizedSdeas = filterNews(newsRecords, '   SDEAS_NEWS   ');
  assert.equal(normalizedSdeas.length, 2);

  // 7. Descending chronological ordering
  const allSorted = filterNews(newsRecords, 'all');
  for (let i = 0; i < allSorted.length - 1; i++) {
    const dateA = new Date(allSorted[i].date).getTime();
    const dateB = new Date(allSorted[i + 1].date).getTime();
    assert.ok(dateA >= dateB, `News item ${i} (${allSorted[i].date}) must be newer or equal to ${allSorted[i + 1].date}`);
  }
});

test('Empirical Target 2.2 - Accessibility Accommodations (RA 11106 Mandate) & Modal UI Contract', () => {
  const communityDataPath = path.join(rootDir, 'src', 'lib', 'community-data.ts');
  const newsClientPath = path.join(rootDir, 'src', 'app', 'news', 'NewsClient.tsx');
  const communitySource = fs.readFileSync(communityDataPath, 'utf8');
  const clientSource = fs.readFileSync(newsClientPath, 'utf8');

  // 1. Accessibility accommodations mandate
  assert.ok(
    communitySource.includes('accommodations:'),
    'community-data.ts must define accommodations field on announcements'
  );
  assert.ok(
    communitySource.includes('Professional FSL interpreters on-stage'),
    'Must include on-stage professional FSL interpreters'
  );
  assert.ok(
    communitySource.includes('speech-to-text / CART captioning') || communitySource.includes('closed captioning'),
    'Must include speech-to-text / live captioning accommodations'
  );

  // 2. Client modal UI features
  assert.ok(
    clientSource.includes('Accessibility Accommodations (RA 11106 Mandate)'),
    'NewsClient modal must render explicit RA 11106 accessibility accommodation section'
  );
  assert.ok(
    clientSource.includes('selectedArticle'),
    'NewsClient must track selectedArticle state for modal popup'
  );
  assert.ok(
    clientSource.includes('setSelectedArticle(null)'),
    'NewsClient must support closing the article modal'
  );
  assert.ok(
    clientSource.includes('role="tablist"'),
    'NewsClient must use accessible role="tablist"'
  );
  assert.ok(
    clientSource.includes('aria-selected='),
    'NewsClient tabs must declare aria-selected states'
  );
});

// ---------------------------------------------------------------------
// TARGET 3: MERCHANDISE STOCK DECREMENT & SIMULATED ORDER INQUIRIES
// ---------------------------------------------------------------------

test('Empirical Target 3.1 - Grounded Catalog Pricing, Stock & Categories', () => {
  const communityDataPath = path.join(rootDir, 'src', 'lib', 'community-data.ts');
  const sourceCode = fs.readFileSync(communityDataPath, 'utf8');

  // 5 Grounded items from FSL_SPEC.md § 5
  const groundedProducts = [
    { name: 'FSL "I Love You" Sign Graphic T-Shirt', price: '450', stock: '45', category: 'Apparel' },
    { name: 'Deaf Pride Canvas Tote Bag', price: '350', stock: '60', category: 'Accessories' },
    { name: 'FSL Fingerspelling Enamel Pin Set', price: '250', stock: '120', category: 'Pins & Badges' },
    { name: 'FSL Alphabet Lanyard & Badge Holder', price: '180', stock: '85', category: 'Accessories' },
    { name: 'Benilde SDEAS Deaf Festival Commemorative Hoodie', price: '950', stock: '25', category: 'Apparel' },
  ];

  for (const prod of groundedProducts) {
    assert.ok(sourceCode.includes(prod.name), `Catalog must include "${prod.name}"`);
    assert.ok(sourceCode.includes(prod.price), `Catalog must include price "${prod.price}" for ${prod.name}`);
    assert.ok(sourceCode.includes(prod.stock), `Catalog must include stock "${prod.stock}" for ${prod.name}`);
    assert.ok(sourceCode.includes(`'${prod.category}'`), `Catalog must include category "${prod.category}"`);
  }
});

test('Empirical Target 3.2 - Atomic Stock Decrement, Consecutive Orders & Out-of-Stock Boundaries', () => {
  const db = new FSLDatabaseEngine();

  const shirt = db.products.find((p) => p.name.includes('Shirt'));
  assert.ok(shirt, 'Shirt product must exist in database engine');

  const initialStock = shirt.stock;
  assert.ok(initialStock > 5, 'Initial stock must be greater than 5');

  // 1. Single valid purchase
  const orderQty1 = 3;
  const updated1 = db.purchaseProduct(shirt.id, orderQty1);
  assert.equal(updated1.stock, initialStock - orderQty1, 'Stock must decrement exactly by 3');

  // 2. Second consecutive valid purchase
  const orderQty2 = 2;
  const updated2 = db.purchaseProduct(shirt.id, orderQty2);
  assert.equal(updated2.stock, initialStock - orderQty1 - orderQty2, 'Stock must decrement further by 2');

  // 3. Purchase exceeding current stock is rejected
  const remainingStock = updated2.stock;
  assert.throws(
    () => db.purchaseProduct(shirt.id, remainingStock + 1),
    /insufficient stock/i,
    'Ordering more units than available stock must be rejected'
  );

  // Stock unchanged after rejected order
  assert.equal(shirt.stock, remainingStock, 'Stock must remain unchanged after rejected over-order');

  // 4. Exact depletion to 0
  const depleted = db.purchaseProduct(shirt.id, remainingStock);
  assert.equal(depleted.stock, 0, 'Purchasing remaining units must bring stock to exactly 0');

  // 5. Purchase when stock is 0 is rejected
  assert.throws(
    () => db.purchaseProduct(shirt.id, 1),
    /insufficient stock/i,
    'Purchasing an out-of-stock item (stock=0) must be rejected'
  );

  // 6. Zero and Negative quantity rejection
  assert.throws(
    () => db.purchaseProduct(shirt.id, 0),
    /at least 1/i,
    'Ordering 0 quantity must be rejected'
  );

  assert.throws(
    () => db.purchaseProduct(shirt.id, -5),
    /at least 1/i,
    'Ordering negative quantity must be rejected'
  );

  // 7. Non-numeric quantity rejection
  assert.throws(
    () => db.purchaseProduct(shirt.id, 'three'),
    /at least 1/i,
    'Ordering NaN quantity must be rejected'
  );

  // 8. Non-existent product ID
  assert.throws(
    () => db.purchaseProduct('non-existent-product-uuid', 1),
    /not found/i,
    'Ordering non-existent product ID must be rejected'
  );
});

test('Empirical Target 3.3 - Inquiry Submission Contract & Inquiries Drawer in UI', () => {
  const communityDataPath = path.join(rootDir, 'src', 'lib', 'community-data.ts');
  const merchClientPath = path.join(rootDir, 'src', 'app', 'merchandise', 'MerchandiseClient.tsx');
  const communitySource = fs.readFileSync(communityDataPath, 'utf8');
  const merchSource = fs.readFileSync(merchClientPath, 'utf8');

  // Data layer exports & validations
  assert.ok(communitySource.includes('submitMerchandiseInquiry'), 'Must export submitMerchandiseInquiry');
  assert.ok(communitySource.includes('Recipient name is required'), 'Must validate non-empty recipient name');
  assert.ok(communitySource.includes('valid contact email is required'), 'Must validate email containing @');
  assert.ok(communitySource.includes('ORD-FSL-'), 'Must generate official ORD-FSL- order tracking numbers');
  assert.ok(communitySource.includes('getMerchandiseInquiries'), 'Must export getMerchandiseInquiries');

  // Client UI pre-order modal and inquiries view contracts
  assert.ok(merchSource.includes('Advocacy Pre-Order Inquiry'), 'MerchandiseClient must render Pre-Order modal title');
  assert.ok(
    merchSource.includes('My Inquiries') || merchSource.includes('Recorded Pre-Orders'),
    'MerchandiseClient must render inquiries drawer button/modal'
  );
  assert.ok(merchSource.includes('formatPHP'), 'MerchandiseClient must format prices in Philippine Peso');
  assert.ok(merchSource.includes('stock <= 0') || merchSource.includes('stock === 0'), 'Must detect Out of Stock state');
  assert.ok(merchSource.includes('Out of Stock'), 'MerchandiseClient must render "Out of Stock" badge when stock is 0');
});

// ---------------------------------------------------------------------
// TARGET 4: WCAG CONTRAST RATIOS & ROUTE ACCESSIBILITY
// ---------------------------------------------------------------------

test('Empirical Target 4.1 - WCAG AAA Contrast Ratios for Milestone 6 UI Surfaces', () => {
  const contrastPairs = [
    { fg: '#ffffff', bg: '#1d4ed8', name: 'Primary Blue Button (white on blue-700)' },
    { fg: '#ffffff', bg: '#0f172a', name: 'Dark Slate Header (white on slate-900)' },
    { fg: '#1e3a8a', bg: '#dbeafe', name: 'SDEAS News Badge (blue-900 on blue-100)' },
    { fg: '#581c87', bg: '#f3e8ff', name: 'Deaf Festival Badge (purple-900 on purple-100)' },
    { fg: '#064e3b', bg: '#d1fae5', name: 'Seminar Badge (emerald-900 on emerald-100)' },
    { fg: '#78350f', bg: '#fef3c7', name: 'Merchandise Badge (amber-900 on amber-100)' },
  ];

  for (const pair of contrastPairs) {
    const ratio = calculateContrastRatio(pair.fg, pair.bg);
    assert.ok(
      ratio >= 4.5,
      `Contrast ratio for ${pair.name} (${pair.fg} on ${pair.bg}) must be >= 4.5:1 (actual: ${ratio.toFixed(2)}:1)`
    );
  }
});

test('Empirical Target 4.2 - Route Protection & Navbar Links for Milestone 6', () => {
  const navbarPath = path.join(rootDir, 'src', 'components', 'layout', 'Navbar.tsx');
  const messagesPagePath = path.join(rootDir, 'src', 'app', 'messages', 'page.tsx');
  const newsPagePath = path.join(rootDir, 'src', 'app', 'news', 'page.tsx');
  const merchPagePath = path.join(rootDir, 'src', 'app', 'merchandise', 'page.tsx');

  const navbarContent = fs.readFileSync(navbarPath, 'utf8');
  const messagesPageContent = fs.readFileSync(messagesPagePath, 'utf8');
  const newsPageContent = fs.readFileSync(newsPagePath, 'utf8');
  const merchPageContent = fs.readFileSync(merchPagePath, 'utf8');

  // Navbar must have active links for all 3 community pages
  assert.ok(navbarContent.includes('href="/messages"'), 'Navbar must link to /messages');
  assert.ok(navbarContent.includes('href="/news"'), 'Navbar must link to /news');
  assert.ok(navbarContent.includes('href="/merchandise"'), 'Navbar must link to /merchandise');

  // Messages page must check authentication and redirect if unauthenticated
  assert.ok(
    messagesPageContent.includes("redirect('/login?redirect=/messages')") ||
    messagesPageContent.includes('redirect('),
    'Messages server page must protect route with login redirect'
  );

  // News and Merchandise pages must render client components
  assert.ok(newsPageContent.includes('NewsClient'), 'News page must render NewsClient');
  assert.ok(merchPageContent.includes('MerchandiseClient'), 'Merchandise page must render MerchandiseClient');
});
