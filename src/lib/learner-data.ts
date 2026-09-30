// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Learner Operations Data Store & Business Logic
// File: src/lib/learner-data.ts
// =====================================================================

import type {
  Workshop,
  Schedule,
  Profile,
  Enrollment,
  Payment,
  Attendance,
  Assignment,
  Submission,
  Material,
  Video,
  Announcement,
  WorkshopLevel,
  VideoCategory,
  ScheduleWithDetails,
  EnrollmentWithDetails,
  SubmissionWithLearner,
} from '@/types/database';
import {
  mockWorkshops as initialWorkshops,
  mockProfiles as initialProfiles,
  mockSchedules as initialSchedules,
  mockEnrollments as initialEnrollments,
  mockPayments as initialPayments,
  mockAttendance as initialAttendance,
  mockAssignments as initialAssignments,
  mockSubmissions as initialSubmissions,
  mockMaterials as initialMaterials,
  mockVideos as initialVideos,
  mockAnnouncements as initialAnnouncements,
} from './mock-data';

export const GROUNDED_VIDEO_CATEGORIES: VideoCategory[] = [
  'Alphabet / Fingerspelling',
  'Basic Greetings',
  'Numbers',
  'Common Expressions',
  'Everyday Conversations',
  'Vocabulary Lessons',
];

const STORAGE_KEY = 'fsl_learner_store_v1';
const ADMIN_STORAGE_KEY = 'fsl_admin_store_v1';
const PROFESSOR_STORAGE_KEY = 'fsl_professor_store_v1';
const STORE_EVENT = 'fsl-learner-store-updated';

