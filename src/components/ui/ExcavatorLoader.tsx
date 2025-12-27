'use client';

import React from 'react';

interface ExcavatorLoaderProps {
  message?: string;
  subMessage?: string;
}

export default function ExcavatorLoader({ 
  message = "Digging up data...", 
  subMessage = "Please wait while we mine the information" 
}: ExcavatorLoaderProps) {
  return (
    <div className="min-h-screen bg-metallic-950 flex flex-col items-center justify-center">
      {/* Excavator Animation Container */}
      <div className="relative w-80 h-64 mb-8">
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="excavatorBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="excavatorArm" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="excavatorBucket" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#6b7280" />
            </linearGradient>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
            <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78716c" />
              <stop offset="100%" stopColor="#57534e" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="50%" stopColor="#ffec8b" />
              <stop offset="100%" stopColor="#daa520" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Ground/Mining Site */}
          <rect x="0" y="240" width="400" height="60" fill="url(#groundGradient)" />
          <ellipse cx="320" cy="245" rx="60" ry="15" fill="#44403c" />
          
          {/* Rock pile being dug */}
          <g className="rock-pile">
            <ellipse cx="320" cy="235" rx="45" ry="20" fill="#78716c" />
            <ellipse cx="310" cy="225" rx="30" ry="15" fill="#a8a29e" />
            <ellipse cx="330" cy="220" rx="20" ry="10" fill="#d6d3d1" />
          </g>
          
          {/* Gold nuggets in rock (sparkling) */}
          <g className="gold-nuggets">
            <circle cx="305" cy="230" r="4" fill="url(#goldGradient)" filter="url(#glow)" className="nugget-sparkle-1" />
            <circle cx="325" cy="225" r="3" fill="url(#goldGradient)" filter="url(#glow)" className="nugget-sparkle-2" />
            <circle cx="340" cy="235" r="3.5" fill="url(#goldGradient)" filter="url(#glow)" className="nugget-sparkle-3" />
          </g>
          
          {/* Excavator Tracks */}
          <g className="excavator-tracks">
            <rect x="60" y="220" width="120" height="30" rx="15" fill="url(#trackGradient)" />
            <circle cx="75" cy="235" r="12" fill="#4b5563" stroke="#374151" strokeWidth="2" />
            <circle cx="165" cy="235" r="12" fill="#4b5563" stroke="#374151" strokeWidth="2" />
            <circle cx="120" cy="235" r="10" fill="#4b5563" stroke="#374151" strokeWidth="2" />
            {/* Track details */}
            <line x1="85" y1="223" x2="85" y2="247" stroke="#1f2937" strokeWidth="3" className="track-line" />
            <line x1="100" y1="223" x2="100" y2="247" stroke="#1f2937" strokeWidth="3" className="track-line" />
            <line x1="115" y1="223" x2="115" y2="247" stroke="#1f2937" strokeWidth="3" className="track-line" />
            <line x1="130" y1="223" x2="130" y2="247" stroke="#1f2937" strokeWidth="3" className="track-line" />
            <line x1="145" y1="223" x2="145" y2="247" stroke="#1f2937" strokeWidth="3" className="track-line" />
          </g>
          
          {/* Excavator Body */}
          <g className="excavator-body">
            {/* Main cabin */}
            <rect x="80" y="165" width="80" height="55" rx="5" fill="url(#excavatorBody)" />
            {/* Cabin window */}
            <rect x="90" y="175" width="40" height="25" rx="3" fill="#1e3a5f" stroke="#0c4a6e" strokeWidth="2" />
            {/* Window reflection */}
            <rect x="92" y="177" width="15" height="8" rx="1" fill="rgba(255,255,255,0.2)" />
            {/* Cabin top */}
            <rect x="75" y="158" width="90" height="10" rx="2" fill="#d97706" />
            {/* Exhaust */}
            <rect x="145" y="145" width="8" height="20" rx="2" fill="#4b5563" />
          </g>
          
          {/* Arm and Bucket Assembly - Animated */}
          <g className="excavator-arm-assembly">
            {/* Boom (main arm) */}
            <g className="boom">
              <rect x="155" y="170" width="100" height="18" rx="3" fill="url(#excavatorArm)" transform="rotate(-30, 155, 179)" />
            </g>
            
            {/* Stick (secondary arm) */}
            <g className="stick">
              <rect x="220" y="115" width="80" height="14" rx="2" fill="url(#excavatorArm)" transform="rotate(45, 220, 122)" />
            </g>
            
            {/* Bucket */}
            <g className="bucket">
              <path
                d="M280,190 L310,190 L320,220 L300,230 L280,230 L270,220 Z"
                fill="url(#excavatorBucket)"
                stroke="#4b5563"
                strokeWidth="2"
              />
              {/* Bucket teeth */}
              <path d="M275,230 L278,245 L282,230" fill="#4b5563" />
              <path d="M285,230 L288,248 L292,230" fill="#4b5563" />
              <path d="M295,230 L298,248 L302,230" fill="#4b5563" />
              <path d="M305,230 L308,245 L312,230" fill="#4b5563" />
              
              {/* Dirt/ore in bucket */}
              <ellipse cx="295" cy="210" rx="15" ry="8" fill="#78716c" />
              <circle cx="290" cy="208" r="3" fill="url(#goldGradient)" filter="url(#glow)" className="bucket-gold" />
            </g>
            
            {/* Hydraulic cylinders */}
            <line x1="160" y1="165" x2="200" y2="130" stroke="#6b7280" strokeWidth="6" />
            <line x1="162" y1="167" x2="198" y2="133" stroke="#9ca3af" strokeWidth="2" />
          </g>
          
          {/* Dust particles */}
          <g className="dust-particles">
            <circle cx="270" cy="240" r="2" fill="#a8a29e" className="dust-1" />
            <circle cx="285" cy="235" r="1.5" fill="#d6d3d1" className="dust-2" />
            <circle cx="300" cy="242" r="2.5" fill="#a8a29e" className="dust-3" />
            <circle cx="260" cy="238" r="1" fill="#d6d3d1" className="dust-4" />
          </g>
        </svg>
      </div>

      {/* Loading Text */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-metallic-100 mb-2">{message}</h2>
        <p className="text-metallic-400">{subMessage}</p>
        
        {/* Mining-themed loading dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-3 h-3 rounded-full bg-amber-500 loading-dot-1"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400 loading-dot-2"></div>
          <div className="w-3 h-3 rounded-full bg-amber-300 loading-dot-3"></div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        /* Excavator arm digging animation */
        .excavator-arm-assembly {
          animation: digMotion 2.5s ease-in-out infinite;
          transform-origin: 155px 179px;
        }
        
        @keyframes digMotion {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(15deg);
          }
          50% {
            transform: rotate(-5deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }
        
        /* Bucket scooping animation */
        .bucket {
          animation: scoop 2.5s ease-in-out infinite;
          transform-origin: 280px 210px;
        }
        
        @keyframes scoop {
          0%, 100% {
            transform: rotate(0deg);
          }
          30% {
            transform: rotate(20deg);
          }
          70% {
            transform: rotate(-15deg);
          }
        }
        
        /* Gold nugget sparkle */
        .nugget-sparkle-1 {
          animation: sparkle 1.5s ease-in-out infinite;
        }
        .nugget-sparkle-2 {
          animation: sparkle 1.5s ease-in-out infinite 0.3s;
        }
        .nugget-sparkle-3 {
          animation: sparkle 1.5s ease-in-out infinite 0.6s;
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
        
        .bucket-gold {
          animation: sparkle 1s ease-in-out infinite;
        }
        
        /* Dust particles */
        .dust-1 {
          animation: dustFloat 1.5s ease-out infinite;
        }
        .dust-2 {
          animation: dustFloat 1.5s ease-out infinite 0.2s;
        }
        .dust-3 {
          animation: dustFloat 1.5s ease-out infinite 0.4s;
        }
        .dust-4 {
          animation: dustFloat 1.5s ease-out infinite 0.6s;
        }
        
        @keyframes dustFloat {
          0% {
            opacity: 0.8;
            transform: translateY(0) translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) translateX(10px);
          }
        }
        
        /* Track movement illusion */
        .track-line {
          animation: trackMove 0.5s linear infinite;
        }
        
        @keyframes trackMove {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(15px);
          }
        }
        
        /* Loading dots */
        .loading-dot-1 {
          animation: bounce 1.4s ease-in-out infinite;
        }
        .loading-dot-2 {
          animation: bounce 1.4s ease-in-out infinite 0.2s;
        }
        .loading-dot-3 {
          animation: bounce 1.4s ease-in-out infinite 0.4s;
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(1);
          }
          40% {
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}
