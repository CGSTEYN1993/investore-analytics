'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Screenshot {
  src: string;
  alt: string;
  title: string;
}

const screenshots: Screenshot[] = [
  {
    src: '/screenshots/dashboard.png',
    alt: 'Dashboard Overview',
    title: 'Real-time Dashboard',
  },
  {
    src: '/screenshots/peer-analysis.png',
    alt: 'Peer Analysis',
    title: 'Peer Comparison Tool',
  },
  {
    src: '/screenshots/map-view.png',
    alt: 'Interactive Map',
    title: 'Geo-Spatial Mapping',
  },
  {
    src: '/screenshots/valuation.png',
    alt: 'Valuation Charts',
    title: 'Valuation Analytics',
  },
  {
    src: '/screenshots/ai-insights.png',
    alt: 'AI Insights',
    title: 'AI-Powered Insights',
  },
];

export default function LaptopSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  // Pause on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <div 
      className="relative w-full max-w-5xl mx-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Laptop Frame */}
      <div className="relative">
        {/* Laptop Screen Bezel */}
        <div className="relative bg-metallic-900 rounded-t-xl p-2 sm:p-3 border-t border-x border-metallic-700 shadow-2xl">
          {/* Camera notch */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-metallic-700 border border-metallic-600" />
          
          {/* Screen area */}
          <div className="relative bg-metallic-950 rounded-lg overflow-hidden aspect-[16/10] border border-metallic-800">
            {/* Screenshots Container */}
            <div className="relative w-full h-full">
              {screenshots.map((screenshot, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === currentIndex
                      ? 'opacity-100 translate-x-0'
                      : index < currentIndex
                      ? 'opacity-0 -translate-x-full'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  {/* Placeholder gradient - replace with actual screenshots */}
                  <div className="w-full h-full bg-gradient-to-br from-metallic-900 via-metallic-950 to-primary-950 flex items-center justify-center">
                    <div className="text-center p-8">
                      {/* Placeholder UI mockup */}
                      <div className="mb-6 flex items-center justify-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-red-500/70" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                        <div className="w-3 h-3 rounded-full bg-green-500/70" />
                      </div>
                      
                      {/* Mock dashboard content */}
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="flex gap-3 justify-center mb-6">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-20 h-12 bg-metallic-800/50 rounded-lg border border-metallic-700/50 flex items-center justify-center">
                              <div className="w-8 h-6 bg-primary-500/30 rounded" />
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-metallic-800/30 rounded-xl p-4 border border-metallic-700/30">
                          <div className="flex items-end gap-1 justify-center h-24">
                            {[40, 65, 45, 80, 55, 70, 60, 75, 50, 85, 65, 90].map((height, i) => (
                              <div
                                key={i}
                                className="w-4 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t"
                                style={{ height: `${height}%` }}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-primary-400 font-medium text-lg">{screenshot.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Slide indicator overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary-400 w-6'
                      : 'bg-metallic-600 hover:bg-metallic-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Laptop Base/Keyboard */}
        <div className="relative">
          {/* Hinge */}
          <div className="h-3 bg-gradient-to-b from-metallic-800 to-metallic-700 rounded-b-sm mx-8" />
          
          {/* Keyboard base */}
          <div className="bg-gradient-to-b from-metallic-800 to-metallic-700 rounded-b-xl py-2 px-12 border-b border-x border-metallic-600 shadow-lg">
            {/* Trackpad */}
            <div className="w-32 h-1 mx-auto bg-metallic-600 rounded-full" />
          </div>
          
          {/* Base shadow/edge */}
          <div className="h-1 bg-metallic-600 rounded-b-xl mx-4" />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 sm:-translate-x-16 p-3 rounded-full bg-metallic-800/80 border border-metallic-700 text-metallic-300 hover:text-primary-400 hover:border-primary-500/50 hover:bg-metallic-800 transition-all shadow-lg backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 sm:translate-x-16 p-3 rounded-full bg-metallic-800/80 border border-metallic-700 text-metallic-300 hover:text-primary-400 hover:border-primary-500/50 hover:bg-metallic-800 transition-all shadow-lg backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Feature label below laptop */}
      <div className="text-center mt-8">
        <p className="text-metallic-400 text-sm">
          <span className="text-primary-400 font-medium">{screenshots[currentIndex].title}</span>
          {' '}&mdash; {screenshots[currentIndex].alt}
        </p>
      </div>
    </div>
  );
}
