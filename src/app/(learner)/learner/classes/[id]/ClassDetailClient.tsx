'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getClassDetails,
  subscribeToLearnerStore,
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
  ArrowLeft,
  Video,
  Megaphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  Sparkles,
  Info,
} from 'lucide-react';

interface ClassDetailClientProps {
  classId: string;
  initialLearnerId: string;
  initialLearnerName: string;
}

export function ClassDetailClient({
  classId,
  initialLearnerId,
  initialLearnerName,
}: ClassDetailClientProps) {
  const [classData, setClassData] = useState<ReturnType<typeof getClassDetails>>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'announcements' | 'materials'>('overview');

  const loadData = () => {
    const data = getClassDetails(classId, initialLearnerId);
    setClassData(data);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToLearnerStore(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [classId, initialLearnerId]);

  if (!classData) {
    return (
      <div className="space-y-6 pb-12">
        <Link
          href="/learner/classes"
          className="inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to My Classes</span>
        </Link>
        <Card className="border-2 border-slate-300 p-8 text-center">
          <CardContent className="space-y-3">
            <h3 className="text-xl font-bold text-slate-800">Class Information Not Found</h3>
            <p className="text-sm text-slate-600">
              The requested class schedule could not be located or you may not have active enrollment.
            </p>
            <Link href="/learner/classes">
              <Button variant="primary">Return to Class Roster</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { schedule, workshop, professor, attendanceHistory, announcements, materials, enrollment } =
    classData;

  const meetingLink = schedule.meeting_link;

  // Determine attendance badge status
  const getAttendanceStatus = (record: { present: boolean; remarks: string | null }) => {
    const rem = (record.remarks || '').toLowerCase();
    if (rem.includes('excused')) {
      return { label: 'Excused', variant: 'info' as const, icon: <Info className="w-4 h-4 text-blue-800" /> };
    }
    if (rem.includes('late')) {
      return { label: 'Late', variant: 'warning' as const, icon: <AlertTriangle className="w-4 h-4 text-amber-800" /> };
    }
    if (record.present) {
      return { label: 'Present', variant: 'success' as const, icon: <CheckCircle2 className="w-4 h-4 text-emerald-800" /> };
    }
    return { label: 'Absent', variant: 'danger' as const, icon: <XCircle className="w-4 h-4 text-rose-800" /> };
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/learner/classes"
          className="inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-2 py-1 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to My Classes</span>
        </Link>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
          Enrolled Cohort ID: {schedule.id.substring(0, 13)}
        </span>
      </div>

      {/* Class Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-blue-950 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-800 text-blue-200 text-xs font-black px-2.5 py-0.5 rounded border border-blue-600 uppercase">
                FSL Level {workshop.level}
              </span>
              <span className="bg-emerald-800/90 text-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded border border-emerald-600">
                Active Cohort
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {workshop.title}
            </h1>
            <p className="text-blue-100 text-base font-medium leading-relaxed">
              {workshop.description}
            </p>
          </div>

          {/* Prominent Zoom / Google Meet Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 lg:min-w-[280px]">
            {meetingLink ? (
              <a
                href={meetingLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center min-h-[56px] px-6 py-3 font-black text-lg text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl border-2 border-emerald-400 shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 transition-all text-center group"
              >
                <Video className="w-6 h-6 mr-2 text-white group-hover:scale-110 transition-transform" />
                <span>Join Live Meeting</span>
                <ExternalLink className="w-5 h-5 ml-2 text-emerald-100" />
              </a>
            ) : (
              <div className="p-4 bg-blue-950/80 rounded-xl border border-blue-700 text-center text-sm font-bold text-blue-200">
                Meeting link will be shared by instructor prior to session
              </div>
            )}
            <div className="text-center text-xs text-blue-200 font-medium">
              Google Meet / Zoom Classroom • Interactive Visual Signing
            </div>
          </div>
        </div>

        {/* Schedule & Faculty Pill Bar */}
        <div className="pt-6 border-t border-blue-800/60 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-blue-950/60 p-3.5 rounded-xl border border-blue-700/50">
            <Clock className="w-5 h-5 text-amber-300 flex-shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-blue-300 uppercase">Live Session Schedule</span>
              <div className="font-extrabold text-white text-sm">{schedule.day_time}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-blue-950/60 p-3.5 rounded-xl border border-blue-700/50">
            <User className="w-5 h-5 text-emerald-300 flex-shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-blue-300 uppercase">Master Instructor</span>
              <div className="font-extrabold text-white text-sm">
                {professor?.name || 'Native Deaf Master Teacher'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b-2 border-slate-300 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 font-bold text-sm border-b-4 -mb-[2px] transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-blue-700 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Class Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-3 font-bold text-sm border-b-4 -mb-[2px] transition-colors flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-blue-700 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Session Attendance ({attendanceHistory.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-3 font-bold text-sm border-b-4 -mb-[2px] transition-colors flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'border-blue-700 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Class Announcements ({announcements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-3 font-bold text-sm border-b-4 -mb-[2px] transition-colors flex items-center gap-2 ${
            activeTab === 'materials'
              ? 'border-blue-700 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Handouts & Materials ({materials.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-2 border-slate-300 shadow-sm">
              <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
                <CardTitle className="text-xl">Classroom Information & Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-sm text-slate-700 leading-relaxed font-medium">
                <p>
                  Welcome to <strong>{workshop.title}</strong>! This cohort is designed with visual-first
                  pedagogy centered on authentic Filipino Deaf culture and communication.
                </p>
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200 space-y-2">
                  <h4 className="font-extrabold text-blue-950 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-700" />
                    <span>Live Session Guidelines</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-800 text-xs sm:text-sm">
                    <li>Camera must remain turned on with adequate front-facing lighting.</li>
                    <li>Ensure your head, shoulders, and chest are in full view of the frame.</li>
                    <li>Avoid high contrast or busy backdrops that distract from handshapes.</li>
                    <li>Use the Zoom / Meet chat or visual waving cues to request turn-taking.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Recent Announcements Preview */}
            <Card className="border-2 border-slate-300 shadow-sm">
              <CardHeader className="bg-slate-50 border-b-2 border-slate-200 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-blue-700" />
                  <span>Recent Class Announcements</span>
                </CardTitle>
                <button
                  type="button"
                  onClick={() => setActiveTab('announcements')}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                >
                  View All
                </button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {announcements.length === 0 ? (
                  <p className="text-sm font-medium text-slate-500 italic">No announcements posted yet.</p>
                ) : (
                  announcements.slice(0, 2).map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>{new Date(ann.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base">{ann.title}</h4>
                      <p className="text-sm text-slate-700 font-medium">{ann.body}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Instructor & Quick Actions */}
          <div className="space-y-6">
            <Card className="border-2 border-slate-300 shadow-sm">
              <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
                <CardTitle className="text-lg">Your Instructor</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-black text-xl border-2 border-indigo-300">
                    👨‍🏫
                  </div>
                  <div>
                    <h4 className="font-black text-slate-950 text-base">
                      {professor?.name || 'Prof. Rommel Agravante'}
                    </h4>
                    <span className="text-xs font-bold text-slate-500">
                      {professor?.role === 'professor' ? 'Master FSL Lecturer' : 'Course Facilitator'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {professor?.bio ||
                    'Native Deaf FSL Master Teacher with extensive experience in Deaf culture, visual-gestural communication, and sign language linguistics.'}
                </p>
                <div className="pt-2">
                  <Link href="/messages">
                    <Button variant="outline" size="sm" className="w-full font-bold">
                      Direct Message Professor
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-300 shadow-sm">
              <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
                <CardTitle className="text-lg">Coursework & Study</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Link href="/learner/coursework">
                  <Button variant="primary" size="sm" className="w-full font-bold">
                    View Assignments & Submissions
                  </Button>
                </Link>
                <Link href="/learner/materials">
                  <Button variant="outline" size="sm" className="w-full font-bold">
                    Browse FSL Video Library
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance History Table */}
      {activeTab === 'attendance' && (
        <Card className="border-2 border-slate-300 shadow-sm">
          <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
            <CardTitle className="text-xl">Session Attendance History</CardTitle>
            <CardDescription>
              Real-time attendance record logged per session by your instructor.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {attendanceHistory.length === 0 ? (
              <div className="p-8 text-center text-sm font-bold text-slate-500">
                No session attendance records logged yet for this cohort.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-900 border-b-2 border-slate-300 text-xs font-black uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Session Date</th>
                      <th className="py-3 px-4">Attendance Status</th>
                      <th className="py-3 px-4">Instructor Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {attendanceHistory.map((rec, idx) => {
                      const status = getAttendanceStatus(rec);
                      return (
                        <tr key={rec.id || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-900">
                            {new Date(rec.date).toLocaleDateString('en-PH', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-slate-700 font-medium">
                            {rec.remarks || <span className="text-slate-400 italic">No remarks recorded</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card className="border-2 border-slate-300 p-8 text-center">
              <CardContent className="text-sm font-bold text-slate-500">
                No announcements published for this class yet.
              </CardContent>
            </Card>
          ) : (
            announcements.map((ann) => (
              <Card key={ann.id} className="border-2 border-slate-300 shadow-sm">
                <CardHeader className="bg-slate-50 border-b-2 border-slate-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                    <span className="flex items-center gap-1.5 text-blue-800 font-black">
                      <Megaphone className="w-4 h-4" />
                      Class Bulletin
                    </span>
                    <span>
                      {new Date(ann.created_at).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-black text-slate-950">
                    {ann.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                  {ann.body}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Materials */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {materials.length === 0 ? (
            <Card className="border-2 border-slate-300 p-8 text-center">
              <CardContent className="text-sm font-bold text-slate-500">
                No handouts uploaded for this cohort yet. Visit the Learning Hub for general curriculum resources.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((mat) => (
                <Card key={mat.id} className="border-2 border-slate-300 p-5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-700">
                      <FileText className="w-5 h-5 flex-shrink-0" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Course Handout
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-950 text-base">{mat.title}</h4>
                    {mat.description && (
                      <p className="text-xs text-slate-600 font-medium">{mat.description}</p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <a
                      href={mat.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center w-full min-h-[40px] px-3 py-1.5 text-sm font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-300 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      <span>Download Handout</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
