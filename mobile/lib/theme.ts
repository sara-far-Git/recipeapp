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
/**
 * The site's palette, taken from the site as it actually looks.
 *
 * An earlier pass read these out of the tailwind config and picked the wrong
 * value for the ground: cream is the colour of a *card* there, while the page
 * itself is near-black forest green. The app was built as the site's inverse.
 * These names now mean what they mean on the site.
 *
 * The group names are the ones the screens already use, so changing how the
 * app looks did not mean renaming anything.
 */
export const colors = {
  bg: {
    /** The home screen and the nav bar: the site's near-black green. */
    primary: "#0C281F",
    /** A panel sitting on it. */
    secondary: "#132D23",
    /** Every inner screen. The site gives its product pages one warm sand
     *  canvas — four differently named tones that all resolve to this. */
    page: "#E3CFB2",
    /** The holiday planner, which the site keeps dark on purpose. */
    holiday: "#15382D",
    /** A card: cream, and what most text sits on. */
    card: "#F4EEDF",
    cardHover: "#FAF8F3",
  },
  // Terracotta — the accent, and the colour the big headings are set in
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
  // Bark — deep greens for text sitting on cream
  bark: {
    50: "#B7C4BE",
    100: "#8A9690",
    200: "#66736D",
    300: "#66736D",
    400: "#3D4A45",
    500: "#275E50",
    600: "#1E4D45",
    700: "#102B22",
  },
  surface: {
    100: "#FAF8F3",
    200: "#F4EEDF",
    300: "#E9EFEA",
    400: "#D5DED8",
    500: "#B7C4BE",
  },
  // Smoke — strongest text first, borders last
  smoke: {
    100: "#102B22",
    200: "#275E50",
    300: "#3D4A45",
    400: "#66736D",
    500: "#D5DED8",
    600: "#E9EFEA",
    700: "#F4EEDF",
  },
  /** Text sitting on the dark ground, rather than on a card. */
  onDark: {
    /** Headings — the salmon the site sets its display type in. */
    display: "#E8B4A0",
    /** Body copy on green. */
    body: "#D5E4D7",
    /** Quieter still. */
    muted: "#8FA79A",
    /** A hairline on green. */
    line: "rgba(213, 228, 215, 0.20)",
  },
  white: "#ffffff",
  black: "#000000",
  error: "#B3452B",
  success: "#2F6B5D",
  red: {
    50: "#FBEDE8",
    100: "#F6D9CE",
    500: "#C4553A",
    600: "#8F4330",
  },
  header: "#0C281F",
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
  green: {
    50: "#E9EFEA",
    100: "#D5DED8",
    400: "#2F6B5D",
    500: "#275E50",
    600: "#1E4D45",
  },
  // gray — light first, dark last: card tints at the low end, text at the high
  gray: {
    50: "#FAF8F3",
    100: "#F4EEDF",
    200: "#E9EFEA",
    300: "#D5DED8",
    400: "#66736D",
    500: "#66736D",
    600: "#3D4A45",
    700: "#275E50",
    800: "#1E4D45",
    900: "#102B22",
  },
};

/**
 * The site's own typefaces, bundled with the app.
 *
 * Baba sets the big headings, Unica everything else — the same division the
 * site makes between --font-display and --font-brand. IBM Plex Hebrew is the
 * site's third face but ships there as woff2, which React Native cannot load,
 * so Unica covers its work here.
 */
export const fonts = {
  display: "RecipeBaba",
  brand: "RecipeUnica",
  brandMedium: "RecipeUnicaMedium",
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
