// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Typed Mock Dataset (Matching supabase/seed.sql)
// File: src/lib/mock-data.ts
// =====================================================================

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
  ScheduleWithDetails,
  EnrollmentWithDetails,
  SubmissionWithLearner,
  AssignmentWithSubmissions,
  MessageWithProfiles,
} from '../types/database';

// ---------------------------------------------------------------------
// 1. PROFILES (6 Grounded Accounts: 1 Admin, 2 Professors, 3 Learners)
// ---------------------------------------------------------------------
export const mockProfiles: Profile[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Maria Elena Santos',
    email: 'admin@fsl.edu.ph',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Director of Deaf Community Programs, SDEAS Affiliation. Advocate for Deaf empowerment and FSL education.',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Rommel Agravante',
    email: 'prof.rommel@fsl.edu.ph',
    role: 'professor',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Native Deaf FSL Master Teacher with 15+ years of teaching Deaf culture, visual-gestural communication, and signing syntax.',
    created_at: '2026-01-05T08:00:00Z',
    updated_at: '2026-01-05T08:00:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Liza Flores',
    email: 'prof.liza@fsl.edu.ph',
    role: 'professor',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Senior Sign Language Interpreter Trainer and FSL Linguistics Lecturer specializing in classifiers and community discourse.',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Juan Dela Cruz',
    email: 'learner.juan@fsl.edu.ph',
    role: 'learner',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Enthusiastic beginner eager to communicate effectively with Deaf colleagues and community friends.',
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-02-01T08:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Maria Clara Bautista',
    email: 'learner.maria@fsl.edu.ph',
    role: 'learner',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Level 2 intermediate learner aiming to support inclusive community ministries and accessible services.',
    created_at: '2026-02-10T08:00:00Z',
    updated_at: '2026-02-10T08:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Bea Alonzo',
    email: 'learner.bea@fsl.edu.ph',
    role: 'learner',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Advanced learner preparing for the Bachelor in Sign Language Interpretation (BSLI) degree program.',
    created_at: '2026-02-15T08:00:00Z',
    updated_at: '2026-02-15T08:00:00Z',
  },
];

// ---------------------------------------------------------------------
// 2. WORKSHOPS (FSL Levels 1, 2, 3)
// ---------------------------------------------------------------------
export const mockWorkshops: Workshop[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    level: 1,
    title: 'FSL Level 1: Foundations & Visual Gestural Communication',
    fee: 1500.00,
    description: 'Comprehensive introduction to Deaf culture, visual-gestural communication, the FSL manual alphabet, number systems, survival vocabulary, and basic conversational etiquette.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    level: 2,
    title: 'FSL Level 2: Grammar, Classifiers & Discourse',
    fee: 2000.00,
    description: 'Deep dive into spatial grammar, non-manual signals (facial expressions), descriptive and locative classifiers, role-shifting, and everyday conversational exchanges.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    level: 3,
    title: 'FSL Level 3: Advanced Fluency & Cultural Immersion',
    fee: 2500.00,
    description: 'Advanced conversational mastery, complex storytelling, idiomatic FSL expressions, community register variation, and preparatory readiness for BSLI and professional interpreting.',
    created_at: '2026-01-01T00:00:00Z',
  },
];

