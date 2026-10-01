// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// SQLite Repositories & Data Access Layer
// File: src/lib/sqlite/repository.ts
// =====================================================================

import { getSqliteDb } from './db';
import type {
  Profile,
  Workshop,
  Schedule,
  Enrollment,
  Payment,
  Attendance,
  Assignment,
  Submission,
  Material,
  Video,
  Announcement,
  Message,
  NewsEvent,
  Product,
} from '../../types/database';

export const SqliteRepo = {
  // -------------------------------------------------------------------
  // 1. Profiles
  // -------------------------------------------------------------------
  getProfiles(): Profile[] {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM profiles ORDER BY name ASC').all() as Profile[];
  },

  getProfileById(id: string): Profile | null {
    const db = getSqliteDb();
    return (db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as Profile) || null;
  },

  getProfileByEmail(email: string): Profile | null {
    const db = getSqliteDb();
    return (db.prepare('SELECT * FROM profiles WHERE lower(email) = lower(?)').get(email) as Profile) || null;
  },

  createProfile(profile: Partial<Profile> & { id: string; name: string; email: string; role: string }): Profile {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO profiles (id, name, email, role, avatar_url, bio, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(profile.id, profile.name, profile.email, profile.role, profile.avatar_url || null, profile.bio || null);
    return this.getProfileById(profile.id)!;
  },

  updateProfileRole(id: string, role: string): Profile | null {
    const db = getSqliteDb();
    db.prepare(`
      UPDATE profiles SET role = ?, updated_at = datetime('now') WHERE id = ?
    `).run(role, id);
    return this.getProfileById(id);
  },

  // -------------------------------------------------------------------
  // 2. Workshops
  // -------------------------------------------------------------------
  getWorkshops(): Workshop[] {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM workshops ORDER BY level ASC, title ASC').all() as Workshop[];
  },

  getWorkshopById(id: string): Workshop | null {
    const db = getSqliteDb();
    return (db.prepare('SELECT * FROM workshops WHERE id = ?').get(id) as Workshop) || null;
  },

  createWorkshop(data: { id?: string; level: number; title: string; fee: number; description: string }): Workshop {
    const db = getSqliteDb();
    const id = data.id || `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO workshops (id, level, title, fee, description, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(id, data.level, data.title, data.fee, data.description);
    return this.getWorkshopById(id)!;
  },

  updateWorkshop(id: string, data: Partial<Workshop>): Workshop | null {
    const db = getSqliteDb();
    const existing = this.getWorkshopById(id);
    if (!existing) return null;

    db.prepare(`
      UPDATE workshops
      SET level = coalesce(?, level),
          title = coalesce(?, title),
          fee = coalesce(?, fee),
          description = coalesce(?, description)
      WHERE id = ?
    `).run(data.level ?? null, data.title ?? null, data.fee ?? null, data.description ?? null, id);
    return this.getWorkshopById(id);
  },

  // -------------------------------------------------------------------
  // 3. Schedules
  // -------------------------------------------------------------------
  getSchedules(): Schedule[] {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM schedules ORDER BY created_at DESC').all() as Schedule[];
  },

  getScheduleById(id: string): Schedule | null {
    const db = getSqliteDb();
    return (db.prepare('SELECT * FROM schedules WHERE id = ?').get(id) as Schedule) || null;
  },

  createSchedule(data: { id?: string; workshop_id: string; professor_id: string; day_time: string; slots: number; meeting_link?: string }): Schedule {
    const db = getSqliteDb();
    const id = data.id || `sch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO schedules (id, workshop_id, professor_id, day_time, slots, meeting_link, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, data.workshop_id, data.professor_id, data.day_time, data.slots, data.meeting_link || null);
    return this.getScheduleById(id)!;
  },

  updateSchedule(id: string, data: Partial<Schedule>): Schedule | null {
    const db = getSqliteDb();
    db.prepare(`
      UPDATE schedules
      SET day_time = coalesce(?, day_time),
          slots = coalesce(?, slots),
          meeting_link = coalesce(?, meeting_link),
          professor_id = coalesce(?, professor_id)
      WHERE id = ?
    `).run(data.day_time ?? null, data.slots ?? null, data.meeting_link ?? null, data.professor_id ?? null, id);
    return this.getScheduleById(id);
  },

  // -------------------------------------------------------------------
  // 4. Enrollments
  // -------------------------------------------------------------------
  getEnrollments(): Enrollment[] {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM enrollments ORDER BY created_at DESC').all() as Enrollment[];
  },

  getEnrollmentById(id: string): Enrollment | null {
    const db = getSqliteDb();
    return (db.prepare('SELECT * FROM enrollments WHERE id = ?').get(id) as Enrollment) || null;
  },

  createEnrollment(data: { id?: string; learner_id: string; schedule_id: string; status?: 'pending' | 'enrolled' }): Enrollment {
    const db = getSqliteDb();
    const id = data.id || `enr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const status = data.status || 'pending';
    db.prepare(`
      INSERT OR REPLACE INTO enrollments (id, learner_id, schedule_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(id, data.learner_id, data.schedule_id, status);
    return this.getEnrollmentById(id)!;
  },

  updateEnrollmentStatus(id: string, status: string): Enrollment | null {
    const db = getSqliteDb();
    db.prepare(`
      UPDATE enrollments SET status = ?, updated_at = datetime('now') WHERE id = ?
    `).run(status, id);
    return this.getEnrollmentById(id);
  },

  // -------------------------------------------------------------------
  // 5. Payments
  // -------------------------------------------------------------------
  getPayments(): Payment[] {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM payments ORDER BY date DESC').all() as Payment[];
  },

  getPaymentById(id: string): Payment | null {
    const db = getSqliteDb();
    return (db.prepare('SELECT * FROM payments WHERE id = ?').get(id) as Payment) || null;
  },

  createPayment(data: { id?: string; enrollment_id: string; amount: number; reference_no: string; payment_method?: string; status?: 'pending' | 'verified' }): Payment {
    const db = getSqliteDb();
    const id = data.id || `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const status = data.status || 'pending';
    const method = data.payment_method || 'Simulated Online Transfer';
    db.prepare(`
      INSERT INTO payments (id, enrollment_id, amount, status, date, reference_no, payment_method, created_at)
      VALUES (?, ?, ?, ?, datetime('now'), ?, ?, datetime('now'))
    `).run(id, data.enrollment_id, data.amount, status, data.reference_no, method);
    return this.getPaymentById(id)!;
  },

  verifyPayment(paymentId: string): { payment: Payment; enrollment: Enrollment } | null {
    const db = getSqliteDb();
    const payment = this.getPaymentById(paymentId);
    if (!payment) return null;

    const tx = db.transaction(() => {
      db.prepare(`UPDATE payments SET status = 'verified' WHERE id = ?`).run(paymentId);
      db.prepare(`UPDATE enrollments SET status = 'enrolled', updated_at = datetime('now') WHERE id = ?`).run(payment.enrollment_id);
    });
    tx();

    return {
      payment: this.getPaymentById(paymentId)!,
      enrollment: this.getEnrollmentById(payment.enrollment_id)!,
    };
  },

  // -------------------------------------------------------------------
  // 6. Attendance
  // -------------------------------------------------------------------
  getAttendance(): Attendance[] {
    const db = getSqliteDb();
    const rows = db.prepare('SELECT * FROM attendance ORDER BY date DESC').all() as any[];
    return rows.map((r) => ({ ...r, present: Boolean(r.present) }));
  },

  recordAttendance(data: { id?: string; enrollment_id: string; date: string; present: boolean; remarks?: string }): Attendance {
    const db = getSqliteDb();
    const id = data.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT OR REPLACE INTO attendance (id, enrollment_id, date, present, remarks, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(id, data.enrollment_id, data.date, data.present ? 1 : 0, data.remarks || null);

    const row = db.prepare('SELECT * FROM attendance WHERE id = ?').get(id) as any;
    return { ...row, present: Boolean(row.present) };
  },

  // -------------------------------------------------------------------
  // 7. Assignments & Submissions
  // -------------------------------------------------------------------
  getAssignments(): Assignment[] {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM assignments ORDER BY due_date ASC').all() as Assignment[];
  },

  createAssignment(data: { id?: string; schedule_id: string; title: string; description: string; due_date: string }): Assignment {
    const db = getSqliteDb();
    const id = data.id || `asgn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO assignments (id, schedule_id, title, description, due_date, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(id, data.schedule_id, data.title, data.description, data.due_date);
    return db.prepare('SELECT * FROM assignments WHERE id = ?').get(id) as Assignment;
  },

  getSubmissions(): Submission[] {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM submissions ORDER BY submitted_at DESC').all() as Submission[];
  },

  submitAssignment(data: { id?: string; assignment_id: string; learner_id: string; file_url: string }): Submission {
    const db = getSqliteDb();
    const id = data.id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT OR REPLACE INTO submissions (id, assignment_id, learner_id, file_url, submitted_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(id, data.assignment_id, data.learner_id, data.file_url);
    return db.prepare('SELECT * FROM submissions WHERE id = ?').get(id) as Submission;
  },

  gradeSubmission(submissionId: string, grade: number, feedback: string): Submission | null {
    const db = getSqliteDb();
    db.prepare(`
      UPDATE submissions
      SET grade = ?, feedback = ?, graded_at = datetime('now')
      WHERE id = ?
    `).run(grade, feedback, submissionId);
    return db.prepare('SELECT * FROM submissions WHERE id = ?').get(submissionId) as Submission || null;
  },

  // -------------------------------------------------------------------
  // 8. Materials & Videos
  // -------------------------------------------------------------------
  getMaterials(): Material[] {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM materials ORDER BY created_at DESC').all() as Material[];
  },

  createMaterial(data: { id?: string; schedule_id: string; title: string; file_url: string; description?: string }): Material {
    const db = getSqliteDb();
    const id = data.id || `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO materials (id, schedule_id, title, file_url, description, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(id, data.schedule_id, data.title, data.file_url, data.description || null);
    return db.prepare('SELECT * FROM materials WHERE id = ?').get(id) as Material;
  },

  getVideos(): Video[] {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM videos ORDER BY level ASC, title ASC').all() as Video[];
  },

  createVideo(data: { id?: string; level: number; title: string; category: string; video_url: string; uploaded_by?: string; description?: string }): Video {
    const db = getSqliteDb();
    const id = data.id || `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO videos (id, level, title, category, video_url, uploaded_by, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, data.level, data.title, data.category, data.video_url, data.uploaded_by || null, data.description || null);
    return db.prepare('SELECT * FROM videos WHERE id = ?').get(id) as Video;
  },

  // -------------------------------------------------------------------
  // 9. Announcements & Messages
  // -------------------------------------------------------------------
  getAnnouncements(): Announcement[] {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all() as Announcement[];
  },

  createAnnouncement(data: { id?: string; author_id: string; schedule_id?: string; title: string; body: string }): Announcement {
    const db = getSqliteDb();
    const id = data.id || `ann-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO announcements (id, author_id, schedule_id, title, body, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(id, data.author_id, data.schedule_id || null, data.title, data.body);
    return db.prepare('SELECT * FROM announcements WHERE id = ?').get(id) as Announcement;
  },

  getMessages(): Message[] {
    const db = getSqliteDb();
    const rows = db.prepare('SELECT * FROM messages ORDER BY created_at ASC').all() as any[];
    return rows.map((r) => ({ ...r, read: Boolean(r.read) }));
  },

  sendMessage(data: { id?: string; sender_id: string; receiver_id: string; body: string }): Message {
    const db = getSqliteDb();
    const id = data.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO messages (id, sender_id, receiver_id, body, read, created_at)
      VALUES (?, ?, ?, ?, 0, datetime('now'))
    `).run(id, data.sender_id, data.receiver_id, data.body);

    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as any;
    return { ...row, read: Boolean(row.read) };
  },

  // -------------------------------------------------------------------
  // 10. News Events & Products
  // -------------------------------------------------------------------
  getNewsEvents(): NewsEvent[] {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM news_events ORDER BY date DESC').all() as NewsEvent[];
  },

  getProducts(): Product[] {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM products ORDER BY name ASC').all() as Product[];
  },

  decrementProductStock(productId: string, quantity: number = 1): Product | null {
    const db = getSqliteDb();
    db.prepare(`
      UPDATE products
      SET stock = max(0, stock - ?)
      WHERE id = ?
    `).run(quantity, productId);
    return db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as Product || null;
  },

  // Full snapshot of entire database
  getDatabaseSnapshot() {
    return {
      profiles: this.getProfiles(),
      workshops: this.getWorkshops(),
      schedules: this.getSchedules(),
      enrollments: this.getEnrollments(),
      payments: this.getPayments(),
      attendance: this.getAttendance(),
      assignments: this.getAssignments(),
      submissions: this.getSubmissions(),
      materials: this.getMaterials(),
      videos: this.getVideos(),
      announcements: this.getAnnouncements(),
      messages: this.getMessages(),
      news_events: this.getNewsEvents(),
      products: this.getProducts(),
    };
  },
};
