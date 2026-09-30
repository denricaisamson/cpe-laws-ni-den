import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const VALID_ROLES = ['learner', 'professor', 'admin'] as const;

export async function middleware(request: NextRequest) {
  const { response, user, role } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isLearnerRoute = path.startsWith('/learner');
  const isProfessorRoute = path.startsWith('/professor');
  const isAdminRoute = path.startsWith('/admin');
  const isMessagesRoute = path.startsWith('/messages');
  const isProtectedRoute = isLearnerRoute || isProfessorRoute || isAdminRoute || isMessagesRoute;
  const isAuthRoute = path === '/login' || path === '/register';

  // 1. Unauthenticated users or users without an assigned role visiting protected routes -> Redirect to /login
  if (isProtectedRoute && (!user || !role || !VALID_ROLES.includes(role as any))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    loginUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(loginUrl);
  }

  // Determine designated dashboard with clean fallback to /learner for unhandled roles
  const designatedDashboard =
    role === 'admin' ? '/admin' : role === 'professor' ? '/professor' : '/learner';

  // 2. Authenticated users visiting login or register -> Redirect to their role portal
  if (isAuthRoute && user && role) {
    return NextResponse.redirect(new URL(designatedDashboard, request.url));
  }

  // 3. Authenticated users attempting cross-role access -> Redirect to their designated dashboard
  if (user && role) {
    if (isLearnerRoute && role !== 'learner') {
      return NextResponse.redirect(new URL(designatedDashboard, request.url));
    }

    if (isProfessorRoute && role !== 'professor') {
      return NextResponse.redirect(new URL(designatedDashboard, request.url));
    }

    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL(designatedDashboard, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/learner/:path*',
    '/professor/:path*',
    '/admin/:path*',
    '/messages/:path*',
    '/login',
    '/register',
  ],
};
