import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Award, Shield, GraduationCap, BookOpen } from 'lucide-react';

export type BadgeVariant =
  | 'enrolled'
  | 'verified'
  | 'completed'
  | 'pending'
  | 'dropped'
  | 'learner'
  | 'professor'
  | 'admin'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children?: React.ReactNode;
}

export function Badge({ variant = 'info', className, children, ...props }: BadgeProps) {
  const configs: Record<BadgeVariant, { bg: string; icon: React.ReactNode; defaultText: string }> = {
    enrolled: {
      bg: 'bg-emerald-100 text-emerald-950 border-2 border-emerald-600',
      icon: <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-800" aria-hidden="true" />,
      defaultText: 'ENROLLED',
    },
    verified: {
      bg: 'bg-emerald-100 text-emerald-950 border-2 border-emerald-600',
      icon: <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-800" aria-hidden="true" />,
      defaultText: 'VERIFIED',
    },
    success: {
      bg: 'bg-emerald-100 text-emerald-950 border-2 border-emerald-600',
      icon: <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-800" aria-hidden="true" />,
      defaultText: 'SUCCESS',
    },
    pending: {
      bg: 'bg-amber-100 text-amber-950 border-2 border-amber-600',
      icon: <Clock className="w-4 h-4 mr-1 text-amber-800" aria-hidden="true" />,
      defaultText: 'PENDING',
    },
    warning: {
      bg: 'bg-amber-100 text-amber-950 border-2 border-amber-600',
      icon: <AlertTriangle className="w-4 h-4 mr-1 text-amber-800" aria-hidden="true" />,
      defaultText: 'WARNING',
    },
    completed: {
      bg: 'bg-blue-100 text-blue-950 border-2 border-blue-600',
      icon: <Award className="w-4 h-4 mr-1 text-blue-800" aria-hidden="true" />,
      defaultText: 'COMPLETED',
    },
    dropped: {
      bg: 'bg-rose-100 text-rose-950 border-2 border-rose-600',
      icon: <XCircle className="w-4 h-4 mr-1 text-rose-800" aria-hidden="true" />,
      defaultText: 'DROPPED',
    },
    danger: {
      bg: 'bg-rose-100 text-rose-950 border-2 border-rose-600',
      icon: <XCircle className="w-4 h-4 mr-1 text-rose-800" aria-hidden="true" />,
      defaultText: 'ALERT',
    },
    info: {
      bg: 'bg-slate-100 text-slate-900 border-2 border-slate-500',
      icon: null,
      defaultText: 'INFO',
    },
    learner: {
      bg: 'bg-sky-100 text-sky-950 border-2 border-sky-600',
      icon: <BookOpen className="w-4 h-4 mr-1 text-sky-800" aria-hidden="true" />,
      defaultText: 'LEARNER',
    },
    professor: {
      bg: 'bg-indigo-100 text-indigo-950 border-2 border-indigo-600',
      icon: <GraduationCap className="w-4 h-4 mr-1 text-indigo-800" aria-hidden="true" />,
      defaultText: 'PROFESSOR',
    },
    admin: {
      bg: 'bg-purple-100 text-purple-950 border-2 border-purple-600',
      icon: <Shield className="w-4 h-4 mr-1 text-purple-800" aria-hidden="true" />,
      defaultText: 'ADMIN',
    },
  };

  const current = configs[variant] || configs.info;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wider uppercase shadow-xs',
        current.bg,
        className
      )}
      {...props}
    >
      {current.icon}
      <span>{children || current.defaultText}</span>
    </span>
  );
}
