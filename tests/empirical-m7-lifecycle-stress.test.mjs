// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Empirical Lifecycle Stress Test Suite: Milestone 7
// (Adversarial Probing of End-to-End Journey & Boundary Conditions)
// File: tests/empirical-m7-lifecycle-stress.test.mjs
// =====================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { FSLDatabaseEngine } from './e2e/harness.js';

// ---------------------------------------------------------------------
// TARGET 1: LEARNER CHECKOUT & SECTION QUOTA ADVERSARIAL PROBING
// ---------------------------------------------------------------------
test('Target 1 - Learner Checkout: Nominal flow, slot decrement, duplicate rejection, and adversarial payments', () => {
  const db = new FSLDatabaseEngine();

  // 1. Nominal learner registration
  const learner = db.registerUser({
    name: 'Rico Blanco',
    email: 'rico.blanco@gmail.com',
    role: 'learner',
  });
  assert.ok(learner.id, 'Learner ID must exist');
  assert.equal(learner.role, 'learner');

  // 2. Select Level 1 schedule s-1 (Prof Juan Dela Cruz)
  const sched = db.schedules.find((s) => s.id === 's-1');
  assert.ok(sched, 'Schedule s-1 must exist');
  const initialSlots = sched.slots;

  // 3. Nominal Enrollment
  const enr = db.enrollLearner(learner.id, sched.id);
  assert.equal(enr.status, 'pending', 'Status must be pending');
  assert.equal(sched.slots, initialSlots - 1, 'Slots must decrement by 1');

  // 4. Nominal Payment
  const pay = db.submitSimulatedPayment(learner.id, enr.id, 2500);
  assert.equal(pay.status, 'pending');
  assert.equal(pay.amount, 2500);

  // --- Adversarial Payment Probing ---
  // A. Zero payment amount
  assert.throws(() => {
    db.submitSimulatedPayment(learner.id, enr.id, 0);
  }, /greater than 0/i, 'Payment of 0 must be rejected');

  // B. Negative payment amounts
  assert.throws(() => {
    db.submitSimulatedPayment(learner.id, enr.id, -2500);
  }, /greater than 0/i, 'Negative payment must be rejected');

  assert.throws(() => {
    db.submitSimulatedPayment(learner.id, enr.id, -0.01);
  }, /greater than 0/i, 'Fractional negative payment must be rejected');

  // C. Non-numeric payment amounts
  assert.throws(() => {
    db.submitSimulatedPayment(learner.id, enr.id, 'free');
  }, /greater than 0/i, 'String payment amount must be rejected');

  assert.throws(() => {
    db.submitSimulatedPayment(learner.id, enr.id, NaN);
  }, /greater than 0/i, 'NaN payment amount must be rejected');

  // --- Duplicate Enrollment Probing ---
  assert.throws(() => {
    db.enrollLearner(learner.id, sched.id);
  }, /already enrolled or pending/i, 'Duplicate enrollment in same schedule must be blocked');

  // --- Cross-Learner Payment Hijack Probing ---
  const bystander = db.registerUser({
    name: 'Bystander Ben',
    email: 'ben.bystander@gmail.com',
    role: 'learner',
  });
  assert.throws(() => {
    db.submitSimulatedPayment(bystander.id, enr.id, 2500);
  }, /cannot pay for another user/i, 'Learner cannot pay for another learner enrollment');

  // --- Slot Exhaustion Probing ---
  const tinySched = db.createSchedule('admin-1', {
    workshop_id: 'w-1',
    professor_id: 'prof-1',
    day_time: 'Thursdays 5:00 PM - 8:00 PM',
    slots: 1,
    meeting_link: 'https://meet.google.com/test-tiny',
  });
  assert.equal(tinySched.slots, 1);

  const learnerA = db.registerUser({
    name: 'Slot Winner',
    email: 'winner@gmail.com',
    role: 'learner',
  });
  db.enrollLearner(learnerA.id, tinySched.id);
  assert.equal(tinySched.slots, 0, 'Slots must now be 0');

  const learnerB = db.registerUser({
    name: 'Slot Loser',
    email: 'loser@gmail.com',
    role: 'learner',
  });
  assert.throws(() => {
    db.enrollLearner(learnerB.id, tinySched.id);
  }, /no available slots/i, 'Exhausted schedule must reject enrollment');

  // --- Non-existent schedule probing ---
  assert.throws(() => {
    db.enrollLearner(learner.id, 's-nonexistent');
  }, /not found/i, 'Non-existent schedule must throw error');
});

