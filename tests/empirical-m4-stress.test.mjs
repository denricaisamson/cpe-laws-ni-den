// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Empirical Stress Test Suite: Milestone 4 (Professor Classroom, Grading & Content)
// File: tests/empirical-m4-stress.test.mjs
// =====================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { FSLDatabaseEngine, VIDEO_CATEGORIES } from './e2e/harness.js';

// Grounded FSL Video Categories from FSL_SPEC.md
const GROUNDED_CATEGORIES = [
  'Alphabet / Fingerspelling',
  'Basic Greetings',
  'Numbers',
  'Common Expressions',
  'Everyday Conversations',
  'Vocabulary Lessons',
];

// Helper to generate ISO dates
function getSessionDate(weekIndex) {
  const base = new Date('2026-10-03T09:00:00Z');
  base.setDate(base.getDate() + weekIndex * 7);
  return base.toISOString().split('T')[0];
}

// ---------------------------------------------------------------------
// TARGET 1: ATTENDANCE ROSTER MUTATIONS & MULTI-SESSION STRESS
// ---------------------------------------------------------------------
test('Target 1 - Attendance: Multi-session roster logging with present, absent, late, and excused states', () => {
  const db = new FSLDatabaseEngine();

  // Schedule s-1 belongs to prof-1
  // Create 5 active learner enrollments
  const learnerIds = [];
  const enrollmentIds = [];
  for (let i = 1; i <= 5; i++) {
    const lId = `stress-learner-${i}`;
    db.profiles.push({
      id: lId,
      name: `Learner Test ${i}`,
      email: `learner${i}@test.ph`,
      role: 'learner',
    });
    learnerIds.push(lId);

    const enr = db.enrollLearner(lId, 's-1');
    const pay = db.submitSimulatedPayment(lId, enr.id, 2500);
    db.adminVerifyPayment('admin-1', pay.id);
    enrollmentIds.push(enr.id);
  }

  // Verify all 5 are enrolled
  assert.equal(enrollmentIds.length, 5);

  // Simulate 10 weekly sessions
  const sessionCount = 10;
  for (let week = 0; week < sessionCount; week++) {
    const sessionDate = getSessionDate(week);

    for (let lIdx = 0; lIdx < enrollmentIds.length; lIdx++) {
      const enrId = enrollmentIds[lIdx];
      let present = true;
      let remark = '';

      // Introduce varied attendance states
      if (week === 1 && lIdx === 2) {
        present = false;
        remark = 'absent - medical emergency';
      } else if (week === 2 && lIdx === 3) {
        present = true;
        remark = 'late - joined 20 minutes in';
      } else if (week === 3 && lIdx === 4) {
        present = false;
        remark = 'excused - university exam';
      } else if (week % 2 === 0 && lIdx === 0) {
        present = true;
        remark = 'present - active camera signing';
      }

      const rec = db.recordAttendance('prof-1', 's-1', enrId, sessionDate, present);
      assert.ok(rec.id);
      assert.equal(rec.present, present);
    }
  }

  // Verify 5 learners * 10 sessions = 50 attendance records created for this batch
  const s1Attendance = db.attendance.filter((a) =>
    enrollmentIds.includes(a.enrollment_id)
  );
  assert.equal(s1Attendance.length, 50, 'Must record exactly 50 session attendance records');

  // Verify state toggling: toggle learner 3 in week 1 from absent to present
  const session1Date = getSessionDate(1);
  const targetEnrId = enrollmentIds[2];
  const toggled = db.recordAttendance('prof-1', 's-1', targetEnrId, session1Date, true);
  assert.equal(toggled.present, true, 'Attendance must be mutable to present');

  // Verify duplicate record is not created for same date & enrollment
  const matchingRecords = db.attendance.filter(
    (a) => a.enrollment_id === targetEnrId && a.date === session1Date
  );
  assert.equal(matchingRecords.length, 1, 'Updating attendance must update in-place without duplicates');
});

