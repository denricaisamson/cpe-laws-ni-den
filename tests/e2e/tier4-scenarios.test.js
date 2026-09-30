/**
 * Tier 4: Real-World Application Scenarios
 * 
 * Simulates complete, multi-step, multi-persona real-world user journeys
 * mirroring actual operations of the Filipino Sign Language (FSL) Workshop System.
 */

import assert from 'node:assert/strict';
import { FSLDatabaseEngine } from './harness.js';

export const tier4Tests = [];

function registerTest(name, fn) {
  tier4Tests.push({ name, fn });
}

// -----------------------------------------------------------------------------
// Scenario 1: Complete Learner Journey (Newcomer to Level 1 Graduate)
// -----------------------------------------------------------------------------
registerTest('Tier 4 Scenario 1 - Complete Learner Onboarding, Learning, Graduation & Community Journey', async () => {
  // Authoritative sources: ORIGINAL_REQUEST.md & FSL_SPEC.md § 1, 4, 5, 6
  const db = new FSLDatabaseEngine();

  // Step 1: Learner registers account
  const newLearner = db.registerUser({
    name: 'Bea Alonzo Santos',
    email: 'bea.santos@gmail.com',
    role: 'learner',
  });
  assert.ok(newLearner.id);
  assert.equal(newLearner.role, 'learner');

  // Step 2: Learner browses workshop catalog and selects Level 1
  const l1Workshop = db.workshops.find((w) => w.level === 1);
  assert.ok(l1Workshop);
  assert.equal(l1Workshop.fee, 2500);

  const l1Schedule = db.schedules.find((s) => s.workshop_id === l1Workshop.id);
  assert.ok(l1Schedule);
  const slotsBefore = l1Schedule.slots;

  // Step 3: Learner enrolls in schedule
  const enrollment = db.enrollLearner(newLearner.id, l1Schedule.id);
  assert.equal(enrollment.status, 'pending');
  assert.equal(l1Schedule.slots, slotsBefore - 1);

  // Step 4: Learner performs simulated checkout payment
  const payment = db.submitSimulatedPayment(newLearner.id, enrollment.id, l1Workshop.fee);
  assert.equal(payment.status, 'pending');
  assert.equal(payment.amount, 2500);

  // Step 5: Administrator audits payment queue and verifies payment
  const verifyResult = db.adminVerifyPayment('admin-1', payment.id);
  assert.equal(verifyResult.payment.status, 'verified');
  assert.equal(verifyResult.enrollment.status, 'enrolled');

  // Step 6: Learner accesses active class dashboard
  const activeSchedule = db.schedules.find((s) => s.id === enrollment.schedule_id);
  assert.ok(activeSchedule.meeting_link.startsWith('http'));

  // Step 7: Learner studies video tutorials in Alphabet and Basic Greetings
  const alphabetVideos = db.videos.filter((v) => v.level === 1 && v.category === 'Alphabet / Fingerspelling');
  assert.ok(alphabetVideos.length >= 1);
  const greetingsVideos = db.videos.filter((v) => v.level === 1 && v.category === 'Basic Greetings');
  assert.ok(greetingsVideos.length >= 1);

  // Step 8: Professor conducts 4 workshop sessions and logs attendance
  const sessionDates = ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'];
  for (const date of sessionDates) {
    const att = db.recordAttendance('prof-1', l1Schedule.id, enrollment.id, date, true);
    assert.equal(att.present, true);
  }

  // Verify learner attendance history has all 4 sessions
  const studentAttendance = db.attendance.filter((a) => a.enrollment_id === enrollment.id);
  assert.equal(studentAttendance.length, 4);

  // Step 9: Professor creates midterm signing evaluation assignment
  const assignment = db.createAssignment('prof-1', l1Schedule.id, {
    title: 'FSL Level 1 Final Video: Self-Introduction & Family Members',
    description: 'Sign your name, spell your city, and introduce three family members using FSL.',
    due_date: '2026-10-28T23:59:59Z',
  });

  // Step 10: Learner submits assignment video URL
  const submission = db.submitAssignment(newLearner.id, assignment.id, {
    file_url: 'https://storage.fsl.ph/submissions/bea-final-intro.mp4',
  });
  assert.ok(submission.id);

  // Step 11: Professor grades submission with feedback
  const graded = db.gradeSubmission('prof-1', submission.id, {
    grade: 98,
    feedback: 'Outstanding finger clarity, great rhythm, and beautiful non-manual signals!',
  });
  assert.equal(graded.grade, 98);

  // Step 12: Term finishes — learner completes Level 1
  enrollment.status = 'completed';

  // Step 13: Learner checks progression roadmap
  const progression = db.getLearnerProgression(newLearner.id);
  assert.ok(progression.completedLevels.includes(1));
  assert.equal(progression.currentLevel, 1);
  assert.equal(progression.nextLevel, 2);

  // Pathways are displayed
  assert.ok(progression.pathways.some((p) => p.name.includes('BSLI')));

  // Step 14: Learner browses community news (SDEAS & Deaf Festival)
  const news = db.news_events.filter((n) => n.type === 'deaf_festival' || n.type === 'sdeas_news');
  assert.ok(news.length >= 2);

  // Step 15: Learner buys FSL "I Love You" Shirt from merchandise catalog
  const shirt = db.products.find((p) => p.name.includes('Shirt'));
  const stockBefore = shirt.stock;
  db.purchaseProduct(shirt.id, 1);
  assert.equal(shirt.stock, stockBefore - 1);
});

