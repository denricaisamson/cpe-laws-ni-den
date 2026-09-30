import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { SchedulesManagementClient } from './SchedulesManagementClient';

export default async function ProfessorSchedulesPage() {
  const session = await getServerUserSession();
  const profName = session?.profile.name || 'Professor';
  const profId = session?.user.id;

  return (
    <SchedulesManagementClient
      initialProfId={profId}
      initialProfName={profName}
    />
  );
}
