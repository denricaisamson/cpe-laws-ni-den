import React from 'react';
import { redirect } from 'next/navigation';
import { getServerUserSession } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { DemoRoleBanner } from '@/components/layout/DemoRoleBanner';

export const metadata = {
  title: 'Professor Portal | FSL Workshop System',
  description: 'Manage classroom sections, meeting links, attendance, and student assignments.',
};

export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerUserSession();

  if (!session) {
    redirect('/login?redirect=/professor');
  }

  if (session.role !== 'professor') {
    redirect(session.role === 'admin' ? '/admin' : '/learner');
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
