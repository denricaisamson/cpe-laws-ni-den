-- =====================================================================
-- FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
-- Initial Migration: Schema Definition (All 14 Relational Tables)
-- File: supabase/migrations/20260928000000_init_fsl_schema.sql
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. PROFILES TABLE (Tied 1:1 with auth.users)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'professor', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- =====================================================================
-- 2. WORKSHOPS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  title TEXT NOT NULL,
  fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (fee >= 0),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workshops_level_idx ON public.workshops(level);

-- =====================================================================
-- 3. SCHEDULES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  day_time TEXT NOT NULL,
  slots INTEGER NOT NULL DEFAULT 20 CHECK (slots >= 0),
  meeting_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS schedules_workshop_id_idx ON public.schedules(workshop_id);
CREATE INDEX IF NOT EXISTS schedules_professor_id_idx ON public.schedules(professor_id);

-- =====================================================================
-- 4. ENROLLMENTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'enrolled', 'completed', 'dropped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_learner_schedule UNIQUE (learner_id, schedule_id)
);

CREATE INDEX IF NOT EXISTS enrollments_learner_id_idx ON public.enrollments(learner_id);
CREATE INDEX IF NOT EXISTS enrollments_schedule_id_idx ON public.enrollments(schedule_id);
CREATE INDEX IF NOT EXISTS enrollments_status_idx ON public.enrollments(status);

-- =====================================================================
-- 5. PAYMENTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified')),
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  reference_no TEXT NOT NULL DEFAULT ('PAY-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 8)),
  payment_method TEXT NOT NULL DEFAULT 'Simulated Online Transfer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_enrollment_id_idx ON public.payments(enrollment_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);

-- =====================================================================
-- 6. ATTENDANCE TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  present BOOLEAN NOT NULL DEFAULT false,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_enrollment_date UNIQUE (enrollment_id, date)
);

CREATE INDEX IF NOT EXISTS attendance_enrollment_id_idx ON public.attendance(enrollment_id);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON public.attendance(date);

-- =====================================================================
-- 7. ASSIGNMENTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assignments_schedule_id_idx ON public.assignments(schedule_id);
CREATE INDEX IF NOT EXISTS assignments_due_date_idx ON public.assignments(due_date);

-- =====================================================================
-- 8. SUBMISSIONS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  grade NUMERIC(5, 2) CHECK (grade >= 0 AND grade <= 100),
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  graded_at TIMESTAMPTZ,
  CONSTRAINT uq_assignment_learner UNIQUE (assignment_id, learner_id)
);

CREATE INDEX IF NOT EXISTS submissions_assignment_id_idx ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS submissions_learner_id_idx ON public.submissions(learner_id);

-- =====================================================================
-- 9. MATERIALS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS materials_schedule_id_idx ON public.materials(schedule_id);

-- =====================================================================
-- 10. VIDEOS TABLE (Strict 6 Categories from FSL_SPEC.md)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS videos_level_idx ON public.videos(level);
CREATE INDEX IF NOT EXISTS videos_category_idx ON public.videos(category);

-- =====================================================================
-- 11. ANNOUNCEMENTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS announcements_schedule_id_idx ON public.announcements(schedule_id);
CREATE INDEX IF NOT EXISTS announcements_created_at_idx ON public.announcements(created_at DESC);

-- =====================================================================
-- 12. MESSAGES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_sender_receiver_idx ON public.messages(sender_id, receiver_id, created_at);

-- =====================================================================
-- 13. NEWS & EVENTS TABLE (Community Hub)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.news_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('news', 'event', 'announcement', 'opportunity', 'sdeas_news', 'deaf_festival', 'seminar')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS news_events_type_idx ON public.news_events(type);
CREATE INDEX IF NOT EXISTS news_events_date_idx ON public.news_events(date DESC);

-- =====================================================================
-- 14. PRODUCTS TABLE (Merchandise)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'Merchandise',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);

-- =====================================================================
-- TRIGGERS & REUSABLE FUNCTIONS
-- =====================================================================

