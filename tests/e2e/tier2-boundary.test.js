/**
 * Tier 2: Boundary & Corner Cases
 * 
 * Exercises edge conditions, adversarial inputs, encoding integrity,
 * authorization barriers, state machine invariants, and resource constraints.
 */

import assert from 'node:assert/strict';
import {
  FSLDatabaseEngine,
  VIDEO_CATEGORIES,
} from './harness.js';

export const tier2Tests = [];

function registerTest(name, fn) {
  tier2Tests.push({ name, fn });
}

// -----------------------------------------------------------------------------
// Test 2.1: Empty Input Handling & Whitespace Trimming
// -----------------------------------------------------------------------------
registerTest('Tier 2.1 - Empty & Whitespace Input: Prevents empty registrations, workshops, and messages', async () => {
  const db = new FSLDatabaseEngine();

  // Empty user name
  assert.throws(
    () => db.registerUser({ name: '   ', email: 'test@example.com', role: 'learner' }),
    /name cannot be empty/i
  );

  // Invalid email
  assert.throws(
    () => db.registerUser({ name: 'John Doe', email: 'invalid-email', role: 'learner' }),
    /valid email is required/i
  );

  // Blank message body
  assert.throws(
    () => db.sendMessage('learner-1', 'prof-1', '   \n  \t '),
    /message body cannot be empty/i
  );

  // Blank workshop title
  assert.throws(
    () => db.createWorkshop('admin-1', { level: 1, title: '  ', fee: 2000, description: 'Test' }),
    /title cannot be empty/i
  );
});

// -----------------------------------------------------------------------------
// Test 2.2: Extreme String Lengths, Unicode & Filipino FSL Notation
// -----------------------------------------------------------------------------
registerTest('Tier 2.2 - Unicode, Tagalog & FSL Notation: Handles diacritics, sign emojis and long descriptions', async () => {
  const db = new FSLDatabaseEngine();

  // Filipino Sign Language gloss notation with sign emoji and diacritics:
  // "MABUHAY! 🤟 Kumusta kayó? [INDEX-1 WANT LEARN FSL]"
  const fslTitle = 'FSL 101: Pagbati at Pagpapakilala 🤟 (Mabuhay & Kumusta kayó?)';
  const longDescription = 'A'.repeat(3000) + ' [FSL-GLOSS: DEAF-COMMUNITY-SUPPORT]';

  const workshop = db.createWorkshop('admin-1', {
    level: 1,
    title: fslTitle,
    fee: 2500,
    description: longDescription,
  });

  assert.equal(workshop.title, fslTitle);
  assert.equal(workshop.description.length, 3036);
  assert.ok(workshop.description.includes('🤟') || workshop.title.includes('🤟'));
});

// -----------------------------------------------------------------------------
// Test 2.3: Adversarial Input & XSS Escaping Integrity
// -----------------------------------------------------------------------------
registerTest('Tier 2.3 - Adversarial & XSS Payload Handling: Safely handles HTML/script tags as string data', async () => {
  const db = new FSLDatabaseEngine();
  const xssPayload = '<script>alert("XSS-ATTACK")</script><img src=x onerror=alert(1)>';

  // Sending message with XSS payload
  const msg = db.sendMessage('learner-1', 'prof-1', xssPayload);
  assert.equal(msg.body, xssPayload, 'Payload should be preserved literally without code execution');

  // Thread retrieval returns literal text
  const thread = db.getMessageThread('learner-1', 'prof-1');
  const found = thread.find((m) => m.id === msg.id);
  assert.equal(found.body, xssPayload);
});

