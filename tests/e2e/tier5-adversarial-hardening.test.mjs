// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Tier 5: Adversarial Hardening & End-to-End Journey Integration Suite
// File: tests/e2e/tier5-adversarial-hardening.test.mjs
// =====================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FSLDatabaseEngine, calculateContrastRatio } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// =====================================================================
// PART 1: FULL LIFECYCLE JOURNEY
// Learner checkout -> Admin verification -> Official enrollment ->
// Professor attendance -> Assignment creation & guidelines ->
// Learner video submission -> Professor grading (0-100 & feedback) ->
// Learner progression update.
// =====================================================================

test('Tier 5 - Lifecycle: Learner Simulated Checkout and Enrollment Gating', () => {
  const db = new FSLDatabaseEngine();

  // 1. Create a newly registered learner
  const learner = db.registerUser({
    name: 'Camille Joy Rivera',
    email: 'camille.rivera@gmail.com',
    role: 'learner',
  });
  assert.ok(learner.id, 'Learner must have valid ID');
  assert.equal(learner.role, 'learner');

  // 2. Select Level 1 schedule
  const l1Workshop = db.workshops.find((w) => w.level === 1);
  assert.ok(l1Workshop, 'Level 1 workshop must exist');
  const l1Schedule = db.schedules.find((s) => s.workshop_id === l1Workshop.id);
  assert.ok(l1Schedule, 'Level 1 schedule must exist');

  const initialSlots = l1Schedule.slots;
  assert.ok(initialSlots > 0, 'Schedule must initially have slots');

  // 3. Enroll learner -> must be pending and decrement slots
  const enrollment = db.enrollLearner(learner.id, l1Schedule.id);
  assert.equal(enrollment.status, 'pending', 'Initial enrollment status must be pending');
  assert.equal(enrollment.learner_id, learner.id);
  assert.equal(enrollment.schedule_id, l1Schedule.id);
  assert.equal(l1Schedule.slots, initialSlots - 1, 'Slots must decrement by 1');

  // 4. Simulated payment checkout -> status pending
  const payment = db.submitSimulatedPayment(learner.id, enrollment.id, l1Workshop.fee);
  assert.equal(payment.status, 'pending', 'Initial payment status must be pending');
  assert.equal(payment.amount, l1Workshop.fee);
  assert.equal(payment.enrollment_id, enrollment.id);

  // --- Adversarial & Boundary Tests ---
  // A. Negative and zero payment amounts are rejected
  assert.throws(() => {
    db.submitSimulatedPayment(learner.id, enrollment.id, 0);
  }, /greater than 0/i, 'Zero payment amount must be rejected');

  assert.throws(() => {
    db.submitSimulatedPayment(learner.id, enrollment.id, -2500);
  }, /greater than 0/i, 'Negative payment amount must be rejected');

  assert.throws(() => {
    db.submitSimulatedPayment(learner.id, enrollment.id, 'not-a-number');
  }, /greater than 0/i, 'Non-numeric payment amount must be rejected');

  // B. Duplicate enrollment in same schedule rejected
  assert.throws(() => {
    db.enrollLearner(learner.id, l1Schedule.id);
  }, /already enrolled or pending/i, 'Duplicate enrollment in the same schedule must be blocked');

  // C. Full section enrollment rejection (0 slots remaining)
  const fullSchedule = db.createSchedule('admin-1', {
    workshop_id: l1Workshop.id,
    professor_id: 'prof-1',
    day_time: 'Fridays 6:00 PM - 9:00 PM',
    slots: 1,
    meeting_link: 'https://meet.google.com/test-full',
  });
  const learnerOther = db.registerUser({
    name: 'Carlos Perez',
    email: 'carlos.perez@gmail.com',
    role: 'learner',
  });
  db.enrollLearner(learnerOther.id, fullSchedule.id);
  assert.equal(fullSchedule.slots, 0, 'Slots must now be 0');

  const learnerBlocked = db.registerUser({
    name: 'Diana Dizon',
    email: 'diana.dizon@gmail.com',
    role: 'learner',
  });
  assert.throws(() => {
    db.enrollLearner(learnerBlocked.id, fullSchedule.id);
  }, /no available slots/i, 'Enrollment in zero-slot section must be blocked');

  // D. Cross-user unauthorized payment attempt
  assert.throws(() => {
    db.submitSimulatedPayment(learnerOther.id, enrollment.id, 2500);
  }, /cannot pay for another user/i, 'Unauthorized user cannot pay for another learner');
});

