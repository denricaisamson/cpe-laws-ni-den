'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import {
  getProfessorSchedules,
  getProfessorKpis,
  updateMeetingLink,
  subscribeToProfessorStore,
} from '@/lib/professor-data';
import type { ScheduleWithDetails } from '@/types/database';
import {
  GraduationCap,
  Calendar,
  Users,
  ClipboardCheck,
  FileText,
  ExternalLink,
  Video,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Megaphone,
  BookOpen,
} from 'lucide-react';

interface ProfessorDashboardClientProps {
  initialProfName: string;
  initialProfId?: string;
}

export function ProfessorDashboardClient({
  initialProfName,
  initialProfId,
}: ProfessorDashboardClientProps) {
  const [selectedProfId, setSelectedProfId] = useState<string>(initialProfId || 'all');
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [kpis, setKpis] = useState(getProfessorKpis(initialProfId));
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editLinkValue, setEditLinkValue] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const refreshData = useCallback(() => {
    const list = getProfessorSchedules(selectedProfId === 'all' ? undefined : selectedProfId);
    setSchedules(list);
    setKpis(getProfessorKpis(selectedProfId === 'all' ? undefined : selectedProfId));
  }, [selectedProfId]);

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToProfessorStore(refreshData);
    return () => unsubscribe();
  }, [refreshData]);

  const handleStartEditLink = (schedule: ScheduleWithDetails) => {
    setEditingScheduleId(schedule.id);
    setEditLinkValue(schedule.meeting_link || '');
  };

  const handleSaveLink = (scheduleId: string) => {
    try {
      if (!editLinkValue.trim()) {
        alert('Meeting link cannot be empty');
        return;
      }
      updateMeetingLink(scheduleId, editLinkValue.trim());
      setEditingScheduleId(null);
      refreshData();
      setActionNotice('Virtual meeting link updated successfully!');
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-indigo-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/80 text-indigo-200 text-xs font-bold border border-indigo-600 mb-3">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>Professor Classroom & Attendance Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Classroom Hub: {initialProfName}
            </h1>
            <p className="text-indigo-100 text-base font-medium mt-2 max-w-2xl">
              Manage your assigned workshop schedules, update virtual Google Meet / Zoom links, take session attendance, and review student signing submissions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/professor/schedules">
              <Button variant="primary" size="lg" className="bg-indigo-600 hover:bg-indigo-700 border-indigo-500 shadow-md">
                <Calendar className="w-5 h-5 mr-2" />
                Manage Schedules
              </Button>
            </Link>
            <Link href="/professor/materials">
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Video className="w-5 h-5 mr-2" />
                Materials & Videos
              </Button>
            </Link>
            <Link href="/professor/announcements">
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Megaphone className="w-5 h-5 mr-2" />
                Post Announcement
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Feedback Alert */}
      {actionNotice && (
        <Alert variant="success" className="border-2 border-emerald-500 bg-emerald-50 text-emerald-950 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{actionNotice}</span>
        </Alert>
      )}

      {/* Faculty View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border-2 border-slate-300 shadow-sm">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-700" />
          <span className="text-sm font-bold text-slate-800">Faculty Schedule Filter:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedProfId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors border-2 ${
              selectedProfId === 'all'
                ? 'bg-indigo-700 text-white border-indigo-900 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            All Faculty Schedules
          </button>
          <button
            type="button"
            onClick={() => setSelectedProfId('b0000000-0000-0000-0000-000000000001')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors border-2 ${
              selectedProfId === 'b0000000-0000-0000-0000-000000000001' || selectedProfId === 'prof-1'
                ? 'bg-indigo-700 text-white border-indigo-900 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            Prof. Rommel Agravante
          </button>
          <button
            type="button"
            onClick={() => setSelectedProfId('b0000000-0000-0000-0000-000000000002')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors border-2 ${
              selectedProfId === 'b0000000-0000-0000-0000-000000000002' || selectedProfId === 'prof-2'
                ? 'bg-indigo-700 text-white border-indigo-900 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            Prof. Liza Flores
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Assigned Sections
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {kpis.assignedSectionsCount}
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-1">Active workshop cohorts</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 border-2 border-indigo-300 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Total Enrolled Students
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {kpis.totalEnrolledStudents}
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-1">Active enrolled learners</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 border-2 border-blue-300 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Submissions Pending Grading
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {kpis.pendingSubmissionsCount}
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-1">Awaiting instructor evaluation</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 border-2 border-amber-300 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Upcoming Sessions
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {kpis.upcomingSessionsCount}
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-1">Scheduled class sessions</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 border-2 border-emerald-300 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Schedules Table Card */}
      <Card className="border-2 border-slate-300 shadow-sm">
        <CardHeader className="bg-slate-50 border-b-2 border-slate-200 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Your Assigned Workshop Schedules</CardTitle>
            <CardDescription>
              Review schedules, update classroom meeting links, and launch attendance or assignment sessions.
            </CardDescription>
          </div>
          <Link href="/professor/schedules">
            <Button variant="outline" size="sm" className="font-bold">
              View All Schedules
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
                <th className="py-3 px-6">Workshop & Level</th>
                <th className="py-3 px-6">Assigned Faculty</th>
                <th className="py-3 px-6">Day & Time</th>
                <th className="py-3 px-6">Slot Capacity</th>
                <th className="py-3 px-6">Virtual Meeting Link</th>
                <th className="py-3 px-6 text-right">Class Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {schedules.map((schedule) => {
                const isEditing = editingScheduleId === schedule.id;

                return (
                  <tr key={schedule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div>{schedule.workshop?.title || 'FSL Workshop'}</div>
                      <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block mt-0.5">
                        Level {schedule.workshop?.level || 1}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span>{schedule.professor?.name || 'Assigned Faculty'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>{schedule.day_time}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span>
                          {schedule.enrolled_count || 0} / {schedule.slots} slots
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={editLinkValue}
                            onChange={(e) => setEditLinkValue(e.target.value)}
                            placeholder="https://meet.google.com/..."
                            className="text-xs font-mono px-2 py-1 border-2 border-indigo-500 rounded bg-white w-48 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveLink(schedule.id)}
                            className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
                            title="Save Meeting Link"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingScheduleId(null)}
                            className="p-1 text-slate-500 hover:bg-slate-200 rounded"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {schedule.meeting_link ? (
                            <a
                              href={schedule.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-blue-700 hover:text-blue-900 font-bold underline gap-1"
                            >
                              <span className="max-w-[140px] truncate">{schedule.meeting_link}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No link set</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStartEditLink(schedule)}
                            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Quick Edit Link"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/professor/classes/${schedule.id}/attendance`}>
                          <Button variant="primary" size="sm" className="bg-indigo-700 hover:bg-indigo-800 text-xs font-bold py-1">
                            Attendance
                          </Button>
                        </Link>
                        <Link href={`/professor/classes/${schedule.id}/assignments`}>
                          <Button variant="outline" size="sm" className="border-indigo-600 text-indigo-700 hover:bg-indigo-50 text-xs font-bold py-1">
                            Assignments
                          </Button>
                        </Link>
                        <Link href={`/professor/announcements`}>
                          <Button variant="ghost" size="sm" className="text-slate-700 hover:bg-slate-100 text-xs font-bold py-1">
                            Announcements
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
