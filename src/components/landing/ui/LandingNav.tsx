'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Hand, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMotionPref } from '../providers/SmoothScroll';

const LINKS = [
  { href: '#levels', label: 'Levels' },
  { href: '#videos', label: 'Video Hub' },
  { href: '#roles', label: 'Platform' },
  { href: '#pathway', label: 'Pathway' },
  { href: '#community', label: 'Community' },
];

export function LandingNav({ dashboardHref }: { dashboardHref?: string }) {
  const { userReduced, toggleReduced } = useMotionPref();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4">
      <nav
        aria-label="Landing"
        className={cn(
          'flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border px-3 py-2 transition-all duration-500 sm:px-5',
          scrolled
            ? 'border-white/15 bg-[#04170d]/70 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-emerald-400 text-emerald-950">
            <Hand className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg tracking-tight">
            FSL<span className="text-amber-300">·</span>Portal
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleReduced}
            aria-pressed={userReduced}
            title="Toggle reduced motion (2D mode)"
            className="hidden min-h-[40px] items-center gap-1.5 rounded-full border border-white/15 px-3 text-xs font-bold text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70 sm:inline-flex"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {userReduced ? '2D mode' : '3D mode'}
          </button>
          {dashboardHref ? (
            <Link
              href={dashboardHref}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-emerald-950 transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70"
            >
              Dashboard <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden min-h-[40px] items-center rounded-full px-4 text-sm font-bold text-white/85 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-emerald-950 transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70"
              >
                Join <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
