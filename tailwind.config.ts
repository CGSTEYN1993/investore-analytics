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
        // Metallic silver from logo frame
        metallic: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
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
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
