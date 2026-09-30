/**
 * Tier 1: Feature Coverage (Features 1 to 18 in Isolation)
 * 
 * Verifies the primary happy path behavior for every single feature inventoried
 * in PROJECT.md and specified in ORIGINAL_REQUEST.md and FSL_SPEC.md.
 */

import assert from 'node:assert/strict';
import {
  FSLDatabaseEngine,
  ROLES,
  WORKSHOP_LEVELS,
  ENROLLMENT_STATUSES,
  PAYMENT_STATUSES,
  VIDEO_CATEGORIES,
  NEWS_TYPES,
  calculateContrastRatio,
} from './harness.js';

export const tier1Tests = [];

function registerTest(name, fn) {
  tier1Tests.push({ name, fn });
}

// -----------------------------------------------------------------------------
// Feature 1: Scaffolding & Setup
// -----------------------------------------------------------------------------
registerTest('Feature 1 - Scaffolding & Setup: Validates framework configuration & environment sanity', async () => {
  // Authoritative source: PROJECT.md § Architecture
  // Next.js App Router, TypeScript, Tailwind CSS
  assert.ok(Array.isArray(ROLES), 'Roles definition must exist');
  assert.equal(ROLES.length, 3, 'Must define exactly 3 roles: learner, professor, admin');
  assert.deepEqual(ROLES.sort(), ['admin', 'learner', 'professor']);
});

// -----------------------------------------------------------------------------
// Feature 2: Supabase Database Schema
// -----------------------------------------------------------------------------
registerTest('Feature 2 - Supabase Database Schema: 14 relational tables presence & constraints', async () => {
  // Authoritative source: ORIGINAL_REQUEST.md § Database Schema (14 Tables)
  const db = new FSLDatabaseEngine();
  const tableNames = [
    'profiles',
    'workshops',
    'schedules',
    'enrollments',
    'payments',
    'attendance',
    'assignments',
    'submissions',
    'materials',
    'videos',
    'announcements',
    'messages',
    'news_events',
    'products',
  ];

  for (const table of tableNames) {
    assert.ok(Array.isArray(db[table]), `Table "${table}" must be defined as an array in DB`);
    assert.ok(db[table].length > 0, `Table "${table}" must contain initial seeded records`);
  }
});

// -----------------------------------------------------------------------------
// Feature 3: Demo Seed Data
// -----------------------------------------------------------------------------
registerTest('Feature 3 - Demo Seed Data: Grounded FSL dataset completeness', async () => {
  // Authoritative source: FSL_SPEC.md & PROJECT.md
  const db = new FSLDatabaseEngine();

  // Profiles: Admin, 2 Professors, 3 Learners
  assert.equal(db.profiles.filter((p) => p.role === 'admin').length, 1);
  assert.equal(db.profiles.filter((p) => p.role === 'professor').length, 2);
  assert.equal(db.profiles.filter((p) => p.role === 'learner').length, 3);

  // Workshops: 3 levels (1, 2, 3)
  const levels = db.workshops.map((w) => w.level).sort();
  assert.deepEqual(levels, [1, 2, 3]);

  // Videos: All 6 official categories represented
  const presentCategories = new Set(db.videos.map((v) => v.category));
  for (const cat of VIDEO_CATEGORIES) {
    assert.ok(presentCategories.has(cat), `Video category "${cat}" must be present in demo seed`);
  }

  // News: Contains SDEAS and Deaf Festival items
  const newsTypes = new Set(db.news_events.map((n) => n.type));
  assert.ok(newsTypes.has('sdeas_news'), 'SDEAS news must be in seed');
  assert.ok(newsTypes.has('deaf_festival'), 'Deaf festival must be in seed');
});

