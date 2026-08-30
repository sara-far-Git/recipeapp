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
          50:  "#1e3a30",
          100: "#163028",
          200: "#13241e",
          300: "#0c1814",
          400: "#0a1411",
          500: "#07110e",
        },
        cream: {
          50:  "#f4f6f3",
          100: "#e8ebe7",
          200: "#c5cbc6",
          300: "#8a938c",
        },
        surface: {
          DEFAULT: "#13241e",
          50:  "#163028",
          100: "#1a332b",
          200: "#1e3a30",
          300: "#244038",
          400: "#2d4a40",
          500: "#3a5a4e",
        },
        bark: {
          50:  "#6b756e",
          100: "#8a938c",
          200: "#a8b0aa",
          300: "#c5cbc6",
          400: "#dce0dc",
          500: "#e8ebe7",
          600: "#f4f6f3",
          700: "#ffffff",
        },
        smoke: {
          100: "#d8ddd8",
          200: "#b4bbb4",
          300: "#8a938c",
          400: "#6b756e",
          500: "#4a524c",
          600: "#2a322e",
        },
        cinnamon: {
          50:  "rgba(232, 107, 36, 0.12)",
          100: "rgba(232, 107, 36, 0.22)",
          200: "#f09a5a",
          300: "#e86b24",
          400: "#d45518",
          500: "#e86b24",
          600: "#c44d14",
          700: "#8a360e",
        },
      },
      boxShadow: {
        "warm-lg": "0 16px 40px rgba(15, 31, 26, 0.22), 0 4px 12px rgba(15, 31, 26, 0.12)",
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
