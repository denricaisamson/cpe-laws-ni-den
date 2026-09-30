// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Unit Test Suite: Milestone 3 (Admin Operations & Financial Reporting)
// File: tests/milestone3.test.mjs
// =====================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FSLDatabaseEngine } from './e2e/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Milestone 3 - Admin Routes and Source Files Existence', () => {
  const requiredFiles = [
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'AdminDashboardClient.tsx'),
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'workshops', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'workshops', 'WorkshopsManagementClient.tsx'),
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'users', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'users', 'UsersManagementClient.tsx'),
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'payments', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'payments', 'PaymentsVerificationClient.tsx'),
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'finance', 'page.tsx'),
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'finance', 'FinancialReportingClient.tsx'),
    path.join(rootDir, 'src', 'lib', 'admin-data.ts'),
  ];

  for (const filePath of requiredFiles) {
    assert.ok(fs.existsSync(filePath), `Required file must exist: ${filePath}`);
  }
});

test('Milestone 3 - Admin Console Home Specification Verification', () => {
  const adminPageContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'AdminDashboardClient.tsx'),
    'utf8'
  );

  // 1. Four Required KPI Cards
  assert.ok(
    adminPageContent.includes('Total Revenue (₱)'),
    'Admin dashboard must contain Total Revenue (₱) KPI card'
  );
  assert.ok(
    adminPageContent.includes('Enrolled Learners'),
    'Admin dashboard must contain Enrolled Learners KPI card'
  );
  assert.ok(
    adminPageContent.includes('Active Schedules'),
    'Admin dashboard must contain Active Schedules KPI card'
  );
  assert.ok(
    adminPageContent.includes('Pending Payment Queue'),
    'Admin dashboard must contain Pending Payment Queue Count KPI card'
  );

  // 2. Direct quick-action navigation cards
  assert.ok(
    adminPageContent.includes('/admin/workshops'),
    'Admin dashboard must provide direct link to /admin/workshops'
  );
  assert.ok(
    adminPageContent.includes('/admin/users'),
    'Admin dashboard must provide direct link to /admin/users'
  );
  assert.ok(
    adminPageContent.includes('/admin/payments'),
    'Admin dashboard must provide direct link to /admin/payments'
  );
  assert.ok(
    adminPageContent.includes('/admin/finance'),
    'Admin dashboard must provide direct link to /admin/finance'
  );
});

test('Milestone 3 - Workshop & Schedule Management Specification & Logic', () => {
  const wsClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'workshops', 'WorkshopsManagementClient.tsx'),
    'utf8'
  );

  // UI & Form verification
  assert.ok(wsClientContent.includes('Workshops & Schedules Management'), 'Must have proper title');
  assert.ok(wsClientContent.includes('Create Workshop'), 'Must provide Create Workshop button');
  assert.ok(wsClientContent.includes('Add Schedule'), 'Must provide Add Schedule button');
  assert.ok(wsClientContent.includes('Level 1'), 'Must categorize Level 1');
  assert.ok(wsClientContent.includes('Level 2'), 'Must categorize Level 2');
  assert.ok(wsClientContent.includes('Level 3'), 'Must categorize Level 3');
  assert.ok(wsClientContent.includes('Assign Professor'), 'Must have professor assignment select');
  assert.ok(wsClientContent.includes('Slot Quota'), 'Must have slot quota controls');
  assert.ok(wsClientContent.includes('meeting_link') || wsClientContent.includes('Meeting Link'), 'Must have meeting link controls');

  // Database Engine Logic Validation
  const db = new FSLDatabaseEngine();

  // 1. Create a new workshop
  const newWs = db.createWorkshop('admin-1', {
    level: 1,
    title: 'FSL 101 Weekend Beginners Section B',
    fee: 1750,
    description: 'Fast-track introductory course in visual communication.',
  });

  assert.ok(newWs.id, 'Created workshop must have an ID');
  assert.equal(newWs.level, 1);
  assert.equal(newWs.fee, 1750);
  assert.equal(newWs.title, 'FSL 101 Weekend Beginners Section B');

  // Validate rejection on bad level
  assert.throws(() => {
    db.createWorkshop('admin-1', {
      level: 4,
      title: 'Invalid Level Workshop',
      fee: 2000,
      description: 'Test',
    });
  }, /Invalid workshop level/);

  // Validate rejection on empty title
  assert.throws(() => {
    db.createWorkshop('admin-1', {
      level: 2,
      title: '   ',
      fee: 2000,
      description: 'Test',
    });
  }, /title cannot be empty/);

  // Validate rejection on negative fee
  assert.throws(() => {
    db.createWorkshop('admin-1', {
      level: 2,
      title: 'Negative Fee Workshop',
      fee: -500,
      description: 'Test',
    });
  }, /fee must be a non-negative number/);

  // 2. Create schedule for the workshop with assigned professor and slot quota
  const newSchedule = db.createSchedule('admin-1', {
    workshop_id: newWs.id,
    professor_id: 'prof-1',
    day_time: 'Saturdays 10:00 AM - 01:00 PM',
    slots: 22,
    meeting_link: 'https://meet.google.com/test-fsl-101',
  });

  assert.ok(newSchedule.id);
  assert.equal(newSchedule.workshop_id, newWs.id);
  assert.equal(newSchedule.professor_id, 'prof-1');
  assert.equal(newSchedule.slots, 22);
  assert.equal(newSchedule.day_time, 'Saturdays 10:00 AM - 01:00 PM');
  assert.equal(newSchedule.meeting_link, 'https://meet.google.com/test-fsl-101');

  // Validate rejection on non-professor assignment
  assert.throws(() => {
    db.createSchedule('admin-1', {
      workshop_id: newWs.id,
      professor_id: 'learner-1',
      day_time: 'Sundays 2:00 PM - 5:00 PM',
      slots: 15,
    });
  }, /not found or does not have professor role/);

  // Validate rejection on invalid slots
  assert.throws(() => {
    db.createSchedule('admin-1', {
      workshop_id: newWs.id,
      professor_id: 'prof-1',
      day_time: 'Sundays 2:00 PM - 5:00 PM',
      slots: 0,
    });
  }, /Slots must be at least 1/);
});

