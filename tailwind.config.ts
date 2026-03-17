import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#020B17",
          900: "#040D1A",
          800: "#071428",
          700: "#0D1F3C",
          600: "#132D56",
        },
        cobalt: {
          600: "#1149A3",
          500: "#1565C0",
          400: "#1976D2",
          300: "#42A5F5",
        },
        cyan: {
          glow: "#26C6DA",
          soft: "#80DEEA",
        },
        ice: {
          100: "#E8F0FF",
          200: "#C5D3F0",
          300: "#9DB0DC",
        },
      },
      fontFamily: {
        mono: ["'Share Tech Mono'", "monospace"],
        sans: ["'IBM Plex Sans'", "sans-serif"],
      },
      animation: {
        shake: "shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both",
        "pulse-glow": "pulseGlow 1.2s ease-in-out 2",
        "fade-in-up": "fadeInUp 0.5s ease-out both",
        "scan": "scan 8s linear infinite",
        "flicker": "flicker 0.15s infinite",
        "blink": "blink 1s step-end infinite",
        "slide-in": "slideIn 0.3s ease-out both",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "15%, 45%, 75%": { transform: "translateX(-6px)" },
          "30%, 60%, 90%": { transform: "translateX(6px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(38,198,218,0.3)" },
          "50%": { boxShadow: "0 0 60px rgba(38,198,218,0.9), 0 0 120px rgba(38,198,218,0.4)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      boxShadow: {
        "glow-sm": "0 0 12px rgba(38,198,218,0.35)",
        "glow-md": "0 0 24px rgba(38,198,218,0.45)",
        "glow-lg": "0 0 48px rgba(38,198,218,0.5)",
        "card": "0 4px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(21,101,192,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(21,101,192,0.07) 1px, transparent 1px)",
        "radial-glow": "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(21,101,192,0.25) 0%, transparent 70%)",
      },
      backgroundSize: {
        "grid": "48px 48px",
      },
    },
  },
  plugins: [],
};

export default config;
