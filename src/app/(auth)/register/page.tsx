'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { DemoRoleBanner } from '@/components/layout/DemoRoleBanner';
import { Navbar } from '@/components/layout/Navbar';
import { DEMO_COOKIE_NAME } from '@/lib/supabase/session';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    try {
      // 1. Call server registration endpoint
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
          bio: bio.trim() || undefined,
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        throw new Error(regData.error || 'Registration failed. Please try again.');
      }

      // 2. Authenticate the Supabase browser client so that its tokens/cookies are stored
      const supabase = createClient();
      try {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
      } catch {
        // Fallback session is already set by /api/auth/register
      }

      // 3. Set client-side session cookie with real user profile
      const sessionData = {
        id: regData.profile.id,
        name: regData.profile.name,
        email: regData.profile.email,
        role: regData.profile.role,
      };

      const cookieVal = encodeURIComponent(JSON.stringify(sessionData));
      document.cookie = `${DEMO_COOKIE_NAME}=${cookieVal}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      // 4. Synchronize demo-session route
      await fetch('/api/auth/demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      router.push('/learner');
      router.refresh();
    } catch (err) {
      setErrorMessage((err as Error).message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <DemoRoleBanner />
      <Navbar />

      <main id="main-content" className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl space-y-6">
          {errorMessage && (
            <Alert variant="error" title="Registration Error">
              {errorMessage}
            </Alert>
          )}

          <Card className="border-2 border-slate-300 shadow-md">
            <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-2xl shadow-sm border border-blue-900">
                  🤟
                </div>
                <div>
                  <CardTitle>Register as a Learner</CardTitle>
                  <CardDescription>
                    Join the Filipino Sign Language community and begin your signing journey.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-6">
                <Input
                  label="Full Name"
                  placeholder="e.g. Maria Clara Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />

                <div className="w-full">
                  <label htmlFor="bio-input" className="block text-sm font-bold text-slate-900 mb-1.5 select-none">
                    Learning Goal / Bio (Optional)
                  </label>
                  <textarea
                    id="bio-input"
                    rows={3}
                    placeholder="Tell us what motivates you to learn FSL (e.g. connecting with Deaf friends or family, career advancement)..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 bg-white text-slate-950 font-medium rounded-lg border-2 border-slate-300 hover:border-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100 focus-visible:outline-none transition-all placeholder:text-slate-500 text-base"
                  />
                </div>

                <div className="p-3 bg-sky-50 border-2 border-sky-300 rounded-lg flex items-start gap-2.5 text-xs text-sky-950">
                  <Sparkles className="w-4 h-4 text-sky-700 mt-0.5 flex-shrink-0" />
                  <span>
                    New learner accounts have immediate access to Level 1, 2, and 3 workshop offerings, the FSL video library, and simulated checkout.
                  </span>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 p-6 pt-0">
                <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Complete Registration
                </Button>

                <div className="text-center text-sm font-semibold text-slate-700 pt-2">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-blue-700 hover:text-blue-900 underline font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
                  >
                    Sign In instead
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