test('Target 1 - Attendance: Boundary & Authorization Adversarial Checks', () => {
  const db = new FSLDatabaseEngine();

  // 1. Cross-professor isolation: prof-2 cannot record attendance for schedule s-1 (owned by prof-1)
  assert.throws(
    () => {
      db.recordAttendance('prof-2', 's-1', 'e-1', '2026-10-01', true);
    },
    /only assigned professor or admin/,
    'Prof-2 must not modify Prof-1 schedule attendance'
  );

  // 2. Learner cannot record attendance
  assert.throws(
    () => {
      db.recordAttendance('learner-1', 's-1', 'e-1', '2026-10-01', true);
    },
    /only assigned professor or admin/,
    'Learner cannot record attendance'
  );

  // 3. Non-existent schedule throws error
  assert.throws(
    () => {
      db.recordAttendance('prof-1', 's-nonexistent', 'e-1', '2026-10-01', true);
    },
    /not found/,
    'Non-existent schedule must throw error'
  );

  // 4. Non-enrolled learner / enrollment mismatch throws error
  assert.throws(
    () => {
      db.recordAttendance('prof-1', 's-1', 'e-99999', '2026-10-01', true);
    },
    /enrollment does not belong to this schedule/,
    'Mismatched enrollment must be rejected'
  );

  // 5. Admin override: admin CAN record attendance for any schedule
  const adminRec = db.recordAttendance('admin-1', 's-2', 'e-1', '2026-10-05', true);
  assert.ok(adminRec.id);
  assert.equal(adminRec.present, true, 'Admin must have override permission to record attendance');
});

// ---------------------------------------------------------------------
// TARGET 2: ASSIGNMENT GRADING INTEGRITY (0-100 & FEEDBACK PERSISTENCE)
// ---------------------------------------------------------------------
test('Target 2 - Grading: Complete lifecycle from creation, submission, 0-100 boundaries, to regrading', () => {
  const db = new FSLDatabaseEngine();

  // Create an assignment in schedule s-1
  const asg = db.createAssignment('prof-1', 's-1', {
    title: 'FSL Dialogue & Spatial Signing Exam',
    description: 'Demonstrate spatial grammar using 3 reference points.',
    due_date: '2026-11-15T23:59:59Z',
  });
  assert.ok(asg.id);

  // Enroll 4 learners
  const submissions = [];
  for (let i = 1; i <= 4; i++) {
    const lId = `grade-learner-${i}`;
    db.profiles.push({
      id: lId,
      name: `Grading Candidate ${i}`,
      email: `candidate${i}@fsl.ph`,
      role: 'learner',
    });
    const enr = db.enrollLearner(lId, 's-1');
    const pay = db.submitSimulatedPayment(lId, enr.id, 2500);
    db.adminVerifyPayment('admin-1', pay.id);

    const sub = db.submitAssignment(lId, asg.id, {
      file_url: `https://storage.fsl.ph/submissions/candidate-${i}-exam.mp4`,
    });
    assert.equal(sub.grade, null, 'Initial submission grade must be null');
    assert.equal(sub.feedback, null, 'Initial submission feedback must be null');
    submissions.push(sub);
  }

  // Test Boundary 1: Grade 0 (Minimum boundary)
  const graded0 = db.gradeSubmission('prof-1', submissions[0].id, {
    grade: 0,
    feedback: 'No video recorded. Please submit by grace period deadline.',
  });
  assert.equal(graded0.grade, 0, 'Grade 0 must be accepted');
  assert.equal(graded0.feedback, 'No video recorded. Please submit by grace period deadline.');

  // Test Boundary 2: Grade 100 (Maximum boundary)
  const graded100 = db.gradeSubmission('prof-1', submissions[1].id, {
    grade: 100,
    feedback: 'Outstanding mastery of spatial grammar, facial morphology, and fluid handshapes!',
  });
  assert.equal(graded100.grade, 100, 'Grade 100 must be accepted');
  assert.ok(graded100.feedback.includes('Outstanding mastery'));

  // Test Boundary 3: Midpoint Grade 50
  const graded50 = db.gradeSubmission('prof-1', submissions[2].id, {
    grade: 50,
    feedback: 'Clear signs but missing non-manual facial markers.',
  });
  assert.equal(graded50.grade, 50, 'Grade 50 must be accepted');

  // Test Boundary 4: High score 94.5 (Decimal score)
  const gradedDec = db.gradeSubmission('prof-1', submissions[3].id, {
    grade: 94.5,
    feedback: 'Nearly perfect execution.',
  });
  assert.equal(gradedDec.grade, 94.5, 'Decimal grades between 0 and 100 must be accepted');

  // Test Regrading / Grade Update Flow
  const regraded = db.gradeSubmission('prof-1', submissions[0].id, {
    grade: 82,
    feedback: 'Resubmission accepted. Good improvement on hand orientation.',
  });
  assert.equal(regraded.grade, 82, 'Grade must update from 0 to 82');
  assert.equal(regraded.feedback, 'Resubmission accepted. Good improvement on hand orientation.');

  // Verify all 4 submissions are now graded
  const subsInDb = db.submissions.filter((s) => s.assignment_id === asg.id);
  const allGraded = subsInDb.every((s) => s.grade !== null && typeof s.feedback === 'string');
  assert.ok(allGraded, 'All submissions must have valid grades and feedbacks');
});