test('Tier 5 - Lifecycle: Admin Payment Verification and Atomic Enrollment State Transition', () => {
  const db = new FSLDatabaseEngine();

  const learner = db.registerUser({
    name: 'Geronimo Cruz',
    email: 'geronimo.cruz@gmail.com',
    role: 'learner',
  });
  const schedule = db.schedules[0];
  const enrollment = db.enrollLearner(learner.id, schedule.id);
  const payment = db.submitSimulatedPayment(learner.id, enrollment.id, 2500);

  // Financial summary before verification
  const financeBefore = db.getFinancialSummary('admin-1');
  const initialVerifiedTotal = financeBefore.totalRevenue;
  const initialPendingTotal = financeBefore.pendingRevenue;
  const initialVerifiedCount = financeBefore.verifiedCount;

  // 1. Non-admin cannot verify payment
  assert.throws(() => {
    db.adminVerifyPayment('prof-1', payment.id);
  }, /only administrators can verify payments/i, 'Professor cannot verify payments');

  assert.throws(() => {
    db.adminVerifyPayment(learner.id, payment.id);
  }, /only administrators can verify payments/i, 'Learner cannot self-verify payments');

  // 2. Admin verifies payment -> Atomic state transition
  const verifyResult = db.adminVerifyPayment('admin-1', payment.id);
  assert.equal(verifyResult.payment.status, 'verified', 'Payment status must transition to verified');
  assert.equal(verifyResult.enrollment.status, 'enrolled', 'Enrollment status must transition to enrolled');

  // 3. Invariant: double verification is rejected
  assert.throws(() => {
    db.adminVerifyPayment('admin-1', payment.id);
  }, /payment is already verified/i, 'Double verification of payment must be rejected');

  // 4. Financial summary updates atomically
  const financeAfter = db.getFinancialSummary('admin-1');
  assert.equal(
    financeAfter.totalRevenue,
    initialVerifiedTotal + 2500,
    'Verified revenue must increase by payment amount'
  );
  assert.equal(
    financeAfter.pendingRevenue,
    initialPendingTotal - 2500,
    'Pending revenue must decrease by verified amount'
  );
  assert.equal(
    financeAfter.verifiedCount,
    initialVerifiedCount + 1,
    'Verified transactions count must increase by 1'
  );

  // 5. Subsequent payment attempt on already verified enrollment throws error
  assert.throws(() => {
    db.submitSimulatedPayment(learner.id, enrollment.id, 2500);
  }, /already verified and paid/i, 'Cannot submit payment for already verified enrollment');
});

test('Tier 5 - Lifecycle: Professor Attendance Marking (Present, Absent, Late, Excused) & Remarks', () => {
  const db = new FSLDatabaseEngine();

  // Setup verified learner enrolled in Prof Juan Dela Cruz (prof-1) class s-1
  const learner = db.registerUser({
    name: 'Janice Morales',
    email: 'janice.morales@gmail.com',
    role: 'learner',
  });
  const scheduleId = 's-1';
  const enrollment = db.enrollLearner(learner.id, scheduleId);
  const payment = db.submitSimulatedPayment(learner.id, enrollment.id, 2500);
  db.adminVerifyPayment('admin-1', payment.id);
  assert.equal(enrollment.status, 'enrolled');

  // 1. Session 1: Marking Present with Remarks
  const att1 = db.recordAttendance(
    'prof-1',
    scheduleId,
    enrollment.id,
    '2026-10-03',
    true,
    'present: active participation in manual alphabet drills'
  );
  assert.ok(att1.id);
  assert.equal(att1.present, true);
  assert.equal(att1.date, '2026-10-03');
  assert.equal(att1.remarks, 'present: active participation in manual alphabet drills');

  // 2. Session 2: Marking Absent with Remarks
  const att2 = db.recordAttendance(
    'prof-1',
    scheduleId,
    enrollment.id,
    '2026-10-10',
    false,
    'absent: unnotified absence'
  );
  assert.equal(att2.present, false);
  assert.equal(att2.date, '2026-10-10');
  assert.equal(att2.remarks, 'absent: unnotified absence');

  // 3. Session 3: Marking Late with Remarks (present = true with late remark)
  const att3 = db.recordAttendance(
    'prof-1',
    scheduleId,
    enrollment.id,
    '2026-10-17',
    true,
    'late: joined 20 minutes late due to internet disconnection'
  );
  assert.equal(att3.present, true);
  assert.equal(att3.remarks, 'late: joined 20 minutes late due to internet disconnection');

  // 4. Session 4: Marking Excused with Remarks (present = false with excused remark)
  const att4 = db.recordAttendance(
    'prof-1',
    scheduleId,
    enrollment.id,
    '2026-10-24',
    false,
    'excused: approved medical leave certificate provided'
  );
  assert.equal(att4.present, false);
  assert.equal(att4.remarks, 'excused: approved medical leave certificate provided');

  // 5. Upserting / updating attendance for Session 2: Change from absent to excused late
  const updatedAtt2 = db.recordAttendance(
    'prof-1',
    scheduleId,
    enrollment.id,
    '2026-10-10',
    true,
    'excused late: rectified after technical review'
  );
  assert.equal(updatedAtt2.id, att2.id, 'Must update existing record with same ID');
  assert.equal(updatedAtt2.present, true);
  assert.equal(updatedAtt2.remarks, 'excused late: rectified after technical review');

  // Verify total student session count
  const studentAttendance = db.attendance.filter((a) => a.enrollment_id === enrollment.id);
  assert.equal(studentAttendance.length, 4, 'Must have exactly 4 session records');

  // --- Adversarial & Isolation Tests ---
  // A. Cross-professor isolation: Prof 2 cannot record attendance for Prof 1 schedule s-1
  assert.throws(() => {
    db.recordAttendance('prof-2', scheduleId, enrollment.id, '2026-10-31', true, 'unauthorized');
  }, /only assigned professor or admin/i, 'Unauthorized professor cannot take attendance');

  // B. Attendance on non-enrolled learner or wrong schedule
  assert.throws(() => {
    db.recordAttendance('prof-1', scheduleId, 'e-9999', '2026-10-31', true);
  }, /does not belong to this schedule/i, 'Invalid enrollment ID must be rejected');

  // C. Empty or missing date rejected
  assert.throws(() => {
    db.recordAttendance('prof-1', scheduleId, enrollment.id, '', true);
  }, /date is required/i, 'Empty session date must be rejected');

  // D. Cannot record attendance for pending / unverified enrollment
  const pendingLearner = db.registerUser({
    name: 'Pending Paul',
    email: 'paul.pending@gmail.com',
    role: 'learner',
  });
  const pendingEnr = db.enrollLearner(pendingLearner.id, scheduleId);
  assert.equal(pendingEnr.status, 'pending');
  assert.throws(() => {
    db.recordAttendance('prof-1', scheduleId, pendingEnr.id, '2026-10-31', true);
  }, /cannot take attendance for learner with status "pending"/i, 'Cannot record attendance for pending learner');
});

