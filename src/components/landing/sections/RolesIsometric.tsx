'use client';

import { Users, GraduationCap, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { TiltCard } from '../ui/TiltCard';
import Link from 'next/link';

const ROLES = [
  {
    role: 'Learner',
    tag: 'Student Experience',
    icon: GraduationCap,
    gradient: 'from-blue-500/20 to-emerald-500/20',
    border: 'border-blue-400/30',
    accent: 'text-blue-300',
    description: 'Autonomous study center designed with visual-first accessibility, coursework submissions, and academic milestones.',
    features: [
      'Self-paced enrollment in Levels 1–3',
      'Video homework submission & review',
      'Slow-motion 0.5x tutorial player',
      'Progression ladder to BSLI degree',
    ],
    cta: 'Register as Learner',
    href: '/register',
  },
  {
    role: 'Professor',
    tag: 'Educator Console',
    icon: Users,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-400/30',
    accent: 'text-emerald-300',
    description: 'Empowering Deaf master teachers and interpreters with digital roster management, session grading, and announcements.',
    features: [
      'Class attendance logging per session',
      'Video assignment rubric & feedback',
      'Direct messaging with learners',
      'Class material & syllabus publishing',
    ],
    cta: 'Sign In as Faculty',
    href: '/login',
  },
  {
    role: 'Administrator',
    tag: 'Institutional Operations',
    icon: ShieldCheck,
    gradient: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-400/30',
    accent: 'text-amber-300',
    description: 'Complete institutional governance over workshop schedules, quota caps, simulated payment audits, and user rosters.',
    features: [
      'Payment queue verification',
      'Real-time financial revenue reporting',
      'Schedule slot quota allocation',
      'Directory-wide role assignment',
    ],
    cta: 'Staff Governance Portal',
    href: '/login',
  },
];

export function RolesSection() {
  return (
    <section id="roles" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Role-Based Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Built for Every Community Stakeholder
        </h2>
        <p className="text-emerald-100/75 text-base sm:text-lg leading-relaxed">
          Streamlined workflows tailored specifically to learners, professors, and administrative staff.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {ROLES.map((r, i) => {
          const Icon = r.icon;
          return (
            <TiltCard key={i} max={10} className={`p-8 flex flex-col justify-between border ${r.border} bg-slate-900/60 shadow-2xl`}>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 ${r.accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-white/50">
                    {r.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  {r.role}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  {r.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-white/10 mb-8">
                  {r.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${r.accent} mt-0.5`} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={r.href}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white hover:text-emerald-950 text-white font-bold text-sm transition-all duration-300 group"
              >
                <span>{r.cta}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}
