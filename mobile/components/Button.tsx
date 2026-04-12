import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import ThemedText from "./ThemedText";
import { colors, radius, spacing } from "@/lib/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  style,
  icon,
}: ButtonProps) {
  const variantStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: { backgroundColor: colors.primary[500] },
      text: { color: colors.white },
    },
    secondary: {
      container: { backgroundColor: colors.gray[100] },
      text: { color: colors.gray[900] },
    },
    ghost: {
      container: { backgroundColor: "transparent" },
      text: { color: colors.gray[700] },
    },
  };

  const sizeStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    sm: { container: { paddingVertical: 8, paddingHorizontal: 14 }, text: { fontSize: 13 } },
    md: { container: { paddingVertical: 12, paddingHorizontal: 20 }, text: { fontSize: 15 } },
    lg: { container: { paddingVertical: 16, paddingHorizontal: 24 }, text: { fontSize: 16 } },
  };

  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.container,
        v.container,
        s.container,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.white : colors.gray[500]} />
      ) : (
        <>
          {icon}
          <ThemedText style={[s.text, v.text, styles.text, icon ? { marginRight: 8 } : undefined]}>
            {title}
          </ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  text: { fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
