import React from 'react';
import { getServerUserSession } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { DemoRoleBanner } from '@/components/layout/DemoRoleBanner';
import { MerchandiseClient } from './MerchandiseClient';

export const metadata = {
  title: 'Official FSL Merchandise Store | FSL Workshop System',
  description: 'Support FSL advocacy with official shirts, bags, and enamel pins.',
};

export default async function MerchandisePage() {
  const session = await getServerUserSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DemoRoleBanner currentRole={session?.role} currentUserName={session?.profile.name} />
      <Navbar currentRole={session?.role} currentUserName={session?.profile.name} />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <MerchandiseClient />
      </main>
    </div>
  );
}
