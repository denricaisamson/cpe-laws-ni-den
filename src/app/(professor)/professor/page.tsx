import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { ProfessorDashboardClient } from './ProfessorDashboardClient';

export default async function ProfessorDashboardPage() {
  const session = await getServerUserSession();
  const profName = session?.profile.name || 'Professor';
  const profId = session?.user.id;

  return (
    <ProfessorDashboardClient
      initialProfName={profName}
      initialProfId={profId}
    />
  );
}
