import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // InvestOre brand colors - derived from logo
        primary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",  // Teal from logo diamonds
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        // Deep blue from logo diamonds
        diamond: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Copper/ore accent from logo text
        accent: {
          50: "#fdf4e7",
          100: "#fbe8cf",
          200: "#f5c896",
          300: "#efa75d",
          400: "#e88c33",
          500: "#d97706",  // Copper/amber
          600: "#b45309",
          700: "#92400e",
          800: "#78350f",
          900: "#451a03",
          gold: "#D4AF37",
          copper: "#B87333",
          bronze: "#CD7F32",
        },
        // Neutral grey scale — dark grey / light grey / white
        // (true neutral, no blue cast)
        metallic: {
          50:  "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        // Commodity colors for charts
        mining: {
          gold: "#FFD700",
          copper: "#B87333",
          lithium: "#93C572",
          silver: "#C0C0C0",
          zinc: "#7D7D7D",
          nickel: "#727472",
          cobalt: "#0047AB",
          uranium: "#4CBB17",
          iron: "#A52A2A",
          coal: "#36454F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "metal-gold":
          "linear-gradient(110deg,#7a5a12 0%,#d4af37 22%,#fff1b8 48%,#d4af37 72%,#7a5a12 100%)",
        "metal-copper":
          "linear-gradient(110deg,#5e2c0d 0%,#b87333 22%,#ffd1a3 48%,#b87333 72%,#5e2c0d 100%)",
        "metal-silver":
          "linear-gradient(110deg,#475569 0%,#cbd5e1 22%,#ffffff 48%,#cbd5e1 72%,#475569 100%)",
        "ore-soft":
          "radial-gradient(60% 50% at 30% 20%,rgba(184,115,51,0.12) 0%,transparent 60%),radial-gradient(50% 40% at 80% 10%,rgba(212,175,55,0.10) 0%,transparent 70%)",
      },
      boxShadow: {
        "metal-gold": "0 1px 0 0 rgba(255,241,184,0.35) inset, 0 8px 24px -8px rgba(212,175,55,0.35)",
        "metal-copper": "0 1px 0 0 rgba(255,209,163,0.30) inset, 0 8px 24px -8px rgba(184,115,51,0.40)",
        "metal-silver": "0 1px 0 0 rgba(255,255,255,0.35) inset, 0 8px 24px -10px rgba(148,163,184,0.40)",
        "ring-copper": "0 0 0 1px rgba(184,115,51,0.45), 0 0 32px -8px rgba(184,115,51,0.45)",
      },
      keyframes: {
        sheen: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "btn-glint": {
          "0%": { transform: "translateX(-120%) skewX(-18deg)" },
          "100%": { transform: "translateX(220%) skewX(-18deg)" },
        },
      },
      animation: {
        sheen: "sheen 8s linear infinite",
        "sheen-fast": "sheen 4.5s linear infinite",
        "btn-glint": "btn-glint 1.1s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
