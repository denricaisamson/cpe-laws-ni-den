import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let db;

async function setupTestDb() {
  db = new PGlite();

  // Create mock auth schema and users table for Supabase environment simulation
  await db.exec(`
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE IF NOT EXISTS auth.users (
      id UUID PRIMARY KEY,
      instance_id UUID,
      aud VARCHAR(255),
      role VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      encrypted_password VARCHAR(255),
      email_confirmed_at TIMESTAMPTZ,
      raw_app_meta_data JSONB,
      raw_user_meta_data JSONB,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE OR REPLACE FUNCTION auth.uid()
    RETURNS UUID AS $$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
    $$ LANGUAGE sql STABLE;

    CREATE OR REPLACE FUNCTION auth.role()
    RETURNS TEXT AS $$
      SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role', true), ''), 'anon');
    $$ LANGUAGE sql STABLE;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role;
      END IF;
    END $$;
  `);

  // Read and execute migration file
  const migrationPath = path.join(rootDir, 'supabase', 'migrations', '20260928000000_init_fsl_schema.sql');
  let migrationSql = fs.readFileSync(migrationPath, 'utf8');

  // PGlite has gen_random_uuid() built-in, but doesn't have uuid-ossp/pgcrypto contrib packages compiled into base wasm
  migrationSql = migrationSql
    .replace('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', '-- extension uuid-ossp omitted in pglite')
    .replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '-- extension pgcrypto omitted in pglite');

  await db.exec(migrationSql);
}

