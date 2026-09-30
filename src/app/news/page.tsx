import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { DemoRoleBanner } from '@/components/layout/DemoRoleBanner';
import { NewsClient } from './NewsClient';

export const metadata = {
  title: 'Community News & SDEAS Announcements | FSL System',
  description: 'Latest news, Deaf Festival updates, and community spotlights.',
};

export default async function NewsPage() {
  const session = await getServerUserSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DemoRoleBanner currentRole={session?.role} currentUserName={session?.profile.name} />
      <Navbar currentRole={session?.role} currentUserName={session?.profile.name} />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <NewsClient />
      </main>
    </div>
  );
}
