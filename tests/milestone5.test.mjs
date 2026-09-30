// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Unit Test Suite: Milestone 5 (Learner Experience & Progression)
// File: tests/milestone5.test.mjs
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

test('Milestone 5 - Learner Routes and Source Files Existence', () => {
  const requiredFiles = [
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'workshops', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'workshops', 'WorkshopCatalogClient.tsx'),
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'classes', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'classes', 'LearnerClassesClient.tsx'),
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'classes', '[id]', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'classes', '[id]', 'ClassDetailClient.tsx'),
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'coursework', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'coursework', 'LearnerCourseworkClient.tsx'),
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'materials', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'materials', 'LearningMaterialsClient.tsx'),
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'progression', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'progression', 'LearnerProgressionClient.tsx'),
    path.join(rootDir, 'src', 'lib', 'learner-data.ts'),
  ];

  for (const filePath of requiredFiles) {
    assert.ok(fs.existsSync(filePath), `Required file must exist: ${filePath}`);
  }
});

test('Milestone 5 - Data Layer Contract in src/lib/learner-data.ts', () => {
  const learnerDataContent = fs.readFileSync(
    path.join(rootDir, 'src', 'lib', 'learner-data.ts'),
    'utf8'
  );

  // 1. Reactive State Management & Event subscriptions
  assert.ok(
    learnerDataContent.includes('subscribeToLearnerStore'),
    'learner-data.ts must export subscribeToLearnerStore'
  );
  assert.ok(
    learnerDataContent.includes('resetLearnerStore'),
    'learner-data.ts must export resetLearnerStore'
  );
  assert.ok(
    learnerDataContent.includes('fsl_learner_store_v1'),
    'learner-data.ts must use localStorage persistence'
  );

  // 2. Feature 11 methods
  assert.ok(
    learnerDataContent.includes('getWorkshopCatalog'),
    'learner-data.ts must export getWorkshopCatalog'
  );
  assert.ok(
    learnerDataContent.includes('enrollInWorkshop'),
    'learner-data.ts must export enrollInWorkshop'
  );

  // 3. Feature 12 methods
  assert.ok(
    learnerDataContent.includes('getLearnerClasses'),
    'learner-data.ts must export getLearnerClasses'
  );
  assert.ok(
    learnerDataContent.includes('getClassDetails'),
    'learner-data.ts must export getClassDetails'
  );
  assert.ok(
    learnerDataContent.includes('getLearnerCoursework'),
    'learner-data.ts must export getLearnerCoursework'
  );
  assert.ok(
    learnerDataContent.includes('submitAssignment'),
    'learner-data.ts must export submitAssignment'
  );

  // 4. Feature 13 methods & categories
  assert.ok(
    learnerDataContent.includes('getLearnerMaterials'),
    'learner-data.ts must export getLearnerMaterials'
  );
  assert.ok(
    learnerDataContent.includes('getFSLVideos'),
    'learner-data.ts must export getFSLVideos'
  );
  assert.ok(
    learnerDataContent.includes('GROUNDED_VIDEO_CATEGORIES'),
    'learner-data.ts must export GROUNDED_VIDEO_CATEGORIES'
  );

  // 5. Feature 14 methods
  assert.ok(
    learnerDataContent.includes('getLearnerProgression'),
    'learner-data.ts must export getLearnerProgression'
  );
});

test('Milestone 5 - Navbar Navigation Accessibility for Learner Role', () => {
  const navbarContent = fs.readFileSync(
    path.join(rootDir, 'src', 'components', 'layout', 'Navbar.tsx'),
    'utf8'
  );

  // 1. Desktop & Mobile Learner Links
  assert.ok(
    navbarContent.includes('/learner/workshops'),
    'Navbar must contain link to /learner/workshops'
  );
  assert.ok(
    navbarContent.includes('/learner/classes'),
    'Navbar must contain link to /learner/classes'
  );
  assert.ok(
    navbarContent.includes('/learner/coursework'),
    'Navbar must contain link to /learner/coursework'
  );
  assert.ok(
    navbarContent.includes('/learner/materials'),
    'Navbar must contain link to /learner/materials'
  );
  assert.ok(
    navbarContent.includes('/learner/progression'),
    'Navbar must contain link to /learner/progression'
  );

  // 2. Labels present
  assert.ok(navbarContent.includes('Workshops'), 'Navbar must have Workshops label');
  assert.ok(navbarContent.includes('My Classes'), 'Navbar must have My Classes label');
  assert.ok(navbarContent.includes('Coursework'), 'Navbar must have Coursework label');
  assert.ok(navbarContent.includes('Learning Hub'), 'Navbar must have Learning Hub label');
  assert.ok(navbarContent.includes('Progression'), 'Navbar must have Progression label');
});