// ---------------------------------------------------------------------
// TARGET 2: ADMIN PAYMENT VERIFICATION & ATOMIC SYNCHRONIZATION
// ---------------------------------------------------------------------
test('Target 2 - Admin Payment Verification: Role isolation, atomic transitions, ledger balance, and idempotent gating', () => {
  const db = new FSLDatabaseEngine();

  const learner = db.registerUser({
    name: 'Grace Poe',
    email: 'grace.poe@gmail.com',
    role: 'learner',
  });
  const sched = db.schedules[0];
  const enr = db.enrollLearner(learner.id, sched.id);
  const pay = db.submitSimulatedPayment(learner.id, enr.id, 2500);

  // Snapshot ledger before verification
  const financeBefore = db.getFinancialSummary('admin-1');

  // 1. Role enforcement: non-admins cannot verify
  assert.throws(() => {
    db.adminVerifyPayment('prof-1', pay.id);
  }, /only administrators can verify/i, 'Professor cannot verify payment');

  assert.throws(() => {
    db.adminVerifyPayment('prof-2', pay.id);
  }, /only administrators can verify/i, 'Professor 2 cannot verify payment');

  assert.throws(() => {
    db.adminVerifyPayment(learner.id, pay.id);
  }, /only administrators can verify/i, 'Learner cannot self-verify payment');

  assert.throws(() => {
    db.adminVerifyPayment('non-existent-user', pay.id);
  }, /only administrators can verify/i, 'Unknown user cannot verify payment');

  // 2. Non-existent payment verification
  assert.throws(() => {
    db.adminVerifyPayment('admin-1', 'pay-fake-999');
  }, /not found/i, 'Missing payment ID must throw');

  // 3. Legitimate Admin Verification -> Atomic State Update
  const { payment: verifiedPay, enrollment: updatedEnr } = db.adminVerifyPayment('admin-1', pay.id);
  assert.equal(verifiedPay.status, 'verified', 'Payment status must be verified');
  assert.equal(updatedEnr.status, 'enrolled', 'Enrollment status must transition from pending to enrolled');
  assert.equal(updatedEnr.id, enr.id);

  // 4. Invariant: Double verification prevented
  assert.throws(() => {
    db.adminVerifyPayment('admin-1', pay.id);
  }, /already verified/i, 'Verifying an already verified payment must throw');

  // 5. Invariant: Cannot submit new payment for already verified enrollment
  assert.throws(() => {
    db.submitSimulatedPayment(learner.id, enr.id, 2500);
  }, /already verified and paid/i, 'Duplicate payment on verified enrollment must throw');

  // 6. Ledger Reconciliation
  const financeAfter = db.getFinancialSummary('admin-1');
  assert.equal(financeAfter.totalRevenue, financeBefore.totalRevenue + 2500, 'Total revenue must reflect addition');
  assert.equal(financeAfter.pendingRevenue, financeBefore.pendingRevenue - 2500, 'Pending revenue must reflect subtraction');
  assert.equal(financeAfter.verifiedCount, financeBefore.verifiedCount + 1, 'Verified count must increment');
  assert.equal(financeAfter.pendingCount, financeBefore.pendingCount - 1, 'Pending count must decrement');
});