// In-memory working state
let workshopsState: Workshop[] = JSON.parse(JSON.stringify(initialWorkshops));
let schedulesState: Schedule[] = JSON.parse(JSON.stringify(initialSchedules));
let profilesState: Profile[] = JSON.parse(JSON.stringify(initialProfiles));
let enrollmentsState: Enrollment[] = JSON.parse(JSON.stringify(initialEnrollments));
let paymentsState: Payment[] = JSON.parse(JSON.stringify(initialPayments));
let attendanceState: Attendance[] = JSON.parse(JSON.stringify(initialAttendance));
let assignmentsState: Assignment[] = JSON.parse(JSON.stringify(initialAssignments));
let submissionsState: Submission[] = JSON.parse(JSON.stringify(initialSubmissions));
let materialsState: Material[] = JSON.parse(JSON.stringify(initialMaterials));
let videosState: Video[] = JSON.parse(JSON.stringify(initialVideos));
let announcementsState: Announcement[] = JSON.parse(JSON.stringify(initialAnnouncements));

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
      if (parsed.attendance) attendanceState = parsed.attendance;
      if (parsed.assignments) assignmentsState = parsed.assignments;
      if (parsed.submissions) submissionsState = parsed.submissions;
      if (parsed.materials) materialsState = parsed.materials;
      if (parsed.videos) videosState = parsed.videos;
      if (parsed.announcements) announcementsState = parsed.announcements;
    }

    // Cross-sync with admin store
    const adminRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (adminRaw) {
      const adminParsed = JSON.parse(adminRaw);
      if (adminParsed.workshops && Array.isArray(adminParsed.workshops)) {
        for (const w of adminParsed.workshops) {
          const idx = workshopsState.findIndex((item) => item.id === w.id);
          if (idx !== -1) workshopsState[idx] = { ...workshopsState[idx], ...w };
          else workshopsState.push(w);
        }
      }
      if (adminParsed.schedules && Array.isArray(adminParsed.schedules)) {
        for (const s of adminParsed.schedules) {
          const idx = schedulesState.findIndex((item) => item.id === s.id);
          if (idx !== -1) schedulesState[idx] = { ...schedulesState[idx], ...s };
          else schedulesState.push(s);
        }
      }
      if (adminParsed.enrollments && Array.isArray(adminParsed.enrollments)) {
        for (const e of adminParsed.enrollments) {
          const idx = enrollmentsState.findIndex((item) => item.id === e.id);
          if (idx !== -1) enrollmentsState[idx] = { ...enrollmentsState[idx], ...e };
          else enrollmentsState.push(e);
        }
      }
      if (adminParsed.payments && Array.isArray(adminParsed.payments)) {
        for (const p of adminParsed.payments) {
          const idx = paymentsState.findIndex((item) => item.id === p.id);
          if (idx !== -1) paymentsState[idx] = { ...paymentsState[idx], ...p };
          else paymentsState.push(p);
        }
      }
    }

    // Cross-sync with professor store
    const profRaw = localStorage.getItem(PROFESSOR_STORAGE_KEY);
    if (profRaw) {
      const profParsed = JSON.parse(profRaw);
      if (profParsed.schedules && Array.isArray(profParsed.schedules)) {
        for (const s of profParsed.schedules) {
          const idx = schedulesState.findIndex((item) => item.id === s.id);
          if (idx !== -1) schedulesState[idx] = { ...schedulesState[idx], ...s };
          else schedulesState.push(s);
        }
      }
      if (profParsed.attendance && Array.isArray(profParsed.attendance)) {
        for (const a of profParsed.attendance) {
          const idx = attendanceState.findIndex((item) => item.id === a.id);
          if (idx !== -1) attendanceState[idx] = { ...attendanceState[idx], ...a };
          else attendanceState.push(a);
        }
      }
      if (profParsed.assignments && Array.isArray(profParsed.assignments)) {
        for (const asg of profParsed.assignments) {
          const idx = assignmentsState.findIndex((item) => item.id === asg.id);
          if (idx !== -1) assignmentsState[idx] = { ...assignmentsState[idx], ...asg };
          else assignmentsState.push(asg);
        }
      }
      if (profParsed.submissions && Array.isArray(profParsed.submissions)) {
        for (const sub of profParsed.submissions) {
          const idx = submissionsState.findIndex((item) => item.id === sub.id);
          if (idx !== -1) submissionsState[idx] = { ...submissionsState[idx], ...sub };
          else submissionsState.push(sub);
        }
      }
      if (profParsed.materials && Array.isArray(profParsed.materials)) {
        for (const m of profParsed.materials) {
          const idx = materialsState.findIndex((item) => item.id === m.id);
          if (idx !== -1) materialsState[idx] = { ...materialsState[idx], ...m };
          else materialsState.push(m);
        }
      }
      if (profParsed.videos && Array.isArray(profParsed.videos)) {
        for (const v of profParsed.videos) {
          const idx = videosState.findIndex((item) => item.id === v.id);
          if (idx !== -1) videosState[idx] = { ...videosState[idx], ...v };
          else videosState.push(v);
        }
      }
      if (profParsed.announcements && Array.isArray(profParsed.announcements)) {
        for (const ann of profParsed.announcements) {
          const idx = announcementsState.findIndex((item) => item.id === ann.id);
          if (idx !== -1) announcementsState[idx] = { ...announcementsState[idx], ...ann };
          else announcementsState.push(ann);
        }
      }
    }
  } catch (err) {
    console.error('Failed to hydrate learner store:', err);
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
      attendance: attendanceState,
      assignments: assignmentsState,
      submissions: submissionsState,
      materials: materialsState,
      videos: videosState,
      announcements: announcementsState,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(STORE_EVENT));

    // Also sync to admin store
    try {
      const adminRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (adminRaw) {
        const adminParsed = JSON.parse(adminRaw);
        adminParsed.enrollments = enrollmentsState;
        adminParsed.payments = paymentsState;
        adminParsed.schedules = schedulesState;
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminParsed));
      }
    } catch {}

    // Also sync to professor store
    try {
      const profRaw = localStorage.getItem(PROFESSOR_STORAGE_KEY);
      if (profRaw) {
        const profParsed = JSON.parse(profRaw);
        profParsed.enrollments = enrollmentsState;
        profParsed.submissions = submissionsState;
        profParsed.schedules = schedulesState;
        localStorage.setItem(PROFESSOR_STORAGE_KEY, JSON.stringify(profParsed));
      }
    } catch {}
  } catch (err) {
    console.error('Failed to persist learner store:', err);
  }
}

