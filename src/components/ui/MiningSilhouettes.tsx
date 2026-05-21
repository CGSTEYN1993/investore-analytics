/**
 * MiningSilhouettes — decorative SVG silhouettes used as low-opacity
 * background art on the marketing site. Pure stroke/fill via currentColor so
 * the caller controls tint (copper/gold/silver). Intentionally simplified —
 * they should read as silhouettes from across the room, not detailed art.
 */
import React from 'react';

type SvgProps = React.SVGProps<SVGSVGElement>;

/* Mine headframe (winder tower) — derived from a classic A-frame pithead. */
export function HeadframeSilhouette(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 200 320"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Diagonal support strut */}
      <polygon points="10,318 60,318 130,40 120,40" />
      {/* Main tower */}
      <polygon points="100,318 160,318 160,30 100,30" />
      {/* Tower lattice cross-bracing */}
      <g stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7">
        <line x1="100" y1="60" x2="160" y2="90" />
        <line x1="160" y1="60" x2="100" y2="90" />
        <line x1="100" y1="120" x2="160" y2="150" />
        <line x1="160" y1="120" x2="100" y2="150" />
        <line x1="100" y1="180" x2="160" y2="210" />
        <line x1="160" y1="180" x2="100" y2="210" />
        <line x1="100" y1="240" x2="160" y2="270" />
        <line x1="160" y1="240" x2="100" y2="270" />
      </g>
      {/* Winder sheave wheel */}
      <circle cx="130" cy="55" r="28" fill="none" stroke="currentColor" strokeWidth="6" />
      <circle cx="130" cy="55" r="4" />
      <g stroke="currentColor" strokeWidth="2">
        <line x1="130" y1="27" x2="130" y2="83" />
        <line x1="102" y1="55" x2="158" y2="55" />
        <line x1="110" y1="35" x2="150" y2="75" />
        <line x1="150" y1="35" x2="110" y2="75" />
      </g>
      {/* Hoist cable */}
      <line x1="130" y1="83" x2="130" y2="318" stroke="currentColor" strokeWidth="2" />
      {/* Antenna */}
      <line x1="160" y1="30" x2="160" y2="0" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* Dragline / bucket-wheel excavator silhouette at horizon. */
export function DraglineSilhouette(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 420 200"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Main body */}
      <polygon points="120,170 280,170 290,120 250,90 150,90 110,120" />
      {/* Cab on top */}
      <rect x="180" y="60" width="80" height="35" />
      {/* Mast / A-frame */}
      <polygon points="200,60 220,10 240,60" />
      {/* Long boom out to the right */}
      <polygon points="240,60 410,150 405,158 235,72" />
      {/* Bucket-wheel on left arm */}
      <polygon points="160,90 30,150 35,158 165,98" />
      <circle cx="35" cy="155" r="22" fill="none" stroke="currentColor" strokeWidth="4" />
      <g stroke="currentColor" strokeWidth="3">
        <line x1="35" y1="133" x2="35" y2="177" />
        <line x1="13" y1="155" x2="57" y2="155" />
        <line x1="20" y1="140" x2="50" y2="170" />
        <line x1="50" y1="140" x2="20" y2="170" />
      </g>
      {/* Crawler tracks */}
      <rect x="110" y="170" width="180" height="20" rx="4" />
      <circle cx="135" cy="190" r="8" />
      <circle cx="265" cy="190" r="8" />
      {/* Hoist cables */}
      <g stroke="currentColor" strokeWidth="1.5">
        <line x1="220" y1="10" x2="400" y2="148" />
        <line x1="220" y1="10" x2="40" y2="148" />
      </g>
    </svg>
  );
}

/* Stacked copper bars — perspective view of round rods. */
export function CopperBarsSilhouette(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Long horizontal bars */}
      <g>
        <rect x="10" y="40" width="300" height="14" rx="7" />
        <rect x="10" y="62" width="300" height="14" rx="7" />
        <rect x="10" y="84" width="300" height="14" rx="7" opacity="0.9" />
        <rect x="10" y="106" width="300" height="14" rx="7" opacity="0.85" />
        <rect x="10" y="128" width="300" height="14" rx="7" opacity="0.8" />
        <rect x="10" y="150" width="300" height="14" rx="7" opacity="0.75" />
      </g>
      {/* Foreground end-on rod circles */}
      <g opacity="0.95">
        <circle cx="20" cy="47" r="9" />
        <circle cx="20" cy="69" r="9" />
        <circle cx="20" cy="91" r="9" />
        <circle cx="20" cy="113" r="9" />
        <circle cx="20" cy="135" r="9" />
        <circle cx="20" cy="157" r="9" />
        <circle cx="38" cy="58" r="9" />
        <circle cx="38" cy="80" r="9" />
        <circle cx="38" cy="102" r="9" />
        <circle cx="38" cy="124" r="9" />
        <circle cx="38" cy="146" r="9" />
      </g>
    </svg>
  );
}

/* Molten pour from a ladle/crucible — used for "fiery" hot accent. */
export function OrePourSilhouette(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 260 280"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Crucible / ladle body (tilted) */}
      <path d="M30,40 L170,20 L200,90 L70,150 Z" />
      {/* Trunnion arm */}
      <rect x="180" y="50" width="60" height="10" rx="3" />
      <circle cx="240" cy="55" r="12" />
      {/* Pour stream */}
      <path d="M85,140 C 95,170 100,200 105,235 C 110,250 100,260 95,275 L 70,275 C 65,255 70,235 75,210 C 78,185 80,160 70,150 Z" />
      {/* Splash pool at base */}
      <ellipse cx="90" cy="270" rx="55" ry="10" />
      {/* Spark dots */}
      <g>
        <circle cx="135" cy="160" r="2.5" />
        <circle cx="150" cy="195" r="2" />
        <circle cx="40" cy="180" r="2" />
        <circle cx="160" cy="240" r="2.5" />
        <circle cx="30" cy="220" r="2" />
      </g>
    </svg>
  );
}

/* Mountain / open-pit horizon — useful as a low band at the bottom of hero. */
export function PitHorizonSilhouette(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 1600 200"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
      {...props}
    >
      <path d="M0,200 L0,140 L120,110 L260,150 L380,90 L520,130 L660,70 L820,120 L960,80 L1120,140 L1260,100 L1420,150 L1600,110 L1600,200 Z" />
      {/* Tiny headframe accent on the horizon */}
      <g transform="translate(880,40)">
        <polygon points="0,80 14,80 18,0 4,0" />
        <polygon points="6,80 22,80 22,-10 6,-10" />
        <circle cx="14" cy="-4" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