test('Tier 5 - Lifecycle: Professor Assignment Creation & Comprehensive Guidelines', () => {
  const db = new FSLDatabaseEngine();

  const scheduleId = 's-1';

  // 1. Prof-1 creates assignment with guidelines and rubric instructions
  const assignment = db.createAssignment('prof-1', scheduleId, {
    title: 'Midterm Signing Video: Basic Greetings, Fingerspelling & Polite Markers',
    description: `GUIDELINES & RUBRIC:
1. Video Resolution: Clear 720p or 1080p, well-lit frontal view showing face and upper torso.
2. Sign Space: Maintain neutral signing space between head and waist.
3. Content: Fingerspell your full name, sign 5 daily greetings, and demonstrate 3 polite markers.
4. Non-Manual Signals: Accurate facial grammar (eyebrows raised for yes/no questions).
5. Due Date: Submit unlisted YouTube or MP4 link before 11:59 PM.`,
    due_date: '2026-10-30T23:59:59Z',
  });

  assert.ok(assignment.id);
  assert.equal(assignment.schedule_id, scheduleId);
  assert.ok(assignment.title.includes('Midterm Signing Video'));
  assert.ok(assignment.description.includes('GUIDELINES & RUBRIC'));
  assert.ok(assignment.description.includes('Non-Manual Signals'));
  assert.equal(assignment.due_date, '2026-10-30T23:59:59Z');

  // --- Adversarial Tests ---
  // A. Prof 2 cannot create assignment in Prof 1 schedule s-1
  assert.throws(() => {
    db.createAssignment('prof-2', scheduleId, {
      title: 'Hacked Assignment',
      description: 'Unauthorized creation',
      due_date: '2026-10-30T23:59:59Z',
    });
  }, /only assigned professor or admin/i, 'Cross-professor assignment creation must be blocked');

  // B. Empty title is rejected
  assert.throws(() => {
    db.createAssignment('prof-1', scheduleId, {
      title: '   ',
      description: 'Some guidelines',
      due_date: '2026-10-30T23:59:59Z',
    });
  }, /title cannot be empty/i, 'Empty assignment title must be rejected');

  // C. Non-existent schedule throws error
  assert.throws(() => {
    db.createAssignment('prof-1', 's-9999', {
      title: 'Valid Title',
      description: 'Guidelines',
    });
  }, /not found/i, 'Non-existent schedule must throw error');
});

