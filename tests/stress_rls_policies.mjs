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

// User IDs from seed.sql
const ADMIN_ID = 'a0000000-0000-0000-0000-000000000001';
const PROF_ROMMEL_ID = 'b0000000-0000-0000-0000-000000000001';
const PROF_LIZA_ID = 'b0000000-0000-0000-0000-000000000002';
const LEARNER_JUAN_ID = 'c0000000-0000-0000-0000-000000000001';
const LEARNER_MARIA_ID = 'c0000000-0000-0000-0000-000000000002';
const LEARNER_BEA_ID = 'c0000000-0000-0000-0000-000000000003';

async function setupRLSTestDb() {
  db = new PGlite();

  // Create mock auth schema and users table
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
  await db.exec(migrationSql);

  const seedSql = fs.readFileSync(path.join(rootDir, 'supabase', 'seed.sql'), 'utf8');
  await db.exec(seedSql);

  // Grant table usage to roles for RLS testing
  await db.exec(`
    GRANT USAGE ON SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
  `);
}

async function asUser(userId, role = 'authenticated', callback) {
  // Set session variables and role
  await db.exec(`
    SET ROLE ${role};
    SET request.jwt.claim.sub = '${userId || ''}';
    SET request.jwt.claim.role = '${role}';
  `);
  try {
    return await callback();
  } finally {
    // Reset back to superuser
    await db.exec(`
      RESET ROLE;
      RESET request.jwt.claim.sub;
      RESET request.jwt.claim.role;
    `);
  }
}

