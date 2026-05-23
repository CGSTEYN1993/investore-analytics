'use client';

import Image from 'next/image';

/**
 * Slowly rotating 3D coin of the InvestOre Analytics mark.
 * Pure CSS 3D (no three.js dependency).
 */
export default function SpinningLogo3D() {
  return (
    <div className="logo3d-stage">
      <div className="logo3d-coin">
        <div className="logo3d-face logo3d-front">
          <Image
            src="/logo.png"
            alt="InvestOre Analytics"
            fill
            sizes="(max-width: 768px) 60vw, 360px"
            className="object-contain select-none"
            priority
          />
        </div>
        <div className="logo3d-face logo3d-back" aria-hidden>
          <Image
            src="/logo.png"
            alt=""
            fill
            sizes="(max-width: 768px) 60vw, 360px"
            className="object-contain select-none"
          />
        </div>
        {/* rim highlights for fake bevel */}
        <span className="logo3d-rim" aria-hidden />
      </div>
      {/* floor reflection */}
      <div className="logo3d-floor" aria-hidden />

      <style jsx>{`
        .logo3d-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 11;
          perspective: 1400px;
          perspective-origin: 50% 45%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem 2.5rem;
        }
        .logo3d-coin {
          position: relative;
          width: clamp(200px, 42%, 320px);
          aspect-ratio: 1 / 1;
          transform-style: preserve-3d;
          animation: logo3d-spin 20s linear infinite;
          filter:
            drop-shadow(0 14px 20px rgba(0, 0, 0, 0.55))
            drop-shadow(0 0 28px rgba(184, 115, 51, 0.18));
        }
        .logo3d-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .logo3d-front { transform: rotateY(0deg) translateZ(0.01px); }
        .logo3d-back  { transform: rotateY(180deg) translateZ(0.01px); }

        .logo3d-rim {
          position: absolute;
          inset: -2%;
          border-radius: 14%;
          background:
            radial-gradient(60% 60% at 50% 30%, rgba(212, 175, 55, 0.18), transparent 65%),
            radial-gradient(60% 60% at 50% 75%, rgba(184, 115, 51, 0.15), transparent 65%);
          pointer-events: none;
          mix-blend-mode: screen;
        }

        .logo3d-floor {
          position: absolute;
          bottom: 0.5rem;
          left: 50%;
          width: 60%;
          height: 14px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.55) 0%, transparent 70%);
          filter: blur(6px);
          opacity: 0.85;
          pointer-events: none;
          animation: logo3d-floor 20s linear infinite;
        }

        @keyframes logo3d-spin {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(360deg); }
        }
        @keyframes logo3d-floor {
          0%, 100% { width: 60%; opacity: 0.85; }
          50%      { width: 35%; opacity: 0.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo3d-coin { animation: none; }
          .logo3d-floor { animation: none; }
        }
      `}</style>
    </div>
  );
}
