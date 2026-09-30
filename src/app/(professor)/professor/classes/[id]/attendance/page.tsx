import React from 'react';
import { ClassAttendanceClient } from './ClassAttendanceClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ClassAttendancePage({ params }: PageProps) {
  return <ClassAttendanceClient scheduleId={params.id} />;
}