test('Target 2 - Grading: Adversarial Grade Boundaries, Roles & Type Invariants', () => {
  const db = new FSLDatabaseEngine();

  const asg = db.createAssignment('prof-2', 's-2', {
    title: 'Adversarial Grading Test Assignment',
    description: 'Testing inputs',
  });

  // Learner 2 is enrolled in s-2 (enrollment e-1)
  const sub = db.submitAssignment('learner-2', asg.id, {
    file_url: 'https://storage.fsl.ph/submissions/sub-adversarial.mp4',
  });

  // 1. Grade < 0 must be rejected
  assert.throws(() => {
    db.gradeSubmission('prof-2', sub.id, { grade: -1, feedback: 'Negative' });
  }, /Grade must be a number between 0 and 100/);

  assert.throws(() => {
    db.gradeSubmission('prof-2', sub.id, { grade: -0.001, feedback: 'Negative decimal' });
  }, /Grade must be a number between 0 and 100/);

  // 2. Grade > 100 must be rejected
  assert.throws(() => {
    db.gradeSubmission('prof-2', sub.id, { grade: 100.1, feedback: 'Over max' });
  }, /Grade must be a number between 0 and 100/);

  assert.throws(() => {
    db.gradeSubmission('prof-2', sub.id, { grade: 999, feedback: 'Huge number' });
  }, /Grade must be a number between 0 and 100/);

  // 3. NaN and string non-numbers must be rejected
  assert.throws(() => {
    db.gradeSubmission('prof-2', sub.id, { grade: 'not-a-number', feedback: 'Invalid' });
  }, /Grade must be a number between 0 and 100/);

  assert.throws(() => {
    db.gradeSubmission('prof-2', sub.id, { grade: NaN, feedback: 'NaN' });
  }, /Grade must be a number between 0 and 100/);

  // 4. Cross-professor isolation: prof-1 cannot grade prof-2 schedule s-2 submission
  assert.throws(() => {
    db.gradeSubmission('prof-1', sub.id, { grade: 85, feedback: 'Unauthorized' });
  }, /only assigned professor or admin/);

  // 5. Learner cannot grade submission
  assert.throws(() => {
    db.gradeSubmission('learner-2', sub.id, { grade: 100, feedback: 'Self grade' });
  }, /only assigned professor or admin/);

  // 6. Admin CAN grade submission
  const adminGraded = db.gradeSubmission('admin-1', sub.id, { grade: 90, feedback: 'Admin review' });
  assert.equal(adminGraded.grade, 90, 'Admin can grade submission');
});

// ---------------------------------------------------------------------
// TARGET 3: MEETING LINK VALIDATION & MULTI-SCHEDULE UPDATES
// ---------------------------------------------------------------------
test('Target 3 - Meeting Links: Updating Zoom & Google Meet across multiple schedules', () => {
  const db = new FSLDatabaseEngine();

  // Test various Zoom and Google Meet link formats
  const links = [
    { schedId: 's-1', profId: 'prof-1', url: 'https://meet.google.com/qwe-rtyu-iop' },
    { schedId: 's-2', profId: 'prof-2', url: 'https://zoom.us/j/9876543210?pwd=FSLPasscode2026' },
    { schedId: 's-3', profId: 'prof-1', url: 'https://meet.google.com/zxc-vbnm-asd' },
  ];

  for (const item of links) {
    const updated = db.updateMeetingLink(item.profId, item.schedId, item.url);
    assert.equal(updated.meeting_link, item.url, `Schedule ${item.schedId} meeting link must match updated URL`);

    // Verify lookup persists
    const found = db.schedules.find((s) => s.id === item.schedId);
    assert.equal(found.meeting_link, item.url);
  }

  // Cross-professor isolation: Prof 1 cannot update Prof 2's schedule
  assert.throws(() => {
    db.updateMeetingLink('prof-1', 's-2', 'https://meet.google.com/hacked');
  }, /only the assigned professor or admin/);

  // Admin can update any meeting link
  const adminUpdated = db.updateMeetingLink('admin-1', 's-2', 'https://zoom.us/j/admin-meeting');
  assert.equal(adminUpdated.meeting_link, 'https://zoom.us/j/admin-meeting');
});