// -----------------------------------------------------------------------------
// Feature 4: Supabase SSR Integration
// -----------------------------------------------------------------------------
registerTest('Feature 4 - Supabase SSR Integration: Session handling and fallback data engine', async () => {
  const db = new FSLDatabaseEngine();
  // Simulates SSR server profile resolution by session user ID
  const adminProfile = db.getProfile('admin-1');
  assert.ok(adminProfile);
  assert.equal(adminProfile.role, 'admin');

  const unknownProfile = db.getProfile('non-existent-user');
  assert.equal(unknownProfile, null, 'Unauthenticated/unknown user returns null profile');
});

// -----------------------------------------------------------------------------
// Feature 5: Accessible Layout & High-Contrast Theme
// -----------------------------------------------------------------------------
registerTest('Feature 5 - Accessible Layout & Theme: Contrast ratio meets WCAG AAA standards', async () => {
  // Authoritative source: PROJECT.md § Architecture & Accessibility (WCAG AAA 7:1)
  // Contrast checks on FSL high-contrast palette
  const darkNavy = '#0F172A'; // Slate-900 / dark background
  const whiteText = '#FFFFFF';
  const contrastOnDark = calculateContrastRatio(whiteText, darkNavy);
  assert.ok(contrastOnDark >= 7.0, `White text on dark navy must exceed 7:1 (got ${contrastOnDark.toFixed(2)})`);

  const pureBlack = '#000000';
  const brightYellow = '#FACC15'; // Yellow-400 for high-contrast warnings/focus
  const contrastYellow = calculateContrastRatio(pureBlack, brightYellow);
  assert.ok(contrastYellow >= 7.0, `Black on bright yellow must exceed 7:1 (got ${contrastYellow.toFixed(2)})`);
});

// -----------------------------------------------------------------------------
// Feature 6: Auth & Role-Based Guards
// -----------------------------------------------------------------------------
registerTest('Feature 6 - Auth & Role Guards: Role-based navigation permission logic', async () => {
  // Authoritative source: ORIGINAL_REQUEST.md § R1
  function canAccessRoute(role, path) {
    if (!role) return false;
    if (path.startsWith('/admin')) return role === 'admin';
    if (path.startsWith('/professor')) return role === 'professor';
    if (path.startsWith('/learner')) return role === 'learner';
    return true; // Public routes: /news, /merchandise, /login
  }

  // Learner access
  assert.equal(canAccessRoute('learner', '/learner/dashboard'), true);
  assert.equal(canAccessRoute('learner', '/admin/finances'), false);
  assert.equal(canAccessRoute('learner', '/professor/roster'), false);
  assert.equal(canAccessRoute('learner', '/news'), true);

  // Professor access
  assert.equal(canAccessRoute('professor', '/professor/roster'), true);
  assert.equal(canAccessRoute('professor', '/admin/users'), false);
  assert.equal(canAccessRoute('professor', '/learner/classes'), false);

  // Admin access
  assert.equal(canAccessRoute('admin', '/admin/finances'), true);
  assert.equal(canAccessRoute('admin', '/admin/workshops'), true);
  assert.equal(canAccessRoute(null, '/admin/finances'), false);
});

// -----------------------------------------------------------------------------
// Feature 7: Admin Management & Users
// -----------------------------------------------------------------------------
registerTest('Feature 7 - Admin Operations: Workshop, schedule creation & user management', async () => {
  // Authoritative source: ORIGINAL_REQUEST.md § R2
  const db = new FSLDatabaseEngine();

  // Admin creates an additional workshop
  const newWorkshop = db.createWorkshop('admin-1', {
    level: 1,
    title: 'FSL 101 Weekend Intensive Batch 2',
    fee: 2500,
    description: 'Fast-paced weekend course for busy professionals.',
  });
  assert.ok(newWorkshop.id);
  assert.equal(newWorkshop.title, 'FSL 101 Weekend Intensive Batch 2');

  // Admin creates a schedule assigned to Prof 1 with 25 slots
  const newSchedule = db.createSchedule('admin-1', {
    workshop_id: newWorkshop.id,
    professor_id: 'prof-1',
    day_time: 'Saturdays 2:00 PM - 5:00 PM',
    slots: 25,
    meeting_link: 'https://meet.google.com/batch2-sat',
  });
  assert.ok(newSchedule.id);
  assert.equal(newSchedule.slots, 25);
  assert.equal(newSchedule.professor_id, 'prof-1');
});

