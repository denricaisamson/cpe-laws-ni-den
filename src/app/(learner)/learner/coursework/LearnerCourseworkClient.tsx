'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  getLearnerCoursework,
  submitAssignment,
  subscribeToLearnerStore,
  LearnerCourseworkItem,
} from '@/lib/learner-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
  Upload,
  ExternalLink,
  Award,
  Sparkles,
  MessageSquare,
  Filter,
} from 'lucide-react';

interface LearnerCourseworkClientProps {
  initialLearnerId: string;
  initialLearnerName: string;
}

export function LearnerCourseworkClient({
  initialLearnerId,
  initialLearnerName,
}: LearnerCourseworkClientProps) {
  const [coursework, setCoursework] = useState<LearnerCourseworkItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  // Submission Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<LearnerCourseworkItem | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Graded Viewer Modal state
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<LearnerCourseworkItem | null>(null);

  const loadData = () => {
    const data = getLearnerCoursework(initialLearnerId);
    setCoursework(data);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToLearnerStore(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [initialLearnerId]);

  const filteredCoursework = useMemo(() => {
    if (statusFilter === 'all') return coursework;
    return coursework.filter((item) => item.status === statusFilter);
  }, [coursework, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: coursework.length,
      pending: coursework.filter((c) => c.status === 'pending').length,
      submitted: coursework.filter((c) => c.status === 'submitted').length,
      graded: coursework.filter((c) => c.status === 'graded').length,
    };
  }, [coursework]);

  const handleOpenSubmit = (item: LearnerCourseworkItem) => {
    setActiveAssignment(item);
    setVideoUrl(item.submission?.file_url || '');
    setStudentNotes('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitModalOpen(true);
  };

  const handleCloseSubmit = () => {
    setIsSubmitModalOpen(false);
    setActiveAssignment(null);
    setErrorMsg(null);
  };

  const handleOpenFeedback = (item: LearnerCourseworkItem) => {
    setViewingItem(item);
    setIsFeedbackModalOpen(true);
  };

  const handleCloseFeedback = () => {
    setIsFeedbackModalOpen(false);
    setViewingItem(null);
  };

  const handleSubmitCoursework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;

    if (!videoUrl.trim()) {
      setErrorMsg('Please enter a valid video URL or submission link.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      submitAssignment({
        assignmentId: activeAssignment.assignment.id,
        learnerId: initialLearnerId,
        fileUrl: videoUrl.trim(),
        notes: studentNotes.trim() || undefined,
      });

      setSuccessMsg('Your assignment response was submitted successfully!');
      loadData();
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setActiveAssignment(null);
        setSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-blue-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-bold border border-blue-600 mb-3">
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Academic Practice & Evaluation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              FSL Coursework & Video Submissions
            </h1>
            <p className="text-blue-100 text-base font-medium mt-2 max-w-2xl">
              Complete your signing exercises, upload video recording links for evaluation, and view
              detailed instructor scores and written linguistic feedback.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-blue-950/60 p-4 rounded-xl border border-blue-700/50">
            <Award className="w-8 h-8 text-amber-300 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-blue-300 uppercase">Graded Drills</div>
              <div className="text-2xl font-black text-white">{counts.graded} Completed</div>
            </div>
          </div>
        </div>

        {/* Filter Tab Bar */}
        <div className="mt-8 pt-6 border-t border-blue-800/60 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status:</span>
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-blue-950 shadow-md border-2 border-white'
                : 'bg-blue-800/60 text-white hover:bg-blue-800 border-2 border-transparent'
            }`}
          >
            All ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-amber-950 shadow-md border-2 border-amber-300'
                : 'bg-blue-800/60 text-white hover:bg-blue-800 border-2 border-transparent'
            }`}
          >
            Pending Submission ({counts.pending})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('submitted')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              statusFilter === 'submitted'
                ? 'bg-blue-600 text-white shadow-md border-2 border-blue-400'
                : 'bg-blue-800/60 text-white hover:bg-blue-800 border-2 border-transparent'
            }`}
          >
            Submitted ({counts.submitted})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('graded')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              statusFilter === 'graded'
                ? 'bg-emerald-600 text-white shadow-md border-2 border-emerald-400'
                : 'bg-blue-800/60 text-white hover:bg-blue-800 border-2 border-transparent'
            }`}
          >
            Graded ({counts.graded})
          </button>
        </div>
      </div>

      {/* Assignments Listing */}
      {filteredCoursework.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-300 text-center py-12 p-6">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border-2 border-slate-300">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              No assignments found for status &quot;{statusFilter}&quot;
            </h3>
            <p className="text-slate-600 text-sm font-medium">
              Check other status categories or explore the Learning Hub to study practice drills.
            </p>
            <Button variant="outline" onClick={() => setStatusFilter('all')} className="font-bold">
              Show All Coursework
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCoursework.map((item) => {
            const isPending = item.status === 'pending';
            const isSubmitted = item.status === 'submitted';
            const isGraded = item.status === 'graded';

            return (
              <Card
                key={item.assignment.id}
                className={`border-2 shadow-sm transition-all overflow-hidden ${
                  isGraded
                    ? 'border-emerald-300 hover:border-emerald-500'
                    : isSubmitted
                    ? 'border-blue-300 hover:border-blue-500'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <CardHeader className="bg-slate-50 border-b-2 border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-blue-100 text-blue-900 text-xs font-black px-2.5 py-0.5 rounded border border-blue-300 uppercase">
                        Level {item.workshop.level} • {item.workshop.title}
                      </span>
                      {isPending && <Badge variant="warning">Pending Submission</Badge>}
                      {isSubmitted && <Badge variant="info">Submitted (Under Review)</Badge>}
                      {isGraded && <Badge variant="success">Graded</Badge>}
                    </div>

                    <CardTitle className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                      {item.assignment.title}
                    </CardTitle>

                    <CardDescription className="text-slate-600 font-medium">
                      Cohort: {item.schedule.day_time} • Instructor: {item.professor?.name || 'FSL Faculty'}
                    </CardDescription>
                  </div>

                  {/* Due Date & Score Pill */}
                  <div className="flex flex-col md:items-end justify-center bg-white p-4 rounded-xl border-2 border-slate-200 md:min-w-[190px]">
                    {isGraded && item.submission?.grade !== null && item.submission?.grade !== undefined ? (
                      <>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Final Grade
                        </span>
                        <span className="text-3xl font-black text-emerald-700 tracking-tight mt-0.5">
                          {Number(item.submission.grade).toFixed(0)} / 100
                        </span>
                        <span className="text-[11px] font-bold text-emerald-800">
                          {item.submission.grade >= 90 ? '🌟 Excellent Fluency' : 'Passed with Honors'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Due Date
                        </span>
                        <span className="text-base font-extrabold text-slate-900 mt-1">
                          {new Date(item.assignment.due_date).toLocaleDateString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {isSubmitted ? 'Submitted on time' : 'Submission required'}
                        </span>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Instructions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                      Assignment Instructions
                    </h4>
                    <p className="text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {item.assignment.description}
                    </p>
                  </div>

                  {/* Graded Feedback Box (if graded) */}
                  {isGraded && item.submission && (
                    <div className="p-5 bg-emerald-50/70 border-2 border-emerald-300 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                          <span>Instructor Evaluation & Written Feedback</span>
                        </div>
                        {item.submission.graded_at && (
                          <span className="text-xs font-bold text-slate-500">
                            Graded on {new Date(item.submission.graded_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      <blockquote className="border-l-4 border-emerald-600 pl-4 py-1 text-sm text-slate-800 font-semibold italic leading-relaxed">
                        &ldquo;{item.submission.feedback || 'Great execution on hand shapes and facial expressions.'}&rdquo;
                      </blockquote>

                      <div className="flex items-center justify-between pt-2 border-t border-emerald-200 text-xs">
                        <span className="font-bold text-slate-600">
                          Submitted Link:{' '}
                          <a
                            href={item.submission.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-700 hover:text-blue-900 underline inline-flex items-center ml-1"
                          >
                            <span>Watch Submission</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenFeedback(item)}
                          className="font-bold text-xs"
                        >
                          View Full Score Report
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Submitted But Not Graded Info */}
                  {isSubmitted && item.submission && (
                    <div className="p-4 bg-blue-50/70 border-2 border-blue-200 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-700" />
                        <div>
                          <div className="text-sm font-bold text-blue-950">
                            Response Received — Pending Instructor Review
                          </div>
                          <div className="text-xs text-slate-600 font-medium">
                            Submitted:{' '}
                            {new Date(item.submission.submitted_at).toLocaleDateString('en-PH', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={item.submission.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center"
                        >
                          <span>Review Link</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenSubmit(item)}
                          className="font-bold text-xs"
                        >
                          Update Link
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Pending Action Row */}
                  {isPending && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Upload a recorded video of your signing demonstration.</span>
                      </span>

                      <Button
                        variant="primary"
                        onClick={() => handleOpenSubmit(item)}
                        className="font-black px-6 shadow-sm w-full sm:w-auto"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        <span>Submit Assignment</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submission Modal Form */}
      {activeAssignment && (
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={handleCloseSubmit}
          title="Submit Assignment Response"
          description={`Submit your video demonstration for "${activeAssignment.assignment.title}".`}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitCoursework} className="space-y-6 py-2">
            {errorMsg && (
              <Alert variant="error" title="Submission Error" onClose={() => setErrorMsg(null)}>
                {errorMsg}
              </Alert>
            )}

            {successMsg && (
              <Alert variant="success" title="Success!">
                {successMsg}
              </Alert>
            )}

            <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Assignment Details
              </span>
              <h4 className="font-extrabold text-slate-900 text-base">
                {activeAssignment.assignment.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {activeAssignment.assignment.description}
              </p>
            </div>

            {/* Video URL Input */}
            <div className="space-y-1">
              <label htmlFor="videoUrlInput" className="text-sm font-extrabold text-slate-900">
                Video Recording Link (YouTube / Google Drive / Cloud) <span className="text-rose-600">*</span>
              </label>
              <Input
                id="videoUrlInput"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://drive.google.com/..."
                required
              />
              <span className="text-xs text-slate-500 font-medium">
                Ensure sharing permissions are set to &quot;Anyone with the link can view&quot;.
              </span>
            </div>

            {/* Student Notes Textarea */}
            <div className="space-y-1">
              <label htmlFor="notesInput" className="text-sm font-extrabold text-slate-900">
                Student Notes / Commentary (Optional)
              </label>
              <textarea
                id="notesInput"
                rows={3}
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Any special notes or observations regarding your hand placement or lighting..."
                className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 text-slate-900 text-sm font-medium"
              />
            </div>

            {/* Quick Demo Pre-fill */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between text-xs">
              <span className="text-blue-900 font-medium">Testing in demo mode?</span>
              <button
                type="button"
                onClick={() => setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                className="font-bold text-blue-700 hover:text-blue-900 underline"
              >
                Insert Sample YouTube Video
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseSubmit}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="font-black px-6 shadow-sm"
              >
                Submit Response
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Graded Feedback Viewer Modal */}
      {viewingItem && viewingItem.submission && (
        <Modal
          isOpen={isFeedbackModalOpen}
          onClose={handleCloseFeedback}
          title="Graded Evaluation & Feedback"
          description={`Instructor evaluation report for "${viewingItem.assignment.title}".`}
          maxWidth="lg"
        >
          <div className="space-y-6 py-2">
            {/* Score Banner */}
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl flex items-center justify-between border-2 border-emerald-950">
              <div>
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                  Assigned Score
                </span>
                <div className="text-4xl font-black mt-1">
                  {Number(viewingItem.submission.grade).toFixed(0)}{' '}
                  <span className="text-2xl font-medium text-emerald-200">/ 100</span>
                </div>
                <div className="text-xs font-bold text-emerald-100 mt-1">
                  {viewingItem.submission.grade !== null && viewingItem.submission.grade >= 90
                    ? 'Linguistic Mastery Achieved'
                    : 'Passing Evaluation'}
                </div>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
                🎖️
              </div>
            </div>

            {/* Evaluation Details */}
            <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-medium text-slate-600">Course / Workshop:</span>
                <span className="font-bold text-slate-900">{viewingItem.workshop.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-medium text-slate-600">Evaluating Faculty:</span>
                <span className="font-bold text-slate-900">{viewingItem.professor?.name || 'FSL Faculty'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-medium text-slate-600">Date Graded:</span>
                <span className="font-bold text-slate-900">
                  {viewingItem.submission.graded_at
                    ? new Date(viewingItem.submission.graded_at).toLocaleDateString('en-PH', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Submission Video:</span>
                <a
                  href={viewingItem.submission.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-700 hover:text-blue-900 underline inline-flex items-center"
                >
                  <span>Open Video Link</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            </div>

            {/* Written Feedback */}
            <div className="space-y-2">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Instructor&apos;s Written Linguistic Feedback</span>
              </h4>
              <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-300 text-slate-900 text-sm font-semibold leading-relaxed">
                &ldquo;{viewingItem.submission.feedback || 'Outstanding effort! Hand configurations and spatial arrangements meet the course rubric.'}&rdquo;
              </div>
            </div>

            {/* Close button */}
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="primary" onClick={handleCloseFeedback} className="font-bold">
                Close Report
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
