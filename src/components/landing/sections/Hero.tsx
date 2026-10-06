'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight, Sparkles, BookOpen, Layers } from 'lucide-react';
import { MagneticButton } from '../ui/MagneticButton';
import { useMotionPref } from '../providers/SmoothScroll';
import type { HandPose } from '../three/SigningHand';

// Lazy-load the heavy 3D WebGL Canvas to keep initial bundle lightweight and fast
const HeroCanvas = dynamic(() => import('../three/HeroCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
    </div>
  ),
});

const POSES: { pose: HandPose; label: string; letter: string }[] = [
  { pose: 'F', label: 'Sign F', letter: 'F' },
  { pose: 'S', label: 'Sign S', letter: 'S' },
  { pose: 'L', label: 'Sign L', letter: 'L' },
  { pose: 'ILY', label: 'I Love You', letter: '🤟' },
  { pose: 'OPEN', label: 'Neutral', letter: '✋' },
];

export function HeroSection({ dashboardHref }: { dashboardHref?: string }) {
  const [currentPose, setCurrentPose] = useState<HandPose>('F');
  const [mounted, setMounted] = useState(false);
  const { reduced } = useMotionPref();

  useEffect(() => {
    setMounted(true);
    // Cycle through F-S-L-ILY poses automatically if user doesn't interact
    const interval = setInterval(() => {
      setCurrentPose((prev) => {
        if (prev === 'F') return 'S';
        if (prev === 'S') return 'L';
        if (prev === 'L') return 'ILY';
        return 'F';
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* 3D Canvas Background & Centerpiece */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        {mounted && (
          <HeroCanvas pose={currentPose} active={true} still={reduced} />
        )}
      </div>

      {/* Radial depth light aura */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 50% 45%, rgba(0, 111, 60, 0.22) 0%, rgba(245, 168, 0, 0.08) 45%, rgba(4, 23, 13, 0.95) 100%)',
        }}
      />

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* SDEAS Affiliation Tag */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-950/60 backdrop-blur-md shadow-lg shadow-emerald-950/40 mb-6 text-xs sm:text-sm font-semibold text-emerald-200">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>De La Salle • SDEAS Accessible Deaf & FSL Education Hub</span>
        </div>

        {/* Cinematic Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl leading-[1.1]">
          Hands That Speak.{' '}
          <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-300 to-green-400">
            A Language Unbounded.
          </span>
        </h1>

        {/* Narrative Description */}
        <p className="text-base sm:text-xl text-emerald-100/85 max-w-2xl mx-auto leading-relaxed mb-10">
          Step into the immersive, 3D Filipino Sign Language portal. Master manual alphabet fingerspelling, explore slow-motion signing curriculums, and earn certified progression towards BSLI and Applied Deaf Studies.
        </p>

        {/* Interactive Hand Pose Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 p-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl">
          <span className="text-xs font-bold text-white/60 px-3 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            3D Handshape:
          </span>
          {POSES.map((item) => (
            <button
              key={item.pose}
              type="button"
              onClick={() => setCurrentPose(item.pose)}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                currentPose === item.pose
                  ? 'bg-gradient-to-r from-amber-400 to-emerald-400 text-emerald-950 shadow-md scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{item.letter}</span>
              <span className="hidden sm:inline text-xs opacity-90">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <MagneticButton href={dashboardHref || '/register'} variant="primary">
            <span>{dashboardHref ? 'Open Your Dashboard' : 'Start Learning FSL'}</span>
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </MagneticButton>
          <MagneticButton href="#levels" variant="ghost">
            <BookOpen className="w-4 h-4 mr-1 text-emerald-400" />
            <span>Explore Curriculum</span>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
