'use client';

import React, { useState } from 'react';
import { Play, X } from 'lucide-react';

interface VideoThumbnailProps {
  thumbnailSrc?: string;
  videoUrl: string;
  title?: string;
}

export default function VideoThumbnail({ 
  thumbnailSrc = '/video-thumbnail.jpg',
  videoUrl,
  title = 'Watch the Demo'
}: VideoThumbnailProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  return (
    <>
      {/* Thumbnail with play button */}
      <button
        onClick={() => setIsOpen(true)}
        className="group relative w-full aspect-video rounded-xl overflow-hidden border border-metallic-800 shadow-2xl"
      >
        {/* Thumbnail background */}
        <div className="absolute inset-0 bg-gradient-to-br from-metallic-900 via-metallic-950 to-primary-950">
          {/* Placeholder content - replace with actual thumbnail */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-2xl px-8">
              {/* Mock dashboard preview */}
              <div className="bg-metallic-900/90 rounded-lg border border-metallic-700 p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="w-20 h-5 bg-metallic-800 rounded" />
                    <div className="w-16 h-5 bg-metallic-800 rounded" />
                    <div className="w-24 h-5 bg-primary-500/30 rounded" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 h-24 bg-metallic-800/50 rounded" />
                    <div className="flex-1 h-24 bg-metallic-800/50 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Pulse ring */}
            <div className="absolute inset-0 bg-primary-500/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            {/* Button */}
            <div className="relative w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:bg-primary-400 group-hover:scale-110 transition-all duration-300">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          </div>
        </div>

        {/* Title badge */}
        {title && (
          <div className="absolute bottom-4 left-4 px-4 py-2 bg-metallic-900/90 backdrop-blur-sm rounded-lg border border-metallic-700">
            <span className="text-sm font-medium text-metallic-200">{title}</span>
          </div>
        )}
      </button>

      {/* Video Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Close video"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Video iframe */}
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                className="w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full bg-metallic-900 rounded-xl flex items-center justify-center">
                <p className="text-metallic-400">Video not available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
