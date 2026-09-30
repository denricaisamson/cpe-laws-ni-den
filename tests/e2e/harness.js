/**
 * Filipino Sign Language (FSL) Workshop System — E2E Test Harness
 * 
 * Provides an authoritative in-memory simulation engine for the 14 Supabase tables,
 * grounded seed dataset, role authorization policies, status state machines,
 * and accessibility validation utilities.
 * 
 * Sources:
 * - ORIGINAL_REQUEST.md (14 tables, 3 roles, simulated payments, financial reports)
 * - FSL_SPEC.md (Grounded video categories, SDEAS news, progression pathways, merchandise)
 * - PROJECT.md (Architecture, contracts, and feature inventory)
 */

import assert from 'node:assert/strict';

// Allowed grounded enums
export const ROLES = ['learner', 'professor', 'admin'];
export const WORKSHOP_LEVELS = [1, 2, 3];
export const ENROLLMENT_STATUSES = ['pending', 'enrolled', 'completed', 'dropped'];
export const PAYMENT_STATUSES = ['pending', 'verified'];
export const VIDEO_CATEGORIES = [
  'Alphabet / Fingerspelling',
  'Basic Greetings',
  'Numbers',
  'Common Expressions',
  'Everyday Conversations',
  'Vocabulary Lessons',
];
export const NEWS_TYPES = ['sdeas_news', 'deaf_festival', 'event', 'seminar'];

/**
 * Creates fresh, isolated seed data matching FSL_SPEC.md and ORIGINAL_REQUEST.md.
 */
