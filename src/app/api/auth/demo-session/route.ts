import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_COOKIE_NAME, findDemoProfile } from '@/lib/supabase/session';
import { getServerUserSession } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const session = await getServerUserSession();
  return NextResponse.json({ session });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = body.userId || body.id || body.email || body.role || 'learner';
    let profile: any = findDemoProfile(identifier);

    // If not found in mock profiles, check if full profile info was passed
    if (!profile && body.name && (body.userId || body.id)) {
      profile = {
        id: body.userId || body.id,
        name: body.name,
        email: body.email || '',
        role: body.role || 'learner',
        avatar_url: null,
        bio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // If still not found, check Supabase profiles table
    if (!profile && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const { data: dbProfile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', identifier)
          .single();

        if (dbProfile) {
          profile = dbProfile;
        }
      } catch {
        // ignore
      }
    }

    if (!profile) {
      return NextResponse.json(
        { error: `Profile not found for identifier: ${identifier}` },
        { status: 404 }
      );
    }

    const sessionData = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
    };

    const response = NextResponse.json({
      success: true,
      profile: sessionData,
      role: profile.role,
    });

    const cookieVal = encodeURIComponent(JSON.stringify(sessionData));

    // Set session cookie for Edge middleware & Server components
    response.cookies.set({
      name: DEMO_COOKIE_NAME,
      value: cookieVal,
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
