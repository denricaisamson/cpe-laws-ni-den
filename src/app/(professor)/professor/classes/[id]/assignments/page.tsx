import React from 'react';
import { ClassAssignmentsClient } from './ClassAssignmentsClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ClassAssignmentsPage({ params }: PageProps) {
  return <ClassAssignmentsClient scheduleId={params.id} />;
}