export function getInitialSeedData() {
  return {
    profiles: [
      { id: 'admin-1', name: 'Maria Santos', email: 'admin@fsl-workshop.ph', role: 'admin' },
      { id: 'prof-1', name: 'Prof. Juan Dela Cruz', email: 'juan.delacruz@fsl-workshop.ph', role: 'professor' },
      { id: 'prof-2', name: 'Prof. Elena Ramos', email: 'elena.ramos@fsl-workshop.ph', role: 'professor' },
      { id: 'learner-1', name: 'Mark Bautista', email: 'mark.bautista@gmail.com', role: 'learner' },
      { id: 'learner-2', name: 'Sarah Chen', email: 'sarah.chen@gmail.com', role: 'learner' },
      { id: 'learner-3', name: 'David Reyes', email: 'david.reyes@gmail.com', role: 'learner' },
    ],
    workshops: [
      {
        id: 'w-1',
        level: 1,
        title: 'FSL 101: Basic Fingerspelling, Greetings & Survival Signs',
        fee: 2500,
        description: 'Introduction to Filipino Sign Language alphabet, numbers, and basic greetings.',
      },
      {
        id: 'w-2',
        level: 2,
        title: 'FSL 102: Intermediate Expressions & Conversational FSL',
        fee: 3000,
        description: 'Everyday conversations, directional verbs, classifiers, and deaf culture.',
      },
      {
        id: 'w-3',
        level: 3,
        title: 'FSL 103: Advanced FSL Discourse & Community Immersion',
        fee: 3500,
        description: 'Advanced storytelling, discourse analysis, idioms, and interpretation readiness.',
      },
    ],
    schedules: [
      {
        id: 's-1',
        workshop_id: 'w-1',
        professor_id: 'prof-1',
        day_time: 'Saturdays 9:00 AM - 12:00 PM',
        slots: 20,
        meeting_link: 'https://meet.google.com/fsl-lvl1-sat',
      },
      {
        id: 's-2',
        workshop_id: 'w-2',
        professor_id: 'prof-2',
        day_time: 'Sundays 1:00 PM - 4:00 PM',
        slots: 15,
        meeting_link: 'https://zoom.us/j/9876543210',
      },
      {
        id: 's-3',
        workshop_id: 'w-3',
        professor_id: 'prof-1',
        day_time: 'Wednesdays 6:00 PM - 9:00 PM',
        slots: 10,
        meeting_link: 'https://meet.google.com/fsl-lvl3-wed',
      },
    ],
    enrollments: [
      { id: 'e-1', learner_id: 'learner-2', schedule_id: 's-2', status: 'enrolled' },
      { id: 'e-2', learner_id: 'learner-3', schedule_id: 's-2', status: 'completed' },
    ],
    payments: [
      { id: 'pay-1', enrollment_id: 'e-1', amount: 3000, status: 'verified', date: '2026-09-01T08:00:00Z' },
      { id: 'pay-2', enrollment_id: 'e-2', amount: 3000, status: 'verified', date: '2026-08-01T08:00:00Z' },
    ],
    attendance: [
      { id: 'att-1', enrollment_id: 'e-1', date: '2026-09-07', present: true },
      { id: 'att-2', enrollment_id: 'e-1', date: '2026-09-14', present: true },
    ],
    assignments: [
      {
        id: 'asg-1',
        schedule_id: 's-2',
        title: 'Video Submission: 2-Minute Conversational Greeting in FSL',
        description: 'Record yourself signing a dialogue greeting a Deaf friend at a coffee shop.',
        due_date: '2026-10-15T23:59:59Z',
      },
    ],
    submissions: [
      {
        id: 'sub-1',
        assignment_id: 'asg-1',
        learner_id: 'learner-2',
        file_url: 'https://storage.fsl.ph/submissions/sub-1.mp4',
        grade: 92,
        feedback: 'Excellent facial expressions and clear handshapes for greetings!',
      },
    ],
    materials: [
      {
        id: 'mat-1',
        schedule_id: 's-1',
        title: 'FSL Handshape Chart & Guidebook (PDF)',
        file_url: 'https://storage.fsl.ph/materials/fsl-handshapes.pdf',
      },
      {
        id: 'mat-2',
        schedule_id: 's-2',
        title: 'Deaf Culture and Visual Grammar Handout',
        file_url: 'https://storage.fsl.ph/materials/deaf-culture.pdf',
      },
    ],
    videos: [
      {
        id: 'vid-1',
        level: 1,
        title: 'FSL Alphabet A to Z & Manual Fingerspelling Guide',
        category: 'Alphabet / Fingerspelling',
        video_url: 'https://storage.fsl.ph/videos/fsl-alphabet.mp4',
        uploaded_by: 'prof-1',
      },
      {
        id: 'vid-2',
        level: 1,
        title: 'Essential Daily Greetings (Good Morning, Thank You, You are Welcome)',
        category: 'Basic Greetings',
        video_url: 'https://storage.fsl.ph/videos/fsl-greetings.mp4',
        uploaded_by: 'prof-1',
      },
      {
        id: 'vid-3',
        level: 1,
        title: 'Cardinal and Ordinal Numbers 1 to 100 in FSL',
        category: 'Numbers',
        video_url: 'https://storage.fsl.ph/videos/fsl-numbers.mp4',
        uploaded_by: 'prof-2',
      },
      {
        id: 'vid-4',
        level: 2,
        title: 'Common Expressions, Polite Markers and Idiomatic Signs',
        category: 'Common Expressions',
        video_url: 'https://storage.fsl.ph/videos/fsl-expressions.mp4',
        uploaded_by: 'prof-2',
      },
      {
        id: 'vid-5',
        level: 2,
        title: 'Everyday Conversations: Market Shopping, Directions, & Transport',
        category: 'Everyday Conversations',
        video_url: 'https://storage.fsl.ph/videos/fsl-conversations.mp4',
        uploaded_by: 'prof-2',
      },
      {
        id: 'vid-6',
        level: 3,
        title: 'Vocabulary Lessons: Academic, Legal and Medical FSL Terminology',
        category: 'Vocabulary Lessons',
        video_url: 'https://storage.fsl.ph/videos/fsl-vocab-advanced.mp4',
        uploaded_by: 'admin-1',
      },
    ],
    announcements: [
      {
        id: 'ann-1',
        author_id: 'prof-1',
        schedule_id: 's-1',
        title: 'Welcome to FSL Level 1! Session Starts Saturday',
        body: 'Please ensure good lighting and clear camera view for visual signing.',
      },
    ],
    messages: [
      {
        id: 'msg-1',
        sender_id: 'learner-2',
        receiver_id: 'prof-2',
        body: 'Hello Professor Ramos, could you review the classifier sign in chapter 3?',
        created_at: '2026-09-20T10:00:00Z',
      },
      {
        id: 'msg-2',
        sender_id: 'prof-2',
        receiver_id: 'learner-2',
        body: 'Of course Sarah! We will practice the V-classifier in our next live session.',
        created_at: '2026-09-20T10:15:00Z',
      },
    ],
    news_events: [
      {
        id: 'news-1',
        title: 'SDEAS Celebrates 30 Years of Pioneering Deaf Higher Education',
        body: 'Celebrating three decades of inclusive learning, empowering Deaf leaders and FSL interpreters.',
        type: 'sdeas_news',
        date: '2026-09-15',
      },
      {
        id: 'news-2',
        title: 'Deaf Festival 2026: Visual Theatre, Sign Poetry and Cultural Showcase',
        body: 'Join us for cultural celebrations, deaf theatre, visual poetry, and community booths.',
        type: 'deaf_festival',
        date: '2026-10-20',
      },
      {
        id: 'news-3',
        title: 'National FSL Interpreting & Ethics Symposium Announced',
        body: 'Continuing education seminar on interpreting ethics, standards, and community engagement.',
        type: 'seminar',
        date: '2026-11-05',
      },
      {
        id: 'news-4',
        title: 'Philippine Federation of the Deaf (PFD) Partnership Spotlight',
        body: 'Expanding regional FSL advocacy, deaf youth empowerment, and bilingual education.',
        type: 'event',
        date: '2026-09-22',
      },
    ],
    products: [
      {
        id: 'prod-1',
        name: 'Official FSL "I Love You" Classic Sign Shirt',
        price: 450,
        stock: 35,
      },
      {
        id: 'prod-2',
        name: 'FSL Fingerspelling Canvas Heavy-Duty Tote Bag',
        price: 350,
        stock: 20,
      },
      {
        id: 'prod-3',
        name: 'Deaf Pride & FSL Enamel Lapel Pin',
        price: 150,
        stock: 75,
      },
      {
        id: 'prod-4',
        name: 'FSL Lanyard with Quick-Release Buckle',
        price: 120,
        stock: 50,
      },
    ],
  };
}

