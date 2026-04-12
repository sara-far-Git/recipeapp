import { View, TextInput, TextInputProps, StyleSheet } from "react-native";
import ThemedText from "./ThemedText";
import { colors, radius, spacing, fontSize } from "@/lib/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label && <ThemedText variant="label" style={styles.label}>{label}</ThemedText>}
      <TextInput
        placeholderTextColor={colors.gray[400]}
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        {...props}
      />
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.gray[900],
    backgroundColor: colors.white,
    textAlign: "right",
    writingDirection: "rtl",
  },
  inputError: { borderColor: colors.red[500] },
  error: { color: colors.red[500], fontSize: fontSize.xs, marginTop: 4 },
});
