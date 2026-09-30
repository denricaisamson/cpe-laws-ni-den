// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Empirical Stress Test Suite: Milestone 3 (Admin Operations & Financial Reporting)
// File: tests/stress_milestone3.mjs
// =====================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { FSLDatabaseEngine } from './e2e/harness.js';

test('Empirical Stress 1: Payment Verification Atomicity & State Invariants', () => {
  const db = new FSLDatabaseEngine();

  // Baseline check
  const learner1 = 'learner-1';
  const schedule1 = 's-1';

  // 1. Enroll learner in schedule 1
  const enrollment = db.enrollLearner(learner1, schedule1);
  assert.equal(enrollment.status, 'pending', 'Initial enrollment status must be pending');

  // 2. Submit simulated payment
  const payment = db.submitSimulatedPayment(learner1, enrollment.id, 2500);
  assert.equal(payment.status, 'pending', 'Initial payment status must be pending');
  assert.equal(payment.enrollment_id, enrollment.id);
  assert.equal(payment.amount, 2500);

  // 3. Unauthorized verification attempts
  assert.throws(() => {
    db.adminVerifyPayment('learner-1', payment.id);
  }, /only administrators can verify payments/, 'Learner cannot verify payment');

  assert.throws(() => {
    db.adminVerifyPayment('prof-1', payment.id);
  }, /only administrators can verify payments/, 'Professor cannot verify payment');

  // 4. Verification with invalid payment ID
  assert.throws(() => {
    db.adminVerifyPayment('admin-1', 'invalid-pay-id-999');
  }, /not found/, 'Non-existent payment must throw error');

  // 5. Successful atomic verification by admin
  const verification = db.adminVerifyPayment('admin-1', payment.id);
  assert.equal(verification.payment.status, 'verified', 'Payment status must be verified');
  assert.equal(verification.enrollment.status, 'enrolled', 'Enrollment status must atomically become enrolled');
  assert.equal(enrollment.status, 'enrolled', 'In-memory enrollment object must be enrolled');

  // 6. Adversarial repeat verification: cannot verify an already verified payment
  assert.throws(() => {
    db.adminVerifyPayment('admin-1', payment.id);
  }, /already verified/, 'Re-verifying an already verified payment must throw');

  // 7. Adversarial second payment submission on already verified enrollment
  assert.throws(() => {
    db.submitSimulatedPayment(learner1, enrollment.id, 2500);
  }, /already verified and paid/, 'Cannot submit another payment for an already verified enrollment');

  // 8. Cross-account payment submission attempt
  const enrollment2 = db.enrollLearner('learner-3', 's-1');
  assert.throws(() => {
    db.submitSimulatedPayment('learner-1', enrollment2.id, 2500);
  }, /cannot pay for another user enrollment/, 'Learner cannot submit payment for another user');
});

test('Empirical Stress 2: Multi-Learner Sequential Verification Queue', () => {
  const db = new FSLDatabaseEngine();

  const newLearners = [
    db.registerUser({ name: 'Stress Learner A', email: 'sla@test.ph', role: 'learner' }),
    db.registerUser({ name: 'Stress Learner B', email: 'slb@test.ph', role: 'learner' }),
    db.registerUser({ name: 'Stress Learner C', email: 'slc@test.ph', role: 'learner' }),
  ];

  const payments = [];
  const enrollments = [];

  for (const learner of newLearners) {
    const e = db.enrollLearner(learner.id, 's-1');
    const p = db.submitSimulatedPayment(learner.id, e.id, 2500);
    enrollments.push(e);
    payments.push(p);
  }

  // Verify each payment one by one and ensure only the corresponding enrollment is updated
  for (let i = 0; i < payments.length; i++) {
    const pay = payments[i];
    const enr = enrollments[i];

    assert.equal(pay.status, 'pending');
    assert.equal(enr.status, 'pending');

    const result = db.adminVerifyPayment('admin-1', pay.id);
    assert.equal(result.payment.status, 'verified');
    assert.equal(result.enrollment.status, 'enrolled');
    assert.equal(result.enrollment.id, enr.id);

    // Remaining payments after index i must still be pending
    for (let j = i + 1; j < payments.length; j++) {
      assert.equal(payments[j].status, 'pending', `Payment ${j} should remain pending until verified`);
      assert.equal(enrollments[j].status, 'pending', `Enrollment ${j} should remain pending until verified`);
    }
  }
});

