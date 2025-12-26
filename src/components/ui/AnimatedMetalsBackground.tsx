'use client';

import React, { useState, useEffect } from 'react';

type CommodityStage = 'copper' | 'gold' | 'lithium' | 'silver' | 'diamond';

const STAGE_DURATION = 6000; // 6 seconds per commodity
const STAGES: CommodityStage[] = ['copper', 'gold', 'lithium', 'silver', 'diamond'];

export default function AnimatedMetalsBackground() {
  const [currentStage, setCurrentStage] = useState<CommodityStage>('copper');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentStage((prev) => {
          const currentIndex = STAGES.indexOf(prev);
          return STAGES[(currentIndex + 1) % STAGES.length];
        });
        setIsTransitioning(false);
      }, 500);
    }, STAGE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
      {/* Central Animation Container */}
      <div className={`relative w-[600px] h-[400px] transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Copper Wire Animation */}
        {currentStage === 'copper' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="500" height="300" viewBox="0 0 500 300" className="opacity-60">
              <defs>
                <linearGradient id="copperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#b87333" />
                  <stop offset="30%" stopColor="#da8a67" />
                  <stop offset="60%" stopColor="#cd7f32" />
                  <stop offset="100%" stopColor="#8b4513" />
                </linearGradient>
                <filter id="copperShine">
                  <feGaussianBlur stdDeviation="1" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Straight wire that draws in, then curls at the end */}
              <path
                d="M-50,150 L280,150 Q320,150 340,130 Q360,110 380,130 Q400,150 380,170 Q360,190 340,170 Q330,155 350,145"
                fill="none"
                stroke="url(#copperGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                filter="url(#copperShine)"
                className="copper-wire-draw"
              />
              
              {/* Wire highlight */}
              <path
                d="M-50,148 L280,148 Q320,148 340,128"
                fill="none"
                stroke="rgba(255,200,150,0.4)"
                strokeWidth="2"
                strokeLinecap="round"
                className="copper-wire-draw"
                style={{ animationDelay: '0.1s' }}
              />

              {/* Commodity Label */}
              <text x="250" y="250" textAnchor="middle" className="commodity-label" fill="rgba(184,115,51,0.8)" fontSize="24" fontWeight="300" letterSpacing="8">
                COPPER
              </text>
            </svg>
          </div>
        )}

        {/* Gold Pour Animation */}
        {currentStage === 'gold' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="400" height="350" viewBox="0 0 400 350" className="opacity-60">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="25%" stopColor="#ffec8b" />
                  <stop offset="50%" stopColor="#ffd700" />
                  <stop offset="75%" stopColor="#daa520" />
                  <stop offset="100%" stopColor="#b8860b" />
                </linearGradient>
                <linearGradient id="goldPour" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="100%" stopColor="#ff8c00" />
                </linearGradient>
                <linearGradient id="moldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4a4a4a" />
                  <stop offset="100%" stopColor="#2a2a2a" />
                </linearGradient>
                <filter id="goldGlow">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {/* Crucible/Ladle at top */}
              <g className="gold-ladle">
                <path d="M170,20 L230,20 L240,60 L160,60 Z" fill="url(#moldGrad)" />
                <ellipse cx="200" cy="20" rx="30" ry="8" fill="#3a3a3a" />
              </g>
              
              {/* Pouring stream */}
              <path
                d="M200,60 Q200,100 200,180"
                fill="none"
                stroke="url(#goldPour)"
                strokeWidth="12"
                strokeLinecap="round"
                filter="url(#goldGlow)"
                className="gold-stream"
              />
              
              {/* Mold */}
              <g>
                <path d="M120,180 L280,180 L260,260 L140,260 Z" fill="url(#moldGrad)" stroke="#555" strokeWidth="2" />
                {/* Inner mold cavity */}
                <path d="M140,185 L260,185 L245,255 L155,255 Z" fill="#1a1a1a" />
              </g>
              
              {/* Gold filling the mold */}
              <path
                d="M142,250 L258,250 L248,190 L152,190 Z"
                fill="url(#goldGrad)"
                filter="url(#goldGlow)"
                className="gold-fill"
              />
              
              {/* Shine on gold */}
              <path
                d="M155,200 L200,200 L195,215 L160,215 Z"
                fill="rgba(255,255,255,0.3)"
                className="gold-shine"
              />

              {/* Commodity Label */}
              <text x="200" y="310" textAnchor="middle" className="commodity-label" fill="rgba(255,215,0,0.8)" fontSize="24" fontWeight="300" letterSpacing="8">
                GOLD
              </text>
            </svg>
          </div>
        )}

        {/* Lithium to Battery Animation */}
        {currentStage === 'lithium' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="450" height="300" viewBox="0 0 450 300" className="opacity-60">
              <defs>
                <linearGradient id="batteryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2d5016" />
                  <stop offset="50%" stopColor="#4a7c23" />
                  <stop offset="100%" stopColor="#2d5016" />
                </linearGradient>
                <linearGradient id="batteryCharge" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#32cd32" />
                  <stop offset="50%" stopColor="#7cfc00" />
                  <stop offset="100%" stopColor="#32cd32" />
                </linearGradient>
                <filter id="lithiumGlow">
                  <feGaussianBlur stdDeviation="2" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Lithium powder particles converging */}
              <g className="lithium-particles">
                {[...Array(20)].map((_, i) => (
                  <circle
                    key={i}
                    r="3"
                    fill="rgba(255,255,255,0.8)"
                    className="lithium-particle"
                    style={{
                      '--start-x': `${50 + Math.random() * 350}px`,
                      '--start-y': `${50 + Math.random() * 200}px`,
                      '--delay': `${i * 0.1}s`,
                    } as React.CSSProperties}
                  />
                ))}
              </g>
              
              {/* Battery outline */}
              <g className="battery-appear">
                {/* Main body */}
                <rect x="140" y="100" width="150" height="80" rx="8" fill="url(#batteryGrad)" stroke="#1a1a1a" strokeWidth="3" />
                {/* Terminal */}
                <rect x="290" y="125" width="15" height="30" rx="2" fill="#555" stroke="#333" strokeWidth="2" />
                {/* Charge level */}
                <rect x="150" y="110" width="0" height="60" rx="4" fill="url(#batteryCharge)" filter="url(#lithiumGlow)" className="battery-charge" />
                {/* Battery segments */}
                <line x1="185" y1="105" x2="185" y2="175" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
                <line x1="220" y1="105" x2="220" y2="175" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
                <line x1="255" y1="105" x2="255" y2="175" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
              </g>
              
              {/* Lightning bolt */}
              <path
                d="M215,85 L205,105 L220,105 L200,130 L230,100 L215,100 Z"
                fill="#7cfc00"
                filter="url(#lithiumGlow)"
                className="lightning-bolt"
              />

              {/* Commodity Label */}
              <text x="225" y="250" textAnchor="middle" className="commodity-label" fill="rgba(124,252,0,0.8)" fontSize="24" fontWeight="300" letterSpacing="8">
                LITHIUM
              </text>
            </svg>
          </div>
        )}

        {/* Silver Ingot Animation */}
        {currentStage === 'silver' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="400" height="300" viewBox="0 0 400 300" className="opacity-60">
              <defs>
                <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e8e8e8" />
                  <stop offset="25%" stopColor="#c0c0c0" />
                  <stop offset="50%" stopColor="#d8d8d8" />
                  <stop offset="75%" stopColor="#a8a8a8" />
                  <stop offset="100%" stopColor="#909090" />
                </linearGradient>
                <linearGradient id="silverShine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <filter id="silverGlow">
                  <feGaussianBlur stdDeviation="2" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Silver bar - 3D perspective */}
              <g className="silver-bar-emerge">
                {/* Top face */}
                <polygon points="100,100 300,100 280,130 120,130" fill="url(#silverGrad)" className="silver-top" />
                {/* Front face */}
                <polygon points="120,130 280,130 280,180 120,180" fill="#b0b0b0" className="silver-front" />
                {/* Right face */}
                <polygon points="280,130 300,100 300,150 280,180" fill="#888" className="silver-right" />
                
                {/* Shine effect */}
                <polygon points="105,102 180,102 165,125 120,125" fill="url(#silverShine)" className="silver-shine-effect" />
                
                {/* Stamp/hallmark */}
                <rect x="170" y="145" width="60" height="25" rx="2" fill="none" stroke="rgba(80,80,80,0.5)" strokeWidth="1" />
                <text x="200" y="162" textAnchor="middle" fill="rgba(80,80,80,0.6)" fontSize="10" fontWeight="bold">.999</text>
                <text x="200" y="173" textAnchor="middle" fill="rgba(80,80,80,0.5)" fontSize="6">FINE SILVER</text>
              </g>
              
              {/* Reflection shine sweep */}
              <rect x="100" y="100" width="20" height="80" fill="url(#silverShine)" className="shine-sweep" />

              {/* Commodity Label */}
              <text x="200" y="240" textAnchor="middle" className="commodity-label" fill="rgba(192,192,192,0.8)" fontSize="24" fontWeight="300" letterSpacing="8">
                SILVER
              </text>
            </svg>
          </div>
        )}

        {/* Diamond Ring Animation */}
        {currentStage === 'diamond' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="400" height="320" viewBox="0 0 400 320" className="opacity-60">
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="50%" stopColor="#daa520" />
                  <stop offset="100%" stopColor="#b8860b" />
                </linearGradient>
                <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="25%" stopColor="#e0ffff" />
                  <stop offset="50%" stopColor="#b0e0e6" />
                  <stop offset="75%" stopColor="#e0ffff" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
                <filter id="diamondSparkle">
                  <feGaussianBlur stdDeviation="2" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="ringShine">
                  <feGaussianBlur stdDeviation="1" />
                </filter>
              </defs>

              {/* Ring band */}
              <g className="ring-appear">
                {/* Ring - ellipse to show 3D */}
                <ellipse cx="200" cy="180" rx="70" ry="25" fill="none" stroke="url(#ringGrad)" strokeWidth="12" />
                {/* Inner ring highlight */}
                <ellipse cx="200" cy="180" rx="70" ry="25" fill="none" stroke="rgba(255,236,139,0.4)" strokeWidth="2" strokeDasharray="20,10" />
                
                {/* Prong setting */}
                <path d="M185,155 L200,120 L215,155" fill="none" stroke="url(#ringGrad)" strokeWidth="4" />
                <path d="M180,160 L200,125 L220,160" fill="none" stroke="url(#ringGrad)" strokeWidth="3" />
              </g>
              
              {/* Diamond */}
              <g className="diamond-set" filter="url(#diamondSparkle)">
                {/* Diamond crown (top) */}
                <polygon points="200,70 230,100 200,115 170,100" fill="url(#diamondGrad)" />
                {/* Diamond table (flat top) */}
                <polygon points="185,85 215,85 220,95 180,95" fill="#ffffff" opacity="0.9" />
                {/* Left facet */}
                <polygon points="170,100 200,115 200,70" fill="#b0e0e6" opacity="0.7" />
                {/* Right facet */}
                <polygon points="230,100 200,115 200,70" fill="#e0ffff" opacity="0.8" />
                {/* Pavilion (bottom point) */}
                <polygon points="175,105 225,105 200,140" fill="#87ceeb" opacity="0.6" />
              </g>
              
              {/* Sparkles */}
              <g className="sparkles">
                <circle cx="160" cy="80" r="2" fill="white" className="sparkle-1" />
                <circle cx="240" cy="90" r="1.5" fill="white" className="sparkle-2" />
                <circle cx="200" cy="60" r="2" fill="white" className="sparkle-3" />
                <circle cx="175" cy="110" r="1" fill="white" className="sparkle-4" />
                <circle cx="225" cy="75" r="1.5" fill="white" className="sparkle-5" />
              </g>

              {/* Commodity Label */}
              <text x="200" y="270" textAnchor="middle" className="commodity-label" fill="rgba(176,224,230,0.8)" fontSize="24" fontWeight="300" letterSpacing="8">
                DIAMONDS
              </text>
            </svg>
          </div>
        )}
      </div>

      {/* Stage Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {STAGES.map((stage) => (
          <div
            key={stage}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentStage === stage ? 'bg-primary-400 w-6' : 'bg-metallic-700'
            }`}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        /* Copper Wire Draw Animation */
        .copper-wire-draw {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: drawCopper 3s ease-out forwards;
        }
        
        @keyframes drawCopper {
          0% { stroke-dashoffset: 600; }
          70% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        
        /* Gold Pour Animation */
        .gold-ladle {
          animation: ladleTilt 1s ease-out forwards;
        }
        
        @keyframes ladleTilt {
          0% { transform: rotate(0deg) translateY(-20px); opacity: 0; }
          50% { transform: rotate(0deg) translateY(0); opacity: 1; }
          100% { transform: rotate(15deg); transform-origin: 200px 40px; }
        }
        
        .gold-stream {
          stroke-dasharray: 150;
          stroke-dashoffset: 150;
          animation: pourGold 1.5s ease-in forwards 0.5s;
        }
        
        @keyframes pourGold {
          0% { stroke-dashoffset: 150; opacity: 0; }
          20% { opacity: 1; }
          100% { stroke-dashoffset: 0; }
        }
        
        .gold-fill {
          transform-origin: bottom;
          animation: fillMold 2s ease-out forwards 1s;
          transform: scaleY(0);
        }
        
        @keyframes fillMold {
          0% { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }
        
        .gold-shine {
          animation: goldShine 1s ease-in-out infinite 2.5s;
        }
        
        @keyframes goldShine {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        /* Lithium to Battery Animation */
        .lithium-particle {
          animation: convergeParticle 2s ease-out forwards;
          animation-delay: var(--delay);
          cx: var(--start-x);
          cy: var(--start-y);
        }
        
        @keyframes convergeParticle {
          0% { opacity: 1; }
          80% { opacity: 0.8; cx: 215px; cy: 140px; }
          100% { opacity: 0; cx: 215px; cy: 140px; }
        }
        
        .battery-appear {
          animation: fadeInBattery 1s ease-out forwards 1.5s;
          opacity: 0;
        }
        
        @keyframes fadeInBattery {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .battery-charge {
          animation: chargeUp 2s ease-out forwards 2s;
        }
        
        @keyframes chargeUp {
          0% { width: 0; }
          100% { width: 125px; }
        }
        
        .lightning-bolt {
          animation: boltFlash 0.5s ease-in-out infinite 3s;
          opacity: 0;
        }
        
        @keyframes boltFlash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        
        /* Silver Bar Animation */
        .silver-bar-emerge {
          animation: emergeBar 2s ease-out forwards;
          transform: translateY(50px);
          opacity: 0;
        }
        
        @keyframes emergeBar {
          0% { transform: translateY(50px) rotateX(30deg); opacity: 0; }
          100% { transform: translateY(0) rotateX(0deg); opacity: 1; }
        }
        
        .shine-sweep {
          animation: sweepShine 2s ease-in-out infinite 2s;
          transform: translateX(-100px);
        }
        
        @keyframes sweepShine {
          0% { transform: translateX(-100px); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateX(300px); opacity: 0; }
        }
        
        /* Diamond Ring Animation */
        .ring-appear {
          animation: ringFadeIn 1.5s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes ringFadeIn {
          0% { opacity: 0; transform: scale(0.8) rotateX(20deg); }
          100% { opacity: 1; transform: scale(1) rotateX(0deg); }
        }
        
        .diamond-set {
          animation: setDiamond 1s ease-out forwards 1s;
          opacity: 0;
          transform: translateY(-30px);
        }
        
        @keyframes setDiamond {
          0% { opacity: 0; transform: translateY(-30px) scale(1.2); }
          70% { transform: translateY(5px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .sparkle-1 { animation: sparkle 1.5s ease-in-out infinite 2s; }
        .sparkle-2 { animation: sparkle 1.5s ease-in-out infinite 2.2s; }
        .sparkle-3 { animation: sparkle 1.5s ease-in-out infinite 2.4s; }
        .sparkle-4 { animation: sparkle 1.5s ease-in-out infinite 2.6s; }
        .sparkle-5 { animation: sparkle 1.5s ease-in-out infinite 2.8s; }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        /* Commodity Label */
        .commodity-label {
          animation: labelFade 1s ease-out forwards 0.5s;
          opacity: 0;
        }
        
        @keyframes labelFade {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
