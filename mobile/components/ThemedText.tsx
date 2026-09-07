import { Text, TextProps, StyleSheet } from "react-native";
import { colors, fonts, fontSize } from "@/lib/theme";

interface ThemedTextProps extends TextProps {
  variant?: "display" | "title" | "heading" | "body" | "caption" | "label" | "eyebrow";
  color?: string;
  bold?: boolean;
  center?: boolean;
  /** Sitting on the dark ground rather than on a cream card. */
  onDark?: boolean;
}

export default function ThemedText({
  variant = "body",
  color,
  bold,
  center,
  onDark,
  style,
  ...props
}: ThemedTextProps) {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        onDark && (onDarkStyles[variant] || onDarkStyles.body),
        bold && styles.bold,
        center && styles.center,
        color ? { color } : undefined,
        style,
      ]}
      {...props}
    />
  );
}

/* The site's own division: Baba carries the big headings, Unica everything
   else. Weight is chosen by picking the face, not by asking for bold — an
   OTF loaded under one name has one weight, and asking for 700 on top of it
   makes the system synthesise a smeared bold. */
const styles = StyleSheet.create({
  base: {
    color: colors.smoke[100],
    fontFamily: fonts.brand,
    writingDirection: "rtl",
  },
  bold: { fontFamily: fonts.brandMedium },
  center: { textAlign: "center" },

  display: { fontFamily: fonts.display, fontSize: 42, lineHeight: 46, letterSpacing: 0 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 31 },
  heading: { fontFamily: fonts.brandMedium, fontSize: fontSize.lg },
  body: { fontSize: fontSize.base, lineHeight: 23 },
  /* Deep enough to read on the sand canvas, which is darker than a cream
     card — the lighter grey managed 3.3:1 there. */
  caption: { fontSize: fontSize.sm, color: colors.bark[400] },
  label: { fontFamily: fonts.brandMedium, fontSize: fontSize.sm, color: colors.bark[400] },
  eyebrow: {
    fontFamily: fonts.brandMedium,
    fontSize: fontSize.xs,
    letterSpacing: 1.2,
    color: colors.cinnamon[500],
  },
});

/* On green, the same roles take the colours the site gives them there. */
const onDarkStyles = StyleSheet.create({
  display: { color: colors.onDark.display },
  title: { color: colors.onDark.display },
  heading: { color: colors.onDark.body },
  body: { color: colors.onDark.body },
  caption: { color: colors.onDark.muted },
  label: { color: colors.onDark.muted },
  eyebrow: { color: colors.onDark.display },
});
