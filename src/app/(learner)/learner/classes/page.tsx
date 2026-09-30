import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { LearnerClassesClient } from './LearnerClassesClient';

export const metadata = {
  title: 'My Classes & Enrolled Cohorts | FSL Workshop System',
  description: 'View your enrolled Filipino Sign Language workshops, meeting links, attendance records, and announcements.',
};

export default async function LearnerClassesPage() {
  const session = await getServerUserSession();
  const learnerId = session?.user.id || 'c0000000-0000-0000-0000-000000000001';
  const learnerName = session?.profile.name || 'Learner';

  return (
    <LearnerClassesClient
      initialLearnerId={learnerId}
      initialLearnerName={learnerName}
    />
  );
}