// -----------------------------------------------------------------------------
// Scenario 2: Complete Professor Term Management Lifecycle
// -----------------------------------------------------------------------------
registerTest('Tier 4 Scenario 2 - Professor Section Management, Live Meetings, Rubric Grading & Messaging', async () => {
  // Authoritative sources: ORIGINAL_REQUEST.md R4 & FSL_SPEC.md § 2
  const db = new FSLDatabaseEngine();

  // Step 1: Professor 1 logs in and views assigned schedules
  const mySchedules = db.schedules.filter((s) => s.professor_id === 'prof-1');
  assert.ok(mySchedules.length >= 2);
  const targetSchedule = mySchedules[0];

  // Step 2: Professor sets virtual Google Meet link for the semester
  const semesterMeetUrl = 'https://meet.google.com/fsl-prof1-official-semester2026';
  db.updateMeetingLink('prof-1', targetSchedule.id, semesterMeetUrl);
  assert.equal(targetSchedule.meeting_link, semesterMeetUrl);

  // Step 3: Professor posts semester orientation announcement
  const announcement = {
    id: db.generateId('ann'),
    author_id: 'prof-1',
    schedule_id: targetSchedule.id,
    title: 'Orientation Guidelines: Visual Accessibility and Signing Space',
    body: 'Welcome everyone! Ensure your camera captures your upper torso and head clearly.',
  };
  db.announcements.push(announcement);

  // Step 4: Professor reviews roster and enrolls an admitted student
  const student = db.registerUser({
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@gmail.com',
    role: 'learner',
  });
  const enrollment = db.enrollLearner(student.id, targetSchedule.id);
  enrollment.status = 'enrolled'; // verified

  // Step 5: Professor conducts 5 weekly sessions and tracks attendance
  const weeklyDates = [
    '2026-10-05',
    '2026-10-12',
    '2026-10-19',
    '2026-10-26',
    '2026-11-02',
  ];
  for (let i = 0; i < weeklyDates.length; i++) {
    // Student present in first 4, absent in 5th
    const isPresent = i < 4;
    db.recordAttendance('prof-1', targetSchedule.id, enrollment.id, weeklyDates[i], isPresent);
  }

  const recordedAttendance = db.attendance.filter((a) => a.enrollment_id === enrollment.id);
  assert.equal(recordedAttendance.length, 5);
  const presentCount = recordedAttendance.filter((a) => a.present).length;
  assert.equal(presentCount, 4);

  // Step 6: Professor posts Midterm Assessment
  const midterm = db.createAssignment('prof-1', targetSchedule.id, {
    title: 'Midterm Practical Exam: Fingerspelling Speed & Accuracy',
    description: 'Spell 20 random words under 2 minutes with high handshape accuracy.',
    due_date: '2026-11-05T23:59:59Z',
  });

  // Step 7: Student submits
  const submission = db.submitAssignment(student.id, midterm.id, {
    file_url: 'https://storage.fsl.ph/submissions/carlos-fingerspelling-midterm.mp4',
  });

  // Step 8: Professor reviews and grades with constructive feedback
  const graded = db.gradeSubmission('prof-1', submission.id, {
    grade: 89,
    feedback: 'Good speed! Be mindful of palm orientation on letters P and Q.',
  });
  assert.equal(graded.grade, 89);
  assert.ok(graded.feedback.includes('palm orientation'));

  // Step 9: Student sends question via direct messages; Professor answers
  db.sendMessage(student.id, 'prof-1', 'Thank you Professor! Could you demonstrate letter P palm orientation?');
  const profReply = db.sendMessage(
    'prof-1',
    student.id,
    'Sure Carlos! Check the tutorial video under Alphabet category at timestamp 03:45.'
  );
  assert.ok(profReply.id);

  // Step 10: Professor uploads supplemental video to video library
  const suppVideo = db.uploadVideo('prof-1', {
    level: 1,
    title: 'FSL Tricky Letters: Palm Orientation for G, H, P, and Q',
    category: 'Alphabet / Fingerspelling',
    video_url: 'https://storage.fsl.ph/videos/tricky-letters.mp4',
  });
  assert.ok(suppVideo.id);
  assert.equal(suppVideo.uploaded_by, 'prof-1');
});

