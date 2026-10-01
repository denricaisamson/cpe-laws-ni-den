// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// SQLite Schema Definition & Initialization
// File: src/lib/sqlite/schema.ts
// =====================================================================

import type Database from 'better-sqlite3';
import {
  mockProfiles,
  mockWorkshops,
  mockSchedules,
  mockEnrollments,
  mockPayments,
  mockAttendance,
  mockAssignments,
  mockSubmissions,
  mockMaterials,
  mockVideos,
  mockAnnouncements,
  mockMessages,
  mockNewsEvents,
  mockProducts,
} from '../mock-data';

export const SQLITE_SCHEMA = `
PRAGMA foreign_keys = ON;

-- 1. Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('learner', 'professor', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 2. Workshops
CREATE TABLE IF NOT EXISTS workshops (
  id TEXT PRIMARY KEY,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  title TEXT NOT NULL,
  fee REAL NOT NULL DEFAULT 0.00 CHECK (fee >= 0),
  description TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_workshops_level ON workshops(level);

-- 3. Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  workshop_id TEXT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  professor_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  day_time TEXT NOT NULL,
  slots INTEGER NOT NULL DEFAULT 20 CHECK (slots >= 0),
  meeting_link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_schedules_workshop ON schedules(workshop_id);
CREATE INDEX IF NOT EXISTS idx_schedules_professor ON schedules(professor_id);

-- 4. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_id TEXT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'enrolled', 'completed', 'dropped')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(learner_id, schedule_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_learner ON enrollments(learner_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_schedule ON enrollments(schedule_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- 5. Payments
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  amount REAL NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified')),
  date TEXT NOT NULL DEFAULT (datetime('now')),
  reference_no TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Simulated Online Transfer',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_enrollment ON payments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 6. Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  date TEXT NOT NULL DEFAULT (date('now')),
  present INTEGER NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(enrollment_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_enrollment ON attendance(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- 7. Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_assignments_schedule ON assignments(schedule_id);

-- 8. Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  learner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  grade REAL CHECK (grade IS NULL OR (grade >= 0 AND grade <= 100)),
  feedback TEXT,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  graded_at TEXT,
  UNIQUE(assignment_id, learner_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_learner ON submissions(learner_id);

-- 9. Materials
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_materials_schedule ON materials(schedule_id);

-- 10. Videos
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Alphabet / Fingerspelling',
    'Basic Greetings',
    'Numbers',
    'Common Expressions',
    'Everyday Conversations',
    'Vocabulary Lessons'
  )),
  video_url TEXT NOT NULL,
  uploaded_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_videos_level ON videos(level);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);

-- 11. Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_id TEXT REFERENCES schedules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_announcements_schedule ON announcements(schedule_id);

-- 12. Messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(sender_id, receiver_id);

-- 13. News & Events
CREATE TABLE IF NOT EXISTS news_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('news', 'event', 'announcement', 'opportunity', 'sdeas_news', 'deaf_festival', 'seminar')),
  date TEXT NOT NULL DEFAULT (date('now')),
  image_url TEXT,
  location TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_news_events_type ON news_events(type);

-- 14. Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'Merchandise',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
`;

export function initializeDatabase(db: Database.Database) {
  // Execute schema
  db.exec(SQLITE_SCHEMA);

  // Check if profiles are empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
  if (countRow.count === 0) {
    seedDatabase(db);
  }
}