test('Milestone 3 - User Management Directory Specification & Logic', () => {
  const usersClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'users', 'UsersManagementClient.tsx'),
    'utf8'
  );

  // UI verification
  assert.ok(usersClientContent.includes('User Management Directory'), 'Must have title');
  assert.ok(usersClientContent.includes('Search by user name or email'), 'Must provide search input');
  assert.ok(usersClientContent.includes('Learners'), 'Must provide Learners tab filter');
  assert.ok(usersClientContent.includes('Professors'), 'Must provide Professors tab filter');
  assert.ok(usersClientContent.includes('Admins'), 'Must provide Admins tab filter');
  assert.ok(usersClientContent.includes('Change Role'), 'Must provide role change action');

  // Business logic verification
  const db = new FSLDatabaseEngine();
  const learner = db.getProfile('learner-1');
  assert.ok(learner);
  assert.equal(learner.role, 'learner');

  // Promote learner to professor
  learner.role = 'professor';
  assert.equal(db.getProfile('learner-1').role, 'professor');

  // Registration boundary validation
  assert.throws(() => {
    db.registerUser({ name: '', email: 'valid@fsl.ph', role: 'learner' });
  }, /name cannot be empty/);

  assert.throws(() => {
    db.registerUser({ name: 'Valid Name', email: 'invalid-email', role: 'learner' });
  }, /valid email is required/);

  assert.throws(() => {
    db.registerUser({ name: 'Valid Name', email: 'valid2@fsl.ph', role: 'superadmin' });
  }, /invalid role/);
});

test('Milestone 3 - Payment Verification Workflow & Atomic State Updates', () => {
  const paymentsClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'payments', 'PaymentsVerificationClient.tsx'),
    'utf8'
  );

  // UI verification
  assert.ok(paymentsClientContent.includes('Payment Verification Queue'), 'Must have title');
  assert.ok(paymentsClientContent.includes('Verify Payment'), 'Must have Verify Payment button');
  assert.ok(paymentsClientContent.includes('Pending Queue'), 'Must have Pending queue tab');
  assert.ok(paymentsClientContent.includes('Verified'), 'Must have Verified tab');

  // State Machine Validation
  const db = new FSLDatabaseEngine();

  // Learner 1 enrolls in Schedule 1
  const enrollment = db.enrollLearner('learner-1', 's-1');
  assert.equal(enrollment.status, 'pending');

  // Learner submits simulated payment
  const payment = db.submitSimulatedPayment('learner-1', enrollment.id, 2500);
  assert.equal(payment.status, 'pending');

  // Admin verifies payment
  const verifyResult = db.adminVerifyPayment('admin-1', payment.id);
  // Atomic assertion: both payment and enrollment updated together
  assert.equal(verifyResult.payment.status, 'verified');
  assert.equal(verifyResult.enrollment.status, 'enrolled');

  // Attempting to re-verify an already verified payment must throw
  assert.throws(() => {
    db.adminVerifyPayment('admin-1', payment.id);
  }, /already verified/);

  // Verifying a non-existent payment must throw
  assert.throws(() => {
    db.adminVerifyPayment('admin-1', 'non-existent-payment-id');
  }, /not found/);

  // Non-admin cannot verify payments
  assert.throws(() => {
    db.adminVerifyPayment('learner-1', payment.id);
  }, /only administrators can verify payments/);
});

test('Milestone 3 - Financial Reporting Dashboard & Transaction Ledger Analytics', () => {
  const financeClientContent = fs.readFileSync(
    path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'finance', 'FinancialReportingClient.tsx'),
    'utf8'
  );

  // UI verification
  assert.ok(financeClientContent.includes('Financial Analytics & Revenue Summary'), 'Must have title');
  assert.ok(financeClientContent.includes('Total Verified Revenue'), 'Must have Total Verified Revenue KPI');
  assert.ok(financeClientContent.includes('Revenue Breakdown by FSL Level'), 'Must have Level breakdown');
  assert.ok(financeClientContent.includes('Breakdown by Schedule & Assigned Faculty'), 'Must have Schedule breakdown');
  assert.ok(financeClientContent.includes('Transaction Audit Ledger'), 'Must have Transaction Ledger');

  // Business Logic Validation
  const db = new FSLDatabaseEngine();
  const summary = db.getFinancialSummary('admin-1');

  // 1. KPI totals
  assert.ok(typeof summary.totalRevenue === 'number');
  assert.ok(typeof summary.pendingRevenue === 'number');
  assert.ok(summary.verifiedCount >= 2);
  assert.ok(summary.transactionCount >= 2);

  // 2. Level breakdown
  assert.ok(summary.breakdown.length >= 3);
  for (const b of summary.breakdown) {
    assert.ok(b.workshop_id);
    assert.ok(b.title);
    assert.ok([1, 2, 3].includes(b.level));
    assert.ok(typeof b.total_revenue === 'number');
  }

  // 3. Non-admin access denial
  assert.throws(() => {
    db.getFinancialSummary('prof-1');
  }, /only administrators can view financial reports/);
});
