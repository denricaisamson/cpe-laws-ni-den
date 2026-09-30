'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Repeat, Gauge, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { VideoCategory } from '@/types/database';

export interface AccessibleVideoPlayerProps {
  url: string;
  title: string;
  category?: VideoCategory | string;
  level?: number;
  autoPlay?: boolean;
}

export function AccessibleVideoPlayer({
  url,
  title,
  category,
  level,
  autoPlay = false,
}: AccessibleVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackRate, setPlaybackRate] = useState<0.5 | 0.75 | 1.0>(1.0);
  const [isLooping, setIsLooping] = useState(true); // Default looping on for signing practice
  const [isMuted, setIsMuted] = useState(true); // Default muted as FSL is visual
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Check if URL is YouTube or external embed
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

  const getYouTubeEmbedUrl = (rawUrl: string) => {
    let videoId = '';
    if (rawUrl.includes('youtu.be/')) {
      videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (rawUrl.includes('watch?v=')) {
      videoId = rawUrl.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (rawUrl.includes('/embed/')) {
      videoId = rawUrl.split('/embed/')[1]?.split('?')[0] || '';
    }
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&loop=${isLooping ? 1 : 0}&playlist=${videoId}&autoplay=${autoPlay ? 1 : 0}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleRateChange = (rate: 0.5 | 0.75 | 1.0) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (videoRef.current) {
      videoRef.current.loop = nextLoop;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div
      ref={containerRef}
      className="bg-slate-950 text-white rounded-2xl border-2 border-slate-700 overflow-hidden shadow-xl flex flex-col"
    >
      {/* Video Header: Title & Badges */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span aria-hidden="true">🤟</span>
            <span>{title}</span>
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {level && (
            <span className="px-2 py-0.5 rounded text-xs font-black bg-blue-900 text-blue-200 border border-blue-600">
              LEVEL {level}
            </span>
          )}
          {category && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-amber-300 border border-slate-700">
              {category}
            </span>
          )}
        </div>
      </div>

      {/* Video Display Area (16:9 Aspect Ratio) */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {isYouTube ? (
          <iframe
            src={getYouTubeEmbedUrl(url)}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            src={url}
            loop={isLooping}
            muted={isMuted}
            playsInline
            onClick={togglePlay}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
                setDuration(videoRef.current.duration || 0);
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-contain cursor-pointer"
          />
        )}
      </div>

      {/* Signing Practice Controls Bar */}
      {!isYouTube && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-sm">
          {/* Play, Restart & Time */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause signing video' : 'Play signing video'}
              className="p-2.5 rounded-lg bg-blue-800 text-white hover:bg-blue-900 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              aria-label="Replay from beginning"
              title="Replay from start"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <span className="font-mono text-xs text-slate-400 font-bold ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* FSL Practice Aids: Playback Speed & Loop Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 hidden sm:inline flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" /> Speed:
            </span>

            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800" role="group" aria-label="Playback speeds for signing study">
              <button
                type="button"
                onClick={() => handleRateChange(0.5)}
                className={`px-2 py-1 rounded text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  playbackRate === 0.5
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="0.5x Slow Motion (study fingerspelling)"
              >
                0.5x
              </button>
              <button
                type="button"
                onClick={() => handleRateChange(0.75)}
                className={`px-2 py-1 rounded text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  playbackRate === 0.75
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="0.75x Moderate (study sign transitions)"
              >
                0.75x
              </button>
              <button
                type="button"
                onClick={() => handleRateChange(1.0)}
                className={`px-2 py-1 rounded text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  playbackRate === 1.0
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="1.0x Normal Speed"
              >
                1.0x
              </button>
            </div>

            {/* Loop Toggle Button */}
            <button
              type="button"
              onClick={toggleLoop}
              aria-pressed={isLooping}
              aria-label="Toggle signing practice loop"
              title="Continuous Sign Loop Toggle"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 transition-colors ${
                isLooping
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>{isLooping ? 'Loop: ON' : 'Loop: OFF'}</span>
            </button>

            {/* Mute and Fullscreen */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleFullScreen}
              aria-label="Toggle Fullscreen"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
