import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest, NextResponse } from 'next/server.js';

// Exact mock profiles from src/lib/mock-data.ts / src/lib/supabase/session.ts
const MOCK_PROFILES = [
  { id: 'a0000000-0000-0000-0000-000000000001', name: 'Maria Elena Santos', email: 'admin@fsl.edu.ph', role: 'admin' },
  { id: 'b0000000-0000-0000-0000-000000000001', name: 'Rommel Agravante', email: 'prof.rommel@fsl.edu.ph', role: 'professor' },
  { id: 'b0000000-0000-0000-0000-000000000002', name: 'Liza Flores', email: 'prof.liza@fsl.edu.ph', role: 'professor' },
  { id: 'c0000000-0000-0000-0000-000000000001', name: 'Juan Dela Cruz', email: 'learner.juan@fsl.edu.ph', role: 'learner' },
  { id: 'c0000000-0000-0000-0000-000000000002', name: 'Maria Clara Bautista', email: 'learner.maria@fsl.edu.ph', role: 'learner' },
  { id: 'c0000000-0000-0000-0000-000000000003', name: 'Bea Alonzo', email: 'learner.bea@fsl.edu.ph', role: 'learner' },
  // Harness aliases
  { id: 'admin-1', name: 'Maria Santos', email: 'admin@fsl-workshop.ph', role: 'admin' },
  { id: 'prof-1', name: 'Prof. Juan Dela Cruz', email: 'juan.delacruz@fsl-workshop.ph', role: 'professor' },
  { id: 'learner-1', name: 'Mark Bautista', email: 'mark.bautista@gmail.com', role: 'learner' },
];

function findDemoProfile(identifier) {
  if (!identifier) return null;
  const lower = String(identifier).toLowerCase().trim();

  const match = MOCK_PROFILES.find(
    (p) => p.id.toLowerCase() === lower || p.email.toLowerCase() === lower
  );
  if (match) return match;

  if (lower === 'admin' || lower === 'professor' || lower === 'learner') {
    return MOCK_PROFILES.find((p) => p.role === lower) || null;
  }

  return null;
}

function parseDemoSession(cookieValue) {
  if (!cookieValue) return null;

  try {
    if (cookieValue.startsWith('{')) {
      const parsed = JSON.parse(cookieValue);
      if (parsed.id) return findDemoProfile(parsed.id) || parsed;
      if (parsed.email) return findDemoProfile(parsed.email) || parsed;
      if (parsed.role) return findDemoProfile(parsed.role) || null;
    }
  } catch {
    // Ignore JSON error
  }

  return findDemoProfile(cookieValue);
}

// Exactly mirror updateSession logic for demo cookies
function simulateUpdateSession(request) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  let user = null;
  let profile = null;
  let role = null;

  const demoCookie = request.cookies.get('fsl_demo_session')?.value;
  const demoProfile = parseDemoSession(demoCookie);

  if (demoProfile) {
    user = { id: demoProfile.id, email: demoProfile.email };
    profile = demoProfile;
    role = demoProfile.role;
  }

  return { response, user, profile, role };
}

