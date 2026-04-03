'use client';

import React, { useState } from 'react';
import { Play, X, BarChart3, Map, Brain } from 'lucide-react';

interface VideoThumbnailProps {
  thumbnailSrc?: string;
  videoUrl: string;
  title?: string;
}

export default function VideoThumbnail({ 
  thumbnailSrc,
  videoUrl,
  title = 'Watch the Demo'
}: VideoThumbnailProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative w-full aspect-video rounded-xl overflow-hidden border border-metallic-800/60 shadow-2xl"
      >
        {/* Rich preview background */}
        <div className="absolute inset-0 bg-gradient-to-br from-metallic-900 via-metallic-950 to-primary-950/40">
          <div className="absolute inset-0 bg-[url('/topo-pattern.svg')] bg-repeat opacity-[0.06]" />
          
          {/* Mock dashboard UI */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <div className="bg-metallic-900/80 rounded-lg border border-metallic-700/50 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-2 h-2 rounded-full bg-red-400/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400/50" />
                  <div className="w-2 h-2 rounded-full bg-green-400/50" />
                  <span className="ml-2 text-[9px] text-metallic-600 font-mono">InvestOre Analytics</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-primary-500/15 rounded text-[8px] text-primary-400">
                    <BarChart3 className="w-2.5 h-2.5" /> Analytics
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-metallic-800/50 rounded text-[8px] text-metallic-500">
                    <Map className="w-2.5 h-2.5" /> Map
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-metallic-800/50 rounded text-[8px] text-metallic-500">
                    <Brain className="w-2.5 h-2.5" /> AI
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="h-2 bg-metallic-700/40 rounded w-3/4" />
                    <div className="h-2 bg-metallic-700/40 rounded w-1/2" />
                    <div className="h-12 bg-metallic-800/30 rounded mt-1.5 flex items-end p-1 gap-0.5">
                      {[40, 60, 35, 70, 55, 80, 65, 45, 75].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary-500/30 rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="w-20 space-y-1.5">
                    <div className="h-5 bg-emerald-500/10 rounded border border-emerald-500/20 flex items-center justify-center">
                      <span className="text-[7px] text-emerald-400">+12.4%</span>
                    </div>
                    <div className="h-5 bg-metallic-800/30 rounded" />
                    <div className="h-5 bg-metallic-800/30 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-3 bg-primary-500/20 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
            <div className="relative w-16 h-16 bg-primary-500/90 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:bg-primary-400 group-hover:scale-110 transition-all duration-300">
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            </div>
          </div>
        </div>

        {title && (
          <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-metallic-900/80 backdrop-blur-sm rounded-lg border border-metallic-700/50">
            <span className="text-xs font-medium text-metallic-300">{title}</span>
          </div>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Close video"
            >
              <X className="w-7 h-7" />
            </button>

            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                className="w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full bg-metallic-900 rounded-xl flex items-center justify-center">
                <p className="text-metallic-400 text-sm">Video coming soon</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