// -----------------------------------------------------------------------------
// Test 2.4: Numerical Boundary: Zero & Negative Values
// -----------------------------------------------------------------------------
registerTest('Tier 2.4 - Numerical Boundary: Rejects negative fees, zero payment amounts & invalid grades', async () => {
  const db = new FSLDatabaseEngine();

  // Negative workshop fee
  assert.throws(
    () => db.createWorkshop('admin-1', { level: 1, title: 'Invalid Workshop', fee: -500 }),
    /fee must be a non-negative number/i
  );

  // Workshop with zero fee (scholarship/free intro) is permitted
  const freeWorkshop = db.createWorkshop('admin-1', { level: 1, title: 'Free FSL Intro', fee: 0 });
  assert.equal(freeWorkshop.fee, 0);

  // Learner 1 enrolls in schedule s-1
  const testEnrollment = db.enrollLearner('learner-1', 's-1');

  // Zero payment submission rejected
  assert.throws(
    () => db.submitSimulatedPayment('learner-1', testEnrollment.id, 0),
    /amount must be greater than 0/i
  );

  // Negative payment submission rejected
  assert.throws(
    () => db.submitSimulatedPayment('learner-1', testEnrollment.id, -100),
    /amount must be greater than 0/i
  );

  // Cross-user payment attempt rejected
  assert.throws(
    () => db.submitSimulatedPayment('learner-1', 'e-1', 1000),
    /cannot pay for another user enrollment/i
  );

  // Grade out of bounds (< 0 or > 100)
  assert.throws(
    () => db.gradeSubmission('prof-2', 'sub-1', { grade: -5, feedback: 'Negative' }),
    /between 0 and 100/i
  );
  assert.throws(
    () => db.gradeSubmission('prof-2', 'sub-1', { grade: 105, feedback: 'Over 100' }),
    /between 0 and 100/i
  );
});

// -----------------------------------------------------------------------------
// Test 2.5: Slot Capacity & Zero Remaining Slots Boundary
// -----------------------------------------------------------------------------
registerTest('Tier 2.5 - Slot Capacity: Rejects enrollment when schedule slots reach 0', async () => {
  const db = new FSLDatabaseEngine();

  // Create a schedule with exactly 1 slot
  const tinySchedule = db.createSchedule('admin-1', {
    workshop_id: 'w-1',
    professor_id: 'prof-1',
    day_time: 'Friday 6:00 PM',
    slots: 1,
  });

  // First learner enrolls -> slots become 0
  const enrollment1 = db.enrollLearner('learner-1', tinySchedule.id);
  assert.equal(enrollment1.status, 'pending');
  assert.equal(tinySchedule.slots, 0);

  // Second learner attempts to enroll -> must be rejected
  assert.throws(
    () => db.enrollLearner('learner-2', tinySchedule.id),
    /no available slots remaining/i
  );
});

// -----------------------------------------------------------------------------
// Test 2.6: Role-Based Access Barriers (Privilege Escalation Prevention)
// -----------------------------------------------------------------------------
registerTest('Tier 2.6 - Authorization Boundaries: Prevents unauthorized privilege escalation', async () => {
  const db = new FSLDatabaseEngine();

  // Learner attempts to create a workshop
  assert.throws(
    () => db.createWorkshop('learner-1', { level: 1, title: 'Hacked Workshop', fee: 1000 }),
    /only administrators/i
  );

  // Learner attempts to verify payment
  assert.throws(
    () => db.adminVerifyPayment('learner-1', 'pay-1'),
    /only administrators/i
  );

  // Learner attempts to view admin financial reports
  assert.throws(
    () => db.getFinancialSummary('learner-1'),
    /only administrators/i
  );

  // Professor attempts to view admin financial reports
  assert.throws(
    () => db.getFinancialSummary('prof-1'),
    /only administrators/i
  );
});

// -----------------------------------------------------------------------------
// Test 2.7: Cross-Professor Schedule Isolation
// -----------------------------------------------------------------------------
registerTest('Tier 2.7 - Professor Isolation: Prevents professor A from modifying professor B classes', async () => {
  const db = new FSLDatabaseEngine();

  // Schedule s-2 is assigned to prof-2
  const schedule2 = db.schedules.find((s) => s.id === 's-2');
  assert.equal(schedule2.professor_id, 'prof-2');

  // Prof-1 attempts to change Prof-2's meeting link
  assert.throws(
    () => db.updateMeetingLink('prof-1', 's-2', 'https://malicious.link'),
    /only the assigned professor or admin/i
  );

  // Prof-1 attempts to create assignment for Prof-2's schedule
  assert.throws(
    () => db.createAssignment('prof-1', 's-2', { title: 'Unauthorized Quiz' }),
    /only assigned professor or admin/i
  );

  // Prof-1 attempts to record attendance for Prof-2's schedule
  assert.throws(
    () => db.recordAttendance('prof-1', 's-2', 'e-1', '2026-09-28', true),
    /only assigned professor or admin/i
  );
});

