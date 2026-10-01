-- =====================================================================
-- FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
-- SQLite Seed Data
-- =====================================================================

-- 1. Profiles
INSERT OR REPLACE INTO profiles (id, name, email, role, bio) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Maria Elena Santos', 'admin@fsl.edu.ph', 'admin', 'Director of Deaf Community Programs, SDEAS Affiliation.'),
  ('b0000000-0000-0000-0000-000000000001', 'Rommel Agravante', 'prof.rommel@fsl.edu.ph', 'professor', 'Native Deaf FSL Master Teacher with 15+ years experience.'),
  ('b0000000-0000-0000-0000-000000000002', 'Liza Flores', 'prof.liza@fsl.edu.ph', 'professor', 'Senior Sign Language Interpreter Trainer and FSL Lecturer.'),
  ('c0000000-0000-0000-0000-000000000001', 'Juan Dela Cruz', 'learner.juan@fsl.edu.ph', 'learner', 'Enthusiastic beginner eager to communicate effectively with Deaf friends.'),
  ('c0000000-0000-0000-0000-000000000002', 'Maria Clara Bautista', 'learner.maria@fsl.edu.ph', 'learner', 'Level 2 intermediate learner supporting community accessibility.'),
  ('c0000000-0000-0000-0000-000000000003', 'Bea Alonzo', 'learner.bea@fsl.edu.ph', 'learner', 'Advanced learner preparing for the BSLI degree program.');

-- 2. Workshops
INSERT OR REPLACE INTO workshops (id, level, title, fee, description) VALUES
  ('d0000000-0000-0000-0000-000000000001', 1, 'FSL Level 1: Foundations & Visual Gestural Communication', 1500.00, 'Introduction to Deaf culture, visual-gestural communication, the FSL manual alphabet, numbers, and basic greetings.'),
  ('d0000000-0000-0000-0000-000000000002', 2, 'FSL Level 2: Grammar, Classifiers & Discourse', 2000.00, 'Spatial grammar, non-manual signals, descriptive classifiers, and everyday conversational exchanges.'),
  ('d0000000-0000-0000-0000-000000000003', 3, 'FSL Level 3: Advanced Fluency & Cultural Immersion', 2500.00, 'Advanced fluency, complex storytelling, idiomatic expressions, and preparation for BSLI.');

-- 3. Schedules
INSERT OR REPLACE INTO schedules (id, workshop_id, professor_id, day_time, slots, meeting_link) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Saturdays 09:00 AM - 12:00 PM', 18, 'https://meet.google.com/fsl-lvl1-sat'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Sundays 01:00 PM - 04:00 PM', 14, 'https://meet.google.com/fsl-lvl2-sun'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Wednesdays 06:00 PM - 09:00 PM', 12, 'https://meet.google.com/fsl-lvl3-wed');

-- 4. Enrollments
INSERT OR REPLACE INTO enrollments (id, learner_id, schedule_id, status) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'pending'),
  ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'enrolled'),
  ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'enrolled');

