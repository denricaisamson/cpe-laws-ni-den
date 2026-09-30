import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { AnnouncementsPublishingClient } from './AnnouncementsPublishingClient';

export default async function ProfessorAnnouncementsPage() {
  const session = await getServerUserSession();
  const profName = session?.profile.name || 'Professor';
  const profId = session?.user.id;

  return (
    <AnnouncementsPublishingClient
      initialProfId={profId}
      initialProfName={profName}
    />
  );
}