-- Updated_at timestamp helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_enrollments_modtime ON public.enrollments;
CREATE TRIGGER update_enrollments_modtime
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto provision user profile on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(
      CASE 
        WHEN new.raw_user_meta_data->>'role' IN ('learner', 'professor') THEN new.raw_user_meta_data->>'role'
        ELSE 'learner' 
      END, 
      'learner'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- SECURITY DEFINER HELPER FUNCTIONS (Prevent RLS Recursion)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_schedule_professor(p_schedule_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.schedules 
    WHERE id = p_schedule_id AND professor_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_enrolled_in_schedule(p_schedule_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE schedule_id = p_schedule_id 
      AND learner_id = auth.uid() 
      AND status IN ('enrolled', 'completed')
  );
$$;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- 1. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_update_self"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- 2. WORKSHOPS
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workshops_select_public"
  ON public.workshops FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "workshops_admin_all"
  ON public.workshops FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- 3. SCHEDULES
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedules_select_public"
  ON public.schedules FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "schedules_professor_update_link"
  ON public.schedules FOR UPDATE TO authenticated
  USING (professor_id = auth.uid() OR public.get_my_role() = 'admin')
  WITH CHECK (professor_id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "schedules_admin_all"
  ON public.schedules FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- 4. ENROLLMENTS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_select"
  ON public.enrollments FOR SELECT TO authenticated
  USING (
    learner_id = auth.uid() 
    OR public.is_schedule_professor(schedule_id) 
    OR public.get_my_role() = 'admin'
  );

CREATE POLICY "enrollments_insert_learner"
  ON public.enrollments FOR INSERT TO authenticated
  WITH CHECK (
    learner_id = auth.uid() 
    AND status = 'pending'
  );

CREATE POLICY "enrollments_update_learner_drop"
  ON public.enrollments FOR UPDATE TO authenticated
  USING (learner_id = auth.uid() AND status = 'pending')
  WITH CHECK (learner_id = auth.uid() AND status = 'dropped');

CREATE POLICY "enrollments_admin_all"
  ON public.enrollments FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- 5. PAYMENTS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select"
  ON public.payments FOR SELECT TO authenticated
  USING (
    enrollment_id IN (SELECT id FROM public.enrollments WHERE learner_id = auth.uid())
    OR public.get_my_role() = 'admin'
  );

CREATE POLICY "payments_insert_learner"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (
    enrollment_id IN (SELECT id FROM public.enrollments WHERE learner_id = auth.uid())
    AND status = 'pending'
  );

CREATE POLICY "payments_admin_update"
  ON public.payments FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "payments_admin_delete"
  ON public.payments FOR DELETE TO authenticated
  USING (public.get_my_role() = 'admin');

-- 6. ATTENDANCE
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_select"
  ON public.attendance FOR SELECT TO authenticated
  USING (
    enrollment_id IN (SELECT id FROM public.enrollments WHERE learner_id = auth.uid())
    OR enrollment_id IN (
      SELECT e.id FROM public.enrollments e
      JOIN public.schedules s ON e.schedule_id = s.id
      WHERE s.professor_id = auth.uid()
    )
    OR public.get_my_role() = 'admin'
  );

CREATE POLICY "attendance_manage_professor_admin"
  ON public.attendance FOR ALL TO authenticated
  USING (
    enrollment_id IN (
      SELECT e.id FROM public.enrollments e
      JOIN public.schedules s ON e.schedule_id = s.id
      WHERE s.professor_id = auth.uid()
    )
    OR public.get_my_role() = 'admin'
  )
  WITH CHECK (
    enrollment_id IN (
      SELECT e.id FROM public.enrollments e
      JOIN public.schedules s ON e.schedule_id = s.id
      WHERE s.professor_id = auth.uid()
    )
    OR public.get_my_role() = 'admin'
  );

-- 7. ASSIGNMENTS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignments_select"
  ON public.assignments FOR SELECT TO authenticated
  USING (
    public.is_enrolled_in_schedule(schedule_id)
    OR public.is_schedule_professor(schedule_id)
    OR public.get_my_role() = 'admin'
  );

CREATE POLICY "assignments_manage_professor_admin"
  ON public.assignments FOR ALL TO authenticated
  USING (
    public.is_schedule_professor(schedule_id)
    OR public.get_my_role() = 'admin'
  )
  WITH CHECK (
    public.is_schedule_professor(schedule_id)
    OR public.get_my_role() = 'admin'
  );

-- 8. SUBMISSIONS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_select"
  ON public.submissions FOR SELECT TO authenticated
  USING (
    learner_id = auth.uid()
    OR assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.schedules s ON a.schedule_id = s.id
      WHERE s.professor_id = auth.uid()
    )
    OR public.get_my_role() = 'admin'
  );

CREATE POLICY "submissions_insert_learner"
  ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (
    learner_id = auth.uid()
    AND grade IS NULL
    AND feedback IS NULL
    AND graded_at IS NULL
    AND assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.enrollments e ON a.schedule_id = e.schedule_id
      WHERE e.learner_id = auth.uid() AND e.status IN ('enrolled', 'completed')
    )
  );

CREATE POLICY "submissions_update_learner_ungraded"
  ON public.submissions FOR UPDATE TO authenticated
  USING (learner_id = auth.uid() AND grade IS NULL)
  WITH CHECK (learner_id = auth.uid() AND grade IS NULL);

CREATE POLICY "submissions_grade_professor_admin"
  ON public.submissions FOR UPDATE TO authenticated
  USING (
    assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.schedules s ON a.schedule_id = s.id
      WHERE s.professor_id = auth.uid()
    )
    OR public.get_my_role() = 'admin'
  )
  WITH CHECK (
    assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.schedules s ON a.schedule_id = s.id
      WHERE s.professor_id = auth.uid()
    )
    OR public.get_my_role() = 'admin'
  );

