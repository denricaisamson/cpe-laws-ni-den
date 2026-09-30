// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Empirical Stress Test Suite: Milestone 5 (Learner Experience & Progression)
// File: tests/empirical-m5-stress.test.mjs
// =====================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FSLDatabaseEngine, VIDEO_CATEGORIES } from './e2e/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const GROUNDED_CATEGORIES = [
  'Alphabet / Fingerspelling',
  'Basic Greetings',
  'Numbers',
  'Common Expressions',
  'Everyday Conversations',
  'Vocabulary Lessons',
];

// ---------------------------------------------------------------------
// TARGET 1: SIMULATED CHECKOUT & PAYMENT SEPARATION INTEGRITY
// ---------------------------------------------------------------------
test('Target 1 - Checkout & Payment Separation: Atomic pending state, slots decrement, and admin verification gating', () => {
  const db = new FSLDatabaseEngine();

  // Find Level 2 workshop and schedule
  const l2Workshop = db.workshops.find((w) => w.level === 2);
  assert.ok(l2Workshop, 'Level 2 workshop must exist');
  const l2Schedule = db.schedules.find((s) => s.workshop_id === l2Workshop.id);
  assert.ok(l2Schedule, 'Level 2 schedule must exist');

  const initialSlots = l2Schedule.slots;
  assert.ok(initialSlots > 0, 'Schedule must have initial slots');

  const learnerId = 'stress-learner-checkout-1';
  db.profiles.push({
    id: learnerId,
    name: 'Checkout Tester',
    email: 'checkout@test.ph',
    role: 'learner',
  });

  // 1. Learner enrolls via simulated checkout
  const enrollment = db.enrollLearner(learnerId, l2Schedule.id);

  // FORENSIC ASSERTION 1: Enrollment status must be 'pending', NEVER 'enrolled'
  assert.equal(enrollment.status, 'pending', 'Checkout must create pending enrollment');
  assert.notEqual(enrollment.status, 'enrolled', 'Learner checkout must NOT bypass admin verification');

  // FORENSIC ASSERTION 2: Available slots decremented
  assert.equal(l2Schedule.slots, initialSlots - 1, 'Slots must decrement by 1');

  // 2. Submit simulated payment
  const payment = db.submitSimulatedPayment(learnerId, enrollment.id, l2Workshop.fee);

  // FORENSIC ASSERTION 3: Payment status must be 'pending', NEVER 'verified'
  assert.equal(payment.status, 'pending', 'Payment status must be pending');
  assert.notEqual(payment.status, 'verified', 'Learner cannot self-verify payment');
  assert.equal(payment.amount, l2Workshop.fee, 'Payment amount must match workshop fee');

  // 3. Duplicate checkout rejection
  assert.throws(
    () => {
      db.enrollLearner(learnerId, l2Schedule.id);
    },
    /already enrolled or pending/i,
    'Duplicate checkout in same schedule must be blocked'
  );

  // 4. Admin verification requirement
  // Check that admin is required to transition to 'verified' / 'enrolled'
  const verifyResult = db.adminVerifyPayment('admin-1', payment.id);
  assert.equal(verifyResult.payment.status, 'verified', 'Admin must verify payment');
  assert.equal(verifyResult.enrollment.status, 'enrolled', 'Enrollment becomes enrolled only upon admin verification');
});

test('Target 1 - Checkout Boundary Conditions: Zero slots, invalid IDs, and missing references', () => {
  const db = new FSLDatabaseEngine();

  const learnerId = 'stress-learner-boundary';
  db.profiles.push({
    id: learnerId,
    name: 'Boundary Tester',
    email: 'boundary@test.ph',
    role: 'learner',
  });

  const sched = db.schedules[0];
  const origSlots = sched.slots;

  // 1. Empty/zero slots rejection
  sched.slots = 0;
  assert.throws(
    () => {
      db.enrollLearner(learnerId, sched.id);
    },
    /available slots/i,
    'Enrollment in full schedule must be rejected'
  );

  // Restore slots
  sched.slots = origSlots;

  // 2. Non-existent schedule
  assert.throws(
    () => {
      db.enrollLearner(learnerId, 'sched-does-not-exist');
    },
    /not found/i,
    'Non-existent schedule must throw error'
  );

  // 3. Payment for non-existent enrollment
  assert.throws(
    () => {
      db.submitSimulatedPayment(learnerId, 'enr-fake', 2500);
    },
    /not found/i,
    'Payment for fake enrollment must fail'
  );
});

