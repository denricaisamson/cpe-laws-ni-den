'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getLearnerClasses,
  subscribeToLearnerStore,
  LearnerClassItem,
} from '@/lib/learner-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ExternalLink,
  ArrowRight,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Megaphone,
  Video,
} from 'lucide-react';

interface LearnerClassesClientProps {
  initialLearnerId: string;
  initialLearnerName: string;
}

export function LearnerClassesClient({
  initialLearnerId,
  initialLearnerName,
}: LearnerClassesClientProps) {
  const [classes, setClasses] = useState<LearnerClassItem[]>([]);

  const loadData = () => {
    const data = getLearnerClasses(initialLearnerId);
    setClasses(data);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToLearnerStore(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [initialLearnerId]);

  // Aggregate stats
  const totalClasses = classes.length;
  const totalSessions = classes.reduce((sum, c) => sum + c.attendanceSummary.total, 0);
  const presentSessions = classes.reduce((sum, c) => sum + c.attendanceSummary.present, 0);
  const averageAttendance =
    totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-blue-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-bold border border-blue-600 mb-3">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>Learner Classroom Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              My Enrolled FSL Classes
            </h1>
            <p className="text-blue-100 text-base font-medium mt-2 max-w-2xl">
              Access your active Filipino Sign Language cohort classrooms, join virtual live sessions,
              view announcements, and track your attendance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/learner/workshops">
              <Button variant="success" size="md" className="font-bold shadow-sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse More Workshops
              </Button>
            </Link>
            <Link href="/learner/coursework">
              <Button variant="outline" size="md" className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold">
                View Coursework
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="mt-8 pt-6 border-t border-blue-800/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-700/50">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              Enrolled Workshops
            </span>
            <div className="text-3xl font-black text-white mt-1">{totalClasses}</div>
          </div>
          <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-700/50">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              Overall Attendance Rate
            </span>
            <div className="text-3xl font-black text-emerald-400 mt-1">{averageAttendance}%</div>
          </div>
          <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-700/50">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              Total Sessions Logged
            </span>
            <div className="text-3xl font-black text-amber-300 mt-1">
              {presentSessions} / {totalSessions || '0'}
            </div>
          </div>
        </div>
      </div>

      {/* Classes List */}
      {classes.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-300 text-center py-12 p-6">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mx-auto border-2 border-blue-200">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              No Active Workshop Enrollments
            </h3>
            <p className="text-slate-600 text-sm font-medium">
              You are not currently enrolled in any workshop cohorts. Explore our FSL Levels 1-3 offerings
              and secure your schedule today!
            </p>
            <Link href="/learner/workshops">
              <Button variant="primary" size="lg" className="font-black mt-2">
                Explore Workshop Catalog
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {classes.map((cls) => {
            const hasMeetingLink = Boolean(cls.schedule.meeting_link);
            const isCompleted = cls.enrollment.status === 'completed';

            return (
              <Card
                key={cls.enrollment.id}
                className="border-2 border-slate-300 shadow-sm overflow-hidden hover:border-blue-500 transition-all"
              >
                <CardHeader className="bg-slate-50 border-b-2 border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-900 text-xs font-black px-2.5 py-0.5 rounded border border-blue-300 uppercase">
                        Level {cls.workshop.level}
                      </span>
                      {isCompleted ? (
                        <Badge variant="completed">Completed</Badge>
                      ) : (
                        <Badge variant="enrolled">Active Cohort</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-950 mt-1">
                      {cls.workshop.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 font-medium">
                      Cohort Schedule: {cls.schedule.day_time}
                    </CardDescription>
                  </div>

                  {/* Attendance Summary Badge */}
                  <div className="flex flex-col md:items-end justify-center bg-white p-3.5 rounded-xl border-2 border-slate-200 md:min-w-[200px]">
                    <span className="text-xs font-black uppercase text-slate-500">
                      Attendance History
                    </span>
                    <span className="text-xl font-black text-slate-900 mt-0.5">
                      {cls.attendanceSummary.present} / {cls.attendanceSummary.total} Sessions ({cls.attendanceSummary.attendanceRate}%)
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {cls.announcementsCount} Class Announcement{cls.announcementsCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Schedule & Faculty details */}
                    <div className="space-y-3 md:col-span-2">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <User className="w-5 h-5 text-slate-600 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase">Assigned Professor:</span>
                          <div className="font-extrabold text-slate-900 text-sm">
                            {cls.professor?.name || 'FSL Master Instructor'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                        <Clock className="w-5 h-5 text-blue-700 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-blue-900 uppercase">Meeting Time:</span>
                          <div className="font-extrabold text-slate-900 text-sm">
                            {cls.schedule.day_time}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex flex-col gap-3">
                      {hasMeetingLink ? (
                        <a
                          href={cls.schedule.meeting_link || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center min-h-[48px] px-5 py-2.5 font-black text-white bg-blue-700 hover:bg-blue-800 rounded-lg border-2 border-blue-800 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 transition-colors"
                        >
                          <Video className="w-5 h-5 mr-2" />
                          <span>Join Live Meeting</span>
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      ) : (
                        <div className="p-3 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 text-center border border-slate-200">
                          Meeting link will be posted soon
                        </div>
                      )}

                      <Link href={`/learner/classes/${cls.schedule.id}`}>
                        <Button variant="outline" className="w-full font-bold">
                          <span>Enter Class Portal</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
