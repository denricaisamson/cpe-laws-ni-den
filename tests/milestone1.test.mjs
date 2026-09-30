import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Milestone 1 - Supabase Migration Schema Verification', () => {
  const migrationPath = path.join(rootDir, 'supabase', 'migrations', '20260928000000_init_fsl_schema.sql');
  assert.ok(fs.existsSync(migrationPath), 'Migration SQL file must exist');

  const content = fs.readFileSync(migrationPath, 'utf8');

  // Verify all 14 tables are created
  const requiredTables = [
    'public.profiles',
    'public.workshops',
    'public.schedules',
    'public.enrollments',
    'public.payments',
    'public.attendance',
    'public.assignments',
    'public.submissions',
    'public.materials',
    'public.videos',
    'public.announcements',
    'public.messages',
    'public.news_events',
    'public.products',
  ];

  for (const table of requiredTables) {
    assert.ok(
      content.includes(`CREATE TABLE IF NOT EXISTS ${table}`),
      `Migration must contain CREATE TABLE statement for ${table}`
    );
    assert.ok(
      content.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`),
      `Migration must enable RLS on ${table}`
    );
  }

  // Verify trigger and helper functions
  assert.ok(content.includes('CREATE OR REPLACE FUNCTION public.handle_new_user()'), 'Must contain user sync trigger function');
  assert.ok(content.includes('CREATE TRIGGER on_auth_user_created'), 'Must attach trigger to auth.users');
  assert.ok(content.includes('CREATE OR REPLACE FUNCTION public.get_my_role()'), 'Must contain get_my_role() helper');
  assert.ok(content.includes('CREATE OR REPLACE FUNCTION public.is_schedule_professor'), 'Must contain is_schedule_professor helper');
  assert.ok(content.includes('CREATE OR REPLACE FUNCTION public.is_enrolled_in_schedule'), 'Must contain is_enrolled_in_schedule helper');

  // Verify exact 6 video categories
  const videoCategories = [
    'Alphabet / Fingerspelling',
    'Basic Greetings',
    'Numbers',
    'Common Expressions',
    'Everyday Conversations',
    'Vocabulary Lessons',
  ];

  for (const category of videoCategories) {
    assert.ok(content.includes(category), `Migration must enforce video category: ${category}`);
  }

  // Verify hardened RLS policies & trigger
  assert.ok(
    content.includes('role = (SELECT role FROM public.profiles WHERE id = auth.uid())'),
    'profiles_update_self must prevent role modification'
  );
  assert.ok(
    content.includes("AND status = 'pending'"),
    'payments_insert_learner must enforce status = pending'
  );
  assert.ok(
    content.includes('grade IS NULL') && content.includes('feedback IS NULL') && content.includes('graded_at IS NULL'),
    'submissions_insert_learner must enforce null grade, feedback, and graded_at'
  );
  assert.ok(
    content.includes("WHEN new.raw_user_meta_data->>'role' IN ('learner', 'professor')"),
    'handle_new_user trigger must prevent public admin signup'
  );
  assert.ok(
    content.includes("'sdeas_news', 'deaf_festival', 'seminar'"),
    'news_events type check constraint must support grounded news event categories'
  );
});

test('Milestone 1 - Supabase Seed Data Verification', () => {
  const seedPath = path.join(rootDir, 'supabase', 'seed.sql');
  assert.ok(fs.existsSync(seedPath), 'Seed SQL file must exist');

  const content = fs.readFileSync(seedPath, 'utf8');

  // Verify seed insertions across all 14 tables
  const seededTables = [
    'public.profiles',
    'public.workshops',
    'public.schedules',
    'public.enrollments',
    'public.payments',
    'public.attendance',
    'public.assignments',
    'public.submissions',
    'public.materials',
    'public.videos',
    'public.announcements',
    'public.messages',
    'public.news_events',
    'public.products',
  ];

  for (const table of seededTables) {
    assert.ok(content.includes(`INSERT INTO ${table}`), `Seed SQL must insert into ${table}`);
  }

  // Grounding checks
  assert.ok(content.includes('admin@fsl.edu.ph'), 'Seed must contain admin account');
  assert.ok(content.includes('prof.rommel@fsl.edu.ph'), 'Seed must contain Rommel Agravante');
  assert.ok(content.includes('prof.liza@fsl.edu.ph'), 'Seed must contain Liza Flores');
  assert.ok(content.includes('learner.juan@fsl.edu.ph'), 'Seed must contain Juan Dela Cruz');
  assert.ok(content.includes('Annual Benilde Deaf Festival 2026'), 'Seed must contain Deaf Festival event');
  assert.ok(content.includes('Bachelor in Sign Language Interpretation (BSLI)'), 'Seed must contain BSLI pathway');
});

test('Milestone 1 - TypeScript Types & Mock Data Integrity', () => {
  const typesPath = path.join(rootDir, 'src', 'types', 'database.ts');
  const mockPath = path.join(rootDir, 'src', 'lib', 'mock-data.ts');

  assert.ok(fs.existsSync(typesPath), 'src/types/database.ts must exist');
  assert.ok(fs.existsSync(mockPath), 'src/lib/mock-data.ts must exist');

  const typesContent = fs.readFileSync(typesPath, 'utf8');
  assert.ok(typesContent.includes('export interface Database'), 'Must export Database interface');
  assert.ok(typesContent.includes('export type UserRole'), 'Must export UserRole');
  assert.ok(typesContent.includes('export type VideoCategory'), 'Must export VideoCategory');
  assert.ok(typesContent.includes('export type NewsEventType'), 'Must export NewsEventType');
  assert.ok(
    typesContent.includes("'sdeas_news' | 'deaf_festival' | 'seminar'"),
    'NewsEventType must include sdeas_news, deaf_festival, and seminar'
  );

  const mockContent = fs.readFileSync(mockPath, 'utf8');
  assert.ok(mockContent.includes('export const mockProfiles: Profile[]'), 'Must export mockProfiles');
  assert.ok(mockContent.includes('export const mockWorkshops: Workshop[]'), 'Must export mockWorkshops');
  assert.ok(mockContent.includes('export const mockSchedules: Schedule[]'), 'Must export mockSchedules');
  assert.ok(mockContent.includes('export const mockEnrollments: Enrollment[]'), 'Must export mockEnrollments');
  assert.ok(mockContent.includes('export const mockPayments: Payment[]'), 'Must export mockPayments');
  assert.ok(mockContent.includes('export const mockVideos: Video[]'), 'Must export mockVideos');
  assert.ok(mockContent.includes('export const mockNewsEvents: NewsEvent[]'), 'Must export mockNewsEvents');
  assert.ok(mockContent.includes('export const mockProducts: Product[]'), 'Must export mockProducts');
});
