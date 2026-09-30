'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getLearnerMaterials,
  getFSLVideos,
  GROUNDED_VIDEO_CATEGORIES,
  subscribeToLearnerStore,
} from '@/lib/learner-data';
import { WorkshopLevel, VideoCategory, Video, Material } from '@/types/database';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AccessibleVideoPlayer } from '@/components/video/AccessibleVideoPlayer';
import {
  BookOpen,
  Video as VideoIcon,
  FileText,
  Download,
  ExternalLink,
  Filter,
  Play,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';

export const GROUNDED_CATEGORIES: VideoCategory[] = [
  'Alphabet / Fingerspelling',
  'Basic Greetings',
  'Numbers',
  'Common Expressions',
  'Everyday Conversations',
  'Vocabulary Lessons',
];

interface LearningMaterialsClientProps {
  initialLearnerId: string;
  initialLearnerName: string;
}

export function LearningMaterialsClient({
  initialLearnerId,
  initialLearnerName,
}: LearningMaterialsClientProps) {
  const [materials, setMaterials] = useState<ReturnType<typeof getLearnerMaterials>>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<'all' | WorkshopLevel>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | VideoCategory>('all');
  const [activeTab, setActiveTab] = useState<'videos' | 'handouts'>('videos');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const mats = getLearnerMaterials(initialLearnerId);
    const vids = getFSLVideos();
    setMaterials(mats);
    setVideos(vids);
    if (!selectedVideo && vids.length > 0) {
      setSelectedVideo(vids[0]);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToLearnerStore(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [initialLearnerId]);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      if (selectedLevel !== 'all' && v.level !== selectedLevel) return false;
      if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
      return true;
    });
  }, [videos, selectedLevel, selectedCategory]);

  const handleSelectVideo = (video: Video) => {
    setSelectedVideo(video);
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-blue-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-bold border border-blue-600 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Learning Hub & Accessible Video Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              FSL Learning Materials & Video Library
            </h1>
            <p className="text-blue-100 text-base font-medium mt-2 max-w-3xl">
              Study the 6 grounded curriculum categories of Filipino Sign Language with our high-contrast
              accessible video player, speed adjustments (0.5x, 0.75x, 1x), and downloadable study handouts.
            </p>
          </div>

          <div className="flex bg-blue-950/70 p-1.5 rounded-xl border border-blue-700/50">
            <button
              type="button"
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'videos'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <VideoIcon className="w-4 h-4" />
              <span>FSL Video Hub ({videos.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('handouts')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'handouts'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PDF Handouts ({materials.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab 1: Video Hub */}
      {activeTab === 'videos' && (
        <div className="space-y-8">
          {/* Active Video Player Screen */}
          <div ref={playerRef} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <VideoIcon className="w-6 h-6 text-blue-700" />
                <span>Interactive Signing Video Studio</span>
              </h2>
              {selectedVideo && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black bg-blue-100 text-blue-900 px-3 py-1 rounded-full border border-blue-300">
                    Level {selectedVideo.level}
                  </span>
                  <span className="text-xs font-black bg-purple-100 text-purple-900 px-3 py-1 rounded-full border border-purple-300">
                    {selectedVideo.category}
                  </span>
                </div>
              )}
            </div>

            {selectedVideo ? (
              <Card className="border-2 border-slate-300 shadow-md overflow-hidden bg-slate-900">
                <AccessibleVideoPlayer
                  url={selectedVideo.video_url}
                  title={selectedVideo.title}
                  category={selectedVideo.category}
                  level={selectedVideo.level}
                  autoPlay={false}
                />
                <div className="p-5 bg-white border-t-2 border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-black text-slate-950">
                        {selectedVideo.title}
                      </h3>
                      <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                        {selectedVideo.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="p-8 bg-slate-100 rounded-xl text-center text-slate-500 font-bold border-2 border-dashed border-slate-300">
                Select a tutorial video from the library below to begin practicing.
              </div>
            )}
          </div>

          {/* Video Filtering Controls */}
          <div className="bg-slate-100 p-6 rounded-2xl border-2 border-slate-300 space-y-5">
            {/* Level Filter */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter by FSL Level</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLevel('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    selectedLevel === 'all'
                      ? 'bg-blue-800 text-white shadow-xs border-2 border-blue-800'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-300'
                  }`}
                >
                  All Levels
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLevel(1)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    selectedLevel === 1
                      ? 'bg-emerald-700 text-white shadow-xs border-2 border-emerald-700'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-300'
                  }`}
                >
                  Level 1: Basic
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLevel(2)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    selectedLevel === 2
                      ? 'bg-blue-700 text-white shadow-xs border-2 border-blue-700'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-300'
                  }`}
                >
                  Level 2: Intermediate
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLevel(3)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    selectedLevel === 3
                      ? 'bg-indigo-700 text-white shadow-xs border-2 border-indigo-700'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-300'
                  }`}
                >
                  Level 3: Advanced
                </button>
              </div>
            </div>

            {/* 6 Grounded Categories Filter */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>The 6 Grounded FSL Curriculum Categories</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white shadow-xs border-2 border-slate-900'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-300'
                  }`}
                >
                  All Categories
                </button>
                {GROUNDED_VIDEO_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      selectedCategory === cat
                        ? 'bg-purple-800 text-white shadow-xs border-2 border-purple-800'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Available Tutorials ({filteredVideos.length})
              </h3>
              {(selectedLevel !== 'all' || selectedCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLevel('all');
                    setSelectedCategory('all');
                  }}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {filteredVideos.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-xl text-center text-slate-500 font-bold border-2 border-dashed border-slate-300">
                No videos match the selected level and category filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => {
                  const isCurrent = selectedVideo?.id === video.id;

                  return (
                    <Card
                      key={video.id}
                      className={`border-2 shadow-sm transition-all overflow-hidden flex flex-col justify-between ${
                        isCurrent
                          ? 'border-blue-600 ring-2 ring-blue-600/30 bg-blue-50/20'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <CardHeader className="bg-slate-50 border-b border-slate-200 p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                            Level {video.level}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 truncate max-w-[170px]">
                            {video.category}
                          </span>
                        </div>
                        <CardTitle className="text-base font-black text-slate-950 line-clamp-2">
                          {video.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                          {video.description}
                        </p>

                        <div className="pt-2 border-t border-slate-200">
                          <Button
                            variant={isCurrent ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => handleSelectVideo(video)}
                            className="w-full font-bold text-xs"
                          >
                            <Play className="w-3.5 h-3.5 mr-1.5" />
                            <span>{isCurrent ? 'Now Playing Above' : 'Watch Video'}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Tab 2: Handouts Repository */}
      {activeTab === 'handouts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Curriculum Handouts & PDF Study Materials
              </h2>
              <p className="text-sm text-slate-600 font-medium">
                Official instructional documents, visual alphabet handshape compendiums, and interpreter codes.
              </p>
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
              {materials.length} Documents
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {materials.map((mat) => (
              <Card
                key={mat.id}
                className="border-2 border-slate-300 shadow-sm p-6 flex flex-col justify-between hover:border-blue-400 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    {mat.schedule?.workshop && (
                      <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                        Level {mat.schedule.workshop.level}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-950 leading-snug">
                    {mat.title}
                  </h3>

                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {mat.description || 'Instructional study guide and visual reference sheet.'}
                  </p>

                  {mat.schedule && (
                    <div className="text-xs font-bold text-slate-500">
                      Cohort: {mat.schedule.day_time}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <a
                    href={mat.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center w-full min-h-[44px] px-4 py-2 font-black text-sm text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-300 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span>Download Handout (PDF)</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-2" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
