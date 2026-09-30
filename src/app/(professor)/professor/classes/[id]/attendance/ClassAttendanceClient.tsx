'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import {
  getScheduleById,
  getClassRoster,
  getAttendanceForDate,
  saveAttendanceRecords,
  subscribeToProfessorStore,
  type RosterStudent,
} from '@/lib/professor-data';
import type { ScheduleWithDetails } from '@/types/database';
import {
  ClipboardCheck,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Save,
  ArrowLeft,
  Check,
  X,
  FileText,
  Clock,
  GraduationCap,
} from 'lucide-react';

interface ClassAttendanceClientProps {
  scheduleId: string;
}

interface StudentAttendanceState {
  enrollmentId: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  present: boolean;
  remarks: string;
  pastSessionsCount: number;
  attendedSessionsCount: number;
}

export function ClassAttendanceClient({ scheduleId }: ClassAttendanceClientProps) {
  const [schedule, setSchedule] = useState<ScheduleWithDetails | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [roster, setRoster] = useState<StudentAttendanceState[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadData = useCallback(() => {
    const sched = getScheduleById(scheduleId);
    setSchedule(sched);

    const students = getClassRoster(scheduleId);
    const dateRecords = getAttendanceForDate(scheduleId, selectedDate);

    const mapped: StudentAttendanceState[] = students.map((s) => {
      const rec = dateRecords.find((r) => r.enrollmentId === s.enrollmentId);
      const attended = s.attendanceHistory.filter((a) => a.present).length;

      return {
        enrollmentId: s.enrollmentId,
        learnerId: s.learnerId,
        learnerName: s.learnerName,
        learnerEmail: s.learnerEmail,
        present: rec ? rec.present : false,
        remarks: rec ? rec.remarks : '',
        pastSessionsCount: s.attendanceHistory.length,
        attendedSessionsCount: attended,
      };
    });

    setRoster(mapped);
  }, [scheduleId, selectedDate]);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToProfessorStore(loadData);
    return () => unsubscribe();
  }, [loadData]);

  const handleTogglePresent = (enrollmentId: string) => {
    setRoster((prev) =>
      prev.map((item) =>
        item.enrollmentId === enrollmentId
          ? { ...item, present: !item.present }
          : item
      )
    );
  };

  const handleRemarksChange = (enrollmentId: string, remarks: string) => {
    setRoster((prev) =>
      prev.map((item) =>
        item.enrollmentId === enrollmentId ? { ...item, remarks } : item
      )
    );
  };

  const handleMarkAll = (present: boolean) => {
    setRoster((prev) => prev.map((item) => ({ ...item, present })));
  };

  const handleSaveAttendance = () => {
    setIsSaving(true);
    try {
      const payload = roster.map((r) => ({
        enrollmentId: r.enrollmentId,
        present: r.present,
        remarks: r.remarks,
      }));

      saveAttendanceRecords(scheduleId, selectedDate, payload);
      loadData();
      const presentCount = roster.filter((r) => r.present).length;
      setActionNotice(
        `Attendance for ${selectedDate} saved successfully! ${presentCount} of ${roster.length} students marked present.`
      );
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = roster.filter((r) => r.present).length;
  const absentCount = roster.length - presentCount;

  return (
    <div className="space-y-8 pb-12">
      {/* Back button and Header */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
          <Link href="/professor" className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Professor Hub</span>
          </Link>
          <span>/</span>
          <Link href="/professor/schedules" className="hover:text-indigo-600">
            Schedules
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Session Attendance</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider mb-2 border border-indigo-200">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Session Attendance Tracking</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {schedule?.workshop?.title || 'FSL Classroom Section'}
            </h1>
            <p className="text-slate-600 font-medium mt-1">
              Class session: <span className="font-bold text-slate-800">{schedule?.day_time}</span> • Assigned Faculty: <span className="font-bold text-slate-800">{schedule?.professor?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/professor/classes/${scheduleId}/assignments`}>
              <Button variant="outline" className="border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-bold">
                <FileText className="w-4 h-4 mr-1.5" />
                Class Assignments
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <Alert variant="success" className="border-2 border-emerald-500 bg-emerald-50 text-emerald-950 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{actionNotice}</span>
        </Alert>
      )}

      {/* Date Selector & Session Controls */}
      <Card className="border-2 border-slate-300 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-indigo-700" />
              <div>
                <label htmlFor="session-date" className="block text-xs font-black uppercase text-slate-600 tracking-wider">
                  Select Class Session Date
                </label>
                <input
                  id="session-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 px-3.5 py-2 rounded-lg border-2 border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-indigo-600 text-sm"
                />
              </div>
            </div>

            {/* Attendance Summary Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Present: {presentCount}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 text-rose-950 border border-rose-300 text-xs font-black">
                <XCircle className="w-4 h-4 text-rose-700" />
                <span>Absent: {absentCount}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 border border-slate-300 text-xs font-black">
                <Users className="w-4 h-4 text-slate-600" />
                <span>Total: {roster.length}</span>
              </span>
            </div>

            {/* Bulk quick actions & Save */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll(true)}
                className="px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll(false)}
                className="px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg"
              >
                Mark All Absent
              </button>
              <Button
                variant="primary"
                onClick={handleSaveAttendance}
                disabled={isSaving || roster.length === 0}
                className="bg-indigo-700 hover:bg-indigo-800 font-bold"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roster & Checkbox Grid */}
      <Card className="border-2 border-slate-300 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b-2 border-slate-200 pb-4">
          <CardTitle className="text-xl font-black text-slate-900">
            Enrolled Student Attendance Roster
          </CardTitle>
          <CardDescription>
            Check each student present for this session and enter any session performance or absence remarks.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {roster.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-base text-slate-700">No Enrolled Students Found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No active or verified enrollments are recorded for this schedule yet. Learners can enroll from the workshop catalog.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
                  <th className="py-3.5 px-6">Learner Name & Email</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-center">Mark Attendance</th>
                  <th className="py-3.5 px-6">Session Remarks / Notes</th>
                  <th className="py-3.5 px-6 text-right">Attendance History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {roster.map((student) => (
                  <tr
                    key={student.enrollmentId}
                    className={`transition-colors ${
                      student.present ? 'bg-emerald-50/40 hover:bg-emerald-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center justify-center font-black text-xs">
                          {student.learnerName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-slate-900">{student.learnerName}</div>
                          <div className="text-xs font-medium text-slate-500">{student.learnerEmail}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                        Enrolled
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={student.present}
                          onChange={() => handleTogglePresent(student.enrollmentId)}
                          className="w-5 h-5 rounded border-2 border-slate-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                            student.present
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                        >
                          {student.present ? 'Present' : 'Absent'}
                        </span>
                      </label>
                    </td>

                    <td className="py-4 px-6">
                      <input
                        type="text"
                        value={student.remarks}
                        onChange={(e) => handleRemarksChange(student.enrollmentId, e.target.value)}
                        placeholder="e.g. Active camera engagement, late, excused..."
                        className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </td>

                    <td className="py-4 px-6 text-right font-medium text-xs text-slate-600">
                      <div className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {student.attendedSessionsCount} session{student.attendedSessionsCount === 1 ? '' : 's'} recorded
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
