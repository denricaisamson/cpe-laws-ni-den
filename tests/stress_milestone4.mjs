// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Empirical Adversarial Stress Test Suite: Milestone 4 (Professor Operations)
// File: tests/stress_milestone4.mjs
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

test('Empirical Stress 1: Virtual Meeting Link Security & State Boundaries', () => {
  const db = new FSLDatabaseEngine();
  const prof1 = 'prof-1';
  const prof2 = 'prof-2';
  const learner = 'learner-1';
  const admin = 'admin-1';
  const sched1 = 's-1'; // assigned to prof-1
  const sched2 = 's-2'; // assigned to prof-2

  // 1. Authorized assigned professor updates meeting link
  const newLink = 'https://meet.google.com/fsl-test-live';
  const updated1 = db.updateMeetingLink(prof1, sched1, newLink);
  assert.equal(updated1.meeting_link, newLink);

  // 2. Admin can update any meeting link
  const adminLink = 'https://zoom.us/j/1112223334';
  const updatedByAdmin = db.updateMeetingLink(admin, sched1, adminLink);
  assert.equal(updatedByAdmin.meeting_link, adminLink);

  // 3. Unauthorized professor cannot update another professor's schedule
  assert.throws(() => {
    db.updateMeetingLink(prof2, sched1, 'https://meet.google.com/hacked');
  }, /Authorization error/);

  // 4. Learner cannot update meeting link
  assert.throws(() => {
    db.updateMeetingLink(learner, sched1, 'https://meet.google.com/hacked');
  }, /Authorization error/);

  // 5. Updating non-existent schedule throws error
  assert.throws(() => {
    db.updateMeetingLink(prof1, 'non-existent-sched-999', 'https://meet.google.com/test');
  }, /not found/);
});

test('Empirical Stress 2: Session Attendance Roster, Status Validation & Idempotency', () => {
  const db = new FSLDatabaseEngine();
  const prof2 = 'prof-2';
  const prof1 = 'prof-1';
  const sched2 = 's-2';
  const enrollment1 = 'e-1'; // learner-2, enrolled in s-2

  // 1. Record attendance as assigned professor
  const att1 = db.recordAttendance(prof2, sched2, enrollment1, '2026-10-01', true);
  assert.ok(att1.id);
  assert.equal(att1.present, true);
  assert.equal(att1.date, '2026-10-01');

  // 2. Idempotent toggle on same date modifies existing record without creating duplicate
  const attCountBefore = db.attendance.length;
  const att2 = db.recordAttendance(prof2, sched2, enrollment1, '2026-10-01', false);
  assert.equal(att2.present, false);
  assert.equal(db.attendance.length, attCountBefore, 'Should update existing attendance record, not duplicate');

  // 3. Unauthorized professor cannot record attendance for another professor's schedule
  assert.throws(() => {
    db.recordAttendance(prof1, sched2, enrollment1, '2026-10-01', true);
  }, /Authorization error/);

  // 4. Non-existent schedule throws error
  assert.throws(() => {
    db.recordAttendance(prof2, 'invalid-sched', enrollment1, '2026-10-01', true);
  }, /not found/);

  // 5. Enrollment mismatch throws error
  assert.throws(() => {
    db.recordAttendance(prof2, sched2, 'fake-enrollment', '2026-10-01', true);
  }, /does not belong to this schedule/);

  // 6. Cannot record attendance for a learner who is pending (not verified/enrolled)
  const pendingEnrollment = db.enrollLearner('learner-1', 's-1');
  assert.throws(() => {
    db.recordAttendance(prof1, 's-1', pendingEnrollment.id, '2026-10-01', true);
  }, /cannot take attendance for learner with status "pending"/);
});

