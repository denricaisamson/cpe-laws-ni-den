// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Empirical Stress Test Suite: Milestone 5
// File: tests/stress-milestone5.test.mjs
// =====================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FSLDatabaseEngine, VIDEO_CATEGORIES, getInitialSeedData } from './e2e/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------
// SUITE 1: SIMULATED ENROLLMENT & PAYMENT STRESS TESTS
// ---------------------------------------------------------------------

test('Stress 1.1 - Double-Enrollment Prevention & Race Condition Invariant', () => {
  const db = new FSLDatabaseEngine();
  const schedule = db.schedules.find((s) => s.id === 's-1');
  assert.ok(schedule, 'Schedule s-1 must exist');
  const initialSlots = schedule.slots;

  // 1. First enrollment of learner-1 into s-1 succeeds
  const enr1 = db.enrollLearner('learner-1', 's-1');
  assert.equal(enr1.status, 'pending');
  assert.equal(schedule.slots, initialSlots - 1);

  // 2. Second attempt by same learner while status is 'pending' must be REJECTED
  assert.throws(
    () => db.enrollLearner('learner-1', 's-1'),
    /already enrolled or pending/i,
    'Must prevent double-enrollment when previous enrollment is pending'
  );
  // Slot must NOT have decremented on failed attempt
  assert.equal(schedule.slots, initialSlots - 1);

  // 3. Simulated payment submission
  const payment = db.submitSimulatedPayment('learner-1', enr1.id, 2500);
  assert.equal(payment.status, 'pending');

  // 4. Admin verifies payment -> enrollment becomes 'enrolled'
  db.adminVerifyPayment('admin-1', payment.id);
  assert.equal(enr1.status, 'enrolled');

  // 5. Third attempt by same learner while status is 'enrolled' must STILL be REJECTED
  assert.throws(
    () => db.enrollLearner('learner-1', 's-1'),
    /already enrolled or pending/i,
    'Must prevent double-enrollment when learner is actively enrolled'
  );
  assert.equal(schedule.slots, initialSlots - 1);
});

test('Stress 1.2 - Slot Exhaustion & Boundary Enforcement', () => {
  const db = new FSLDatabaseEngine();
  const schedule = db.schedules.find((s) => s.id === 's-3');
  assert.ok(schedule);

  // Set slots to exactly 1
  schedule.slots = 1;

  // Learner 1 takes the last slot
  const enr = db.enrollLearner('learner-1', 's-3');
  assert.equal(enr.status, 'pending');
  assert.equal(schedule.slots, 0);

  // Learner 3 attempts to enroll into section with 0 slots remaining
  assert.throws(
    () => db.enrollLearner('learner-3', 's-3'),
    /available slots/i,
    'Must reject enrollment when available slots are 0'
  );

  // Negative slots impossible
  schedule.slots = -5;
  assert.throws(
    () => db.enrollLearner('learner-3', 's-3'),
    /available slots/i,
    'Must reject enrollment when slots are negative'
  );
});

test('Stress 1.3 - Payment Amount and User Authorization Invariants', () => {
  const db = new FSLDatabaseEngine();
  const enr = db.enrollLearner('learner-1', 's-1');

  // 1. Non-positive payment amount rejected
  assert.throws(
    () => db.submitSimulatedPayment('learner-1', enr.id, 0),
    /greater than 0/i,
    'Amount <= 0 must be rejected'
  );
  assert.throws(
    () => db.submitSimulatedPayment('learner-1', enr.id, -2500),
    /greater than 0/i,
    'Negative amount must be rejected'
  );
  assert.throws(
    () => db.submitSimulatedPayment('learner-1', enr.id, 'invalid_amount'),
    /greater than 0/i,
    'Non-numeric amount must be rejected'
  );

  // 2. Cross-user payment hijacking prevention: learner-2 cannot pay for learner-1's enrollment
  assert.throws(
    () => db.submitSimulatedPayment('learner-2', enr.id, 2500),
    /another user enrollment/i,
    'Learner cannot pay for another user enrollment'
  );

  // 3. Duplicate payment submission idempotency
  const pay1 = db.submitSimulatedPayment('learner-1', enr.id, 2500);
  const pay2 = db.submitSimulatedPayment('learner-1', enr.id, 2500);
  assert.equal(pay1.id, pay2.id, 'Duplicate payment call for pending enrollment returns existing record');

  // 4. Payment after verification rejection
  db.adminVerifyPayment('admin-1', pay1.id);
  assert.throws(
    () => db.submitSimulatedPayment('learner-1', enr.id, 2500),
    /already verified/i,
    'Cannot submit payment for already verified enrollment'
  );
});

