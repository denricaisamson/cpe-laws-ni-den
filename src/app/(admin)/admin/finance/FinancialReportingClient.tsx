'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  getFinancialAnalytics,
  subscribeToAdminStore,
} from '@/lib/admin-data';
import type { PaymentStatus } from '@/types/database';
import {
  TrendingUp,
  ArrowLeft,
  DollarSign,
  Calendar,
  Users,
  CreditCard,
  Clock,
  CheckCircle2,
  Search,
  BookOpen,
  PieChart,
  Layers,
  GraduationCap,
} from 'lucide-react';

export function FinancialReportingClient() {
  const [analytics, setAnalytics] = useState(getFinancialAnalytics());
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');

  const refreshAnalytics = () => {
    setAnalytics(getFinancialAnalytics());
  };

  useEffect(() => {
    refreshAnalytics();
    const unsubscribe = subscribeToAdminStore(refreshAnalytics);
    return () => unsubscribe();
  }, []);

  // Filter ledger transactions
  const filteredLedger = useMemo(() => {
    return analytics.ledger.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (ledgerSearch.trim()) {
        const q = ledgerSearch.toLowerCase().trim();
        const matchesRef = item.reference_no.toLowerCase().includes(q);
        const matchesLearner = item.enrollment?.learner?.name.toLowerCase().includes(q);
        const matchesEmail = item.enrollment?.learner?.email.toLowerCase().includes(q);
        const matchesWorkshop = item.enrollment?.schedule?.workshop?.title.toLowerCase().includes(q);
        return matchesRef || matchesLearner || matchesEmail || matchesWorkshop;
      }
      return true;
    });
  }, [analytics.ledger, statusFilter, ledgerSearch]);

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
              <TrendingUp className="w-8 h-8 text-emerald-700" />
              <span>Financial Analytics & Revenue Summary</span>
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1 max-w-3xl">
              Real-time audit overview of verified enrollment tuition collections, breakdown by FSL Level, class section revenues, and complete verifiable transaction ledger.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/payments">
              <Button variant="outline" size="sm" className="font-bold border-slate-300">
                <CreditCard className="w-4 h-4 mr-1.5" />
                Payments Queue ({analytics.totalPendingCount})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Verified Revenue */}
        <Card className="border-2 border-emerald-600 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                Total Verified Revenue
              </p>
              <h3 className="text-3xl font-black text-emerald-950 mt-1">
                ₱{analytics.totalRevenue.toLocaleString()}
              </h3>
              <p className="text-xs font-bold text-emerald-700 mt-1">
                {analytics.totalVerifiedCount} verified payments
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Pending Revenue */}
        <Card className="border-2 border-slate-300 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Pending in Queue
              </p>
              <h3 className="text-3xl font-black text-amber-800 mt-1">
                ₱{analytics.pendingRevenue.toLocaleString()}
              </h3>
              <p className="text-xs font-bold text-slate-600 mt-1">
                {analytics.totalPendingCount} awaiting review
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 border-2 border-amber-300 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Verified Transactions */}
        <Card className="border-2 border-slate-300 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Verified Transactions
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {analytics.totalVerifiedCount}
              </h3>
              <p className="text-xs font-bold text-slate-600 mt-1">
                Confirmed enrollments
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 border-2 border-blue-300 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Total System Volume */}
        <Card className="border-2 border-slate-300 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Total Transaction Volume
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                ₱{(analytics.totalRevenue + analytics.pendingRevenue).toLocaleString()}
              </h3>
              <p className="text-xs font-bold text-slate-600 mt-1">
                {analytics.totalTransactions} total submitted
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 border-2 border-purple-300 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 1: BREAKDOWN BY FSL LEVEL */}
      <Card className="border-2 border-slate-300 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-700" />
            <CardTitle className="text-lg">Revenue Breakdown by FSL Level</CardTitle>
          </div>
          <CardDescription>
            Performance and enrollment distribution across Levels 1, 2, and 3 workshops.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
                <th className="py-3.5 px-6">Curriculum Level</th>
                <th className="py-3.5 px-6">Tuition Fee</th>
                <th className="py-3.5 px-6">Enrolled Learners</th>
                <th className="py-3.5 px-6">Verified Payments</th>
                <th className="py-3.5 px-6">Revenue Share</th>
                <th className="py-3.5 px-6 text-right">Total Verified Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {analytics.levelBreakdown.map((row) => {
                const percentage =
                  analytics.totalRevenue > 0
                    ? Math.round((row.revenue / analytics.totalRevenue) * 100)
                    : 0;

                return (
                  <tr key={row.level} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${
                            row.level === 1
                              ? 'bg-blue-100 text-blue-900 border-blue-400'
                              : row.level === 2
                              ? 'bg-purple-100 text-purple-900 border-purple-400'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                          }`}
                        >
                          Level {row.level}
                        </span>
                        <span>{row.title}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-800">
                      ₱{row.fee.toLocaleString()}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {row.enrolledCount} students
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {row.verifiedTransactions} transactions
                    </td>

                    <td className="py-4 px-6">
                      <div className="w-full max-w-[140px]">
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right font-black text-base text-emerald-800">
                      ₱{row.revenue.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* SECTION 2: BREAKDOWN BY SCHEDULE & PROFESSOR */}
      <Card className="border-2 border-slate-300 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-700" />
            <CardTitle className="text-lg">Breakdown by Schedule & Assigned Faculty</CardTitle>
          </div>
          <CardDescription>
            Audit tracking of student enrollment counts and revenue generation per instructor section.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
                <th className="py-3.5 px-6">Workshop Class</th>
                <th className="py-3.5 px-6">Assigned Professor</th>
                <th className="py-3.5 px-6">Class Time</th>
                <th className="py-3.5 px-6">Enrolled Learners</th>
                <th className="py-3.5 px-6 text-right">Verified Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {analytics.scheduleBreakdown.map((sch) => (
                <tr key={sch.scheduleId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300">
                        L{sch.level}
                      </span>
                      <span>{sch.workshopTitle}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 font-extrabold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center justify-center text-xs font-black">
                        {sch.professorName.charAt(0)}
                      </div>
                      <span>{sch.professorName}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-xs text-slate-700 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sch.dayTime}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 font-bold text-slate-800">
                    {sch.enrolledCount} enrolled
                  </td>

                  <td className="py-4 px-6 text-right font-black text-slate-900">
                    ₱{sch.verifiedRevenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* SECTION 3: TRANSACTION AUDIT LEDGER */}
      <Card className="border-2 border-slate-300 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-700" />
                <CardTitle className="text-lg">Transaction Audit Ledger</CardTitle>
              </div>
              <CardDescription>
                Complete immutable record of all simulated learner payment submissions and verification statuses.
              </CardDescription>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  placeholder="Search ledger..."
                  className="pl-9 pr-3 py-1.5 bg-white text-slate-950 font-medium rounded-lg border-2 border-slate-300 hover:border-slate-400 focus:border-blue-700 focus-visible:outline-none text-xs w-48 sm:w-64"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    statusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('verified')}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    statusFilter === 'verified'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Verified
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    statusFilter === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {filteredLedger.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-slate-500">
                No transactions match the ledger search or filter.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
                  <th className="py-3.5 px-6">Reference Number</th>
                  <th className="py-3.5 px-6">Learner Name</th>
                  <th className="py-3.5 px-6">Workshop Course</th>
                  <th className="py-3.5 px-6">Payment Method</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Transaction Date</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredLedger.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-xs text-slate-900">
                      {tx.reference_no}
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">
                        {tx.enrollment?.learner?.name || 'Learner'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {tx.enrollment?.learner?.email}
                      </div>
                    </td>

                    <td className="py-3.5 px-6 text-xs text-slate-800 font-medium">
                      {tx.enrollment?.schedule?.workshop?.title || 'FSL Workshop'}
                    </td>

                    <td className="py-3.5 px-6 text-xs text-slate-600 font-medium">
                      {tx.payment_method}
                    </td>

                    <td className="py-3.5 px-6 font-black text-slate-900">
                      ₱{tx.amount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-6 text-xs text-slate-600 font-medium">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <Badge variant={tx.status} />
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
