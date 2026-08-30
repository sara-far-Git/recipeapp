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
        // ─── Vintage cookbook palette ───────────────────
        surface: {
          DEFAULT: "#efe7d7",
          50:  "#f7f1e4",
          100: "#f5efe2",
          200: "#efe7d7",
          300: "#e8dcc4",
          400: "#d9c79a",
          500: "#b39965",
        },
        bark: {
          50:  "#b8a385",
          100: "#8a6f55",
          200: "#7d5f44",
          300: "#5a3e2a",
          400: "#4a3024",
          500: "#3a2618",
          600: "#2c1c10",
          700: "#1e1208",
        },
        smoke: {
          100: "#d4c8b6",
          200: "#b8a385",
          300: "#8a6f55",
          400: "#6b5240",
          500: "#4a3830",
          600: "#322420",
        },
        cinnamon: {
          50:  "#fce8e0",
          100: "#f5d5c0",
          200: "#e5a47e",
          300: "#c47a52",
          400: "#a85a36",
          500: "#8b3a1f",
          600: "#732d18",
          700: "#5a2412",
        },
      },
      boxShadow: {
        "warm-lg": "0 16px 40px rgba(58, 38, 24, 0.14), 0 4px 12px rgba(58, 38, 24, 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-assistant)", "var(--font-heebo)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      animation: {
        "fade-up":   "fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up":  "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in":  "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float":     "float 6s ease-in-out infinite",
        "spin-slow": "spin 26s linear infinite",
      },
      keyframes: {
        fadeUp:   { "0%": { opacity: "0", transform: "translateY(24px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideUp:  { "0%": { opacity: "0", transform: "translateY(40px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        scaleIn:  { "0%": { opacity: "0", transform: "scale(0.92)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        float:    { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-10px)" } },
      },
    },
  },
  plugins: [],
};
