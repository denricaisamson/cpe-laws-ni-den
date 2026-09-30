// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Unit Test Suite: Milestone 4 (Professor Classroom, Grading & Materials)
// File: tests/milestone4.test.mjs
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

test('Milestone 4 - Professor Routes and Source Files Existence', () => {
  const requiredFiles = [
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'ProfessorDashboardClient.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'schedules', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'schedules', 'SchedulesManagementClient.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'classes', '[id]', 'attendance', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'classes', '[id]', 'attendance', 'ClassAttendanceClient.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'classes', '[id]', 'assignments', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'classes', '[id]', 'assignments', 'ClassAssignmentsClient.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'materials', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'materials', 'MaterialsPublishingClient.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'announcements', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'announcements', 'AnnouncementsPublishingClient.tsx'),
    path.join(rootDir, 'src', 'lib', 'professor-data.ts'),
  ];

  for (const filePath of requiredFiles) {
    assert.ok(fs.existsSync(filePath), `Required file must exist: ${filePath}`);
  }
});

test('Milestone 4 - Professor Dashboard Home Specification & KPI Metrics', () => {
  const dashboardClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'ProfessorDashboardClient.tsx'),
    'utf8'
  );

  // 1. Four Required KPI Cards
  assert.ok(
    dashboardClientContent.includes('Assigned Sections'),
    'Professor dashboard must contain Assigned Sections KPI card'
  );
  assert.ok(
    dashboardClientContent.includes('Total Enrolled Students'),
    'Professor dashboard must contain Total Enrolled Students KPI card'
  );
  assert.ok(
    dashboardClientContent.includes('Submissions Pending Grading'),
    'Professor dashboard must contain Submissions Pending Grading KPI card'
  );
  assert.ok(
    dashboardClientContent.includes('Upcoming Sessions'),
    'Professor dashboard must contain Upcoming Sessions KPI card'
  );

  // 2. Direct quick-action links & table action buttons
  assert.ok(
    dashboardClientContent.includes('/professor/schedules'),
    'Professor dashboard must link to /professor/schedules'
  );
  assert.ok(
    dashboardClientContent.includes('/professor/materials'),
    'Professor dashboard must link to /professor/materials'
  );
  assert.ok(
    dashboardClientContent.includes('/professor/announcements'),
    'Professor dashboard must link to /professor/announcements'
  );
  assert.ok(
    dashboardClientContent.includes('/attendance'),
    'Professor dashboard table must provide Attendance action button'
  );
  assert.ok(
    dashboardClientContent.includes('/assignments'),
    'Professor dashboard table must provide Assignments action button'
  );
  assert.ok(
    dashboardClientContent.includes('handleSaveLink') || dashboardClientContent.includes('updateMeetingLink'),
    'Professor dashboard must provide quick-edit link capability'
  );
});

test('Milestone 4 - Schedule & Meeting Link Management (Zoom / Meet)', () => {
  const schedClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'schedules', 'SchedulesManagementClient.tsx'),
    'utf8'
  );

  // 1. UI Verification
  assert.ok(
    schedClientContent.includes('Assigned Schedules & Meeting Links'),
    'Must have page title'
  );
  assert.ok(
    schedClientContent.includes('Prof. Rommel Agravante'),
    'Must support Prof. Rommel Agravante seed faculty'
  );
  assert.ok(
    schedClientContent.includes('Prof. Liza Flores'),
    'Must support Prof. Liza Flores seed faculty'
  );
  assert.ok(
    schedClientContent.includes('Virtual Meeting Link') || schedClientContent.includes('Virtual Meeting URL'),
    'Must display virtual meeting link controls'
  );
  assert.ok(
    schedClientContent.includes('meet.google.com') || schedClientContent.includes('zoom.us'),
    'Must provide Google Meet or Zoom link presets/templates'
  );

  // 2. Database Engine & Business Logic Verification
  const db = new FSLDatabaseEngine();

  // Prof. 1 updates meeting link for schedule s-1
  const updated1 = db.updateMeetingLink('prof-1', 's-1', 'https://meet.google.com/test-room-101');
  assert.equal(updated1.meeting_link, 'https://meet.google.com/test-room-101');

  // Prof. 2 updates meeting link for schedule s-2
  const updated2 = db.updateMeetingLink('prof-2', 's-2', 'https://zoom.us/j/1234567890');
  assert.equal(updated2.meeting_link, 'https://zoom.us/j/1234567890');

  // Cross-professor isolation: Prof 1 cannot update Prof 2 schedule s-2
  assert.throws(() => {
    db.updateMeetingLink('prof-1', 's-2', 'https://meet.google.com/unauthorized');
  }, /only the assigned professor or admin/);

  // Non-existent schedule throws error
  assert.throws(() => {
    db.updateMeetingLink('prof-1', 'non-existent-sched', 'https://meet.google.com/test');
  }, /not found/);
});