// ---------------------------------------------------------------------
// TARGET 3: PROFESSOR ATTENDANCE UPDATES & ISOLATION BOUNDARIES
// ---------------------------------------------------------------------
test('Target 3 - Professor Attendance: Present, absent, late, excused, upsert updates, and cross-professor isolation', () => {
  const db = new FSLDatabaseEngine();

  // Setup verified learner enrolled in prof-1 schedule s-1
  const learner = db.registerUser({
    name: 'Bea Alonzo',
    email: 'bea.alonzo@gmail.com',
    role: 'learner',
  });
  const schedId = 's-1';
  const enr = db.enrollLearner(learner.id, schedId);
  const pay = db.submitSimulatedPayment(learner.id, enr.id, 2500);
  db.adminVerifyPayment('admin-1', pay.id);
  assert.equal(enr.status, 'enrolled');

  // 1. Session 1: Present with remarks
  const rec1 = db.recordAttendance(
    'prof-1',
    schedId,
    enr.id,
    '2026-10-01',
    true,
    'present: active participation in manual alphabet drills'
  );
  assert.equal(rec1.present, true);
  assert.equal(rec1.date, '2026-10-01');
  assert.ok(rec1.remarks.includes('present: active participation'));

  // 2. Session 2: Absent with remarks
  const rec2 = db.recordAttendance(
    'prof-1',
    schedId,
    enr.id,
    '2026-10-08',
    false,
    'absent: unexcused absence'
  );
  assert.equal(rec2.present, false);
  assert.ok(rec2.remarks.includes('absent: unexcused'));

  // 3. Session 3: Late (present = true with late remarks)
  const rec3 = db.recordAttendance(
    'prof-1',
    schedId,
    enr.id,
    '2026-10-15',
    true,
    'late: logged in 25 minutes after start'
  );
  assert.equal(rec3.present, true);
  assert.ok(rec3.remarks.includes('late: logged in 25 minutes'));

  // 4. Session 4: Excused (present = false with excused remarks)
  const rec4 = db.recordAttendance(
    'prof-1',
    schedId,
    enr.id,
    '2026-10-22',
    false,
    'excused: medical certificate submitted'
  );
  assert.equal(rec4.present, false);
  assert.ok(rec4.remarks.includes('excused: medical certificate'));

  // 5. Rectification / Upsert Test: Change Session 2 from absent to present (excused late)
  const initialAttCount = db.attendance.length;
  const updatedRec2 = db.recordAttendance(
    'prof-1',
    schedId,
    enr.id,
    '2026-10-08',
    true,
    'excused late: rectified after technical review of connection logs'
  );
  assert.equal(updatedRec2.id, rec2.id, 'Must update existing record rather than create a duplicate');
  assert.equal(updatedRec2.present, true);
  assert.ok(updatedRec2.remarks.includes('rectified'));
  assert.equal(db.attendance.length, initialAttCount, 'Total attendance record count must remain identical');

  // --- Adversarial & Isolation Probing ---
  // A. Cross-professor isolation: Prof 2 cannot record attendance for Prof 1
  assert.throws(() => {
    db.recordAttendance('prof-2', schedId, enr.id, '2026-10-29', true, 'unauthorized attempt');
  }, /only assigned professor or admin/i, 'Unauthorized professor cannot take attendance');

  // B. Attendance on pending learner rejected
  const pendingLearner = db.registerUser({
    name: 'Pending Pete',
    email: 'pete.pending@gmail.com',
    role: 'learner',
  });
  const pendingEnr = db.enrollLearner(pendingLearner.id, schedId);
  assert.equal(pendingEnr.status, 'pending');
  assert.throws(() => {
    db.recordAttendance('prof-1', schedId, pendingEnr.id, '2026-10-29', true);
  }, /cannot take attendance for learner with status "pending"/i, 'Cannot record attendance for pending student');

  // C. Empty date string rejected
  assert.throws(() => {
    db.recordAttendance('prof-1', schedId, enr.id, '   ', true);
  }, /date is required/i, 'Blank session date must be rejected');

  // D. Admin override allowed
  const adminRec = db.recordAttendance(
    'admin-1',
    schedId,
    enr.id,
    '2026-10-29',
    true,
    'present: verified by administrative observer'
  );
  assert.equal(adminRec.present, true);
});

// ---------------------------------------------------------------------
// TARGET 4: PROFESSOR ASSIGNMENT CREATION & GUIDELINE REQUIREMENTS
// ---------------------------------------------------------------------
test('Target 4 - Professor Assignment Creation: Rich rubrics, due dates, empty title rejection, and authorization', () => {
  const db = new FSLDatabaseEngine();
  const schedId = 's-1';

  // 1. Prof-1 creates assignment with detailed rubric
  const rubricText = `RUBRIC & EVALUATION CRITERIA:
1. Handshape Precision (30%): Distinct finger formation, thumb placement, and knuckle flexion.
2. Sign Space & Movement (30%): Adherence to neutral signing frame; fluid movement between transitions.
3. Non-Manual Signals & Facial Grammar (25%): Eyebrow markers for WH/Yes-No questions; appropriate mouth morphemes.
4. Fluency & Rhythm (15%): Natural pausing without stuttering or false starts.`;

  const asg = db.createAssignment('prof-1', schedId, {
    title: 'Midterm Signing Video: Everyday Dialogue & Directional Verbs',
    description: rubricText,
    due_date: '2026-11-15T23:59:59Z',
  });

  assert.ok(asg.id, 'Assignment ID must be generated');
  assert.equal(asg.schedule_id, schedId);
  assert.ok(asg.title.includes('Midterm Signing Video'));
  assert.ok(asg.description.includes('RUBRIC & EVALUATION CRITERIA'));
  assert.ok(asg.description.includes('Non-Manual Signals & Facial Grammar'));
  assert.equal(asg.due_date, '2026-11-15T23:59:59Z');

  // --- Adversarial Probing ---
  // A. Empty title
  assert.throws(() => {
    db.createAssignment('prof-1', schedId, {
      title: '   ',
      description: 'Some rubric',
    });
  }, /title cannot be empty/i, 'Empty assignment title must be rejected');

  // B. Cross-professor assignment creation blocked
  assert.throws(() => {
    db.createAssignment('prof-2', schedId, {
      title: 'Hacked Assignment',
      description: 'Intrusion test',
    });
  }, /only assigned professor or admin/i, 'Unassigned professor cannot create assignments');

  // C. Non-existent schedule
  assert.throws(() => {
    db.createAssignment('prof-1', 's-missing-404', {
      title: 'Orphan Assignment',
      description: 'Orphan rubric',
    });
  }, /not found/i, 'Assignment for non-existent schedule must throw');
});