// ---------------------------------------------------------------------
// SUITE 2: ASSIGNMENT SUBMISSION & GRADING STRESS TESTS
// ---------------------------------------------------------------------

test('Stress 2.1 - Assignment Submission Validation & Resubmission Cycle', () => {
  const db = new FSLDatabaseEngine();

  // 1. Non-enrolled learner cannot submit coursework
  assert.throws(
    () => db.submitAssignment('learner-1', 'asg-1', { file_url: 'https://youtu.be/abc' }),
    /not currently enrolled/i,
    'Unenrolled learner must not submit coursework'
  );

  // 2. Non-existent assignment rejection
  assert.throws(
    () => db.submitAssignment('learner-2', 'asg-nonexistent', { file_url: 'https://youtu.be/abc' }),
    /not found/i,
    'Non-existent assignment must throw'
  );

  // 3. Empty or whitespace URL rejection
  assert.throws(
    () => db.submitAssignment('learner-2', 'asg-1', { file_url: '' }),
    /required/i,
    'Empty URL must be rejected'
  );
  assert.throws(
    () => db.submitAssignment('learner-2', 'asg-1', { file_url: '     ' }),
    /required/i,
    'Whitespace URL must be rejected'
  );

  // 4. Valid initial submission
  const sub1 = db.submitAssignment('learner-2', 'asg-1', {
    file_url: 'https://storage.fsl.ph/submissions/v1.mp4',
  });
  assert.ok(sub1.id);
  assert.equal(sub1.file_url, 'https://storage.fsl.ph/submissions/v1.mp4');

  // 5. Resubmission / update before grading
  const sub2 = db.submitAssignment('learner-2', 'asg-1', {
    file_url: 'https://storage.fsl.ph/submissions/v2-improved.mp4',
  });
  assert.equal(sub1.id, sub2.id, 'Resubmission must update the existing record rather than duplicating');
  assert.equal(sub2.file_url, 'https://storage.fsl.ph/submissions/v2-improved.mp4');
});

test('Stress 2.2 - Grading Score Boundaries & Feedback Audit', () => {
  const db = new FSLDatabaseEngine();
  const sub = db.submissions.find((s) => s.id === 'sub-1');
  assert.ok(sub);

  // 1. Min boundary grade 0
  db.gradeSubmission('prof-2', 'sub-1', { grade: 0, feedback: 'Needs resubmission' });
  assert.equal(sub.grade, 0);

  // 2. Max boundary grade 100
  db.gradeSubmission('prof-2', 'sub-1', { grade: 100, feedback: 'Flawless non-manual signals' });
  assert.equal(sub.grade, 100);

  // 3. Out-of-bounds negative grade
  assert.throws(
    () => db.gradeSubmission('prof-2', 'sub-1', { grade: -1, feedback: 'Negative' }),
    /between 0 and 100/i
  );

  // 4. Out-of-bounds excessive grade
  assert.throws(
    () => db.gradeSubmission('prof-2', 'sub-1', { grade: 101, feedback: 'Excessive' }),
    /between 0 and 100/i
  );

  // 5. Non-numeric grade
  assert.throws(
    () => db.gradeSubmission('prof-2', 'sub-1', { grade: 'A+', feedback: 'Letter' }),
    /between 0 and 100/i
  );

  // 6. Unauthorized professor grading
  assert.throws(
    () => db.gradeSubmission('prof-1', 'sub-1', { grade: 88, feedback: 'Wrong prof' }),
    /Authorization error/i,
    'Unassigned professor cannot grade submission'
  );
});