test('Tier 5 - Lifecycle: Learner Video Assignment Submission and Re-submission', () => {
  const db = new FSLDatabaseEngine();

  const learner = db.registerUser({
    name: 'Kaye Andrea Villanueva',
    email: 'kaye.villanueva@gmail.com',
    role: 'learner',
  });
  const scheduleId = 's-1';
  const enrollment = db.enrollLearner(learner.id, scheduleId);
  const payment = db.submitSimulatedPayment(learner.id, enrollment.id, 2500);
  db.adminVerifyPayment('admin-1', payment.id);

  const assignment = db.createAssignment('prof-1', scheduleId, {
    title: 'Self-Introduction in FSL',
    description: 'Record a 2-minute video introducing your hobbies.',
    due_date: '2026-11-01T23:59:59Z',
  });

  // 1. Learner submits video recording link
  const sub1 = db.submitAssignment(learner.id, assignment.id, {
    file_url: 'https://storage.fsl.ph/submissions/kaye-v1-self-intro.mp4',
  });
  assert.ok(sub1.id);
  assert.equal(sub1.assignment_id, assignment.id);
  assert.equal(sub1.learner_id, learner.id);
  assert.equal(sub1.file_url, 'https://storage.fsl.ph/submissions/kaye-v1-self-intro.mp4');
  assert.equal(sub1.grade, null, 'Grade must be null upon initial submission');
  assert.equal(sub1.feedback, null, 'Feedback must be null upon initial submission');

  // 2. Re-submission before grading updates the URL seamlessly
  const subUpdated = db.submitAssignment(learner.id, assignment.id, {
    file_url: 'https://storage.fsl.ph/submissions/kaye-v2-re-recorded.mp4',
  });
  assert.equal(subUpdated.id, sub1.id, 'Re-submission must maintain identical submission record ID');
  assert.equal(subUpdated.file_url, 'https://storage.fsl.ph/submissions/kaye-v2-re-recorded.mp4');

  // --- Adversarial Tests ---
  // A. Empty file URL rejected
  assert.throws(() => {
    db.submitAssignment(learner.id, assignment.id, { file_url: '   ' });
  }, /file or video URL is required/i, 'Empty file URL must be rejected');

  // B. Non-enrolled learner cannot submit
  const stranger = db.registerUser({
    name: 'Stranger Learner',
    email: 'stranger@gmail.com',
    role: 'learner',
  });
  assert.throws(() => {
    db.submitAssignment(stranger.id, assignment.id, {
      file_url: 'https://storage.fsl.ph/submissions/stranger.mp4',
    });
  }, /not currently enrolled/i, 'Non-enrolled learner submission must be blocked');

  // C. Submitting to non-existent assignment
  assert.throws(() => {
    db.submitAssignment(learner.id, 'asg-9999', {
      file_url: 'https://storage.fsl.ph/submissions/any.mp4',
    });
  }, /not found/i, 'Invalid assignment ID must throw error');
});

test('Tier 5 - Lifecycle: Professor Grading (0-100 Boundary Tests & Linguistic Feedback)', () => {
  const db = new FSLDatabaseEngine();

  const learner = db.registerUser({
    name: 'Miguel Tan',
    email: 'miguel.tan@gmail.com',
    role: 'learner',
  });
  const scheduleId = 's-1';
  const enrollment = db.enrollLearner(learner.id, scheduleId);
  const payment = db.submitSimulatedPayment(learner.id, enrollment.id, 2500);
  db.adminVerifyPayment('admin-1', payment.id);

  const assignment = db.createAssignment('prof-1', scheduleId, {
    title: 'Numbers and Directional Verbs Video Assignment',
    description: 'Demonstrate numbers 1-20 and directional verbs GIVE, HELP, ASK.',
    due_date: '2026-11-05T23:59:59Z',
  });

  const submission = db.submitAssignment(learner.id, assignment.id, {
    file_url: 'https://storage.fsl.ph/submissions/miguel-numbers-verbs.mp4',
  });

  // 1. Lower Boundary: Grade 0 is a valid score (not falsy rejected)
  const gradedZero = db.gradeSubmission('prof-1', submission.id, {
    grade: 0,
    feedback: 'No signing visible in video frame. Please re-shoot with camera centered.',
  });
  assert.equal(gradedZero.grade, 0, 'Grade 0 must be accepted as valid numeric score');
  assert.equal(gradedZero.feedback, 'No signing visible in video frame. Please re-shoot with camera centered.');

  // 2. Upper Boundary: Grade 100 is a valid score
  const gradedPerfect = db.gradeSubmission('prof-1', submission.id, {
    grade: 100,
    feedback: 'Flawless execution! Impeccable handshapes, smooth directional verbs, and crisp fingerspelling.',
  });
  assert.equal(gradedPerfect.grade, 100, 'Grade 100 must be accepted as valid upper boundary');

  // 3. Realistic Linguistic Evaluation: Grade 94 with detailed pedagogical feedback
  const feedbackText =
    'Linguistic Assessment: Excellent palm orientation for number 7 and 9. Handshape for HELP is properly grounded. Work on softening non-manual markers when signing polite questions.';
  const gradedFinal = db.gradeSubmission('prof-1', submission.id, {
    grade: 94,
    feedback: feedbackText,
  });
  assert.equal(gradedFinal.grade, 94);
  assert.equal(gradedFinal.feedback, feedbackText);

  // --- Adversarial & Boundary Rejections ---
  // A. Grade below 0 rejected
  assert.throws(() => {
    db.gradeSubmission('prof-1', submission.id, { grade: -1, feedback: 'Negative score' });
  }, /between 0 and 100/i, 'Grade below 0 must be rejected');

  assert.throws(() => {
    db.gradeSubmission('prof-1', submission.id, { grade: -50, feedback: 'Negative score' });
  }, /between 0 and 100/i, 'Negative grade must be rejected');

  // B. Grade above 100 rejected
  assert.throws(() => {
    db.gradeSubmission('prof-1', submission.id, { grade: 101, feedback: 'Over limit' });
  }, /between 0 and 100/i, 'Grade 101 must be rejected');

  assert.throws(() => {
    db.gradeSubmission('prof-1', submission.id, { grade: 150, feedback: 'Over limit' });
  }, /between 0 and 100/i, 'Grade 150 must be rejected');

  // C. Non-numeric grade rejected
  assert.throws(() => {
    db.gradeSubmission('prof-1', submission.id, { grade: 'A_PLUS', feedback: 'Letter grade' });
  }, /between 0 and 100/i, 'Non-numeric grade must be rejected');

  // D. Cross-professor isolation: Prof 2 cannot grade Prof 1 assignment submission
  assert.throws(() => {
    db.gradeSubmission('prof-2', submission.id, { grade: 88, feedback: 'Hacked grade' });
  }, /only assigned professor or admin/i, 'Unauthorized professor cannot grade submission');

  // E. Non-existent submission ID
  assert.throws(() => {
    db.gradeSubmission('prof-1', 'sub-99999', { grade: 85, feedback: 'Fake' });
  }, /not found/i, 'Grading non-existent submission must throw error');
});

