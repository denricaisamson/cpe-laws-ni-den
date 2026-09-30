// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Database Types & Domain Interfaces (14 Tables)
// File: src/types/database.ts
// =====================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'learner' | 'professor' | 'admin';
export type WorkshopLevel = 1 | 2 | 3;
export type EnrollmentStatus = 'pending' | 'enrolled' | 'completed' | 'dropped';
export type PaymentStatus = 'pending' | 'verified';
export type VideoCategory =
  | 'Alphabet / Fingerspelling'
  | 'Basic Greetings'
  | 'Numbers'
  | 'Common Expressions'
  | 'Everyday Conversations'
  | 'Vocabulary Lessons';
export type NewsEventType = 'news' | 'event' | 'announcement' | 'opportunity' | 'sdeas_news' | 'deaf_festival' | 'seminar';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      workshops: {
        Row: Workshop;
        Insert: WorkshopInsert;
        Update: WorkshopUpdate;
      };
      schedules: {
        Row: Schedule;
        Insert: ScheduleInsert;
        Update: ScheduleUpdate;
      };
      enrollments: {
        Row: Enrollment;
        Insert: EnrollmentInsert;
        Update: EnrollmentUpdate;
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
      };
      attendance: {
        Row: Attendance;
        Insert: AttendanceInsert;
        Update: AttendanceUpdate;
      };
      assignments: {
        Row: Assignment;
        Insert: AssignmentInsert;
        Update: AssignmentUpdate;
      };
      submissions: {
        Row: Submission;
        Insert: SubmissionInsert;
        Update: SubmissionUpdate;
      };
      materials: {
        Row: Material;
        Insert: MaterialInsert;
        Update: MaterialUpdate;
      };
      videos: {
        Row: Video;
        Insert: VideoInsert;
        Update: VideoUpdate;
      };
      announcements: {
        Row: Announcement;
        Insert: AnnouncementInsert;
        Update: AnnouncementUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      news_events: {
        Row: NewsEvent;
        Insert: NewsEventInsert;
        Update: NewsEventUpdate;
      };
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_my_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_schedule_professor: {
        Args: { p_schedule_id: string };
        Returns: boolean;
      };
      is_enrolled_in_schedule: {
        Args: { p_schedule_id: string };
        Returns: boolean;
      };
    };
  };
}

// ---------------------------------------------------------------------
// 1. PROFILES
// ---------------------------------------------------------------------
export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  avatar_url?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdate {
  name?: string;
  email?: string;
  role?: UserRole;
  avatar_url?: string | null;
  bio?: string | null;
  updated_at?: string;
}

// ---------------------------------------------------------------------
// 2. WORKSHOPS
// ---------------------------------------------------------------------
export interface Workshop {
  id: string;
  level: WorkshopLevel;
  title: string;
  fee: number;
  description: string;
  created_at: string;
}

export interface WorkshopInsert {
  id?: string;
  level: WorkshopLevel;
  title: string;
  fee: number;
  description: string;
  created_at?: string;
}

export interface WorkshopUpdate {
  level?: WorkshopLevel;
  title?: string;
  fee?: number;
  description?: string;
}

// ---------------------------------------------------------------------
// 3. SCHEDULES
// ---------------------------------------------------------------------
export interface Schedule {
  id: string;
  workshop_id: string;
  professor_id: string;
  day_time: string;
  slots: number;
  meeting_link: string | null;
  created_at: string;
}

export interface ScheduleInsert {
  id?: string;
  workshop_id: string;
  professor_id: string;
  day_time: string;
  slots?: number;
  meeting_link?: string | null;
  created_at?: string;
}

export interface ScheduleUpdate {
  workshop_id?: string;
  professor_id?: string;
  day_time?: string;
  slots?: number;
  meeting_link?: string | null;
}

export interface ScheduleWithDetails extends Schedule {
  workshop?: Workshop;
  professor?: Profile;
  enrolled_count?: number;
}