test('Adversarial RLS Policy Stress Tests', async (t) => {
  await setupRLSTestDb();

  await t.test('RLS-1: Learner Juan cannot see Learner Maria enrollment records', async () => {
    await asUser(LEARNER_JUAN_ID, 'authenticated', async () => {
      const res = await db.query(`SELECT * FROM public.enrollments;`);
      // All returned enrollments must belong to Juan Dela Cruz
      for (const row of res.rows) {
        assert.strictEqual(row.learner_id, LEARNER_JUAN_ID, 'Learner should only see their own enrollments');
      }
    });
  });

  await t.test('RLS-2: Learner Juan cannot view Learner Maria payments', async () => {
    await asUser(LEARNER_JUAN_ID, 'authenticated', async () => {
      const res = await db.query(`
        SELECT p.* FROM public.payments p
        JOIN public.enrollments e ON p.enrollment_id = e.id;
      `);
      for (const row of res.rows) {
        const enrollCheck = await db.query(`SELECT learner_id FROM public.enrollments WHERE id = $1;`, [row.enrollment_id]);
        assert.strictEqual(enrollCheck.rows[0].learner_id, LEARNER_JUAN_ID, 'Learner should only see payments for own enrollments');
      }
    });
  });

  await t.test('RLS-3: Learner Juan cannot modify someone else profile', async () => {
    await asUser(LEARNER_JUAN_ID, 'authenticated', async () => {
      // Attempting to update Maria's profile
      const res = await db.query(`
        UPDATE public.profiles SET bio = 'Hacked Bio' WHERE id = $1;
      `, [LEARNER_MARIA_ID]);
      // RLS should filter this row out, resulting in 0 affected rows
      assert.strictEqual(res.affectedRows, 0, 'Updating another user profile must be blocked by RLS');
    });

    // Verify Maria's bio was not changed
    const maria = await db.query(`SELECT bio FROM public.profiles WHERE id = $1;`, [LEARNER_MARIA_ID]);
    assert.notStrictEqual(maria.rows[0].bio, 'Hacked Bio');
  });

  await t.test('RLS-4: Learner cannot verify their own payment or change payment status', async () => {
    await asUser(LEARNER_JUAN_ID, 'authenticated', async () => {
      // Find Juan's payment
      const myPayment = await db.query(`
        SELECT p.id FROM public.payments p
        JOIN public.enrollments e ON p.enrollment_id = e.id
        WHERE e.learner_id = $1 LIMIT 1;
      `, [LEARNER_JUAN_ID]);
      assert.ok(myPayment.rows.length > 0);

      const payId = myPayment.rows[0].id;
      const res = await db.query(`
        UPDATE public.payments SET status = 'verified' WHERE id = $1;
      `, [payId]);

      // RLS payments_admin_update requires get_my_role() = 'admin'
      assert.strictEqual(res.affectedRows, 0, 'Learner cannot update payment status');
    });
  });

  await t.test('RLS-5: Admin CAN update payment status to verified', async () => {
    await asUser(ADMIN_ID, 'authenticated', async () => {
      const pendingPayment = await db.query(`SELECT id FROM public.payments WHERE status = 'pending' LIMIT 1;`);
      if (pendingPayment.rows.length > 0) {
        const payId = pendingPayment.rows[0].id;
        const res = await db.query(`UPDATE public.payments SET status = 'verified' WHERE id = $1;`, [payId]);
        assert.strictEqual(res.affectedRows, 1, 'Admin must be allowed to verify payments');
      }
    });
  });

  await t.test('RLS-6: Learner cannot escalate enrollment directly to enrolled', async () => {
    await asUser(LEARNER_JUAN_ID, 'authenticated', async () => {
      // Attempt to self-enroll a pending enrollment
      await assert.rejects(async () => {
        await db.query(`
          UPDATE public.enrollments SET status = 'enrolled' 
          WHERE learner_id = $1 AND status = 'pending';
        `, [LEARNER_JUAN_ID]);
      }, /violates row-level security policy/i, 'Learner cannot self-approve enrollment status to enrolled');
    });
  });

  await t.test('RLS-7: Professor Rommel can view all submissions in their assigned schedule', async () => {
    await asUser(PROF_ROMMEL_ID, 'authenticated', async () => {
      const res = await db.query(`
        SELECT s.* FROM public.submissions s
        JOIN public.assignments a ON s.assignment_id = a.id
        JOIN public.schedules sc ON a.schedule_id = sc.id;
      `);
      // All submissions returned must be for Rommel's schedules
      for (const row of res.rows) {
        const schedCheck = await db.query(`
          SELECT sc.professor_id FROM public.submissions s
          JOIN public.assignments a ON s.assignment_id = a.id
          JOIN public.schedules sc ON a.schedule_id = sc.id
          WHERE s.id = $1;
        `, [row.id]);
        assert.strictEqual(schedCheck.rows[0].professor_id, PROF_ROMMEL_ID, 'Professor should only see submissions in their classes');
      }
    });
  });

  await t.test('RLS-8: Professor Rommel cannot grade submissions in Professor Liza class', async () => {
    await asUser(PROF_ROMMEL_ID, 'authenticated', async () => {
      // Find a submission belonging to Liza's schedule
      const lizaSubmissions = await db.query(`
        SELECT s.id FROM public.submissions s
        JOIN public.assignments a ON s.assignment_id = a.id
        JOIN public.schedules sc ON a.schedule_id = sc.id
        WHERE sc.professor_id = $1;
      `, [PROF_LIZA_ID]);

      if (lizaSubmissions.rows.length > 0) {
        const subId = lizaSubmissions.rows[0].id;
        const res = await db.query(`
          UPDATE public.submissions SET grade = 100.0, feedback = 'Unauthorized grading'
          WHERE id = $1;
        `, [subId]);
        assert.strictEqual(res.affectedRows, 0, 'Professor cannot grade submissions in another professor schedule');
      }
    });
  });

  await t.test('RLS-9: Learner Juan cannot read direct messages between Learner Maria and Professor Liza', async () => {
    await asUser(LEARNER_JUAN_ID, 'authenticated', async () => {
      const res = await db.query(`
        SELECT * FROM public.messages 
        WHERE sender_id = $1 OR receiver_id = $1;
      `, [LEARNER_MARIA_ID]);

      // None of the returned messages should involve Maria unless Juan was sender/receiver
      for (const row of res.rows) {
        assert.ok(row.sender_id === LEARNER_JUAN_ID || row.receiver_id === LEARNER_JUAN_ID, 'Messages must only involve the requesting user');
      }
    });
  });

  await t.test('RLS-10: Learner cannot submit an assignment if not enrolled in that schedule', async () => {
    // Schedule 4 is FSL Level 3, where Juan is not enrolled
    const sched4 = 'e0000000-0000-0000-0000-000000000004';
    const assign4 = await db.query(`SELECT id FROM public.assignments WHERE schedule_id = $1 LIMIT 1;`, [sched4]);

    if (assign4.rows.length > 0) {
      const aId = assign4.rows[0].id;
      await asUser(LEARNER_JUAN_ID, 'authenticated', async () => {
        await assert.rejects(async () => {
          await db.query(`
            INSERT INTO public.submissions (assignment_id, learner_id, file_url)
            VALUES ($1, $2, 'https://example.com/unauthorized_submission.mp4');
          `, [aId, LEARNER_JUAN_ID]);
        }, /violates row-level security policy/i, 'Learner must not submit assignment for schedule they are not enrolled in');
      });
    }
  });

  await t.test('RLS-11: Public anon user can view workshops and products, but not enrollments or payments', async () => {
    await asUser(null, 'anon', async () => {
      // Anon can select workshops
      const workshops = await db.query(`SELECT count(*)::int as count FROM public.workshops;`);
      assert.ok(workshops.rows[0].count > 0, 'Anon must be able to view workshops');

      // Anon can select products
      const products = await db.query(`SELECT count(*)::int as count FROM public.products;`);
      assert.ok(products.rows[0].count > 0, 'Anon must be able to view products');

      // Anon can select news_events
      const news = await db.query(`SELECT count(*)::int as count FROM public.news_events;`);
      assert.ok(news.rows[0].count > 0, 'Anon must be able to view news');

      // Anon CANNOT select enrollments (no anon policy on enrollments)
      const enrollments = await db.query(`SELECT count(*)::int as count FROM public.enrollments;`);
      assert.strictEqual(enrollments.rows[0].count, 0, 'Anon must NOT be able to view enrollments');

      // Anon CANNOT select payments
      const payments = await db.query(`SELECT count(*)::int as count FROM public.payments;`);
      assert.strictEqual(payments.rows[0].count, 0, 'Anon must NOT be able to view payments');
    });
  });

  await t.test('RLS-12: Learner cannot mutate their role to admin (profiles_update_self)', async () => {
    await asUser(LEARNER_JUAN_ID, 'authenticated', async () => {
      await assert.rejects(async () => {
        await db.query(`
          UPDATE public.profiles SET role = 'admin' WHERE id = $1;
        `, [LEARNER_JUAN_ID]);
      }, /violates row-level security policy/i, 'Role mutation must be rejected by RLS WITH CHECK');
    });

    // Verify role is still learner
    const juan = await db.query(`SELECT role FROM public.profiles WHERE id = $1;`, [LEARNER_JUAN_ID]);
    assert.strictEqual(juan.rows[0].role, 'learner');
  });

  await t.test('RLS-13: Learner cannot insert payment with status = verified (payments_insert_learner)', async () => {
    // Find Juan's enrollment
    const enrollment = (await db.query(`SELECT id FROM public.enrollments WHERE learner_id = $1 LIMIT 1;`, [LEARNER_JUAN_ID])).rows[0];
    assert.ok(enrollment);

    await asUser(LEARNER_JUAN_ID, 'authenticated', async () => {
      await assert.rejects(async () => {
        await db.query(`
          INSERT INTO public.payments (enrollment_id, amount, status)
          VALUES ($1, 2500, 'verified');
        `, [enrollment.id]);
      }, /violates row-level security policy/i, 'Learner inserting verified payment must be rejected by RLS');
    });
  });

  await t.test('RLS-14: Learner cannot insert submission with self-assigned grade (submissions_insert_learner)', async () => {
    // Find Juan's active assignment
    const assign = (await db.query(`
      SELECT a.id FROM public.assignments a
      JOIN public.enrollments e ON a.schedule_id = e.schedule_id
      WHERE e.learner_id = $1 AND e.status IN ('enrolled', 'completed')
      LIMIT 1;
    `, [LEARNER_JUAN_ID])).rows[0];
    assert.ok(assign);

    await asUser(LEARNER_JUAN_ID, 'authenticated', async () => {
      await assert.rejects(async () => {
        await db.query(`
          INSERT INTO public.submissions (assignment_id, learner_id, file_url, grade, feedback)
          VALUES ($1, $2, 'https://example.com/sub.mp4', 100.0, 'Self-graded');
        `, [assign.id, LEARNER_JUAN_ID]);
      }, /violates row-level security policy/i, 'Learner inserting graded submission must be rejected by RLS');
    });
  });
});
