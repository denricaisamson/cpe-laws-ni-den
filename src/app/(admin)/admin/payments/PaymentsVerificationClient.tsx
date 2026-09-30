'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import {
  getAllPaymentsWithDetails,
  verifyPayment,
  subscribeToAdminStore,
} from '@/lib/admin-data';
import type { PaymentWithDetails } from '@/types/database';
import {
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Search,
  Check,
  TrendingUp,
  Calendar,
  User,
  BookOpen,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export function PaymentsVerificationClient() {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertNotice, setAlertNotice] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const refreshPayments = () => {
    setPayments(getAllPaymentsWithDetails());
  };

  useEffect(() => {
    refreshPayments();
    const unsubscribe = subscribeToAdminStore(refreshPayments);
    return () => unsubscribe();
  }, []);

  const handleVerify = (payment: PaymentWithDetails) => {
    try {
      const result = verifyPayment(payment.id);
      refreshPayments();

      const learnerName = payment.enrollment?.learner?.name || 'Learner';
      const workshopTitle = payment.enrollment?.schedule?.workshop?.title || 'Workshop';

      setAlertNotice({
        type: 'success',
        title: 'Payment Verified & Learner Enrolled',
        message: `Transaction ${payment.reference_no} for ${learnerName} (₱${payment.amount.toLocaleString()}) has been verified. Enrollment status upgraded to "enrolled" for ${workshopTitle}.`,
      });
      setTimeout(() => setAlertNotice(null), 7000);
    } catch (err) {
      setAlertNotice({
        type: 'error',
        title: 'Verification Failed',
        message: (err as Error).message,
      });
    }
  };

  const pendingList = useMemo(() => payments.filter((p) => p.status === 'pending'), [payments]);
  const verifiedList = useMemo(() => payments.filter((p) => p.status === 'verified'), [payments]);

  const verifiedTotal = useMemo(
    () => verifiedList.reduce((sum, p) => sum + p.amount, 0),
    [verifiedList]
  );
  const pendingTotal = useMemo(
    () => pendingList.reduce((sum, p) => sum + p.amount, 0),
    [pendingList]
  );

  const displayedList = useMemo(() => {
    let list = payments;
    if (activeTab === 'pending') {
      list = pendingList;
    } else if (activeTab === 'verified') {
      list = verifiedList;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const matchesRef = p.reference_no.toLowerCase().includes(q);
        const matchesLearner = p.enrollment?.learner?.name.toLowerCase().includes(q);
        const matchesEmail = p.enrollment?.learner?.email.toLowerCase().includes(q);
        const matchesWorkshop = p.enrollment?.schedule?.workshop?.title.toLowerCase().includes(q);
        return matchesRef || matchesLearner || matchesEmail || matchesWorkshop;
      });
    }

    return list;
  }, [payments, activeTab, pendingList, verifiedList, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* Navigation Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 rounded"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Console</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-amber-600" />
              <span>Payment Verification Queue</span>
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1 max-w-3xl">
              Inspect simulated enrollment payment transactions. When an administrator verifies a payment, the associated enrollment record is automatically updated from &apos;pending&apos; to &apos;enrolled&apos;, granting the learner live class and coursework access.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Feedback Notice */}
      {alertNotice && (
        <Alert
          variant={alertNotice.type}
          title={alertNotice.title}
          onClose={() => setAlertNotice(null)}
        >
          {alertNotice.message}
        </Alert>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Awaiting Verification
              </p>
              <h3 className="text-3xl font-black text-amber-800 mt-1">
                {pendingList.length}
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                ₱{pendingTotal.toLocaleString()} pending review
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 border-2 border-amber-300 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Verified Transactions
              </p>
              <h3 className="text-3xl font-black text-emerald-800 mt-1">
                {verifiedList.length}
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Confirmed & enrolled learners
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 border-2 border-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Total Verified Revenue
              </p>
              <h3 className="text-3xl font-black text-emerald-800 mt-1">
                ₱{verifiedTotal.toLocaleString()}
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Across all FSL workshops
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 border-2 border-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Controls */}
      <Card className="border-2 border-slate-300 shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference no, learner, or workshop..."
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-950 font-medium rounded-lg border-2 border-slate-300 hover:border-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100 focus-visible:outline-none transition-all placeholder:text-slate-500 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 flex items-center gap-1.5 ${
                  activeTab === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Queue ({pendingList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('verified')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 flex items-center gap-1.5 ${
                  activeTab === 'verified'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified ({verifiedList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Transactions ({payments.length})
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border-2 border-slate-300 shadow-sm overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          {displayedList.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No Transactions Found</h3>
              <p className="text-sm text-slate-500 mt-1">
                No payment transactions matched the current filter or search criteria.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
                  <th className="py-3.5 px-6">Reference No</th>
                  <th className="py-3.5 px-6">Learner Details</th>
                  <th className="py-3.5 px-6">Workshop & Schedule</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {displayedList.map((pay) => {
                  const isPending = pay.status === 'pending';
                  const learner = pay.enrollment?.learner;
                  const schedule = pay.enrollment?.schedule;
                  const workshop = schedule?.workshop;

                  return (
                    <tr
                      key={pay.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isPending ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Reference No & Method */}
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-xs text-slate-900">
                          {pay.reference_no}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {pay.payment_method}
                        </div>
                      </td>

                      {/* Learner */}
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900">
                          {learner?.name || 'Unknown Learner'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {learner?.email}
                        </div>
                      </td>

                      {/* Workshop & Schedule */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">
                          {workshop?.title || 'FSL Workshop'}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{schedule?.day_time || 'Schedule pending'}</span>
                        </div>
                        {schedule?.professor && (
                          <div className="text-xs text-indigo-700 font-semibold mt-0.5">
                            Prof: {schedule.professor.name}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6">
                        <div className="font-black text-base text-slate-900">
                          ₱{pay.amount.toLocaleString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <Badge variant={pay.status} />
                        {pay.enrollment && (
                          <div className="text-[11px] font-semibold text-slate-500 mt-1">
                            Enrollment: <span className="font-bold uppercase">{pay.enrollment.status}</span>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                        {new Date(pay.date).toLocaleDateString()}
                        <div className="text-slate-400 text-[11px]">
                          {new Date(pay.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        {isPending ? (
                          <Button
                            variant="success"
                            size="sm"
                            className="font-bold text-xs shadow-xs"
                            onClick={() => handleVerify(pay)}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Verify Payment
                          </Button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Verified & Enrolled</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