// ---------------------------------------------------------------------
// TARGET 5: LEARNER VIDEO SUBMISSION & PRE-GRADING RE-SUBMISSION
// ---------------------------------------------------------------------
test('Target 5 - Learner Video Submission: Video URLs, pre-grading re-submission, blank rejection, and access gating', () => {
  const db = new FSLDatabaseEngine();

  const learner = db.registerUser({
    name: 'Sarah Geronimo',
    email: 'sarah.g@gmail.com',
    role: 'learner',
  });
  const schedId = 's-1';
  const enr = db.enrollLearner(learner.id, schedId);
  const pay = db.submitSimulatedPayment(learner.id, enr.id, 2500);
  db.adminVerifyPayment('admin-1', pay.id);

  const asg = db.createAssignment('prof-1', schedId, {
    title: 'Self-Introduction Video in FSL',
    description: 'Record yourself signing name, age, hometown, and hobbies in FSL.',
    due_date: '2026-11-20T23:59:59Z',
  });

  // 1. Initial Submission
  const initialUrl = 'https://storage.fsl.ph/submissions/sarah-intro-v1.mp4';
  const sub1 = db.submitAssignment(learner.id, asg.id, { file_url: initialUrl });
  assert.ok(sub1.id);
  assert.equal(sub1.assignment_id, asg.id);
  assert.equal(sub1.learner_id, learner.id);
  assert.equal(sub1.file_url, initialUrl);
  assert.equal(sub1.grade, null, 'Initial grade must be null');
  assert.equal(sub1.feedback, null, 'Initial feedback must be null');

  // 2. Pre-grading Re-submission: Learner realizes camera angle was off and resubmits
  const updatedUrl = 'https://storage.fsl.ph/submissions/sarah-intro-v2-fixed-lighting.mp4';
  const sub2 = db.submitAssignment(learner.id, asg.id, { file_url: updatedUrl });
  assert.equal(sub2.id, sub1.id, 'Re-submission must update existing record ID, not duplicate');
  assert.equal(sub2.file_url, updatedUrl, 'File URL must be updated');
  assert.equal(sub2.grade, null, 'Grade remains null');

  // Verify only 1 submission exists for this learner & assignment
  const learnerSubs = db.submissions.filter(
    (s) => s.assignment_id === asg.id && s.learner_id === learner.id
  );
  assert.equal(learnerSubs.length, 1, 'Must have exactly 1 submission record');

  // --- Adversarial Submission Probing ---
  // A. Blank URL
  assert.throws(() => {
    db.submitAssignment(learner.id, asg.id, { file_url: '' });
  }, /file or video URL is required/i, 'Empty file URL must be rejected');

  // B. Whitespace URL
  assert.throws(() => {
    db.submitAssignment(learner.id, asg.id, { file_url: '     ' });
  }, /file or video URL is required/i, 'Whitespace file URL must be rejected');

  // C. Non-enrolled learner submission
  const outsider = db.registerUser({
    name: 'Outsider Oliver',
    email: 'oliver.outsider@gmail.com',
    role: 'learner',
  });
  assert.throws(() => {
    db.submitAssignment(outsider.id, asg.id, { file_url: 'https://youtube.com/watch?v=sample' });
  }, /not currently enrolled/i, 'Non-enrolled learner submission must be rejected');

  // D. Non-existent assignment
  assert.throws(() => {
    db.submitAssignment(learner.id, 'asg-missing', { file_url: 'https://youtube.com/watch?v=sample' });
  }, /not found/i, 'Non-existent assignment submission must throw');
});

