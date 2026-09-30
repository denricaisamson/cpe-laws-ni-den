'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import {
  getProfessorSchedules,
  getAllMaterials,
  createMaterial,
  getAllVideos,
  createVideo,
  subscribeToProfessorStore,
  GROUNDED_VIDEO_CATEGORIES,
} from '@/lib/professor-data';
import type {
  ScheduleWithDetails,
  Material,
  Video,
  WorkshopLevel,
  VideoCategory,
} from '@/types/database';
import {
  Video as VideoIcon,
  FileText,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  X,
  Save,
  ArrowLeft,
  Calendar,
  Layers,
  Film,
  Download,
  BookOpen,
  Filter,
} from 'lucide-react';

interface MaterialsPublishingClientProps {
  initialProfId?: string;
  initialProfName?: string;
}

export function MaterialsPublishingClient({
  initialProfId,
  initialProfName,
}: MaterialsPublishingClientProps) {
  const [activeTab, setActiveTab] = useState<'materials' | 'videos'>('materials');
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [materials, setMaterials] = useState<(Material & { schedule?: ScheduleWithDetails })[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filters for videos
  const [videoLevelFilter, setVideoLevelFilter] = useState<string>('all');
  const [videoCategoryFilter, setVideoCategoryFilter] = useState<string>('all');

  // Upload Material Modal State
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState<boolean>(false);
  const [materialScheduleId, setMaterialScheduleId] = useState<string>('');
  const [materialTitle, setMaterialTitle] = useState<string>('');
  const [materialFileUrl, setMaterialFileUrl] = useState<string>('');
  const [materialDescription, setMaterialDescription] = useState<string>('');
  const [materialError, setMaterialError] = useState<string | null>(null);

  // Publish Video Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [videoLevel, setVideoLevel] = useState<WorkshopLevel>(1);
  const [videoCategory, setVideoCategory] = useState<VideoCategory>(GROUNDED_VIDEO_CATEGORIES[0]);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoDescription, setVideoDescription] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    const schedList = getProfessorSchedules(initialProfId);
    setSchedules(schedList);
    setMaterialScheduleId((prev) => {
      if (prev) return prev;
      return schedList.length > 0 ? schedList[0].id : '';
    });

    setMaterials(getAllMaterials(initialProfId));
    setVideos(getAllVideos());
  }, [initialProfId]);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToProfessorStore(loadData);
    return () => unsubscribe();
  }, [loadData]);

  const handleOpenMaterialModal = () => {
    setMaterialTitle('');
    setMaterialFileUrl('');
    setMaterialDescription('');
    setMaterialError(null);
    setIsMaterialModalOpen(true);
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim()) {
      setMaterialError('Material title cannot be empty');
      return;
    }
    if (!materialFileUrl.trim()) {
      setMaterialError('File URL cannot be empty');
      return;
    }
    if (!materialScheduleId) {
      setMaterialError('Please select a target workshop schedule');
      return;
    }

    try {
      createMaterial({
        scheduleId: materialScheduleId,
        title: materialTitle.trim(),
        fileUrl: materialFileUrl.trim(),
        description: materialDescription.trim(),
      });

      setIsMaterialModalOpen(false);
      loadData();
      setActionNotice(`Material "${materialTitle}" posted successfully!`);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      setMaterialError((err as Error).message);
    }
  };

  const handleOpenVideoModal = () => {
    setVideoTitle('');
    setVideoUrl('');
    setVideoDescription('');
    setVideoLevel(1);
    setVideoCategory(GROUNDED_VIDEO_CATEGORIES[0]);
    setVideoError(null);
    setIsVideoModalOpen(true);
  };

  const handleCreateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      setVideoError('Video title cannot be empty');
      return;
    }
    if (!videoUrl.trim()) {
      setVideoError('Video URL cannot be empty');
      return;
    }

    try {
      createVideo({
        level: videoLevel,
        category: videoCategory,
        title: videoTitle.trim(),
        videoUrl: videoUrl.trim(),
        description: videoDescription.trim(),
        uploadedBy: initialProfId,
      });

      setIsVideoModalOpen(false);
      loadData();
      setActionNotice(`FSL Tutorial Video "${videoTitle}" published successfully!`);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      setVideoError((err as Error).message);
    }
  };

  // Filtered videos
  const filteredVideos = videos.filter((v) => {
    if (videoLevelFilter !== 'all' && v.level !== Number(videoLevelFilter)) return false;
    if (videoCategoryFilter !== 'all' && v.category !== videoCategoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header and Back Link */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
          <Link href="/professor" className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Professor Hub</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Materials & Video Publishing</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider mb-2 border border-indigo-200">
              <Film className="w-3.5 h-3.5" />
              <span>Learning Content Publisher</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Classroom Materials & Video Tutorials
            </h1>
            <p className="text-slate-600 font-medium mt-1">
              Upload PDF handouts and reference charts, and publish signing tutorial videos across the 6 grounded FSL categories.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleOpenMaterialModal}
              className="border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-bold"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Upload Handout
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenVideoModal}
              className="bg-indigo-700 hover:bg-indigo-800 font-bold shadow-md"
            >
              <VideoIcon className="w-4 h-4 mr-1.5" />
              Publish Tutorial Video
            </Button>
          </div>
        </div>
      </div>

      {/* Visual Feedback Toast */}
      {actionNotice && (
        <Alert variant="success" className="border-2 border-emerald-500 bg-emerald-50 text-emerald-950 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{actionNotice}</span>
        </Alert>
      )}

      {/* Tab Switcher */}
      <div className="border-b-2 border-slate-300">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`pb-3 px-2 font-black text-sm border-b-4 transition-all flex items-center gap-2 ${
              activeTab === 'materials'
                ? 'border-indigo-700 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Course Handouts & Materials ({materials.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`pb-3 px-2 font-black text-sm border-b-4 transition-all flex items-center gap-2 ${
              activeTab === 'videos'
                ? 'border-indigo-700 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <VideoIcon className="w-4 h-4" />
            <span>FSL Tutorial & Signing Videos ({videos.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Course Handouts & Materials */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Uploaded Handouts & Reference Documents
              </h3>
              <p className="text-xs text-slate-500">
                Handouts attached to your workshop schedules available for learner download.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenMaterialModal}
              className="bg-indigo-700 hover:bg-indigo-800 font-bold"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Upload New Handout
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {materials.map((item) => (
              <Card key={item.id} className="border-2 border-slate-300 shadow-sm flex flex-col justify-between">
                <CardHeader className="bg-slate-50 border-b-2 border-slate-200 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black uppercase text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-300">
                      Level {item.schedule?.workshop?.level || 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-black text-slate-900 mt-2">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold text-slate-600">
                    Cohort: {item.schedule?.workshop?.title} ({item.schedule?.day_time})
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {item.description || 'Reference document for visual signing and classroom practice.'}
                  </p>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 underline truncate max-w-[260px]"
                    >
                      <Download className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{item.file_url}</span>
                    </a>

                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-300 inline-flex items-center gap-1 flex-shrink-0"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: FSL Tutorial Videos */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                FSL Tutorial & Signing Video Library
              </h3>
              <p className="text-xs text-slate-500">
                Videos categorized across the 6 grounded curriculum categories from FSL_SPEC.md.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenVideoModal}
              className="bg-indigo-700 hover:bg-indigo-800 font-bold"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Publish New Video
            </Button>
          </div>

          {/* Video Filtering Bar */}
          <div className="p-4 bg-white rounded-xl border-2 border-slate-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Level:
              </span>
              <div className="flex gap-1.5">
                {['all', '1', '2', '3'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setVideoLevelFilter(lvl)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors border ${
                      videoLevelFilter === lvl
                        ? 'bg-indigo-700 text-white border-indigo-900'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {lvl === 'all' ? 'All Levels' : `Level ${lvl}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-600 tracking-wider">
                Category:
              </span>
              <select
                value={videoCategoryFilter}
                onChange={(e) => setVideoCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All 6 Grounded Categories</option>
                {GROUNDED_VIDEO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="border-2 border-slate-300 shadow-sm flex flex-col justify-between overflow-hidden">
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                    Level {video.level}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {new Date(video.created_at).toLocaleDateString()}
                  </span>
                </div>

                <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="inline-block text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      {video.category}
                    </span>
                    <h4 className="text-base font-black text-slate-900 leading-snug line-clamp-2">
                      {video.title}
                    </h4>
                    {video.description && (
                      <p className="text-xs text-slate-600 line-clamp-3">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      <VideoIcon className="w-3.5 h-3.5" />
                      <span>Watch Tutorial Video</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Material Modal */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-slate-300 shadow-2xl overflow-hidden">
            <div className="bg-indigo-900 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-300" />
                  <span>Upload Course Material</span>
                </h3>
                <p className="text-xs text-indigo-200 font-medium mt-1">
                  Attach PDF handouts or reference charts to an assigned workshop schedule.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMaterialModalOpen(false)}
                className="p-1 rounded-lg hover:bg-indigo-800 text-indigo-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="p-6 space-y-4">
              {materialError && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-lg text-rose-800 text-xs font-bold">
                  {materialError}
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Select Workshop Schedule
                </label>
                <select
                  required
                  value={materialScheduleId}
                  onChange={(e) => setMaterialScheduleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-bold bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.workshop?.title} (Level {s.workshop?.level}) — {s.day_time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Material Title
                </label>
                <input
                  type="text"
                  required
                  value={materialTitle}
                  onChange={(e) => {
                    setMaterialTitle(e.target.value);
                    setMaterialError(null);
                  }}
                  placeholder="e.g. FSL Handshape Reference Chart (PDF)"
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-bold focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  File URL / Document Link
                </label>
                <input
                  type="url"
                  required
                  value={materialFileUrl}
                  onChange={(e) => {
                    setMaterialFileUrl(e.target.value);
                    setMaterialError(null);
                  }}
                  placeholder="https://example.com/materials/fsl_chart.pdf"
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 font-mono text-sm focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Description / Study Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={materialDescription}
                  onChange={(e) => setMaterialDescription(e.target.value)}
                  placeholder="Brief summary of the handout content..."
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-medium focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="font-bold text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-indigo-700 hover:bg-indigo-800 font-bold"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Save Material
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publish Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-slate-300 shadow-2xl overflow-hidden">
            <div className="bg-indigo-900 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <VideoIcon className="w-5 h-5 text-indigo-300" />
                  <span>Publish FSL Tutorial Video</span>
                </h3>
                <p className="text-xs text-indigo-200 font-medium mt-1">
                  Upload signing tutorial organized by FSL Level and grounded category.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 rounded-lg hover:bg-indigo-800 text-indigo-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVideo} className="p-6 space-y-4">
              {videoError && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-lg text-rose-800 text-xs font-bold">
                  {videoError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                    FSL Level
                  </label>
                  <select
                    value={videoLevel}
                    onChange={(e) => setVideoLevel(Number(e.target.value) as WorkshopLevel)}
                    className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-bold bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value={1}>Level 1: Foundations</option>
                    <option value={2}>Level 2: Grammar & Classifiers</option>
                    <option value={3}>Level 3: Fluency & Discourse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                    Category (6 Grounded)
                  </label>
                  <select
                    value={videoCategory}
                    onChange={(e) => setVideoCategory(e.target.value as VideoCategory)}
                    className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-bold bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  >
                    {GROUNDED_VIDEO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Video Tutorial Title
                </label>
                <input
                  type="text"
                  required
                  value={videoTitle}
                  onChange={(e) => {
                    setVideoTitle(e.target.value);
                    setVideoError(null);
                  }}
                  placeholder="e.g. FSL Alphabet A-Z: Proper Finger Orientation"
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-bold focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Video URL / YouTube Embed Link
                </label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoError(null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=... or https://storage.fsl.ph/..."
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 font-mono text-sm focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Video Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Overview of signing movements demonstrated in this video..."
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-medium focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="font-bold text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-indigo-700 hover:bg-indigo-800 font-bold"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Publish Video
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
