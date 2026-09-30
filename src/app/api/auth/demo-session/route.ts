import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_COOKIE_NAME, findDemoProfile } from '@/lib/supabase/session';
import { getServerUserSession } from '@/lib/supabase/server';

export async function GET() {
  const session = await getServerUserSession();
  return NextResponse.json({ session });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = body.userId || body.email || body.role || 'learner';
    const profile = findDemoProfile(identifier);

    if (!profile) {
      return NextResponse.json(
        { error: `Demo profile not found for identifier: ${identifier}` },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      profile,
      role: profile.role,
    });

    // Set demo session cookie for Edge middleware & Server components
    response.cookies.set({
      name: DEMO_COOKIE_NAME,
      value: profile.id,
      path: '/',
      httpOnly: false, // Accessible to client-side scripts as well
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.set({
    name: DEMO_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
  });
  return response;
}
