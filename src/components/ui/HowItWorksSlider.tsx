'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Feature {
  num: string;
  title: string;
  description: string;
  cta?: { text: string; href: string };
}

const features: Feature[] = [
  {
    num: '01',
    title: 'Interactive Map Explorer',
    description: 'Filter thousands of mining projects by commodity, jurisdiction, market cap, and project stage. Overlay geological data, infrastructure layers, and prospectivity scores to identify opportunities at a glance.',
    cta: { text: 'Learn More', href: '/features/map' },
  },
  {
    num: '02',
    title: 'Peer Comparison',
    description: 'Build custom peer sets and compare valuations side-by-side. See how companies stack up against peers at the same project stage, with metrics like EV/Resource, P/NAV, and market cap rankings.',
    cta: { text: 'Learn More', href: '/features/peers' },
  },
  {
    num: '03',
    title: 'Resource Analytics',
    description: 'Dive deep into JORC resources with standardized equivalents (AuEq, CuEq). Compare in-ground metal values, grade distributions, and resource categories across your defined peer groups.',
    cta: { text: 'Learn More', href: '/features/resources' },
  },
  {
    num: '04',
    title: 'Company Deep Dives',
    description: 'Access detailed company pages with financial data, resource tables, project locations, and historical price performance. Everything you need for due diligence in one place.',
  },
  {
    num: '05',
    title: 'AI-Powered Insights',
    description: 'Our AI reads announcements, extracts key metrics, and flags opportunities. Get natural language summaries explaining why stocks are mispriced relative to peers.',
    cta: { text: 'Learn More', href: '/features/ai' },
  },
];

export default function HowItWorksSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const feature = features[currentIndex];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Main content area */}
      <div className="relative bg-metallic-900/50 border border-metallic-800 rounded-2xl overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Screenshot/Visual Side */}
          <div className="relative aspect-[16/10] lg:aspect-auto bg-metallic-950 overflow-hidden">
            {/* Placeholder visualization - replace with actual screenshots */}
            <div className="absolute inset-0 bg-gradient-to-br from-metallic-900 via-metallic-950 to-primary-950 flex items-center justify-center p-8">
              <div className="w-full max-w-lg">
                {/* Mock UI based on current feature */}
                <div className="bg-metallic-900/80 rounded-lg border border-metallic-700 p-4 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                    <span className="ml-2 text-xs text-metallic-500">InvestOre Analytics</span>
                  </div>
                  
                  {/* Dynamic content based on feature */}
                  {currentIndex === 0 && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="w-24 h-6 bg-primary-500/20 rounded border border-primary-500/30" />
                        <div className="w-20 h-6 bg-metallic-800 rounded" />
                        <div className="w-16 h-6 bg-metallic-800 rounded" />
                      </div>
                      <div className="h-32 bg-metallic-800/50 rounded relative overflow-hidden">
                        <div className="absolute inset-4 grid grid-cols-4 grid-rows-3 gap-1">
                          {[...Array(12)].map((_, i) => (
                            <div key={i} className={`rounded-full ${i % 3 === 0 ? 'bg-primary-500' : i % 3 === 1 ? 'bg-accent-copper' : 'bg-blue-500'} opacity-60`} style={{ width: 8 + Math.random() * 8, height: 8 + Math.random() * 8 }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {currentIndex === 1 && (
                    <div className="space-y-2">
                      <div className="flex gap-2 text-xs text-metallic-400 border-b border-metallic-700 pb-2">
                        <span className="w-20">Company</span>
                        <span className="w-16">Mkt Cap</span>
                        <span className="w-16">EV/Res</span>
                        <span className="w-12">P/NAV</span>
                      </div>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-2 text-xs">
                          <div className="w-20 h-4 bg-metallic-800 rounded" />
                          <div className="w-16 h-4 bg-metallic-800 rounded" />
                          <div className="w-16 h-4 bg-primary-500/30 rounded" />
                          <div className="w-12 h-4 bg-metallic-800 rounded" />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {currentIndex === 2 && (
                    <div className="space-y-3">
                      <div className="flex items-end gap-1 h-24 px-4">
                        {[45, 70, 55, 85, 60, 75, 50, 80, 65, 90].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-metallic-500 px-4">
                        <span>Inferred</span>
                        <span>Indicated</span>
                        <span>Measured</span>
                      </div>
                    </div>
                  )}
                  
                  {currentIndex === 3 && (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-metallic-800 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="w-3/4 h-4 bg-metallic-700 rounded" />
                          <div className="w-1/2 h-3 bg-metallic-800 rounded" />
                          <div className="flex gap-2">
                            <div className="w-12 h-5 bg-primary-500/30 rounded text-xs flex items-center justify-center text-primary-400">Au</div>
                            <div className="w-12 h-5 bg-accent-copper/30 rounded text-xs flex items-center justify-center text-accent-copper">Cu</div>
                          </div>
                        </div>
                      </div>
                      <div className="h-px bg-metallic-700" />
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div><div className="text-metallic-500">Mkt Cap</div><div className="text-metallic-300">$245M</div></div>
                        <div><div className="text-metallic-500">EV</div><div className="text-metallic-300">$198M</div></div>
                        <div><div className="text-metallic-500">P/NAV</div><div className="text-primary-400">0.42x</div></div>
                      </div>
                    </div>
                  )}
                  
                  {currentIndex === 4 && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-primary-500/30 rounded-lg flex items-center justify-center text-primary-400 text-sm">AI</div>
                        <div className="flex-1 bg-metallic-800/50 rounded-lg p-2 text-xs text-metallic-300">
                          <p>Analysis: Trading at 0.4x NAV vs peer avg 0.7x. Recent drill results show 15% grade improvement...</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-8 bg-green-500/20 border border-green-500/30 rounded flex items-center justify-center text-xs text-green-400">Undervalued</div>
                        <div className="flex-1 h-8 bg-primary-500/20 border border-primary-500/30 rounded flex items-center justify-center text-xs text-primary-400">Strong Buy</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Text Side */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <span className="text-6xl lg:text-8xl font-bold text-primary-500/20 mb-4">
              {feature.num}
            </span>
            <h3 className="text-2xl lg:text-3xl font-bold text-metallic-100 mb-4">
              {feature.title}
            </h3>
            <p className="text-metallic-400 leading-relaxed mb-6">
              {feature.description}
            </p>
            {feature.cta && (
              <Link
                href={feature.cta.href}
                className="inline-flex items-center gap-2 text-primary-400 font-medium hover:text-primary-300 transition-colors"
              >
                {feature.cta.text}
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        {/* Dots */}
        <div className="flex gap-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary-500 w-8'
                  : 'bg-metallic-700 w-2 hover:bg-metallic-600'
              }`}
              aria-label={`Go to feature ${index + 1}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-metallic-800 border border-metallic-700 text-metallic-400 hover:text-primary-400 hover:border-primary-500/50 transition-all"
            aria-label="Previous feature"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-metallic-800 border border-metallic-700 text-metallic-400 hover:text-primary-400 hover:border-primary-500/50 transition-all"
            aria-label="Next feature"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
