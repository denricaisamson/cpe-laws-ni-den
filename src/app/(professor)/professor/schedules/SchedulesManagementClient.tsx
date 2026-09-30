'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import {
  getProfessorSchedules,
  updateMeetingLink,
  subscribeToProfessorStore,
} from '@/lib/professor-data';
import type { ScheduleWithDetails } from '@/types/database';
import {
  Calendar,
  Users,
  Video,
  ExternalLink,
  Edit,
  CheckCircle2,
  X,
  Save,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Megaphone,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

interface SchedulesManagementClientProps {
  initialProfId?: string;
  initialProfName?: string;
}

export function SchedulesManagementClient({
  initialProfId,
  initialProfName,
}: SchedulesManagementClientProps) {
  const [selectedProfId, setSelectedProfId] = useState<string>(initialProfId || 'all');
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleWithDetails | null>(null);
  const [linkInput, setLinkInput] = useState<string>('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const refreshSchedules = useCallback(() => {
    const list = getProfessorSchedules(selectedProfId === 'all' ? undefined : selectedProfId);
    setSchedules(list);
  }, [selectedProfId]);

  useEffect(() => {
    refreshSchedules();
    const unsubscribe = subscribeToProfessorStore(refreshSchedules);
    return () => unsubscribe();
  }, [refreshSchedules]);

  const handleOpenEditModal = (schedule: ScheduleWithDetails) => {
    setEditingSchedule(schedule);
    setLinkInput(schedule.meeting_link || '');
    setLinkError(null);
  };

  const handleSaveMeetingLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    const trimmed = linkInput.trim();
    if (!trimmed) {
      setLinkError('Meeting link cannot be empty');
      return;
    }

    try {
      updateMeetingLink(editingSchedule.id, trimmed);
      setEditingSchedule(null);
      refreshSchedules();
      setActionNotice(`Meeting link for "${editingSchedule.workshop?.title}" updated successfully!`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      setLinkError((err as Error).message);
    }
  };

  const setPresetLink = (type: 'meet' | 'zoom') => {
    if (type === 'meet') {
      setLinkInput(`https://meet.google.com/fsl-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`);
    } else {
      setLinkInput(`https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    }
    setLinkError(null);
  };

  const totalSlots = schedules.reduce((sum, s) => sum + s.slots, 0);
  const totalEnrolled = schedules.reduce((sum, s) => sum + (s.enrolled_count || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-1">
            <Link href="/professor" className="hover:text-indigo-600 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-700" />
            <span>Assigned Schedules & Meeting Links</span>
          </h1>
          <p className="text-slate-600 font-medium mt-1">
            Configure virtual classroom meeting URLs (Zoom / Google Meet), monitor cohort rosters, and launch class sessions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/professor/materials">
            <Button variant="outline" className="border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-bold">
              <Video className="w-4 h-4 mr-2" />
              Upload Materials & Videos
            </Button>
          </Link>
          <Link href="/professor/announcements">
            <Button variant="primary" className="bg-indigo-700 hover:bg-indigo-800 font-bold">
              <Megaphone className="w-4 h-4 mr-2" />
              Post Announcement
            </Button>
          </Link>
        </div>
      </div>

      {/* Visual Feedback Alert */}
      {actionNotice && (
        <Alert variant="success" className="border-2 border-emerald-500 bg-emerald-50 text-emerald-950 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{actionNotice}</span>
        </Alert>
      )}

      {/* Faculty Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border-2 border-slate-300 shadow-sm">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-700" />
          <span className="text-sm font-bold text-slate-800">Faculty Filter:</span>
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
            All Assigned Schedules
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

      {/* Cohort Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">Active Cohorts</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{schedules.length}</h3>
              <p className="text-xs font-semibold text-slate-600 mt-1">Assigned workshop schedules</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 border-2 border-indigo-300 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">Total Enrolled</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{totalEnrolled}</h3>
              <p className="text-xs font-semibold text-slate-600 mt-1">Confirmed learners across cohorts</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 border-2 border-blue-300 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">Total Capacity</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{totalSlots}</h3>
              <p className="text-xs font-semibold text-slate-600 mt-1">Total combined slot quota</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 border-2 border-emerald-300 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules Detailed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="border-2 border-slate-300 shadow-sm flex flex-col justify-between">
            <CardHeader className="bg-slate-50 border-b-2 border-slate-200 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-black uppercase text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-300">
                      FSL Level {schedule.workshop?.level || 1}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      ₱{(schedule.workshop?.fee || 0).toLocaleString()} Workshop Fee
                    </span>
                  </div>
                  <CardTitle className="text-xl font-black text-slate-900">
                    {schedule.workshop?.title || 'FSL Workshop'}
                  </CardTitle>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-300">
                    <Users className="w-3.5 h-3.5" />
                    <span>{schedule.enrolled_count || 0} / {schedule.slots} Enrolled</span>
                  </span>
                </div>
              </div>
              <CardDescription className="text-xs font-semibold text-slate-600 mt-2">
                Faculty Instructor: <span className="font-bold text-slate-900">{schedule.professor?.name || 'Assigned Professor'}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Day and Time info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 border border-slate-200">
                  <Calendar className="w-5 h-5 text-indigo-700 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Session</p>
                    <p className="text-sm font-black text-slate-900">{schedule.day_time}</p>
                  </div>
                </div>

                {/* Meeting Link Box */}
                <div className="p-4 rounded-xl bg-indigo-50/60 border-2 border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-indigo-700" />
                      Virtual Meeting Link (Zoom / Meet)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(schedule)}
                      className="inline-flex items-center gap-1 text-xs font-black text-indigo-700 hover:text-indigo-900 hover:underline"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit Link</span>
                    </button>
                  </div>

                  {schedule.meeting_link ? (
                    <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-indigo-200">
                      <a
                        href={schedule.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-blue-700 hover:text-blue-900 underline truncate max-w-[280px]"
                      >
                        {schedule.meeting_link}
                      </a>
                      <a
                        href={schedule.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-sm flex-shrink-0"
                      >
                        <span>Join</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-300">
                      <span className="text-xs text-slate-400 italic">No link assigned yet</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(schedule)}
                        className="text-xs font-bold py-0.5"
                      >
                        Add Link
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2">
                <Link href={`/professor/classes/${schedule.id}/attendance`} className="flex-1">
                  <Button variant="primary" className="w-full bg-indigo-700 hover:bg-indigo-800 text-xs font-black">
                    <ClipboardCheck className="w-4 h-4 mr-1.5" />
                    Attendance
                  </Button>
                </Link>

                <Link href={`/professor/classes/${schedule.id}/assignments`} className="flex-1">
                  <Button variant="outline" className="w-full border-indigo-600 text-indigo-700 hover:bg-indigo-50 text-xs font-black">
                    <FileText className="w-4 h-4 mr-1.5" />
                    Assignments
                  </Button>
                </Link>

                <Link href="/professor/materials">
                  <Button variant="ghost" className="text-slate-700 hover:bg-slate-100 text-xs font-black" title="Upload Materials">
                    <Video className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Meeting Link Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-slate-300 shadow-2xl overflow-hidden">
            <div className="bg-indigo-900 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-300" />
                  <span>Update Virtual Meeting Link</span>
                </h3>
                <p className="text-xs text-indigo-200 font-medium mt-1">
                  {editingSchedule.workshop?.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSchedule(null)}
                className="p-1 rounded-lg hover:bg-indigo-800 text-indigo-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeetingLink} className="p-6 space-y-4">
              {linkError && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-lg text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{linkError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Virtual Meeting URL (Zoom / Google Meet)
                </label>
                <input
                  type="text"
                  required
                  value={linkInput}
                  onChange={(e) => {
                    setLinkInput(e.target.value);
                    setLinkError(null);
                  }}
                  placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/..."
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 font-mono text-sm focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enrolled students will see and click this link directly in their class portal.
                </p>
              </div>

              {/* Quick Template Presets */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">Quick link generators:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetLink('meet')}
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-300"
                  >
                    Google Meet Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetLink('zoom')}
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-300"
                  >
                    Zoom Room Preset
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingSchedule(null)}
                  className="font-bold text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-indigo-700 hover:bg-indigo-800 font-bold"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Save Meeting Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
