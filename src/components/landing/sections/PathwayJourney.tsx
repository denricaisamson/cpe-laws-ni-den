'use client';

import { Compass, Award, GraduationCap, ChevronRight, Sparkles } from 'lucide-react';
import { TiltCard } from '../ui/TiltCard';
import Link from 'next/link';

const PATHWAY_STAGES = [
  {
    step: '01',
    title: 'FSL Certificate Level 1',
    scope: 'Beginner Foundations',
    summary: 'Master the 26-letter manual alphabet, 1–100 numbers, and survival greetings with visual-gestural orientation.',
    status: 'Foundation',
  },
  {
    step: '02',
    title: 'FSL Certificate Level 2',
    scope: 'Intermediate Linguistics',
    summary: 'Deconstruct spatial timelines, locative/descriptive classifiers, and non-manual facial grammatical markers.',
    status: 'Core Fluency',
  },
  {
    step: '03',
    title: 'FSL Certificate Level 3',
    scope: 'Advanced Community Immersion',
    summary: 'Synthesize idiomatic sign syntax, complex Deaf community narratives, and pre-interpreting readiness.',
    status: 'Mastery',
  },
  {
    step: 'Degree',
    title: 'Bachelor in Sign Language Interpretation (BSLI)',
    scope: 'Academic Higher Education',
    summary: 'Formal collegiate degree program offered under De La Salle - College of Saint Benilde SDEAS.',
    status: 'Professional Career',
    highlight: true,
  },
];

export function PathwayJourneySection() {
  return (
    <section id="pathway" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>Academic Trajectory</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Progression Towards Professional Degree
        </h2>
        <p className="text-emerald-100/75 text-base sm:text-lg leading-relaxed">
          From beginner fingerspelling to collegiate BSLI enrollment and Applied Deaf Studies career pathways.
        </p>
      </div>

      <div className="relative">
        {/* Glow connector bar behind items on large screens */}
        <div
          className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0"
          style={{
            background: 'linear-gradient(90deg, rgba(74, 222, 128, 0.2) 0%, rgba(245, 168, 0, 0.4) 50%, rgba(74, 222, 128, 0.6) 100%)',
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {PATHWAY_STAGES.map((stage, idx) => (
            <TiltCard
              key={idx}
              max={10}
              className={`p-6 flex flex-col justify-between border ${
                stage.highlight
                  ? 'border-amber-400/60 bg-gradient-to-b from-amber-500/15 to-slate-900/90 shadow-2xl shadow-amber-500/10'
                  : 'border-white/10 bg-slate-900/70 shadow-xl'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    stage.highlight
                      ? 'bg-amber-400 text-emerald-950 font-black'
                      : 'bg-white/10 text-white'
                  }`}>
                    Step {stage.step}
                  </span>
                  {stage.highlight && (
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  )}
                </div>

                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  {stage.scope}
                </span>
                <h3 className="text-lg font-bold text-white mb-3">
                  {stage.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {stage.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white/70">
                <span>{stage.status}</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