// ---------------------------------------------------------------------
// 3. SCHEDULES (4 Batches with Meeting Links)
// ---------------------------------------------------------------------
export const mockSchedules: Schedule[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    workshop_id: 'd0000000-0000-0000-0000-000000000001',
    professor_id: 'b0000000-0000-0000-0000-000000000001',
    day_time: 'Saturdays 09:00 AM - 12:00 PM',
    slots: 20,
    meeting_link: 'https://meet.google.com/fsl-lev1-sat',
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    workshop_id: 'd0000000-0000-0000-0000-000000000001',
    professor_id: 'b0000000-0000-0000-0000-000000000002',
    day_time: 'Mon/Wed 06:00 PM - 07:30 PM',
    slots: 20,
    meeting_link: 'https://meet.google.com/fsl-lev1-eve',
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    workshop_id: 'd0000000-0000-0000-0000-000000000002',
    professor_id: 'b0000000-0000-0000-0000-000000000001',
    day_time: 'Saturdays 01:00 PM - 04:00 PM',
    slots: 18,
    meeting_link: 'https://meet.google.com/fsl-lev2-sat',
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000004',
    workshop_id: 'd0000000-0000-0000-0000-000000000003',
    professor_id: 'b0000000-0000-0000-0000-000000000002',
    day_time: 'Sundays 09:00 AM - 12:00 PM',
    slots: 15,
    meeting_link: 'https://meet.google.com/fsl-lev3-sun',
    created_at: '2026-01-15T00:00:00Z',
  },
];

// ---------------------------------------------------------------------
// 4. ENROLLMENTS
// ---------------------------------------------------------------------
export const mockEnrollments: Enrollment[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    learner_id: 'c0000000-0000-0000-0000-000000000001',
    schedule_id: 'e0000000-0000-0000-0000-000000000001',
    status: 'enrolled',
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-09-02T10:00:00Z',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    learner_id: 'c0000000-0000-0000-0000-000000000002',
    schedule_id: 'e0000000-0000-0000-0000-000000000003',
    status: 'enrolled',
    created_at: '2026-09-03T09:00:00Z',
    updated_at: '2026-09-04T11:00:00Z',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    learner_id: 'c0000000-0000-0000-0000-000000000003',
    schedule_id: 'e0000000-0000-0000-0000-000000000004',
    status: 'enrolled',
    created_at: '2026-09-05T10:00:00Z',
    updated_at: '2026-09-06T12:00:00Z',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    learner_id: 'c0000000-0000-0000-0000-000000000002',
    schedule_id: 'e0000000-0000-0000-0000-000000000001',
    status: 'completed',
    created_at: '2025-05-01T08:00:00Z',
    updated_at: '2025-08-30T10:00:00Z',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    learner_id: 'c0000000-0000-0000-0000-000000000001',
    schedule_id: 'e0000000-0000-0000-0000-000000000002',
    status: 'pending',
    created_at: '2026-09-28T07:00:00Z',
    updated_at: '2026-09-28T07:00:00Z',
  },
];

// ---------------------------------------------------------------------
// 5. PAYMENTS
// ---------------------------------------------------------------------
export const mockPayments: Payment[] = [
  {
    id: '90000000-0000-0000-0000-000000000001',
    enrollment_id: 'f0000000-0000-0000-0000-000000000001',
    amount: 1500.00,
    status: 'verified',
    date: '2026-09-02T09:30:00Z',
    reference_no: 'PAY-2026-FSL101',
    payment_method: 'GCash / Simulated Transfer',
    created_at: '2026-09-02T09:30:00Z',
  },
  {
    id: '90000000-0000-0000-0000-000000000002',
    enrollment_id: 'f0000000-0000-0000-0000-000000000002',
    amount: 2000.00,
    status: 'verified',
    date: '2026-09-04T10:15:00Z',
    reference_no: 'PAY-2026-FSL202',
    payment_method: 'Maya / Simulated Transfer',
    created_at: '2026-09-04T10:15:00Z',
  },
  {
    id: '90000000-0000-0000-0000-000000000003',
    enrollment_id: 'f0000000-0000-0000-0000-000000000003',
    amount: 2500.00,
    status: 'verified',
    date: '2026-09-06T11:45:00Z',
    reference_no: 'PAY-2026-FSL303',
    payment_method: 'Online Bank Transfer',
    created_at: '2026-09-06T11:45:00Z',
  },
  {
    id: '90000000-0000-0000-0000-000000000004',
    enrollment_id: 'f0000000-0000-0000-0000-000000000004',
    amount: 1500.00,
    status: 'verified',
    date: '2025-05-02T08:20:00Z',
    reference_no: 'PAY-2025-FSL099',
    payment_method: 'GCash / Simulated Transfer',
    created_at: '2025-05-02T08:20:00Z',
  },
  {
    id: '90000000-0000-0000-0000-000000000005',
    enrollment_id: 'f0000000-0000-0000-0000-000000000005',
    amount: 1500.00,
    status: 'pending',
    date: '2026-09-28T07:15:00Z',
    reference_no: 'PAY-2026-SIM-PENDING',
    payment_method: 'GCash / Simulated Transfer',
    created_at: '2026-09-28T07:15:00Z',
  },
];