// ---------------------------------------------------------------------
// SUITE 3: VIDEO PLAYER & 6 GROUNDED CATEGORIES FILTERING
// ---------------------------------------------------------------------

test('Stress 3.1 - Grounded Video Categories Exactness & Integrity', () => {
  const expectedCategories = [
    'Alphabet / Fingerspelling',
    'Basic Greetings',
    'Numbers',
    'Common Expressions',
    'Everyday Conversations',
    'Vocabulary Lessons',
  ];

  // 1. Harness categories match expected exactly
  assert.equal(VIDEO_CATEGORIES.length, 6, 'Must have exactly 6 grounded categories');
  for (const cat of expectedCategories) {
    assert.ok(VIDEO_CATEGORIES.includes(cat), `Category "${cat}" must be present in VIDEO_CATEGORIES`);
  }

  // 2. Inspect learner-data.ts GROUNDED_VIDEO_CATEGORIES
  const learnerDataSrc = fs.readFileSync(path.join(rootDir, 'src', 'lib', 'learner-data.ts'), 'utf8');
  for (const cat of expectedCategories) {
    assert.ok(
      learnerDataSrc.includes(cat),
      `learner-data.ts must define grounded category: "${cat}"`
    );
  }

  // 3. Inspect LearningMaterialsClient.tsx filter buttons
  const materialsClientSrc = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'materials', 'LearningMaterialsClient.tsx'),
    'utf8'
  );
  for (const cat of expectedCategories) {
    assert.ok(
      materialsClientSrc.includes(cat),
      `LearningMaterialsClient.tsx must render filter for category: "${cat}"`
    );
  }

  // 4. Ungrounded category upload rejection
  const db = new FSLDatabaseEngine();
  assert.throws(
    () =>
      db.uploadVideo('prof-1', {
        level: 1,
        title: 'Unauthorized Category Video',
        category: 'NonExistentCategory',
        video_url: 'https://example.com/v.mp4',
      }),
    /Invalid video category/i
  );
});

test('Stress 3.2 - Accessible Video Player Speed Controls & Loop Toggle Contract', () => {
  const playerSrc = fs.readFileSync(
    path.join(rootDir, 'src', 'components', 'video', 'AccessibleVideoPlayer.tsx'),
    'utf8'
  );

  // 1. Playback speeds 0.5x, 0.75x, and 1.0x present
  assert.ok(playerSrc.includes('0.5'), 'Must support 0.5x slow motion for fingerspelling');
  assert.ok(playerSrc.includes('0.75'), 'Must support 0.75x moderate speed');
  assert.ok(playerSrc.includes('1.0'), 'Must support 1.0x normal speed');
  assert.ok(playerSrc.includes('handleRateChange'), 'Must have handleRateChange handler');

  // 2. Loop toggle
  assert.ok(playerSrc.includes('toggleLoop'), 'Must provide toggleLoop handler');
  assert.ok(playerSrc.includes('isLooping'), 'Must track isLooping state');
  assert.ok(
    playerSrc.includes('useState(true)') || playerSrc.includes('useState<boolean>(true)') || playerSrc.includes('isLooping, setIsLooping] = useState(true)'),
    'Default loop must be ON for repetitive sign language practice'
  );

  // 3. Accessible attributes
  assert.ok(playerSrc.includes('aria-label'), 'Must have aria-label on interactive controls');
  assert.ok(playerSrc.includes('aria-pressed'), 'Must have aria-pressed on loop toggle button');
  assert.ok(playerSrc.includes('focus-visible'), 'Must have visible keyboard focus rings');
});

// ---------------------------------------------------------------------
// SUITE 4: PROGRESSION CALCULATIONS ACROSS LEVELS 1, 2, AND 3
// ---------------------------------------------------------------------

