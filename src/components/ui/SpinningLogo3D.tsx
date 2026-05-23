'use client';

const LAYERS = 24;
const THICKNESS_PX = 16;

/**
 * Slowly rotating, thick metallic 3D rendition of the InvestOre Analytics
 * brand mark. Pure CSS 3D — stacks N copies of the PNG along the Z axis to
 * fake real depth, with a sweeping sheen for the metallic specular highlight.
 */
export default function SpinningLogo3D() {
  return (
    <div className="logo3d-stage">
      <div className="logo3d-coin">
        {Array.from({ length: LAYERS }).map((_, i) => {
          const ratio = i / (LAYERS - 1); // 0..1 (back → front)
          const z = (ratio - 0.5) * THICKNESS_PX;
          // edges (faces) full brightness; middle layers darker = rim shading
          const faceDist = Math.abs(ratio - 0.5) * 2; // 0 mid, 1 face
          const brightness = 0.45 + faceDist * 0.55;
          const isFront = i === LAYERS - 1;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src="/logo.png"
              alt={isFront ? 'InvestOre Analytics' : ''}
              aria-hidden={!isFront}
              draggable={false}
              className="logo3d-layer"
              style={{
                transform: `translateZ(${z.toFixed(2)}px)`,
                filter: `brightness(${brightness.toFixed(3)}) contrast(1.08) saturate(1.05)`,
              }}
            />
          );
        })}
        <div className="logo3d-sheen" aria-hidden />
      </div>
      <div className="logo3d-floor" aria-hidden />

      <style jsx>{`
        .logo3d-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          perspective: 1600px;
          perspective-origin: 50% 45%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo3d-coin {
          position: relative;
          width: clamp(300px, 96%, 620px);
          aspect-ratio: 3 / 2;
          transform-style: preserve-3d;
          animation: logo3d-spin 22s linear infinite;
          filter:
            drop-shadow(0 24px 36px rgba(0, 0, 0, 0.55))
            drop-shadow(0 0 36px rgba(184, 115, 51, 0.20));
        }
        .logo3d-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          user-select: none;
          -webkit-user-select: none;
          pointer-events: none;
        }
        .logo3d-sheen {
          position: absolute;
          inset: 0;
          transform: translateZ(${(THICKNESS_PX / 2 + 1).toFixed(2)}px);
          background: linear-gradient(
            115deg,
            transparent 30%,
            rgba(255, 241, 184, 0.22) 47%,
            rgba(255, 255, 255, 0.32) 50%,
            rgba(255, 209, 163, 0.22) 53%,
            transparent 70%
          );
          background-size: 300% 100%;
          mix-blend-mode: overlay;
          pointer-events: none;
          animation: logo3d-sheen 6s ease-in-out infinite;
        }
        .logo3d-floor {
          position: absolute;
          bottom: 0.25rem;
          left: 50%;
          width: 55%;
          height: 22px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, transparent 70%);
          filter: blur(10px);
          opacity: 0.85;
          pointer-events: none;
          animation: logo3d-floor 22s linear infinite;
        }

        @keyframes logo3d-spin {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(360deg); }
        }
        @keyframes logo3d-sheen {
          0%   { background-position: -150% 0; }
          100% { background-position:  150% 0; }
        }
        @keyframes logo3d-floor {
          0%, 100% { width: 55%; opacity: 0.85; }
          50%      { width: 28%; opacity: 0.50; }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo3d-coin,
          .logo3d-floor,
          .logo3d-sheen { animation: none; }
        }
      `}</style>
    </div>
  );
}
