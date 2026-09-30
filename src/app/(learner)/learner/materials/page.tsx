import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { LearningMaterialsClient } from './LearningMaterialsClient';

export const metadata = {
  title: 'Learning Materials & FSL Video Hub | FSL Workshop System',
  description: 'Access official course handouts, study guides, and the FSL Video Library with speed controls and the 6 grounded curriculum categories.',
};

export default async function LearnerMaterialsPage() {
  const session = await getServerUserSession();
  const learnerId = session?.user.id || 'c0000000-0000-0000-0000-000000000001';
  const learnerName = session?.profile.name || 'Learner';

  return (
    <LearningMaterialsClient
      initialLearnerId={learnerId}
      initialLearnerName={learnerName}
    />
  );
}