/**
 * FSL Database Simulation Engine
 * Enforces schema constraints, foreign keys, RLS authorization checks,
 * status transitions, and business calculations.
 */
export class FSLDatabaseEngine {
  constructor() {
    this.reset();
  }

  reset() {
    const seed = getInitialSeedData();
    this.profiles = JSON.parse(JSON.stringify(seed.profiles));
    this.workshops = JSON.parse(JSON.stringify(seed.workshops));
    this.schedules = JSON.parse(JSON.stringify(seed.schedules));
    this.enrollments = JSON.parse(JSON.stringify(seed.enrollments));
    this.payments = JSON.parse(JSON.stringify(seed.payments));
    this.attendance = JSON.parse(JSON.stringify(seed.attendance));
    this.assignments = JSON.parse(JSON.stringify(seed.assignments));
    this.submissions = JSON.parse(JSON.stringify(seed.submissions));
    this.materials = JSON.parse(JSON.stringify(seed.materials));
    this.videos = JSON.parse(JSON.stringify(seed.videos));
    this.announcements = JSON.parse(JSON.stringify(seed.announcements));
    this.messages = JSON.parse(JSON.stringify(seed.messages));
    this.news_events = JSON.parse(JSON.stringify(seed.news_events));
    this.products = JSON.parse(JSON.stringify(seed.products));
    this._nextId = 1000;
  }

