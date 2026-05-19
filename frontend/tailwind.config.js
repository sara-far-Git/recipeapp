/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Page/content backgrounds — warm parchment/cream
        surface: {
          DEFAULT: "#faf6f0",
          50: "#fdfaf7",
          100: "#faf6f0",
          200: "#f5ede0",
          300: "#ecddd0",
          400: "#e0cbb8",
          500: "#d4b8a0",
        },
        // Muted text — warm mid-tones (used in dark header and content)
        smoke: {
          100: "#d4cec6",
          200: "#b0a090",
          300: "#8a7868",
          400: "#6a5848",
          500: "#4a3830",
          600: "#322420",
        },
        // Espresso/bark — dark header bg, text, accents
        bark: {
          50: "#c4a882",
          100: "#a07c56",
          200: "#8b6040",
          300: "#6b4a2d",
          400: "#4d3018",
          500: "#3d2515",
          600: "#2c1a0e",
          700: "#1e1008",
        },
        // Warm amber/cinnamon — primary accent color
        cinnamon: {
          50: "#fef3e8",
          100: "#fde0c2",
          200: "#f5bf8a",
          300: "#e8965a",
          400: "#d47c3a",
          500: "#b86028",
          600: "#9a4d20",
          700: "#7a3a18",
        },
        // Keep fire for backward compat
        fire: {
          50: "#fef0ea",
          100: "#fdd5c7",
          200: "#f4a882",
          300: "#e8734a",
          400: "#d45a2a",
          500: "#b8401a",
          600: "#a03018",
          700: "#7a2412",
          800: "#551a0d",
          900: "#3a1008",
        },
        ember: {
          300: "#d44040",
          400: "#b83030",
          500: "#a02818",
          600: "#801e12",
        },
      },
      boxShadow: {
        warm: "0 2px 12px rgba(100, 60, 20, 0.08), 0 1px 3px rgba(100, 60, 20, 0.05)",
        "warm-md": "0 4px 20px rgba(100, 60, 20, 0.12), 0 2px 6px rgba(100, 60, 20, 0.07)",
        "warm-lg": "0 12px 40px rgba(100, 60, 20, 0.18), 0 4px 12px rgba(100, 60, 20, 0.1)",
        glow: "0 0 24px rgba(196, 133, 74, 0.35)",
        "glow-lg": "0 0 48px rgba(196, 133, 74, 0.45)",
        "glow-sm": "0 0 12px rgba(196, 133, 74, 0.25)",
        card: "0 2px 12px rgba(100, 60, 20, 0.08), 0 1px 3px rgba(100, 60, 20, 0.04)",
        inner: "inset 0 1px 4px rgba(100, 60, 20, 0.08)",
      },
      fontFamily: {
        sans: ["'Rubik'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["'Frank Ruhl Libre'", "Georgia", "serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(36px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(196, 133, 74, 0.2)" },
          "50%": { boxShadow: "0 0 32px rgba(196, 133, 74, 0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
