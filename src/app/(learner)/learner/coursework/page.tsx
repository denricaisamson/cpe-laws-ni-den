import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { LearnerCourseworkClient } from './LearnerCourseworkClient';

export const metadata = {
  title: 'Coursework & Assignments | FSL Workshop System',
  description: 'View assigned signing drills, submit video recording links, and review instructor grades and written feedback.',
};

export default async function LearnerCourseworkPage() {
  const session = await getServerUserSession();
  const learnerId = session?.user.id || 'c0000000-0000-0000-0000-000000000001';
  const learnerName = session?.profile.name || 'Learner';

  return (
    <LearnerCourseworkClient
      initialLearnerId={learnerId}
      initialLearnerName={learnerName}
    />
  );
}
