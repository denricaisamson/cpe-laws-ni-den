import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database, Profile, UserRole } from '@/types/database';
import { DEMO_COOKIE_NAME, parseDemoSession } from './session';

export interface MiddlewareSessionResult {
  response: NextResponse;
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  role: UserRole | null;
}

export async function updateSession(request: NextRequest): Promise<MiddlewareSessionResult> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let user: { id: string; email?: string } | null = null;
  let profile: Profile | null = null;
  let role: UserRole | null = null;

  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      user = { id: authUser.id, email: authUser.email };
      const { data: dbProfile } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (dbProfile) {
        const typedProfile = dbProfile as Profile;
        profile = typedProfile;
        role = typedProfile.role;
      }
    }
  } catch {
    // Supabase auth service not reachable or placeholder
  }

  // Fallback to demo session cookie
  if (!user || !role) {
    const demoCookie = request.cookies.get(DEMO_COOKIE_NAME)?.value;
    const demoProfile = parseDemoSession(demoCookie);
    if (demoProfile) {
      user = { id: demoProfile.id, email: demoProfile.email };
      profile = demoProfile;
      role = demoProfile.role;
    }
  }

  return { response, user, profile, role };
}