// ---------------------------------------------------------------------
// 4. ENROLLMENTS
// ---------------------------------------------------------------------
export interface Enrollment {
  id: string;
  learner_id: string;
  schedule_id: string;
  status: EnrollmentStatus;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentInsert {
  id?: string;
  learner_id: string;
  schedule_id: string;
  status?: EnrollmentStatus;
  created_at?: string;
  updated_at?: string;
}

export interface EnrollmentUpdate {
  status?: EnrollmentStatus;
  updated_at?: string;
}

export interface EnrollmentWithDetails extends Enrollment {
  schedule?: ScheduleWithDetails;
  learner?: Profile;
  payment?: Payment;
}

// ---------------------------------------------------------------------
// 5. PAYMENTS
// ---------------------------------------------------------------------
export interface Payment {
  id: string;
  enrollment_id: string;
  amount: number;
  status: PaymentStatus;
  date: string;
  reference_no: string;
  payment_method: string;
  created_at: string;
}

export interface PaymentInsert {
  id?: string;
  enrollment_id: string;
  amount: number;
  status?: PaymentStatus;
  date?: string;
  reference_no?: string;
  payment_method?: string;
  created_at?: string;
}

export interface PaymentUpdate {
  status?: PaymentStatus;
  amount?: number;
}

export interface PaymentWithDetails extends Payment {
  enrollment?: EnrollmentWithDetails;
}

// ---------------------------------------------------------------------
// 6. ATTENDANCE
// ---------------------------------------------------------------------
export interface Attendance {
  id: string;
  enrollment_id: string;
  date: string;
  present: boolean;
  remarks: string | null;
  created_at: string;
}

export interface AttendanceInsert {
  id?: string;
  enrollment_id: string;
  date?: string;
  present?: boolean;
  remarks?: string | null;
  created_at?: string;
}

export interface AttendanceUpdate {
  present?: boolean;
  remarks?: string | null;
}

export interface AttendanceWithLearner extends Attendance {
  learner?: Profile;
}

// ---------------------------------------------------------------------
// 7. ASSIGNMENTS
// ---------------------------------------------------------------------
export interface Assignment {
  id: string;
  schedule_id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

export interface AssignmentInsert {
  id?: string;
  schedule_id: string;
  title: string;
  description: string;
  due_date: string;
  created_at?: string;
}

export interface AssignmentUpdate {
  title?: string;
  description?: string;
  due_date?: string;
}

export interface AssignmentWithSubmissions extends Assignment {
  submissions?: SubmissionWithLearner[];
}

// ---------------------------------------------------------------------
// 8. SUBMISSIONS
// ---------------------------------------------------------------------
export interface Submission {
  id: string;
  assignment_id: string;
  learner_id: string;
  file_url: string;
  grade: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
}

export interface SubmissionInsert {
  id?: string;
  assignment_id: string;
  learner_id: string;
  file_url: string;
  grade?: number | null;
  feedback?: string | null;
  submitted_at?: string;
  graded_at?: string | null;
}

export interface SubmissionUpdate {
  file_url?: string;
  grade?: number | null;
  feedback?: string | null;
  graded_at?: string | null;
}

export interface SubmissionWithLearner extends Submission {
  learner?: Profile;
  assignment?: Assignment;
}

// ---------------------------------------------------------------------
// 9. MATERIALS
// ---------------------------------------------------------------------
export interface Material {
  id: string;
  schedule_id: string;
  title: string;
  file_url: string;
  description: string | null;
  created_at: string;
}

export interface MaterialInsert {
  id?: string;
  schedule_id: string;
  title: string;
  file_url: string;
  description?: string | null;
  created_at?: string;
}

export interface MaterialUpdate {
  title?: string;
  file_url?: string;
  description?: string | null;
}

// ---------------------------------------------------------------------
// 10. VIDEOS
// ---------------------------------------------------------------------
export interface Video {
  id: string;
  level: WorkshopLevel;
  title: string;
  category: VideoCategory;
  video_url: string;
  uploaded_by: string | null;
  description: string | null;
  created_at: string;
}

export interface VideoInsert {
  id?: string;
  level: WorkshopLevel;
  title: string;
  category: VideoCategory;
  video_url: string;
  uploaded_by?: string | null;
  description?: string | null;
  created_at?: string;
}

export interface VideoUpdate {
  level?: WorkshopLevel;
  title?: string;
  category?: VideoCategory;
  video_url?: string;
  description?: string | null;
}

export interface VideoWithUploader extends Video {
  uploader?: Profile;
}

// ---------------------------------------------------------------------
// 11. ANNOUNCEMENTS
// ---------------------------------------------------------------------
export interface Announcement {
  id: string;
  author_id: string;
  schedule_id: string | null;
  title: string;
  body: string;
  created_at: string;
}

export interface AnnouncementInsert {
  id?: string;
  author_id: string;
  schedule_id?: string | null;
  title: string;
  body: string;
  created_at?: string;
}

export interface AnnouncementUpdate {
  title?: string;
  body?: string;
}

export interface AnnouncementWithAuthor extends Announcement {
  author?: Profile;
}

// ---------------------------------------------------------------------
// 12. MESSAGES
// ---------------------------------------------------------------------
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface MessageInsert {
  id?: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  read?: boolean;
  created_at?: string;
}

export interface MessageUpdate {
  read?: boolean;
}

export interface MessageWithProfiles extends Message {
  sender?: Profile;
  receiver?: Profile;
}

// ---------------------------------------------------------------------
// 13. NEWS & EVENTS
// ---------------------------------------------------------------------
export interface NewsEvent {
  id: string;
  title: string;
  body: string;
  type: NewsEventType;
  date: string;
  image_url: string | null;
  location: string | null;
  created_at: string;
}

export interface NewsEventInsert {
  id?: string;
  title: string;
  body: string;
  type: NewsEventType;
  date?: string;
  image_url?: string | null;
  location?: string | null;
  created_at?: string;
}

export interface NewsEventUpdate {
  title?: string;
  body?: string;
  type?: NewsEventType;
  date?: string;
  image_url?: string | null;
  location?: string | null;
}

// ---------------------------------------------------------------------
// 14. PRODUCTS
// ---------------------------------------------------------------------
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string | null;
  image_url: string | null;
  category: string | null;
  created_at: string;
}

export interface ProductInsert {
  id?: string;
  name: string;
  price: number;
  stock?: number;
  description?: string | null;
  image_url?: string | null;
  category?: string | null;
  created_at?: string;
}

export interface ProductUpdate {
  name?: string;
  price?: number;
  stock?: number;
  description?: string | null;
  image_url?: string | null;
  category?: string | null;
}