// ---------------------------------------------------------------------
// 6. ATTENDANCE
// ---------------------------------------------------------------------
export const mockAttendance: Attendance[] = [
  {
    id: '80000000-0000-0000-0000-000000000001',
    enrollment_id: 'f0000000-0000-0000-0000-000000000001',
    date: '2026-09-06',
    present: true,
    remarks: 'Punctual; active camera engagement',
    created_at: '2026-09-06T12:00:00Z',
  },
  {
    id: '80000000-0000-0000-0000-000000000002',
    enrollment_id: 'f0000000-0000-0000-0000-000000000001',
    date: '2026-09-13',
    present: true,
    remarks: 'Good signing posture and hand positioning',
    created_at: '2026-09-13T12:00:00Z',
  },
  {
    id: '80000000-0000-0000-0000-000000000003',
    enrollment_id: 'f0000000-0000-0000-0000-000000000001',
    date: '2026-09-20',
    present: false,
    remarks: 'Excused due to scheduled work shift',
    created_at: '2026-09-20T12:00:00Z',
  },
  {
    id: '80000000-0000-0000-0000-000000000004',
    enrollment_id: 'f0000000-0000-0000-0000-000000000001',
    date: '2026-09-27',
    present: true,
    remarks: 'Participated actively in group fingerspelling drill',
    created_at: '2026-09-27T12:00:00Z',
  },
];

// ---------------------------------------------------------------------
// 7. ASSIGNMENTS
// ---------------------------------------------------------------------
export const mockAssignments: Assignment[] = [
  {
    id: '70000000-0000-0000-0000-000000000001',
    schedule_id: 'e0000000-0000-0000-0000-000000000001',
    title: 'Video Submission: Introduce Yourself and Fingerspell Your Hometown',
    description: 'Record a 60-90 second video in FSL introducing yourself, stating your name via fingerspelling, your hometown, and 3 things you enjoy doing. Keep hand movements within the standard signing space.',
    due_date: '2026-10-05T23:59:59Z',
    created_at: '2026-09-20T08:00:00Z',
  },
  {
    id: '70000000-0000-0000-0000-000000000002',
    schedule_id: 'e0000000-0000-0000-0000-000000000003',
    title: 'Classifier Story: Vehicle Incident Narrative',
    description: 'Using CL:3 (vehicles) and CL:1 (pedestrians), narrate a 2-minute incident showing spatial arrangement and non-manual facial markers.',
    due_date: '2026-10-03T23:59:59Z',
    created_at: '2026-09-22T08:00:00Z',
  },
  {
    id: '70000000-0000-0000-0000-000000000003',
    schedule_id: 'e0000000-0000-0000-0000-000000000004',
    title: 'Live Broadcast Interpretation Discourse Analysis',
    description: 'Review a recorded national news broadcast with FSL inset interpretation and submit an analytical critique on cultural adaptations and register shifts.',
    due_date: '2026-10-08T23:59:59Z',
    created_at: '2026-09-25T08:00:00Z',
  },
];

