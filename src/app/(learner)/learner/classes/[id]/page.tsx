import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { ClassDetailClient } from './ClassDetailClient';

export const metadata = {
  title: 'Classroom & Live Session | FSL Workshop System',
  description: 'Class details, prominent Zoom / Google Meet link, attendance history, and class announcements.',
};

export default async function LearnerClassDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerUserSession();
  const learnerId = session?.user.id || 'c0000000-0000-0000-0000-000000000001';
  const learnerName = session?.profile.name || 'Learner';

  return (
    <ClassDetailClient
      classId={params.id}
      initialLearnerId={learnerId}
      initialLearnerName={learnerName}
    />
  );
}
