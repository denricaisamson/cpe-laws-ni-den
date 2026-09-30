// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Admin Operations Data Store & Business Logic
// File: src/lib/admin-data.ts
// =====================================================================

import type {
  Workshop,
  Schedule,
  Profile,
  Enrollment,
  Payment,
  WorkshopLevel,
  UserRole,
  ScheduleWithDetails,
  EnrollmentWithDetails,
  PaymentWithDetails,
} from '@/types/database';
import {
  mockWorkshops as initialWorkshops,
  mockProfiles as initialProfiles,
  mockSchedules as initialSchedules,
  mockEnrollments as initialEnrollments,
  mockPayments as initialPayments,
} from './mock-data';

const STORAGE_KEY = 'fsl_admin_store_v1';
const STORE_EVENT = 'fsl-admin-store-updated';

// In-memory working state
let workshopsState: Workshop[] = JSON.parse(JSON.stringify(initialWorkshops));
let schedulesState: Schedule[] = JSON.parse(JSON.stringify(initialSchedules));
let profilesState: Profile[] = JSON.parse(JSON.stringify(initialProfiles));
let enrollmentsState: Enrollment[] = JSON.parse(JSON.stringify(initialEnrollments));
let paymentsState: Payment[] = JSON.parse(JSON.stringify(initialPayments));

let isHydrated = false;

function hydrateFromLocalStorage() {
  if (typeof window === 'undefined') return;
  if (isHydrated) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.workshops) workshopsState = parsed.workshops;
      if (parsed.schedules) schedulesState = parsed.schedules;
      if (parsed.profiles) profilesState = parsed.profiles;
      if (parsed.enrollments) enrollmentsState = parsed.enrollments;
      if (parsed.payments) paymentsState = parsed.payments;
    }
  } catch (err) {
    console.error('Failed to hydrate admin store from localStorage:', err);
  } finally {
    isHydrated = true;
  }
}

function persistToLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      workshops: workshopsState,
      schedules: schedulesState,
      profiles: profilesState,
      enrollments: enrollmentsState,
      payments: paymentsState,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(STORE_EVENT));
  } catch (err) {
    console.error('Failed to persist admin store to localStorage:', err);
  }
}

/**
 * Resets the in-memory store to original seed data (useful for test suites).
 */
export function resetAdminStore() {
  workshopsState = JSON.parse(JSON.stringify(initialWorkshops));
  schedulesState = JSON.parse(JSON.stringify(initialSchedules));
  profilesState = JSON.parse(JSON.stringify(initialProfiles));
  enrollmentsState = JSON.parse(JSON.stringify(initialEnrollments));
  paymentsState = JSON.parse(JSON.stringify(initialPayments));
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(STORE_EVENT));
    } catch {}
  }
}

/**
 * Subscribes to store change notifications in the browser.
 */