// ---------------------------------------------------------------------
// TARGET 6: PROFESSOR GRADING BOUNDARIES & LINGUISTIC FEEDBACK
// ---------------------------------------------------------------------
test('Target 6 - Professor Grading: Boundaries [0, 100], invalid rejections, feedback preservation, and isolation', () => {
  const db = new FSLDatabaseEngine();

  const learner = db.registerUser({
    name: 'Dingdong Dantes',
    email: 'dingdong@gmail.com',
    role: 'learner',
  });
  const schedId = 's-1';
  const enr = db.enrollLearner(learner.id, schedId);
  const pay = db.submitSimulatedPayment(learner.id, enr.id, 2500);
  db.adminVerifyPayment('admin-1', pay.id);

  const asg = db.createAssignment('prof-1', schedId, {
    title: 'Classifier Demonstration: Vehicles and Moving Objects',
    description: 'Demonstrate vehicle 3-classifier, person 1-classifier, and directional collision verbs.',
    due_date: '2026-11-25T23:59:59Z',
  });

  const sub = db.submitAssignment(learner.id, asg.id, {
    file_url: 'https://storage.fsl.ph/submissions/dingdong-classifiers.mp4',
  });

  // 1. Lower Boundary 0: Valid score (cannot be rejected by falsy `if (!grade)`)
  const gradeZeroFeedback = 'Video file corrupted or blank screen submitted. Score is 0. Please request re-submission.';
  const gradedZero = db.gradeSubmission('prof-1', sub.id, {
    grade: 0,
    feedback: gradeZeroFeedback,
  });
  assert.equal(gradedZero.grade, 0, 'Grade 0 must be accepted');
  assert.equal(gradedZero.feedback, gradeZeroFeedback);

  // 2. Upper Boundary 100: Valid score
  const perfectFeedback = 'Masterful demonstration! Exemplary handshape orientation and facial grammar.';
  const graded100 = db.gradeSubmission('prof-1', sub.id, {
    grade: 100,
    feedback: perfectFeedback,
  });
  assert.equal(graded100.grade, 100, 'Grade 100 must be accepted');
  assert.equal(graded100.feedback, perfectFeedback);

  // 3. Realistic Mid-range Grade (96) with Linguistic Feedback
  const linguisticFeedback =
    'Feedback: Outstanding use of the 3-classifier for car overtaking. Notice your non-manual markers: tighten your lips for tight turns. Minor fingerspelling hesitation on model name.';
  const graded96 = db.gradeSubmission('prof-1', sub.id, {
    grade: 96,
    feedback: linguisticFeedback,
  });
  assert.equal(graded96.grade, 96);
  assert.equal(graded96.feedback, linguisticFeedback);

  // --- Adversarial Grading Probing ---
  // A. Negative score (-1)
  assert.throws(() => {
    db.gradeSubmission('prof-1', sub.id, { grade: -1, feedback: 'Negative' });
  }, /between 0 and 100/i, 'Grade < 0 must be rejected');

  // B. Large negative score (-100)
  assert.throws(() => {
    db.gradeSubmission('prof-1', sub.id, { grade: -100, feedback: 'Negative' });
  }, /between 0 and 100/i, 'Grade -100 must be rejected');

  // C. Overflow score (101)
  assert.throws(() => {
    db.gradeSubmission('prof-1', sub.id, { grade: 101, feedback: 'Over limit' });
  }, /between 0 and 100/i, 'Grade > 100 must be rejected');

  // D. Large overflow score (250)
  assert.throws(() => {
    db.gradeSubmission('prof-1', sub.id, { grade: 250, feedback: 'Over limit' });
  }, /between 0 and 100/i, 'Grade 250 must be rejected');

  // E. Non-numeric grade
  assert.throws(() => {
    db.gradeSubmission('prof-1', sub.id, { grade: 'A_PLUS', feedback: 'Letter' });
  }, /between 0 and 100/i, 'String grade must be rejected');

  assert.throws(() => {
    db.gradeSubmission('prof-1', sub.id, { grade: NaN, feedback: 'NaN' });
  }, /between 0 and 100/i, 'NaN grade must be rejected');

  // F. Cross-professor grading isolation: Prof 2 cannot grade Prof 1 assignment submission
  assert.throws(() => {
    db.gradeSubmission('prof-2', sub.id, { grade: 85, feedback: 'Unauthorized grade' });
  }, /only assigned professor or admin/i, 'Unassigned professor cannot grade submission');

  // G. Non-existent submission ID
  assert.throws(() => {
    db.gradeSubmission('prof-1', 'sub-ghost-404', { grade: 90, feedback: 'Ghost' });
  }, /not found/i, 'Non-existent submission must throw');
});

