import React from 'react';
import Link from 'next/link';
import { getServerUserSession } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AccessibleVideoPlayer } from '@/components/video/AccessibleVideoPlayer';
import { mockWorkshops, mockSchedules, mockEnrollments, mockVideos, mockAnnouncements } from '@/lib/mock-data';
import {
  BookOpen,
  Video,
  Award,
  Calendar,
  ExternalLink,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default async function LearnerDashboardPage() {
  const session = await getServerUserSession();
  const userName = session?.profile.name || 'Learner';
  const userId = session?.user.id;

  // Find learner's enrollments from mock data
  const userEnrollments = mockEnrollments.filter(
    (e) => e.learner_id === userId || e.learner_id === 'c0000000-0000-0000-0000-000000000002'
  );

  const activeEnrollment = userEnrollments.find((e) => e.status === 'enrolled') || userEnrollments[0];
  const activeSchedule = activeEnrollment
    ? mockSchedules.find((s) => s.id === activeEnrollment.schedule_id)
    : mockSchedules[1];
  const activeWorkshop = activeSchedule
    ? mockWorkshops.find((w) => w.id === activeSchedule.workshop_id)
    : mockWorkshops[1];

  const featuredVideo = mockVideos[0]; // Alphabet & Fingerspelling

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-blue-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-bold border border-blue-600 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Learner Center — Filipino Sign Language</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Welcome back, {userName}! 🤟
            </h1>
            <p className="text-blue-100 text-base font-medium mt-2 max-w-2xl">
              Track your active signing classes, review fingerspelling tutorials, and continue your journey toward fluent FSL communication.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/learner/workshops">
              <Button variant="success" size="lg" className="shadow-lg">
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Workshops
              </Button>
            </Link>
            <Link href="/learner/materials">
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Video className="w-5 h-5 mr-2" />
                FSL Video Hub
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Enrolled Class & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Enrolled Section Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-slate-300 shadow-sm">
            <CardHeader className="bg-slate-50 border-b-2 border-slate-200 flex flex-row items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-blue-800 tracking-wider">
                  Active Enrollment
                </span>
                <CardTitle className="text-2xl mt-1">
                  {activeWorkshop?.title || 'FSL 102: Intermediate Expressions'}
                </CardTitle>
                <CardDescription>
                  Level {activeWorkshop?.level || 2} • {activeSchedule?.day_time}
                </CardDescription>
              </div>
              <Badge variant="enrolled" />
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Meeting Link & Schedule Card */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-900 uppercase">Live Class Session</div>
                    <div className="font-extrabold text-slate-900">{activeSchedule?.day_time}</div>
                    <div className="text-xs text-slate-600 font-medium">Virtual Classroom on Google Meet / Zoom</div>
                  </div>
                </div>

                {activeSchedule?.meeting_link ? (
                  <a
                    href={activeSchedule.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg border-2 border-blue-800 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600"
                  >
                    <span>Join Class Meeting</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                ) : (
                  <span className="text-sm font-bold text-slate-500 italic">Meeting link will be posted soon</span>
                )}
              </div>

              {/* Recent Class Announcement */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-black uppercase text-slate-700 tracking-wider mb-2">
                  Class Announcement
                </h4>
                <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>Prof. Rommel Agravante (Master Teacher)</span>
                    <span>Recent</span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-base">
                    {mockAnnouncements[0]?.title || 'Welcome to FSL Workshop!'}
                  </h5>
                  <p className="text-sm text-slate-700 font-medium mt-1">
                    {mockAnnouncements[0]?.body || 'Please ensure good lighting and clear camera view for visual signing sessions.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Practice Video Player */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-700" />
                <span>Featured Practice Video</span>
              </h3>
              <Link
                href="/learner/materials"
                className="text-sm font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
              >
                <span>View all 6 Categories</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <AccessibleVideoPlayer
              url={featuredVideo?.video_url || 'https://www.youtube.com/watch?v=36GlmDTYs6s&list=PLkEbhtuT-Wbr9IZ7RJqlwsBqZvAvh__bO&index=1'}
              title={featuredVideo?.title || 'Basic Filipino Sign Language Tutorial (Part 1)'}
              category={featuredVideo?.category || 'Common Expressions'}
              level={featuredVideo?.level || 1}
            />
          </div>
        </div>

        {/* Right Column (1 Col): Quick Action Nav & Progression Summary */}
        <div className="space-y-6">
          {/* Progression Card */}
          <Card className="border-2 border-slate-300 shadow-sm">
            <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Progression Roadmap</CardTitle>
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <CardDescription>Your pathway toward Deaf studies and interpretation</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span className="font-bold text-sm text-emerald-950">Level 1: Basic FSL</span>
                  </div>
                  <span className="text-xs font-black uppercase text-emerald-800">Done</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 border-2 border-blue-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-700 animate-pulse" />
                    <span className="font-bold text-sm text-blue-950">Level 2: Intermediate</span>
                  </div>
                  <span className="text-xs font-black uppercase text-blue-800">Current</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 border border-slate-300 opacity-60">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-400 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      3
                    </div>
                    <span className="font-bold text-sm text-slate-700">Level 3: Advanced</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">Locked</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/learner/progression">
                  <Button variant="outline" size="sm" className="w-full font-bold">
                    <span>View BSLI Pathway</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="border-2 border-slate-300 shadow-sm">
            <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
              <CardTitle className="text-lg">Quick Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Link
                href="/learner/classes"
                className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-colors font-bold text-slate-800 text-sm group"
              >
                <span>My Active Classes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-blue-700" />
              </Link>

              <Link
                href="/learner/coursework"
                className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-colors font-bold text-slate-800 text-sm group"
              >
                <span>Coursework & Submissions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-blue-700" />
              </Link>

              <Link
                href="/learner/workshops"
                className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-colors font-bold text-slate-800 text-sm group"
              >
                <span>Enroll in New Workshop</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-blue-700" />
              </Link>

              <Link
                href="/messages"
                className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-colors font-bold text-slate-800 text-sm group"
              >
                <span>Message Professor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-blue-700" />
              </Link>

              <Link
                href="/news"
                className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-colors font-bold text-slate-800 text-sm group"
              >
                <span>Deaf Community News</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-blue-700" />
              </Link>

              <Link
                href="/merchandise"
                className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-colors font-bold text-slate-800 text-sm group"
              >
                <span>FSL Merchandise Store</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-blue-700" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
