'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import {
  getAdminKpis,
  getAllPaymentsWithDetails,
  verifyPayment,
  subscribeToAdminStore,
} from '@/lib/admin-data';
import type { PaymentWithDetails } from '@/types/database';
import {
  Shield,
  BookOpen,
  Users,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

interface AdminDashboardClientProps {
  adminName: string;
}

export function AdminDashboardClient({ adminName }: AdminDashboardClientProps) {
  const [kpis, setKpis] = useState(getAdminKpis());
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const refreshData = () => {
    setKpis(getAdminKpis());
    setPayments(getAllPaymentsWithDetails());
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToAdminStore(refreshData);
    return () => unsubscribe();
  }, []);

  const pendingPayments = payments.filter((p) => p.status === 'pending');

  const handleQuickVerify = (paymentId: string, refNo: string) => {
    try {
      verifyPayment(paymentId);
      refreshData();
      setActionNotice(`Payment ${refNo} verified successfully! Enrollment status upgraded to "enrolled".`);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-purple-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/80 text-purple-200 text-xs font-bold border border-purple-600 mb-3">
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>Administrative Operations Console</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Admin Overview: {adminName}
            </h1>
            <p className="text-purple-100 text-base font-medium mt-2 max-w-2xl">
              System governance, workshop schedule creation, user directory management, and simulated enrollment payment verifications.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/payments">
              <Button variant="success" size="lg" className="shadow-md">
                <CreditCard className="w-5 h-5 mr-2" />
                Payments Queue ({kpis.pendingPaymentsCount})
              </Button>
            </Link>
            <Link href="/admin/workshops">
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                <BookOpen className="w-5 h-5 mr-2" />
                Manage Workshops
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Feedback Alert */}
      {actionNotice && (
        <Alert
          variant="success"
          title="Payment Verified"
          onClose={() => setActionNotice(null)}
        >
          {actionNotice}
        </Alert>
      )}

      {/* 4 Required KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Total Revenue (₱) */}
        <Card className="border-2 border-slate-300 hover:border-emerald-600 transition-colors shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Total Revenue (₱)
              </p>
              <h3 className="text-3xl font-black text-emerald-800 mt-1">
                ₱{kpis.totalRevenue.toLocaleString()}
              </h3>
              <p className="text-xs font-bold text-slate-600 mt-1">
                Verified enrollment collections
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 border-2 border-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Enrolled Learners */}
        <Card className="border-2 border-slate-300 hover:border-blue-600 transition-colors shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Enrolled Learners
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {kpis.enrolledLearnersCount}
              </h3>
              <p className="text-xs font-bold text-slate-600 mt-1">
                Active & completed students
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 border-2 border-blue-300 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Active Schedules */}
        <Card className="border-2 border-slate-300 hover:border-purple-600 transition-colors shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Active Schedules
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {kpis.activeSchedulesCount}
              </h3>
              <p className="text-xs font-bold text-slate-600 mt-1">
                Assigned class batches
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 border-2 border-purple-300 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Pending Payment Queue Count */}
        <Card className="border-2 border-slate-300 hover:border-amber-600 transition-colors shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Pending Payment Queue
              </p>
              <h3 className="text-3xl font-black text-amber-800 mt-1">
                {kpis.pendingPaymentsCount}
              </h3>
              <p className="text-xs font-bold text-slate-600 mt-1">
                Awaiting admin verification
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 border-2 border-amber-300 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4 Direct Quick-Action Navigation Cards */}
      <div>
        <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <span>Administrative Control Center</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
            Quick Actions
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: /admin/workshops */}
          <Link href="/admin/workshops" className="group block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-600 rounded-xl">
            <Card className="border-2 border-slate-300 group-hover:border-purple-600 group-hover:shadow-md transition-all h-full flex flex-col justify-between">
              <CardHeader className="p-5">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 border border-purple-300 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg group-hover:text-purple-700 transition-colors">
                  Workshops & Schedules
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 mt-1">
                  Manage Levels 1, 2, & 3 offerings, assign professors, and configure class slot quotas.
                </CardDescription>
              </CardHeader>
              <div className="p-5 pt-0 flex items-center justify-between text-xs font-black text-purple-700">
                <span>Manage offerings</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* Card 2: /admin/users */}
          <Link href="/admin/users" className="group block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 rounded-xl">
            <Card className="border-2 border-slate-300 group-hover:border-blue-600 group-hover:shadow-md transition-all h-full flex flex-col justify-between">
              <CardHeader className="p-5">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 border border-blue-300 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg group-hover:text-blue-700 transition-colors">
                  User Directory
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 mt-1">
                  Browse registered learners, professors, and administrators with role assignment controls.
                </CardDescription>
              </CardHeader>
              <div className="p-5 pt-0 flex items-center justify-between text-xs font-black text-blue-700">
                <span>Manage directory</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* Card 3: /admin/payments */}
          <Link href="/admin/payments" className="group block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-600 rounded-xl">
            <Card className="border-2 border-slate-300 group-hover:border-amber-600 group-hover:shadow-md transition-all h-full flex flex-col justify-between">
              <CardHeader className="p-5">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg group-hover:text-amber-700 transition-colors">
                  Payment Verification
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 mt-1">
                  Review simulated learner payments and atomically promote enrollment status to &apos;enrolled&apos;.
                </CardDescription>
              </CardHeader>
              <div className="p-5 pt-0 flex items-center justify-between text-xs font-black text-amber-700">
                <span>{kpis.pendingPaymentsCount} awaiting review</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* Card 4: /admin/finance */}
          <Link href="/admin/finance" className="group block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600 rounded-xl">
            <Card className="border-2 border-slate-300 group-hover:border-emerald-600 group-hover:shadow-md transition-all h-full flex flex-col justify-between">
              <CardHeader className="p-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg group-hover:text-emerald-700 transition-colors">
                  Financial Analytics
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 mt-1">
                  Audit revenue breakdown by Level, Schedule, Professor, and inspect complete transaction ledger.
                </CardDescription>
              </CardHeader>
              <div className="p-5 pt-0 flex items-center justify-between text-xs font-black text-emerald-700">
                <span>View ledger & reports</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Main Grid: Pending Payments Quick Queue */}
      <Card className="border-2 border-slate-300 shadow-sm">
        <CardHeader className="bg-slate-50 border-b-2 border-slate-200 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Pending Verification Queue</CardTitle>
            <CardDescription>
              Review learner fee submissions and verify enrollment status.
            </CardDescription>
          </div>
          <Link href="/admin/payments">
            <Button variant="outline" size="sm" className="font-bold">
              View Full Queue ({pendingPayments.length})
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {pendingPayments.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">All Payments Verified!</h3>
              <p className="text-sm text-slate-600 mt-1">
                There are currently no pending payments in the queue.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
                  <th className="py-3 px-6">Reference No</th>
                  <th className="py-3 px-6">Learner</th>
                  <th className="py-3 px-6">Workshop</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {pendingPayments.slice(0, 5).map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-xs text-slate-800">
                      {pay.reference_no}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      {pay.enrollment?.learner?.name || 'Learner'}
                      <div className="text-xs text-slate-500 font-normal">
                        {pay.enrollment?.learner?.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-700 font-medium">
                      {pay.enrollment?.schedule?.workshop?.title || 'FSL Workshop'}
                    </td>
                    <td className="py-3.5 px-6 font-extrabold text-slate-900">
                      ₱{pay.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge variant={pay.status} />
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-600 font-medium">
                      {new Date(pay.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Button
                        variant="success"
                        size="sm"
                        className="font-bold text-xs"
                        onClick={() => handleQuickVerify(pay.id, pay.reference_no)}
                      >
                        Verify Payment
                      </Button>
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