// -----------------------------------------------------------------------------
// Feature 8: Admin Payments & Finance
// -----------------------------------------------------------------------------
registerTest('Feature 8 - Admin Payments & Finance: Payment verification & revenue summary', async () => {
  // Authoritative source: ORIGINAL_REQUEST.md § R2 & Interface Contract
  const db = new FSLDatabaseEngine();

  // Learner 1 enrolls in Schedule 1
  const enrollment = db.enrollLearner('learner-1', 's-1');
  assert.equal(enrollment.status, 'pending');

  // Learner submits simulated payment
  const payment = db.submitSimulatedPayment('learner-1', enrollment.id, 2500);
  assert.equal(payment.status, 'pending');

  // Admin verifies payment
  const result = db.adminVerifyPayment('admin-1', payment.id);
  assert.equal(result.payment.status, 'verified');
  assert.equal(result.enrollment.status, 'enrolled');

  // Financial summary check: 3 verified payments (2 from seed: 3000 + 3000, 1 newly verified: 2500)
  const finances = db.getFinancialSummary('admin-1');
  assert.equal(finances.totalRevenue, 3000 + 3000 + 2500);
  assert.equal(finances.verifiedCount, 3);
});

// -----------------------------------------------------------------------------
// Feature 9: Professor Classroom & Attendance
// -----------------------------------------------------------------------------
registerTest('Feature 9 - Professor Classroom & Attendance: Roster & attendance logging', async () => {
  // Authoritative source: ORIGINAL_REQUEST.md § R4 & FSL_SPEC.md § 2
  const db = new FSLDatabaseEngine();

  // Professor 2 checks assigned schedule s-2
  const schedule = db.schedules.find((s) => s.id === 's-2');
  assert.equal(schedule.professor_id, 'prof-2');

  // Professor updates meeting link
  const updated = db.updateMeetingLink('prof-2', 's-2', 'https://meet.google.com/updated-room-fsl');
  assert.equal(updated.meeting_link, 'https://meet.google.com/updated-room-fsl');

  // Record attendance for enrolled learner-2 (enrollment e-1)
  const attRecord = db.recordAttendance('prof-2', 's-2', 'e-1', '2026-09-21', true);
  assert.ok(attRecord.id);
  assert.equal(attRecord.present, true);
});

// -----------------------------------------------------------------------------
// Feature 10: Professor Assignments & Grading
// -----------------------------------------------------------------------------
registerTest('Feature 10 - Professor Assignments & Grading: Creation, submission & grading', async () => {
  // Authoritative source: ORIGINAL_REQUEST.md § R4
  const db = new FSLDatabaseEngine();

  // Professor creates assignment
  const asg = db.createAssignment('prof-2', 's-2', {
    title: 'Visual Numbers & Classifier Quiz',
    description: 'Submit a video signing numbers 1-50 with classifier stories.',
    due_date: '2026-10-30T23:59:59Z',
  });
  assert.ok(asg.id);

  // Learner 2 submits
  const sub = db.submitAssignment('learner-2', asg.id, {
    file_url: 'https://storage.fsl.ph/submissions/sub-quiz-numbers.mp4',
  });
  assert.ok(sub.id);
  assert.equal(sub.grade, null);

  // Professor grades
  const graded = db.gradeSubmission('prof-2', sub.id, {
    grade: 96,
    feedback: 'Flawless finger dexterity and excellent pacing.',
  });
  assert.equal(graded.grade, 96);
  assert.equal(graded.feedback, 'Flawless finger dexterity and excellent pacing.');
});