export function seedDatabase(db: Database.Database) {
  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO profiles (id, name, email, role, avatar_url, bio, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertWorkshop = db.prepare(`
    INSERT OR REPLACE INTO workshops (id, level, title, fee, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertSchedule = db.prepare(`
    INSERT OR REPLACE INTO schedules (id, workshop_id, professor_id, day_time, slots, meeting_link, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEnrollment = db.prepare(`
    INSERT OR REPLACE INTO enrollments (id, learner_id, schedule_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertPayment = db.prepare(`
    INSERT OR REPLACE INTO payments (id, enrollment_id, amount, status, date, reference_no, payment_method, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAttendance = db.prepare(`
    INSERT OR REPLACE INTO attendance (id, enrollment_id, date, present, remarks, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertAssignment = db.prepare(`
    INSERT OR REPLACE INTO assignments (id, schedule_id, title, description, due_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertSubmission = db.prepare(`
    INSERT OR REPLACE INTO submissions (id, assignment_id, learner_id, file_url, grade, feedback, submitted_at, graded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMaterial = db.prepare(`
    INSERT OR REPLACE INTO materials (id, schedule_id, title, file_url, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertVideo = db.prepare(`
    INSERT OR REPLACE INTO videos (id, level, title, category, video_url, uploaded_by, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAnnouncement = db.prepare(`
    INSERT OR REPLACE INTO announcements (id, author_id, schedule_id, title, body, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMessage = db.prepare(`
    INSERT OR REPLACE INTO messages (id, sender_id, receiver_id, body, read, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertNewsEvent = db.prepare(`
    INSERT OR REPLACE INTO news_events (id, title, body, type, date, image_url, location, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertProduct = db.prepare(`
    INSERT OR REPLACE INTO products (id, name, price, stock, description, image_url, category, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    // 1. Profiles
    for (const p of mockProfiles) {
      insertProfile.run(p.id, p.name, p.email, p.role, p.avatar_url || null, p.bio || null, p.created_at, p.updated_at);
    }

    // 2. Workshops
    for (const w of mockWorkshops) {
      insertWorkshop.run(w.id, w.level, w.title, w.fee, w.description, w.created_at);
    }

    // 3. Schedules
    for (const s of mockSchedules) {
      insertSchedule.run(s.id, s.workshop_id, s.professor_id, s.day_time, s.slots, s.meeting_link || null, s.created_at);
    }

    // 4. Enrollments
    for (const e of mockEnrollments) {
      insertEnrollment.run(e.id, e.learner_id, e.schedule_id, e.status, e.created_at, e.updated_at);
    }

    // 5. Payments
    for (const p of mockPayments) {
      insertPayment.run(p.id, p.enrollment_id, p.amount, p.status, p.date, p.reference_no, p.payment_method, p.created_at);
    }

    // 6. Attendance
    for (const a of mockAttendance) {
      insertAttendance.run(a.id, a.enrollment_id, a.date, a.present ? 1 : 0, a.remarks || null, a.created_at);
    }

    // 7. Assignments
    for (const asgn of mockAssignments) {
      insertAssignment.run(asgn.id, asgn.schedule_id, asgn.title, asgn.description, asgn.due_date, asgn.created_at);
    }

    // 8. Submissions
    for (const sub of mockSubmissions) {
      insertSubmission.run(sub.id, sub.assignment_id, sub.learner_id, sub.file_url, sub.grade ?? null, sub.feedback || null, sub.submitted_at, sub.graded_at || null);
    }

    // 9. Materials
    for (const m of mockMaterials) {
      insertMaterial.run(m.id, m.schedule_id, m.title, m.file_url, m.description || null, m.created_at);
    }

    // 10. Videos
    for (const v of mockVideos) {
      insertVideo.run(v.id, v.level, v.title, v.category, v.video_url, v.uploaded_by || null, v.description || null, v.created_at);
    }

    // 11. Announcements
    for (const ann of mockAnnouncements) {
      insertAnnouncement.run(ann.id, ann.author_id, ann.schedule_id || null, ann.title, ann.body, ann.created_at);
    }

    // 12. Messages
    for (const msg of mockMessages) {
      insertMessage.run(msg.id, msg.sender_id, msg.receiver_id, msg.body, msg.read ? 1 : 0, msg.created_at);
    }

    // 13. News & Events
    for (const n of mockNewsEvents) {
      insertNewsEvent.run(n.id, n.title, n.body, n.type, n.date, n.image_url || null, n.location || null, n.created_at);
    }

    // 14. Products
    for (const prod of mockProducts) {
      insertProduct.run(prod.id, prod.name, prod.price, prod.stock, prod.description || null, prod.image_url || null, prod.category || 'Merchandise', prod.created_at);
    }
  });

  transaction();
}
