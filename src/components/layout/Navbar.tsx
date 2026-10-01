'use client';

import React, { useState } from 'react';
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
  Megaphone,
  Video,
} from 'lucide-react';

interface NavbarProps {
  currentRole?: UserRole | null;
  currentUserName?: string | null;
}

export function Navbar({ currentRole, currentUserName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      document.cookie = `${DEMO_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
      await fetch('/api/auth/demo-session', { method: 'DELETE' });
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

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-200 shadow-xs">
      <div className="h-1 bg-gradient-to-r from-blue-900 via-blue-700 to-amber-500 w-full" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 rounded-lg p-1"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center text-white font-black text-2xl tracking-tighter border-2 border-blue-900 group-hover:bg-blue-800 transition-colors shadow-sm">
                🤟
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                  FSL WORKSHOP
                  <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded border border-blue-300">
                    SDEAS • DLSU
                  </span>
                </span>
                <span className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1">
                  <span>Filipino Sign Language Learning System</span>
                  <span className="text-amber-600 font-extrabold text-[11px] hidden sm:inline">• De La Salle</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Public Links */}
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 flex items-center gap-1.5 ${
                isActive('/') && pathname === '/'
                  ? 'bg-blue-50 text-blue-800 border-2 border-blue-600'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              href="/news"
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 flex items-center gap-1.5 ${
                isActive('/news')
                  ? 'bg-blue-50 text-blue-800 border-2 border-blue-600'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>News & Events</span>
            </Link>

            <Link
              href="/merchandise"
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 flex items-center gap-1.5 ${
                isActive('/merchandise')
                  ? 'bg-blue-50 text-blue-800 border-2 border-blue-600'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Merchandise</span>
            </Link>

            {/* Role-Specific Portal Links */}
            {currentRole === 'learner' && (
              <>
                <div className="h-6 w-px bg-slate-300 mx-2" aria-hidden="true" />
                <Link
                  href="/learner"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 flex items-center gap-1.5 ${
                    pathname === '/learner'
                      ? 'bg-sky-50 text-sky-900 border-2 border-sky-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-sky-700" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/learner/workshops"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 ${
                    isActive('/learner/workshops')
                      ? 'bg-sky-50 text-sky-900 border-2 border-sky-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  Workshops
                </Link>

                <Link
                  href="/learner/classes"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 ${
                    isActive('/learner/classes')
                      ? 'bg-sky-50 text-sky-900 border-2 border-sky-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  My Classes
                </Link>

                <Link
                  href="/learner/coursework"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 ${
                    isActive('/learner/coursework')
                      ? 'bg-sky-50 text-sky-900 border-2 border-sky-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  Coursework
                </Link>

                <Link
                  href="/learner/materials"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 ${
                    isActive('/learner/materials')
                      ? 'bg-sky-50 text-sky-900 border-2 border-sky-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  Learning Hub
                </Link>

                <Link
                  href="/learner/progression"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 flex items-center gap-1 ${
                    isActive('/learner/progression')
                      ? 'bg-sky-50 text-sky-900 border-2 border-sky-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Progression</span>
                </Link>
              </>
            )}

            {currentRole === 'professor' && (
              <>
                <div className="h-6 w-px bg-slate-300 mx-2" aria-hidden="true" />
                <Link
                  href="/professor"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 flex items-center gap-1.5 ${
                    pathname === '/professor'
                      ? 'bg-indigo-50 text-indigo-900 border-2 border-indigo-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-indigo-700" />
                  <span>Professor Hub</span>
                </Link>

                <Link
                  href="/professor/schedules"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 ${
                    isActive('/professor/schedules')
                      ? 'bg-indigo-50 text-indigo-900 border-2 border-indigo-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  Schedules
                </Link>

                <Link
                  href="/professor/materials"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 ${
                    isActive('/professor/materials')
                      ? 'bg-indigo-50 text-indigo-900 border-2 border-indigo-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  Materials
                </Link>

                <Link
                  href="/professor/announcements"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 ${
                    isActive('/professor/announcements')
                      ? 'bg-indigo-50 text-indigo-900 border-2 border-indigo-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  Announcements
                </Link>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <div className="h-6 w-px bg-slate-300 mx-2" aria-hidden="true" />
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 flex items-center gap-1.5 ${
                    pathname === '/admin'
                      ? 'bg-purple-50 text-purple-900 border-2 border-purple-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-700" />
                  <span>Admin Dashboard</span>
                </Link>

                <Link
                  href="/admin/workshops"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 ${
                    isActive('/admin/workshops')
                      ? 'bg-purple-50 text-purple-900 border-2 border-purple-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  Workshops
                </Link>

                <Link
                  href="/admin/users"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 ${
                    isActive('/admin/users')
                      ? 'bg-purple-50 text-purple-900 border-2 border-purple-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  Users
                </Link>

                <Link
                  href="/admin/payments"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 ${
                    isActive('/admin/payments')
                      ? 'bg-purple-50 text-purple-900 border-2 border-purple-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  Payments Queue
                </Link>

                <Link
                  href="/admin/finance"
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 ${
                    isActive('/admin/finance')
                      ? 'bg-purple-50 text-purple-900 border-2 border-purple-600'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  Finances
                </Link>
              </>
            )}

            {currentRole && (
              <Link
                href="/messages"
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 flex items-center gap-1.5 ${
                  isActive('/messages')
                    ? 'bg-blue-50 text-blue-900 border-2 border-blue-600'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
              </Link>
            )}
          </nav>

          {/* User Status & Auth Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {currentRole ? (
              <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-1.5">
                <Badge variant={currentRole} />
                <span className="text-sm font-bold text-slate-900 max-w-[140px] truncate">
                  {currentUserName || 'User'}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-bold text-slate-800 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 border-2 border-blue-700 rounded-lg shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="p-2.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-2 border-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-slate-200 bg-slate-50 p-4 space-y-2">
          {currentRole && (
            <div className="p-3 bg-white rounded-lg border-2 border-slate-300 flex items-center justify-between mb-3">
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
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
            >
              Home
            </Link>
            <Link
              href="/news"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200 flex items-center gap-2"
            >
              <Newspaper className="w-4 h-4 text-blue-700" />
              <span>News & Events</span>
            </Link>
            <Link
              href="/merchandise"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-rose-700" />
              <span>Merchandise</span>
            </Link>

            {currentRole === 'learner' && (
              <>
                <Link
                  href="/learner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-sky-900 bg-sky-100"
                >
                  Learner Dashboard
                </Link>
                <Link
                  href="/learner/workshops"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
                >
                  Workshops Catalog
                </Link>
                <Link
                  href="/learner/classes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
                >
                  My Classes
                </Link>
                <Link
                  href="/learner/coursework"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
                >
                  Coursework
                </Link>
                <Link
                  href="/learner/materials"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
                >
                  Learning Hub
                </Link>
                <Link
                  href="/learner/progression"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
                >
                  Progression Roadmap
                </Link>
              </>
            )}

            {currentRole === 'professor' && (
              <>
                <Link
                  href="/professor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-indigo-900 bg-indigo-100"
                >
                  Professor Dashboard
                </Link>
                <Link
                  href="/professor/schedules"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
                >
                  My Schedules
                </Link>
                <Link
                  href="/professor/materials"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
                >
                  Materials & Videos
                </Link>
                <Link
                  href="/professor/announcements"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
                >
                  Class Announcements
                </Link>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-purple-900 bg-purple-100"
                >
                  Admin Console
                </Link>
                <Link
                  href="/admin/workshops"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
                >
                  Workshops & Schedules
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
                >
                  User Directory
                </Link>
                <Link
                  href="/admin/payments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
                >
                  Verify Payments
                </Link>
                <Link
                  href="/admin/finance"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200"
                >
                  Financial Reports
                </Link>
              </>
            )}

            {currentRole && (
              <Link
                href="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg font-bold text-slate-800 hover:bg-slate-200 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-blue-700" />
                <span>Messages</span>
              </Link>
            )}

            {!currentRole && (
              <div className="pt-2 flex flex-col gap-2">
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
