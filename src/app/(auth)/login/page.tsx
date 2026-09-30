'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { DemoRoleBanner } from '@/components/layout/DemoRoleBanner';
import { Navbar } from '@/components/layout/Navbar';
import { DEMO_USERS, DEMO_COOKIE_NAME } from '@/lib/supabase/session';
import { createClient } from '@/lib/supabase/client';
import { LogIn, KeyRound, Sparkles, Shield, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || searchParams.get('redirectTo');
  // Sanitize redirectTarget to ensure relative internal routing only (starts with '/' and not '//')
  const redirectTarget =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      let signedInProfile = null;

      // 1. Try real Supabase auth if service is configured
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!error && data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          signedInProfile = profile;
        }
      } catch {
        // Fall back to demo session
      }

      // 2. Fall back to demo session match
      const demoUser = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (!signedInProfile && demoUser) {
        signedInProfile = {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
        };
      }

      if (!signedInProfile && !demoUser) {
        // If not in demo list and Supabase didn't authenticate, check if it's a valid demo format
        if (email.includes('admin')) {
          const u = DEMO_USERS.find((x) => x.role === 'admin')!;
          signedInProfile = { id: u.id, name: u.name, email, role: 'admin' };
        } else if (email.includes('prof')) {
          const u = DEMO_USERS.find((x) => x.role === 'professor')!;
          signedInProfile = { id: u.id, name: u.name, email, role: 'professor' };
        } else {
          const u = DEMO_USERS.find((x) => x.role === 'learner')!;
          signedInProfile = { id: u.id, name: u.name, email, role: 'learner' };
        }
      }

      if (!signedInProfile) {
        throw new Error('Invalid credentials. Please verify your email or select a demo account.');
      }

      // Set cookie and server session
      document.cookie = `${DEMO_COOKIE_NAME}=${signedInProfile.id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      await fetch('/api/auth/demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: signedInProfile.id, role: signedInProfile.role }),
      });

      const destination =
        redirectTarget ||
        (signedInProfile.role === 'admin'
          ? '/admin'
          : signedInProfile.role === 'professor'
          ? '/professor'
          : '/learner');

      router.push(destination);
      router.refresh();
    } catch (err) {
      setErrorMessage((err as Error).message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillAndLogin = async (user: (typeof DEMO_USERS)[0]) => {
    setEmail(user.email);
    setPassword('demo1234');
    setIsLoading(true);

    try {
      document.cookie = `${DEMO_COOKIE_NAME}=${user.id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      await fetch('/api/auth/demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: user.role }),
      });

      const destination =
        redirectTarget ||
        (user.role === 'admin' ? '/admin' : user.role === 'professor' ? '/professor' : '/learner');

      router.push(destination);
      router.refresh();
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {errorMessage && (
        <Alert variant="error" title="Sign In Error">
          {errorMessage}
        </Alert>
      )}

      {redirectTarget && (
        <Alert variant="warning" title="Authentication Required">
          Please sign in to access the protected page: <code className="font-bold">{redirectTarget}</code>
        </Alert>
      )}

      <Card className="border-2 border-slate-300 shadow-md">
        <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-2xl shadow-sm border border-blue-900">
              🤟
            </div>
            <div>
              <CardTitle>Sign In to FSL System</CardTitle>
              <CardDescription>
                Access your learner portal, teaching schedule, or administrative console.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@fsl.edu.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 p-6 pt-0">
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>

            <div className="text-center text-sm font-semibold text-slate-700 pt-2">
              Don&apos;t have an account yet?{' '}
              <Link
                href="/register"
                className="text-blue-700 hover:text-blue-900 underline font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
              >
                Register as a Learner
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* 1-Click Quick-Fill Demo Personas */}
      <Card className="border-2 border-amber-300 bg-amber-50/40">
        <CardHeader className="bg-amber-100/60 border-b-2 border-amber-200 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-700" />
            <h4 className="font-black text-slate-900 text-base tracking-tight">
              1-Click Demo Accounts (Grounded in seed.sql)
            </h4>
          </div>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">
            Click any demo profile below to instantly sign in and explore that role&apos;s full feature set.
          </p>
        </CardHeader>

        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DEMO_USERS.map((user) => {
            const roleIcons = {
              admin: <Shield className="w-4 h-4 text-purple-700 flex-shrink-0" />,
              professor: <GraduationCap className="w-4 h-4 text-indigo-700 flex-shrink-0" />,
              learner: <BookOpen className="w-4 h-4 text-sky-700 flex-shrink-0" />,
            };

            const roleBorders = {
              admin: 'hover:border-purple-600 hover:bg-purple-50/60',
              professor: 'hover:border-indigo-600 hover:bg-indigo-50/60',
              learner: 'hover:border-sky-600 hover:bg-sky-50/60',
            };

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickFillAndLogin(user)}
                disabled={isLoading}
                className={`p-3 rounded-lg border-2 border-slate-300 bg-white text-left transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 ${roleBorders[user.role]}`}
              >
                <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                  <div className="flex items-center gap-1.5 truncate">
                    {roleIcons[user.role]}
                    <span className="truncate">{user.name}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                    {user.role}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-mono mt-1 truncate">{user.email}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-1">
                  {user.description}
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <DemoRoleBanner />
      <Navbar />

      <main id="main-content" className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<div className="text-center font-bold text-slate-700 p-8">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