-- 5. Payments
INSERT OR REPLACE INTO payments (id, enrollment_id, amount, status, reference_no, payment_method) VALUES
  ('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 1500.00, 'pending', 'PAY-SIM-20261001-001', 'GCash Simulated'),
  ('10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 2000.00, 'verified', 'PAY-SIM-20261001-002', 'Maya Simulated'),
  ('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003', 2500.00, 'verified', 'PAY-SIM-20261001-003', 'Bank Transfer Simulated');

-- 6. Attendance
INSERT OR REPLACE INTO attendance (id, enrollment_id, date, present, remarks) VALUES
  ('20000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', date('now', '-7 days'), 1, 'Punctual and active in discussions'),
  ('20000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000003', date('now', '-7 days'), 1, 'Excellent signing accuracy');

-- 7. Assignments
INSERT OR REPLACE INTO assignments (id, schedule_id, title, description, due_date) VALUES
  ('30000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Self-Introduction Video (Manual Alphabet & Greetings)', 'Record a 2-minute video introducing yourself using the FSL alphabet and greetings.', datetime('now', '+7 days')),
  ('30000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'Classifier Dialogue Demonstration', 'Demonstrate 3 locative and descriptive classifiers in a conversational dialogue.', datetime('now', '+5 days'));

-- 8. Submissions
INSERT OR REPLACE INTO submissions (id, assignment_id, learner_id, file_url, grade, feedback, graded_at) VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'https://youtube.com/watch?v=demo-submission-fsl2', 94.50, 'Great use of non-manual markers and facial expressions!', datetime('now', '-1 day'));

-- 9. Materials
INSERT OR REPLACE INTO materials (id, schedule_id, title, file_url, description) VALUES
  ('50000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'FSL Alphabet and Numbers Study Chart (PDF)', 'https://example.com/materials/fsl-chart.pdf', 'High-contrast visual reference chart for fingerspelling and numbering.'),
  ('50000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'Spatial Grammar Handout (PDF)', 'https://example.com/materials/fsl-spatial-grammar.pdf', 'Guide to signing space and indexing.');

-- 10. Videos (6 Grounded Categories)
INSERT OR REPLACE INTO videos (id, level, title, category, video_url, description) VALUES
  ('60000000-0000-0000-0000-000000000001', 1, 'FSL Manual Alphabet A-Z Demonstration', 'Alphabet / Fingerspelling', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Clear, front-facing tutorial for handshapes A through Z.'),
  ('60000000-0000-0000-0000-000000000002', 1, 'Basic Greetings and Deaf Etiquette', 'Basic Greetings', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'How to sign Good Morning, Thank You, and Hello properly.'),
  ('60000000-0000-0000-0000-000000000003', 1, 'Number Systems 1-100 in FSL', 'Numbers', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Cardinal and ordinal numbers explained with proper palm orientation.'),
  ('60000000-0000-0000-0000-000000000004', 2, 'Common Expressions in Everyday Deaf Discourse', 'Common Expressions', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Idioms and frequent expressions used in the Filipino Deaf community.'),
  ('60000000-0000-0000-0000-000000000005', 2, 'Everyday Conversations: Directions & Commuting', 'Everyday Conversations', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Practical dialogue for asking directions in Manila.'),
  ('60000000-0000-0000-0000-000000000006', 3, 'Specialized Vocabulary: Emergency & Medical Signs', 'Vocabulary Lessons', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Advanced vocabulary for emergency response and medical appointments.');

-- 11. Announcements
INSERT OR REPLACE INTO announcements (id, author_id, schedule_id, title, body) VALUES
  ('70000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Welcome to FSL Level 1!', 'Please review the alphabet chart before our upcoming session this Saturday.'),
  ('70000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', NULL, 'Upcoming Deaf Awareness Month Celebrations', 'All workshop participants are invited to attend the community festival.');

-- 12. Messages
INSERT OR REPLACE INTO messages (id, sender_id, receiver_id, body, read) VALUES
  ('80000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Good day Professor! Question regarding the handshape for letter P.', 1),
  ('80000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Hello Juan! Letter P has the thumb between index and middle, pointing downward. See tutorial video #1!', 0);

-- 13. News & Events
INSERT OR REPLACE INTO news_events (id, title, body, type, date, location) VALUES
  ('90000000-0000-0000-0000-000000000001', 'Benilde SDEAS Hosts Annual Deaf Festival 2026', 'A nationwide gathering celebrating Deaf culture, visual storytelling, and FSL advocacy.', 'deaf_festival', date('now', '+14 days'), 'Benilde Taft Campus & Virtual'),
  ('90000000-0000-0000-0000-000000000002', 'Republic Act 11106 Community Implementation Forum', 'Discussion on mandatory FSL in media and public service transactions.', 'sdeas_news', date('now', '+3 days'), 'Online via Zoom');

-- 14. Products
INSERT OR REPLACE INTO products (id, name, price, stock, description, category) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'FSL I Love You Handshape Shirt (Black/White)', 450.00, 35, '100% premium cotton tee featuring high-contrast ILY sign art.', 'Apparel'),
  ('a1000000-0000-0000-0000-000000000002', 'FSL Manual Alphabet Heavy Canvas Tote Bag', 320.00, 50, 'Heavy-duty eco canvas tote featuring the complete FSL A-Z alphabet.', 'Bags'),
  ('a1000000-0000-0000-0000-000000000003', 'Deaf Pride Fingerspelling Enamel Pin Collection', 180.00, 80, 'Gold-plated hard enamel pin with clutch backing.', 'Accessories');