test('Tier 5 - Lifecycle: Learner Progression Calculation and Academic Level Advancement', () => {
  const db = new FSLDatabaseEngine();

  const learner = db.registerUser({
    name: 'Patricia Lim',
    email: 'patricia.lim@gmail.com',
    role: 'learner',
  });

  // Initial progression: newcomer (0 levels completed)
  const initialProg = db.getLearnerProgression(learner.id);
  assert.equal(initialProg.currentLevel, 0);
  assert.equal(initialProg.nextLevel, 1);
  assert.equal(initialProg.completedLevels.length, 0);
  assert.equal(initialProg.isGraduated, false);
  assert.equal(initialProg.pathways.some((p) => p.name.includes('BSLI') && p.eligible), false);

  // 1. Complete FSL Level 1
  const s1 = db.schedules.find((s) => s.workshop_id === 'w-1');
  const enr1 = db.enrollLearner(learner.id, s1.id);
  const pay1 = db.submitSimulatedPayment(learner.id, enr1.id, 2500);
  db.adminVerifyPayment('admin-1', pay1.id);
  // Course completion transition
  enr1.status = 'completed';

  const progAfterL1 = db.getLearnerProgression(learner.id);
  assert.deepEqual(progAfterL1.completedLevels, [1], 'Level 1 must be recorded as completed');
  assert.equal(progAfterL1.currentLevel, 1);
  assert.equal(progAfterL1.nextLevel, 2);
  assert.equal(progAfterL1.isGraduated, false);

  // 2. Complete FSL Level 2
  const s2 = db.schedules.find((s) => s.workshop_id === 'w-2');
  const enr2 = db.enrollLearner(learner.id, s2.id);
  const pay2 = db.submitSimulatedPayment(learner.id, enr2.id, 3000);
  db.adminVerifyPayment('admin-1', pay2.id);
  enr2.status = 'completed';

  const progAfterL2 = db.getLearnerProgression(learner.id);
  assert.deepEqual(progAfterL2.completedLevels, [1, 2]);
  assert.equal(progAfterL2.currentLevel, 2);
  assert.equal(progAfterL2.nextLevel, 3);
  assert.equal(progAfterL2.isGraduated, false);

  // Level 2 completion unlocks BSLI and Applied Deaf Studies collegiate pathways!
  const bsliPathway = progAfterL2.pathways.find((p) => p.name.includes('BSLI'));
  assert.ok(bsliPathway, 'BSLI pathway must exist');
  assert.equal(bsliPathway.eligible, true, 'BSLI pathway must be unlocked after Level 2');

  const adsPathway = progAfterL2.pathways.find((p) => p.name.includes('Applied Deaf Studies'));
  assert.ok(adsPathway, 'Applied Deaf Studies pathway must exist');
  assert.equal(adsPathway.eligible, true, 'Applied Deaf Studies pathway must be unlocked after Level 2');

  // 3. Complete FSL Level 3
  const s3 = db.schedules.find((s) => s.workshop_id === 'w-3');
  const enr3 = db.enrollLearner(learner.id, s3.id);
  const pay3 = db.submitSimulatedPayment(learner.id, enr3.id, 3500);
  db.adminVerifyPayment('admin-1', pay3.id);
  enr3.status = 'completed';

  const progAfterL3 = db.getLearnerProgression(learner.id);
  assert.deepEqual(progAfterL3.completedLevels, [1, 2, 3]);
  assert.equal(progAfterL3.currentLevel, 3);
  assert.equal(progAfterL3.nextLevel, null, 'nextLevel must be null after reaching maximum Level 3');
  assert.equal(progAfterL3.isGraduated, true, 'isGraduated must be true upon completing all 3 levels');
});

