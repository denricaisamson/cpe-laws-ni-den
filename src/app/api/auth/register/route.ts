import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DEMO_COOKIE_NAME } from '@/lib/supabase/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, bio } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const cleanBio = bio ? String(bio).trim() : null;

    let userId: string = '';
    let createdProfile: {
      id: string;
      name: string;
      email: string;
      role: 'learner';
      bio?: string | null;
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes('placeholder')) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // 1. Check if user already exists in profiles table
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, email, name, role')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingProfile) {
        userId = existingProfile.id;
        // Update user password and ensure email is confirmed
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password,
          email_confirm: true,
          user_metadata: { name: cleanName, role: 'learner' },
        });

        if (updateErr) {
          return NextResponse.json({ error: updateErr.message }, { status: 400 });
        }

        // Update profile record
        await supabaseAdmin
          .from('profiles')
          .update({
            name: cleanName,
            bio: cleanBio,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        createdProfile = {
          id: userId,
          name: cleanName,
          email: cleanEmail,
          role: 'learner',
          bio: cleanBio,
        };
      } else {
        // Create user in auth.users with pre-confirmed email
        const { data: createdUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: { name: cleanName, role: 'learner' },
        });

        if (createErr) {
          return NextResponse.json({ error: createErr.message }, { status: 400 });
        }

        userId = createdUser.user.id;

        // Upsert into public.profiles
        await supabaseAdmin.from('profiles').upsert({
          id: userId,
          name: cleanName,
          email: cleanEmail,
          role: 'learner',
          bio: cleanBio,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        createdProfile = {
          id: userId,
          name: cleanName,
          email: cleanEmail,
          role: 'learner',
          bio: cleanBio,
        };
      }
    } else {
      // Offline / demo fallback mode
      userId = `c${Date.now()}`;
      createdProfile = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        role: 'learner',
        bio: cleanBio,
      };
    }

    const sessionData = {
      id: createdProfile.id,
      name: createdProfile.name,
      email: createdProfile.email,
      role: createdProfile.role,
    };

    const response = NextResponse.json({
      success: true,
      profile: sessionData,
      role: 'learner',
    });

    // Set cookie on response
    response.cookies.set({
      name: DEMO_COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(sessionData)),
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || 'Registration failed' },
      { status: 500 }
    );
  }
}
