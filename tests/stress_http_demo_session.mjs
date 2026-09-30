import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://127.0.0.1:3333';

test('Empirical HTTP: GET /api/auth/demo-session returns session state', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/demo-session`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok('session' in data, 'Response should contain session key');
});

test('Empirical HTTP: POST /api/auth/demo-session switches to admin', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'admin' }),
  });
  assert.equal(res.status, 200);
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'Should return Set-Cookie header');
  assert.ok(setCookie.includes('fsl_demo_session='), 'Cookie should be fsl_demo_session');

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.role, 'admin');
  assert.equal(data.profile.role, 'admin');
});

test('Empirical HTTP: POST /api/auth/demo-session switches to professor', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'professor' }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.role, 'professor');
});

test('Empirical HTTP: POST /api/auth/demo-session switches to learner', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'learner' }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.role, 'learner');
});

test('Empirical HTTP: POST /api/auth/demo-session switches by specific userId', async () => {
  const profId = 'b0000000-0000-0000-0000-000000000002'; // Liza Flores
  const res = await fetch(`${BASE_URL}/api/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: profId }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.profile.id, profId);
  assert.equal(data.profile.name, 'Liza Flores');
});

test('Empirical HTTP: POST /api/auth/demo-session switches by email', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'learner.juan@fsl.edu.ph' }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.profile.email, 'learner.juan@fsl.edu.ph');
  assert.equal(data.role, 'learner');
});

test('Empirical HTTP: POST /api/auth/demo-session empty payload defaults to learner', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.role, 'learner');
});

test('Empirical HTTP: POST /api/auth/demo-session invalid role returns 404', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'superhacker' }),
  });
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.ok(data.error);
});

test('Empirical HTTP: POST /api/auth/demo-session malformed JSON returns 500', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ invalid-json',
  });
  assert.equal(res.status, 500);
});

test('Empirical HTTP: DELETE /api/auth/demo-session clears cookie', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/demo-session`, {
    method: 'DELETE',
  });
  assert.equal(res.status, 200);
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'Should return Set-Cookie');
  assert.ok(setCookie.includes('Max-Age=0') || setCookie.includes('expires='), 'Should invalidate cookie');
});

test('Empirical Middleware: Unauthenticated user redirected to /login', async () => {
  const res = await fetch(`${BASE_URL}/learner`, { redirect: 'manual' });
  assert.ok([307, 308].includes(res.status), `Expected redirect, got ${res.status}`);
  const location = res.headers.get('location');
  assert.ok(location?.includes('/login'), `Expected /login redirect, got ${location}`);
});

test('Empirical Middleware: Learner session can access /learner', async () => {
  const learnerId = 'c0000000-0000-0000-0000-000000000001';
  const res = await fetch(`${BASE_URL}/learner`, {
    headers: { Cookie: `fsl_demo_session=${learnerId}` },
    redirect: 'manual',
  });
  assert.equal(res.status, 200);
});

test('Empirical Middleware: Learner session attempting /admin redirected to /learner', async () => {
  const learnerId = 'c0000000-0000-0000-0000-000000000001';
  const res = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: `fsl_demo_session=${learnerId}` },
    redirect: 'manual',
  });
  assert.ok([307, 308].includes(res.status));
  const location = res.headers.get('location');
  assert.ok(location?.endsWith('/learner'), `Expected redirect to /learner, got ${location}`);
});

test('Empirical Middleware: Professor session can access /professor', async () => {
  const profId = 'b0000000-0000-0000-0000-000000000001';
  const res = await fetch(`${BASE_URL}/professor`, {
    headers: { Cookie: `fsl_demo_session=${profId}` },
    redirect: 'manual',
  });
  assert.equal(res.status, 200);
});

test('Empirical Middleware: Professor session attempting /admin redirected to /professor', async () => {
  const profId = 'b0000000-0000-0000-0000-000000000001';
  const res = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: `fsl_demo_session=${profId}` },
    redirect: 'manual',
  });
  assert.ok([307, 308].includes(res.status));
  const location = res.headers.get('location');
  assert.ok(location?.endsWith('/professor'), `Expected redirect to /professor, got ${location}`);
});

test('Empirical Middleware: Admin session can access /admin', async () => {
  const adminId = 'a0000000-0000-0000-0000-000000000001';
  const res = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: `fsl_demo_session=${adminId}` },
    redirect: 'manual',
  });
  assert.equal(res.status, 200);
});

test('Empirical Middleware: Authenticated user visiting /login redirected to role dashboard', async () => {
  const adminId = 'a0000000-0000-0000-0000-000000000001';
  const res = await fetch(`${BASE_URL}/login`, {
    headers: { Cookie: `fsl_demo_session=${adminId}` },
    redirect: 'manual',
  });
  assert.ok([307, 308].includes(res.status));
  const location = res.headers.get('location');
  assert.ok(location?.endsWith('/admin'), `Expected redirect to /admin, got ${location}`);
});

test('Empirical UI: DemoRoleBanner rendered on pages with accessible attributes', async () => {
  const learnerId = 'c0000000-0000-0000-0000-000000000001';
  const res = await fetch(`${BASE_URL}/learner`, {
    headers: { Cookie: `fsl_demo_session=${learnerId}` },
  });
  assert.equal(res.status, 200);
  const html = await res.text();

  assert.ok(html.includes('Testing and Role Switcher Toolbar'), 'Toolbar aside label must be rendered');
  assert.ok(html.includes('Active Persona:'), 'Active Persona section must be rendered');
  assert.ok(html.includes('LEARNER'), 'Active role learner must be displayed');
  assert.ok(html.includes('Quick Switch:'), 'Quick switch toolbar must be present');
  assert.ok(html.includes('Sign Out'), 'Sign out button must be present when logged in');
  assert.ok(html.includes('Expand accounts menu') || html.includes('Collapse accounts menu'), 'Accounts menu toggle must have accessible aria-label');
});
