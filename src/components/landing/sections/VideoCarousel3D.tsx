'use client';

import { useState } from 'react';
import { Video, Play, FastForward, Repeat, Layers } from 'lucide-react';
import type { Video as VideoType } from '@/types/database';
import { AccessibleVideoPlayer } from '@/components/video/AccessibleVideoPlayer';

interface VideoHubSectionProps {
  videos: VideoType[];
}

export function VideoHubSection({ videos }: VideoHubSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(videos[0] || null);

  return (
    <section id="videos" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Video className="w-3.5 h-3.5 text-emerald-400" />
          <span>Slow-Motion Video Hub</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Curated Visual Signing Tutorial Library
        </h2>
        <p className="text-emerald-100/75 text-base sm:text-lg leading-relaxed">
          Watch professional Deaf educators demonstrate sign parameters with 0.5x and 0.75x slow-motion playback and continuous looping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active Accessible Player (Left 7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl p-4 sm:p-6 border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          {selectedVideo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Level {selectedVideo.level} • {selectedVideo.category}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {selectedVideo.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <FastForward className="w-3 h-3" /> 0.5x / 0.75x
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    <Repeat className="w-3 h-3" /> Loop
                  </span>
                </div>
              </div>

              {/* Accessible Video Player */}
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-inner">
                <AccessibleVideoPlayer
                  title={selectedVideo.title}
                  category={selectedVideo.category}
                  url={selectedVideo.video_url}
                  level={selectedVideo.level}
                />
              </div>

              <p className="text-sm text-slate-300 leading-relaxed pt-2">
                {selectedVideo.description || 'Comprehensive sign demonstration for learner study.'}
              </p>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              Select a video from the categories catalog
            </div>
          )}
        </div>

        {/* Video Categories List (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-white/60 px-2 block">
            6 Grounded Curriculum Modules
          </span>

          <div className="space-y-2.5">
            {videos.map((vid) => {
              const isSelected = selectedVideo?.id === vid.id;
              return (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => setSelectedVideo(vid)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                    isSelected
                      ? 'border-emerald-400/60 bg-emerald-950/40 shadow-lg shadow-emerald-950/50'
                      : 'border-white/10 bg-slate-900/40 hover:bg-slate-800/60 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5 pr-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-amber-400 text-emerald-950' : 'bg-white/10 text-white group-hover:bg-emerald-500/20 group-hover:text-emerald-300'
                    }`}>
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                        Level {vid.level} • {vid.category}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-200 transition-colors line-clamp-1">
                        {vid.title}
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-white/40 shrink-0">
                    Preview
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
