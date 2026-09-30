import React from 'react';
import { redirect } from 'next/navigation';
import { getServerUserSession } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { DemoRoleBanner } from '@/components/layout/DemoRoleBanner';
import { MessagesClient } from './MessagesClient';

export const metadata = {
  title: 'Direct Messaging | FSL Workshop System',
  description: 'Threaded direct communication between learners, professors, and administrators.',
};

export default async function MessagesPage() {
  const session = await getServerUserSession();

  if (!session) {
    redirect('/login?redirect=/messages');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DemoRoleBanner currentRole={session.role} currentUserName={session.profile.name} />
      <Navbar currentRole={session.role} currentUserName={session.profile.name} />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessagesClient
          initialUserId={session.user.id}
          initialRole={session.role}
          initialUserName={session.profile.name}
        />
      </main>
    </div>
  );
}