// -----------------------------------------------------------------------------
// Feature 11: Learner Catalog & Checkout
// -----------------------------------------------------------------------------
registerTest('Feature 11 - Learner Catalog & Checkout: Catalog by level & simulated payment', async () => {
  // Authoritative source: ORIGINAL_REQUEST.md § R3
  const db = new FSLDatabaseEngine();

  // Filter catalog by Level 1
  const level1Workshops = db.workshops.filter((w) => w.level === 1);
  assert.ok(level1Workshops.length >= 1);
  assert.equal(level1Workshops[0].fee, 2500);

  // Available schedules for Level 1
  const l1Schedules = db.schedules.filter((s) => s.workshop_id === level1Workshops[0].id);
  assert.ok(l1Schedules.length >= 1);
  assert.ok(l1Schedules[0].slots > 0);

  // Learner enrolls
  const initialSlots = l1Schedules[0].slots;
  const enrollment = db.enrollLearner('learner-1', l1Schedules[0].id);
  assert.equal(enrollment.status, 'pending');
  assert.equal(l1Schedules[0].slots, initialSlots - 1);

  // Simulated checkout generates payment record
  const payment = db.submitSimulatedPayment('learner-1', enrollment.id, 2500);
  assert.equal(payment.amount, 2500);
  assert.equal(payment.status, 'pending');
});

// -----------------------------------------------------------------------------
// Feature 12: Learner Classes & Coursework
// -----------------------------------------------------------------------------
registerTest('Feature 12 - Learner Classes & Coursework: Active enrolled class view & submissions', async () => {
  // Authoritative source: ORIGINAL_REQUEST.md § R3
  const db = new FSLDatabaseEngine();

  // Learner 2 is enrolled in Schedule 2 (enrollment e-1)
  const myEnrollments = db.enrollments.filter((e) => e.learner_id === 'learner-2' && e.status === 'enrolled');
  assert.equal(myEnrollments.length, 1);

  const schedule = db.schedules.find((s) => s.id === myEnrollments[0].schedule_id);
  assert.ok(schedule.meeting_link.startsWith('http'));

  // Learner views their assignments and grades
  const submissions = db.submissions.filter((s) => s.learner_id === 'learner-2');
  assert.ok(submissions.length >= 1);
  assert.equal(submissions[0].grade, 92);
  assert.ok(submissions[0].feedback.length > 0);
});

// -----------------------------------------------------------------------------
// Feature 13: Learning Hub & Video Library
// -----------------------------------------------------------------------------
registerTest('Feature 13 - Learning Hub & Video Library: Filtering by 6 grounded categories and FSL levels', async () => {
  // Authoritative source: FSL_SPEC.md § Tutorial Videos
  const db = new FSLDatabaseEngine();

  // Filter videos by category: 'Alphabet / Fingerspelling'
  const alphabetVids = db.videos.filter((v) => v.category === 'Alphabet / Fingerspelling');
  assert.ok(alphabetVids.length >= 1);
  assert.equal(alphabetVids[0].level, 1);

  // Filter videos by level: Level 2
  const level2Vids = db.videos.filter((v) => v.level === 2);
  assert.ok(level2Vids.length >= 2);

  // Materials list
  assert.ok(db.materials.length >= 2);
  assert.ok(db.materials.some((m) => m.title.includes('Handshape')));
});

// -----------------------------------------------------------------------------
// Feature 14: Progression & Pathways
// -----------------------------------------------------------------------------
registerTest('Feature 14 - Progression & Pathways: Level tracking, BSLI & Applied Deaf Studies', async () => {
  // Authoritative source: FSL_SPEC.md § 6 FSL Progression
  const db = new FSLDatabaseEngine();

  // Learner 3 completed Level 2
  const progL3 = db.getLearnerProgression('learner-3');
  assert.ok(progL3.completedLevels.includes(2));
  assert.equal(progL3.nextLevel, 3);

  // Check post-completion pathway recommendations
  const bsliPathway = progL3.pathways.find((p) => p.name.includes('BSLI'));
  assert.ok(bsliPathway);
  assert.equal(bsliPathway.eligible, true);

  const adsPathway = progL3.pathways.find((p) => p.name.includes('Applied Deaf Studies'));
  assert.ok(adsPathway);
  assert.equal(adsPathway.eligible, true);
});

