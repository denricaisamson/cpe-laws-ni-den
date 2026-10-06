'use client';

import { BookOpen, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { TiltCard } from '../ui/TiltCard';
import { formatPHP } from '@/lib/utils';
import type { Workshop } from '@/types/database';
import Link from 'next/link';

interface LevelsShowcaseProps {
  workshops: Workshop[];
}

const LEVEL_HIGHLIGHTS: Record<number, string[]> = {
  1: [
    'Manual alphabet & fingerspelling',
    'Numbers 1–100 & numerical classifiers',
    'Survival greetings & deaf etiquette',
    'Visual-gestural communication',
  ],
  2: [
    'Spatial grammar & timeline reference',
    'Descriptive & locative classifiers',
    'Non-manual signals (facial expressions)',
    'Everyday conversational discourse',
  ],
  3: [
    'Complex deaf storytelling & idioms',
    'Advanced registers & contextual signs',
    'Pre-interpreting preparation',
    'Bridge to BSLI academic degree',
  ],
};

export function LevelsShowcase({ workshops }: LevelsShowcaseProps) {
  return (
    <section id="levels" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Curriculum Spectrum</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Three Progressive Levels of Mastery
        </h2>
        <p className="text-emerald-100/75 text-base sm:text-lg leading-relaxed">
          Each tier builds directly upon foundational spatial linguistics, designed by native Deaf educators and linguistics specialists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {workshops.map((workshop) => {
          const highlights = LEVEL_HIGHLIGHTS[workshop.level] || [];
          return (
            <TiltCard key={workshop.id} max={12} className="p-8 flex flex-col justify-between border border-white/10 bg-slate-900/60 shadow-2xl">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Level {workshop.level}
                  </span>
                  <span className="text-2xl font-black text-amber-300">
                    {formatPHP(workshop.fee)}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-snug">
                  {workshop.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  {workshop.description}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-white/10 mb-8">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                    Key Competencies
                  </span>
                  {highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-emerald-600 hover:text-white border border-white/20 text-white font-bold text-sm transition-all duration-300 group"
              >
                <span>Enroll in Level {workshop.level}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}