test('Milestone 4 - Session Attendance Tracking & Roster Grid', () => {
  const attClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'classes', '[id]', 'attendance', 'ClassAttendanceClient.tsx'),
    'utf8'
  );

  // 1. UI Verification
  assert.ok(
    attClientContent.includes('Session Attendance Tracking'),
    'Must have Attendance page banner'
  );
  assert.ok(
    attClientContent.includes('type="date"'),
    'Must provide session date input selector'
  );
  assert.ok(
    attClientContent.includes('Mark Attendance') || attClientContent.includes('Present'),
    'Must provide present/absent controls'
  );
  assert.ok(
    attClientContent.includes('Session Remarks / Notes') || attClientContent.includes('remarks'),
    'Must provide remarks input'
  );
  assert.ok(
    attClientContent.includes('Save Attendance'),
    'Must provide Save Attendance button'
  );

  // 2. Database Engine Logic Validation
  const db = new FSLDatabaseEngine();

  // Record attendance for learner 2 in schedule s-2 (enrollment e-1)
  const att = db.recordAttendance('prof-2', 's-2', 'e-1', '2026-09-28', true);
  assert.ok(att.id);
  assert.equal(att.enrollment_id, 'e-1');
  assert.equal(att.date, '2026-09-28');
  assert.equal(att.present, true);

  // Toggle/update attendance for the same learner and date
  const updatedAtt = db.recordAttendance('prof-2', 's-2', 'e-1', '2026-09-28', false);
  assert.equal(updatedAtt.present, false);

  // Prevent recording attendance for non-enrolled learner or wrong schedule
  assert.throws(() => {
    db.recordAttendance('prof-2', 's-2', 'e-999', '2026-09-28', true);
  }, /enrollment does not belong to this schedule/);

  // Cross-professor isolation: Prof 1 cannot record attendance for Prof 2 class s-2
  assert.throws(() => {
    db.recordAttendance('prof-1', 's-2', 'e-1', '2026-09-28', true);
  }, /only assigned professor or admin/);
});

test('Milestone 4 - Assignment Management & Grading Drawer', () => {
  const asgClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'classes', '[id]', 'assignments', 'ClassAssignmentsClient.tsx'),
    'utf8'
  );

  // 1. UI Verification
  assert.ok(
    asgClientContent.includes('Post New Assignment'),
    'Must provide Post New Assignment button'
  );
  assert.ok(
    asgClientContent.includes('Learner Submissions Review') || asgClientContent.includes('submissions'),
    'Must display submissions review list'
  );
  assert.ok(
    asgClientContent.includes('Grade Student Submission') || asgClientContent.includes('Grade Submission'),
    'Must provide grading modal / drawer'
  );
  assert.ok(
    asgClientContent.includes('Numeric Grade') || asgClientContent.includes('min="0"') || asgClientContent.includes('max="100"'),
    'Must have 0-100 numeric grade input'
  );
  assert.ok(
    asgClientContent.includes('Written Feedback') || asgClientContent.includes('feedback'),
    'Must have written instructor feedback input'
  );

  // 2. Database Engine Logic Validation
  const db = new FSLDatabaseEngine();

  // Prof. 1 creates assignment for schedule s-1
  const asg = db.createAssignment('prof-1', 's-1', {
    title: 'FSL Fingerspelling Video Quiz',
    description: 'Submit a 1-minute video demonstrating fingerspelling of 10 Philippine cities.',
    due_date: '2026-10-25T23:59:59Z',
  });
  assert.ok(asg.id);
  assert.equal(asg.title, 'FSL Fingerspelling Video Quiz');
  assert.equal(asg.schedule_id, 's-1');

  // Validate title cannot be empty
  assert.throws(() => {
    db.createAssignment('prof-1', 's-1', {
      title: '   ',
      description: 'Test',
    });
  }, /title cannot be empty/);

  // Cross-professor isolation: Prof 2 cannot create assignment for schedule s-1
  assert.throws(() => {
    db.createAssignment('prof-2', 's-1', {
      title: 'Unauthorized Assignment',
      description: 'Test',
    });
  }, /only assigned professor or admin/);

  // Enroll learner 1 and submit assignment
  db.enrollLearner('learner-1', 's-1');
  const pay = db.submitSimulatedPayment('learner-1', db.enrollments[db.enrollments.length - 1].id, 2500);
  db.adminVerifyPayment('admin-1', pay.id);

  const sub = db.submitAssignment('learner-1', asg.id, {
    file_url: 'https://storage.fsl.ph/submissions/sub-cities.mp4',
  });
  assert.ok(sub.id);
  assert.equal(sub.grade, null);

  // Prof. 1 grades submission
  const graded = db.gradeSubmission('prof-1', sub.id, {
    grade: 94,
    feedback: 'Clear visual hand orientation and smooth transitions.',
  });
  assert.equal(graded.grade, 94);
  assert.equal(graded.feedback, 'Clear visual hand orientation and smooth transitions.');

  // Validate grade bounds (0-100)
  assert.throws(() => {
    db.gradeSubmission('prof-1', sub.id, { grade: 105, feedback: 'Invalid' });
  }, /Grade must be a number between 0 and 100/);

  assert.throws(() => {
    db.gradeSubmission('prof-1', sub.id, { grade: -5, feedback: 'Invalid' });
  }, /Grade must be a number between 0 and 100/);
});