// ---------------------------------------------------------------------
// TARGET 2: COURSEWORK SUBMISSION & MULTI-TURN DRILL RESUBMISSION
// ---------------------------------------------------------------------
test('Target 2 - Coursework Submissions: Submission creation, empty URL rejection, and resubmission preservation', () => {
  const db = new FSLDatabaseEngine();

  // Create an assignment
  const asg = db.createAssignment('prof-1', 's-1', {
    title: 'Visual Morphology Practice',
    description: 'Sign 5 emotion expressions with correct facial morphology.',
    due_date: '2026-11-20T23:59:59Z',
  });

  const learnerId = 'learner-sub-test';
  db.profiles.push({
    id: learnerId,
    name: 'Submission Student',
    email: 'sub@student.ph',
    role: 'learner',
  });

  // Ensure learner is enrolled in s-1
  const enr = db.enrollLearner(learnerId, 's-1');
  const pay = db.submitSimulatedPayment(learnerId, enr.id, 2500);
  db.adminVerifyPayment('admin-1', pay.id);

  // 1. Rejection of blank / whitespace submission link
  assert.throws(
    () => {
      db.submitAssignment(learnerId, asg.id, { file_url: '' });
    },
    /required/i,
    'Empty submission URL must be rejected'
  );

  assert.throws(
    () => {
      db.submitAssignment(learnerId, asg.id, { file_url: '    ' });
    },
    /required/i,
    'Whitespace submission URL must be rejected'
  );

  // 2. Valid submission
  const firstSub = db.submitAssignment(learnerId, asg.id, {
    file_url: 'https://storage.fsl.ph/submissions/sub-v1.mp4',
  });
  assert.ok(firstSub.id, 'Submission must have ID');
  assert.equal(firstSub.file_url, 'https://storage.fsl.ph/submissions/sub-v1.mp4');
  assert.equal(firstSub.grade, null, 'Grade must initially be null');
  assert.equal(firstSub.feedback, null, 'Feedback must initially be null');

  // 3. Resubmission update: updates URL in-place without duplicating records
  const secondSub = db.submitAssignment(learnerId, asg.id, {
    file_url: 'https://storage.fsl.ph/submissions/sub-v2-corrected.mp4',
  });
  assert.equal(secondSub.file_url, 'https://storage.fsl.ph/submissions/sub-v2-corrected.mp4');

  const allStudentSubs = db.submissions.filter(
    (s) => s.assignment_id === asg.id && s.learner_id === learnerId
  );
  assert.equal(allStudentSubs.length, 1, 'Resubmission must update existing record without duplicating');
});