test('Empirical Database Stress Suite', async (t) => {
  await setupTestDb();

  await t.test('1. Verify all 14 relational tables exist in PostgreSQL schema', async () => {
    const res = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = res.rows.map(r => r.table_name);
    const expectedTables = [
      'announcements',
      'assignments',
      'attendance',
      'enrollments',
      'materials',
      'messages',
      'news_events',
      'payments',
      'products',
      'profiles',
      'schedules',
      'submissions',
      'videos',
      'workshops'
    ];

    for (const table of expectedTables) {
      assert.ok(tableNames.includes(table), `Table ${table} must exist in public schema`);
    }
  });

  await t.test('2. Verify RLS is enabled on all 14 tables', async () => {
    const res = await db.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);

    for (const row of res.rows) {
      assert.strictEqual(row.rowsecurity, true, `Table ${row.tablename} must have RLS enabled`);
    }
  });

  await t.test('3. Test user trigger handle_new_user on auth.users insert', async () => {
    const testUserId = '11111111-1111-1111-1111-111111111111';
    await db.query(`
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES ($1, $2, $3);
    `, [testUserId, 'testuser@fsl.edu.ph', JSON.stringify({ name: 'Test Learner', role: 'learner' })]);

    const profileRes = await db.query(`SELECT * FROM public.profiles WHERE id = $1;`, [testUserId]);
    assert.strictEqual(profileRes.rows.length, 1);
    assert.strictEqual(profileRes.rows[0].name, 'Test Learner');
    assert.strictEqual(profileRes.rows[0].email, 'testuser@fsl.edu.ph');
    assert.strictEqual(profileRes.rows[0].role, 'learner');

    // Verify self-assigning 'admin' is prevented by trigger (forces 'learner')
    const adminAttemptId = '11111111-1111-1111-1111-111111111112';
    await db.query(`
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES ($1, $2, $3);
    `, [adminAttemptId, 'hacker@fsl.edu.ph', JSON.stringify({ name: 'Hacker', role: 'admin' })]);

    const hackerProfile = await db.query(`SELECT role FROM public.profiles WHERE id = $1;`, [adminAttemptId]);
    assert.strictEqual(hackerProfile.rows[0].role, 'learner', 'Public signup cannot self-assign admin role');
  });

  await t.test('4. Stress-test profiles.role CHECK constraint', async () => {
    const invalidId = '22222222-2222-2222-2222-222222222222';
    // Inserting into auth.users triggers handle_new_user()
    await db.query(`INSERT INTO auth.users (id, email) VALUES ($1, $2);`, [invalidId, 'user4@fsl.edu.ph']);

    // Attempt invalid role via UPDATE on the auto-created profile
    await assert.rejects(async () => {
      await db.query(`
        UPDATE public.profiles SET role = 'superadmin' WHERE id = $1;
      `, [invalidId]);
    }, /violates check constraint/i, 'Setting role to superadmin must violate check constraint');

    // Valid role 'admin'
    await db.query(`
      UPDATE public.profiles SET role = 'admin' WHERE id = $1;
    `, [invalidId]);
    const res = await db.query(`SELECT role FROM public.profiles WHERE id = $1;`, [invalidId]);
    assert.strictEqual(res.rows[0].role, 'admin');
  });

  await t.test('5. Stress-test workshops level & fee CHECK constraints', async () => {
    // Valid workshop
    const wRes = await db.query(`
      INSERT INTO public.workshops (level, title, fee, description)
      VALUES (1, 'Level 1 Test', 1500.00, 'Test Desc')
      RETURNING id;
    `);
    assert.ok(wRes.rows[0].id);

    // Invalid levels
    for (const badLevel of [0, 4, -1, 99]) {
      await assert.rejects(async () => {
        await db.query(`
          INSERT INTO public.workshops (level, title, fee, description)
          VALUES ($1, 'Invalid Level', 1000.00, 'Desc');
        `, [badLevel]);
      }, /violates check constraint/i, `Workshop level ${badLevel} must violate check constraint`);
    }

    // Invalid negative fee
    await assert.rejects(async () => {
      await db.query(`
        INSERT INTO public.workshops (level, title, fee, description)
        VALUES (2, 'Negative Fee', -50.00, 'Desc');
      `);
    }, /violates check constraint/i, 'Negative fee must violate check constraint');
  });

  await t.test('6. Stress-test schedules slots CHECK constraint', async () => {
    const wId = (await db.query(`SELECT id FROM public.workshops LIMIT 1;`)).rows[0].id;
    const profId = (await db.query(`SELECT id FROM public.profiles LIMIT 1;`)).rows[0].id;

    // Negative slots must fail
    await assert.rejects(async () => {
      await db.query(`
        INSERT INTO public.schedules (workshop_id, professor_id, day_time, slots)
        VALUES ($1, $2, 'Sat 9am', -5);
      `, [wId, profId]);
    }, /violates check constraint/i, 'Negative slots must violate check constraint');

    // 0 slots is valid (full)
    const validSchedule = await db.query(`
      INSERT INTO public.schedules (workshop_id, professor_id, day_time, slots)
      VALUES ($1, $2, 'Sat 9am', 0)
      RETURNING id;
    `, [wId, profId]);
    assert.ok(validSchedule.rows[0].id);
  });

  await t.test('7. Stress-test enrollments status CHECK & UNIQUE constraint', async () => {
    const schedId = (await db.query(`SELECT id FROM public.schedules LIMIT 1;`)).rows[0].id;
    const learnerId = (await db.query(`SELECT id FROM public.profiles LIMIT 1;`)).rows[0].id;

    // Valid pending enrollment
    await db.query(`
      INSERT INTO public.enrollments (learner_id, schedule_id, status)
      VALUES ($1, $2, 'pending');
    `, [learnerId, schedId]);

    // Duplicate enrollment must fail (uq_learner_schedule)
    await assert.rejects(async () => {
      await db.query(`
        INSERT INTO public.enrollments (learner_id, schedule_id, status)
        VALUES ($1, $2, 'enrolled');
      `, [learnerId, schedId]);
    }, /violates unique constraint/i, 'Duplicate enrollment for same learner and schedule must fail');

    // Invalid status
    const newUserId = '33333333-3333-3333-3333-333333333333';
    await db.query(`INSERT INTO auth.users (id, email) VALUES ($1, 'learner3@fsl.edu.ph');`, [newUserId]);

    for (const badStatus of ['waitlisted', 'active', 'rejected', 'failed']) {
      await assert.rejects(async () => {
        await db.query(`
          INSERT INTO public.enrollments (learner_id, schedule_id, status)
          VALUES ($1, $2, $3);
        `, [newUserId, schedId, badStatus]);
      }, /violates check constraint/i, `Enrollment status ${badStatus} must violate check constraint`);
    }
  });

  await t.test('8. Stress-test payments status & amount CHECK constraints', async () => {
    const enrollId = (await db.query(`SELECT id FROM public.enrollments LIMIT 1;`)).rows[0].id;

    // Valid payment
    await db.query(`
      INSERT INTO public.payments (enrollment_id, amount, status)
      VALUES ($1, 1500.00, 'pending');
    `, [enrollId]);

    // Invalid status
    for (const badStatus of ['completed', 'approved', 'refunded']) {
      await assert.rejects(async () => {
        await db.query(`
          INSERT INTO public.payments (enrollment_id, amount, status)
          VALUES ($1, 1500.00, $2);
        `, [enrollId, badStatus]);
      }, /violates check constraint/i, `Payment status ${badStatus} must violate check constraint`);
    }

    // Negative amount
    await assert.rejects(async () => {
      await db.query(`
        INSERT INTO public.payments (enrollment_id, amount, status)
        VALUES ($1, -100.00, 'pending');
      `, [enrollId]);
    }, /violates check constraint/i, 'Negative payment amount must violate check constraint');
  });

  await t.test('9. Stress-test attendance unique constraint (enrollment_id, date)', async () => {
    const enrollId = (await db.query(`SELECT id FROM public.enrollments LIMIT 1;`)).rows[0].id;
    const testDate = '2026-10-01';

    await db.query(`
      INSERT INTO public.attendance (enrollment_id, date, present)
      VALUES ($1, $2, true);
    `, [enrollId, testDate]);

    // Duplicate date for same enrollment must fail
    await assert.rejects(async () => {
      await db.query(`
        INSERT INTO public.attendance (enrollment_id, date, present)
        VALUES ($1, $2, false);
      `, [enrollId, testDate]);
    }, /violates unique constraint/i, 'Duplicate attendance date for same enrollment must fail');
  });

  await t.test('10. Stress-test submissions grade CHECK & unique constraint', async () => {
    const schedId = (await db.query(`SELECT id FROM public.schedules LIMIT 1;`)).rows[0].id;
    const learnerId = (await db.query(`SELECT id FROM public.profiles LIMIT 1;`)).rows[0].id;

    // Create assignment
    const assignRes = await db.query(`
      INSERT INTO public.assignments (schedule_id, title, description, due_date)
      VALUES ($1, 'Assignment 1', 'Fingerspelling Video', now() + interval '7 days')
      RETURNING id;
    `, [schedId]);
    const assignId = assignRes.rows[0].id;

    // Valid submission
    await db.query(`
      INSERT INTO public.submissions (assignment_id, learner_id, file_url, grade)
      VALUES ($1, $2, 'https://example.com/sub1.mp4', 95.5);
    `, [assignId, learnerId]);

    // Duplicate submission for same learner and assignment must fail
    await assert.rejects(async () => {
      await db.query(`
        INSERT INTO public.submissions (assignment_id, learner_id, file_url, grade)
        VALUES ($1, $2, 'https://example.com/sub2.mp4', 80.0);
      `, [assignId, learnerId]);
    }, /violates unique constraint/i, 'Duplicate submission for same assignment and learner must fail');

    // Invalid grades (negative or > 100)
    const newUserId = '44444444-4444-4444-4444-444444444444';
    await db.query(`INSERT INTO auth.users (id, email) VALUES ($1, 'learner4@fsl.edu.ph');`, [newUserId]);

    for (const badGrade of [-1, 100.5, 150]) {
      await assert.rejects(async () => {
        await db.query(`
          INSERT INTO public.submissions (assignment_id, learner_id, file_url, grade)
          VALUES ($1, $2, 'https://example.com/sub.mp4', $3);
        `, [assignId, newUserId, badGrade]);
      }, /violates check constraint/i, `Grade ${badGrade} must violate check constraint`);
    }
  });

  await t.test('11. Stress-test videos strict categories from FSL_SPEC.md', async () => {
    const validCategories = [
      'Alphabet / Fingerspelling',
      'Basic Greetings',
      'Numbers',
      'Common Expressions',
      'Everyday Conversations',
      'Vocabulary Lessons',
    ];

    for (const cat of validCategories) {
      const res = await db.query(`
        INSERT INTO public.videos (level, title, category, video_url)
        VALUES (1, 'Test Video', $1, 'https://example.com/vid.mp4')
        RETURNING id;
      `, [cat]);
      assert.ok(res.rows[0].id);
    }

    // Invalid categories
    for (const badCat of ['Fingerspelling', 'Greetings', 'Random', 'Culture']) {
      await assert.rejects(async () => {
        await db.query(`
          INSERT INTO public.videos (level, title, category, video_url)
          VALUES (1, 'Bad Video', $1, 'https://example.com/vid.mp4');
        `, [badCat]);
      }, /violates check constraint/i, `Category ${badCat} must violate check constraint`);
    }
  });

  await t.test('12. Stress-test news_events type CHECK constraint', async () => {
    const validTypes = ['news', 'event', 'announcement', 'opportunity', 'sdeas_news', 'deaf_festival', 'seminar'];
    for (const t of validTypes) {
      const res = await db.query(`
        INSERT INTO public.news_events (title, body, type)
        VALUES ('Title', 'Body', $1)
        RETURNING id;
      `, [t]);
      assert.ok(res.rows[0].id);
    }

    // Invalid types
    for (const badType of ['blog', 'article', 'press_release']) {
      await assert.rejects(async () => {
        await db.query(`
          INSERT INTO public.news_events (title, body, type)
          VALUES ('Title', 'Body', $1);
        `, [badType]);
      }, /violates check constraint/i, `News type ${badType} must violate check constraint`);
    }
  });

  await t.test('13. Stress-test foreign key RESTRICT on schedules.professor_id', async () => {
    // Attempting to delete a profile that is assigned to a schedule must be blocked by RESTRICT
    const sched = (await db.query(`SELECT professor_id FROM public.schedules LIMIT 1;`)).rows[0];
    await assert.rejects(async () => {
      await db.query(`DELETE FROM public.profiles WHERE id = $1;`, [sched.professor_id]);
    }, /violates.*foreign key constraint|violates RESTRICT/i, 'Deleting assigned professor must be restricted by foreign key');
  });

  await t.test('14. Stress-test foreign key CASCADE on workshops deletion', async () => {
    // Create isolated workshop and related tree
    const w = (await db.query(`
      INSERT INTO public.workshops (level, title, fee, description)
      VALUES (3, 'Cascade Test Workshop', 2500.00, 'Test')
      RETURNING id;
    `)).rows[0];

    const prof = (await db.query(`SELECT id FROM public.profiles LIMIT 1;`)).rows[0];
    const s = (await db.query(`
      INSERT INTO public.schedules (workshop_id, professor_id, day_time, slots)
      VALUES ($1, $2, 'Sun 2pm', 10)
      RETURNING id;
    `, [w.id, prof.id])).rows[0];

    const learner = (await db.query(`SELECT id FROM public.profiles LIMIT 1;`)).rows[0];
    const e = (await db.query(`
      INSERT INTO public.enrollments (learner_id, schedule_id, status)
      VALUES ($1, $2, 'enrolled')
      RETURNING id;
    `, [learner.id, s.id])).rows[0];

    await db.query(`
      INSERT INTO public.payments (enrollment_id, amount, status)
      VALUES ($1, 2500.00, 'verified');
    `, [e.id]);

    await db.query(`
      INSERT INTO public.materials (schedule_id, title, file_url)
      VALUES ($1, 'Test Material', 'https://example.com/mat.pdf');
    `, [s.id]);

    // Now delete workshop -> schedules, enrollments, payments, materials must cascade delete
    await db.query(`DELETE FROM public.workshops WHERE id = $1;`, [w.id]);

    const checkSched = await db.query(`SELECT * FROM public.schedules WHERE id = $1;`, [s.id]);
    const checkEnroll = await db.query(`SELECT * FROM public.enrollments WHERE id = $1;`, [e.id]);
    const checkMat = await db.query(`SELECT * FROM public.materials WHERE schedule_id = $1;`, [s.id]);

    assert.strictEqual(checkSched.rows.length, 0, 'Schedules must cascade delete with workshop');
    assert.strictEqual(checkEnroll.rows.length, 0, 'Enrollments must cascade delete with workshop');
    assert.strictEqual(checkMat.rows.length, 0, 'Materials must cascade delete with workshop');
  });

  await t.test('15. Stress-test RLS helper functions & recursion safety', async () => {
    const testAdminId = '99999999-9999-9999-9999-999999999999';
    await db.query(`
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES ($1, 'admin_check@fsl.edu.ph', '{"name":"Admin Check"}'::jsonb);
    `, [testAdminId]);
    await db.query(`UPDATE public.profiles SET role = 'admin' WHERE id = $1;`, [testAdminId]);

    // Simulate authenticated session by setting session variable
    await db.exec(`SET request.jwt.claim.sub = '${testAdminId}';`);

    const roleRes = await db.query(`SELECT public.get_my_role() as role;`);
    assert.strictEqual(roleRes.rows[0].role, 'admin');

    // Test is_schedule_professor
    const sId = (await db.query(`SELECT id, professor_id FROM public.schedules LIMIT 1;`)).rows[0];
    await db.exec(`SET request.jwt.claim.sub = '${sId.professor_id}';`);
    const isProfRes = await db.query(`SELECT public.is_schedule_professor($1) as is_prof;`, [sId.id]);
    assert.strictEqual(isProfRes.rows[0].is_prof, true);

    await db.exec(`SET request.jwt.claim.sub = '${testAdminId}';`);
    const isNotProfRes = await db.query(`SELECT public.is_schedule_professor($1) as is_prof;`, [sId.id]);
    assert.strictEqual(isNotProfRes.rows[0].is_prof, false);
  });

  await t.test('16. Verify seed.sql runs cleanly and populates all 14 tables', async () => {
    // Create a fresh DB for seed verification
    const seedDb = new PGlite();
    await seedDb.exec(`
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY,
        instance_id UUID,
        aud VARCHAR(255),
        role VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        encrypted_password VARCHAR(255),
        email_confirmed_at TIMESTAMPTZ,
        raw_app_meta_data JSONB,
        raw_user_meta_data JSONB,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
        SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
      $$ LANGUAGE sql STABLE;
      CREATE OR REPLACE FUNCTION auth.role() RETURNS TEXT AS $$
        SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role', true), ''), 'anon');
      $$ LANGUAGE sql STABLE;

      CREATE OR REPLACE FUNCTION public.gen_salt(text) RETURNS text AS $$ SELECT 'salt' $$ LANGUAGE sql IMMUTABLE;
      CREATE OR REPLACE FUNCTION public.crypt(text, text) RETURNS text AS $$ SELECT 'hashed' $$ LANGUAGE sql IMMUTABLE;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
          CREATE ROLE service_role;
        END IF;
      END $$;
    `);

    let migrationSql = fs.readFileSync(path.join(rootDir, 'supabase', 'migrations', '20260928000000_init_fsl_schema.sql'), 'utf8');
    migrationSql = migrationSql
      .replace('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', '-- extension uuid-ossp omitted in pglite')
      .replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '-- extension pgcrypto omitted in pglite');
    await seedDb.exec(migrationSql);

    const seedSql = fs.readFileSync(path.join(rootDir, 'supabase', 'seed.sql'), 'utf8');
    await seedDb.exec(seedSql);

    // Verify row counts for each table
    const tableCounts = {
      'profiles': 6,
      'workshops': 3,
      'schedules': 4,
      'enrollments': 3,
      'payments': 3,
      'attendance': 4,
      'assignments': 3,
      'submissions': 2,
      'materials': 4,
      'videos': 6,
      'announcements': 3,
      'messages': 3,
      'news_events': 4,
      'products': 5,
    };

    for (const [table, minCount] of Object.entries(tableCounts)) {
      const res = await seedDb.query(`SELECT COUNT(*)::int as count FROM public.${table};`);
      const count = res.rows[0].count;
      assert.ok(count >= minCount, `Table public.${table} should have at least ${minCount} rows, found ${count}`);
    }
  });
});