// ---------------------------------------------------------------------
// 8. SUBMISSIONS
// ---------------------------------------------------------------------
export const mockSubmissions: Submission[] = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    assignment_id: '70000000-0000-0000-0000-000000000001',
    learner_id: 'c0000000-0000-0000-0000-000000000001',
    file_url: 'https://www.youtube.com/watch?v=36GlmDTYs6s&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=1',
    grade: 95.00,
    feedback: 'Clear hand configuration and great eye contact. Make sure to keep the palm facing forward during the letters K and P.',
    submitted_at: '2026-09-25T14:30:00Z',
    graded_at: '2026-09-27T10:00:00Z',
  },
  {
    id: '60000000-0000-0000-0000-000000000002',
    assignment_id: '70000000-0000-0000-0000-000000000002',
    learner_id: 'c0000000-0000-0000-0000-000000000002',
    file_url: 'https://www.youtube.com/watch?v=0aeMv3ihAA4&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=4',
    grade: 92.00,
    feedback: 'Terrific spatial mapping and role shifting. Pay close attention to timing when alternating characters.',
    submitted_at: '2026-09-26T16:00:00Z',
    graded_at: '2026-09-27T11:00:00Z',
  },
];

// ---------------------------------------------------------------------
// 9. MATERIALS
// ---------------------------------------------------------------------
export const mockMaterials: Material[] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    schedule_id: 'e0000000-0000-0000-0000-000000000001',
    title: 'FSL Manual Alphabet & Number Handshapes Reference Chart',
    file_url: 'https://example.com/materials/fsl_alphabet_chart.pdf',
    description: 'High-resolution diagram illustrating all 26 manual alphabet handshapes and palm orientations.',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    schedule_id: 'e0000000-0000-0000-0000-000000000001',
    title: 'Visual Gestural Communication & Deaf Etiquette Primer',
    file_url: 'https://example.com/materials/deaf_etiquette_guide.pdf',
    description: 'Essential cultural etiquette when interacting with Deaf individuals in academic and daily settings.',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: '50000000-0000-0000-0000-000000000003',
    schedule_id: 'e0000000-0000-0000-0000-000000000003',
    title: 'FSL Classifiers (CL:1, CL:3, CL:V, CL:B, CL:C) Comprehensive Handout',
    file_url: 'https://example.com/materials/fsl_classifiers_handout.pdf',
    description: 'Reference compendium detailing handshapes, motion paths, and referent mapping for classifiers.',
    created_at: '2026-09-03T08:00:00Z',
  },
  {
    id: '50000000-0000-0000-0000-000000000004',
    schedule_id: 'e0000000-0000-0000-0000-000000000004',
    title: 'BSLI Interpreting Code of Ethics and Professional Standards',
    file_url: 'https://example.com/materials/bsli_interpreting_ethics.pdf',
    description: 'Ethical guidelines, neutrality standards, and confidentiality requirements for FSL interpreters.',
    created_at: '2026-09-05T08:00:00Z',
  },
];

