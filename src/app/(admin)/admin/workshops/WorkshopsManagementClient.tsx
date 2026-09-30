'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import {
  getAllWorkshops,
  createWorkshop,
  updateWorkshop,
  getAllSchedulesWithDetails,
  createSchedule,
  updateSchedule,
  getAllUsers,
  subscribeToAdminStore,
} from '@/lib/admin-data';
import type { Workshop, ScheduleWithDetails, Profile, WorkshopLevel } from '@/types/database';
import {
  BookOpen,
  Calendar,
  Plus,
  Edit2,
  Users,
  ExternalLink,
  Video,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';

export function WorkshopsManagementClient() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [professors, setProfessors] = useState<Profile[]>([]);
  const [selectedLevelTab, setSelectedLevelTab] = useState<'all' | '1' | '2' | '3'>('all');
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Workshop Modal State
  const [workshopModalOpen, setWorkshopModalOpen] = useState(false);
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null);
  const [workshopLevel, setWorkshopLevel] = useState<WorkshopLevel>(1);
  const [workshopTitle, setWorkshopTitle] = useState('');
  const [workshopFee, setWorkshopFee] = useState('1500');
  const [workshopDesc, setWorkshopDesc] = useState('');
  const [workshopFormError, setWorkshopFormError] = useState<string | null>(null);

  // Schedule Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleWorkshopId, setScheduleWorkshopId] = useState<string>('');
  const [scheduleProfId, setScheduleProfId] = useState<string>('');
  const [scheduleDayTime, setScheduleDayTime] = useState('');
  const [scheduleSlots, setScheduleSlots] = useState('20');
  const [scheduleMeetingLink, setScheduleMeetingLink] = useState('');
  const [scheduleFormError, setScheduleFormError] = useState<string | null>(null);

  const refreshAll = () => {
    const w = getAllWorkshops();
    const s = getAllSchedulesWithDetails();
    const u = getAllUsers();
    setWorkshops(w);
    setSchedules(s);
    setProfessors(u.filter((p) => p.role === 'professor'));
  };

  useEffect(() => {
    refreshAll();
    const unsubscribe = subscribeToAdminStore(refreshAll);
    return () => unsubscribe();
  }, []);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlertNotice({ type, message });
    setTimeout(() => setAlertNotice(null), 5000);
  };

  // Open Workshop Creator
  const handleOpenCreateWorkshop = () => {
    setEditingWorkshopId(null);
    setWorkshopLevel(1);
    setWorkshopTitle('');
    setWorkshopFee('1500');
    setWorkshopDesc('');
    setWorkshopFormError(null);
    setWorkshopModalOpen(true);
  };

  // Open Workshop Editor
  const handleOpenEditWorkshop = (ws: Workshop) => {
    setEditingWorkshopId(ws.id);
    setWorkshopLevel(ws.level);
    setWorkshopTitle(ws.title);
    setWorkshopFee(ws.fee.toString());
    setWorkshopDesc(ws.description);
    setWorkshopFormError(null);
    setWorkshopModalOpen(true);
  };

  // Save Workshop
  const handleSaveWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkshopFormError(null);

    if (!workshopTitle.trim()) {
      setWorkshopFormError('Workshop title is required.');
      return;
    }
    const feeNum = parseFloat(workshopFee);
    if (isNaN(feeNum) || feeNum < 0) {
      setWorkshopFormError('Workshop fee must be a non-negative number.');
      return;
    }

    try {
      if (editingWorkshopId) {
        updateWorkshop(editingWorkshopId, {
          level: workshopLevel,
          title: workshopTitle,
          fee: feeNum,
          description: workshopDesc,
        });
        showAlert(`Workshop "${workshopTitle}" updated successfully.`);
      } else {
        createWorkshop({
          level: workshopLevel,
          title: workshopTitle,
          fee: feeNum,
          description: workshopDesc,
        });
        showAlert(`New Level ${workshopLevel} workshop "${workshopTitle}" created successfully.`);
      }
      setWorkshopModalOpen(false);
      refreshAll();
    } catch (err) {
      setWorkshopFormError((err as Error).message);
    }
  };

  // Open Schedule Creator
  const handleOpenCreateSchedule = (workshopId: string) => {
    setEditingScheduleId(null);
    setScheduleWorkshopId(workshopId);
    setScheduleProfId(professors[0]?.id || '');
    setScheduleDayTime('Saturdays 09:00 AM - 12:00 PM');
    setScheduleSlots('20');
    setScheduleMeetingLink('https://meet.google.com/fsl-class');
    setScheduleFormError(null);
    setScheduleModalOpen(true);
  };

  // Open Schedule Editor
  const handleOpenEditSchedule = (sch: ScheduleWithDetails) => {
    setEditingScheduleId(sch.id);
    setScheduleWorkshopId(sch.workshop_id);
    setScheduleProfId(sch.professor_id);
    setScheduleDayTime(sch.day_time);
    setScheduleSlots(sch.slots.toString());
    setScheduleMeetingLink(sch.meeting_link || '');
    setScheduleFormError(null);
    setScheduleModalOpen(true);
  };

  // Save Schedule
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleFormError(null);

    if (!scheduleProfId) {
      setScheduleFormError('A professor must be assigned.');
      return;
    }
    if (!scheduleDayTime.trim()) {
      setScheduleFormError('Day and time string is required.');
      return;
    }
    const slotsNum = parseInt(scheduleSlots, 10);
    if (isNaN(slotsNum) || slotsNum < 1) {
      setScheduleFormError('Slots quota must be at least 1.');
      return;
    }

    try {
      if (editingScheduleId) {
        updateSchedule(editingScheduleId, {
          professor_id: scheduleProfId,
          day_time: scheduleDayTime,
          slots: slotsNum,
          meeting_link: scheduleMeetingLink,
        });
        showAlert(`Schedule updated successfully.`);
      } else {
        createSchedule({
          workshop_id: scheduleWorkshopId,
          professor_id: scheduleProfId,
          day_time: scheduleDayTime,
          slots: slotsNum,
          meeting_link: scheduleMeetingLink,
        });
        showAlert(`New class schedule created and assigned to professor.`);
      }
      setScheduleModalOpen(false);
      refreshAll();
    } catch (err) {
      setScheduleFormError((err as Error).message);
    }
  };

  // Filter workshops by level tab
  const filteredWorkshops = workshops.filter((w) => {
    if (selectedLevelTab === 'all') return true;
    return w.level.toString() === selectedLevelTab;
  });

  const targetWorkshopForSchedule = workshops.find((w) => w.id === scheduleWorkshopId);

  return (
    <div className="space-y-8 pb-16">
      {/* Navigation Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Console</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-700" />
            <span>Workshops & Schedules Management</span>
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1 max-w-3xl">
            Configure official Filipino Sign Language levels (Levels 1, 2, 3), adjust tuition fees, assign licensed Deaf and hearing FSL faculty, and manage slot quotas and meeting links.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleOpenCreateWorkshop}
          className="shadow-md font-bold self-start sm:self-auto bg-purple-700 hover:bg-purple-800"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          <span>Create Workshop</span>
        </Button>
      </div>

      {/* Visual Feedback Notice */}
      {alertNotice && (
        <Alert
          variant={alertNotice.type}
          title={alertNotice.type === 'success' ? 'Success' : 'Error'}
          onClose={() => setAlertNotice(null)}
        >
          {alertNotice.message}
        </Alert>
      )}

      {/* Level Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-slate-200 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">
          Filter by Level:
        </span>
        <button
          type="button"
          onClick={() => setSelectedLevelTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-600 ${
            selectedLevelTab === 'all'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
          }`}
        >
          All Levels ({workshops.length})
        </button>
        {[1, 2, 3].map((lvl) => {
          const count = workshops.filter((w) => w.level === lvl).length;
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevelTab(lvl.toString() as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-600 ${
                selectedLevelTab === lvl.toString()
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              Level {lvl} ({count})
            </button>
          );
        })}
      </div>

      {/* Workshop List Categorized by Level */}
      <div className="space-y-6">
        {filteredWorkshops.map((workshop) => {
          const workshopSchedules = schedules.filter((s) => s.workshop_id === workshop.id);

          return (
            <Card key={workshop.id} className="border-2 border-slate-300 shadow-sm overflow-hidden">
              {/* Workshop Header Bar */}
              <div className="p-6 bg-slate-50 border-b-2 border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                        workshop.level === 1
                          ? 'bg-blue-100 text-blue-900 border-blue-400'
                          : workshop.level === 2
                          ? 'bg-purple-100 text-purple-900 border-purple-400'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                      }`}
                    >
                      FSL Level {workshop.level}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {workshop.title}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-700 font-medium max-w-3xl leading-relaxed">
                    {workshop.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                  <div className="text-right mr-2">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tuition Fee
                    </span>
                    <span className="text-2xl font-black text-emerald-800">
                      ₱{workshop.fee.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditWorkshop(workshop)}
                    className="font-bold border-slate-400"
                  >
                    <Edit2 className="w-4 h-4 mr-1.5 text-slate-600" />
                    Edit Workshop
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleOpenCreateSchedule(workshop.id)}
                    className="font-bold"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Schedule
                  </Button>
                </div>
              </div>

              {/* Schedules Table */}
              <CardContent className="p-0">
                <div className="p-4 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-700" />
                    <span>Active Class Schedules ({workshopSchedules.length})</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-600">
                    Quota & faculty assignments
                  </span>
                </div>

                {workshopSchedules.length === 0 ? (
                  <div className="p-8 text-center bg-white">
                    <p className="text-sm font-semibold text-slate-500">
                      No active schedules for this workshop. Click &quot;Add Schedule&quot; to open a class section.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
                          <th className="py-3 px-6">Schedule / Time</th>
                          <th className="py-3 px-6">Assigned Professor</th>
                          <th className="py-3 px-6">Slot Controls</th>
                          <th className="py-3 px-6">Meeting Link</th>
                          <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm bg-white">
                        {workshopSchedules.map((sch) => {
                          const enrolled = sch.enrolled_count || 0;
                          const available = Math.max(0, sch.slots - enrolled);

                          return (
                            <tr key={sch.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3.5 px-6 font-bold text-slate-900">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                                  <span>{sch.day_time}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-6 font-semibold text-slate-800">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center justify-center text-xs font-black">
                                    {sch.professor?.name?.charAt(0) || 'P'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900">
                                      {sch.professor?.name || 'Unassigned'}
                                    </div>
                                    <div className="text-xs text-slate-500 font-normal">
                                      {sch.professor?.email}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-6">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">
                                    {enrolled} / {sch.slots}
                                  </span>
                                  <span
                                    className={`text-xs font-black px-2 py-0.5 rounded-full border ${
                                      available === 0
                                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                                        : available <= 3
                                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    }`}
                                  >
                                    {available === 0 ? 'Full' : `${available} slots left`}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-6">
                                {sch.meeting_link ? (
                                  <a
                                    href={sch.meeting_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline max-w-[220px] truncate"
                                  >
                                    <Video className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                                    <span className="truncate">{sch.meeting_link}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">No link set</span>
                                )}
                              </td>

                              <td className="py-3.5 px-6 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEditSchedule(sch)}
                                  className="font-bold text-xs"
                                >
                                  Edit Schedule
                                </Button>
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
          );
        })}
      </div>

      {/* CREATE / EDIT WORKSHOP MODAL */}
      <Modal
        isOpen={workshopModalOpen}
        onClose={() => setWorkshopModalOpen(false)}
        title={editingWorkshopId ? 'Edit Workshop Details' : 'Create New Workshop Offering'}
        description="Configure official FSL curriculum details, target level, and registration fees."
      >
        <form onSubmit={handleSaveWorkshop} className="space-y-4">
          {workshopFormError && (
            <Alert variant="error" title="Validation Error">
              {workshopFormError}
            </Alert>
          )}

          <Select
            label="FSL Workshop Level"
            value={workshopLevel.toString()}
            onChange={(e) => setWorkshopLevel(Number(e.target.value) as WorkshopLevel)}
            options={[
              { value: '1', label: 'Level 1: Foundations & Visual Gestural Communication' },
              { value: '2', label: 'Level 2: Grammar, Classifiers & Discourse' },
              { value: '3', label: 'Level 3: Advanced Fluency & Cultural Immersion' },
            ]}
          />

          <Input
            label="Workshop Title"
            value={workshopTitle}
            onChange={(e) => setWorkshopTitle(e.target.value)}
            placeholder="e.g. FSL Level 1 Weekend Intensive"
            required
          />

          <Input
            label="Tuition Fee (₱)"
            type="number"
            min="0"
            step="50"
            value={workshopFee}
            onChange={(e) => setWorkshopFee(e.target.value)}
            placeholder="1500"
            required
          />

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5 select-none">
              Description & Syllabus Summary
            </label>
            <textarea
              value={workshopDesc}
              onChange={(e) => setWorkshopDesc(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-white text-slate-950 font-medium rounded-lg border-2 border-slate-300 hover:border-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100 focus-visible:outline-none transition-all placeholder:text-slate-500 text-sm"
              placeholder="Detailed syllabus topics, manual alphabet, survival signs, grammatical structures, etc."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setWorkshopModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingWorkshopId ? 'Save Changes' : 'Create Workshop'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CREATE / EDIT SCHEDULE MODAL */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title={editingScheduleId ? 'Edit Class Schedule' : 'Create Class Schedule'}
        description={
          targetWorkshopForSchedule
            ? `Configuring class schedule for ${targetWorkshopForSchedule.title}`
            : 'Configure class schedule and faculty assignment.'
        }
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          {scheduleFormError && (
            <Alert variant="error" title="Validation Error">
              {scheduleFormError}
            </Alert>
          )}

          <Select
            label="Assign Professor / Teacher"
            value={scheduleProfId}
            onChange={(e) => setScheduleProfId(e.target.value)}
            options={professors.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.email})`,
            }))}
            helperText="Only verified faculty members with professor role are eligible."
          />

          <Input
            label="Day & Time Schedule"
            value={scheduleDayTime}
            onChange={(e) => setScheduleDayTime(e.target.value)}
            placeholder="e.g. Saturdays 09:00 AM - 12:00 PM"
            required
            helperText="Clear class timing visible to students during enrollment."
          />

          <Input
            label="Class Slot Quota"
            type="number"
            min="1"
            max="100"
            value={scheduleSlots}
            onChange={(e) => setScheduleSlots(e.target.value)}
            required
            helperText="Maximum student enrollment capacity for interactive video signing."
          />

          <Input
            label="Virtual Meeting Link (Zoom / Google Meet)"
            type="url"
            value={scheduleMeetingLink}
            onChange={(e) => setScheduleMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/xyz-abc"
            helperText="Class video link accessible to students once payment is verified."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingScheduleId ? 'Update Schedule' : 'Create & Assign Schedule'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