/**
 * Resets the in-memory learner store to initial seed state.
 */
export function resetLearnerStore() {
  workshopsState = JSON.parse(JSON.stringify(initialWorkshops));
  schedulesState = JSON.parse(JSON.stringify(initialSchedules));
  profilesState = JSON.parse(JSON.stringify(initialProfiles));
  enrollmentsState = JSON.parse(JSON.stringify(initialEnrollments));
  paymentsState = JSON.parse(JSON.stringify(initialPayments));
  attendanceState = JSON.parse(JSON.stringify(initialAttendance));
  assignmentsState = JSON.parse(JSON.stringify(initialAssignments));
  submissionsState = JSON.parse(JSON.stringify(initialSubmissions));
  materialsState = JSON.parse(JSON.stringify(initialMaterials));
  videosState = JSON.parse(JSON.stringify(initialVideos));
  announcementsState = JSON.parse(JSON.stringify(initialAnnouncements));

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(STORE_EVENT));
    } catch {}
  }
}

/**
 * Subscribes to learner store change events in browser.
 */
export function subscribeToLearnerStore(callback: () => void): () => void {
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
// 1. WORKSHOP CATALOG & SIMULATED CHECKOUT (Feature 11)
// ---------------------------------------------------------------------

export interface CatalogScheduleItem extends Schedule {
  professor?: Profile;
  workshop?: Workshop;
  total_slots: number;
  enrolled_count: number;
  available_slots: number;
  user_enrollment?: Enrollment;
}

export interface CatalogWorkshopItem extends Workshop {
  schedules: CatalogScheduleItem[];
  user_enrollment_status?: 'enrolled' | 'pending' | 'completed' | 'none';
}

export function getAllWorkshops(): Workshop[] {
  hydrateFromLocalStorage();
  return [...workshopsState];
}

export function getWorkshopsByLevel(level: WorkshopLevel): Workshop[] {
  hydrateFromLocalStorage();
  return workshopsState.filter((w) => w.level === Number(level));
}

export function getWorkshopCatalog(learnerId?: string): CatalogWorkshopItem[] {
  hydrateFromLocalStorage();

  return workshopsState.map((workshop) => {
    const schedulesForWorkshop = schedulesState.filter((s) => s.workshop_id === workshop.id);

    const schedules: CatalogScheduleItem[] = schedulesForWorkshop.map((sched) => {
      const professor = profilesState.find((p) => p.id === sched.professor_id);
      const enrolled_count = enrollmentsState.filter(
        (e) => e.schedule_id === sched.id && (e.status === 'enrolled' || e.status === 'completed')
      ).length;

      // Available slots = max(0, sched.slots - enrolled_count) or direct slots
      const available_slots = Math.max(0, sched.slots - enrolled_count);

      let user_enrollment: Enrollment | undefined;
      if (learnerId) {
        user_enrollment = enrollmentsState.find(
          (e) => e.schedule_id === sched.id && e.learner_id === learnerId
        );
      }

      return {
        ...sched,
        professor,
        workshop,
        total_slots: sched.slots,
        enrolled_count,
        available_slots,
        user_enrollment,
      };
    });

    // Check if user has an overall enrollment in this workshop
    let user_enrollment_status: 'enrolled' | 'pending' | 'completed' | 'none' = 'none';
    if (learnerId) {
      const userEnrs = schedules.map((s) => s.user_enrollment).filter(Boolean) as Enrollment[];
      if (userEnrs.some((e) => e.status === 'enrolled')) {
        user_enrollment_status = 'enrolled';
      } else if (userEnrs.some((e) => e.status === 'completed')) {
        user_enrollment_status = 'completed';
      } else if (userEnrs.some((e) => e.status === 'pending')) {
        user_enrollment_status = 'pending';
      }
    }

    return {
      ...workshop,
      schedules,
      user_enrollment_status,
    };
  });
}

export function getUserEnrollments(learnerId?: string): EnrollmentWithDetails[] {
  hydrateFromLocalStorage();

  const enrollments = learnerId
    ? enrollmentsState.filter((e) => e.learner_id === learnerId)
    : enrollmentsState;

  return enrollments.map((enr) => {
    const schedule = schedulesState.find((s) => s.id === enr.schedule_id);
    const workshop = schedule ? workshopsState.find((w) => w.id === schedule.workshop_id) : undefined;
    const professor = schedule ? profilesState.find((p) => p.id === schedule.professor_id) : undefined;
    const learner = profilesState.find((p) => p.id === enr.learner_id);
    const payment = paymentsState.find((p) => p.enrollment_id === enr.id);

    const scheduleWithDetails: ScheduleWithDetails | undefined = schedule
      ? {
          ...schedule,
          workshop,
          professor,
        }
      : undefined;

    return {
      ...enr,
      schedule: scheduleWithDetails,
      learner,
      payment,
    };
  });
}

/**
 * Enrolls a learner into a schedule and creates an atomic simulated payment record.
 */
export function enrollInWorkshop(data: {
  learnerId: string;
  scheduleId: string;
  paymentMethod: string;
  referenceNo: string;
}): {
  enrollment: Enrollment;
  payment: Payment;
  schedule: Schedule;
} {
  hydrateFromLocalStorage();

  const { learnerId, scheduleId, paymentMethod, referenceNo } = data;

  if (!learnerId || learnerId.trim().length === 0) {
    throw new Error('Learner ID is required');
  }

  const scheduleIndex = schedulesState.findIndex((s) => s.id === scheduleId);
  if (scheduleIndex === -1) {
    throw new Error(`Schedule "${scheduleId}" not found`);
  }
  const schedule = schedulesState[scheduleIndex];

  const workshop = workshopsState.find((w) => w.id === schedule.workshop_id);
  if (!workshop) {
    throw new Error(`Associated workshop not found for schedule "${scheduleId}"`);
  }

  // Check if learner already has active or pending enrollment in this schedule
  const existingEnr = enrollmentsState.find(
    (e) =>
      e.learner_id === learnerId &&
      e.schedule_id === scheduleId &&
      (e.status === 'enrolled' || e.status === 'pending')
  );
  if (existingEnr) {
    throw new Error('Already enrolled or pending verification for this schedule');
  }

  // Calculate remaining slots
  const activeEnrolledCount = enrollmentsState.filter(
    (e) => e.schedule_id === scheduleId && (e.status === 'enrolled' || e.status === 'completed')
  ).length;

  if (schedule.slots - activeEnrolledCount <= 0 || schedule.slots <= 0) {
    throw new Error('No available slots remaining in this schedule');
  }

  const trimmedRef = (referenceNo || '').trim();
  if (trimmedRef.length === 0) {
    throw new Error('Payment reference number is required');
  }

  const trimmedMethod = (paymentMethod || 'GCash / Simulated Transfer').trim();

  // Create enrollment with 'pending' status
  const enrollmentId = `enr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newEnrollment: Enrollment = {
    id: enrollmentId,
    learner_id: learnerId,
    schedule_id: scheduleId,
    status: 'pending',
    created_at: now,
    updated_at: now,
  };

  // Create payment with 'pending' status
  const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newPayment: Payment = {
    id: paymentId,
    enrollment_id: enrollmentId,
    amount: workshop.fee,
    status: 'pending',
    date: now,
    reference_no: trimmedRef,
    payment_method: trimmedMethod,
    created_at: now,
  };

  // Decrement slots on schedule
  const updatedSchedule: Schedule = {
    ...schedule,
    slots: Math.max(0, schedule.slots - 1),
  };

  enrollmentsState.push(newEnrollment);
  paymentsState.push(newPayment);
  schedulesState[scheduleIndex] = updatedSchedule;

  persistToLocalStorage();

  return {
    enrollment: newEnrollment,
    payment: newPayment,
    schedule: updatedSchedule,
  };
}

// ---------------------------------------------------------------------
// 2. LEARNER CLASSES & COURSEWORK (Feature 12)
// ---------------------------------------------------------------------

export interface LearnerClassItem {
  enrollment: Enrollment;
  schedule: ScheduleWithDetails;
  workshop: Workshop;
  professor?: Profile;
  attendanceHistory: Attendance[];
  attendanceSummary: {
    present: number;
    absent: number;
    total: number;
    attendanceRate: number; // 0 - 100
  };
  announcementsCount: number;
}

export function getLearnerClasses(learnerId?: string): LearnerClassItem[] {
  hydrateFromLocalStorage();

  const targetLearnerId = learnerId || 'c0000000-0000-0000-0000-000000000001';

  // Find enrolled or completed classes
  const userEnrs = enrollmentsState.filter(
    (e) => e.learner_id === targetLearnerId && (e.status === 'enrolled' || e.status === 'completed')
  );

  return userEnrs.map((enr) => {
    const schedule = schedulesState.find((s) => s.id === enr.schedule_id) || schedulesState[0];
    const workshop = workshopsState.find((w) => w.id === schedule.workshop_id) || workshopsState[0];
    const professor = profilesState.find((p) => p.id === schedule.professor_id);
    const userAttendance = attendanceState.filter((a) => a.enrollment_id === enr.id);

    const presentCount = userAttendance.filter((a) => a.present).length;
    const absentCount = userAttendance.filter((a) => !a.present).length;
    const totalCount = userAttendance.length;
    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

    const announcementsCount = announcementsState.filter(
      (a) => a.schedule_id === schedule.id || a.schedule_id === null
    ).length;

    const scheduleWithDetails: ScheduleWithDetails = {
      ...schedule,
      workshop,
      professor,
    };

    return {
      enrollment: enr,
      schedule: scheduleWithDetails,
      workshop,
      professor,
      attendanceHistory: userAttendance,
      attendanceSummary: {
        present: presentCount,
        absent: absentCount,
        total: totalCount,
        attendanceRate,
      },
      announcementsCount,
    };
  });
}

export function getClassDetails(
  scheduleIdOrEnrollmentId: string,
  learnerId?: string
): {
  enrollment?: Enrollment;
  schedule: ScheduleWithDetails;
  workshop: Workshop;
  professor?: Profile;
  attendanceHistory: Attendance[];
  announcements: Announcement[];
  materials: Material[];
} | null {
  hydrateFromLocalStorage();

  // Try finding by enrollment ID first, or schedule ID
  let enrollment = enrollmentsState.find((e) => e.id === scheduleIdOrEnrollmentId);
  let scheduleId = enrollment ? enrollment.schedule_id : scheduleIdOrEnrollmentId;

  if (!enrollment && learnerId) {
    enrollment = enrollmentsState.find(
      (e) => e.schedule_id === scheduleId && e.learner_id === learnerId
    );
  }

  const schedule = schedulesState.find((s) => s.id === scheduleId);
  if (!schedule) return null;

  const workshop = workshopsState.find((w) => w.id === schedule.workshop_id) || workshopsState[0];
  const professor = profilesState.find((p) => p.id === schedule.professor_id);

  const attendanceHistory = enrollment
    ? attendanceState.filter((a) => a.enrollment_id === enrollment.id)
    : [];

  const announcements = announcementsState
    .filter((a) => a.schedule_id === schedule.id || a.schedule_id === null)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const materials = materialsState.filter((m) => m.schedule_id === schedule.id);

  const scheduleWithDetails: ScheduleWithDetails = {
    ...schedule,
    workshop,
    professor,
  };

  return {
    enrollment,
    schedule: scheduleWithDetails,
    workshop,
    professor,
    attendanceHistory,
    announcements,
    materials,
  };
}

export interface LearnerCourseworkItem {
  assignment: Assignment;
  schedule: ScheduleWithDetails;
  workshop: Workshop;
  professor?: Profile;
  submission?: Submission;
  status: 'pending' | 'submitted' | 'graded';
}

export function getLearnerCoursework(learnerId?: string): LearnerCourseworkItem[] {
  hydrateFromLocalStorage();

  const targetLearnerId = learnerId || 'c0000000-0000-0000-0000-000000000001';

  // Get schedules the learner is enrolled in or has submitted assignments for
  const userEnrs = enrollmentsState.filter(
    (e) => e.learner_id === targetLearnerId && (e.status === 'enrolled' || e.status === 'completed')
  );
  const enrolledScheduleIds = userEnrs.map((e) => e.schedule_id);

  // Also include schedules for which the learner already has submissions (e.g. from seed data)
  const userSubmissions = submissionsState.filter((s) => s.learner_id === targetLearnerId);
  const assignmentIdsWithSubmissions = userSubmissions.map((s) => s.assignment_id);

  const relevantAssignments = assignmentsState.filter(
    (asg) =>
      enrolledScheduleIds.includes(asg.schedule_id) ||
      assignmentIdsWithSubmissions.includes(asg.id)
  );

  return relevantAssignments.map((asg) => {
    const schedule = schedulesState.find((s) => s.id === asg.schedule_id) || schedulesState[0];
    const workshop = workshopsState.find((w) => w.id === schedule.workshop_id) || workshopsState[0];
    const professor = profilesState.find((p) => p.id === schedule.professor_id);
    const submission = userSubmissions.find((s) => s.assignment_id === asg.id);

    let status: 'pending' | 'submitted' | 'graded' = 'pending';
    if (submission) {
      status = submission.grade !== null && submission.grade !== undefined ? 'graded' : 'submitted';
    }

    const scheduleWithDetails: ScheduleWithDetails = {
      ...schedule,
      workshop,
      professor,
    };

    return {
      assignment: asg,
      schedule: scheduleWithDetails,
      workshop,
      professor,
      submission,
      status,
    };
  });
}

/**
 * Submits coursework (video URL or file link) for an assignment.
 */
export function submitAssignment(data: {
  assignmentId: string;
  learnerId: string;
  fileUrl: string;
  notes?: string;
}): Submission {
  hydrateFromLocalStorage();

  const { assignmentId, learnerId, fileUrl, notes } = data;

  const assignment = assignmentsState.find((a) => a.id === assignmentId);
  if (!assignment) {
    throw new Error(`Assignment "${assignmentId}" not found`);
  }

  const trimmedUrl = (fileUrl || '').trim();
  if (trimmedUrl.length === 0) {
    throw new Error('Video recording link or file attachment URL is required');
  }

  const existingIndex = submissionsState.findIndex(
    (s) => s.assignment_id === assignmentId && s.learner_id === learnerId
  );

  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    const existing = submissionsState[existingIndex];
    const updated: Submission = {
      ...existing,
      file_url: trimmedUrl,
      submitted_at: now,
      // If student re-submits before graded, keep grade null
      grade: existing.grade,
      feedback: existing.feedback,
    };
    submissionsState[existingIndex] = updated;
    persistToLocalStorage();
    return updated;
  }

  const newSub: Submission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    assignment_id: assignmentId,
    learner_id: learnerId,
    file_url: trimmedUrl,
    grade: null,
    feedback: notes ? `Learner notes: ${notes.trim()}` : null,
    submitted_at: now,
    graded_at: null,
  };

  submissionsState.unshift(newSub);
  persistToLocalStorage();
  return newSub;
}

// ---------------------------------------------------------------------
// 3. LEARNING MATERIALS & FSL VIDEO HUB (Feature 13)
// ---------------------------------------------------------------------

export function getLearnerMaterials(learnerId?: string): (Material & { schedule?: ScheduleWithDetails })[] {
  hydrateFromLocalStorage();

  return materialsState.map((m) => {
    const schedule = schedulesState.find((s) => s.id === m.schedule_id);
    const workshop = schedule ? workshopsState.find((w) => w.id === schedule.workshop_id) : undefined;
    const professor = schedule ? profilesState.find((p) => p.id === schedule.professor_id) : undefined;

    const scheduleWithDetails: ScheduleWithDetails | undefined = schedule
      ? {
          ...schedule,
          workshop,
          professor,
        }
      : undefined;

    return {
      ...m,
      schedule: scheduleWithDetails,
    };
  });
}

export function getFSLVideos(filter?: {
  level?: WorkshopLevel | 'all';
  category?: VideoCategory | 'all';
}): Video[] {
  hydrateFromLocalStorage();

  return videosState.filter((v) => {
    if (filter?.level && filter.level !== 'all' && v.level !== Number(filter.level)) {
      return false;
    }
    if (filter?.category && filter.category !== 'all' && v.category !== filter.category) {
      return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------
// 4. LEARNER PROGRESSION TRACKER & ACADEMIC PATHWAYS (Feature 14)
// ---------------------------------------------------------------------

export interface PathwayItem {
  id: string;
  name: string;
  institution: string;
  description: string;
  requirements: string[];
  eligible: boolean;
  linkText: string;
}

export interface LevelProgressionItem {
  level: WorkshopLevel;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  prerequisite: string | null;
  status: 'completed' | 'in_progress' | 'available' | 'locked';
  certificateReady: boolean;
  completionDate?: string;
  gradeAverage?: number;
}

export interface LearnerProgressionData {
  learnerId: string;
  completedLevels: number[];
  currentLevel: number;
  nextLevel: number | null;
  overallPercentage: number;
  isGraduated: boolean;
  levels: LevelProgressionItem[];
  pathways: PathwayItem[];
}

export function getLearnerProgression(learnerId?: string): LearnerProgressionData {
  hydrateFromLocalStorage();

  const targetLearnerId = learnerId || 'c0000000-0000-0000-0000-000000000001';

  const userEnrollments = enrollmentsState.filter((e) => e.learner_id === targetLearnerId);

  // Completed levels from 'completed' status enrollments
  const completedSchedules = userEnrollments
    .filter((e) => e.status === 'completed')
    .map((e) => schedulesState.find((s) => s.id === e.schedule_id))
    .filter(Boolean) as Schedule[];

  const completedWorkshopIds = completedSchedules.map((s) => s.workshop_id);
  const completedWorkshops = workshopsState.filter((w) => completedWorkshopIds.includes(w.id));
  const completedLevels = Array.from(new Set(completedWorkshops.map((w) => w.level))).sort();

  // Active / in-progress enrollments
  const inProgressSchedules = userEnrollments
    .filter((e) => e.status === 'enrolled')
    .map((e) => schedulesState.find((s) => s.id === e.schedule_id))
    .filter(Boolean) as Schedule[];
  const inProgressWorkshopIds = inProgressSchedules.map((s) => s.workshop_id);
  const inProgressLevels = Array.from(
    new Set(workshopsState.filter((w) => inProgressWorkshopIds.includes(w.id)).map((w) => w.level))
  );

  const currentLevel = completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
  const nextLevel = currentLevel < 3 ? currentLevel + 1 : null;

  // Percentage calculation: 33.3% per level completed
  const overallPercentage = Math.min(100, Math.round((completedLevels.length / 3) * 100));

  const isGraduated = completedLevels.includes(3);

  // Level status calculation with prerequisite gating
  const levels: LevelProgressionItem[] = [
    {
      level: 1,
      code: 'FSL 101',
      title: 'Level 1: Foundations & Visual Gestural Communication',
      subtitle: 'Introduction to FSL & Deaf Culture (Foundational)',
      description:
        'Comprehensive introduction to Deaf culture, visual-gestural communication, the FSL manual alphabet, number systems, survival vocabulary, and conversational etiquette.',
      prerequisite: null,
      status: completedLevels.includes(1)
        ? 'completed'
        : inProgressLevels.includes(1)
        ? 'in_progress'
        : 'available',
      certificateReady: completedLevels.includes(1),
      completionDate: completedLevels.includes(1) ? '2025-08-30' : undefined,
      gradeAverage: completedLevels.includes(1) ? 95 : undefined,
    },
    {
      level: 2,
      code: 'FSL 102',
      title: 'Level 2: Grammar, Classifiers & Discourse',
      subtitle: 'Intermediate FSL & Conversational Fluency',
      description:
        'Deep dive into spatial grammar, non-manual signals (facial expressions), descriptive and locative classifiers, role-shifting, and everyday conversational exchanges.',
      prerequisite: 'Completion of FSL Level 1',
      status: completedLevels.includes(2)
        ? 'completed'
        : inProgressLevels.includes(2)
        ? 'in_progress'
        : completedLevels.includes(1)
        ? 'available'
        : 'locked',
      certificateReady: completedLevels.includes(2),
      completionDate: completedLevels.includes(2) ? '2026-06-25' : undefined,
      gradeAverage: completedLevels.includes(2) ? 92 : undefined,
    },
    {
      level: 3,
      code: 'FSL 103',
      title: 'Level 3: Advanced Fluency & Cultural Immersion',
      subtitle: 'Advanced FSL Structure, Discourse & Immersion',
      description:
        'Advanced conversational mastery, complex storytelling, idiomatic FSL expressions, community register variation, and preparatory readiness for BSLI and professional interpreting.',
      prerequisite: 'Completion of FSL Level 2',
      status: completedLevels.includes(3)
        ? 'completed'
        : inProgressLevels.includes(3)
        ? 'in_progress'
        : completedLevels.includes(2)
        ? 'available'
        : 'locked',
      certificateReady: completedLevels.includes(3),
      completionDate: completedLevels.includes(3) ? '2026-09-20' : undefined,
      gradeAverage: completedLevels.includes(3) ? 94 : undefined,
    },
  ];

  // Academic and Career Pathways
  const pathways: PathwayItem[] = [
    {
      id: 'pathway-bsli',
      name: 'BSLI (Bachelor in Sign Language Interpretation)',
      institution: 'De La Salle-College of Saint Benilde (SDEAS)',
      description:
        'A comprehensive 4-year professional collegiate degree program preparing certified Filipino Sign Language interpreters for educational, legal, healthcare, media, and community interpreting settings.',
      requirements: [
        'Completion of FSL Level 2 or Level 3 proficiency',
        'Senior High School graduate or collegiate transferee',
        'Interview and signing fluency assessment by SDEAS faculty',
        'Passing mark in Benilde Entrance Examination (BEE)',
      ],
      eligible: completedLevels.includes(2) || completedLevels.includes(3),
      linkText: 'Inquire with SDEAS Admissions',
    },
    {
      id: 'pathway-ads',
      name: 'Applied Deaf Studies',
      institution: 'School of Deaf Education and Applied Studies (SDEAS)',
      description:
        'Specialized undergraduate degree and diploma pathways designed for Deaf and hearing advocates focused on Deaf leadership, visual communications, multimedia arts, and community development.',
      requirements: [
        'Completion of FSL Level 2 or Level 3 proficiency',
        'Demonstrated commitment to Deaf advocacy and bilingual education',
        'Portfolio presentation or interview assessment',
      ],
      eligible: completedLevels.includes(2) || completedLevels.includes(3),
      linkText: 'Explore Degree Tracks',
    },
    {
      id: 'pathway-immersion',
      name: 'SDEAS Deaf Community Immersion & Practicum',
      institution: 'Benilde SDEAS & Deaf Partner Organizations',
      description:
        'Structured community immersion and apprentice interpreting practicum under the guidance of native Deaf teachers and certified FSL interpreters.',
      requirements: [
        'Active enrollment or completion of any FSL Level (Levels 1-3)',
        'Signed Code of Ethics and Cultural Respect Agreement',
      ],
      eligible: true, // open to all learners
      linkText: 'View Upcoming Cohorts',
    },
  ];

  return {
    learnerId: targetLearnerId,
    completedLevels,
    currentLevel,
    nextLevel,
    overallPercentage,
    isGraduated,
    levels,
    pathways,
  };
}
