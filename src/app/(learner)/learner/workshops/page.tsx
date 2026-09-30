import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { WorkshopCatalogClient } from './WorkshopCatalogClient';

export const metadata = {
  title: 'Workshop Catalog & Enrollment | FSL Workshop System',
  description: 'Browse Filipino Sign Language workshop offerings for Levels 1, 2, and 3 with schedule selection and simulated checkout.',
};

export default async function LearnerWorkshopsPage() {
  const session = await getServerUserSession();
  const learnerId = session?.user.id || 'c0000000-0000-0000-0000-000000000001';
  const learnerName = session?.profile.name || 'Learner';

  return (
    <WorkshopCatalogClient
      initialLearnerId={learnerId}
      initialLearnerName={learnerName}
    />
  );
}