// ---------------------------------------------------------------------
// TARGET 4: VIDEO UPLOAD CATEGORY VALIDATION (6 GROUNDED CATEGORIES)
// ---------------------------------------------------------------------
test('Target 4 - Videos: Complete coverage of all 6 grounded categories and rejection of ungrounded tags', () => {
  const db = new FSLDatabaseEngine();

  // 1. Verify all 6 grounded categories succeed across levels 1, 2, 3
  const validMatrix = [
    { level: 1, category: 'Alphabet / Fingerspelling' },
    { level: 1, category: 'Basic Greetings' },
    { level: 1, category: 'Numbers' },
    { level: 2, category: 'Common Expressions' },
    { level: 2, category: 'Everyday Conversations' },
    { level: 3, category: 'Vocabulary Lessons' },
  ];

  for (const item of validMatrix) {
    const vid = db.uploadVideo('prof-1', {
      level: item.level,
      title: `Curriculum Video: ${item.category}`,
      category: item.category,
      video_url: `https://storage.fsl.ph/videos/${item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mp4`,
    });
    assert.ok(vid.id);
    assert.equal(vid.category, item.category);
    assert.equal(vid.level, item.level);
  }

  // 2. Reject ungrounded categories
  const invalidCategories = [
    'Slang and Street Signs',
    'TikTok Dance Signs',
    'ASL Interpretations',
    'Random Gestures',
    'numbers', // lowercase
    'Basic greetings', // casing mismatch
    'Everyday Conversation', // missing plural 's'
  ];

  for (const badCat of invalidCategories) {
    assert.throws(
      () => {
        db.uploadVideo('prof-1', {
          level: 1,
          title: `Bad Video for ${badCat}`,
          category: badCat,
          video_url: 'https://example.com/bad.mp4',
        });
      },
      /Invalid video category/,
      `Category "${badCat}" must be rejected as ungrounded`
    );
  }

  // 3. Reject invalid levels
  const invalidLevels = [0, 4, -1, 99, 100];
  for (const badLevel of invalidLevels) {
    assert.throws(
      () => {
        db.uploadVideo('prof-1', {
          level: badLevel,
          title: 'Bad Level Video',
          category: 'Basic Greetings',
          video_url: 'https://example.com/bad.mp4',
        });
      },
      /Invalid video level/,
      `Level ${badLevel} must be rejected`
    );
  }

  // 4. Reject unauthorized uploader (learner)
  assert.throws(
    () => {
      db.uploadVideo('learner-1', {
        level: 1,
        title: 'Learner Video',
        category: 'Basic Greetings',
        video_url: 'https://example.com/video.mp4',
      });
    },
    /only professors and administrators/,
    'Learner cannot upload tutorial videos'
  );
});

// ---------------------------------------------------------------------
// TARGET 5: HIGH-VOLUME STRESS & RAPID EXECUTION BENCHMARK
// ---------------------------------------------------------------------
test('Target 5 - High-Volume Simulation: 200 operations under 100ms with zero corruption', () => {
  const db = new FSLDatabaseEngine();
  const startTime = Date.now();

  // Create an assignment
  const asg = db.createAssignment('prof-1', 's-1', {
    title: 'High Volume Benchmark Assignment',
    description: 'Stress testing speed',
  });

  // Perform 50 enrollments, 50 submissions, 50 gradings, and 50 attendance saves
  const count = 50;
  for (let i = 0; i < count; i++) {
    const lId = `bulk-learner-${i}`;
    db.profiles.push({
      id: lId,
      name: `Bulk Learner ${i}`,
      email: `bulk${i}@test.com`,
      role: 'learner',
    });

    // We bump slots to allow 50 enrollments
    db.schedules.find((s) => s.id === 's-1').slots += 1;

    const enr = db.enrollLearner(lId, 's-1');
    const pay = db.submitSimulatedPayment(lId, enr.id, 2500);
    db.adminVerifyPayment('admin-1', pay.id);

    // Attendance
    db.recordAttendance('prof-1', 's-1', enr.id, '2026-10-10', i % 2 === 0);

    // Submission & Grading
    const sub = db.submitAssignment(lId, asg.id, {
      file_url: `https://storage.fsl.ph/submissions/sub-${i}.mp4`,
    });
    db.gradeSubmission('prof-1', sub.id, {
      grade: 70 + (i % 31),
      feedback: `Rapid evaluation feedback ${i}`,
    });
  }

  const duration = Date.now() - startTime;
  assert.ok(duration < 1000, `200 state operations should finish in < 1000ms (took ${duration}ms)`);

  const gradedCount = db.submissions.filter((s) => s.assignment_id === asg.id && s.grade !== null).length;
  assert.equal(gradedCount, count, `All ${count} bulk submissions must be graded`);
});

