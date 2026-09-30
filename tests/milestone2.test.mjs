import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Milestone 2 - Supabase SSR Clients and Middleware Existence', () => {
  const clientPath = path.join(rootDir, 'src', 'lib', 'supabase', 'client.ts');
  const serverPath = path.join(rootDir, 'src', 'lib', 'supabase', 'server.ts');
  const middlewareHelperPath = path.join(rootDir, 'src', 'lib', 'supabase', 'middleware.ts');
  const sessionHelperPath = path.join(rootDir, 'src', 'lib', 'supabase', 'session.ts');
  const edgeMiddlewarePath = path.join(rootDir, 'src', 'middleware.ts');

  assert.ok(fs.existsSync(clientPath), 'src/lib/supabase/client.ts must exist');
  assert.ok(fs.existsSync(serverPath), 'src/lib/supabase/server.ts must exist');
  assert.ok(fs.existsSync(middlewareHelperPath), 'src/lib/supabase/middleware.ts must exist');
  assert.ok(fs.existsSync(sessionHelperPath), 'src/lib/supabase/session.ts must exist');
  assert.ok(fs.existsSync(edgeMiddlewarePath), 'src/middleware.ts must exist');

  const edgeContent = fs.readFileSync(edgeMiddlewarePath, 'utf8');
  assert.ok(edgeContent.includes("path.startsWith('/learner')"), 'Middleware must protect /learner');
  assert.ok(edgeContent.includes("path.startsWith('/professor')"), 'Middleware must protect /professor');
  assert.ok(edgeContent.includes("path.startsWith('/admin')"), 'Middleware must protect /admin');
  assert.ok(edgeContent.includes("path.startsWith('/messages')"), 'Middleware must protect /messages');
  assert.ok(edgeContent.includes("NextResponse.redirect"), 'Middleware must redirect unauthorized requests');
});

test('Milestone 2 - Server Component Layout Guards Existence & Verification', () => {
  const learnerLayout = path.join(rootDir, 'src', 'app', '(learner)', 'layout.tsx');
  const professorLayout = path.join(rootDir, 'src', 'app', '(professor)', 'layout.tsx');
  const adminLayout = path.join(rootDir, 'src', 'app', '(admin)', 'layout.tsx');

  assert.ok(fs.existsSync(learnerLayout), '(learner)/layout.tsx must exist');
  assert.ok(fs.existsSync(professorLayout), '(professor)/layout.tsx must exist');
  assert.ok(fs.existsSync(adminLayout), '(admin)/layout.tsx must exist');

  const learnerContent = fs.readFileSync(learnerLayout, 'utf8');
  const professorContent = fs.readFileSync(professorLayout, 'utf8');
  const adminContent = fs.readFileSync(adminLayout, 'utf8');

  assert.ok(learnerContent.includes("role !== 'learner'"), 'Learner layout must enforce learner role');
  assert.ok(professorContent.includes("role !== 'professor'"), 'Professor layout must enforce professor role');
  assert.ok(adminContent.includes("role !== 'admin'"), 'Admin layout must enforce admin role');
});

test('Milestone 2 - Accessible UI & Video Player Components', () => {
  const buttonPath = path.join(rootDir, 'src', 'components', 'ui', 'Button.tsx');
  const cardPath = path.join(rootDir, 'src', 'components', 'ui', 'Card.tsx');
  const badgePath = path.join(rootDir, 'src', 'components', 'ui', 'Badge.tsx');
  const modalPath = path.join(rootDir, 'src', 'components', 'ui', 'Modal.tsx');
  const alertPath = path.join(rootDir, 'src', 'components', 'ui', 'Alert.tsx');
  const videoPlayerPath = path.join(rootDir, 'src', 'components', 'video', 'AccessibleVideoPlayer.tsx');
  const navbarPath = path.join(rootDir, 'src', 'components', 'layout', 'Navbar.tsx');
  const demoBannerPath = path.join(rootDir, 'src', 'components', 'layout', 'DemoRoleBanner.tsx');

  assert.ok(fs.existsSync(buttonPath), 'Button.tsx must exist');
  assert.ok(fs.existsSync(cardPath), 'Card.tsx must exist');
  assert.ok(fs.existsSync(badgePath), 'Badge.tsx must exist');
  assert.ok(fs.existsSync(modalPath), 'Modal.tsx must exist');
  assert.ok(fs.existsSync(alertPath), 'Alert.tsx must exist');
  assert.ok(fs.existsSync(videoPlayerPath), 'AccessibleVideoPlayer.tsx must exist');
  assert.ok(fs.existsSync(navbarPath), 'Navbar.tsx must exist');
  assert.ok(fs.existsSync(demoBannerPath), 'DemoRoleBanner.tsx must exist');

  const videoContent = fs.readFileSync(videoPlayerPath, 'utf8');
  assert.ok(videoContent.includes('0.5'), 'Video player must support 0.5x playback rate');
  assert.ok(videoContent.includes('0.75'), 'Video player must support 0.75x playback rate');
  assert.ok(videoContent.includes('loop'), 'Video player must support sign repetition loop');
});