// -----------------------------------------------------------------------------
// Test 2.8: Invalid State Machine Transitions
// -----------------------------------------------------------------------------
registerTest('Tier 2.8 - State Machine Invariants: Prevents double verification and duplicate enrollments', async () => {
  const db = new FSLDatabaseEngine();

  // Payment pay-1 is already verified
  assert.throws(
    () => db.adminVerifyPayment('admin-1', 'pay-1'),
    /already verified/i
  );

  // Learner-2 is already enrolled in schedule s-2 (enrollment e-1)
  assert.throws(
    () => db.enrollLearner('learner-2', 's-2'),
    /already enrolled or pending/i
  );

  // Non-existent payment verification
  assert.throws(
    () => db.adminVerifyPayment('admin-1', 'non-existent-pay-id'),
    /not found/i
  );
});

// -----------------------------------------------------------------------------
// Test 2.9: Strict Video Category Validation
// -----------------------------------------------------------------------------
registerTest('Tier 2.9 - Video Category Validation: Rejects ungrounded or misspelled categories', async () => {
  const db = new FSLDatabaseEngine();

  // Valid category succeeds
  const validVid = db.uploadVideo('prof-1', {
    level: 1,
    title: 'Fingerspelling Practice',
    category: 'Alphabet / Fingerspelling',
    video_url: 'https://storage.fsl.ph/v.mp4',
  });
  assert.ok(validVid.id);

  // Invalid category (e.g. "Random Signing" or typo "Basic Greeting")
  assert.throws(
    () =>
      db.uploadVideo('prof-1', {
        level: 1,
        title: 'Random Signs',
        category: 'Random Signing',
        video_url: 'https://storage.fsl.ph/v.mp4',
      }),
    /invalid video category/i
  );

  // Invalid workshop level (e.g. level 4)
  assert.throws(
    () =>
      db.uploadVideo('prof-1', {
        level: 4,
        title: 'Level 4 Video',
        category: 'Basic Greetings',
        video_url: 'https://storage.fsl.ph/v.mp4',
      }),
    /invalid video level/i
  );
});

// -----------------------------------------------------------------------------
// Test 2.10: Merchandise Stock Depletion & Zero Stock Boundary
// -----------------------------------------------------------------------------
registerTest('Tier 2.10 - Merchandise Stock Boundary: Handles stock depletion and "Out of Stock" state', async () => {
  const db = new FSLDatabaseEngine();

  // Find a product and purchase its exact stock
  const product = db.products.find((p) => p.id === 'prod-2');
  const initialStock = product.stock;
  assert.ok(initialStock > 0);

  // Purchase all stock
  db.purchaseProduct('prod-2', initialStock);
  assert.equal(product.stock, 0, 'Stock should reach exactly 0');

  // Attempt to purchase 1 more when stock is 0
  assert.throws(
    () => db.purchaseProduct('prod-2', 1),
    /insufficient stock/i
  );
});

// -----------------------------------------------------------------------------
// Test 2.11: Non-Existent Entities & Null Handling
// -----------------------------------------------------------------------------
registerTest('Tier 2.11 - Non-Existent Entity Handling: Graceful errors for missing entities', async () => {
  const db = new FSLDatabaseEngine();

  // Missing profile
  assert.equal(db.getProfile('ghost-id'), null);

  // Missing schedule for enrollment
  assert.throws(
    () => db.enrollLearner('learner-1', 'missing-schedule-id'),
    /schedule.*not found/i
  );

  // Missing assignment for submission
  assert.throws(
    () => db.submitAssignment('learner-2', 'missing-assignment-id', { file_url: 'http://test.com' }),
    /assignment.*not found/i
  );
});