test('Empirical Stress 3: Workshop Creation & Boundary Conditions', () => {
  const db = new FSLDatabaseEngine();

  // Valid creation across Levels 1, 2, 3
  for (const lvl of [1, 2, 3]) {
    const ws = db.createWorkshop('admin-1', {
      level: lvl,
      title: `Stress Workshop Level ${lvl}`,
      fee: lvl * 1000,
      description: `Description for level ${lvl}`,
    });
    assert.equal(ws.level, lvl);
    assert.equal(ws.fee, lvl * 1000);
    assert.ok(ws.id.startsWith('w-'));
  }

  // Free workshop (fee = 0) must be allowed
  const freeWs = db.createWorkshop('admin-1', {
    level: 1,
    title: 'Free Community FSL Taster Session',
    fee: 0,
    description: 'Free introduction to fingerspelling.',
  });
  assert.equal(freeWs.fee, 0);

  // Negative fee must be rejected
  assert.throws(() => {
    db.createWorkshop('admin-1', {
      level: 1,
      title: 'Negative Fee Workshop',
      fee: -100,
    });
  }, /fee must be a non-negative number/);

  // Invalid level boundaries
  for (const badLevel of [0, 4, -1, 99]) {
    assert.throws(() => {
      db.createWorkshop('admin-1', {
        level: badLevel,
        title: `Invalid Level ${badLevel}`,
        fee: 1000,
      });
    }, /Invalid workshop level/);
  }

  // Empty or whitespace title
  assert.throws(() => {
    db.createWorkshop('admin-1', { level: 1, title: '', fee: 1000 });
  }, /title cannot be empty/);

  assert.throws(() => {
    db.createWorkshop('admin-1', { level: 1, title: '    ', fee: 1000 });
  }, /title cannot be empty/);

  // Non-admin authorization
  assert.throws(() => {
    db.createWorkshop('prof-1', { level: 1, title: 'Prof Created Workshop', fee: 1000 });
  }, /only administrators can create workshops/);
});

test('Empirical Stress 4: Schedule Creation, Slot Quotas & Faculty Assignment', () => {
  const db = new FSLDatabaseEngine();

  // Valid schedule creation
  const sch = db.createSchedule('admin-1', {
    workshop_id: 'w-1',
    professor_id: 'prof-1',
    day_time: 'Sundays 08:00 AM - 11:00 AM',
    slots: 25,
    meeting_link: 'https://meet.google.com/test-custom',
  });
  assert.ok(sch.id.startsWith('s-'));
  assert.equal(sch.slots, 25);
  assert.equal(sch.professor_id, 'prof-1');
  assert.equal(sch.meeting_link, 'https://meet.google.com/test-custom');

  // Slot boundaries
  assert.throws(() => {
    db.createSchedule('admin-1', {
      workshop_id: 'w-1',
      professor_id: 'prof-1',
      day_time: 'Sundays 08:00 AM - 11:00 AM',
      slots: 0,
    });
  }, /Slots must be at least 1/);

  assert.throws(() => {
    db.createSchedule('admin-1', {
      workshop_id: 'w-1',
      professor_id: 'prof-1',
      day_time: 'Sundays 08:00 AM - 11:00 AM',
      slots: -10,
    });
  }, /Slots must be at least 1/);

  // Assigning a non-professor role as professor must fail
  assert.throws(() => {
    db.createSchedule('admin-1', {
      workshop_id: 'w-1',
      professor_id: 'learner-1',
      day_time: 'Sundays 08:00 AM - 11:00 AM',
      slots: 10,
    });
  }, /not found or does not have professor role/);

  // Assigning a non-existent professor ID must fail
  assert.throws(() => {
    db.createSchedule('admin-1', {
      workshop_id: 'w-1',
      professor_id: 'non-existent-user-999',
      day_time: 'Sundays 08:00 AM - 11:00 AM',
      slots: 10,
    });
  }, /not found or does not have professor role/);

  // Creating schedule for non-existent workshop must fail
  assert.throws(() => {
    db.createSchedule('admin-1', {
      workshop_id: 'w-non-existent-999',
      professor_id: 'prof-1',
      day_time: 'Sundays 08:00 AM - 11:00 AM',
      slots: 10,
    });
  }, /Workshop "w-non-existent-999" not found/);

  // Non-admin cannot create schedules
  assert.throws(() => {
    db.createSchedule('prof-1', {
      workshop_id: 'w-1',
      professor_id: 'prof-1',
      day_time: 'Sundays 08:00 AM - 11:00 AM',
      slots: 10,
    });
  }, /only administrators can create schedules/);
});

test('Empirical Stress 5: Slot Exhaustion & Quota Integrity', () => {
  const db = new FSLDatabaseEngine();

  // Create a schedule with exactly 2 slots
  const sch = db.createSchedule('admin-1', {
    workshop_id: 'w-1',
    professor_id: 'prof-1',
    day_time: 'Mondays 6:00 PM - 9:00 PM',
    slots: 2,
  });

  // Learner 1 enrolls: slots become 1
  const e1 = db.enrollLearner('learner-1', sch.id);
  assert.equal(sch.slots, 1);
  assert.equal(e1.status, 'pending');

  // Learner 2 enrolls: slots become 0
  const e2 = db.enrollLearner('learner-2', sch.id);
  assert.equal(sch.slots, 0);
  assert.equal(e2.status, 'pending');

  // Learner 3 attempts to enroll when slots = 0: must throw
  assert.throws(() => {
    db.enrollLearner('learner-3', sch.id);
  }, /no available slots remaining/, 'Cannot enroll when slots are exhausted');
});

