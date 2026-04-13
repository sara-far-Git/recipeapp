import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { colors, spacing, fontSize, radius } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewTabRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) router.replace("/recipe/new" as any);
  }, [user, router]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.smoke[400]} />
          <Text style={styles.title}>נדרשת התחברות</Text>
          <Text style={styles.subtitle}>התחברו כדי ליצור מתכונים חדשים</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/login" as any)}>
            <Text style={styles.primaryBtnText}>התחברות</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  title: { fontSize: fontSize.xl, fontWeight: "700", color: colors.smoke[100], marginTop: 16, textAlign: "center" },
  subtitle: { fontSize: fontSize.base, color: colors.smoke[300], marginTop: 8, marginBottom: 32, textAlign: "center" },
  primaryBtn: {
    backgroundColor: colors.fire[400], paddingVertical: spacing.lg,
    borderRadius: radius.lg, alignItems: "center", width: 220,
  },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSize.base },
});
