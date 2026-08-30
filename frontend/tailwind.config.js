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
        forest: {
          50:  "#faf6f1",
          100: "#f3ebe3",
          200: "#ebe0d4",
          300: "#e4d6c8",
          400: "#d4c6b8",
          500: "#c4b4a4",
        },
        cream: {
          50:  "#faf6f1",
          100: "#f3ebe3",
          200: "#6b5a4e",
          300: "#4a3a30",
        },
        surface: {
          DEFAULT: "#efe6dc",
          50:  "#f7f1ea",
          100: "#efe6dc",
          200: "#e8ddd2",
          300: "#d9cdc0",
          400: "#c9bdb2",
          500: "#b8a99c",
        },
        bark: {
          50:  "#c9bdb2",
          100: "#9a8a7c",
          200: "#6b5a4e",
          300: "#4a3a30",
          400: "#3a2c24",
          500: "#2a1f1a",
          600: "#1a120e",
          700: "#100b08",
        },
        smoke: {
          100: "#e4d8cc",
          200: "#6b5a4e",
          300: "#4a3a30",
          400: "#3a2c24",
          500: "#2a1f1a",
          600: "#1a120e",
        },
        cinnamon: {
          50:  "rgba(107, 66, 38, 0.12)",
          100: "rgba(107, 66, 38, 0.22)",
          200: "#8a5a38",
          300: "#6b4226",
          400: "#533018",
          500: "#6b4226",
          600: "#4a2a14",
          700: "#3a2010",
        },
      },
      boxShadow: {
        "warm-lg": "0 16px 40px rgba(42, 31, 26, 0.10), 0 4px 12px rgba(42, 31, 26, 0.06)",
      },
      fontFamily: {
        sans: ["var(--font-heebo)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
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