// ---------------------------------------------------------------------
// 10. VIDEOS (6 Exact Grounded Categories from FSL_SPEC.md)
// ---------------------------------------------------------------------
export const mockVideos: Video[] = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    level: 1,
    title: 'Basic Filipino Sign Language Tutorial (Part 1)',
    category: 'Common Expressions',
    video_url: 'https://www.youtube.com/watch?v=36GlmDTYs6s&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=1',
    uploaded_by: 'b0000000-0000-0000-0000-000000000001',
    description: 'Foundational introduction to Filipino Sign Language expressions, basic hand shapes, and visual gestures.',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    level: 1,
    title: 'Alphabet (Alpabetong) Filipino Sign Language Tutorial',
    category: 'Alphabet / Fingerspelling',
    video_url: 'https://www.youtube.com/watch?v=iYpTJ5cEl9Y&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=2',
    uploaded_by: 'b0000000-0000-0000-0000-000000000001',
    description: 'Comprehensive demonstration of all 26 letters of the Filipino Sign Language manual alphabet with front and profile views.',
    created_at: '2026-09-02T08:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    level: 1,
    title: 'Basic Filipino Sign Language Tutorial (Part 2)',
    category: 'Common Expressions',
    video_url: 'https://www.youtube.com/watch?v=e6MYgcbUKqQ&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=3',
    uploaded_by: 'b0000000-0000-0000-0000-000000000001',
    description: 'Continuing practice for essential survival expressions, questions, and polite conversation markers.',
    created_at: '2026-09-03T08:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    level: 1,
    title: 'Meet and Greet Filipino Sign Language Tutorial',
    category: 'Basic Greetings',
    video_url: 'https://www.youtube.com/watch?v=0aeMv3ihAA4&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=4',
    uploaded_by: 'b0000000-0000-0000-0000-000000000001',
    description: 'Meeting someone for the first time, introducing yourself, and exchanging greetings in FSL.',
    created_at: '2026-09-04T08:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    level: 2,
    title: 'Family Signs in Filipino Sign Language Tutorial',
    category: 'Everyday Conversations',
    video_url: 'https://www.youtube.com/watch?v=BVMaquZJGOM&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=5',
    uploaded_by: 'b0000000-0000-0000-0000-000000000002',
    description: 'Signs representing family members, relatives, and conversational domestic relationships.',
    created_at: '2026-09-05T08:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000006',
    level: 1,
    title: 'Number and Ordinal Numbers Filipino Sign Language Tutorial',
    category: 'Numbers',
    video_url: 'https://www.youtube.com/watch?v=Wl-pkKk82Nc&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=6',
    uploaded_by: 'b0000000-0000-0000-0000-000000000002',
    description: 'Clear demonstration of cardinal numbers, ordinal numbers, and palm orientation rules in FSL.',
    created_at: '2026-09-06T08:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000007',
    level: 1,
    title: 'Basic Greetings in Filipino Sign Language Tutorial',
    category: 'Basic Greetings',
    video_url: 'https://www.youtube.com/watch?v=QwmhjIKL2jI&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=7',
    uploaded_by: 'b0000000-0000-0000-0000-000000000001',
    description: 'Essential morning, afternoon, and evening greetings and visual politeness markers used daily.',
    created_at: '2026-09-07T08:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000008',
    level: 2,
    title: 'Conversational Turn-Taking & Greetings Drill',
    category: 'Everyday Conversations',
    video_url: 'https://www.youtube.com/watch?v=QwmhjIKL2jI&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=8',
    uploaded_by: 'b0000000-0000-0000-0000-000000000002',
    description: 'Deaf conversational exchange demonstrating turn-taking, pauses, and visual attention-getting techniques.',
    created_at: '2026-09-08T08:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000009',
    level: 2,
    title: 'Weather (Panahon) Filipino Sign Language Tutorial',
    category: 'Vocabulary Lessons',
    video_url: 'https://www.youtube.com/watch?v=vshlTKwNLgw&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=9',
    uploaded_by: 'b0000000-0000-0000-0000-000000000002',
    description: 'Vocabulary signs for weather conditions, climate, seasons, and natural elements.',
    created_at: '2026-09-09T08:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000010',
    level: 3,
    title: 'Color (Kulay) Filipino Sign Language Tutorial',
    category: 'Vocabulary Lessons',
    video_url: 'https://www.youtube.com/watch?v=ePeYEEG3wzQ&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=14',
    uploaded_by: 'b0000000-0000-0000-0000-000000000002',
    description: 'Masterclass and vocabulary lessons covering primary and secondary colors and descriptive signing.',
    created_at: '2026-09-10T08:00:00Z',
  },
];

