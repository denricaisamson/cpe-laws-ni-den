-- =====================================================================
-- FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
-- Seed Dataset: Authentic Demo Data Grounded in FSL_SPEC.md
-- File: supabase/seed.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PROFILES & AUTH USERS (6 Demo Accounts)
-- ---------------------------------------------------------------------
-- Seed auth.users if auth schema is present (Supabase environment)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES
      ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@fsl.edu.ph', crypt('admin123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Maria Elena Santos","role":"admin"}', now(), now()),
      ('b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'prof.rommel@fsl.edu.ph', crypt('prof123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Rommel Agravante","role":"professor"}', now(), now()),
      ('b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'prof.liza@fsl.edu.ph', crypt('prof123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Liza Flores","role":"professor"}', now(), now()),
      ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'learner.juan@fsl.edu.ph', crypt('learner123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Juan Dela Cruz","role":"learner"}', now(), now()),
      ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'learner.maria@fsl.edu.ph', crypt('learner123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Maria Clara Bautista","role":"learner"}', now(), now()),
      ('c0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'learner.bea@fsl.edu.ph', crypt('learner123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Bea Alonzo","role":"learner"}', now(), now())
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

INSERT INTO public.profiles (id, name, email, role, bio)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Maria Elena Santos',
    'admin@fsl.edu.ph',
    'admin',
    'Director of Deaf Community Programs, SDEAS Affiliation. Advocate for Deaf empowerment and FSL education.'
  ),
  (
    'b0000000-0000-0000-0000-000000000001',
    'Rommel Agravante',
    'prof.rommel@fsl.edu.ph',
    'professor',
    'Native Deaf FSL Master Teacher with 15+ years of teaching Deaf culture, visual-gestural communication, and signing syntax.'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Liza Flores',
    'prof.liza@fsl.edu.ph',
    'professor',
    'Senior Sign Language Interpreter Trainer and FSL Linguistics Lecturer specializing in classifiers and community discourse.'
  ),
  (
    'c0000000-0000-0000-0000-000000000001',
    'Juan Dela Cruz',
    'learner.juan@fsl.edu.ph',
    'learner',
    'Enthusiastic beginner eager to communicate effectively with Deaf colleagues and community friends.'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'Maria Clara Bautista',
    'learner.maria@fsl.edu.ph',
    'learner',
    'Level 2 intermediate learner aiming to support inclusive community ministries and accessible services.'
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'Bea Alonzo',
    'learner.bea@fsl.edu.ph',
    'learner',
    'Advanced learner preparing for the Bachelor in Sign Language Interpretation (BSLI) degree program.'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  bio = EXCLUDED.bio;

-- ---------------------------------------------------------------------
-- 2. WORKSHOPS (FSL Levels 1, 2, 3)
-- ---------------------------------------------------------------------
INSERT INTO public.workshops (id, level, title, fee, description)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    1,
    'FSL Level 1: Foundations & Visual Gestural Communication',
    1500.00,
    'Comprehensive introduction to Deaf culture, visual-gestural communication, the FSL manual alphabet, number systems, survival vocabulary, and basic conversational etiquette.'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    2,
    'FSL Level 2: Grammar, Classifiers & Discourse',
    2000.00,
    'Deep dive into spatial grammar, non-manual signals (facial expressions), descriptive and locative classifiers, role-shifting, and everyday conversational exchanges.'
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    3,
    'FSL Level 3: Advanced Fluency & Cultural Immersion',
    2500.00,
    'Advanced conversational mastery, complex storytelling, idiomatic FSL expressions, community register variation, and preparatory readiness for BSLI and professional interpreting.'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  fee = EXCLUDED.fee,
  description = EXCLUDED.description;

-- ---------------------------------------------------------------------
-- 3. SCHEDULES (4 Batches with Meeting Links)
-- ---------------------------------------------------------------------
INSERT INTO public.schedules (id, workshop_id, professor_id, day_time, slots, meeting_link)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Saturdays 09:00 AM - 12:00 PM',
    20,
    'https://meet.google.com/fsl-lev1-sat'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'Mon/Wed 06:00 PM - 07:30 PM',
    20,
    'https://meet.google.com/fsl-lev1-eve'
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Saturdays 01:00 PM - 04:00 PM',
    18,
    'https://meet.google.com/fsl-lev2-sat'
  ),
  (
    'e0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000002',
    'Sundays 09:00 AM - 12:00 PM',
    15,
    'https://meet.google.com/fsl-lev3-sun'
  )
ON CONFLICT (id) DO UPDATE SET
  day_time = EXCLUDED.day_time,
  slots = EXCLUDED.slots,
  meeting_link = EXCLUDED.meeting_link;

-- ---------------------------------------------------------------------
-- 4. ENROLLMENTS (5 Records Covering Enrolled, Completed, Pending)
-- ---------------------------------------------------------------------
INSERT INTO public.enrollments (id, learner_id, schedule_id, status)
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'enrolled'
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000003',
    'enrolled'
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000003',
    'e0000000-0000-0000-0000-000000000004',
    'enrolled'
  ),
  (
    'f0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000001',
    'completed'
  ),
  (
    'f0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000002',
    'pending'
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

-- ---------------------------------------------------------------------
-- 5. PAYMENTS (Verified and Pending Demonstrating Simulated Workflow)
-- ---------------------------------------------------------------------
INSERT INTO public.payments (id, enrollment_id, amount, status, date, reference_no, payment_method)
VALUES
  (
    '90000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    1500.00,
    'verified',
    now() - INTERVAL '20 days',
    'PAY-2026-FSL101',
    'GCash / Simulated Transfer'
  ),
  (
    '90000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000002',
    2000.00,
    'verified',
    now() - INTERVAL '15 days',
    'PAY-2026-FSL202',
    'Maya / Simulated Transfer'
  ),
  (
    '90000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000003',
    2500.00,
    'verified',
    now() - INTERVAL '10 days',
    'PAY-2026-FSL303',
    'Online Bank Transfer'
  ),
  (
    '90000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000004',
    1500.00,
    'verified',
    now() - INTERVAL '120 days',
    'PAY-2025-FSL099',
    'GCash / Simulated Transfer'
  ),
  (
    '90000000-0000-0000-0000-000000000005',
    'f0000000-0000-0000-0000-000000000005',
    1500.00,
    'pending',
    now() - INTERVAL '1 hour',
    'PAY-2026-SIM-PENDING',
    'GCash / Simulated Transfer'
  )
ON CONFLICT (id) DO UPDATE SET
  amount = EXCLUDED.amount,
  status = EXCLUDED.status;

-- ---------------------------------------------------------------------
-- 6. ATTENDANCE (Session Records)
-- ---------------------------------------------------------------------
INSERT INTO public.attendance (id, enrollment_id, date, present, remarks)
VALUES
  (
    '80000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '21 days',
    true,
    'Punctual; active camera engagement'
  ),
  (
    '80000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '14 days',
    true,
    'Good signing posture and hand positioning'
  ),
  (
    '80000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '7 days',
    false,
    'Excused due to scheduled work shift'
  ),
  (
    '80000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000001',
    CURRENT_DATE,
    true,
    'Participated actively in group fingerspelling drill'
  )
ON CONFLICT (id) DO UPDATE SET
  present = EXCLUDED.present,
  remarks = EXCLUDED.remarks;

-- ---------------------------------------------------------------------
-- 7. ASSIGNMENTS
-- ---------------------------------------------------------------------
INSERT INTO public.assignments (id, schedule_id, title, description, due_date)
VALUES
  (
    '70000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'Video Submission: Introduce Yourself and Fingerspell Your Hometown',
    'Record a 60-90 second video in FSL introducing yourself, stating your name via fingerspelling, your hometown, and 3 things you enjoy doing. Keep hand movements within the standard signing space.',
    now() + INTERVAL '7 days'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000003',
    'Classifier Story: Vehicle Incident Narrative',
    'Using CL:3 (vehicles) and CL:1 (pedestrians), narrate a 2-minute incident showing spatial arrangement and non-manual facial markers.',
    now() + INTERVAL '5 days'
  ),
  (
    '70000000-0000-0000-0000-000000000003',
    'e0000000-0000-0000-0000-000000000004',
    'Live Broadcast Interpretation Discourse Analysis',
    'Review a recorded national news broadcast with FSL inset interpretation and submit an analytical critique on cultural adaptations and register shifts.',
    now() + INTERVAL '10 days'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  due_date = EXCLUDED.due_date;

-- ---------------------------------------------------------------------
-- 8. SUBMISSIONS (With Grades and Feedback)
-- ---------------------------------------------------------------------
INSERT INTO public.submissions (id, assignment_id, learner_id, file_url, grade, feedback, submitted_at, graded_at)
VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'https://www.youtube.com/watch?v=36GlmDTYs6s&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=1',
    95.00,
    'Clear hand configuration and great eye contact. Make sure to keep the palm facing forward during the letters K and P.',
    now() - INTERVAL '3 days',
    now() - INTERVAL '1 day'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '70000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'https://www.youtube.com/watch?v=0aeMv3ihAA4&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=4',
    92.00,
    'Terrific spatial mapping and role shifting. Pay close attention to timing when alternating characters.',
    now() - INTERVAL '2 days',
    now() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO UPDATE SET
  grade = EXCLUDED.grade,
  feedback = EXCLUDED.feedback;

-- ---------------------------------------------------------------------
-- 9. MATERIALS
-- ---------------------------------------------------------------------
INSERT INTO public.materials (id, schedule_id, title, file_url, description)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'FSL Manual Alphabet & Number Handshapes Reference Chart',
    'https://example.com/materials/fsl_alphabet_chart.pdf',
    'High-resolution diagram illustrating all 26 manual alphabet handshapes and palm orientations.'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000001',
    'Visual Gestural Communication & Deaf Etiquette Primer',
    'https://example.com/materials/deaf_etiquette_guide.pdf',
    'Essential cultural etiquette when interacting with Deaf individuals in academic and daily settings.'
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    'e0000000-0000-0000-0000-000000000003',
    'FSL Classifiers (CL:1, CL:3, CL:V, CL:B, CL:C) Comprehensive Handout',
    'https://example.com/materials/fsl_classifiers_handout.pdf',
    'Reference compendium detailing handshapes, motion paths, and referent mapping for classifiers.'
  ),
  (
    '50000000-0000-0000-0000-000000000004',
    'e0000000-0000-0000-0000-000000000004',
    'BSLI Interpreting Code of Ethics and Professional Standards',
    'https://example.com/materials/bsli_interpreting_ethics.pdf',
    'Ethical guidelines, neutrality standards, and confidentiality requirements for FSL interpreters.'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  file_url = EXCLUDED.file_url;

-- ---------------------------------------------------------------------
-- 10. VIDEOS (Strict 6 Categories from FSL_SPEC.md)
-- ---------------------------------------------------------------------
INSERT INTO public.videos (id, level, title, category, video_url, uploaded_by, description)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    1,
    'Basic Filipino Sign Language Tutorial (Part 1)',
    'Common Expressions',
    'https://www.youtube.com/watch?v=36GlmDTYs6s&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=1',
    'b0000000-0000-0000-0000-000000000001',
    'Foundational introduction to Filipino Sign Language expressions, basic hand shapes, and visual gestures.'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    1,
    'Alphabet (Alpabetong) Filipino Sign Language Tutorial',
    'Alphabet / Fingerspelling',
    'https://www.youtube.com/watch?v=iYpTJ5cEl9Y&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=2',
    'b0000000-0000-0000-0000-000000000001',
    'Comprehensive demonstration of all 26 letters of the Filipino Sign Language manual alphabet with front and profile views.'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    1,
    'Basic Filipino Sign Language Tutorial (Part 2)',
    'Common Expressions',
    'https://www.youtube.com/watch?v=e6MYgcbUKqQ&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=3',
    'b0000000-0000-0000-0000-000000000001',
    'Continuing practice for essential survival expressions, questions, and polite conversation markers.'
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    1,
    'Meet and Greet Filipino Sign Language Tutorial',
    'Basic Greetings',
    'https://www.youtube.com/watch?v=0aeMv3ihAA4&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=4',
    'b0000000-0000-0000-0000-000000000001',
    'Meeting someone for the first time, introducing yourself, and exchanging greetings in FSL.'
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    2,
    'Family Signs in Filipino Sign Language Tutorial',
    'Everyday Conversations',
    'https://www.youtube.com/watch?v=BVMaquZJGOM&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=5',
    'b0000000-0000-0000-0000-000000000002',
    'Signs representing family members, relatives, and conversational domestic relationships.'
  ),
  (
    '40000000-0000-0000-0000-000000000006',
    1,
    'Number and Ordinal Numbers Filipino Sign Language Tutorial',
    'Numbers',
    'https://www.youtube.com/watch?v=Wl-pkKk82Nc&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=6',
    'b0000000-0000-0000-0000-000000000002',
    'Clear demonstration of cardinal numbers, ordinal numbers, and palm orientation rules in FSL.'
  ),
  (
    '40000000-0000-0000-0000-000000000007',
    1,
    'Basic Greetings in Filipino Sign Language Tutorial',
    'Basic Greetings',
    'https://www.youtube.com/watch?v=QwmhjIKL2jI&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=7',
    'b0000000-0000-0000-0000-000000000001',
    'Essential morning, afternoon, and evening greetings and visual politeness markers used daily.'
  ),
  (
    '40000000-0000-0000-0000-000000000008',
    2,
    'Conversational Turn-Taking & Greetings Drill',
    'Everyday Conversations',
    'https://www.youtube.com/watch?v=QwmhjIKL2jI&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=8',
    'b0000000-0000-0000-0000-000000000002',
    'Deaf conversational exchange demonstrating turn-taking, pauses, and visual attention-getting techniques.'
  ),
  (
    '40000000-0000-0000-0000-000000000009',
    2,
    'Weather (Panahon) Filipino Sign Language Tutorial',
    'Vocabulary Lessons',
    'https://www.youtube.com/watch?v=vshlTKwNLgw&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=9',
    'b0000000-0000-0000-0000-000000000002',
    'Vocabulary signs for weather conditions, climate, seasons, and natural elements.'
  ),
  (
    '40000000-0000-0000-0000-000000000010',
    3,
    'Color (Kulay) Filipino Sign Language Tutorial',
    'Vocabulary Lessons',
    'https://www.youtube.com/watch?v=ePeYEEG3wzQ&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=14',
    'b0000000-0000-0000-0000-000000000002',
    'Masterclass and vocabulary lessons covering primary and secondary colors and descriptive signing.'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  video_url = EXCLUDED.video_url;

-- ---------------------------------------------------------------------
-- 11. ANNOUNCEMENTS
-- ---------------------------------------------------------------------
INSERT INTO public.announcements (id, author_id, schedule_id, title, body)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'Orientation & Zoom Lighting Guidelines for Session 1',
    'Welcome to Batch 2026-A! Please ensure your room has solid lighting in front of you (not behind) so handshapes and facial markers are clearly visible on camera.'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000003',
    'Classifier Practice Video Links Posted in Learning Hub',
    'Please review the new tutorial videos in the Learning Hub before Saturday''s laboratory exercise on vehicle and person classifier movements.'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    'Annual Benilde Deaf Festival 2026 Registration Open to All Enrolled Learners',
    'All students across Levels 1-3 are warmly invited to join the upcoming Deaf Festival cultural exhibits and signing poetry workshops.'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body;

-- ---------------------------------------------------------------------
-- 12. MESSAGES (Direct Messages Between Learner and Professor)
-- ---------------------------------------------------------------------
INSERT INTO public.messages (id, sender_id, receiver_id, body, read)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Good day, Teacher Rommel! I had a quick question regarding the sign for "Cavite". Is it signed with a C-handshape near the cheek or fingerspelled?',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Hello Juan! In official FSL, it is commonly signed with the "C" hand tapping the cheek, followed by local variations. I will demonstrate it during our warm-up this Saturday!',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'Hi Teacher Liza, thank you for the feedback on my classifier video! I will practice my non-manual facial markers for the upcoming evaluation.',
    false
  )
ON CONFLICT (id) DO UPDATE SET
  body = EXCLUDED.body,
  read = EXCLUDED.read;

-- ---------------------------------------------------------------------
-- 13. NEWS & EVENTS (4 Items Grounded in SDEAS, Deaf Festival, BSLI)
-- ---------------------------------------------------------------------
INSERT INTO public.news_events (id, title, body, type, date, location)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'Annual Benilde Deaf Festival 2026: Celebrating Deaf Arts, Visual Music & FSL Heritage',
    'Join us for the premier Deaf cultural celebration in the Philippines featuring Deaf visual artists, signing choir performances, and community panel discussions.',
    'event',
    CURRENT_DATE + INTERVAL '15 days',
    'DLS-CSB SDEAS Campus, Taft Ave., Manila'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'SDEAS Marks Over 30 Years of Pioneering Deaf Higher Education and FSL Advocacy',
    'De La Salle-College of Saint Benilde SDEAS reaffirms its mission of empowering Deaf leaders and advancing the national implementation of the Filipino Sign Language Act (RA 11106).',
    'news',
    CURRENT_DATE - INTERVAL '8 days',
    'School of Deaf Education and Applied Studies'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Now Accepting Applications: Bachelor in Sign Language Interpretation (BSLI) AY 2027',
    'Graduates of FSL Level 3 who demonstrate strong linguistic competency are eligible to apply for the prestigious BSLI degree program.',
    'opportunity',
    CURRENT_DATE + INTERVAL '30 days',
    'Benilde SDEAS Admissions'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'National Council on Disability Affairs (NCDA) Commends FSL Act Compliance in Broadcast Media',
    'Public and private broadcast stations continue expanding inset FSL interpretation during emergency advisories and national news broadcasts.',
    'news',
    CURRENT_DATE - INTERVAL '18 days',
    'NCDA Philippines'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body;

-- ---------------------------------------------------------------------
-- 14. PRODUCTS (5 Merchandise Items Grounded in FSL_SPEC.md)
-- ---------------------------------------------------------------------
INSERT INTO public.products (id, name, price, stock, category, description)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Official "I Love FSL" Classic Cotton Shirt',
    450.00,
    45,
    'Shirts',
    'Premium navy blue combed cotton shirt with high-contrast white FSL handshape typography.'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Deaf Pride / Visual World Canvas Tote Bag',
    320.00,
    60,
    'Bags',
    'Durable 14oz canvas tote bag featuring Deaf artist illustrations and reinforced shoulder straps.'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'FSL Manual Alphabet Golden Enamel Pin Collection',
    150.00,
    120,
    'Pins',
    'Collector-grade gold-plated enamel pin depicting the iconic "I Love You" sign handshape.'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Sign Language Awareness Silicone Wristband Set',
    80.00,
    85,
    'Accessories',
    'High-contrast debossed wristband set with "Filipino Sign Language Matters" motto.'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Philippine FSL Pocket Dictionary & Quick Reference Guide',
    550.00,
    30,
    'Books',
    'Spiral-bound, water-resistant field handbook containing 800+ essential FSL signs with illustration diagrams.'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  description = EXCLUDED.description;
