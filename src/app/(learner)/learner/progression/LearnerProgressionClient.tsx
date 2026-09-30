'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getLearnerProgression,
  subscribeToLearnerStore,
  LearnerProgressionData,
} from '@/lib/learner-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Award,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Download,
  Building,
  ExternalLink,
  Users,
  Compass,
} from 'lucide-react';

interface LearnerProgressionClientProps {
  initialLearnerId: string;
  initialLearnerName: string;
}

export function LearnerProgressionClient({
  initialLearnerId,
  initialLearnerName,
}: LearnerProgressionClientProps) {
  const [progression, setProgression] = useState<LearnerProgressionData | null>(null);
  const [selectedCertLevel, setSelectedCertLevel] = useState<number | null>(null);

  const loadData = () => {
    const data = getLearnerProgression(initialLearnerId);
    setProgression(data);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToLearnerStore(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [initialLearnerId]);

  if (!progression) return null;

  return (
    <div className="space-y-10 pb-16">
      {/* Header Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-blue-900">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-bold border border-blue-600 mb-3">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Official FSL Competency Framework</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              FSL Progression & Academic Pathways
            </h1>
            <p className="text-blue-100 text-base font-medium mt-2 leading-relaxed">
              Track your journey through FSL Level 1, Level 2, and Level 3, monitor certificate
              readiness, and discover post-completion opportunities including BSLI (Bachelor in Sign Language Interpretation) and Applied Deaf Studies programs.
            </p>
          </div>

          {/* Overall Completion Percentage Gauge */}
          <div className="bg-blue-950/70 p-5 rounded-2xl border-2 border-blue-700/60 flex flex-col items-center justify-center min-w-[200px]">
            <span className="text-xs font-black uppercase text-blue-300 tracking-wider">
              Overall Progression
            </span>
            <div className="text-5xl font-black text-amber-300 tracking-tight mt-1">
              {progression.overallPercentage}%
            </div>
            <span className="text-xs font-bold text-blue-200 mt-1">
              {progression.completedLevels.length} of 3 Levels Completed
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-8 pt-6 border-t border-blue-800/60 space-y-2">
          <div className="flex justify-between text-xs font-extrabold text-blue-200">
            <span>Level 1: Foundations</span>
            <span>Level 2: Intermediate</span>
            <span>Level 3: Advanced Fluency</span>
          </div>
          <div className="w-full h-4 bg-blue-950 rounded-full overflow-hidden border border-blue-700 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(5, progression.overallPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Level Progression Roadmap (Levels 1, 2, 3) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-blue-700" />
              <span>Three-Tier FSL Progression Roadmap</span>
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Structured progressive curriculum with prerequisite gating and certified completion milestones.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {progression.levels.map((lvl) => {
            const isCompleted = lvl.status === 'completed';
            const isInProgress = lvl.status === 'in_progress';
            const isLocked = lvl.status === 'locked';
            const isAvailable = lvl.status === 'available';

            return (
              <Card
                key={lvl.level}
                className={`border-2 shadow-sm flex flex-col justify-between transition-all ${
                  isCompleted
                    ? 'border-emerald-400 bg-emerald-50/20'
                    : isInProgress
                    ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20'
                    : isLocked
                    ? 'border-slate-300 bg-slate-50/60 opacity-80'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <CardHeader className="p-5 pb-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                      {lvl.code}
                    </span>

                    {/* Status Badge */}
                    {isCompleted && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                        Completed
                      </span>
                    )}
                    {isInProgress && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-950 border border-blue-400 animate-pulse">
                        <Clock className="w-3.5 h-3.5 mr-1 text-blue-700" />
                        In Progress
                      </span>
                    )}
                    {isLocked && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-200 text-slate-700 border border-slate-300">
                        <Lock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        Locked
                      </span>
                    )}
                    {isAvailable && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-400">
                        Available to Enroll
                      </span>
                    )}
                  </div>

                  <div>
                    <CardTitle className="text-xl font-black text-slate-950 leading-tight">
                      {lvl.title}
                    </CardTitle>
                    <div className="text-xs font-bold text-blue-800 mt-1">
                      {lvl.subtitle}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {lvl.description}
                  </p>

                  <div className="space-y-3 pt-3 border-t border-slate-200 text-xs">
                    {lvl.prerequisite && (
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Prerequisite: {lvl.prerequisite}</span>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-300 space-y-1">
                        <div className="flex justify-between font-bold text-emerald-950">
                          <span>Status:</span>
                          <span className="text-emerald-700">Verified Passed</span>
                        </div>
                        {lvl.completionDate && (
                          <div className="flex justify-between text-slate-600">
                            <span>Completed:</span>
                            <span>{lvl.completionDate}</span>
                          </div>
                        )}
                        {lvl.gradeAverage && (
                          <div className="flex justify-between text-slate-600">
                            <span>Evaluation Score:</span>
                            <span className="font-extrabold text-emerald-900">{lvl.gradeAverage}%</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Certificate Readiness Indicator */}
                    {lvl.certificateReady ? (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setSelectedCertLevel(lvl.level)}
                        className="w-full font-black text-xs shadow-xs"
                      >
                        <Award className="w-4 h-4 mr-1.5" />
                        <span>View Certificate of Completion</span>
                      </Button>
                    ) : isAvailable ? (
                      <Link href="/learner/workshops" className="w-full">
                        <Button variant="primary" size="sm" className="w-full font-bold text-xs">
                          <span>Enroll in Workshop</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    ) : isInProgress ? (
                      <Link href="/learner/classes" className="w-full">
                        <Button variant="outline" size="sm" className="w-full font-bold text-xs">
                          <span>Go to Active Classroom</span>
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                        className="w-full font-bold text-xs opacity-60 cursor-not-allowed"
                      >
                        Prerequisite Required
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Grounded Academic & Career Pathways (from FSL_SPEC.md) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-700" />
              <span>Grounded Academic & Professional Pathways</span>
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Official collegiate degree tracks and community immersion programs in partnership with
              the De La Salle-College of Saint Benilde School of Deaf Education and Applied Studies (SDEAS).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {progression.pathways.map((pathway) => (
            <Card
              key={pathway.id}
              className={`border-2 shadow-sm flex flex-col justify-between ${
                pathway.eligible
                  ? 'border-indigo-300 bg-white hover:border-indigo-500'
                  : 'border-slate-300 bg-slate-50/50'
              }`}
            >
              <CardHeader className="bg-slate-50 border-b border-slate-200 p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                    Collegiate Pathway
                  </span>
                  {pathway.eligible ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <Sparkles className="w-3 h-3 mr-1 text-emerald-700" />
                      Eligible to Apply
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      Requires Level 2+
                    </span>
                  )}
                </div>

                <CardTitle className="text-lg font-black text-slate-950 leading-snug">
                  {pathway.name}
                </CardTitle>

                <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{pathway.institution}</span>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {pathway.description}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                      Key Eligibility & Requirements:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 font-medium">
                      {pathway.requirements.map((req, rIdx) => (
                        <li key={rIdx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <Link href="/news" className="w-full">
                    <Button variant="outline" size="sm" className="w-full font-bold text-xs">
                      <span>{pathway.linkText}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Simulated Certificate Viewer Modal */}
      {selectedCertLevel && (
        <Modal
          isOpen={Boolean(selectedCertLevel)}
          onClose={() => setSelectedCertLevel(null)}
          title="Certificate of Workshop Completion"
          description="Official digital credentials issued under the Filipino Sign Language Workshop Program."
          maxWidth="lg"
        >
          <div className="space-y-6 py-2">
            {/* Certificate Canvas Mock */}
            <div className="p-8 bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-600/60 rounded-2xl text-center space-y-5 shadow-inner relative overflow-hidden">
              {/* Watermark Emblem */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-9xl">
                🤟
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black tracking-widest uppercase text-amber-900">
                  Republic of the Philippines • SDEAS Outreach
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Certificate of Completion
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  This certifies that
                </p>
              </div>

              <div className="border-b-2 border-slate-800 pb-2 max-w-sm mx-auto">
                <div className="text-2xl font-black text-blue-900">
                  {initialLearnerName}
                </div>
              </div>

              <p className="text-xs text-slate-700 font-medium max-w-md mx-auto leading-relaxed">
                has successfully completed all lecture sessions, fingerspelling evaluations, visual-gestural
                drills, and Deaf community cultural standards for:
              </p>

              <div className="p-3 bg-white/90 rounded-xl border-2 border-amber-400 font-black text-slate-900 text-sm max-w-md mx-auto shadow-xs">
                FSL Level {selectedCertLevel}: {selectedCertLevel === 1 ? 'Foundations & Visual Gestural Communication' : selectedCertLevel === 2 ? 'Grammar, Classifiers & Discourse' : 'Advanced Fluency & Cultural Immersion'}
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-slate-600 max-w-md mx-auto border-t border-amber-300">
                <div className="text-left">
                  <div className="font-bold text-slate-900">Maria Elena Santos</div>
                  <div className="text-[10px]">Director, Deaf Programs</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">Rommel Agravante</div>
                  <div className="text-[10px]">Master Teacher, FSL</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                Credential Verification Hash: FSL-{selectedCertLevel}-2026-CERT
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCertLevel(null)}
                  className="font-bold text-sm"
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    alert('Certificate downloaded to your device in PDF format (simulated).');
                    setSelectedCertLevel(null);
                  }}
                  className="font-black text-sm"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
