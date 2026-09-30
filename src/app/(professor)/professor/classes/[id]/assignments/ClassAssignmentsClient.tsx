'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import {
  getScheduleById,
  getAssignmentsForSchedule,
  createAssignment,
  gradeSubmission,
  subscribeToProfessorStore,
  type AssignmentWithFullDetails,
} from '@/lib/professor-data';
import type { ScheduleWithDetails, Submission, Profile } from '@/types/database';
import {
  FileText,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  PlusCircle,
  X,
  Save,
  ArrowLeft,
  Award,
  Video,
  ClipboardCheck,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

interface ClassAssignmentsClientProps {
  scheduleId: string;
}

export function ClassAssignmentsClient({ scheduleId }: ClassAssignmentsClientProps) {
  const [schedule, setSchedule] = useState<ScheduleWithDetails | null>(null);
  const [assignments, setAssignments] = useState<AssignmentWithFullDetails[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  // Create Assignment Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newInstructions, setNewInstructions] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Grading Drawer/Modal State
  const [gradingSubmission, setGradingSubmission] = useState<(Submission & { learner?: Profile }) | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [gradeError, setGradeError] = useState<string | null>(null);

  // Action Notice Toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = useCallback(() => {
    const sched = getScheduleById(scheduleId);
    setSchedule(sched);

    const asgList = getAssignmentsForSchedule(scheduleId);
    setAssignments(asgList);

    setSelectedAssignmentId((prev) => {
      if (prev) return prev;
      return asgList.length > 0 ? asgList[0].id : null;
    });
  }, [scheduleId]);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToProfessorStore(loadData);
    return () => unsubscribe();
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setNewTitle('');
    setNewInstructions('');
    // Default due date: 7 days from now
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
    setNewDueDate(nextWeek);
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCreateError('Assignment title cannot be empty');
      return;
    }
    if (!newDueDate) {
      setCreateError('Due date is required');
      return;
    }

    try {
      const created = createAssignment({
        scheduleId,
        title: newTitle.trim(),
        description: newInstructions.trim(),
        dueDate: newDueDate,
      });

      setIsCreateModalOpen(false);
      setSelectedAssignmentId(created.id);
      loadData();
      setActionNotice(`Assignment "${created.title}" posted successfully!`);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      setCreateError((err as Error).message);
    }
  };

  const handleOpenGradingDrawer = (sub: Submission & { learner?: Profile }) => {
    setGradingSubmission(sub);
    setGradeInput(sub.grade !== null && sub.grade !== undefined ? String(sub.grade) : '');
    setFeedbackInput(sub.feedback || '');
    setGradeError(null);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    const num = Number(gradeInput);
    if (isNaN(num) || num < 0 || num > 100) {
      setGradeError('Grade must be a number between 0 and 100');
      return;
    }

    try {
      gradeSubmission(gradingSubmission.id, num, feedbackInput.trim());
      setGradingSubmission(null);
      loadData();
      setActionNotice(
        `Grade of ${num}/100 and instructor feedback saved for ${gradingSubmission.learner?.name || 'student'}!`
      );
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      setGradeError((err as Error).message);
    }
  };

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Navigation Header */}
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
          <span className="text-slate-900 font-bold">Assignments & Grading</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider mb-2 border border-indigo-200">
              <FileText className="w-3.5 h-3.5" />
              <span>Assignment & Rubric Grading Center</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {schedule?.workshop?.title || 'Classroom Assignments'}
            </h1>
            <p className="text-slate-600 font-medium mt-1">
              Class session: <span className="font-bold text-slate-800">{schedule?.day_time}</span> • Level: <span className="font-bold text-slate-800">FSL Level {schedule?.workshop?.level}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={handleOpenCreateModal}
              className="bg-indigo-700 hover:bg-indigo-800 font-bold shadow-md"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Post New Assignment
            </Button>
            <Link href={`/professor/classes/${scheduleId}/attendance`}>
              <Button variant="outline" className="border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-bold">
                <ClipboardCheck className="w-4 h-4 mr-1.5" />
                Attendance Roster
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

      {/* Main Two-Column Layout: Assignment Selector & Submissions Review */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Posted Assignments List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black uppercase text-slate-700 tracking-wider">
              Coursework ({assignments.length})
            </h3>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>

          {assignments.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-300 p-8 text-center">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-sm text-slate-700">No Assignments Posted Yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Post an FSL signing video prompt or visual grammar assignment for this class.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenCreateModal}
                className="mt-4 text-xs font-bold"
              >
                Post First Assignment
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {assignments.map((asg) => {
                const isSelected = selectedAssignment?.id === asg.id;
                return (
                  <div
                    key={asg.id}
                    onClick={() => setSelectedAssignmentId(asg.id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-black text-sm text-slate-900 leading-snug line-clamp-2">
                        {asg.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: {new Date(asg.due_date).toLocaleDateString()}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">
                        {asg.submissionsCount} submission{asg.submissionsCount === 1 ? '' : 's'}
                      </span>
                      {asg.pendingCount > 0 ? (
                        <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          {asg.pendingCount} to grade
                        </span>
                      ) : (
                        <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          All graded
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Assignment Details & Submissions Review */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAssignment ? (
            <>
              {/* Selected Assignment Header Card */}
              <Card className="border-2 border-slate-300 shadow-sm">
                <CardHeader className="bg-slate-50 border-b-2 border-slate-200 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due {new Date(selectedAssignment.due_date).toLocaleString()}</span>
                      </div>
                      <CardTitle className="text-xl font-black text-slate-900">
                        {selectedAssignment.title}
                      </CardTitle>
                    </div>

                    <div className="flex gap-2">
                      <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-300">
                        {selectedAssignment.submissionsCount} Submitted
                      </span>
                    </div>
                  </div>
                  {selectedAssignment.description && (
                    <CardDescription className="text-sm font-medium text-slate-700 mt-3 whitespace-pre-line bg-white p-3.5 rounded-lg border border-slate-200">
                      {selectedAssignment.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-6">
                  <h4 className="text-base font-black text-slate-900 mb-4 flex items-center justify-between">
                    <span>Learner Submissions Review</span>
                    <span className="text-xs font-semibold text-slate-500">
                      Graded: {selectedAssignment.gradedCount} / {selectedAssignment.submissionsCount}
                    </span>
                  </h4>

                  {selectedAssignment.submissions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl">
                      <Video className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-sm text-slate-700">No Submissions Received Yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Enrolled learners will submit video URLs or signing responses here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedAssignment.submissions.map((sub) => {
                        const isGraded = sub.grade !== null && sub.grade !== undefined;

                        return (
                          <div
                            key={sub.id}
                            className={`p-5 rounded-xl border-2 transition-colors ${
                              isGraded
                                ? 'bg-slate-50 border-slate-300'
                                : 'bg-amber-50/40 border-amber-300'
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              {/* Learner info */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 border-2 border-indigo-300 flex items-center justify-center font-black text-sm">
                                  {sub.learner?.name?.charAt(0) || 'L'}
                                </div>
                                <div>
                                  <h5 className="font-black text-slate-900">
                                    {sub.learner?.name || 'Enrolled Learner'}
                                  </h5>
                                  <p className="text-xs text-slate-500">{sub.learner?.email}</p>
                                </div>
                              </div>

                              {/* Grade badge / status */}
                              <div>
                                {isGraded ? (
                                  <div className="text-right">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 font-black text-sm border border-emerald-300">
                                      <Award className="w-4 h-4 text-emerald-700" />
                                      <span>Grade: {sub.grade}/100</span>
                                    </span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 font-black text-xs border border-amber-300">
                                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Pending Grade</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Submission Link & Timestamp */}
                            <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2 max-w-md truncate">
                                <Video className="w-4 h-4 text-indigo-700 flex-shrink-0" />
                                <span className="text-xs font-bold text-slate-600">Video Submission:</span>
                                <a
                                  href={sub.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-blue-700 hover:text-blue-900 underline truncate max-w-[240px]"
                                >
                                  {sub.file_url}
                                </a>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-slate-500">
                                  Submitted: {new Date(sub.submitted_at).toLocaleDateString()}
                                </span>
                                <a
                                  href={sub.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300"
                                >
                                  <span>View Video</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>

                            {/* Written Feedback Display */}
                            {sub.feedback && (
                              <div className="mt-3 p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs">
                                <span className="font-black text-indigo-900 flex items-center gap-1 mb-1">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  Instructor Feedback:
                                </span>
                                <p className="text-indigo-950 font-medium">{sub.feedback}</p>
                              </div>
                            )}

                            {/* Grade Action Button */}
                            <div className="mt-4 flex justify-end">
                              <Button
                                variant={isGraded ? 'outline' : 'primary'}
                                size="sm"
                                onClick={() => handleOpenGradingDrawer(sub)}
                                className={
                                  isGraded
                                    ? 'border-slate-300 font-bold text-xs'
                                    : 'bg-indigo-700 hover:bg-indigo-800 font-bold text-xs'
                                }
                              >
                                {isGraded ? 'Update Grade & Feedback' : 'Grade Submission'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center border-2 border-slate-300">
              <p className="font-bold text-slate-600">Select an assignment to view submissions</p>
            </Card>
          )}
        </div>
      </div>

      {/* Post New Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-slate-300 shadow-2xl overflow-hidden">
            <div className="bg-indigo-900 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-300" />
                  <span>Post New Class Assignment</span>
                </h3>
                <p className="text-xs text-indigo-200 font-medium mt-1">
                  {schedule?.workshop?.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-indigo-800 text-indigo-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-lg text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    setCreateError(null);
                  }}
                  placeholder="e.g. Video Submission: 2-Minute Conversational Greeting"
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-bold focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Instructions & Guidelines
                </label>
                <textarea
                  rows={4}
                  required
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Describe signing expectations, time limit, required handshapes, and non-manual facial markers..."
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-medium focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Due Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-bold focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
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
                  Post Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grading Drawer / Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-slate-300 shadow-2xl overflow-hidden">
            <div className="bg-indigo-900 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-300" />
                  <span>Grade Student Submission</span>
                </h3>
                <p className="text-xs text-indigo-200 font-medium mt-1">
                  Learner: <span className="font-bold text-white">{gradingSubmission.learner?.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="p-1 rounded-lg hover:bg-indigo-800 text-indigo-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-6 space-y-4">
              {gradeError && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-lg text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{gradeError}</span>
                </div>
              )}

              {/* Submitted file URL summary */}
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <span className="font-bold text-slate-600 block mb-1">Student Video Link:</span>
                <a
                  href={gradingSubmission.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-blue-700 hover:underline flex items-center gap-1"
                >
                  <span className="truncate">{gradingSubmission.file_url}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>

              {/* Numeric Grade Input */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Numeric Grade (0 to 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  value={gradeInput}
                  onChange={(e) => {
                    setGradeInput(e.target.value);
                    setGradeError(null);
                  }}
                  placeholder="e.g. 95"
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-lg font-black text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* Written Feedback Input */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Instructor Written Feedback
                </label>
                <textarea
                  rows={4}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Detailed notes on fingerspelling accuracy, handshapes, facial expressions, and pace..."
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-medium focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGradingSubmission(null)}
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
                  Save Grade & Feedback
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
