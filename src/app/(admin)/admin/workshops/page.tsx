import React from 'react';
import { WorkshopsManagementClient } from './WorkshopsManagementClient';

export const metadata = {
  title: 'Workshops & Schedules | FSL Admin Console',
  description: 'Manage FSL Levels 1-3 offerings, tuition fees, faculty assignments, slot limits, and online meeting links.',
};

export default function WorkshopsPage() {
  return <WorkshopsManagementClient />;
}
