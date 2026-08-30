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
          50:  "#FAF8F3",
          100: "#F4EEDF",
          200: "#E9EFEA",
          300: "#E9EFEA",
          400: "#2F6B5D",
          500: "#1E4D45",
        },
        cream: {
          50:  "#FAF8F3",
          100: "#F4EEDF",
          200: "#66736D",
          300: "#1F2A26",
        },
        surface: {
          DEFAULT: "#F4EEDF",
          50:  "#FAF8F3",
          100: "#F4EEDF",
          200: "#E9EFEA",
          300: "#E9EFEA",
          400: "#D5DED8",
          500: "#B7C4BE",
        },
        bark: {
          50:  "#B7C4BE",
          100: "#8A9690",
          200: "#66736D",
          300: "#66736D",
          400: "#3D4A45",
          500: "#1F2A26",
          600: "#1E4D45",
          700: "#1E4D45",
        },
        smoke: {
          100: "#E9EFEA",
          200: "#66736D",
          300: "#66736D",
          400: "#3D4A45",
          500: "#1F2A26",
          600: "#1E4D45",
        },
        cinnamon: {
          50:  "rgba(217, 119, 87, 0.12)",
          100: "rgba(217, 119, 87, 0.22)",
          200: "#E39A80",
          300: "#D97757",
          400: "#C46244",
          500: "#D97757",
          600: "#B85A3E",
          700: "#8F4330",
        },
      },
      boxShadow: {
        "warm-lg": "0 16px 40px rgba(31, 42, 38, 0.10), 0 4px 12px rgba(31, 42, 38, 0.06)",
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