// ---------------------------------------------------------------------
// 11. ANNOUNCEMENTS
// ---------------------------------------------------------------------
export const mockAnnouncements: Announcement[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    author_id: 'b0000000-0000-0000-0000-000000000001',
    schedule_id: 'e0000000-0000-0000-0000-000000000001',
    title: 'Orientation & Zoom Lighting Guidelines for Session 1',
    body: 'Welcome to Batch 2026-A! Please ensure your room has solid lighting in front of you (not behind) so handshapes and facial markers are clearly visible on camera.',
    created_at: '2026-09-01T09:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    author_id: 'b0000000-0000-0000-0000-000000000001',
    schedule_id: 'e0000000-0000-0000-0000-000000000003',
    title: 'Classifier Practice Video Links Posted in Learning Hub',
    body: 'Please review the new tutorial videos in the Learning Hub before Saturday\'s laboratory exercise on vehicle and person classifier movements.',
    created_at: '2026-09-10T10:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    author_id: 'a0000000-0000-0000-0000-000000000001',
    schedule_id: null,
    title: 'Annual Benilde Deaf Festival 2026 Registration Open to All Enrolled Learners',
    body: 'All students across Levels 1-3 are warmly invited to join the upcoming Deaf Festival cultural exhibits and signing poetry workshops.',
    created_at: '2026-09-15T11:00:00Z',
  },
];

// ---------------------------------------------------------------------
// 12. MESSAGES
// ---------------------------------------------------------------------
export const mockMessages: Message[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    sender_id: 'c0000000-0000-0000-0000-000000000001',
    receiver_id: 'b0000000-0000-0000-0000-000000000001',
    body: 'Good day, Teacher Rommel! I had a quick question regarding the sign for "Cavite". Is it signed with a C-handshape near the cheek or fingerspelled?',
    read: true,
    created_at: '2026-09-22T14:10:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    sender_id: 'b0000000-0000-0000-0000-000000000001',
    receiver_id: 'c0000000-0000-0000-0000-000000000001',
    body: 'Hello Juan! In official FSL, it is commonly signed with the "C" hand tapping the cheek, followed by local variations. I will demonstrate it during our warm-up this Saturday!',
    read: true,
    created_at: '2026-09-22T14:45:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    sender_id: 'c0000000-0000-0000-0000-000000000002',
    receiver_id: 'b0000000-0000-0000-0000-000000000002',
    body: 'Hi Teacher Liza, thank you for the feedback on my classifier video! I will practice my non-manual facial markers for the upcoming evaluation.',
    read: false,
    created_at: '2026-09-27T16:20:00Z',
  },
];

// ---------------------------------------------------------------------
// 13. NEWS & EVENTS (Grounded in SDEAS, Deaf Festival, BSLI)
// ---------------------------------------------------------------------
export const mockNewsEvents: NewsEvent[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'Annual Benilde Deaf Festival 2026: Celebrating Deaf Arts, Visual Music & FSL Heritage',
    body: 'Join us for the premier Deaf cultural celebration in the Philippines featuring Deaf visual artists, signing choir performances, and community panel discussions.',
    type: 'event',
    date: '2026-10-15',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
    location: 'DLS-CSB SDEAS Campus, Taft Ave., Manila',
    created_at: '2026-09-10T08:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: 'SDEAS Marks Over 30 Years of Pioneering Deaf Higher Education and FSL Advocacy',
    body: 'De La Salle-College of Saint Benilde SDEAS reaffirms its mission of empowering Deaf leaders and advancing the national implementation of the Filipino Sign Language Act (RA 11106).',
    type: 'news',
    date: '2026-09-20',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    location: 'School of Deaf Education and Applied Studies',
    created_at: '2026-09-20T08:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    title: 'Now Accepting Applications: Bachelor in Sign Language Interpretation (BSLI) AY 2027',
    body: 'Graduates of FSL Level 3 who demonstrate strong linguistic competency are eligible to apply for the prestigious BSLI degree program.',
    type: 'opportunity',
    date: '2026-10-28',
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    location: 'Benilde SDEAS Admissions',
    created_at: '2026-09-22T08:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    title: 'National Council on Disability Affairs (NCDA) Commends FSL Act Compliance in Broadcast Media',
    body: 'Public and private broadcast stations continue expanding inset FSL interpretation during emergency advisories and national news broadcasts.',
    type: 'news',
    date: '2026-09-10',
    image_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
    location: 'NCDA Philippines',
    created_at: '2026-09-10T08:00:00Z',
  },
];

