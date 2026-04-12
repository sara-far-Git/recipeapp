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
        surface: {
          DEFAULT: "#1a1510",
          50: "#28201a",
          100: "#221b14",
          200: "#1a150f",
          300: "#14100a",
          400: "#0f0c08",
          500: "#0a0805",
        },
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
          300: "#d44030",
          400: "#b83020",
          500: "#a02818",
          600: "#801e12",
        },
        smoke: {
          100: "#d4cec6",
          200: "#a8a090",
          300: "#7a7268",
          400: "#5a5248",
          500: "#3a3430",
          600: "#2a2420",
        },
      },
      boxShadow: {
        glow: "0 0 24px rgba(200, 70, 30, 0.2)",
        "glow-lg": "0 0 48px rgba(200, 70, 30, 0.3)",
        "glow-sm": "0 0 12px rgba(200, 70, 30, 0.15)",
        card: "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
        inner: "inset 0 2px 6px rgba(0,0,0,0.3)",
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
          "0%, 100%": { boxShadow: "0 0 12px rgba(200,70,30,0.15)" },
          "50%": { boxShadow: "0 0 32px rgba(200,70,30,0.4)" },
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