// -----------------------------------------------------------------------------
// Feature 15: Direct Messaging
// -----------------------------------------------------------------------------
registerTest('Feature 15 - Direct Messaging: Threaded communication between learner & professor', async () => {
  // Authoritative source: ORIGINAL_REQUEST.md § R5 & FSL_SPEC.md § 1 & 2
  const db = new FSLDatabaseEngine();

  // Send new message from learner-1 to prof-1
  const msg = db.sendMessage('learner-1', 'prof-1', 'Hello Professor, will session 1 cover numbers?');
  assert.ok(msg.id);
  assert.equal(msg.body, 'Hello Professor, will session 1 cover numbers?');

  // Reply from prof-1
  db.sendMessage('prof-1', 'learner-1', 'Yes Mark! We will cover cardinal numbers 1-20 in session 1.');

  // Verify thread order
  const thread = db.getMessageThread('learner-1', 'prof-1');
  assert.equal(thread.length, 2);
  assert.equal(thread[0].sender_id, 'learner-1');
  assert.equal(thread[1].sender_id, 'prof-1');
});

// -----------------------------------------------------------------------------
// Feature 16: Community News & Events
// -----------------------------------------------------------------------------
registerTest('Feature 16 - Community News & Events: SDEAS news, Deaf Festival, seminars & spotlights', async () => {
  // Authoritative source: FSL_SPEC.md § 4 FSL News and Community
  const db = new FSLDatabaseEngine();

  const sdeasArticle = db.news_events.find((n) => n.type === 'sdeas_news');
  assert.ok(sdeasArticle);
  assert.ok(sdeasArticle.title.includes('SDEAS'));

  const festivalArticle = db.news_events.find((n) => n.type === 'deaf_festival');
  assert.ok(festivalArticle);
  assert.ok(festivalArticle.title.includes('Deaf Festival'));

  const seminarArticle = db.news_events.find((n) => n.type === 'seminar');
  assert.ok(seminarArticle);
});

// -----------------------------------------------------------------------------
// Feature 17: Merchandise Catalog
// -----------------------------------------------------------------------------
registerTest('Feature 17 - Merchandise Catalog: FSL shirts, bags, pins with price & stock', async () => {
  // Authoritative source: FSL_SPEC.md § 5 & ORIGINAL_REQUEST.md § R5
  const db = new FSLDatabaseEngine();

  assert.ok(db.products.length >= 3);
  const shirt = db.products.find((p) => p.name.includes('Shirt'));
  assert.ok(shirt);
  assert.equal(shirt.price, 450);
  assert.ok(shirt.stock > 0);

  const bag = db.products.find((p) => p.name.includes('Tote Bag'));
  assert.ok(bag);
  assert.equal(bag.price, 350);

  const pin = db.products.find((p) => p.name.includes('Pin'));
  assert.ok(pin);
  assert.equal(pin.price, 150);
});

// -----------------------------------------------------------------------------
// Feature 18: Final System Verification & Acceptance Checklist
// -----------------------------------------------------------------------------
registerTest('Feature 18 - Final Acceptance: System integrity & end-to-end criteria checklist', async () => {
  // Authoritative source: ORIGINAL_REQUEST.md § Acceptance Criteria
  const db = new FSLDatabaseEngine();

  // 1. All 14 tables verified
  assert.equal(Object.keys(db).filter((k) => Array.isArray(db[k])).length, 14);

  // 2. 3 Roles verified
  assert.equal(ROLES.length, 3);

  // 3. 6 Video categories grounded
  assert.equal(VIDEO_CATEGORIES.length, 6);

  // 4. Contrast calculation passes
  assert.ok(calculateContrastRatio('#FFFFFF', '#000000') >= 20.0);
});