export function subscribeToAdminStore(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  hydrateFromLocalStorage();
  const handler = () => callback();
  window.addEventListener(STORE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(STORE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

// ---------------------------------------------------------------------
// WORKSHOPS MANAGEMENT
// ---------------------------------------------------------------------

export function getAllWorkshops(): Workshop[] {
  hydrateFromLocalStorage();
  return [...workshopsState];
}

export function createWorkshop(data: {
  level: WorkshopLevel;
  title: string;
  fee: number;
  description: string;
}): Workshop {
  hydrateFromLocalStorage();

  const levelNum = Number(data.level) as WorkshopLevel;
  if (![1, 2, 3].includes(levelNum)) {
    throw new Error('Workshop level must be 1, 2, or 3');
  }
  if (!data.title || data.title.trim().length === 0) {
    throw new Error('Workshop title cannot be empty');
  }
  const feeNum = Number(data.fee);
  if (isNaN(feeNum) || feeNum < 0) {
    throw new Error('Workshop fee must be a non-negative number');
  }

  const newWorkshop: Workshop = {
    id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    level: levelNum,
    title: data.title.trim(),
    fee: feeNum,
    description: (data.description || '').trim(),
    created_at: new Date().toISOString(),
  };

  workshopsState.push(newWorkshop);
  persistToLocalStorage();
  return newWorkshop;
}

export function updateWorkshop(
  workshopId: string,
  updates: Partial<Pick<Workshop, 'title' | 'level' | 'fee' | 'description'>>
): Workshop {
  hydrateFromLocalStorage();

  const index = workshopsState.findIndex((w) => w.id === workshopId);
  if (index === -1) {
    throw new Error(`Workshop with ID "${workshopId}" not found`);
  }

  const existing = workshopsState[index];
  const updated: Workshop = {
    ...existing,
    ...updates,
    level: updates.level !== undefined ? (Number(updates.level) as WorkshopLevel) : existing.level,
    fee: updates.fee !== undefined ? Number(updates.fee) : existing.fee,
    title: updates.title !== undefined ? updates.title.trim() : existing.title,
    description: updates.description !== undefined ? updates.description.trim() : existing.description,
  };

  if (![1, 2, 3].includes(updated.level)) {
    throw new Error('Workshop level must be 1, 2, or 3');
  }
  if (!updated.title || updated.title.trim().length === 0) {
    throw new Error('Workshop title cannot be empty');
  }
  if (isNaN(updated.fee) || updated.fee < 0) {
    throw new Error('Workshop fee must be a non-negative number');
  }

  workshopsState[index] = updated;
  persistToLocalStorage();
  return updated;
}

// ---------------------------------------------------------------------
// SCHEDULES MANAGEMENT
// ---------------------------------------------------------------------

export function getAllSchedulesWithDetails(): ScheduleWithDetails[] {
  hydrateFromLocalStorage();

  return schedulesState.map((schedule) => {
    const workshop = workshopsState.find((w) => w.id === schedule.workshop_id);
    const professor = profilesState.find((p) => p.id === schedule.professor_id);
    const enrolled_count = enrollmentsState.filter(
      (e) => e.schedule_id === schedule.id && (e.status === 'enrolled' || e.status === 'completed')
    ).length;

    return {
      ...schedule,
      workshop,
      professor,
      enrolled_count,
    };
  });
}

export function createSchedule(data: {
  workshop_id: string;
  professor_id: string;
  day_time: string;
  slots: number;
  meeting_link?: string | null;
}): ScheduleWithDetails {
  hydrateFromLocalStorage();

  const workshop = workshopsState.find((w) => w.id === data.workshop_id);
  if (!workshop) {
    throw new Error(`Workshop "${data.workshop_id}" not found`);
  }

  const professor = profilesState.find((p) => p.id === data.professor_id && p.role === 'professor');
  if (!professor) {
    throw new Error(`Professor "${data.professor_id}" not found or does not have professor role`);
  }

  if (!data.day_time || data.day_time.trim().length === 0) {
    throw new Error('Schedule day and time cannot be empty');
  }

  const slotsNum = Number(data.slots);
  if (isNaN(slotsNum) || slotsNum < 1) {
    throw new Error('Slots quota must be at least 1');
  }

  const meetingLink = data.meeting_link && data.meeting_link.trim().length > 0
    ? data.meeting_link.trim()
    : 'https://meet.google.com/new';

  const newSchedule: Schedule = {
    id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    workshop_id: data.workshop_id,
    professor_id: data.professor_id,
    day_time: data.day_time.trim(),
    slots: slotsNum,
    meeting_link: meetingLink,
    created_at: new Date().toISOString(),
  };

  schedulesState.push(newSchedule);
  persistToLocalStorage();

  return {
    ...newSchedule,
    workshop,
    professor,
    enrolled_count: 0,
  };
}

export function updateSchedule(
  scheduleId: string,
  updates: Partial<Pick<Schedule, 'workshop_id' | 'professor_id' | 'day_time' | 'slots' | 'meeting_link'>>
): ScheduleWithDetails {
  hydrateFromLocalStorage();

  const index = schedulesState.findIndex((s) => s.id === scheduleId);
  if (index === -1) {
    throw new Error(`Schedule "${scheduleId}" not found`);
  }

  const existing = schedulesState[index];
  const updated: Schedule = {
    ...existing,
    ...updates,
    slots: updates.slots !== undefined ? Number(updates.slots) : existing.slots,
    day_time: updates.day_time !== undefined ? updates.day_time.trim() : existing.day_time,
  };

  if (updates.professor_id) {
    const prof = profilesState.find((p) => p.id === updates.professor_id && p.role === 'professor');
    if (!prof) {
      throw new Error(`Professor "${updates.professor_id}" not found or does not have professor role`);
    }
  }

  if (isNaN(updated.slots) || updated.slots < 1) {
    throw new Error('Slots quota must be at least 1');
  }

  schedulesState[index] = updated;
  persistToLocalStorage();

  const workshop = workshopsState.find((w) => w.id === updated.workshop_id);
  const professor = profilesState.find((p) => p.id === updated.professor_id);
  const enrolled_count = enrollmentsState.filter(
    (e) => e.schedule_id === updated.id && (e.status === 'enrolled' || e.status === 'completed')
  ).length;

  return {
    ...updated,
    workshop,
    professor,
    enrolled_count,
  };
}

// ---------------------------------------------------------------------
// USERS DIRECTORY MANAGEMENT
// ---------------------------------------------------------------------

export function getAllUsers(): Profile[] {
  hydrateFromLocalStorage();
  return [...profilesState];
}

export function updateUserRole(userId: string, newRole: UserRole): Profile {
  hydrateFromLocalStorage();

  const validRoles: UserRole[] = ['learner', 'professor', 'admin'];
  if (!validRoles.includes(newRole)) {
    throw new Error(`Invalid role "${newRole}". Allowed: ${validRoles.join(', ')}`);
  }

  const index = profilesState.findIndex((p) => p.id === userId);
  if (index === -1) {
    throw new Error(`User with ID "${userId}" not found`);
  }

  const updatedProfile: Profile = {
    ...profilesState[index],
    role: newRole,
    updated_at: new Date().toISOString(),
  };

  profilesState[index] = updatedProfile;
  persistToLocalStorage();
  return updatedProfile;
}

// ---------------------------------------------------------------------
// PAYMENT VERIFICATION WORKFLOW
// ---------------------------------------------------------------------

export function getAllPaymentsWithDetails(): PaymentWithDetails[] {
  hydrateFromLocalStorage();

  const schedulesWithDetails = getAllSchedulesWithDetails();

  return paymentsState.map((payment) => {
    const enrollment = enrollmentsState.find((e) => e.id === payment.enrollment_id);
    let enrollmentWithDetails: EnrollmentWithDetails | undefined = undefined;

    if (enrollment) {
      const schedule = schedulesWithDetails.find((s) => s.id === enrollment.schedule_id);
      const learner = profilesState.find((p) => p.id === enrollment.learner_id);
      enrollmentWithDetails = {
        ...enrollment,
        schedule,
        learner,
        payment,
      };
    }

    return {
      ...payment,
      enrollment: enrollmentWithDetails,
    };
  });
}

/**
 * Verifies a pending payment and automatically transitions the associated enrollment
 * status from 'pending' to 'enrolled'.
 */
export function verifyPayment(paymentId: string): {
  payment: Payment;
  enrollment: Enrollment;
} {
  hydrateFromLocalStorage();

  const payIndex = paymentsState.findIndex((p) => p.id === paymentId);
  if (payIndex === -1) {
    throw new Error(`Payment with ID "${paymentId}" not found`);
  }

  const payment = paymentsState[payIndex];
  if (payment.status === 'verified') {
    throw new Error(`Payment "${paymentId}" is already verified`);
  }

  const enrollIndex = enrollmentsState.findIndex((e) => e.id === payment.enrollment_id);
  if (enrollIndex === -1) {
    throw new Error(`Associated enrollment "${payment.enrollment_id}" not found`);
  }

  // Atomic state updates
  const updatedPayment: Payment = {
    ...payment,
    status: 'verified',
  };

  const updatedEnrollment: Enrollment = {
    ...enrollmentsState[enrollIndex],
    status: 'enrolled',
    updated_at: new Date().toISOString(),
  };

  paymentsState[payIndex] = updatedPayment;
  enrollmentsState[enrollIndex] = updatedEnrollment;

  persistToLocalStorage();

  return {
    payment: updatedPayment,
    enrollment: updatedEnrollment,
  };
}

// ---------------------------------------------------------------------
// KPI METRICS & FINANCIAL ANALYTICS
// ---------------------------------------------------------------------

export function getAdminKpis() {
  hydrateFromLocalStorage();

  const verifiedPayments = paymentsState.filter((p) => p.status === 'verified');
  const pendingPayments = paymentsState.filter((p) => p.status === 'pending');
  const totalRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Count enrolled / active learners (unique learners with active enrollments)
  const activeLearners = new Set(
    enrollmentsState
      .filter((e) => e.status === 'enrolled' || e.status === 'completed')
      .map((e) => e.learner_id)
  );

  return {
    totalRevenue,
    enrolledLearnersCount: activeLearners.size,
    activeSchedulesCount: schedulesState.length,
    pendingPaymentsCount: pendingPayments.length,
  };
}

export function getFinancialAnalytics() {
  hydrateFromLocalStorage();

  const verifiedPayments = paymentsState.filter((p) => p.status === 'verified');
  const pendingPayments = paymentsState.filter((p) => p.status === 'pending');

  const totalRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  // Breakdown by Level (Levels 1, 2, 3)
  const levelBreakdown = ([1, 2, 3] as WorkshopLevel[]).map((lvl) => {
    const workshopsInLevel = workshopsState.filter((w) => w.level === lvl);
    const workshopIds = workshopsInLevel.map((w) => w.id);
    const scheduleIds = schedulesState
      .filter((s) => workshopIds.includes(s.workshop_id))
      .map((s) => s.id);
    const levelEnrollments = enrollmentsState.filter((e) => scheduleIds.includes(e.schedule_id));
    const enrollmentIds = levelEnrollments.map((e) => e.id);

    const levelVerifiedPayments = verifiedPayments.filter((p) =>
      enrollmentIds.includes(p.enrollment_id)
    );
    const levelRevenue = levelVerifiedPayments.reduce((sum, p) => sum + p.amount, 0);

    const sampleWorkshop = workshopsInLevel[0];

    return {
      level: lvl,
      title: sampleWorkshop?.title || `FSL Level ${lvl}`,
      fee: sampleWorkshop?.fee || (lvl === 1 ? 1500 : lvl === 2 ? 2000 : 2500),
      enrolledCount: levelEnrollments.filter((e) => e.status === 'enrolled' || e.status === 'completed').length,
      verifiedTransactions: levelVerifiedPayments.length,
      revenue: levelRevenue,
    };
  });

  // Breakdown by Schedule & Assigned Professor
  const schedulesWithDetails = getAllSchedulesWithDetails();
  const scheduleBreakdown = schedulesWithDetails.map((schedule) => {
    const scheduleEnrollments = enrollmentsState.filter((e) => e.schedule_id === schedule.id);
    const scheduleEnrollmentIds = scheduleEnrollments.map((e) => e.id);
    const schedulePayments = verifiedPayments.filter((p) =>
      scheduleEnrollmentIds.includes(p.enrollment_id)
    );
    const scheduleRevenue = schedulePayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      scheduleId: schedule.id,
      workshopTitle: schedule.workshop?.title || 'Workshop Schedule',
      level: schedule.workshop?.level || 1,
      professorName: schedule.professor?.name || 'Unassigned Professor',
      dayTime: schedule.day_time,
      enrolledCount: scheduleEnrollments.filter(
        (e) => e.status === 'enrolled' || e.status === 'completed'
      ).length,
      verifiedRevenue: scheduleRevenue,
    };
  });

  const ledger = getAllPaymentsWithDetails();

  return {
    totalRevenue,
    pendingRevenue,
    totalVerifiedCount: verifiedPayments.length,
    totalPendingCount: pendingPayments.length,
    totalTransactions: paymentsState.length,
    levelBreakdown,
    scheduleBreakdown,
    ledger,
  };
}
