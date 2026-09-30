'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import {
  getProfessorSchedules,
  getAnnouncementsForProfessor,
  createAnnouncement,
  subscribeToProfessorStore,
} from '@/lib/professor-data';
import type { ScheduleWithDetails, Announcement, Profile } from '@/types/database';
import {
  Megaphone,
  PlusCircle,
  CheckCircle2,
  X,
  Save,
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  GraduationCap,
  Bell,
  AlertCircle,
} from 'lucide-react';

interface AnnouncementsPublishingClientProps {
  initialProfId?: string;
  initialProfName?: string;
}

export function AnnouncementsPublishingClient({
  initialProfId,
  initialProfName,
}: AnnouncementsPublishingClientProps) {
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [announcements, setAnnouncements] = useState<
    (Announcement & { schedule?: ScheduleWithDetails; author?: Profile })[]
  >([]);
  const [filterScheduleId, setFilterScheduleId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetScheduleId, setTargetScheduleId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = useCallback(() => {
    const schedList = getProfessorSchedules(initialProfId);
    setSchedules(schedList);
    setAnnouncements(getAnnouncementsForProfessor(initialProfId));
  }, [initialProfId]);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToProfessorStore(loadData);
    return () => unsubscribe();
  }, [loadData]);

  const handleOpenModal = () => {
    setTitle('');
    setBody('');
    setTargetScheduleId(schedules[0]?.id || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Announcement title cannot be empty');
      return;
    }
    if (!body.trim()) {
      setFormError('Announcement body cannot be empty');
      return;
    }

    try {
      const authorId = initialProfId || 'b0000000-0000-0000-0000-000000000001';
      createAnnouncement({
        authorId,
        scheduleId: targetScheduleId === 'all' || !targetScheduleId ? null : targetScheduleId,
        title: title.trim(),
        body: body.trim(),
      });

      setIsModalOpen(false);
      loadData();
      setActionNotice(`Class Announcement "${title}" published successfully!`);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    if (filterScheduleId === 'all') return true;
    return a.schedule_id === filterScheduleId;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header and Back Link */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
          <Link href="/professor" className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Professor Hub</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Class Announcements</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider mb-2 border border-indigo-200">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Learner Communication Channel</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Class Announcements Publisher
            </h1>
            <p className="text-slate-600 font-medium mt-1">
              Broadcast critical schedule reminders, lighting & camera guidelines, and workshop notices to enrolled learners.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleOpenModal}
            className="bg-indigo-700 hover:bg-indigo-800 font-bold shadow-md"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Post New Announcement
          </Button>
        </div>
      </div>

      {/* Visual Feedback Alert */}
      {actionNotice && (
        <Alert variant="success" className="border-2 border-emerald-500 bg-emerald-50 text-emerald-950 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{actionNotice}</span>
        </Alert>
      )}

      {/* Schedule Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border-2 border-slate-300 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-700" />
          <span className="text-sm font-bold text-slate-800">Filter by Class Cohort:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterScheduleId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors border-2 ${
              filterScheduleId === 'all'
                ? 'bg-indigo-700 text-white border-indigo-900 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            All Announcements ({announcements.length})
          </button>
          {schedules.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setFilterScheduleId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors border-2 ${
                filterScheduleId === s.id
                  ? 'bg-indigo-700 text-white border-indigo-900 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {s.workshop?.title}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-slate-300">
            <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-base text-slate-700">No Announcements Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Broadcast orientation guidelines, session updates, or study pointers to your enrolled learners.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenModal}
              className="mt-4 font-bold text-xs"
            >
              Post First Announcement
            </Button>
          </Card>
        ) : (
          filteredAnnouncements.map((ann) => (
            <Card key={ann.id} className="border-2 border-slate-300 shadow-sm">
              <CardHeader className="bg-slate-50 border-b-2 border-slate-200 pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {ann.schedule ? (
                        <span className="text-xs font-black uppercase text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-300">
                          {ann.schedule.workshop?.title} • {ann.schedule.day_time}
                        </span>
                      ) : (
                        <span className="text-xs font-black uppercase text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300">
                          General Announcement
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900">
                      {ann.title}
                    </CardTitle>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <p className="text-sm text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                  {ann.body}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Post Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-slate-300 shadow-2xl overflow-hidden">
            <div className="bg-indigo-900 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-indigo-300" />
                  <span>Post Class Announcement</span>
                </h3>
                <p className="text-xs text-indigo-200 font-medium mt-1">
                  Notify enrolled students of schedules, video drills, or zoom preparation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-indigo-800 text-indigo-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-lg text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Select Target Cohort
                </label>
                <select
                  value={targetScheduleId}
                  onChange={(e) => setTargetScheduleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-bold bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="all">All My Assigned Classes</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.workshop?.title} (Level {s.workshop?.level}) — {s.day_time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="e.g. Session 2 Video Drill Links & Camera Lighting Check"
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-bold focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Announcement Content / Body
                </label>
                <textarea
                  rows={5}
                  required
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="Write clear instructions, meeting links, or assignments guidelines..."
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-medium focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
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
                  Publish Announcement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