// =====================================================================
// PART 2: CROSS-CUTTING COMMUNITY JOURNEY
// Threaded messaging between Learner, Professor, Admin ->
// SDEAS news & Deaf Festival filtering ->
// Merchandise stock decrement on order inquiry ->
// Video player speed (0.5x, 0.75x, 1x) & loop toggle.
// =====================================================================

test('Tier 5 - Community: Threaded Direct Messaging Between Learner, Professor, and Admin', () => {
  const db = new FSLDatabaseEngine();

  const learnerId = 'learner-1';
  const profId = 'prof-1';
  const adminId = 'admin-1';

  // 1. Learner <-> Professor thread
  const msg1 = db.sendMessage(
    learnerId,
    profId,
    'Prof. Juan, how do I position my thumb for the manual letter K in FSL?'
  );
  assert.ok(msg1.id);
  assert.equal(msg1.sender_id, learnerId);
  assert.equal(msg1.receiver_id, profId);

  const msg2 = db.sendMessage(
    profId,
    learnerId,
    'Hi Mark! For letter K, extend index and middle fingers upward in a V shape and place your thumb between them.'
  );
  assert.ok(msg2.id);

  // 2. Learner <-> Admin thread (Certificate inquiry)
  const msg3 = db.sendMessage(
    learnerId,
    adminId,
    'Good day Admin, can I request a signed certificate of enrollment for my employer scholarship?'
  );
  const msg4 = db.sendMessage(
    adminId,
    learnerId,
    'Hello Mark, we have generated your official certificate of enrollment. You can download it from your portal.'
  );

  // 3. Professor <-> Admin thread (Classroom capacity request)
  const msg5 = db.sendMessage(
    profId,
    adminId,
    'Director Maria, can we open 5 additional slots for Saturday FSL 101? Waitlist has several Deaf student relatives.'
  );
  const msg6 = db.sendMessage(
    adminId,
    profId,
    'Approved Prof. Juan! Increasing slot quota by 5 in the schedule manager.'
  );

  // 4. Verify strict thread isolation
  const threadLearnerProf = db.getMessageThread(learnerId, profId);
  assert.ok(threadLearnerProf.length >= 2);
  for (const m of threadLearnerProf) {
    const isEither =
      (m.sender_id === learnerId && m.receiver_id === profId) ||
      (m.sender_id === profId && m.receiver_id === learnerId);
    assert.ok(isEither, 'Learner-Prof thread must only contain messages between those two users');
  }

  const threadLearnerAdmin = db.getMessageThread(learnerId, adminId);
  assert.ok(threadLearnerAdmin.length >= 2);
  for (const m of threadLearnerAdmin) {
    const isEither =
      (m.sender_id === learnerId && m.receiver_id === adminId) ||
      (m.sender_id === adminId && m.receiver_id === learnerId);
    assert.ok(isEither, 'Learner-Admin thread must only contain messages between those two users');
  }

  const threadProfAdmin = db.getMessageThread(profId, adminId);
  assert.ok(threadProfAdmin.length >= 2);
  for (const m of threadProfAdmin) {
    const isEither =
      (m.sender_id === profId && m.receiver_id === adminId) ||
      (m.sender_id === adminId && m.receiver_id === profId);
    assert.ok(isEither, 'Prof-Admin thread must only contain messages between those two users');
  }

  // 5. Unread tracking and markThreadAsRead
  const conversationsBefore = db.getConversations(learnerId);
  const profConvo = conversationsBefore.find((c) => c.partner && c.partner.id === profId);
  assert.ok(profConvo, 'Conversation summary with professor must exist');

  db.markThreadAsRead(learnerId, profId);
  const threadAfterRead = db.getMessageThread(learnerId, profId);
  const incomingToLearner = threadAfterRead.filter((m) => m.receiver_id === learnerId);
  for (const m of incomingToLearner) {
    assert.equal(m.read, true, 'Incoming messages must be marked as read');
  }

  // --- Adversarial Tests ---
  // A. Empty or whitespace message body is rejected
  assert.throws(() => {
    db.sendMessage(learnerId, profId, '');
  }, /body cannot be empty/i, 'Empty message body must be rejected');

  assert.throws(() => {
    db.sendMessage(learnerId, profId, '     ');
  }, /body cannot be empty/i, 'Whitespace message body must be rejected');

  // B. Non-existent sender or receiver
  assert.throws(() => {
    db.sendMessage('ghost-user', profId, 'Hello');
  }, /not found/i, 'Non-existent sender must throw error');

  assert.throws(() => {
    db.sendMessage(learnerId, 'ghost-receiver', 'Hello');
  }, /not found/i, 'Non-existent receiver must throw error');
});

