import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { LearnerProgressionClient } from './LearnerProgressionClient';

export const metadata = {
  title: 'Learner Progression & Academic Pathways | FSL Workshop System',
  description: 'Track your FSL Level 1, 2, and 3 progression roadmap, certificate readiness, and explore collegiate BSLI and Applied Deaf Studies pathways.',
};

export default async function LearnerProgressionPage() {
  const session = await getServerUserSession();
  const learnerId = session?.user.id || 'c0000000-0000-0000-0000-000000000001';
  const learnerName = session?.profile.name || 'Learner';

  return (
    <LearnerProgressionClient
      initialLearnerId={learnerId}
      initialLearnerName={learnerName}
    />
  );
}
