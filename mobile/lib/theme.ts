export const colors = {
  bg: {
    primary: "#faf6f0",
    secondary: "#f5ede0",
    card: "#ffffff",
    cardHover: "#fdfaf7",
  },
  // Cinnamon / warm orange accents (buttons, active states)
  fire: {
    50: "#fef3e8",
    100: "#fde0c2",
    200: "#d47c3a",   // logo/accent orange
    300: "#c06828",
    400: "#b86028",   // primary buttons
    500: "#9a4d20",
    600: "#7a3a18",
  },
  // Cinnamon alias (same palette)
  cinnamon: {
    50: "#fef3e8",
    100: "#fde0c2",
    200: "#f5bf8a",
    300: "#e8965a",
    400: "#d47c3a",
    500: "#b86028",
    600: "#9a4d20",
  },
  // Bark — warm browns for headings/body text
  bark: {
    50: "#c4a882",
    100: "#a07c56",
    200: "#8b6040",
    300: "#6b4a2d",
    400: "#4d3018",
    500: "#3d2515",
    600: "#2c1a0e",
  },
  // Surface — cream tones for backgrounds
  surface: {
    100: "#faf6f0",
    200: "#f5ede0",
    300: "#ecddd0",
    400: "#e0cbb8",
    500: "#d4b8a0",
  },
  // Smoke — mapped so existing screens work on LIGHT background:
  // old dark theme: smoke[100]=white text, smoke[600]=dark border
  // new light theme: smoke[100]=dark text, smoke[600]=light border
  smoke: {
    100: "#2c1a0e",   // was near-white → now dark espresso (primary text)
    200: "#4d3018",   // was light gray → now warm dark brown (secondary text)
    300: "#6b4a2d",   // muted text
    400: "#9a8070",   // placeholder/hint text
    500: "#e0cbb8",   // was dark border → now light warm border
    600: "#ecddd0",   // was near-black → now cream border (dividers)
    700: "#f5ede0",   // very light surface
  },
  white: "#ffffff",
  black: "#000000",
  error: "#ef4444",
  success: "#22c55e",
  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    500: "#ef4444",
    600: "#dc2626",
  },
  // Header background (dark espresso, kept for contrast)
  header: "#2c1a0e",
  // primary alias for fire/cinnamon
  primary: {
    50: "#fef3e8",
    100: "#fde0c2",
    200: "#f5bf8a",
    300: "#e8965a",
    400: "#d47c3a",
    500: "#b86028",
    600: "#9a4d20",
    700: "#7a3a18",
  },
  gray: {
    50: "#faf6f0",
    100: "#f5ede0",
    200: "#ecddd0",
    300: "#e0cbb8",
    400: "#d4b8a0",
    500: "#a07c56",
    600: "#6b4a2d",
    700: "#3d2515",
    800: "#2c1a0e",
    900: "#1e1008",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
};