test('Milestone 5 - Workshop Catalog by Level & Simulated Checkout Flow', () => {
  const catalogClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'workshops', 'WorkshopCatalogClient.tsx'),
    'utf8'
  );

  // 1. UI Verification
  assert.ok(
    catalogClientContent.includes('Filipino Sign Language Workshop Catalog'),
    'Must have page title'
  );
  assert.ok(
    catalogClientContent.includes('Level 1: Basic') || catalogClientContent.includes('Level 1'),
    'Must display Level 1 categorization'
  );
  assert.ok(
    catalogClientContent.includes('Level 2: Intermediate') || catalogClientContent.includes('Level 2'),
    'Must display Level 2 categorization'
  );
  assert.ok(
    catalogClientContent.includes('Level 3: Advanced') || catalogClientContent.includes('Level 3'),
    'Must display Level 3 categorization'
  );
  assert.ok(
    catalogClientContent.includes('Simulated Workshop Checkout') || catalogClientContent.includes('Checkout'),
    'Must support simulated checkout modal'
  );
  assert.ok(
    catalogClientContent.includes('GCash') && catalogClientContent.includes('Maya'),
    'Must support Philippine simulated payment methods (GCash, Maya)'
  );

  // 2. Business Logic Verification with FSLDatabaseEngine
  const db = new FSLDatabaseEngine();

  // Filter catalog by Level 1
  const level1Workshops = db.workshops.filter((w) => w.level === 1);
  assert.ok(level1Workshops.length >= 1, 'Level 1 workshop must be present');
  assert.equal(level1Workshops[0].fee, 2500, 'Workshop fee must match seed');

  // Schedules for Level 1
  const l1Schedules = db.schedules.filter((s) => s.workshop_id === level1Workshops[0].id);
  assert.ok(l1Schedules.length >= 1, 'Must have schedules for Level 1');
  const initialSlots = l1Schedules[0].slots;
  assert.ok(initialSlots > 0, 'Schedules must have available slots');

  // Simulated Checkout creates enrollment ('pending') and payment ('pending')
  const enrollment = db.enrollLearner('learner-1', l1Schedules[0].id);
  assert.equal(enrollment.status, 'pending', 'Enrollment status must be pending');
  assert.equal(l1Schedules[0].slots, initialSlots - 1, 'Slots must decrement upon enrollment');

  const payment = db.submitSimulatedPayment('learner-1', enrollment.id, 2500);
  assert.equal(payment.status, 'pending', 'Payment status must be pending');
  assert.equal(payment.amount, 2500, 'Payment amount must match workshop fee');

  // Duplicate enrollment must be rejected
  assert.throws(() => {
    db.enrollLearner('learner-1', l1Schedules[0].id);
  }, /already enrolled or pending/);

  // Full section rejection
  l1Schedules[0].slots = 0;
  assert.throws(() => {
    db.enrollLearner('learner-3', l1Schedules[0].id);
  }, /available slots/i);
});