// -----------------------------------------------------------------------------
// Scenario 3: Complete Administrator Operations & Financial Audit
// -----------------------------------------------------------------------------
registerTest('Tier 4 Scenario 3 - Administrator Financial Auditing, Workshop Expansion & Community Management', async () => {
  // Authoritative sources: ORIGINAL_REQUEST.md R2 & FSL_SPEC.md § 3
  const db = new FSLDatabaseEngine();

  // Step 1: Admin logs in and audits registered users
  assert.ok(db.profiles.length >= 6);
  const professors = db.profiles.filter((p) => p.role === 'professor');
  const learners = db.profiles.filter((p) => p.role === 'learner');
  assert.equal(professors.length, 2);
  assert.ok(learners.length >= 3);

  // Step 2: Admin configures new FSL Level 3 workshop offering
  const advancedWorkshop = db.createWorkshop('admin-1', {
    level: 3,
    title: 'FSL 103: Advanced Sign Language Discourse & Community Interpreting',
    fee: 3800,
    description: 'Comprehensive study of FSL syntax, discourse structures, and community immersion.',
  });
  assert.ok(advancedWorkshop.id);
  assert.equal(advancedWorkshop.fee, 3800);

  // Step 3: Admin assigns schedule to Prof. Juan Dela Cruz with 18 slots
  const advancedSchedule = db.createSchedule('admin-1', {
    workshop_id: advancedWorkshop.id,
    professor_id: 'prof-1',
    day_time: 'Thursdays 6:00 PM - 9:00 PM',
    slots: 18,
    meeting_link: 'https://meet.google.com/fsl-adv-2026',
  });
  assert.ok(advancedSchedule.id);
  assert.equal(advancedSchedule.slots, 18);

  // Step 4: Three new learners enroll and submit payments
  const newLearners = [
    { name: 'Ana Gomez', email: 'ana.gomez@gmail.com' },
    { name: 'Ben Torres', email: 'ben.torres@gmail.com' },
    { name: 'Clara Santos', email: 'clara.santos@gmail.com' },
  ];

  const pendingPayIds = [];
  for (const nl of newLearners) {
    const reg = db.registerUser({ ...nl, role: 'learner' });
    const enr = db.enrollLearner(reg.id, advancedSchedule.id);
    const pay = db.submitSimulatedPayment(reg.id, enr.id, advancedWorkshop.fee);
    pendingPayIds.push(pay.id);
  }
  assert.equal(pendingPayIds.length, 3);
  assert.equal(advancedSchedule.slots, 18 - 3);

  // Step 5: Admin reviews financial queue before verification
  let financeSummary = db.getFinancialSummary('admin-1');
  const initialRevenue = financeSummary.totalRevenue;
  assert.equal(financeSummary.pendingCount, 3);
  assert.equal(financeSummary.pendingRevenue, 3800 * 3);

  // Step 6: Admin verifies all 3 transactions
  for (const payId of pendingPayIds) {
    const res = db.adminVerifyPayment('admin-1', payId);
    assert.equal(res.payment.status, 'verified');
    assert.equal(res.enrollment.status, 'enrolled');
  }

  // Step 7: Admin re-calculates financial summary
  financeSummary = db.getFinancialSummary('admin-1');
  assert.equal(financeSummary.totalRevenue, initialRevenue + 3800 * 3);
  assert.equal(financeSummary.pendingCount, 0);
  assert.equal(financeSummary.pendingRevenue, 0);

  // Check workshop revenue breakdown
  const advBreakdown = financeSummary.breakdown.find((b) => b.workshop_id === advancedWorkshop.id);
  assert.ok(advBreakdown);
  assert.equal(advBreakdown.enrolled_count, 3);
  assert.equal(advBreakdown.total_revenue, 3800 * 3);

  // Step 8: Admin publishes community announcement for Deaf Festival 2026
  const festivalEvent = {
    id: db.generateId('news'),
    title: 'Deaf Festival 2026 Call for Sign Poetry and Visual Theatre Performers',
    body: 'Calling all Deaf artists, storytellers, and FSL advocates to register for stage performances.',
    type: 'deaf_festival',
    date: '2026-10-01',
  };
  db.news_events.push(festivalEvent);
  assert.ok(db.news_events.some((n) => n.id === festivalEvent.id));

  // Step 9: Admin restocks merchandise inventory
  const pin = db.products.find((p) => p.name.includes('Pin'));
  const pinStockBefore = pin.stock;
  pin.stock += 50;
  assert.equal(pin.stock, pinStockBefore + 50);
});