// ---------------------------------------------------------------------
// TARGET 7: LEARNER ACADEMIC PROGRESSION & COLLEGIATE PATHWAYS
// ---------------------------------------------------------------------
test('Target 7 - Learner Progression: Level advancement 1->2->3, BSLI / Applied Deaf Studies unlocks, and graduation', () => {
  const db = new FSLDatabaseEngine();

  const learner = db.registerUser({
    name: 'Gary Valenciano',
    email: 'gary.v@gmail.com',
    role: 'learner',
  });

  // Stage 0: Initial state (0 levels completed)
  const prog0 = db.getLearnerProgression(learner.id);
  assert.equal(prog0.currentLevel, 0);
  assert.equal(prog0.nextLevel, 1);
  assert.deepEqual(prog0.completedLevels, []);
  assert.equal(prog0.isGraduated, false);
  assert.equal(prog0.pathways.find((p) => p.name.includes('BSLI')).eligible, false);
  assert.equal(prog0.pathways.find((p) => p.name.includes('Applied Deaf Studies')).eligible, false);

  // Stage 1: Complete Level 1
  const s1 = db.schedules.find((s) => s.workshop_id === 'w-1');
  const enr1 = db.enrollLearner(learner.id, s1.id);
  const pay1 = db.submitSimulatedPayment(learner.id, enr1.id, 2500);
  db.adminVerifyPayment('admin-1', pay1.id);
  enr1.status = 'completed'; // Workshop completed

  const prog1 = db.getLearnerProgression(learner.id);
  assert.deepEqual(prog1.completedLevels, [1]);
  assert.equal(prog1.currentLevel, 1);
  assert.equal(prog1.nextLevel, 2);
  assert.equal(prog1.isGraduated, false);
  assert.equal(prog1.pathways.find((p) => p.name.includes('BSLI')).eligible, false);
  assert.equal(prog1.pathways.find((p) => p.name.includes('Applied Deaf Studies')).eligible, false);

  // Stage 2: Complete Level 2 -> Unlocks BSLI and Applied Deaf Studies!
  const s2 = db.schedules.find((s) => s.workshop_id === 'w-2');
  const enr2 = db.enrollLearner(learner.id, s2.id);
  const pay2 = db.submitSimulatedPayment(learner.id, enr2.id, 3000);
  db.adminVerifyPayment('admin-1', pay2.id);
  enr2.status = 'completed';

  const prog2 = db.getLearnerProgression(learner.id);
  assert.deepEqual(prog2.completedLevels, [1, 2]);
  assert.equal(prog2.currentLevel, 2);
  assert.equal(prog2.nextLevel, 3);
  assert.equal(prog2.isGraduated, false);

  const bsliProg2 = prog2.pathways.find((p) => p.name.includes('BSLI'));
  assert.ok(bsliProg2);
  assert.equal(bsliProg2.eligible, true, 'BSLI pathway must be unlocked after Level 2');

  const adsProg2 = prog2.pathways.find((p) => p.name.includes('Applied Deaf Studies'));
  assert.ok(adsProg2);
  assert.equal(adsProg2.eligible, true, 'Applied Deaf Studies pathway must be unlocked after Level 2');

  // Stage 3: Complete Level 3 -> Graduation!
  const s3 = db.schedules.find((s) => s.workshop_id === 'w-3');
  const enr3 = db.enrollLearner(learner.id, s3.id);
  const pay3 = db.submitSimulatedPayment(learner.id, enr3.id, 3500);
  db.adminVerifyPayment('admin-1', pay3.id);
  enr3.status = 'completed';

  const prog3 = db.getLearnerProgression(learner.id);
  assert.deepEqual(prog3.completedLevels, [1, 2, 3]);
  assert.equal(prog3.currentLevel, 3);
  assert.equal(prog3.nextLevel, null, 'Next level must be null after reaching maximum Level 3');
  assert.equal(prog3.isGraduated, true, 'isGraduated must be true upon completing all 3 levels');
  assert.equal(prog3.pathways.find((p) => p.name.includes('BSLI')).eligible, true);
  assert.equal(prog3.pathways.find((p) => p.name.includes('Applied Deaf Studies')).eligible, true);

  // Non-existent learner progression
  assert.throws(() => {
    db.getLearnerProgression('learner-unknown-999');
  }, /not found/i, 'Unknown learner progression must throw');
});