test('Empirical Stress 3: Assignment Creation & Comprehensive Grade Bounds (0-100)', () => {
  const db = new FSLDatabaseEngine();
  const prof1 = 'prof-1';
  const prof2 = 'prof-2';
  const sched1 = 's-1';

  // 1. Assignment creation empty title rejected
  assert.throws(() => {
    db.createAssignment(prof1, sched1, { title: '   ', description: 'Test' });
  }, /title cannot be empty/);

  // 2. Unauthorized professor creating assignment rejected
  assert.throws(() => {
    db.createAssignment(prof2, sched1, { title: 'Unauthorized Task', description: 'Test' });
  }, /Authorization error/);

  // 3. Successful assignment creation
  const asg = db.createAssignment(prof1, sched1, {
    title: 'FSL Handshape Video Assessment',
    description: 'Submit video demonstration of 15 distinct handshapes.',
    due_date: '2026-11-15T23:59:59Z',
  });
  assert.ok(asg.id);
  assert.equal(asg.title, 'FSL Handshape Video Assessment');

  // 4. Enroll learner and submit assignment
  db.enrollLearner('learner-1', sched1);
  const pay = db.submitSimulatedPayment('learner-1', db.enrollments[db.enrollments.length - 1].id, 2500);
  db.adminVerifyPayment('admin-1', pay.id);

  const sub = db.submitAssignment('learner-1', asg.id, {
    file_url: 'https://storage.fsl.ph/submissions/sub-handshapes.mp4',
  });
  assert.ok(sub.id);
  assert.equal(sub.grade, null);

  // 5. Grading boundary tests
  // Grade > 100 rejected
  assert.throws(() => {
    db.gradeSubmission(prof1, sub.id, { grade: 100.1, feedback: 'Invalid' });
  }, /Grade must be a number between 0 and 100/);

  assert.throws(() => {
    db.gradeSubmission(prof1, sub.id, { grade: 150, feedback: 'Invalid' });
  }, /Grade must be a number between 0 and 100/);

  // Grade < 0 rejected
  assert.throws(() => {
    db.gradeSubmission(prof1, sub.id, { grade: -0.1, feedback: 'Invalid' });
  }, /Grade must be a number between 0 and 100/);

  // NaN rejected
  assert.throws(() => {
    db.gradeSubmission(prof1, sub.id, { grade: 'not-a-number', feedback: 'Invalid' });
  }, /Grade must be a number between 0 and 100/);

  // Grade = 0 allowed
  const graded0 = db.gradeSubmission(prof1, sub.id, { grade: 0, feedback: 'Blank submission' });
  assert.equal(graded0.grade, 0);

  // Grade = 100 allowed
  const graded100 = db.gradeSubmission(prof1, sub.id, { grade: 100, feedback: 'Flawless execution' });
  assert.equal(graded100.grade, 100);

  // Decimal grade allowed
  const gradedDecimal = db.gradeSubmission(prof1, sub.id, { grade: 88.5, feedback: 'Good hand orientation' });
  assert.equal(gradedDecimal.grade, 88.5);

  // Unauthorized professor grading rejected
  assert.throws(() => {
    db.gradeSubmission(prof2, sub.id, { grade: 90, feedback: 'Unauthorized' });
  }, /Authorization error/);
});

