-- =====================================================================
-- FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
-- SQLite Schema (All 14 Relational Tables)
-- =====================================================================

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