// ---------------------------------------------------------------------
// TARGET 3: PROGRESSION ROADMAP & ACADEMIC PATHWAYS DYNAMIC EVALUATION
// ---------------------------------------------------------------------
test('Target 3 - Progression Roadmap: Dynamic level completion, prerequisite gating, and BSLI pathway eligibility', () => {
  const db = new FSLDatabaseEngine();

  // Test Case A: Brand new learner (0 completed levels)
  const newLearnerId = 'prog-new-learner';
  db.profiles.push({
    id: newLearnerId,
    name: 'New Beginner',
    email: 'new@beginner.ph',
    role: 'learner',
  });

  const prog0 = db.getLearnerProgression(newLearnerId);
  assert.deepEqual(prog0.completedLevels, [], 'New learner has 0 completed levels');
  assert.equal(prog0.currentLevel, 0, 'New learner current level is 0');
  assert.equal(prog0.nextLevel, 1, 'Next recommended level is Level 1');

  // Check pathway eligibility for beginner
  const bsliBeginner = prog0.pathways.find((p) => p.name.includes('BSLI'));
  assert.ok(bsliBeginner, 'BSLI pathway must exist');
  assert.equal(bsliBeginner.eligible, false, 'Beginner without Level 2+ is not eligible for BSLI');

  const adsBeginner = prog0.pathways.find((p) => p.name.includes('Applied Deaf Studies'));
  assert.ok(adsBeginner, 'Applied Deaf Studies pathway must exist');
  assert.equal(adsBeginner.eligible, false, 'Beginner without Level 2+ is not eligible for ADS');

  // Test Case B: Intermediate learner who completed Level 1 & Level 2 (learner-3 from seed)
  const progL3 = db.getLearnerProgression('learner-3');
  assert.ok(progL3.completedLevels.includes(2), 'Learner 3 completed Level 2');
  assert.equal(progL3.nextLevel, 3, 'Next recommended level is Level 3');

  const bsliL3 = progL3.pathways.find((p) => p.name.includes('BSLI'));
  assert.equal(bsliL3.eligible, true, 'Learner 3 with Level 2 is eligible for BSLI');

  const adsL3 = progL3.pathways.find((p) => p.name.includes('Applied Deaf Studies'));
  assert.equal(adsL3.eligible, true, 'Learner 3 with Level 2 is eligible for Applied Deaf Studies');
});

// ---------------------------------------------------------------------
// TARGET 4: 6 GROUNDED CURRICULUM CATEGORIES SPEC COMPLIANCE
// ---------------------------------------------------------------------
test('Target 4 - Grounded Categories: Strict correspondence with FSL_SPEC.md', () => {
  const specContent = fs.readFileSync(path.join(rootDir, 'FSL_SPEC.md'), 'utf8');
  const learnerDataContent = fs.readFileSync(path.join(rootDir, 'src', 'lib', 'learner-data.ts'), 'utf8');
  const materialsContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'materials', 'LearningMaterialsClient.tsx'),
    'utf8'
  );

  for (const cat of GROUNDED_CATEGORIES) {
    // 1. In specification
    assert.ok(specContent.includes(cat), `Category "${cat}" must exist in FSL_SPEC.md`);

    // 2. In learner-data.ts GROUNDED_VIDEO_CATEGORIES
    assert.ok(learnerDataContent.includes(cat), `Category "${cat}" must exist in learner-data.ts`);

    // 3. In LearningMaterialsClient.tsx UI filter
    assert.ok(materialsContent.includes(cat), `Category "${cat}" must exist in LearningMaterialsClient.tsx`);

    // 4. In harness.js VIDEO_CATEGORIES
    assert.ok(VIDEO_CATEGORIES.includes(cat), `Category "${cat}" must exist in harness.js`);
  }
});

// ---------------------------------------------------------------------
// TARGET 5: SOURCE CODE INTEGRITY (NO CHEATING, FACADES, OR DUMMY RETURNS)
// ---------------------------------------------------------------------
test('Target 5 - Forensic Cleanliness: No hardcoded test bypasses, dummy returns, or facades', () => {
  const filesToScan = [
    'src/lib/learner-data.ts',
    'src/app/(learner)/learner/workshops/WorkshopCatalogClient.tsx',
    'src/app/(learner)/learner/classes/LearnerClassesClient.tsx',
    'src/app/(learner)/learner/classes/[id]/ClassDetailClient.tsx',
    'src/app/(learner)/learner/coursework/LearnerCourseworkClient.tsx',
    'src/app/(learner)/learner/materials/LearningMaterialsClient.tsx',
    'src/app/(learner)/learner/progression/LearnerProgressionClient.tsx',
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