  generateId(prefix = 'gen') {
    this._nextId += 1;
    return `${prefix}-${this._nextId}`;
  }

  // --- Auth & Profile Helpers ---
  getProfile(userId) {
    return this.profiles.find((p) => p.id === userId) || null;
  }

  registerUser({ name, email, role = 'learner' }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Registration error: name cannot be empty');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Registration error: valid email is required');
    }
    if (!ROLES.includes(role)) {
      throw new Error(`Registration error: invalid role "${role}". Allowed: ${ROLES.join(', ')}`);
    }
    if (this.profiles.some((p) => p.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Registration error: email already registered');
    }
    const newUser = {
      id: this.generateId('user'),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
    };
    this.profiles.push(newUser);
    return newUser;
  }

  // --- Workshop & Schedule Management (Admin) ---
  createWorkshop(actorId, { level, title, fee, description }) {
    const actor = this.getProfile(actorId);
    if (!actor || actor.role !== 'admin') {
      throw new Error('Authorization error: only administrators can create workshops');
    }
    if (!WORKSHOP_LEVELS.includes(Number(level))) {
      throw new Error(`Invalid workshop level "${level}". Allowed levels: 1, 2, 3`);
    }
    if (!title || title.trim().length === 0) {
      throw new Error('Workshop title cannot be empty');
    }
    const numFee = Number(fee);
    if (isNaN(numFee) || numFee < 0) {
      throw new Error('Workshop fee must be a non-negative number');
    }

    const workshop = {
      id: this.generateId('w'),
      level: Number(level),
      title: title.trim(),
      fee: numFee,
      description: description || '',
    };
    this.workshops.push(workshop);
    return workshop;
  }

  createSchedule(actorId, { workshop_id, professor_id, day_time, slots, meeting_link }) {
    const actor = this.getProfile(actorId);
    if (!actor || actor.role !== 'admin') {
      throw new Error('Authorization error: only administrators can create schedules');
    }
    const workshop = this.workshops.find((w) => w.id === workshop_id);
    if (!workshop) {
      throw new Error(`Workshop "${workshop_id}" not found`);
    }
    const professor = this.profiles.find((p) => p.id === professor_id && p.role === 'professor');
    if (!professor) {
      throw new Error(`Professor "${professor_id}" not found or does not have professor role`);
    }
    const numSlots = Number(slots);
    if (isNaN(numSlots) || numSlots < 1) {
      throw new Error('Slots must be at least 1');
    }

    const schedule = {
      id: this.generateId('s'),
      workshop_id,
      professor_id,
      day_time: day_time.trim(),
      slots: numSlots,
      meeting_link: meeting_link || 'https://meet.google.com/new',
    };
    this.schedules.push(schedule);
    return schedule;
  }

  updateMeetingLink(actorId, scheduleId, meetingLink) {
    const actor = this.getProfile(actorId);
    const schedule = this.schedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      throw new Error(`Schedule "${scheduleId}" not found`);
    }
    if (!actor || (actor.role !== 'admin' && actor.id !== schedule.professor_id)) {
      throw new Error('Authorization error: only the assigned professor or admin can update meeting link');
    }
    schedule.meeting_link = meetingLink;
    return schedule;
  }

  // --- Enrollment & Simulated Payment Flow ---
  enrollLearner(learnerId, scheduleId) {
    const learner = this.getProfile(learnerId);
    if (!learner || learner.role !== 'learner') {
      throw new Error('Authorization error: only learners can enroll in workshops');
    }
    const schedule = this.schedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      throw new Error(`Schedule "${scheduleId}" not found`);
    }
    if (schedule.slots <= 0) {
      throw new Error('Enrollment error: no available slots remaining for this schedule');
    }
    const existing = this.enrollments.find(
      (e) => e.learner_id === learnerId && e.schedule_id === scheduleId && ['pending', 'enrolled'].includes(e.status)
    );
    if (existing) {
      throw new Error('Enrollment error: learner already enrolled or pending for this schedule');
    }

    schedule.slots -= 1;
    const enrollment = {
      id: this.generateId('e'),
      learner_id: learnerId,
      schedule_id: scheduleId,
      status: 'pending',
    };
    this.enrollments.push(enrollment);
    return enrollment;
  }

  submitSimulatedPayment(learnerId, enrollmentId, amount) {
    const learner = this.getProfile(learnerId);
    const enrollment = this.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) {
      throw new Error(`Enrollment "${enrollmentId}" not found`);
    }
    if (enrollment.learner_id !== learnerId && (!learner || learner.role !== 'admin')) {
      throw new Error('Authorization error: cannot pay for another user enrollment');
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Payment error: payment amount must be greater than 0');
    }

    const existingPayment = this.payments.find((p) => p.enrollment_id === enrollmentId);
    if (existingPayment) {
      if (existingPayment.status === 'verified') {
        throw new Error('Payment error: enrollment is already verified and paid');
      }
      return existingPayment;
    }

    const payment = {
      id: this.generateId('pay'),
      enrollment_id: enrollmentId,
      amount: numAmount,
      status: 'pending',
      date: new Date().toISOString(),
    };
    this.payments.push(payment);
    return payment;
  }

  adminVerifyPayment(adminId, paymentId) {
    const admin = this.getProfile(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new Error('Authorization error: only administrators can verify payments');
    }
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment) {
      throw new Error(`Payment "${paymentId}" not found`);
    }
    if (payment.status === 'verified') {
      throw new Error('Payment error: payment is already verified');
    }
    const enrollment = this.enrollments.find((e) => e.id === payment.enrollment_id);
    if (!enrollment) {
      throw new Error('Integrity error: associated enrollment record not found');
    }

    // Atomic update per interface contract
    payment.status = 'verified';
    enrollment.status = 'enrolled';

    return { payment, enrollment };
  }

  getFinancialSummary(adminId) {
    const admin = this.getProfile(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new Error('Authorization error: only administrators can view financial reports');
    }

    const verifiedPayments = this.payments.filter((p) => p.status === 'verified');
    const pendingPayments = this.payments.filter((p) => p.status === 'pending');

    const totalRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingRevenue = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    // Breakdown by workshop
    const breakdown = this.workshops.map((w) => {
      const scheduleIds = this.schedules.filter((s) => s.workshop_id === w.id).map((s) => s.id);
      const enrollmentIds = this.enrollments.filter((e) => scheduleIds.includes(e.schedule_id)).map((e) => e.id);
      const workshopPayments = verifiedPayments.filter((p) => enrollmentIds.includes(p.enrollment_id));
      const workshopTotal = workshopPayments.reduce((sum, p) => sum + p.amount, 0);
      return {
        workshop_id: w.id,
        level: w.level,
        title: w.title,
        enrolled_count: enrollmentIds.length,
        verified_transactions: workshopPayments.length,
        total_revenue: workshopTotal,
      };
    });

    return {
      totalRevenue,
      pendingRevenue,
      transactionCount: this.payments.length,
      verifiedCount: verifiedPayments.length,
      pendingCount: pendingPayments.length,
      breakdown,
    };
  }

  // --- Classroom, Attendance & Coursework (Professor) ---
  recordAttendance(professorId, scheduleId, enrollmentId, date, present, remarks = null) {
    if (!date || typeof date !== 'string' || date.trim().length === 0) {
      throw new Error('Attendance session date is required');
    }
    const professor = this.getProfile(professorId);
    const schedule = this.schedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      throw new Error(`Schedule "${scheduleId}" not found`);
    }
    if (!professor || (professor.role !== 'admin' && professor.id !== schedule.professor_id)) {
      throw new Error('Authorization error: only assigned professor or admin can record attendance');
    }
    const enrollment = this.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment || enrollment.schedule_id !== scheduleId) {
      throw new Error('Attendance error: enrollment does not belong to this schedule');
    }
    if (!['enrolled', 'completed'].includes(enrollment.status)) {
      throw new Error(`Attendance error: cannot take attendance for learner with status "${enrollment.status}"`);
    }

    const existing = this.attendance.find((a) => a.enrollment_id === enrollmentId && a.date === date.trim());
    if (existing) {
      existing.present = Boolean(present);
      if (remarks !== null && remarks !== undefined) {
        existing.remarks = String(remarks).trim();
      }
      return existing;
    }

    const record = {
      id: this.generateId('att'),
      enrollment_id: enrollmentId,
      date: date.trim(),
      present: Boolean(present),
      remarks: remarks ? String(remarks).trim() : null,
    };
    this.attendance.push(record);
    return record;
  }

  createAssignment(professorId, scheduleId, { title, description, due_date }) {
    const professor = this.getProfile(professorId);
    const schedule = this.schedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      throw new Error(`Schedule "${scheduleId}" not found`);
    }
    if (!professor || (professor.role !== 'admin' && professor.id !== schedule.professor_id)) {
      throw new Error('Authorization error: only assigned professor or admin can create assignments');
    }
    if (!title || title.trim().length === 0) {
      throw new Error('Assignment title cannot be empty');
    }

    const assignment = {
      id: this.generateId('asg'),
      schedule_id: scheduleId,
      title: title.trim(),
      description: description || '',
      due_date: due_date || new Date(Date.now() + 7 * 86400000).toISOString(),
    };
    this.assignments.push(assignment);
    return assignment;
  }

  submitAssignment(learnerId, assignmentId, { file_url }) {
    const learner = this.getProfile(learnerId);
    if (!learner || learner.role !== 'learner') {
      throw new Error('Authorization error: only learners can submit assignments');
    }
    const assignment = this.assignments.find((a) => a.id === assignmentId);
    if (!assignment) {
      throw new Error(`Assignment "${assignmentId}" not found`);
    }
    const enrollment = this.enrollments.find(
      (e) => e.learner_id === learnerId && e.schedule_id === assignment.schedule_id && e.status === 'enrolled'
    );
    if (!enrollment) {
      throw new Error('Authorization error: learner is not currently enrolled in this schedule');
    }
    if (!file_url || file_url.trim().length === 0) {
      throw new Error('Submission error: file or video URL is required');
    }

    const existing = this.submissions.find((s) => s.assignment_id === assignmentId && s.learner_id === learnerId);
    if (existing) {
      existing.file_url = file_url.trim();
      return existing;
    }

    const submission = {
      id: this.generateId('sub'),
      assignment_id: assignmentId,
      learner_id: learnerId,
      file_url: file_url.trim(),
      grade: null,
      feedback: null,
    };
    this.submissions.push(submission);
    return submission;
  }

  gradeSubmission(professorId, submissionId, { grade, feedback }) {
    const submission = this.submissions.find((s) => s.id === submissionId);
    if (!submission) {
      throw new Error(`Submission "${submissionId}" not found`);
    }
    const assignment = this.assignments.find((a) => a.id === submission.assignment_id);
    const schedule = this.schedules.find((s) => s.id === assignment.schedule_id);
    const professor = this.getProfile(professorId);
    if (!professor || (professor.role !== 'admin' && professor.id !== schedule.professor_id)) {
      throw new Error('Authorization error: only assigned professor or admin can grade this submission');
    }

    const numGrade = Number(grade);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
      throw new Error('Grade must be a number between 0 and 100');
    }

    submission.grade = numGrade;
    submission.feedback = feedback || '';
    return submission;
  }

  // --- Content, Videos & Materials ---
  uploadVideo(actorId, { level, title, category, video_url }) {
    const actor = this.getProfile(actorId);
    if (!actor || !['professor', 'admin'].includes(actor.role)) {
      throw new Error('Authorization error: only professors and administrators can upload tutorial videos');
    }
    if (!WORKSHOP_LEVELS.includes(Number(level))) {
      throw new Error(`Invalid video level "${level}". Allowed: 1, 2, 3`);
    }
    if (!VIDEO_CATEGORIES.includes(category)) {
      throw new Error(`Invalid video category "${category}". Allowed: ${VIDEO_CATEGORIES.join(', ')}`);
    }
    if (!title || title.trim().length === 0) {
      throw new Error('Video title cannot be empty');
    }
    if (!video_url || video_url.trim().length === 0) {
      throw new Error('Video URL cannot be empty');
    }

    const video = {
      id: this.generateId('vid'),
      level: Number(level),
      title: title.trim(),
      category,
      video_url: video_url.trim(),
      uploaded_by: actorId,
    };
    this.videos.push(video);
    return video;
  }

  uploadMaterial(actorId, scheduleId, { title, file_url }) {
    const actor = this.getProfile(actorId);
    const schedule = this.schedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      throw new Error(`Schedule "${scheduleId}" not found`);
    }
    if (!actor || (actor.role !== 'admin' && actor.id !== schedule.professor_id)) {
      throw new Error('Authorization error: only assigned professor or admin can upload materials');
    }
    if (!title || !file_url) {
      throw new Error('Material title and file URL are required');
    }

    const material = {
      id: this.generateId('mat'),
      schedule_id: scheduleId,
      title: title.trim(),
      file_url: file_url.trim(),
    };
    this.materials.push(material);
    return material;
  }

  // --- Communication & Messaging ---
  sendMessage(senderId, receiverId, body) {
    const sender = this.getProfile(senderId);
    const receiver = this.getProfile(receiverId);
    if (!sender) throw new Error(`Sender "${senderId}" not found`);
    if (!receiver) throw new Error(`Receiver "${receiverId}" not found`);
    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      throw new Error('Message body cannot be empty');
    }

    const message = {
      id: this.generateId('msg'),
      sender_id: senderId,
      receiver_id: receiverId,
      body: body.trim(),
      created_at: new Date().toISOString(),
    };
    this.messages.push(message);
    return message;
  }

  getMessageThread(user1Id, user2Id) {
    return this.messages
      .filter(
        (m) =>
          (m.sender_id === user1Id && m.receiver_id === user2Id) ||
          (m.sender_id === user2Id && m.receiver_id === user1Id)
      )
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  markThreadAsRead(currentUserId, partnerId) {
    for (const m of this.messages) {
      if (m.receiver_id === currentUserId && m.sender_id === partnerId) {
        m.read = true;
      }
    }
  }

  getConversations(userId) {
    const userMessages = this.messages.filter(
      (m) => m.sender_id === userId || m.receiver_id === userId
    );
    const partnerIdMap = new Map();
    const sorted = [...userMessages].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    for (const m of sorted) {
      const partnerId = m.sender_id === userId ? m.receiver_id : m.sender_id;
      if (!partnerIdMap.has(partnerId)) {
        partnerIdMap.set(partnerId, { lastMessage: m, unreadCount: 0 });
      }
      if (m.receiver_id === userId && !m.read) {
        partnerIdMap.get(partnerId).unreadCount += 1;
      }
    }
    const summaries = [];
    partnerIdMap.forEach((data, partnerId) => {
      const partner = this.getProfile(partnerId);
      if (partner) {
        summaries.push({
          partner,
          lastMessage: data.lastMessage,
          unreadCount: data.unreadCount,
        });
      }
    });
    return summaries;
  }

  // --- News & Events ---
  getNewsEvents(filterType) {
    if (!filterType || filterType === 'all') {
      return [...this.news_events].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    const normalized = filterType.toLowerCase().trim();
    if (normalized === 'events_seminars' || normalized === 'events & seminars') {
      return this.news_events
        .filter((n) => n.type === 'event' || n.type === 'seminar')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return this.news_events
      .filter((n) => n.type === normalized)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getNewsEventById(id) {
    return this.news_events.find((n) => n.id === id);
  }

  // --- Merchandise ---
  purchaseProduct(productId, quantity = 1) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`Product "${productId}" not found`);
    }
    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      throw new Error('Quantity must be at least 1');
    }
    if (product.stock < numQty) {
      throw new Error(`Insufficient stock. Requested: ${numQty}, Available: ${product.stock}`);
    }
    product.stock -= numQty;
    return product;
  }

  submitMerchandiseInquiry(productId, payload) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`Product "${productId}" not found`);
    }
    const qty = Number(payload.quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Order quantity must be at least 1 unit.');
    }
    if (product.stock < qty) {
      throw new Error(
        `Insufficient stock for "${product.name}". Requested: ${qty}, Available: ${product.stock}.`
      );
    }
    if (!payload.recipientName || payload.recipientName.trim().length === 0) {
      throw new Error('Recipient name is required for merchandise inquiry.');
    }
    if (!payload.email || !payload.email.includes('@')) {
      throw new Error('A valid contact email is required.');
    }

    product.stock -= qty;

    const orderId = `ORD-FSL-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
    const inquiry = {
      id: orderId,
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      unit_price: product.price,
      total_price: product.price * qty,
      recipient_name: payload.recipientName.trim(),
      email: payload.email.trim(),
      contact_number: payload.contactNumber?.trim(),
      delivery_address: payload.deliveryAddress?.trim(),
      notes: payload.notes?.trim(),
      status: 'submitted',
      created_at: new Date().toISOString(),
    };
    if (!this.merchandiseInquiries) {
      this.merchandiseInquiries = [];
    }
    this.merchandiseInquiries.push(inquiry);
    return {
      success: true,
      orderId,
      message: `Pre-order inquiry #${orderId} for ${qty}x ${product.name} recorded successfully!`,
      updatedProduct: { ...product },
      inquiry,
    };
  }

  // --- Progression Roadmap ---
  getLearnerProgression(learnerId) {
    const learner = this.getProfile(learnerId);
    if (!learner) throw new Error(`Learner "${learnerId}" not found`);

    const userEnrollments = this.enrollments.filter((e) => e.learner_id === learnerId);
    const completedSchedules = userEnrollments
      .filter((e) => e.status === 'completed')
      .map((e) => this.schedules.find((s) => s.id === e.schedule_id))
      .filter(Boolean);

    const completedWorkshopIds = completedSchedules.map((s) => s.workshop_id);
    const completedWorkshops = this.workshops.filter((w) => completedWorkshopIds.includes(w.id));
    const completedLevels = Array.from(new Set(completedWorkshops.map((w) => w.level))).sort();

    const currentLevel = completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
    const nextLevel = currentLevel < 3 ? currentLevel + 1 : null;

    return {
      learnerId,
      completedLevels,
      currentLevel,
      nextLevel,
      completedWorkshops,
      isGraduated: completedLevels.includes(3),
      pathways: [
        {
          name: 'BSLI (Bachelor in Sign Language Interpretation)',
          description: 'A 4-year professional collegiate degree preparing certified Filipino Sign Language interpreters.',
          eligible: completedLevels.includes(2) || completedLevels.includes(3),
        },
        {
          name: 'Applied Deaf Studies',
          description: 'Specialized program focusing on Deaf leadership, advocacy, entrepreneurship, and media.',
          eligible: completedLevels.includes(2) || completedLevels.includes(3),
        },
      ],
    };
  }
}

/**
 * WCAG Contrast Ratio Checker
 * Computes luminance and verifies 7:1 (AAA) or 4.5:1 (AA) conformance.
 */
export function calculateContrastRatio(hexFg, hexBg) {
  function getLuminance(hex) {
    const rgb = hex
      .replace('#', '')
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  const l1 = getLuminance(hexFg);
  const l2 = getLuminance(hexBg);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}
