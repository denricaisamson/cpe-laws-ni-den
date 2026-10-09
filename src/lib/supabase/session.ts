import type { Profile, UserRole } from '@/types/database';
import { mockProfiles } from '@/lib/mock-data';

export const DEMO_USERS = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Maria Elena Santos',
    email: 'admin@fsl.edu.ph',
    role: 'admin' as UserRole,
    label: 'Admin (Maria Santos)',
    description: 'System administration, workshop approvals & financial reports',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Rommel Agravante',
    email: 'prof.rommel@fsl.edu.ph',
    role: 'professor' as UserRole,
    label: 'Professor (Rommel Agravante)',
    description: 'Master FSL teacher, live sessions & attendance marking',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Liza Flores',
    email: 'prof.liza@fsl.edu.ph',
    role: 'professor' as UserRole,
    label: 'Professor (Liza Flores)',
    description: 'FSL linguistics lecturer, grading & material uploads',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Juan Dela Cruz',
    email: 'learner.juan@fsl.edu.ph',
    role: 'learner' as UserRole,
    label: 'Learner (Juan Dela Cruz)',
    description: 'Level 1 beginner learner, enrollment & study center',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Maria Clara Bautista',
    email: 'learner.maria@fsl.edu.ph',
    role: 'learner' as UserRole,
    label: 'Learner (Maria Clara)',
    description: 'Level 2 active enrolled student, assignment submissions',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Bea Alonzo',
    email: 'learner.bea@fsl.edu.ph',
    role: 'learner' as UserRole,
    label: 'Learner (Bea Alonzo)',
    description: 'Level 3 advanced learner, BSLI progression candidate',
  },
];

export const DEMO_COOKIE_NAME = 'fsl_demo_session';

/**
 * Resolves a profile by ID, email, or role from mock profiles or demo user accounts.
 */
export function findDemoProfile(identifier: string): Profile | null {
  if (!identifier) return null;
  const lower = identifier.toLowerCase().trim();

  // Try exact match on ID or email
  const match = mockProfiles.find(
    (p) => p.id.toLowerCase() === lower || p.email.toLowerCase() === lower
  );
  if (match) return match;

  // Check test harness aliases
  if (lower === 'admin-1' || lower === 'admin@fsl-workshop.ph') {
    return mockProfiles.find((p) => p.role === 'admin') || null;
  }
  if (lower === 'prof-1' || lower === 'juan.delacruz@fsl-workshop.ph') {
    return mockProfiles.find((p) => p.role === 'professor') || null;
  }
  if (lower === 'prof-2' || lower === 'elena.ramos@fsl-workshop.ph') {
    return mockProfiles.filter((p) => p.role === 'professor')[1] || mockProfiles.find((p) => p.role === 'professor') || null;
  }
  if (lower === 'learner-1' || lower === 'mark.bautista@gmail.com') {
    return mockProfiles.find((p) => p.role === 'learner') || null;
  }
  if (lower === 'learner-2' || lower === 'sarah.chen@gmail.com') {
    return mockProfiles.filter((p) => p.role === 'learner')[1] || mockProfiles.find((p) => p.role === 'learner') || null;
  }
  if (lower === 'learner-3' || lower === 'david.reyes@gmail.com') {
    return mockProfiles.filter((p) => p.role === 'learner')[2] || mockProfiles.find((p) => p.role === 'learner') || null;
  }

  // Check role fallback (e.g. "admin", "professor", "learner")
  if (lower === 'admin' || lower === 'professor' || lower === 'learner') {
    return mockProfiles.find((p) => p.role === lower) || null;
  }

  return null;
}

/**
 * Parses demo session string (either user ID, JSON, or role name).
 */
export function parseDemoSession(cookieValue: string | undefined | null): Profile | null {
  if (!cookieValue) return null;

  try {
    const raw = cookieValue.trim();
    const decoded = decodeURIComponent(raw);
    const target = decoded.startsWith('{') ? decoded : raw.startsWith('{') ? raw : null;

    if (target) {
      const parsed = JSON.parse(target);
      if (parsed.id && parsed.name && parsed.role) return parsed as Profile;
      if (parsed.id) return findDemoProfile(parsed.id) || (parsed as Profile);
      if (parsed.email) return findDemoProfile(parsed.email) || (parsed as Profile);
      if (parsed.role) return findDemoProfile(parsed.role) || null;
    }
  } catch {
    // Ignore JSON parse error, treat as raw identifier
  }

  return findDemoProfile(cookieValue);
}

