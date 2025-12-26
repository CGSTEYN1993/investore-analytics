'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "InvestOre has become my go-to tool for peer reviewing mining companies. The ability to compare market cap, resource data, and valuation metrics side by side is invaluable. It gives me the information I need to successfully position investments against their peers.",
    name: "Sarah Mitchell",
    title: "Portfolio Manager",
    company: "Alpine Capital Partners",
  },
  {
    quote: "The AI-powered insights are a game changer. Instead of spending hours reading technical announcements, I get instant summaries that highlight what matters. The valuation explainer feature alone has helped me identify several undervalued opportunities.",
    name: "James Chen",
    title: "Senior Analyst",
    company: "Pacific Resources Fund",
  },
  {
    quote: "Dollar for dollar, this is the best research tool for mining investors. The interface is intuitive, the data quality is exceptional, and the team continuously improves the product. I've recommended it to everyone in my network.",
    name: "Michael Torres",
    title: "Independent Investor",
    company: "Mining Focused Portfolio",
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const testimonial = testimonials[currentIndex];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/mining-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-metallic-950/95 via-metallic-950/90 to-metallic-950/95" />
      <div className="absolute inset-0 bg-[url('/topo-pattern.svg')] bg-repeat opacity-5" />
      
      <div 
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-metallic-100">
            What Investors Say
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="relative">
          <div className="bg-metallic-900/50 backdrop-blur-sm border border-metallic-800 rounded-2xl p-8 lg:p-12">
            <Quote className="w-12 h-12 text-primary-500/30 mb-6" />
            
            <blockquote className="text-xl lg:text-2xl text-metallic-200 leading-relaxed mb-8">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-4">
              {/* Avatar placeholder */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
                {testimonial.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-semibold text-metallic-100">{testimonial.name}</div>
                <div className="text-sm text-metallic-400">
                  {testimonial.title} <span className="text-metallic-600">•</span> {testimonial.company}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary-500 w-8'
                      : 'bg-metallic-700 w-2 hover:bg-metallic-600'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="p-3 rounded-full bg-metallic-800/80 border border-metallic-700 text-metallic-400 hover:text-primary-400 hover:border-primary-500/50 transition-all backdrop-blur-sm"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-3 rounded-full bg-metallic-800/80 border border-metallic-700 text-metallic-400 hover:text-primary-400 hover:border-primary-500/50 transition-all backdrop-blur-sm"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
