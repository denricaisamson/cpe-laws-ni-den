'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  getWorkshopCatalog,
  enrollInWorkshop,
  subscribeToLearnerStore,
  CatalogWorkshopItem,
  CatalogScheduleItem,
} from '@/lib/learner-data';
import { WorkshopLevel } from '@/types/database';
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
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  HelpCircle,
} from 'lucide-react';

interface WorkshopCatalogClientProps {
  initialLearnerId: string;
  initialLearnerName: string;
}

export function WorkshopCatalogClient({
  initialLearnerId,
  initialLearnerName,
}: WorkshopCatalogClientProps) {
  const [workshops, setWorkshops] = useState<CatalogWorkshopItem[]>([]);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'all' | WorkshopLevel>('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<CatalogWorkshopItem | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Maya' | 'Bank Transfer'>('GCash');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    enrollmentId: string;
    paymentId: string;
    amount: number;
    workshopTitle: string;
  } | null>(null);

  // Load catalog data
  const loadData = () => {
    const data = getWorkshopCatalog(initialLearnerId);
    setWorkshops(data);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToLearnerStore(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [initialLearnerId]);

  // Filtered workshops
  const filteredWorkshops = useMemo(() => {
    if (selectedLevelFilter === 'all') return workshops;
    return workshops.filter((w) => w.level === selectedLevelFilter);
  }, [workshops, selectedLevelFilter]);

  // Group workshops by level
  const groupedWorkshops = useMemo(() => {
    return {
      level1: filteredWorkshops.filter((w) => w.level === 1),
      level2: filteredWorkshops.filter((w) => w.level === 2),
      level3: filteredWorkshops.filter((w) => w.level === 3),
    };
  }, [filteredWorkshops]);

  const handleOpenCheckout = (workshop: CatalogWorkshopItem, preselectedScheduleId?: string) => {
    setSelectedWorkshop(workshop);
    const validSchedules = workshop.schedules.filter((s) => s.available_slots > 0);
    const defaultSched = preselectedScheduleId || (validSchedules[0]?.id || workshop.schedules[0]?.id || '');
    setSelectedScheduleId(defaultSched);
    setReferenceNo(`PAY-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    setErrorMsg(null);
    setSuccessInfo(null);
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setSelectedWorkshop(null);
    setErrorMsg(null);
    setSuccessInfo(null);
  };

  const handleConfirmCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshop || !selectedScheduleId) {
      setErrorMsg('Please select a workshop schedule.');
      return;
    }

    if (!referenceNo.trim()) {
      setErrorMsg('Please enter a valid payment reference number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const result = enrollInWorkshop({
        learnerId: initialLearnerId,
        scheduleId: selectedScheduleId,
        paymentMethod: `${paymentMethod} / Simulated Transfer`,
        referenceNo: referenceNo.trim(),
      });

      setSuccessInfo({
        enrollmentId: result.enrollment.id,
        paymentId: result.payment.id,
        amount: result.payment.amount,
        workshopTitle: selectedWorkshop.title,
      });

      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during simulated checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPHP = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getLevelMeta = (level: number) => {
    switch (level) {
      case 1:
        return {
          title: 'Level 1: Basic & Foundational FSL',
          badgeText: 'FSL LEVEL 1',
          bgStyle: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          desc: 'Essential visual-gestural communication, manual alphabet, counting, and everyday greetings.',
        };
      case 2:
        return {
          title: 'Level 2: Intermediate Grammar & Classifiers',
          badgeText: 'FSL LEVEL 2',
          bgStyle: 'bg-blue-50 border-blue-300 text-blue-950',
          desc: 'Spatial grammar, non-manual facial markers, classifier stories, and conversational exchanges.',
        };
      case 3:
        return {
          title: 'Level 3: Advanced Discourse & Cultural Immersion',
          badgeText: 'FSL LEVEL 3',
          bgStyle: 'bg-indigo-50 border-indigo-300 text-indigo-950',
          desc: 'Idiomatic expressions, rapid signing comprehension, storytelling, and BSLI preparation.',
        };
      default:
        return {
          title: `Level ${level}`,
          badgeText: `LEVEL ${level}`,
          bgStyle: 'bg-slate-50 border-slate-300 text-slate-950',
          desc: '',
        };
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-blue-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-bold border border-blue-600 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Academic Curriculum • SDEAS Grounded</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Filipino Sign Language Workshop Catalog
            </h1>
            <p className="text-blue-100 text-base font-medium mt-2 max-w-3xl">
              Select an official FSL workshop level, choose your preferred cohort schedule, and enroll
              with our simulated educational payment portal.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-950/60 p-3 rounded-xl border border-blue-700/50">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div className="text-xs">
              <div className="font-bold text-white">Simulated Payment Sandbox</div>
              <div className="text-blue-200">Zero actual charges incurred</div>
            </div>
          </div>
        </div>

        {/* Level Filter Tabs */}
        <div className="mt-8 pt-6 border-t border-blue-800/60 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 mr-2">Filter Level:</span>
          <button
            type="button"
            onClick={() => setSelectedLevelFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 ${
              selectedLevelFilter === 'all'
                ? 'bg-white text-blue-950 shadow-md border-2 border-white'
                : 'bg-blue-800/60 text-white hover:bg-blue-800 border-2 border-transparent'
            }`}
          >
            All Levels
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevelFilter(1)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 ${
              selectedLevelFilter === 1
                ? 'bg-emerald-600 text-white shadow-md border-2 border-emerald-400'
                : 'bg-blue-800/60 text-white hover:bg-blue-800 border-2 border-transparent'
            }`}
          >
            Level 1: Basic
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevelFilter(2)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 ${
              selectedLevelFilter === 2
                ? 'bg-blue-600 text-white shadow-md border-2 border-blue-400'
                : 'bg-blue-800/60 text-white hover:bg-blue-800 border-2 border-transparent'
            }`}
          >
            Level 2: Intermediate
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevelFilter(3)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 ${
              selectedLevelFilter === 3
                ? 'bg-indigo-600 text-white shadow-md border-2 border-indigo-400'
                : 'bg-blue-800/60 text-white hover:bg-blue-800 border-2 border-transparent'
            }`}
          >
            Level 3: Advanced
          </button>
        </div>
      </div>

      {/* Catalog Rendered by Level */}
      <div className="space-y-12">
        {/* Render each level block */}
        {[1, 2, 3].map((levelNumber) => {
          const levelKey = `level${levelNumber}` as 'level1' | 'level2' | 'level3';
          const levelWorkshops = groupedWorkshops[levelKey];
          if (levelWorkshops.length === 0) return null;

          const meta = getLevelMeta(levelNumber);

          return (
            <section key={levelNumber} className="space-y-6">
              {/* Level Section Heading */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-300 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-lg flex items-center justify-center border-2 border-slate-700">
                    {levelNumber}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {meta.title}
                    </h2>
                    <p className="text-sm text-slate-600 font-medium">{meta.desc}</p>
                  </div>
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
                  {levelWorkshops.length} Course Offering{levelWorkshops.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Workshops Cards Grid */}
              <div className="grid grid-cols-1 gap-6">
                {levelWorkshops.map((workshop) => (
                  <Card
                    key={workshop.id}
                    className="border-2 border-slate-300 shadow-sm overflow-hidden hover:border-blue-400 transition-all"
                  >
                    <CardHeader className="bg-slate-50 border-b-2 border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-3xl">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-900 text-xs font-black px-2.5 py-0.5 rounded border border-blue-300 uppercase">
                            FSL Level {workshop.level}
                          </span>
                          {workshop.user_enrollment_status === 'enrolled' && (
                            <Badge variant="enrolled">Enrolled in Cohort</Badge>
                          )}
                          {workshop.user_enrollment_status === 'pending' && (
                            <Badge variant="pending">Pending Payment Verification</Badge>
                          )}
                          {workshop.user_enrollment_status === 'completed' && (
                            <Badge variant="completed">Completed</Badge>
                          )}
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-950 mt-1">
                          {workshop.title}
                        </CardTitle>
                        <CardDescription className="text-slate-700 text-sm font-medium leading-relaxed">
                          {workshop.description}
                        </CardDescription>
                      </div>

                      {/* Workshop Fee */}
                      <div className="flex flex-col md:items-end justify-center bg-white p-4 rounded-xl border-2 border-slate-200 md:min-w-[180px]">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Workshop Fee
                        </span>
                        <span className="text-3xl font-black text-blue-900 tracking-tight mt-0.5">
                          {formatPHP(workshop.fee)}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 mt-0.5">
                          Includes Materials & Certificate
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-700" />
                        <span>Available Cohort Schedules & Live Sessions</span>
                      </h4>

                      {workshop.schedules.length === 0 ? (
                        <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-center text-sm font-bold text-slate-500">
                          No active schedules scheduled for this workshop. Please check back later.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {workshop.schedules.map((schedule) => {
                            const isEnrolledInSched = schedule.user_enrollment?.status === 'enrolled';
                            const isPendingInSched = schedule.user_enrollment?.status === 'pending';
                            const isCompletedInSched = schedule.user_enrollment?.status === 'completed';
                            const isFull = schedule.available_slots <= 0;

                            return (
                              <div
                                key={schedule.id}
                                className={`p-4 rounded-xl border-2 flex flex-col justify-between transition-all ${
                                  isEnrolledInSched
                                    ? 'bg-emerald-50/70 border-emerald-400'
                                    : isPendingInSched
                                    ? 'bg-amber-50/70 border-amber-400'
                                    : 'bg-white border-slate-300 hover:border-blue-400 hover:shadow-xs'
                                }`}
                              >
                                <div className="space-y-3">
                                  {/* Day and Time */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                                        <Clock className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className="font-extrabold text-slate-900 text-base">
                                          {schedule.day_time}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                          Interactive Zoom / Google Meet Cohort
                                        </div>
                                      </div>
                                    </div>

                                    {/* Status Badge */}
                                    {isEnrolledInSched && <Badge variant="enrolled">Enrolled</Badge>}
                                    {isPendingInSched && <Badge variant="pending">Pending</Badge>}
                                    {isCompletedInSched && <Badge variant="completed">Passed</Badge>}
                                  </div>

                                  {/* Professor Info */}
                                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                    <User className="w-4 h-4 text-slate-500" />
                                    <span className="font-bold">
                                      Instructor: {schedule.professor?.name || 'Assigned FSL Faculty'}
                                    </span>
                                  </div>

                                  {/* Available Slots Indicator */}
                                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                                    <span className="text-slate-600">Available Slots:</span>
                                    <span
                                      className={`px-2 py-0.5 rounded font-black ${
                                        isFull
                                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                          : schedule.available_slots <= 5
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      }`}
                                    >
                                      {isFull
                                        ? 'Class Full (0 slots)'
                                        : `${schedule.available_slots} / ${schedule.total_slots} slots remaining`}
                                    </span>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 pt-3 border-t border-slate-200">
                                  {isEnrolledInSched ? (
                                    <Link href="/learner/classes">
                                      <Button variant="outline" size="sm" className="w-full font-bold">
                                        <span>Go to My Classroom</span>
                                        <ArrowRight className="w-4 h-4 ml-1.5" />
                                      </Button>
                                    </Link>
                                  ) : isPendingInSched ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled
                                      className="w-full font-bold bg-amber-50 text-amber-950 border-amber-300 cursor-not-allowed opacity-90"
                                    >
                                      <Clock className="w-4 h-4 mr-1.5 text-amber-700 animate-spin" />
                                      <span>Awaiting Admin Verification</span>
                                    </Button>
                                  ) : isFull ? (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      disabled
                                      className="w-full font-bold opacity-60"
                                    >
                                      Section Full
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleOpenCheckout(workshop, schedule.id)}
                                      className="w-full font-black shadow-sm"
                                    >
                                      <CreditCard className="w-4 h-4 mr-2" />
                                      <span>Enroll Now • {formatPHP(workshop.fee)}</span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Simulated Checkout Modal */}
      {selectedWorkshop && (
        <Modal
          isOpen={isCheckoutOpen}
          onClose={handleCloseCheckout}
          title="Simulated Workshop Checkout & Payment"
          description="Complete your workshop registration with our simulated educational payment verification gateway."
          maxWidth="lg"
        >
          {successInfo ? (
            <div className="space-y-6 py-2">
              <Alert variant="success" title="Enrollment & Payment Submitted!">
                Your simulated payment for <strong>{successInfo.workshopTitle}</strong> was recorded
                successfully. Your enrollment is now pending administrator verification.
              </Alert>

              <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-medium text-slate-600">Enrollment ID:</span>
                  <span className="font-mono font-bold text-slate-900">{successInfo.enrollmentId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-medium text-slate-600">Payment ID:</span>
                  <span className="font-mono font-bold text-slate-900">{successInfo.paymentId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-medium text-slate-600">Amount Paid:</span>
                  <span className="font-black text-emerald-800">{formatPHP(successInfo.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Status:</span>
                  <Badge variant="pending">Pending Verification</Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="primary"
                  className="flex-1 font-bold"
                  onClick={handleCloseCheckout}
                >
                  Return to Catalog
                </Button>
                <Link href="/learner/classes" className="flex-1">
                  <Button variant="outline" className="w-full font-bold">
                    View My Classes
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmCheckout} className="space-y-6 py-2">
              {errorMsg && (
                <Alert variant="error" title="Checkout Error" onClose={() => setErrorMsg(null)}>
                  {errorMsg}
                </Alert>
              )}

              {/* Order Summary */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-2">
                <div className="text-xs font-black uppercase text-blue-900 tracking-wider">
                  Order Summary
                </div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-black text-slate-950 text-base leading-tight">
                      {selectedWorkshop.title}
                    </h4>
                    <span className="text-xs font-bold text-blue-800">
                      Level {selectedWorkshop.level} Workshop
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-950">
                      {formatPHP(selectedWorkshop.fee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-extrabold text-slate-900">
                  Select Cohort Schedule <span className="text-rose-600">*</span>
                </label>
                <div className="space-y-2">
                  {selectedWorkshop.schedules.map((s) => {
                    const isFull = s.available_slots <= 0;
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedScheduleId === s.id
                            ? 'bg-blue-50 border-blue-700'
                            : isFull
                            ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                            : 'bg-white border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="scheduleSelection"
                            value={s.id}
                            checked={selectedScheduleId === s.id}
                            disabled={isFull}
                            onChange={(e) => setSelectedScheduleId(e.target.value)}
                            className="w-4 h-4 text-blue-700 focus:ring-blue-600"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{s.day_time}</div>
                            <div className="text-xs text-slate-600">
                              Instructor: {s.professor?.name || 'Assigned Faculty'}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isFull
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {isFull ? 'Full' : `${s.available_slots} slots`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-extrabold text-slate-900">
                  Simulated Payment Method <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['GCash', 'Maya', 'Bank Transfer'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-xl border-2 font-bold text-sm flex flex-col items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === method
                          ? 'bg-blue-800 text-white border-blue-800 shadow-sm'
                          : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>{method}</span>
                    </button>
                  ))}
                </div>

                {/* Account details hint */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 space-y-1">
                  {paymentMethod === 'GCash' && (
                    <>
                      <div>
                        <strong>Merchant Account:</strong> FSL SDEAS Learning Center
                      </div>
                      <div>
                        <strong>Simulated GCash No:</strong> 0917-888-FSL1
                      </div>
                    </>
                  )}
                  {paymentMethod === 'Maya' && (
                    <>
                      <div>
                        <strong>Merchant Account:</strong> Benilde FSL Outreach
                      </div>
                      <div>
                        <strong>Simulated Maya ID:</strong> @fsl-sdeas
                      </div>
                    </>
                  )}
                  {paymentMethod === 'Bank Transfer' && (
                    <>
                      <div>
                        <strong>Bank:</strong> BDO Unibank (Simulated)
                      </div>
                      <div>
                        <strong>Account:</strong> 0012-3456-7890 (Benilde SDEAS)
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Reference Number Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="refInput" className="text-sm font-extrabold text-slate-900">
                    Payment Reference Number <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setReferenceNo(
                        `PAY-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
                      )
                    }
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                  >
                    Generate Sample Ref
                  </button>
                </div>
                <Input
                  id="refInput"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. PAY-2026-FSL101"
                  required
                />
                <span className="text-xs text-slate-500 font-medium">
                  Enter the reference code provided by your simulated payment app.
                </span>
              </div>

              {/* Educational Simulation Notice */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 flex items-start gap-2.5 text-xs text-amber-950 font-medium">
                <HelpCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Sandbox Notice:</strong> Submitting will record a simulated transaction.
                  Once submitted, an Administrator can review and mark your payment as &quot;Verified&quot;,
                  at which point your enrollment will become active.
                </span>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseCheckout}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  isLoading={isSubmitting}
                  className="font-black px-6 shadow-md"
                >
                  <Check className="w-5 h-5 mr-1.5" />
                  <span>Confirm Simulated Payment ({formatPHP(selectedWorkshop.fee)})</span>
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