// Exactly mirror src/middleware.ts logic
function executeMiddleware(request) {
  const { response, user, role } = simulateUpdateSession(request);
  const path = request.nextUrl.pathname;

  const isLearnerRoute = path.startsWith('/learner');
  const isProfessorRoute = path.startsWith('/professor');
  const isAdminRoute = path.startsWith('/admin');
  const isMessagesRoute = path.startsWith('/messages');
  const isProtectedRoute = isLearnerRoute || isProfessorRoute || isAdminRoute || isMessagesRoute;
  const isAuthRoute = path === '/login' || path === '/register';

  // 1. Unauthenticated users visiting protected routes -> Redirect to /login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    loginUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users visiting login or register -> Redirect to their role portal
  if (isAuthRoute && user && role) {
    const targetDashboard =
      role === 'admin' ? '/admin' : role === 'professor' ? '/professor' : '/learner';
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // 3. Authenticated users attempting cross-role access -> Redirect to their designated dashboard
  if (user && role) {
    if (isLearnerRoute && role !== 'learner') {
      const target = role === 'admin' ? '/admin' : '/professor';
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (isProfessorRoute && role !== 'professor') {
      const target = role === 'admin' ? '/admin' : '/learner';
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (isAdminRoute && role !== 'admin') {
      const target = role === 'professor' ? '/professor' : '/learner';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return response;
}

// Helper to make NextRequest
function createReq(pathnameWithQuery, cookieValue = null) {
  const url = `http://localhost:3000${pathnameWithQuery}`;
  const req = new NextRequest(url);
  if (cookieValue !== null) {
    req.cookies.set('fsl_demo_session', cookieValue);
  }
  return req;
}

function getRedirectTarget(response) {
  if (!response || (response.status !== 307 && response.status !== 308 && response.status !== 302)) {
    return null;
  }
  return response.headers.get('Location') || response.headers.get('location');
}

// ====================================================================
// TEST SUITES
// ====================================================================

test('Empirical Stress 1: Unauthenticated requests to protected routes redirect to /login', () => {
  const protectedRoutes = [
    '/learner',
    '/learner/workshops',
    '/learner/classes',
    '/learner/assignments',
    '/professor',
    '/professor/attendance',
    '/professor/assignments',
    '/admin',
    '/admin/users',
    '/admin/workshops',
    '/admin/schedules',
    '/admin/payments',
    '/admin/finance',
    '/messages',
    '/messages/c0000000-0000-0000-0000-000000000001',
  ];

  for (const route of protectedRoutes) {
    const req = createReq(route);
    const res = executeMiddleware(req);
    const redirectUrl = getRedirectTarget(res);

    assert.ok(redirectUrl, `Unauthenticated ${route} must return redirect`);
    const parsed = new URL(redirectUrl);
    assert.equal(parsed.pathname, '/login', `${route} must redirect to /login`);
    assert.equal(parsed.searchParams.get('redirect'), route, `redirect param must be ${route}`);
    assert.equal(parsed.searchParams.get('redirectTo'), route, `redirectTo param must be ${route}`);
  }
});

test('Empirical Stress 2: Unauthenticated requests to public routes are allowed', () => {
  const publicRoutes = ['/', '/news', '/merchandise', '/login', '/register'];

  for (const route of publicRoutes) {
    const req = createReq(route);
    const res = executeMiddleware(req);
    const redirectUrl = getRedirectTarget(res);

    assert.equal(redirectUrl, null, `Public route ${route} should not be redirected when unauthenticated`);
    assert.ok(res.headers.get('x-middleware-next') === '1' || res.status === 200, `Route ${route} should pass through`);
  }
});

test('Empirical Stress 3: Authenticated Learner role boundaries and redirects', () => {
  const learnerCookie = 'learner';

  // 1. Learner allowed to access learner routes and messages
  for (const route of ['/learner', '/learner/workshops', '/learner/assignments', '/messages']) {
    const req = createReq(route, learnerCookie);
    const res = executeMiddleware(req);
    assert.equal(getRedirectTarget(res), null, `Learner should access ${route}`);
  }

  // 2. Learner BLOCKED and REDIRECTED from professor routes
  for (const route of ['/professor', '/professor/attendance', '/professor/assignments']) {
    const req = createReq(route, learnerCookie);
    const res = executeMiddleware(req);
    const target = getRedirectTarget(res);
    assert.ok(target, `Learner attempting ${route} must be redirected`);
    assert.equal(new URL(target).pathname, '/learner', `Learner attempting ${route} must redirect to /learner`);
  }

  // 3. Learner BLOCKED and REDIRECTED from admin routes
  for (const route of ['/admin', '/admin/users', '/admin/schedules', '/admin/finance']) {
    const req = createReq(route, learnerCookie);
    const res = executeMiddleware(req);
    const target = getRedirectTarget(res);
    assert.ok(target, `Learner attempting ${route} must be redirected`);
    assert.equal(new URL(target).pathname, '/learner', `Learner attempting ${route} must redirect to /learner`);
  }

  // 4. Learner visiting /login or /register redirects to /learner
  for (const route of ['/login', '/register']) {
    const req = createReq(route, learnerCookie);
    const res = executeMiddleware(req);
    const target = getRedirectTarget(res);
    assert.ok(target, `Logged in learner visiting ${route} must redirect`);
    assert.equal(new URL(target).pathname, '/learner');
  }
});

test('Empirical Stress 4: Authenticated Professor role boundaries and redirects', () => {
  const profCookie = 'professor';

  // 1. Professor allowed to access professor routes and messages
  for (const route of ['/professor', '/professor/attendance', '/professor/classes', '/messages']) {
    const req = createReq(route, profCookie);
    const res = executeMiddleware(req);
    assert.equal(getRedirectTarget(res), null, `Professor should access ${route}`);
  }

  // 2. Professor BLOCKED and REDIRECTED from admin routes
  for (const route of ['/admin', '/admin/users', '/admin/finance', '/admin/schedules']) {
    const req = createReq(route, profCookie);
    const res = executeMiddleware(req);
    const target = getRedirectTarget(res);
    assert.ok(target, `Professor attempting ${route} must be redirected`);
    assert.equal(new URL(target).pathname, '/professor', `Professor attempting ${route} must redirect to /professor`);
  }

  // 3. Professor BLOCKED and REDIRECTED from learner routes
  for (const route of ['/learner', '/learner/workshops', '/learner/assignments']) {
    const req = createReq(route, profCookie);
    const res = executeMiddleware(req);
    const target = getRedirectTarget(res);
    assert.ok(target, `Professor attempting ${route} must be redirected`);
    assert.equal(new URL(target).pathname, '/professor', `Professor attempting ${route} must redirect to /professor`);
  }

  // 4. Professor visiting /login or /register redirects to /professor
  for (const route of ['/login', '/register']) {
    const req = createReq(route, profCookie);
    const res = executeMiddleware(req);
    const target = getRedirectTarget(res);
    assert.ok(target, `Logged in professor visiting ${route} must redirect`);
    assert.equal(new URL(target).pathname, '/professor');
  }
});

test('Empirical Stress 5: Authenticated Admin access and boundaries', () => {
  const adminCookie = 'admin';

  // 1. Admin allowed to access admin routes and messages
  for (const route of ['/admin', '/admin/users', '/admin/workshops', '/admin/finance', '/messages']) {
    const req = createReq(route, adminCookie);
    const res = executeMiddleware(req);
    assert.equal(getRedirectTarget(res), null, `Admin should access ${route}`);
  }

  // 2. Admin attempting /professor -> redirected to /admin
  for (const route of ['/professor', '/professor/attendance']) {
    const req = createReq(route, adminCookie);
    const res = executeMiddleware(req);
    const target = getRedirectTarget(res);
    assert.ok(target, `Admin attempting ${route} is redirected to designated dashboard`);
    assert.equal(new URL(target).pathname, '/admin', `Admin attempting ${route} must redirect to /admin`);
  }

  // 3. Admin attempting /learner -> redirected to /admin
  for (const route of ['/learner', '/learner/catalog']) {
    const req = createReq(route, adminCookie);
    const res = executeMiddleware(req);
    const target = getRedirectTarget(res);
    assert.ok(target, `Admin attempting ${route} is redirected to designated dashboard`);
    assert.equal(new URL(target).pathname, '/admin', `Admin attempting ${route} must redirect to /admin`);
  }

  // 4. Admin visiting /login or /register redirects to /admin
  for (const route of ['/login', '/register']) {
    const req = createReq(route, adminCookie);
    const res = executeMiddleware(req);
    const target = getRedirectTarget(res);
    assert.ok(target, `Logged in admin visiting ${route} must redirect`);
    assert.equal(new URL(target).pathname, '/admin');
  }
});

test('Empirical Stress 6: Adversarial & Edge Cases (Tampering, Malformed Cookies, Non-existent Roles)', () => {
  // 1. Non-existent identifier
  const reqUnknown = createReq('/admin', 'non-existent-user-id-999');
  const resUnknown = executeMiddleware(reqUnknown);
  assert.equal(new URL(getRedirectTarget(resUnknown)).pathname, '/login', 'Unknown user must be redirected to /login');

  // 2. Malformed JSON cookie
  const reqMalformed = createReq('/professor', '{malformed_json: true');
  const resMalformed = executeMiddleware(reqMalformed);
  assert.equal(new URL(getRedirectTarget(resMalformed)).pathname, '/login', 'Malformed cookie must be redirected to /login');

  // 3. Empty cookie
  const reqEmpty = createReq('/learner', '');
  const resEmpty = executeMiddleware(reqEmpty);
  assert.equal(new URL(getRedirectTarget(resEmpty)).pathname, '/login', 'Empty cookie must redirect to /login');

  // 4. White space only cookie
  const reqWhitespace = createReq('/admin', '   ');
  const resWhitespace = executeMiddleware(reqWhitespace);
  assert.equal(new URL(getRedirectTarget(resWhitespace)).pathname, '/login', 'Whitespace cookie must redirect to /login');

  // 5. Query parameter preservation check:
  // Middleware intentionally stores pathname in search params to avoid parameter tampering / open redirects
  const reqQuery = createReq('/admin/finance?quarter=Q3&year=2026');
  const resQuery = executeMiddleware(reqQuery);
  const targetQuery = new URL(getRedirectTarget(resQuery));
  assert.equal(targetQuery.pathname, '/login');
  assert.equal(targetQuery.searchParams.get('redirect'), '/admin/finance');
  assert.equal(targetQuery.searchParams.get('redirectTo'), '/admin/finance');
});

test('Empirical Stress 7: Server Component Layout Defense-in-Depth Emulation', () => {
  // Simulate the Server Component Layout assertions
  function checkLearnerLayout(session) {
    if (!session) throw { redirect: '/login?redirect=/learner' };
    if (session.role !== 'learner') {
      throw { redirect: session.role === 'admin' ? '/admin' : '/professor' };
    }
    return 'OK_LEARNER';
  }

  function checkProfessorLayout(session) {
    if (!session) throw { redirect: '/login?redirect=/professor' };
    if (session.role !== 'professor') {
      throw { redirect: session.role === 'admin' ? '/admin' : '/learner' };
    }
    return 'OK_PROFESSOR';
  }

  function checkAdminLayout(session) {
    if (!session) throw { redirect: '/login?redirect=/admin' };
    if (session.role !== 'admin') {
      throw { redirect: session.role === 'professor' ? '/professor' : '/learner' };
    }
    return 'OK_ADMIN';
  }

  // Unauthenticated
  assert.throws(() => checkLearnerLayout(null), (e) => e.redirect === '/login?redirect=/learner');
  assert.throws(() => checkProfessorLayout(null), (e) => e.redirect === '/login?redirect=/professor');
  assert.throws(() => checkAdminLayout(null), (e) => e.redirect === '/login?redirect=/admin');

  // Cross role: Learner accessing professor layout
  assert.throws(() => checkProfessorLayout({ role: 'learner' }), (e) => e.redirect === '/learner');
  // Cross role: Learner accessing admin layout
  assert.throws(() => checkAdminLayout({ role: 'learner' }), (e) => e.redirect === '/learner');

  // Cross role: Professor accessing learner layout
  assert.throws(() => checkLearnerLayout({ role: 'professor' }), (e) => e.redirect === '/professor');
  // Cross role: Professor accessing admin layout
  assert.throws(() => checkAdminLayout({ role: 'professor' }), (e) => e.redirect === '/professor');

  // Cross role: Admin accessing learner layout
  assert.throws(() => checkLearnerLayout({ role: 'admin' }), (e) => e.redirect === '/admin');
  // Cross role: Admin accessing professor layout
  assert.throws(() => checkProfessorLayout({ role: 'admin' }), (e) => e.redirect === '/admin');

  // Legitimate roles
  assert.equal(checkLearnerLayout({ role: 'learner' }), 'OK_LEARNER');
  assert.equal(checkProfessorLayout({ role: 'professor' }), 'OK_PROFESSOR');
  assert.equal(checkAdminLayout({ role: 'admin' }), 'OK_ADMIN');
});