test('Tier 5 - Community: SDEAS News & Benilde Deaf Festival Filtering & Accessibility Modal', () => {
  const db = new FSLDatabaseEngine();

  // 1. Filter by 'sdeas_news'
  const sdeasNews = db.getNewsEvents('sdeas_news');
  assert.ok(sdeasNews.length >= 1, 'Must return SDEAS news articles');
  for (const item of sdeasNews) {
    assert.equal(item.type, 'sdeas_news', 'Filtered items must strictly match sdeas_news');
  }

  // 2. Filter by 'deaf_festival'
  const deafFestEvents = db.getNewsEvents('deaf_festival');
  assert.ok(deafFestEvents.length >= 1, 'Must return Benilde Deaf Festival event');
  const fest = deafFestEvents[0];
  assert.equal(fest.type, 'deaf_festival');
  assert.ok(fest.title.toLowerCase().includes('deaf festival'), 'Title must highlight Deaf Festival');

  // 3. Filter by events / seminars
  const seminarEvents = db.getNewsEvents('seminar');
  assert.ok(seminarEvents.length >= 1, 'Must return FSL seminar events');
  assert.equal(seminarEvents[0].type, 'seminar');

  // 4. Verification of accessibility accommodations
  const allEvents = db.getNewsEvents('all');
  assert.ok(allEvents.length >= 4, 'Must return all grounded news/events');

  // Verify chronological order (date descending)
  for (let i = 0; i < allEvents.length - 1; i++) {
    const d1 = new Date(allEvents[i].date).getTime();
    const d2 = new Date(allEvents[i + 1].date).getTime();
    assert.ok(d1 >= d2, 'News events must be sorted chronologically descending by date');
  }

  // Verify accessibility metadata
  const eventDetails = db.getNewsEventById(fest.id);
  assert.ok(eventDetails, 'Event details must be retrievable by ID');
  assert.ok(eventDetails.title, 'Event must have a title');
  assert.ok(eventDetails.body, 'Event must have body text');
  assert.ok(eventDetails.date, 'Event must have date');

  // 5. Source code validation for NewsClient accessibility modal and filter tabs
  const newsClientCode = fs.readFileSync(
    path.join(rootDir, 'src', 'app', 'news', 'NewsClient.tsx'),
    'utf8'
  );
  assert.ok(
    newsClientCode.includes('sdeas_news') && newsClientCode.includes('deaf_festival'),
    'NewsClient must support grounded category filters'
  );
  assert.ok(
    newsClientCode.includes('Accessibility Accommodations') || newsClientCode.includes('accommodations'),
    'NewsClient must display accessibility accommodations in event cards/modal'
  );
  assert.ok(
    newsClientCode.includes('role="dialog"') || newsClientCode.includes('Modal') || newsClientCode.includes('selectedEvent'),
    'NewsClient must support accessible modal dialog for full event details'
  );
});