test('Milestone 5 - Enrolled Classes & Live Meeting Link Access', () => {
  const classesClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'classes', 'LearnerClassesClient.tsx'),
    'utf8'
  );
  const detailClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'classes', '[id]', 'ClassDetailClient.tsx'),
    'utf8'
  );

  // 1. UI Elements Verification
  assert.ok(
    classesClientContent.includes('My Enrolled FSL Classes'),
    'Classes list page must display title'
  );
  assert.ok(
    classesClientContent.includes('Join Live Meeting') || classesClientContent.includes('Enter Class Portal'),
    'Must provide live meeting join button or portal entry'
  );
  assert.ok(
    detailClientContent.includes('Join Live Meeting'),
    'Class detail must provide prominent Join Live Meeting button'
  );
  assert.ok(
    detailClientContent.includes('Session Attendance History') || detailClientContent.includes('attendance'),
    'Class detail must display attendance section'
  );
  assert.ok(
    detailClientContent.includes('Class Announcements') || detailClientContent.includes('announcements'),
    'Class detail must display announcements section'
  );

  // 2. Data store logic verification
  const db = new FSLDatabaseEngine();
  const enrolledList = db.enrollments.filter((e) => e.learner_id === 'learner-2' && e.status === 'enrolled');
  assert.ok(enrolledList.length >= 1, 'Learner 2 must have an enrolled class');

  const schedule = db.schedules.find((s) => s.id === enrolledList[0].schedule_id);
  assert.ok(schedule, 'Enrolled schedule must exist');
  assert.ok(schedule.meeting_link.startsWith('http'), 'Schedule must have active meeting link');

  // Verify attendance records for enrolled student
  const attRecords = db.attendance.filter((a) => a.enrollment_id === enrolledList[0].id);
  assert.ok(attRecords.length >= 1, 'Must have attendance history for enrolled learner');
  assert.equal(typeof attRecords[0].present, 'boolean');
});

test('Milestone 5 - Coursework Assignments, Submissions & Graded Feedback Viewer', () => {
  const courseworkClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'coursework', 'LearnerCourseworkClient.tsx'),
    'utf8'
  );

  // 1. UI Elements Verification
  assert.ok(
    courseworkClientContent.includes('FSL Coursework & Video Submissions'),
    'Coursework page must have title'
  );
  assert.ok(
    courseworkClientContent.includes('Pending Submission'),
    'Must have Pending Submission filter / status'
  );
  assert.ok(
    courseworkClientContent.includes('Submitted'),
    'Must have Submitted filter / status'
  );
  assert.ok(
    courseworkClientContent.includes('Graded'),
    'Must have Graded filter / status'
  );
  assert.ok(
    courseworkClientContent.includes('Submit Assignment Response') || courseworkClientContent.includes('Submit Assignment'),
    'Must provide submission modal / form'
  );
  assert.ok(
    courseworkClientContent.includes('Video Recording Link'),
    'Must prompt for video recording URL'
  );
  assert.ok(
    courseworkClientContent.includes('Final Grade') || courseworkClientContent.includes('Graded Evaluation'),
    'Must display numeric grade viewer'
  );
  assert.ok(
    courseworkClientContent.includes('Written Linguistic Feedback') || courseworkClientContent.includes('feedback'),
    'Must display written instructor feedback'
  );

  // 2. Data store logic verification
  const db = new FSLDatabaseEngine();

  // Check existing submissions from seed
  const existingSub = db.submissions.find((s) => s.learner_id === 'learner-2' && s.grade !== null);
  assert.ok(existingSub, 'Must have a graded submission for learner-2');
  assert.ok(existingSub.grade >= 0 && existingSub.grade <= 100, 'Grade must be 0-100');
  assert.ok(existingSub.feedback && existingSub.feedback.length > 0, 'Feedback must be present');

  // Submit new assignment response
  const newSub = db.submitAssignment('learner-2', 'asg-1', {
    file_url: 'https://storage.fsl.ph/submissions/demo-assignment-response.mp4',
  });
  assert.ok(newSub.id, 'Submission must return created ID');
  assert.equal(newSub.file_url, 'https://storage.fsl.ph/submissions/demo-assignment-response.mp4');

  // Empty submission URL must be rejected
  assert.throws(() => {
    db.submitAssignment('learner-2', 'asg-1', { file_url: '   ' });
  }, /required/);
});

