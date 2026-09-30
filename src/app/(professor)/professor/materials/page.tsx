import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { MaterialsPublishingClient } from './MaterialsPublishingClient';

export default async function ProfessorMaterialsPage() {
  const session = await getServerUserSession();
  const profName = session?.profile.name || 'Professor';
  const profId = session?.user.id;

  return (
    <MaterialsPublishingClient
      initialProfId={profId}
      initialProfName={profName}
    />
  );
}