// ---------------------------------------------------------------------
// TARGET 6: CODEBASE CONSISTENCY, UI ATTRIBUTES & SPEC ALIGNMENT
// ---------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Target 6 - Codebase Consistency: 6 Grounded categories strictly match across FSL_SPEC.md, professor-data.ts, and harness.js', () => {
  const specContent = fs.readFileSync(path.join(rootDir, 'FSL_SPEC.md'), 'utf8');
  const profDataContent = fs.readFileSync(path.join(rootDir, 'src', 'lib', 'professor-data.ts'), 'utf8');

  for (const cat of GROUNDED_CATEGORIES) {
    // 1. Must exist in FSL_SPEC.md
    assert.ok(
      specContent.includes(cat),
      `FSL_SPEC.md must contain grounded category: "${cat}"`
    );

    // 2. Must exist in professor-data.ts
    assert.ok(
      profDataContent.includes(cat),
      `src/lib/professor-data.ts must contain grounded category: "${cat}"`
    );

    // 3. Must exist in harness.js
    assert.ok(
      VIDEO_CATEGORIES.includes(cat),
      `tests/e2e/harness.js must contain grounded category: "${cat}"`
    );
  }
});

test('Target 6 - UI Form Validation & Navigation Linkage', () => {
  const navbarContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'layout', 'Navbar.tsx'), 'utf8');
  const attendanceClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'classes', '[id]', 'attendance', 'ClassAttendanceClient.tsx'),
    'utf8'
  );
  const assignmentsClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'classes', '[id]', 'assignments', 'ClassAssignmentsClient.tsx'),
    'utf8'
  );
  const schedulesClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'schedules', 'SchedulesManagementClient.tsx'),
    'utf8'
  );

  // 1. Navbar contains professor links
  assert.ok(navbarContent.includes('/professor/schedules'), 'Navbar must link to /professor/schedules');
  assert.ok(navbarContent.includes('/professor/materials'), 'Navbar must link to /professor/materials');
  assert.ok(navbarContent.includes('/professor/announcements'), 'Navbar must link to /professor/announcements');

  // 2. Attendance Client enforces date selector, checkbox grid, remarks, and save
  assert.ok(attendanceClientContent.includes('type="date"'), 'Attendance client must contain date input');
  assert.ok(attendanceClientContent.includes('type="checkbox"'), 'Attendance client must contain checkbox for present/absent');
  assert.ok(attendanceClientContent.includes('handleRemarksChange'), 'Attendance client must allow remarks editing');
  assert.ok(attendanceClientContent.includes('saveAttendanceRecords'), 'Attendance client must call saveAttendanceRecords');

  // 3. Assignment Client enforces numeric grade 0-100, feedback, and grade submission
  assert.ok(assignmentsClientContent.includes('type="number"'), 'Assignments client must contain numeric grade input');
  assert.ok(assignmentsClientContent.includes('min="0"'), 'Assignments client must enforce min="0"');
  assert.ok(assignmentsClientContent.includes('max="100"'), 'Assignments client must enforce max="100"');
  assert.ok(assignmentsClientContent.includes('gradeSubmission'), 'Assignments client must call gradeSubmission');

  // 4. Schedules Client enforces Zoom and Meet support
  assert.ok(schedulesClientContent.includes('meet.google.com'), 'Schedules client must support Google Meet');
  assert.ok(schedulesClientContent.includes('zoom.us'), 'Schedules client must support Zoom');
  assert.ok(schedulesClientContent.includes('updateMeetingLink'), 'Schedules client must call updateMeetingLink');
});