test('Empirical Stress 6: User Directory Search Filtering & Role Mutations', () => {
  const db = new FSLDatabaseEngine();

  // Search logic verification
  const allProfiles = db.profiles;
  assert.ok(allProfiles.length >= 6);

  // Case-insensitive search simulation matching UsersManagementClient logic
  const searchMatch = (query) => {
    const q = query.toLowerCase().trim();
    return allProfiles.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
  };

  const mariaMatches = searchMatch('maria');
  assert.equal(mariaMatches.length, 1);
  assert.equal(mariaMatches[0].name, 'Maria Santos');

  const gmailMatches = searchMatch('gmail.com');
  assert.equal(gmailMatches.length, 3, 'Should find 3 learners with @gmail.com');

  const emptyMatches = searchMatch('nonexistent-person-xyz');
  assert.equal(emptyMatches.length, 0);

  // Role modification
  const mark = db.getProfile('learner-1');
  assert.equal(mark.role, 'learner');

  // Promote to professor
  mark.role = 'professor';
  assert.equal(db.getProfile('learner-1').role, 'professor');

  // Now Mark can be assigned to a schedule
  const sch = db.createSchedule('admin-1', {
    workshop_id: 'w-1',
    professor_id: 'learner-1',
    day_time: 'Fridays 4:00 PM - 7:00 PM',
    slots: 15,
  });
  assert.equal(sch.professor_id, 'learner-1');

  // Demote back to learner
  mark.role = 'learner';
  assert.equal(db.getProfile('learner-1').role, 'learner');

  // Now assigning Mark to a new schedule must throw
  assert.throws(() => {
    db.createSchedule('admin-1', {
      workshop_id: 'w-1',
      professor_id: 'learner-1',
      day_time: 'Fridays 4:00 PM - 7:00 PM',
      slots: 15,
    });
  }, /not found or does not have professor role/);
});

test('Empirical Stress 7: Financial Analytics & Mathematical Accuracy', () => {
  const db = new FSLDatabaseEngine();

  // 1. Initial financial state check
  const initialSummary = db.getFinancialSummary('admin-1');

  // Calculate ground-truth manual sum from verified payments
  const manualVerifiedSum = db.payments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const manualPendingSum = db.payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  assert.equal(
    initialSummary.totalRevenue,
    manualVerifiedSum,
    'totalRevenue must strictly equal manual sum of verified payments'
  );
  assert.equal(
    initialSummary.pendingRevenue,
    manualPendingSum,
    'pendingRevenue must strictly equal manual sum of pending payments'
  );

  // 2. Sum of revenue by workshops / levels must strictly equal totalRevenue
  const sumOfWorkshopRevenues = initialSummary.breakdown.reduce(
    (sum, b) => sum + b.total_revenue,
    0
  );
  assert.equal(
    sumOfWorkshopRevenues,
    initialSummary.totalRevenue,
    'Sum of individual workshop revenues must equal total verified revenue'
  );

  // 3. Sum of verified transaction counts in breakdown must equal verifiedCount
  const sumOfWorkshopTransactions = initialSummary.breakdown.reduce(
    (sum, b) => sum + b.verified_transactions,
    0
  );
  assert.equal(
    sumOfWorkshopTransactions,
    initialSummary.verifiedCount,
    'Sum of breakdown verified transactions must equal overall verifiedCount'
  );

  // 4. Dynamic transaction verification & revenue update
  // Add a new enrollment & pending payment
  const enrollment = db.enrollLearner('learner-1', 's-1');
  const payment = db.submitSimulatedPayment('learner-1', enrollment.id, 2500);

  const preVerifySummary = db.getFinancialSummary('admin-1');
  assert.equal(preVerifySummary.totalRevenue, initialSummary.totalRevenue);
  assert.equal(preVerifySummary.pendingRevenue, initialSummary.pendingRevenue + 2500);
  assert.equal(preVerifySummary.pendingCount, initialSummary.pendingCount + 1);

  // Verify the payment
  db.adminVerifyPayment('admin-1', payment.id);

  const postVerifySummary = db.getFinancialSummary('admin-1');
  assert.equal(
    postVerifySummary.totalRevenue,
    initialSummary.totalRevenue + 2500,
    'totalRevenue must increase by exactly 2500 after payment verification'
  );
  assert.equal(
    postVerifySummary.pendingRevenue,
    initialSummary.pendingRevenue,
    'pendingRevenue must decrease by 2500 back to original'
  );
  assert.equal(postVerifySummary.verifiedCount, initialSummary.verifiedCount + 1);

  // Verify breakdown also updated
  const w1Breakdown = postVerifySummary.breakdown.find((b) => b.workshop_id === 'w-1');
  assert.ok(w1Breakdown);
  assert.equal(
    w1Breakdown.total_revenue,
    2500,
    'Workshop w-1 must now reflect ₱2,500 verified revenue'
  );
  assert.equal(w1Breakdown.verified_transactions, 1);

  // Check sum of workshops still strictly equals totalRevenue
  const updatedSumWorkshops = postVerifySummary.breakdown.reduce(
    (sum, b) => sum + b.total_revenue,
    0
  );
  assert.equal(updatedSumWorkshops, postVerifySummary.totalRevenue);
});
