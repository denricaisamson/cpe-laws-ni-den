import React from 'react';
import { redirect } from 'next/navigation';
import { getServerUserSession } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { DemoRoleBanner } from '@/components/layout/DemoRoleBanner';

export const metadata = {
  title: 'Learner Portal | FSL Workshop System',
  description: 'Learner dashboard, class schedules, assignments, and study center.',
};

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerUserSession();

  if (!session) {
    redirect('/login?redirect=/learner');
  }

  if (session.role !== 'learner') {
    redirect(session.role === 'admin' ? '/admin' : '/professor');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DemoRoleBanner currentRole={session.role} currentUserName={session.profile.name} />
      <Navbar currentRole={session.role} currentUserName={session.profile.name} />

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