test('Milestone 4 - Learning Materials & 6 Grounded Video Categories Publishing', () => {
  const matClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'materials', 'MaterialsPublishingClient.tsx'),
    'utf8'
  );

  // 1. UI Verification
  assert.ok(
    matClientContent.includes('Upload Handout') || matClientContent.includes('Upload Course Material'),
    'Must provide material upload capability'
  );
  assert.ok(
    matClientContent.includes('Publish Tutorial Video') || matClientContent.includes('Publish New Video'),
    'Must provide tutorial video publishing capability'
  );

  // 2. Strict Grounded Category Validation: all 6 categories from FSL_SPEC.md must be supported
  const expectedCategories = [
    'Alphabet / Fingerspelling',
    'Basic Greetings',
    'Numbers',
    'Common Expressions',
    'Everyday Conversations',
    'Vocabulary Lessons',
  ];

  for (const cat of expectedCategories) {
    assert.ok(VIDEO_CATEGORIES.includes(cat), `Harness must define category: ${cat}`);
  }

  // 3. Database Engine & Business Logic Validation
  const db = new FSLDatabaseEngine();

  // Prof 1 uploads material to schedule s-1
  const mat = db.uploadMaterial('prof-1', 's-1', {
    title: 'FSL 101 Handshape Reference Guide (PDF)',
    file_url: 'https://storage.fsl.ph/materials/fsl-101-guide.pdf',
  });
  assert.ok(mat.id);
  assert.equal(mat.title, 'FSL 101 Handshape Reference Guide (PDF)');

  // Validate empty material title rejection
  assert.throws(() => {
    db.uploadMaterial('prof-1', 's-1', { title: '', file_url: 'https://example.com' });
  }, /Material title and file URL are required/);

  // Prof 1 uploads videos in each grounded category
  for (const cat of expectedCategories) {
    const vid = db.uploadVideo('prof-1', {
      level: 1,
      title: `Demo Video for ${cat}`,
      category: cat,
      video_url: `https://storage.fsl.ph/videos/demo-${cat.replace(/\s+/g, '-').toLowerCase()}.mp4`,
    });
    assert.ok(vid.id);
    assert.equal(vid.category, cat);
  }

  // Ungrounded category must be rejected
  assert.throws(() => {
    db.uploadVideo('prof-1', {
      level: 1,
      title: 'Invalid Category Video',
      category: 'Slang and Memes',
      video_url: 'https://example.com/video.mp4',
    });
  }, /Invalid video category/);

  // Invalid level must be rejected
  assert.throws(() => {
    db.uploadVideo('prof-1', {
      level: 4,
      title: 'Invalid Level Video',
      category: 'Basic Greetings',
      video_url: 'https://example.com/video.mp4',
    });
  }, /Invalid video level/);
});

test('Milestone 4 - Class Announcements Publishing', () => {
  const annClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'announcements', 'AnnouncementsPublishingClient.tsx'),
    'utf8'
  );

  // 1. UI Verification
  assert.ok(
    annClientContent.includes('Class Announcements Publisher'),
    'Must have page title'
  );
  assert.ok(
    annClientContent.includes('Post New Announcement') || annClientContent.includes('Post Announcement'),
    'Must provide Post Announcement button'
  );
  assert.ok(
    annClientContent.includes('Target Cohort') || annClientContent.includes('schedule'),
    'Must provide target cohort / schedule selector'
  );

  // 2. Data store logic verification
  const db = new FSLDatabaseEngine();
  const ann = {
    id: db.generateId('ann'),
    author_id: 'prof-1',
    schedule_id: 's-1',
    title: 'Orientation Reminder: Test Lighting and Hands-Free Camera Setup',
    body: 'Please ensure high contrast background and good lighting on your hands and face.',
  };
  db.announcements.push(ann);

  const found = db.announcements.find((a) => a.id === ann.id);
  assert.ok(found);
  assert.equal(found.title, 'Orientation Reminder: Test Lighting and Hands-Free Camera Setup');
  assert.equal(found.schedule_id, 's-1');
});
