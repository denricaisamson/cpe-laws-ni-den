import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database, Profile, UserRole } from '@/types/database';
import { DEMO_COOKIE_NAME, parseDemoSession } from './session';

export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing sessions.
        }
      },
    },
  });
}

export interface UserSession {
  user: {
    id: string;
    email?: string;
  };
  profile: Profile;
  role: UserRole;
}

/**
 * Resolves the authenticated user session and associated profile.
 * Supports Supabase Auth with fallback to demo session cookie for local/demo testing.
 */
export async function getServerUserSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const supabase = createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Query profiles table
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        const typedProfile = profile as Profile;
        return {
          user: { id: user.id, email: user.email },
          profile: typedProfile,
          role: typedProfile.role,
        };
      }
    }
  } catch {
    // If Supabase connection fails or is placeholder, fall through to demo session
  }

  // Fallback to demo cookie session
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)?.value;
  const demoProfile = parseDemoSession(demoCookie);

  if (demoProfile) {
    return {
      user: { id: demoProfile.id, email: demoProfile.email },
      profile: demoProfile,
      role: demoProfile.role,
    };
  }

  // If cookie is a direct user UUID or ID not in mock list, check Supabase profiles
  if (demoCookie && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      const cleanId = decodeURIComponent(demoCookie).trim();
      const { data: dbProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', cleanId)
        .single();

      if (dbProfile) {
        return {
          user: { id: dbProfile.id, email: dbProfile.email },
          profile: dbProfile as Profile,
          role: dbProfile.role as UserRole,
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}
