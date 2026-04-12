import { Text, TextProps, StyleSheet } from "react-native";
import { colors, fontSize } from "@/lib/theme";

interface ThemedTextProps extends TextProps {
  variant?: "title" | "heading" | "body" | "caption" | "label";
  color?: string;
  bold?: boolean;
  center?: boolean;
}

export default function ThemedText({
  variant = "body",
  color,
  bold,
  center,
  style,
  ...props
}: ThemedTextProps) {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        bold && styles.bold,
        center && styles.center,
        color ? { color } : undefined,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: { color: colors.gray[900], writingDirection: "rtl" },
  bold: { fontWeight: "700" },
  center: { textAlign: "center" },
  title: { fontSize: fontSize["2xl"], fontWeight: "700" },
  heading: { fontSize: fontSize.lg, fontWeight: "700" },
  body: { fontSize: fontSize.base, lineHeight: 22 },
  caption: { fontSize: fontSize.sm, color: colors.gray[500] },
  label: { fontSize: fontSize.sm, fontWeight: "600", color: colors.gray[700] },
});