test('Stress 4.1 - Multi-Stage Progression Ladder State Machine', () => {
  const db = new FSLDatabaseEngine();

  // Test Case A: Brand New Learner (0 completed levels)
  const freshProg = db.getLearnerProgression('learner-1');
  assert.deepEqual(freshProg.completedLevels, []);
  assert.equal(freshProg.currentLevel, 0);
  assert.equal(freshProg.nextLevel, 1);
  assert.equal(freshProg.isGraduated, false);
  const bsliA = freshProg.pathways.find((p) => p.name.includes('BSLI'));
  assert.equal(bsliA.eligible, false, 'BSLI requires Level 2+ completion');

  // Test Case B: Completed Level 1 Only
  // Create completed Level 1 enrollment for learner-1
  db.enrollments.push({
    id: 'e-stress-l1',
    learner_id: 'learner-1',
    schedule_id: 's-1', // Level 1 schedule
    status: 'completed',
  });
  const l1Prog = db.getLearnerProgression('learner-1');
  assert.deepEqual(l1Prog.completedLevels, [1]);
  assert.equal(l1Prog.currentLevel, 1);
  assert.equal(l1Prog.nextLevel, 2);
  assert.equal(l1Prog.isGraduated, false);
  const bsliB = l1Prog.pathways.find((p) => p.name.includes('BSLI'));
  assert.equal(bsliB.eligible, false, 'BSLI still locked after Level 1 only');

  // Test Case C: Completed Level 1 and Level 2
  db.enrollments.push({
    id: 'e-stress-l2',
    learner_id: 'learner-1',
    schedule_id: 's-2', // Level 2 schedule
    status: 'completed',
  });
  const l2Prog = db.getLearnerProgression('learner-1');
  assert.deepEqual(l2Prog.completedLevels, [1, 2]);
  assert.equal(l2Prog.currentLevel, 2);
  assert.equal(l2Prog.nextLevel, 3);
  assert.equal(l2Prog.isGraduated, false);
  const bsliC = l2Prog.pathways.find((p) => p.name.includes('BSLI'));
  assert.equal(bsliC.eligible, true, 'BSLI unlocked after completing Level 2');
  const adsC = l2Prog.pathways.find((p) => p.name.includes('Applied Deaf Studies'));
  assert.equal(adsC.eligible, true, 'Applied Deaf Studies unlocked after completing Level 2');

  // Test Case D: Completed Levels 1, 2, and 3 (Full Graduation)
  db.enrollments.push({
    id: 'e-stress-l3',
    learner_id: 'learner-1',
    schedule_id: 's-3', // Level 3 schedule
    status: 'completed',
  });
  const l3Prog = db.getLearnerProgression('learner-1');
  assert.deepEqual(l3Prog.completedLevels, [1, 2, 3]);
  assert.equal(l3Prog.currentLevel, 3);
  assert.equal(l3Prog.nextLevel, null, 'nextLevel is null once Level 3 is completed');
  assert.equal(l3Prog.isGraduated, true, 'Learner is officially graduated after Level 3');
  const bsliD = l3Prog.pathways.find((p) => p.name.includes('BSLI'));
  assert.equal(bsliD.eligible, true);
});

test('Stress 4.2 - Deduplication & In-Progress Isolation in Progression', () => {
  const db = new FSLDatabaseEngine();

  // If a student took two different cohorts of Level 1 and completed both:
  db.enrollments.push(
    { id: 'e-dup-1', learner_id: 'learner-1', schedule_id: 's-1', status: 'completed' },
    { id: 'e-dup-2', learner_id: 'learner-1', schedule_id: 's-1', status: 'completed' }
  );
  const prog = db.getLearnerProgression('learner-1');
  assert.equal(
    prog.completedLevels.filter((lvl) => lvl === 1).length,
    1,
    'Level 1 must not appear more than once in completedLevels'
  );

  // If a student is currently active ('enrolled') in Level 2, it must not count as completed
  db.enrollments.push({
    id: 'e-active-l2',
    learner_id: 'learner-1',
    schedule_id: 's-2',
    status: 'enrolled',
  });
  const progActive = db.getLearnerProgression('learner-1');
  assert.equal(
    progActive.completedLevels.includes(2),
    false,
    'Active in-progress enrollment must not count as completed'
  );
  assert.equal(progActive.currentLevel, 1);
  assert.equal(progActive.nextLevel, 2);
});
