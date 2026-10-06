'use client';

import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import { MagneticButton } from '../ui/MagneticButton';

export function FinalCTASection({ dashboardHref }: { dashboardHref?: string }) {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative z-10">
      <div className="relative rounded-3xl p-8 sm:p-14 border border-amber-400/40 bg-gradient-to-b from-emerald-950/80 via-slate-900/90 to-emerald-950/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Decorative background glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245, 168, 0, 0.25) 0%, rgba(0, 111, 60, 0.15) 50%, transparent 80%)',
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
            <span>Inclusive • Accessible • Empowering</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Begin Your Journey in Filipino Sign Language Today
          </h2>

          <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed">
            Join hundreds of Deaf and hearing advocates, educators, and learners building inclusive bridges across the Philippines.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <MagneticButton href={dashboardHref || '/register'} variant="primary">
              <span>{dashboardHref ? 'Return to Dashboard' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </MagneticButton>
            <MagneticButton href="/login" variant="ghost">
              <span>Sign In to Portal</span>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
