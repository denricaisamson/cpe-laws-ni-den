import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { AdminDashboardClient } from './AdminDashboardClient';

export const metadata = {
  title: 'Admin Console | FSL Workshop System',
  description: 'Manage workshops, schedules, users, payment verification, and financial summaries.',
};

export default async function AdminDashboardPage() {
  const session = await getServerUserSession();
  const adminName = session?.profile.name || 'Administrator';

  return <AdminDashboardClient adminName={adminName} />;
}