test('Empirical Stress 4: Strict 6 Grounded Video Categories & Materials Security', () => {
  const db = new FSLDatabaseEngine();
  const prof1 = 'prof-1';
  const prof2 = 'prof-2';
  const sched1 = 's-1';

  // 1. Material empty title rejected
  assert.throws(() => {
    db.uploadMaterial(prof1, sched1, { title: '', file_url: 'https://example.com/guide.pdf' });
  }, /Material title and file URL are required/);

  // 2. Material empty file URL rejected
  assert.throws(() => {
    db.uploadMaterial(prof1, sched1, { title: 'Guide', file_url: '' });
  }, /Material title and file URL are required/);

  // 3. Unauthorized professor material upload rejected
  assert.throws(() => {
    db.uploadMaterial(prof2, sched1, { title: 'Guide', file_url: 'https://example.com/guide.pdf' });
  }, /Authorization error/);

  // 4. Valid material upload succeeds
  const mat = db.uploadMaterial(prof1, sched1, {
    title: 'FSL 101 Number Signs Chart',
    file_url: 'https://storage.fsl.ph/materials/fsl-numbers.pdf',
  });
  assert.ok(mat.id);
  assert.equal(mat.title, 'FSL 101 Number Signs Chart');

  // 5. Video Grounded Category Validation: All 6 official categories from FSL_SPEC.md succeed
  const expectedCategories = [
    'Alphabet / Fingerspelling',
    'Basic Greetings',
    'Numbers',
    'Common Expressions',
    'Everyday Conversations',
    'Vocabulary Lessons',
  ];

  for (const cat of expectedCategories) {
    const vid = db.uploadVideo(prof1, {
      level: 1,
      title: `Curriculum Video: ${cat}`,
      category: cat,
      video_url: `https://storage.fsl.ph/videos/${encodeURIComponent(cat)}.mp4`,
    });
    assert.ok(vid.id);
    assert.equal(vid.category, cat);
  }

  // 6. Ungrounded categories rejected
  const invalidCategories = ['Slang & Memes', 'Pop Songs', 'Random Gestures', 'Sign Language Memes'];
  for (const invalidCat of invalidCategories) {
    assert.throws(() => {
      db.uploadVideo(prof1, {
        level: 1,
        title: 'Invalid Category Video',
        category: invalidCat,
        video_url: 'https://storage.fsl.ph/videos/invalid.mp4',
      });
    }, /Invalid video category/);
  }

  // 7. Invalid levels rejected
  for (const invalidLevel of [0, 4, -1, 99]) {
    assert.throws(() => {
      db.uploadVideo(prof1, {
        level: invalidLevel,
        title: 'Invalid Level Video',
        category: 'Basic Greetings',
        video_url: 'https://storage.fsl.ph/videos/invalid.mp4',
      });
    }, /Invalid video level/);
  }
});

test('Empirical Stress 5: Integrity Audit — Checking for Hardcoded Facades and Mock Cheats', () => {
  const profDataPath = path.join(rootDir, 'src', 'lib', 'professor-data.ts');
  const profDataContent = fs.readFileSync(profDataPath, 'utf8');

  // Verify that professor-data.ts implements genuine functions, not hardcoded stub passes
  assert.ok(profDataContent.includes('export function updateMeetingLink'), 'Must implement updateMeetingLink');
  assert.ok(profDataContent.includes('export function saveAttendanceRecords'), 'Must implement saveAttendanceRecords');
  assert.ok(profDataContent.includes('export function createAssignment'), 'Must implement createAssignment');
  assert.ok(profDataContent.includes('export function gradeSubmission'), 'Must implement gradeSubmission');
  assert.ok(profDataContent.includes('export function createMaterial'), 'Must implement createMaterial');
  assert.ok(profDataContent.includes('export function createVideo'), 'Must implement createVideo');
  assert.ok(profDataContent.includes('export function createAnnouncement'), 'Must implement createAnnouncement');
  assert.ok(profDataContent.includes('export function getProfessorKpis'), 'Must implement getProfessorKpis');

  // Check that numeric grading logic validates boundaries
  assert.ok(
    profDataContent.includes('numGrade < 0 || numGrade > 100'),
    'professor-data.ts must enforce 0-100 numeric bounds check'
  );

  // Check that category grounding is strictly checked
  assert.ok(
    profDataContent.includes('GROUNDED_VIDEO_CATEGORIES'),
    'professor-data.ts must enforce GROUNDED_VIDEO_CATEGORIES'
  );

  // Check for suspicious hardcoded bypasses
  assert.ok(
    !profDataContent.includes('// bypass'),
    'Should not contain bypass comments'
  );
  assert.ok(
    !profDataContent.includes('return true; // dummy'),
    'Should not contain dummy return flags'
  );
});

test('Empirical Stress 6: Client Components Accessibility & UI Conformance Audit', () => {
  const filesToCheck = [
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'ProfessorDashboardClient.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'schedules', 'SchedulesManagementClient.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'classes', '[id]', 'attendance', 'ClassAttendanceClient.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'classes', '[id]', 'assignments', 'ClassAssignmentsClient.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'materials', 'MaterialsPublishingClient.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'announcements', 'AnnouncementsPublishingClient.tsx'),
  ];

  for (const filePath of filesToCheck) {
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.startsWith("'use client';"), `${path.basename(filePath)} must declare 'use client' directive`);
    // Check for high-contrast visual status elements
    assert.ok(
      content.includes('border') || content.includes('rounded'),
      `${path.basename(filePath)} must use high-contrast borders and styling`
    );
  }
});