-- 9. MATERIALS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materials_select"
  ON public.materials FOR SELECT TO authenticated
  USING (
    public.is_enrolled_in_schedule(schedule_id)
    OR public.is_schedule_professor(schedule_id)
    OR public.get_my_role() = 'admin'
  );

CREATE POLICY "materials_manage_professor_admin"
  ON public.materials FOR ALL TO authenticated
  USING (
    public.is_schedule_professor(schedule_id)
    OR public.get_my_role() = 'admin'
  )
  WITH CHECK (
    public.is_schedule_professor(schedule_id)
    OR public.get_my_role() = 'admin'
  );

-- 10. VIDEOS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "videos_select_authenticated"
  ON public.videos FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "videos_insert_professor_admin"
  ON public.videos FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('professor', 'admin'));

CREATE POLICY "videos_update_author_admin"
  ON public.videos FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid() OR public.get_my_role() = 'admin')
  WITH CHECK (uploaded_by = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "videos_delete_author_admin"
  ON public.videos FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.get_my_role() = 'admin');

-- 11. ANNOUNCEMENTS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_select"
  ON public.announcements FOR SELECT TO authenticated, anon
  USING (
    schedule_id IS NULL 
    OR public.is_enrolled_in_schedule(schedule_id)
    OR public.is_schedule_professor(schedule_id)
    OR public.get_my_role() = 'admin'
  );

CREATE POLICY "announcements_insert"
  ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      (schedule_id IS NOT NULL AND public.is_schedule_professor(schedule_id))
      OR public.get_my_role() = 'admin'
    )
  );

CREATE POLICY "announcements_manage"
  ON public.announcements FOR ALL TO authenticated
  USING (author_id = auth.uid() OR public.get_my_role() = 'admin')
  WITH CHECK (author_id = auth.uid() OR public.get_my_role() = 'admin');

-- 12. MESSAGES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_parties"
  ON public.messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "messages_insert_sender"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_update_read_receiver"
  ON public.messages FOR UPDATE TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- 13. NEWS & EVENTS
ALTER TABLE public.news_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_events_select_public"
  ON public.news_events FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "news_events_admin_all"
  ON public.news_events FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- 14. PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_public"
  ON public.products FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "products_admin_all"
  ON public.products FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');
