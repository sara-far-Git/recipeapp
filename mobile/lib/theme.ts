/**
 * The site's palette, as the site actually uses it today.
 *
 * It moved to forest green on cream with a terracotta accent, and the phone
 * was still wearing the browns and oranges it had before — the two no longer
 * looked like the same product. The values here are copied from the site's
 * tailwind config rather than approximated, so a screen photographed side by
 * side with the website matches.
 *
 * The group names are the ones the screens already use, so nothing had to be
 * renamed to change how the app looks.
 */
export const colors = {
  bg: {
    primary: "#FAF8F3",
    secondary: "#F4EEDF",
    card: "#F7F2E6",
    cardHover: "#F4EEDF",
  },
  // Terracotta — buttons, active states, the accent throughout
  fire: {
    50: "#FBEDE8",
    100: "#F6D9CE",
    200: "#E39A80",
    300: "#D97757",
    400: "#C46244",
    500: "#B85A3E",
    600: "#8F4330",
  },
  cinnamon: {
    50: "#FBEDE8",
    100: "#F6D9CE",
    200: "#E39A80",
    300: "#D97757",
    400: "#C46244",
    500: "#D97757",
    600: "#B85A3E",
    700: "#8F4330",
  },
  // Bark — the deep greens that carry headings and body text
  bark: {
    50: "#B7C4BE",
    100: "#8A9690",
    200: "#66736D",
    300: "#66736D",
    400: "#3D4A45",
    500: "#275E50",
    600: "#1E4D45",
    700: "#1E4D45",
  },
  surface: {
    100: "#FAF8F3",
    200: "#F4EEDF",
    300: "#E9EFEA",
    400: "#D5DED8",
    500: "#B7C4BE",
  },
  // Smoke — dark first, light last, the order the screens already expect:
  // smoke[100] is the strongest text, smoke[500]/[600] are borders.
  smoke: {
    100: "#1E4D45",
    200: "#275E50",
    300: "#3D4A45",
    400: "#66736D",
    500: "#D5DED8",
    600: "#E9EFEA",
    700: "#F4EEDF",
  },
  white: "#ffffff",
  black: "#000000",
  error: "#B3452B",
  success: "#2F6B5D",
  red: {
    50: "#FBEDE8",
    100: "#F6D9CE",
    500: "#B3452B",
    600: "#8F4330",
  },
  // Header background — the site's deepest green
  header: "#1E4D45",
  // primary — the accent, aliased for screens that ask for it by this name
  primary: {
    50: "#FBEDE8",
    100: "#F6D9CE",
    200: "#E39A80",
    300: "#D97757",
    400: "#C46244",
    500: "#D97757",
    600: "#B85A3E",
    700: "#8F4330",
  },
  // Forest green — a step already done, and anything that means "good"
  green: {
    50: "#E9EFEA",
    100: "#D5DED8",
    400: "#2F6B5D",
    500: "#275E50",
    600: "#1E4D45",
  },
  // gray — light first, dark last: backgrounds at the low end, text at the high
  gray: {
    50: "#FAF8F3",
    100: "#F4EEDF",
    200: "#E9EFEA",
    300: "#D5DED8",
    /* Foreground, not a border: this is the placeholder text, the muted
       icons and the struck-through step. At #B7C4BE it sat at 1.6:1 on
       cream and could not be read at all. */
    400: "#66736D",
    500: "#66736D",
    600: "#3D4A45",
    700: "#275E50",
    800: "#1E4D45",
    900: "#173A34",
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

/* The site's own radii: --r-sm 0.45rem, --r-md 0.85rem, --r-lg 1.4rem. */
export const radius = {
  sm: 7,
  md: 14,
  lg: 22,
  xl: 26,
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
