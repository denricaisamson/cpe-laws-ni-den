// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Professor Operations Data Store & Business Logic
// File: src/lib/professor-data.ts
// =====================================================================

import type {
  Workshop,
  Schedule,
  Profile,
  Enrollment,
  Attendance,
  Assignment,
  Submission,
  Material,
  Video,
  Announcement,
  WorkshopLevel,
  VideoCategory,
  ScheduleWithDetails,
} from '@/types/database';
import {
  mockWorkshops as initialWorkshops,
  mockProfiles as initialProfiles,
  mockSchedules as initialSchedules,
  mockEnrollments as initialEnrollments,
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

const STORAGE_KEY = 'fsl_professor_store_v1';
const ADMIN_STORAGE_KEY = 'fsl_admin_store_v1';
const STORE_EVENT = 'fsl-professor-store-updated';

// In-memory working state
let workshopsState: Workshop[] = JSON.parse(JSON.stringify(initialWorkshops));
let schedulesState: Schedule[] = JSON.parse(JSON.stringify(initialSchedules));
let profilesState: Profile[] = JSON.parse(JSON.stringify(initialProfiles));
let enrollmentsState: Enrollment[] = JSON.parse(JSON.stringify(initialEnrollments));
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
      if (parsed.attendance) attendanceState = parsed.attendance;
      if (parsed.assignments) assignmentsState = parsed.assignments;
      if (parsed.submissions) submissionsState = parsed.submissions;
      if (parsed.materials) materialsState = parsed.materials;
      if (parsed.videos) videosState = parsed.videos;
      if (parsed.announcements) announcementsState = parsed.announcements;
    }

    // Also sync schedules & enrollments from admin store if available
    const adminRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (adminRaw) {
      const adminParsed = JSON.parse(adminRaw);
      if (adminParsed.schedules && Array.isArray(adminParsed.schedules)) {
        for (const adminSched of adminParsed.schedules) {
          const idx = schedulesState.findIndex((s) => s.id === adminSched.id);
          if (idx !== -1) {
            schedulesState[idx] = { ...schedulesState[idx], ...adminSched };
          } else {
            schedulesState.push(adminSched);
          }
        }
      }
      if (adminParsed.enrollments && Array.isArray(adminParsed.enrollments)) {
        for (const adminEnr of adminParsed.enrollments) {
          const idx = enrollmentsState.findIndex((e) => e.id === adminEnr.id);
          if (idx !== -1) {
            enrollmentsState[idx] = { ...enrollmentsState[idx], ...adminEnr };
          } else {
            enrollmentsState.push(adminEnr);
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to hydrate professor store from localStorage:', err);
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
      attendance: attendanceState,
      assignments: assignmentsState,
      submissions: submissionsState,
      materials: materialsState,
      videos: videosState,
      announcements: announcementsState,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(STORE_EVENT));
  } catch (err) {
    console.error('Failed to persist professor store to localStorage:', err);
  }
}

/**
 * Resets the in-memory professor store to original seed data.
 */
export function resetProfessorStore() {
  workshopsState = JSON.parse(JSON.stringify(initialWorkshops));
  schedulesState = JSON.parse(JSON.stringify(initialSchedules));
  profilesState = JSON.parse(JSON.stringify(initialProfiles));
  enrollmentsState = JSON.parse(JSON.stringify(initialEnrollments));
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
 * Subscribes to professor store change notifications in the browser.
 */
export function subscribeToProfessorStore(callback: () => void): () => void {
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
// SCHEDULES & MEETING LINK MANAGEMENT
// ---------------------------------------------------------------------

/**
 * Normalize professor ID matching both seed UUIDs and short test aliases.
 */
function isMatchingProfessor(candidateId: string, targetProfId?: string): boolean {
  if (!targetProfId || targetProfId === 'all') return true;

  if (candidateId === targetProfId) return true;

  // Rommel Agravante alias
  if (
    (targetProfId === 'prof-1' && candidateId === 'b0000000-0000-0000-0000-000000000001') ||
    (targetProfId === 'b0000000-0000-0000-0000-000000000001' && candidateId === 'prof-1')
  ) {
    return true;
  }

  // Liza Flores alias
  if (
    (targetProfId === 'prof-2' && candidateId === 'b0000000-0000-0000-0000-000000000002') ||
    (targetProfId === 'b0000000-0000-0000-0000-000000000002' && candidateId === 'prof-2')
  ) {
    return true;
  }

  return false;
}

export function getProfessorSchedules(professorId?: string): ScheduleWithDetails[] {
  hydrateFromLocalStorage();

  const filtered = schedulesState.filter((s) => isMatchingProfessor(s.professor_id, professorId));

  return filtered.map((schedule) => {
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

export function getScheduleById(scheduleId: string): ScheduleWithDetails | null {
  hydrateFromLocalStorage();

  const schedule = schedulesState.find((s) => s.id === scheduleId);
  if (!schedule) return null;

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
}

export function updateMeetingLink(
  scheduleId: string,
  meetingLink: string,
  professorId?: string
): ScheduleWithDetails {
  hydrateFromLocalStorage();

  const index = schedulesState.findIndex((s) => s.id === scheduleId);
  if (index === -1) {
    throw new Error(`Schedule "${scheduleId}" not found`);
  }

  const existing = schedulesState[index];

  if (professorId && !isMatchingProfessor(existing.professor_id, professorId)) {
    // Check if professorId is an admin
    const actor = profilesState.find((p) => p.id === professorId);
    if (!actor || actor.role !== 'admin') {
      throw new Error('Authorization error: only the assigned professor or admin can update meeting link');
    }
  }

  const trimmedLink = (meetingLink || '').trim();
  if (trimmedLink.length === 0) {
    throw new Error('Meeting link cannot be empty');
  }

  const updated: Schedule = {
    ...existing,
    meeting_link: trimmedLink,
  };

  schedulesState[index] = updated;
  persistToLocalStorage();

  // Also sync to admin store if in browser
  if (typeof window !== 'undefined') {
    try {
      const adminRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (adminRaw) {
        const adminParsed = JSON.parse(adminRaw);
        if (adminParsed.schedules && Array.isArray(adminParsed.schedules)) {
          const sIdx = adminParsed.schedules.findIndex((s: Schedule) => s.id === scheduleId);
          if (sIdx !== -1) {
            adminParsed.schedules[sIdx].meeting_link = trimmedLink;
            localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminParsed));
          }
        }
      }
    } catch {}
  }

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
// CLASSROOM ROSTER & ATTENDANCE TRACKING
// ---------------------------------------------------------------------

export interface RosterStudent {
  enrollmentId: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  avatarUrl: string | null;
  status: string;
  attendanceHistory: Attendance[];
}

export function getClassRoster(scheduleId: string): RosterStudent[] {
  hydrateFromLocalStorage();

  const activeEnrollments = enrollmentsState.filter(
    (e) => e.schedule_id === scheduleId && (e.status === 'enrolled' || e.status === 'completed')
  );

  return activeEnrollments.map((enr) => {
    const learner = profilesState.find((p) => p.id === enr.learner_id);
    const learnerAttendance = attendanceState.filter((a) => a.enrollment_id === enr.id);

    return {
      enrollmentId: enr.id,
      learnerId: enr.learner_id,
      learnerName: learner?.name || 'Enrolled Student',
      learnerEmail: learner?.email || '',
      avatarUrl: learner?.avatar_url || null,
      status: enr.status,
      attendanceHistory: learnerAttendance,
    };
  });
}

export function getAttendanceForDate(
  scheduleId: string,
  date: string
): {
  enrollmentId: string;
  learnerName: string;
  learnerEmail: string;
  present: boolean;
  remarks: string;
  recordId?: string;
}[] {
  hydrateFromLocalStorage();

  const roster = getClassRoster(scheduleId);

  return roster.map((student) => {
    const record = attendanceState.find(
      (a) => a.enrollment_id === student.enrollmentId && a.date === date
    );

    return {
      enrollmentId: student.enrollmentId,
      learnerName: student.learnerName,
      learnerEmail: student.learnerEmail,
      present: record ? record.present : false,
      remarks: record?.remarks || '',
      recordId: record?.id,
    };
  });
}

export function saveAttendanceRecords(
  scheduleId: string,
  date: string,
  records: { enrollmentId: string; present: boolean; remarks?: string }[],
  professorId?: string
): Attendance[] {
  hydrateFromLocalStorage();

  const schedule = schedulesState.find((s) => s.id === scheduleId);
  if (!schedule) {
    throw new Error(`Schedule "${scheduleId}" not found`);
  }

  if (professorId && !isMatchingProfessor(schedule.professor_id, professorId)) {
    const actor = profilesState.find((p) => p.id === professorId);
    if (!actor || actor.role !== 'admin') {
      throw new Error('Authorization error: only assigned professor or admin can record attendance');
    }
  }

  if (!date || date.trim().length === 0) {
    throw new Error('Attendance session date is required');
  }

  const updatedRecords: Attendance[] = [];

  for (const item of records) {
    const enrollment = enrollmentsState.find((e) => e.id === item.enrollmentId);
    if (!enrollment || enrollment.schedule_id !== scheduleId) {
      throw new Error(`Attendance error: enrollment "${item.enrollmentId}" does not belong to this schedule`);
    }

    const existingIndex = attendanceState.findIndex(
      (a) => a.enrollment_id === item.enrollmentId && a.date === date
    );

    if (existingIndex !== -1) {
      const updated: Attendance = {
        ...attendanceState[existingIndex],
        present: Boolean(item.present),
        remarks: item.remarks ? item.remarks.trim() : null,
      };
      attendanceState[existingIndex] = updated;
      updatedRecords.push(updated);
    } else {
      const created: Attendance = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        enrollment_id: item.enrollmentId,
        date: date.trim(),
        present: Boolean(item.present),
        remarks: item.remarks ? item.remarks.trim() : null,
        created_at: new Date().toISOString(),
      };
      attendanceState.push(created);
      updatedRecords.push(created);
    }
  }

  persistToLocalStorage();
  return updatedRecords;
}

// ---------------------------------------------------------------------
// ASSIGNMENT MANAGEMENT & SUBMISSIONS GRADING
// ---------------------------------------------------------------------

export interface AssignmentWithFullDetails extends Assignment {
  schedule?: ScheduleWithDetails;
  submissionsCount: number;
  gradedCount: number;
  pendingCount: number;
  submissions: (Submission & { learner?: Profile })[];
}

export function getAssignmentsForSchedule(scheduleId: string): AssignmentWithFullDetails[] {
  hydrateFromLocalStorage();

  const assignments = assignmentsState.filter((a) => a.schedule_id === scheduleId);
  const schedule = getScheduleById(scheduleId) || undefined;

  return assignments.map((asg) => {
    const subs = submissionsState
      .filter((s) => s.assignment_id === asg.id)
      .map((s) => ({
        ...s,
        learner: profilesState.find((p) => p.id === s.learner_id),
      }));

    const graded = subs.filter((s) => s.grade !== null).length;

    return {
      ...asg,
      schedule,
      submissionsCount: subs.length,
      gradedCount: graded,
      pendingCount: subs.length - graded,
      submissions: subs,
    };
  });
}

export function getAllAssignments(professorId?: string): AssignmentWithFullDetails[] {
  hydrateFromLocalStorage();

  const assignedSchedules = getProfessorSchedules(professorId);
  const scheduleIds = assignedSchedules.map((s) => s.id);

  const assignments = assignmentsState.filter((a) => scheduleIds.includes(a.schedule_id));

  return assignments.map((asg) => {
    const schedule = assignedSchedules.find((s) => s.id === asg.schedule_id);
    const subs = submissionsState
      .filter((s) => s.assignment_id === asg.id)
      .map((s) => ({
        ...s,
        learner: profilesState.find((p) => p.id === s.learner_id),
      }));

    const graded = subs.filter((s) => s.grade !== null).length;

    return {
      ...asg,
      schedule,
      submissionsCount: subs.length,
      gradedCount: graded,
      pendingCount: subs.length - graded,
      submissions: subs,
    };
  });
}

export function createAssignment(
  data: {
    scheduleId: string;
    title: string;
    description: string;
    dueDate: string;
  },
  professorId?: string
): Assignment {
  hydrateFromLocalStorage();

  const schedule = schedulesState.find((s) => s.id === data.scheduleId);
  if (!schedule) {
    throw new Error(`Schedule "${data.scheduleId}" not found`);
  }

  if (professorId && !isMatchingProfessor(schedule.professor_id, professorId)) {
    const actor = profilesState.find((p) => p.id === professorId);
    if (!actor || actor.role !== 'admin') {
      throw new Error('Authorization error: only assigned professor or admin can create assignments');
    }
  }

  if (!data.title || data.title.trim().length === 0) {
    throw new Error('Assignment title cannot be empty');
  }

  if (!data.dueDate || data.dueDate.trim().length === 0) {
    throw new Error('Assignment due date is required');
  }

  const newAssignment: Assignment = {
    id: `asg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    schedule_id: data.scheduleId,
    title: data.title.trim(),
    description: (data.description || '').trim(),
    due_date: new Date(data.dueDate).toISOString(),
    created_at: new Date().toISOString(),
  };

  assignmentsState.unshift(newAssignment);
  persistToLocalStorage();
  return newAssignment;
}

export function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string,
  professorId?: string
): Submission & { learner?: Profile } {
  hydrateFromLocalStorage();

  const subIndex = submissionsState.findIndex((s) => s.id === submissionId);
  if (subIndex === -1) {
    throw new Error(`Submission "${submissionId}" not found`);
  }

  const existingSub = submissionsState[subIndex];
  const assignment = assignmentsState.find((a) => a.id === existingSub.assignment_id);
  if (!assignment) {
    throw new Error('Associated assignment not found');
  }

  const schedule = schedulesState.find((s) => s.id === assignment.schedule_id);

  if (professorId && schedule && !isMatchingProfessor(schedule.professor_id, professorId)) {
    const actor = profilesState.find((p) => p.id === professorId);
    if (!actor || actor.role !== 'admin') {
      throw new Error('Authorization error: only assigned professor or admin can grade this submission');
    }
  }

  const numGrade = Number(grade);
  if (isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
    throw new Error('Grade must be a number between 0 and 100');
  }

  const updatedSub: Submission = {
    ...existingSub,
    grade: numGrade,
    feedback: (feedback || '').trim(),
    graded_at: new Date().toISOString(),
  };

  submissionsState[subIndex] = updatedSub;
  persistToLocalStorage();

  const learner = profilesState.find((p) => p.id === updatedSub.learner_id);

  return {
    ...updatedSub,
    learner,
  };
}

// ---------------------------------------------------------------------
// LEARNING MATERIALS & HANDOUTS
// ---------------------------------------------------------------------

export function getMaterialsForSchedule(scheduleId: string): Material[] {
  hydrateFromLocalStorage();
  return materialsState.filter((m) => m.schedule_id === scheduleId);
}

export function getAllMaterials(professorId?: string): (Material & { schedule?: ScheduleWithDetails })[] {
  hydrateFromLocalStorage();

  const assignedSchedules = getProfessorSchedules(professorId);
  const scheduleIds = assignedSchedules.map((s) => s.id);

  const materials = materialsState.filter((m) => scheduleIds.includes(m.schedule_id));

  return materials.map((m) => {
    const schedule = assignedSchedules.find((s) => s.id === m.schedule_id);
    return {
      ...m,
      schedule,
    };
  });
}

export function createMaterial(
  data: {
    scheduleId: string;
    title: string;
    fileUrl: string;
    description?: string;
  },
  professorId?: string
): Material {
  hydrateFromLocalStorage();

  const schedule = schedulesState.find((s) => s.id === data.scheduleId);
  if (!schedule) {
    throw new Error(`Schedule "${data.scheduleId}" not found`);
  }

  if (professorId && !isMatchingProfessor(schedule.professor_id, professorId)) {
    const actor = profilesState.find((p) => p.id === professorId);
    if (!actor || actor.role !== 'admin') {
      throw new Error('Authorization error: only assigned professor or admin can upload materials');
    }
  }

  if (!data.title || data.title.trim().length === 0) {
    throw new Error('Material title cannot be empty');
  }

  if (!data.fileUrl || data.fileUrl.trim().length === 0) {
    throw new Error('Material file URL cannot be empty');
  }

  const newMaterial: Material = {
    id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    schedule_id: data.scheduleId,
    title: data.title.trim(),
    file_url: data.fileUrl.trim(),
    description: (data.description || '').trim() || null,
    created_at: new Date().toISOString(),
  };

  materialsState.unshift(newMaterial);
  persistToLocalStorage();
  return newMaterial;
}

// ---------------------------------------------------------------------
// FSL TUTORIAL VIDEO PUBLISHING
// ---------------------------------------------------------------------

export function getAllVideos(): Video[] {
  hydrateFromLocalStorage();
  return [...videosState];
}

export function getVideosByLevel(level: WorkshopLevel): Video[] {
  hydrateFromLocalStorage();
  return videosState.filter((v) => v.level === Number(level));
}

export function getVideosByCategory(category: VideoCategory): Video[] {
  hydrateFromLocalStorage();
  return videosState.filter((v) => v.category === category);
}

export function createVideo(
  data: {
    level: WorkshopLevel;
    title: string;
    category: VideoCategory;
    videoUrl: string;
    description?: string;
    uploadedBy?: string;
  },
  actorId?: string
): Video {
  hydrateFromLocalStorage();

  const levelNum = Number(data.level) as WorkshopLevel;
  if (![1, 2, 3].includes(levelNum)) {
    throw new Error(`Invalid video level "${data.level}". Allowed: 1, 2, 3`);
  }

  if (!GROUNDED_VIDEO_CATEGORIES.includes(data.category)) {
    throw new Error(
      `Invalid video category "${data.category}". Allowed: ${GROUNDED_VIDEO_CATEGORIES.join(', ')}`
    );
  }

  if (!data.title || data.title.trim().length === 0) {
    throw new Error('Video title cannot be empty');
  }

  if (!data.videoUrl || data.videoUrl.trim().length === 0) {
    throw new Error('Video URL cannot be empty');
  }

  const newVideo: Video = {
    id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    level: levelNum,
    title: data.title.trim(),
    category: data.category,
    video_url: data.videoUrl.trim(),
    description: (data.description || '').trim() || null,
    uploaded_by: actorId || data.uploadedBy || null,
    created_at: new Date().toISOString(),
  };

  videosState.unshift(newVideo);
  persistToLocalStorage();
  return newVideo;
}

// ---------------------------------------------------------------------
// CLASS ANNOUNCEMENTS
// ---------------------------------------------------------------------

export function getAnnouncementsForProfessor(
  professorId?: string
): (Announcement & { schedule?: ScheduleWithDetails; author?: Profile })[] {
  hydrateFromLocalStorage();

  const assignedSchedules = getProfessorSchedules(professorId);
  const scheduleIds = assignedSchedules.map((s) => s.id);

  // Return announcements authored by this professor OR associated with their schedules
  const list = announcementsState.filter(
    (a) =>
      (a.schedule_id && scheduleIds.includes(a.schedule_id)) ||
      isMatchingProfessor(a.author_id, professorId)
  );

  return list.map((ann) => {
    const schedule = ann.schedule_id ? getScheduleById(ann.schedule_id) || undefined : undefined;
    const author = profilesState.find((p) => p.id === ann.author_id);
    return {
      ...ann,
      schedule,
      author,
    };
  });
}

export function createAnnouncement(
  data: {
    authorId: string;
    scheduleId?: string | null;
    title: string;
    body: string;
  }
): Announcement {
  hydrateFromLocalStorage();

  if (!data.title || data.title.trim().length === 0) {
    throw new Error('Announcement title cannot be empty');
  }

  if (!data.body || data.body.trim().length === 0) {
    throw new Error('Announcement body cannot be empty');
  }

  if (data.scheduleId) {
    const schedule = schedulesState.find((s) => s.id === data.scheduleId);
    if (!schedule) {
      throw new Error(`Schedule "${data.scheduleId}" not found`);
    }
  }

  const newAnnouncement: Announcement = {
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    author_id: data.authorId,
    schedule_id: data.scheduleId || null,
    title: data.title.trim(),
    body: data.body.trim(),
    created_at: new Date().toISOString(),
  };

  announcementsState.unshift(newAnnouncement);
  persistToLocalStorage();
  return newAnnouncement;
}

// ---------------------------------------------------------------------
// PROFESSOR KPI METRICS
// ---------------------------------------------------------------------

export function getProfessorKpis(professorId?: string) {
  hydrateFromLocalStorage();

  const assignedSchedules = getProfessorSchedules(professorId);
  const scheduleIds = assignedSchedules.map((s) => s.id);

  const enrolledStudents = enrollmentsState.filter(
    (e) => scheduleIds.includes(e.schedule_id) && (e.status === 'enrolled' || e.status === 'completed')
  );

  const assignments = assignmentsState.filter((a) => scheduleIds.includes(a.schedule_id));
  const assignmentIds = assignments.map((a) => a.id);

  const pendingSubmissions = submissionsState.filter(
    (s) => assignmentIds.includes(s.assignment_id) && s.grade === null
  );

  return {
    assignedSectionsCount: assignedSchedules.length,
    totalEnrolledStudents: enrolledStudents.length,
    pendingSubmissionsCount: pendingSubmissions.length,
    upcomingSessionsCount: assignedSchedules.length,
  };
}
