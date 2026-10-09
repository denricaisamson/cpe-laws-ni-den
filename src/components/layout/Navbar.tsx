'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserRole } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { DEMO_COOKIE_NAME } from '@/lib/supabase/session';
import {
  Menu,
  X,
  LogOut,
  LogIn,
  UserPlus,
  BookOpen,
  GraduationCap,
  Shield,
  Newspaper,
  ShoppingBag,
  MessageSquare,
  Home,
  Award,
  ChevronDown,
  Compass,
} from 'lucide-react';

interface NavbarProps {
  currentRole?: UserRole | null;
  currentUserName?: string | null;
}

export function Navbar({ currentRole, currentUserName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setExploreOpen(false);
  }, [pathname]);

  // Click outside and escape key handling for Explore dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExploreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      document.cookie = `${DEMO_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
      await fetch('/api/auth/demo-session', { method: 'DELETE' });
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {}
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const isExploreActive = pathname === '/' || isActive('/news') || isActive('/merchandise');

  const navLinkClass = (active: boolean) =>
    `px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 flex items-center gap-1.5 ${
      active
        ? 'bg-blue-50 text-blue-900 border-2 border-blue-600 shadow-xs'
        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-2 border-transparent'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-200 shadow-xs w-full">
      <div className="h-1 bg-gradient-to-r from-blue-900 via-blue-700 to-amber-500 w-full" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 shrink-0 group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 rounded-lg p-1"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-black text-lg sm:text-xl tracking-tighter border-2 border-blue-900 group-hover:bg-blue-800 transition-colors shadow-sm shrink-0">
                🤟
              </div>
              <div className="flex flex-col shrink-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    FSL WORKSHOP
                  </span>
                  <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-1.5 py-0.5 rounded border border-blue-300 hidden sm:inline">
                    SDEAS • DLSU
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-600 mt-0.5 hidden xl:flex items-center gap-1">
                  <span>Filipino Sign Language System</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
            {/* Learner Portal Links */}
            {currentRole === 'learner' && (
              <>
                <Link href="/learner" className={navLinkClass(pathname === '/learner')}>
                  <BookOpen className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-sky-700" />
                  <span>Dashboard</span>
                </Link>

                <Link href="/learner/workshops" className={navLinkClass(isActive('/learner/workshops'))}>
                  <span>Workshops</span>
                </Link>

                <Link href="/learner/classes" className={navLinkClass(isActive('/learner/classes'))}>
                  <span>My Classes</span>
                </Link>

                <Link href="/learner/coursework" className={navLinkClass(isActive('/learner/coursework'))}>
                  <span>Coursework</span>
                </Link>

                <Link href="/learner/materials" className={navLinkClass(isActive('/learner/materials'))}>
                  <span>Learning Hub</span>
                </Link>

                <Link href="/learner/progression" className={navLinkClass(isActive('/learner/progression'))}>
                  <Award className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-amber-600" />
                  <span>Progression</span>
                </Link>
              </>
            )}

            {/* Professor Portal Links */}
            {currentRole === 'professor' && (
              <>
                <Link href="/professor" className={navLinkClass(pathname === '/professor')}>
                  <GraduationCap className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-indigo-700" />
                  <span>Professor Hub</span>
                </Link>

                <Link href="/professor/schedules" className={navLinkClass(isActive('/professor/schedules'))}>
                  <span>Schedules</span>
                </Link>

                <Link href="/professor/materials" className={navLinkClass(isActive('/professor/materials'))}>
                  <span>Materials</span>
                </Link>

                <Link href="/professor/announcements" className={navLinkClass(isActive('/professor/announcements'))}>
                  <span>Announcements</span>
                </Link>
              </>
            )}

            {/* Admin Console Links */}
            {currentRole === 'admin' && (
              <>
                <Link href="/admin" className={navLinkClass(pathname === '/admin')}>
                  <Shield className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-purple-700" />
                  <span>Admin Console</span>
                </Link>

                <Link href="/admin/workshops" className={navLinkClass(isActive('/admin/workshops'))}>
                  <span>Workshops</span>
                </Link>

                <Link href="/admin/users" className={navLinkClass(isActive('/admin/users'))}>
                  <span>Users</span>
                </Link>

                <Link href="/admin/payments" className={navLinkClass(isActive('/admin/payments'))}>
                  <span>Payments</span>
                </Link>

                <Link href="/admin/finance" className={navLinkClass(isActive('/admin/finance'))}>
                  <span>Finances</span>
                </Link>
              </>
            )}

            {/* Direct Messages (for all authenticated roles) */}
            {currentRole && (
              <Link href="/messages" className={navLinkClass(isActive('/messages'))}>
                <MessageSquare className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <span>Messages</span>
              </Link>
            )}

            {/* Explore dropdown for Authenticated Users (Home, News, Merchandise) */}
            {currentRole && (
              <div className="relative" ref={exploreRef}>
                <button
                  type="button"
                  onClick={() => setExploreOpen(!exploreOpen)}
                  className={`px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 flex items-center gap-1 ${
                    isExploreActive
                      ? 'bg-blue-50 text-blue-900 border-2 border-blue-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-2 border-transparent'
                  }`}
                  aria-expanded={exploreOpen}
                  aria-haspopup="true"
                  aria-label="Campus & Public Resources menu"
                >
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span>Explore</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`} />
                </button>

                {exploreOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white shadow-xl border-2 border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                      Campus & Community
                    </div>
                    <Link
                      href="/"
                      onClick={() => setExploreOpen(false)}
                      className={`px-3 py-2 flex items-center gap-2.5 text-xs xl:text-sm font-bold hover:bg-slate-100 transition-colors ${
                        pathname === '/' ? 'text-blue-700 bg-blue-50' : 'text-slate-700'
                      }`}
                    >
                      <Home className="w-4 h-4 text-blue-700 shrink-0" />
                      <div>
                        <div>Home Portal</div>
                        <div className="text-[10px] font-normal text-slate-500">Landing & overview</div>
                      </div>
                    </Link>
                    <Link
                      href="/news"
                      onClick={() => setExploreOpen(false)}
                      className={`px-3 py-2 flex items-center gap-2.5 text-xs xl:text-sm font-bold hover:bg-slate-100 transition-colors ${
                        isActive('/news') ? 'text-blue-700 bg-blue-50' : 'text-slate-700'
                      }`}
                    >
                      <Newspaper className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <div>News & Events</div>
                        <div className="text-[10px] font-normal text-slate-500">Announcements & updates</div>
                      </div>
                    </Link>
                    <Link
                      href="/merchandise"
                      onClick={() => setExploreOpen(false)}
                      className={`px-3 py-2 flex items-center gap-2.5 text-xs xl:text-sm font-bold hover:bg-slate-100 transition-colors ${
                        isActive('/merchandise') ? 'text-blue-700 bg-blue-50' : 'text-slate-700'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div>FSL Merchandise</div>
                        <div className="text-[10px] font-normal text-slate-500">Advocacy store</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Public Links for Guests (when not logged in) */}
            {!currentRole && (
              <>
                <Link href="/" className={navLinkClass(pathname === '/')}>
                  <Home className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  <span>Home</span>
                </Link>

                <Link href="/news" className={navLinkClass(isActive('/news'))}>
                  <Newspaper className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  <span>News & Events</span>
                </Link>

                <Link href="/merchandise" className={navLinkClass(isActive('/merchandise'))}>
                  <ShoppingBag className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  <span>Merchandise</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Status & Auth Actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {currentRole ? (
              <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-xl px-2.5 py-1.5 shrink-0">
                <Badge variant={currentRole} />
                <span
                  className="text-xs xl:text-sm font-bold text-slate-900 max-w-[90px] xl:max-w-[130px] truncate"
                  title={currentUserName || 'User'}
                >
                  {currentUserName || 'User'}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500 shrink-0"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center min-h-[38px] px-3.5 py-1.5 text-xs xl:text-sm font-bold text-slate-800 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 transition-colors whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center min-h-[38px] px-3.5 py-1.5 text-xs xl:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 border-2 border-blue-700 rounded-lg shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 transition-colors whitespace-nowrap shrink-0"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-2 border-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-slate-200 bg-slate-50 p-4 space-y-3">
          {currentRole && (
            <div className="p-3 bg-white rounded-lg border-2 border-slate-300 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Badge variant={currentRole} />
                <span className="text-sm font-bold text-slate-900">{currentUserName}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          <div className="flex flex-col space-y-1">
            {/* Learner Links */}
            {currentRole === 'learner' && (
              <>
                <div className="px-2 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Learner Portal
                </div>
                <Link
                  href="/learner"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                    pathname === '/learner' ? 'text-sky-900 bg-sky-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-sky-700" />
                  <span>Learner Dashboard</span>
                </Link>
                <Link
                  href="/learner/workshops"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${
                    isActive('/learner/workshops') ? 'text-sky-900 bg-sky-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  Workshops Catalog
                </Link>
                <Link
                  href="/learner/classes"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${
                    isActive('/learner/classes') ? 'text-sky-900 bg-sky-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  My Classes
                </Link>
                <Link
                  href="/learner/coursework"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${
                    isActive('/learner/coursework') ? 'text-sky-900 bg-sky-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  Coursework
                </Link>
                <Link
                  href="/learner/materials"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${
                    isActive('/learner/materials') ? 'text-sky-900 bg-sky-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  Learning Hub
                </Link>
                <Link
                  href="/learner/progression"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                    isActive('/learner/progression') ? 'text-sky-900 bg-sky-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Progression Roadmap</span>
                </Link>
              </>
            )}

            {/* Professor Links */}
            {currentRole === 'professor' && (
              <>
                <div className="px-2 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Professor Hub
                </div>
                <Link
                  href="/professor"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                    pathname === '/professor' ? 'text-indigo-900 bg-indigo-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-indigo-700" />
                  <span>Professor Dashboard</span>
                </Link>
                <Link
                  href="/professor/schedules"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${
                    isActive('/professor/schedules') ? 'text-indigo-900 bg-indigo-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  My Schedules
                </Link>
                <Link
                  href="/professor/materials"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${
                    isActive('/professor/materials') ? 'text-indigo-900 bg-indigo-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  Materials & Videos
                </Link>
                <Link
                  href="/professor/announcements"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${
                    isActive('/professor/announcements') ? 'text-indigo-900 bg-indigo-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  Class Announcements
                </Link>
              </>
            )}

            {/* Admin Links */}
            {currentRole === 'admin' && (
              <>
                <div className="px-2 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Admin Console
                </div>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                    pathname === '/admin' ? 'text-purple-900 bg-purple-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-700" />
                  <span>Admin Console</span>
                </Link>
                <Link
                  href="/admin/workshops"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${
                    isActive('/admin/workshops') ? 'text-purple-900 bg-purple-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  Workshops & Schedules
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${
                    isActive('/admin/users') ? 'text-purple-900 bg-purple-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  User Directory
                </Link>
                <Link
                  href="/admin/payments"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${
                    isActive('/admin/payments') ? 'text-purple-900 bg-purple-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  Verify Payments
                </Link>
                <Link
                  href="/admin/finance"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${
                    isActive('/admin/finance') ? 'text-purple-900 bg-purple-100' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  Financial Reports
                </Link>
              </>
            )}

            {/* Messages link */}
            {currentRole && (
              <Link
                href="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                  isActive('/messages') ? 'text-blue-900 bg-blue-100' : 'text-slate-800 hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-blue-700" />
                <span>Messages</span>
              </Link>
            )}

            {/* Campus & Community Section */}
            <div className="pt-2">
              <div className="px-2 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-t border-slate-200">
                Campus & Community
              </div>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                  pathname === '/' ? 'text-blue-900 bg-blue-100' : 'text-slate-800 hover:bg-slate-200'
                }`}
              >
                <Home className="w-4 h-4 text-blue-700" />
                <span>Home Portal</span>
              </Link>
              <Link
                href="/news"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                  isActive('/news') ? 'text-blue-900 bg-blue-100' : 'text-slate-800 hover:bg-slate-200'
                }`}
              >
                <Newspaper className="w-4 h-4 text-emerald-700" />
                <span>News & Events</span>
              </Link>
              <Link
                href="/merchandise"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                  isActive('/merchandise') ? 'text-blue-900 bg-blue-100' : 'text-slate-800 hover:bg-slate-200'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>Merchandise</span>
              </Link>
            </div>

            {!currentRole && (
              <div className="pt-3 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 font-bold text-white bg-blue-700 rounded-lg"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