// ---------------------------------------------------------------------
// 14. PRODUCTS (5 Merchandise Items Grounded in FSL_SPEC.md)
// ---------------------------------------------------------------------
export const mockProducts: Product[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Official "I Love FSL" Classic Cotton Shirt',
    price: 450.00,
    stock: 45,
    category: 'Shirts',
    description: 'Premium navy blue combed cotton shirt with high-contrast white FSL handshape typography.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Deaf Pride / Visual World Canvas Tote Bag',
    price: 320.00,
    stock: 60,
    category: 'Bags',
    description: 'Durable 14oz canvas tote bag featuring Deaf artist illustrations and reinforced shoulder straps.',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'FSL Manual Alphabet Golden Enamel Pin Collection',
    price: 150.00,
    stock: 120,
    category: 'Pins',
    description: 'Collector-grade gold-plated enamel pin depicting the iconic "I Love You" sign handshape.',
    image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&auto=format&fit=crop&q=80',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Sign Language Awareness Silicone Wristband Set',
    price: 80.00,
    stock: 85,
    category: 'Accessories',
    description: 'High-contrast debossed wristband set with "Filipino Sign Language Matters" motto.',
    image_url: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=500&auto=format&fit=crop&q=80',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Philippine FSL Pocket Dictionary & Quick Reference Guide',
    price: 550.00,
    stock: 30,
    category: 'Books',
    description: 'Spiral-bound, water-resistant field handbook containing 800+ essential FSL signs with illustration diagrams.',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    created_at: '2026-09-01T08:00:00Z',
  },
];

// ---------------------------------------------------------------------
// HELPER QUERY FUNCTIONS (Synchronous Fallbacks for Testing & Offline)
// ---------------------------------------------------------------------

export function getMockSchedulesWithDetails(): ScheduleWithDetails[] {
  return mockSchedules.map((schedule) => {
    const workshop = mockWorkshops.find((w) => w.id === schedule.workshop_id);
    const professor = mockProfiles.find((p) => p.id === schedule.professor_id);
    const enrolled_count = mockEnrollments.filter(
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

export function getMockEnrollmentsWithDetails(learnerId?: string): EnrollmentWithDetails[] {
  const list = learnerId
    ? mockEnrollments.filter((e) => e.learner_id === learnerId)
    : mockEnrollments;

  return list.map((enrollment) => {
    const scheduleDetails = getMockSchedulesWithDetails().find((s) => s.id === enrollment.schedule_id);
    const learner = mockProfiles.find((p) => p.id === enrollment.learner_id);
    const payment = mockPayments.find((p) => p.enrollment_id === enrollment.id);

    return {
      ...enrollment,
      schedule: scheduleDetails,
      learner,
      payment,
    };
  });
}

export function getMockAssignmentsWithSubmissions(scheduleId?: string): AssignmentWithSubmissions[] {
  const assignments = scheduleId
    ? mockAssignments.filter((a) => a.schedule_id === scheduleId)
    : mockAssignments;

  return assignments.map((assignment) => {
    const submissions: SubmissionWithLearner[] = mockSubmissions
      .filter((s) => s.assignment_id === assignment.id)
      .map((s) => ({
        ...s,
        learner: mockProfiles.find((p) => p.id === s.learner_id),
      }));

    return {
      ...assignment,
      submissions,
    };
  });
}

export function getMockMessagesWithProfiles(userId?: string): MessageWithProfiles[] {
  const messages = userId
    ? mockMessages.filter((m) => m.sender_id === userId || m.receiver_id === userId)
    : mockMessages;

  return messages.map((message) => ({
    ...message,
    sender: mockProfiles.find((p) => p.id === message.sender_id),
    receiver: mockProfiles.find((p) => p.id === message.receiver_id),
  }));
}