test('Milestone 2 - Auth Pages & Role Dashboards Existence', () => {
  const loginPath = path.join(rootDir, 'src', 'app', '(auth)', 'login', 'page.tsx');
  const registerPath = path.join(rootDir, 'src', 'app', '(auth)', 'register', 'page.tsx');
  const learnerDash = path.join(rootDir, 'src', 'app', '(learner)', 'learner', 'page.tsx');
  const professorDash = path.join(rootDir, 'src', 'app', '(professor)', 'professor', 'page.tsx');
  const adminDash = path.join(rootDir, 'src', 'app', '(admin)', 'admin', 'page.tsx');

  assert.ok(fs.existsSync(loginPath), 'Login page must exist');
  assert.ok(fs.existsSync(registerPath), 'Register page must exist');
  assert.ok(fs.existsSync(learnerDash), 'Learner dashboard page must exist');
  assert.ok(fs.existsSync(professorDash), 'Professor dashboard page must exist');
  assert.ok(fs.existsSync(adminDash), 'Admin dashboard page must exist');

  const loginContent = fs.readFileSync(loginPath, 'utf8');
  assert.ok(loginContent.includes('DEMO_USERS'), 'Login page must reference demo users for 1-click quick-fill');
});

test('Milestone 2 - Refinements & Accessibility Hardening Verification', () => {
  // 1. Contrast shade upgrades (>= 7.0:1)
  const buttonContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ui', 'Button.tsx'), 'utf8');
  assert.ok(buttonContent.includes('bg-blue-800'), 'Button primary variant must use high-contrast bg-blue-800');
  assert.ok(buttonContent.includes('bg-rose-800'), 'Button danger variant must use high-contrast bg-rose-800');
  assert.ok(buttonContent.includes('bg-emerald-800'), 'Button success variant must use high-contrast bg-emerald-800');

  const inputContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ui', 'Input.tsx'), 'utf8');
  assert.ok(inputContent.includes('text-rose-800'), 'Input error text must use high-contrast text-rose-800');

  const selectContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ui', 'Select.tsx'), 'utf8');
  assert.ok(selectContent.includes('text-rose-800'), 'Select error text must use high-contrast text-rose-800');

  const videoContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'video', 'AccessibleVideoPlayer.tsx'), 'utf8');
  assert.ok(videoContent.includes('bg-blue-800 text-white'), 'Video player 1.0x button must use high-contrast bg-blue-800 text-white');

  // 2. Modal focus trapping
  const modalContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ui', 'Modal.tsx'), 'utf8');
  assert.ok(modalContent.includes("e.key === 'Tab'"), 'Modal must handle Tab focus trapping');
  assert.ok(modalContent.includes('e.shiftKey'), 'Modal must handle Shift+Tab backward focus trapping');
  assert.ok(modalContent.includes('closeButtonRef'), 'Modal must support initial focus on close button');

  // 3. Edge middleware perimeter protection & login redirect sanitization
  const edgeContent = fs.readFileSync(path.join(rootDir, 'src', 'middleware.ts'), 'utf8');
  assert.ok(edgeContent.includes('!user || !role'), 'Middleware must guard both missing user and unassigned role');
  assert.ok(edgeContent.includes('designatedDashboard'), 'Middleware must resolve clean fallback for unhandled roles');

  const loginContent = fs.readFileSync(path.join(rootDir, 'src', 'app', '(auth)', 'login', 'page.tsx'), 'utf8');
  assert.ok(loginContent.includes("startsWith('/')") && loginContent.includes("!rawRedirect.startsWith('//')"), 'Login page must sanitize redirectTarget');

  // 4. Next.js Windows build stabilization
  const nextConfigContent = fs.readFileSync(path.join(rootDir, 'next.config.mjs'), 'utf8');
  assert.ok(nextConfigContent.includes('outputFileTracing: false'), 'next.config.mjs must disable outputFileTracing to prevent Windows ENOENT race conditions');
});