test('Tier 5 - Community: Merchandise Catalog Stock Decrement on Order Inquiry', () => {
  const db = new FSLDatabaseEngine();

  // 1. Initial product inspection
  const shirt = db.products.find((p) => p.name.includes('Shirt'));
  assert.ok(shirt, 'FSL Shirt must exist in merchandise catalog');
  const initialStock = shirt.stock;
  assert.ok(initialStock >= 10, 'Product must have adequate initial stock');

  // 2. Submit valid simulated inquiry / pre-order for 3 shirts
  const inquiryPayload = {
    quantity: 3,
    recipientName: 'Hannah Sofia Valdez',
    email: 'hannah.valdez@gmail.com',
    contactNumber: '+63 917 123 4567',
    deliveryAddress: 'Unit 402, Taft Towers, Manila',
    notes: 'Size Medium please, excited to wear for Deaf Festival!',
  };

  const result = db.submitMerchandiseInquiry(shirt.id, inquiryPayload);
  assert.equal(result.success, true);
  assert.ok(result.orderId.startsWith('ORD-FSL-'));
  assert.equal(shirt.stock, initialStock - 3, 'Stock must decrement atomically by exactly 3 units');
  assert.equal(result.inquiry.quantity, 3);
  assert.equal(result.inquiry.total_price, shirt.price * 3);
  assert.equal(result.inquiry.recipient_name, 'Hannah Sofia Valdez');
  assert.equal(result.inquiry.status, 'submitted');

  // --- Adversarial & Boundary Tests ---
  // A. Non-positive order quantity rejected
  assert.throws(() => {
    db.submitMerchandiseInquiry(shirt.id, {
      ...inquiryPayload,
      quantity: 0,
    });
  }, /at least 1/i, 'Order quantity 0 must be rejected');

  assert.throws(() => {
    db.submitMerchandiseInquiry(shirt.id, {
      ...inquiryPayload,
      quantity: -5,
    });
  }, /at least 1/i, 'Negative order quantity must be rejected');

  // B. Order quantity exceeding available stock rejected
  const currentStock = shirt.stock;
  assert.throws(() => {
    db.submitMerchandiseInquiry(shirt.id, {
      ...inquiryPayload,
      quantity: currentStock + 10,
    });
  }, /insufficient stock/i, 'Order exceeding available stock must be rejected');
  assert.equal(shirt.stock, currentStock, 'Stock must remain unchanged after rejected inquiry');

  // C. Empty recipient name rejected
  assert.throws(() => {
    db.submitMerchandiseInquiry(shirt.id, {
      ...inquiryPayload,
      recipientName: '   ',
    });
  }, /recipient name is required/i, 'Empty recipient name must be rejected');

  // D. Invalid email rejected
  assert.throws(() => {
    db.submitMerchandiseInquiry(shirt.id, {
      ...inquiryPayload,
      email: 'not-an-email',
    });
  }, /valid contact email is required/i, 'Invalid email format must be rejected');

  // E. Non-existent product ID rejected
  assert.throws(() => {
    db.submitMerchandiseInquiry('prod-fake-999', inquiryPayload);
  }, /not found/i, 'Non-existent product ID must throw error');

  // F. Deplete entire remaining stock to 0 and verify out-of-stock boundary
  db.submitMerchandiseInquiry(shirt.id, {
    ...inquiryPayload,
    quantity: shirt.stock,
  });
  assert.equal(shirt.stock, 0, 'Stock must now be depleted to exactly 0');

  assert.throws(() => {
    db.submitMerchandiseInquiry(shirt.id, {
      ...inquiryPayload,
      quantity: 1,
    });
  }, /insufficient stock/i, 'Order when stock is 0 must be rejected as out-of-stock');
});

test('Tier 5 - Community: Accessible Video Player Speed (0.5x, 0.75x, 1x) & Loop Toggle Contract', () => {
  // 1. Inspect AccessibleVideoPlayer component implementation
  const playerFile = path.join(rootDir, 'src', 'components', 'video', 'AccessibleVideoPlayer.tsx');
  assert.ok(fs.existsSync(playerFile), 'AccessibleVideoPlayer.tsx must exist');
  const playerContent = fs.readFileSync(playerFile, 'utf8');

  // 2. Playback speed rates (0.5x, 0.75x, 1.0x) verification
  assert.ok(
    playerContent.includes('0.5') && playerContent.includes('0.75') && playerContent.includes('1.0'),
    'AccessibleVideoPlayer must support speeds 0.5x, 0.75x, and 1.0x for sign study'
  );
  assert.ok(
    playerContent.includes('handleRateChange'),
    'Player must provide handler to adjust playbackRate'
  );

  // 3. Continuous signing practice loop toggle
  assert.ok(
    playerContent.includes('toggleLoop') || playerContent.includes('isLooping'),
    'Player must provide loop toggle state'
  );
  assert.ok(
    playerContent.includes('isLooping') && playerContent.includes('useState<boolean>(true)') || playerContent.includes('useState(true)'),
    'Player should default looping on for visual signing practice'
  );

  // 4. Deaf and visual learner accessibility cues
  assert.ok(
    playerContent.includes('aria-label'),
    'Player controls must provide accessible aria-labels'
  );
  assert.ok(
    playerContent.includes('focus-visible'),
    'Player controls must provide high-contrast keyboard focus indicators'
  );
  assert.ok(
    playerContent.includes('getYouTubeEmbedUrl'),
    'Player must support YouTube embed URL parsing and loop injection'
  );

  // 5. WCAG AAA Contrast Ratio Verification for player UI colors
  // White text (#ffffff) on dark slate (#020617 / #0f172a)
  const contrastRatioWhiteOnDark = calculateContrastRatio('#ffffff', '#020617');
  assert.ok(
    contrastRatioWhiteOnDark >= 7.0,
    `White on slate-950 contrast ratio must meet WCAG AAA (>= 7.0:1). Actual: ${contrastRatioWhiteOnDark.toFixed(2)}:1`
  );

  // Amber badge text (#fde047) on slate background (#0f172a)
  const contrastRatioAmberOnDark = calculateContrastRatio('#fde047', '#0f172a');
  assert.ok(
    contrastRatioAmberOnDark >= 7.0,
    `Amber on slate-900 contrast ratio must meet WCAG AAA (>= 7.0:1). Actual: ${contrastRatioAmberOnDark.toFixed(2)}:1`
  );
});
