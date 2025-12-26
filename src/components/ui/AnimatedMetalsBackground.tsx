'use client';

import React from 'react';

export default function AnimatedMetalsBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Copper Wire - Left Side */}
      <div className="absolute left-[5%] top-[20%] opacity-40">
        <svg width="120" height="200" viewBox="0 0 120 200" className="animate-copper-coil">
          <defs>
            <linearGradient id="copperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b87333" />
              <stop offset="50%" stopColor="#da8a67" />
              <stop offset="100%" stopColor="#8b4513" />
            </linearGradient>
          </defs>
          {/* Coiling copper wire */}
          <path
            d="M60,10 Q90,30 60,50 Q30,70 60,90 Q90,110 60,130 Q30,150 60,170 Q90,190 60,190"
            fill="none"
            stroke="url(#copperGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            className="copper-wire-path"
          />
          {/* Additional coil detail */}
          <ellipse cx="60" cy="50" rx="25" ry="8" fill="none" stroke="url(#copperGradient)" strokeWidth="4" opacity="0.6" />
          <ellipse cx="60" cy="90" rx="25" ry="8" fill="none" stroke="url(#copperGradient)" strokeWidth="4" opacity="0.6" />
          <ellipse cx="60" cy="130" rx="25" ry="8" fill="none" stroke="url(#copperGradient)" strokeWidth="4" opacity="0.6" />
        </svg>
      </div>

      {/* Gold Ingot - Right Side */}
      <div className="absolute right-[8%] top-[15%] opacity-50 animate-gold-shimmer">
        <svg width="100" height="80" viewBox="0 0 100 80">
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700">
                <animate attributeName="stop-color" values="#ffd700;#ffec8b;#ffd700" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#ffec8b">
                <animate attributeName="stop-color" values="#ffec8b;#ffd700;#ffec8b" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#daa520" />
            </linearGradient>
            <linearGradient id="goldSide" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b8860b" />
              <stop offset="100%" stopColor="#daa520" />
            </linearGradient>
          </defs>
          {/* Ingot top face */}
          <polygon points="20,20 80,20 90,35 10,35" fill="url(#goldGradient)" />
          {/* Ingot front face */}
          <polygon points="10,35 90,35 80,70 20,70" fill="url(#goldSide)" />
          {/* Ingot left face */}
          <polygon points="10,35 20,20 20,70 10,55" fill="#8b7500" />
          {/* Shine effect */}
          <polygon points="25,25 45,25 50,32 20,32" fill="rgba(255,255,255,0.3)" className="animate-pulse" />
        </svg>
      </div>

      {/* Silver Bars - Bottom Left */}
      <div className="absolute left-[10%] bottom-[25%] opacity-30 animate-float-slow">
        <svg width="80" height="60" viewBox="0 0 80 60">
          <defs>
            <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c0c0c0" />
              <stop offset="50%" stopColor="#e8e8e8" />
              <stop offset="100%" stopColor="#a9a9a9" />
            </linearGradient>
          </defs>
          <rect x="5" y="10" width="60" height="20" rx="2" fill="url(#silverGradient)" />
          <rect x="10" y="32" width="60" height="20" rx="2" fill="url(#silverGradient)" opacity="0.8" />
          {/* Shine */}
          <rect x="8" y="12" width="20" height="3" fill="rgba(255,255,255,0.4)" rx="1" />
        </svg>
      </div>

      {/* Lithium Crystal - Top Center-Left */}
      <div className="absolute left-[25%] top-[10%] opacity-35 animate-float-medium">
        <svg width="60" height="80" viewBox="0 0 60 80">
          <defs>
            <linearGradient id="lithiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0ffff" />
              <stop offset="50%" stopColor="#87ceeb" />
              <stop offset="100%" stopColor="#4a90a4" />
            </linearGradient>
          </defs>
          {/* Crystal shape */}
          <polygon points="30,5 50,25 45,60 15,60 10,25" fill="url(#lithiumGradient)" opacity="0.8" />
          <polygon points="30,5 50,25 30,35 10,25" fill="rgba(255,255,255,0.2)" />
          {/* Inner facet */}
          <polygon points="30,35 45,60 15,60" fill="rgba(74,144,164,0.6)" />
        </svg>
      </div>

      {/* Iron Ore Chunk - Right Side Middle */}
      <div className="absolute right-[15%] top-[45%] opacity-30 animate-rotate-slow">
        <svg width="70" height="70" viewBox="0 0 70 70">
          <defs>
            <radialGradient id="ironGradient" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#8b4513" />
              <stop offset="50%" stopColor="#654321" />
              <stop offset="100%" stopColor="#3d2314" />
            </radialGradient>
          </defs>
          {/* Rough ore shape */}
          <path d="M35,5 L55,15 L65,35 L55,55 L35,65 L15,55 L5,35 L15,15 Z" fill="url(#ironGradient)" />
          {/* Metallic specks */}
          <circle cx="25" cy="30" r="3" fill="#cd853f" opacity="0.7" />
          <circle cx="40" cy="25" r="2" fill="#daa520" opacity="0.6" />
          <circle cx="35" cy="45" r="2.5" fill="#cd853f" opacity="0.7" />
          <circle cx="50" cy="40" r="2" fill="#b8860b" opacity="0.5" />
        </svg>
      </div>

      {/* Nickel Coin/Disc - Bottom Right */}
      <div className="absolute right-[20%] bottom-[20%] opacity-35 animate-spin-very-slow">
        <svg width="50" height="50" viewBox="0 0 50 50">
          <defs>
            <linearGradient id="nickelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b0c4de" />
              <stop offset="50%" stopColor="#778899" />
              <stop offset="100%" stopColor="#696969" />
            </linearGradient>
          </defs>
          <circle cx="25" cy="25" r="22" fill="url(#nickelGradient)" />
          <circle cx="25" cy="25" r="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text x="25" y="30" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="12" fontWeight="bold">Ni</text>
        </svg>
      </div>

      {/* Zinc Hexagon - Left Side Middle */}
      <div className="absolute left-[3%] top-[50%] opacity-25 animate-float-fast">
        <svg width="50" height="55" viewBox="0 0 50 55">
          <defs>
            <linearGradient id="zincGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d3d3d3" />
              <stop offset="100%" stopColor="#a0a0a0" />
            </linearGradient>
          </defs>
          <polygon points="25,2 47,15 47,40 25,53 3,40 3,15" fill="url(#zincGradient)" />
          <polygon points="25,2 47,15 25,28 3,15" fill="rgba(255,255,255,0.15)" />
        </svg>
      </div>

      {/* Platinum Bar - Top Right */}
      <div className="absolute right-[25%] top-[8%] opacity-30 animate-float-medium">
        <svg width="70" height="35" viewBox="0 0 70 35">
          <defs>
            <linearGradient id="platinumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e5e4e2" />
              <stop offset="50%" stopColor="#c0c0c0" />
              <stop offset="100%" stopColor="#a8a8a8" />
            </linearGradient>
          </defs>
          <rect x="5" y="8" width="55" height="18" rx="1" fill="url(#platinumGradient)" />
          <rect x="8" y="10" width="15" height="3" fill="rgba(255,255,255,0.3)" rx="1" />
          <text x="35" y="21" textAnchor="middle" fill="rgba(0,0,0,0.2)" fontSize="8" fontWeight="bold">Pt</text>
        </svg>
      </div>

      {/* Uranium Rod (Green glow) - Bottom Center */}
      <div className="absolute left-[40%] bottom-[15%] opacity-25 animate-uranium-glow">
        <svg width="30" height="80" viewBox="0 0 30 80">
          <defs>
            <linearGradient id="uraniumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#228b22" />
              <stop offset="50%" stopColor="#32cd32" />
              <stop offset="100%" stopColor="#228b22" />
            </linearGradient>
            <filter id="uraniumGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect x="8" y="5" width="14" height="70" rx="2" fill="url(#uraniumGradient)" filter="url(#uraniumGlow)" />
        </svg>
      </div>

      {/* Cobalt Blue Crystal - Right Bottom */}
      <div className="absolute right-[5%] bottom-[35%] opacity-30 animate-float-slow">
        <svg width="45" height="60" viewBox="0 0 45 60">
          <defs>
            <linearGradient id="cobaltGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0047ab" />
              <stop offset="50%" stopColor="#4169e1" />
              <stop offset="100%" stopColor="#0047ab" />
            </linearGradient>
          </defs>
          <polygon points="22,3 40,20 35,55 10,55 5,20" fill="url(#cobaltGradient)" />
          <polygon points="22,3 40,20 22,30 5,20" fill="rgba(255,255,255,0.2)" />
        </svg>
      </div>

      {/* Floating Particles - Scattered */}
      <div className="absolute inset-0">
        {/* Gold particles */}
        <div className="absolute w-2 h-2 rounded-full bg-yellow-500/40 left-[15%] top-[30%] animate-particle-1" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400/30 left-[70%] top-[25%] animate-particle-2" />
        <div className="absolute w-1 h-1 rounded-full bg-amber-500/40 left-[45%] top-[60%] animate-particle-3" />
        
        {/* Copper particles */}
        <div className="absolute w-2 h-2 rounded-full bg-orange-600/30 left-[20%] top-[70%] animate-particle-2" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-orange-500/40 left-[80%] top-[55%] animate-particle-1" />
        
        {/* Silver particles */}
        <div className="absolute w-1.5 h-1.5 rounded-full bg-gray-300/40 left-[60%] top-[40%] animate-particle-3" />
        <div className="absolute w-1 h-1 rounded-full bg-gray-400/30 left-[35%] top-[20%] animate-particle-1" />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes copperCoil {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes goldShimmer {
          0%, 100% { transform: scale(1) translateY(0); filter: brightness(1); }
          50% { transform: scale(1.02) translateY(-5px); filter: brightness(1.2); }
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }
        
        @keyframes floatFast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes rotateSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spinVerySlow {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        
        @keyframes uraniumGlow {
          0%, 100% { filter: drop-shadow(0 0 3px #32cd32); opacity: 0.25; }
          50% { filter: drop-shadow(0 0 8px #32cd32); opacity: 0.4; }
        }
        
        @keyframes particle1 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.3; }
          75% { transform: translateY(-30px) translateX(5px); opacity: 0.5; }
        }
        
        @keyframes particle2 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          33% { transform: translateY(-15px) translateX(-10px); opacity: 0.5; }
          66% { transform: translateY(-25px) translateX(8px); opacity: 0.4; }
        }
        
        @keyframes particle3 {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
        
        .animate-copper-coil { animation: copperCoil 4s ease-in-out infinite; }
        .animate-gold-shimmer { animation: goldShimmer 3s ease-in-out infinite; }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-medium { animation: floatMedium 4s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 3s ease-in-out infinite; }
        .animate-rotate-slow { animation: rotateSlow 20s linear infinite; }
        .animate-spin-very-slow { animation: spinVerySlow 15s linear infinite; }
        .animate-uranium-glow { animation: uraniumGlow 2s ease-in-out infinite; }
        .animate-particle-1 { animation: particle1 5s ease-in-out infinite; }
        .animate-particle-2 { animation: particle2 6s ease-in-out infinite; }
        .animate-particle-3 { animation: particle3 4s ease-in-out infinite; }
        
        .copper-wire-path {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: drawWire 3s ease-out forwards, copperCoil 4s ease-in-out infinite 3s;
        }
        
        @keyframes drawWire {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