test('Milestone 5 - Learning Materials & 6 Grounded Video Categories in Video Hub', () => {
  const materialsClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'materials', 'LearningMaterialsClient.tsx'),
    'utf8'
  );

  // 1. UI Elements Verification
  assert.ok(
    materialsClientContent.includes('AccessibleVideoPlayer'),
    'Must integrate AccessibleVideoPlayer component'
  );
  assert.ok(
    materialsClientContent.includes('FSL Video Hub'),
    'Must contain FSL Video Hub'
  );
  assert.ok(
    materialsClientContent.includes('PDF Handouts') || materialsClientContent.includes('Curriculum Handouts'),
    'Must contain PDF Handouts section'
  );

  // 2. All 6 Grounded Curriculum Categories from FSL_SPEC.md Verification
  const expectedCategories = [
    'Alphabet / Fingerspelling',
    'Basic Greetings',
    'Numbers',
    'Common Expressions',
    'Everyday Conversations',
    'Vocabulary Lessons',
  ];

  for (const cat of expectedCategories) {
    assert.ok(
      VIDEO_CATEGORIES.includes(cat),
      `harness must include grounded category: ${cat}`
    );
    assert.ok(
      materialsClientContent.includes(cat),
      `materials client must include category filter: ${cat}`
    );
  }

  // 3. Database Engine Videos & Materials Verification
  const db = new FSLDatabaseEngine();
  assert.ok(db.videos.length >= 6, 'Must have at least 6 seeded videos');

  for (const cat of expectedCategories) {
    const catVids = db.videos.filter((v) => v.category === cat);
    assert.ok(catVids.length >= 1, `Must have at least 1 video for category "${cat}"`);
  }

  const level1Vids = db.videos.filter((v) => v.level === 1);
  assert.ok(level1Vids.length >= 1, 'Must have Level 1 videos');
  const level2Vids = db.videos.filter((v) => v.level === 2);
  assert.ok(level2Vids.length >= 1, 'Must have Level 2 videos');
  const level3Vids = db.videos.filter((v) => v.level === 3);
  assert.ok(level3Vids.length >= 1, 'Must have Level 3 videos');

  assert.ok(db.materials.length >= 2, 'Must have at least 2 materials');
});

test('Milestone 5 - Learner Progression Roadmap & Academic Pathways (BSLI & Applied Deaf Studies)', () => {
  const progressionClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'progression', 'LearnerProgressionClient.tsx'),
    'utf8'
  );

  // 1. UI Elements Verification
  assert.ok(
    progressionClientContent.includes('FSL Progression & Academic Pathways'),
    'Must have page title'
  );
  assert.ok(
    progressionClientContent.includes('Three-Tier FSL Progression Roadmap'),
    'Must display 3-tier roadmap'
  );
  assert.ok(
    progressionClientContent.includes('BSLI (Bachelor in Sign Language Interpretation)'),
    'Must feature BSLI pathway'
  );
  assert.ok(
    progressionClientContent.includes('Applied Deaf Studies'),
    'Must feature Applied Deaf Studies pathway'
  );
  assert.ok(
    progressionClientContent.includes('Certificate of Completion') || progressionClientContent.includes('Certificate of Workshop Completion'),
    'Must feature Certificate of Completion readiness'
  );

  // 2. Data store progression calculation logic
  const db = new FSLDatabaseEngine();

  // Test Learner 3 (who completed Level 2 in seed)
  const progL3 = db.getLearnerProgression('learner-3');
  assert.ok(progL3.completedLevels.includes(2), 'Learner 3 must have completed Level 2');
  assert.equal(progL3.nextLevel, 3, 'Next level must be 3');

  // Academic pathways
  const bsli = progL3.pathways.find((p) => p.name.includes('BSLI'));
  assert.ok(bsli, 'BSLI pathway must exist');
  assert.equal(bsli.eligible, true, 'Learner 3 must be eligible for BSLI');

  const ads = progL3.pathways.find((p) => p.name.includes('Applied Deaf Studies'));
  assert.ok(ads, 'Applied Deaf Studies pathway must exist');
  assert.equal(ads.eligible, true, 'Learner 3 must be eligible for Applied Deaf Studies');
});
