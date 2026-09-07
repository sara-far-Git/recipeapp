/**
 * The dark slab the site's inner pages open with.
 *
 * On a sand canvas it does the work a page title alone cannot: it says which
 * part of the book you are in before any of the content loads.
 */
import { View, StyleSheet } from "react-native";
import ThemedText from "@/components/ThemedText";
import { colors, radius, spacing } from "@/lib/theme";

export default function Masthead({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <View style={styles.slab}>
      <ThemedText variant="eyebrow" onDark>
        {eyebrow}
      </ThemedText>
      <ThemedText variant="display" onDark style={styles.title}>
        {title}
      </ThemedText>
      {lead ? (
        <ThemedText variant="body" onDark style={styles.lead}>
          {lead}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  slab: {
    backgroundColor: colors.bg.holiday,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: { marginTop: 6, fontSize: 34, lineHeight: 38 },
  lead: { marginTop: 10, opacity: 0.85 },
});
