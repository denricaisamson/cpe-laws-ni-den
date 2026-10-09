'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/types/database';
import { DEMO_USERS, DEMO_COOKIE_NAME } from '@/lib/supabase/session';
import { Shield, GraduationCap, BookOpen, LogOut, ChevronDown, ChevronUp } from 'lucide-react';

interface DemoRoleBannerProps {
  currentRole?: UserRole | null;
  currentUserName?: string | null;
}

export function DemoRoleBanner({ currentRole, currentUserName }: DemoRoleBannerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<UserRole | null>(currentRole || null);
  const [activeName, setActiveName] = useState<string | null>(currentUserName || null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentRole) setActiveRole(currentRole);
    if (currentUserName) setActiveName(currentUserName);

    // Read cookie directly to sync if client state changes
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${DEMO_COOKIE_NAME}=`))
      ?.split('=')[1];

    if (cookie) {
      try {
        const decoded = decodeURIComponent(cookie.trim());
        const target = decoded.startsWith('{') ? decoded : cookie.trim().startsWith('{') ? cookie.trim() : null;
        if (target) {
          const parsed = JSON.parse(target);
          if (parsed.role) setActiveRole(parsed.role);
          if (parsed.name) setActiveName(parsed.name);
          return;
        }
      } catch {
        // Not a JSON cookie
      }

      const match = DEMO_USERS.find((u) => u.id === cookie || u.role === cookie);
      if (match) {
        setActiveRole(match.role);
        setActiveName(match.name);
      }
    }
  }, [pathname, currentRole, currentUserName]);

  const handleSwitchRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    const demoUser = DEMO_USERS.find((u) => u.role === targetRole);
    if (!demoUser) return;

    try {
      // Set cookie directly for instant synchronous access
      document.cookie = `${DEMO_COOKIE_NAME}=${demoUser.id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      // Also call API endpoint for full server synchronization
      await fetch('/api/auth/demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: demoUser.id, role: demoUser.role }),
      });

      setActiveRole(demoUser.role);
      setActiveName(demoUser.name);

      const targetPath =
        demoUser.role === 'admin'
          ? '/admin'
          : demoUser.role === 'professor'
          ? '/professor'
          : '/learner';

      router.push(targetPath);
      router.refresh();
    } catch (err) {
      console.error('Error switching demo role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      document.cookie = `${DEMO_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
      await fetch('/api/auth/demo-session', { method: 'DELETE' });
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {}
      setActiveRole(null);
      setActiveName(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside
      aria-label="Testing and Role Switcher Toolbar"
      className="w-full bg-slate-900 text-white border-b-2 border-amber-400 text-xs shadow-md relative z-30 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[11px] tracking-wider uppercase">
            Demo Tool
          </span>
          <span className="font-bold text-slate-200 hidden sm:inline">Active Persona:</span>
          {activeRole ? (
            <span className="inline-flex items-center gap-1.5 font-black text-amber-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {activeRole === 'admin' && <Shield className="w-3.5 h-3.5 text-purple-400" />}
              {activeRole === 'professor' && <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />}
              {activeRole === 'learner' && <BookOpen className="w-3.5 h-3.5 text-sky-400" />}
              <span className="uppercase">{activeRole}</span>
              {activeName && <span className="text-slate-300 font-normal">({activeName})</span>}
            </span>
          ) : (
            <span className="text-slate-400 italic">Guest / Logged Out</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1 hidden md:inline">Quick Switch:</span>

          <button
            type="button"
            onClick={() => handleSwitchRole('learner')}
            disabled={isLoading}
            className={`px-2.5 py-1 rounded font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 flex items-center gap-1 ${
              activeRole === 'learner'
                ? 'bg-sky-600 text-white border border-sky-400 shadow-xs'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <BookOpen className="w-3 h-3 text-sky-300" />
            <span>Learner</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchRole('professor')}
            disabled={isLoading}
            className={`px-2.5 py-1 rounded font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 flex items-center gap-1 ${
              activeRole === 'professor'
                ? 'bg-indigo-600 text-white border border-indigo-400 shadow-xs'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <GraduationCap className="w-3 h-3 text-indigo-300" />
            <span>Professor</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchRole('admin')}
            disabled={isLoading}
            className={`px-2.5 py-1 rounded font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 flex items-center gap-1 ${
              activeRole === 'admin'
                ? 'bg-purple-600 text-white border border-purple-400 shadow-xs'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Shield className="w-3 h-3 text-purple-300" />
            <span>Admin</span>
          </button>

          {activeRole && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              title="Sign Out"
              aria-label="Sign Out"
              className="px-2 py-1 bg-rose-950 text-rose-200 hover:bg-rose-900 border border-rose-800 rounded font-bold flex items-center gap-1 ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse accounts menu' : 'Expand accounts menu'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-950 border-t border-slate-800 px-4 py-3">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3">
            {DEMO_USERS.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSwitchRole(user.role)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSwitchRole(user.role);
                }}
                className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                  activeRole === user.role
                    ? 'border-amber-400 bg-slate-900'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white">{user.label}</span>
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                    {user.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{user.description}</p>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">{user.email}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
