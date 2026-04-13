import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { colors, spacing, fontSize, radius } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileTabRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) router.replace(`/profile/${user.username}` as any);
  }, [user, router]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.center}>
          <Ionicons name="person-circle-outline" size={80} color={colors.smoke[400]} />
          <Text style={styles.title}>ברוכים הבאים</Text>
          <Text style={styles.subtitle}>התחברו כדי לראות את הפרופיל שלכם</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/login" as any)}>
            <Text style={styles.primaryBtnText}>התחברות</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push("/register" as any)}>
            <Text style={styles.secondaryBtnText}>הרשמה</Text>
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
    borderRadius: radius.lg, alignItems: "center", width: 220, marginBottom: spacing.md,
  },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSize.base },
  secondaryBtn: {
    borderWidth: 1, borderColor: colors.smoke[500], paddingVertical: spacing.lg,
    borderRadius: radius.lg, alignItems: "center", width: 220,
  },
  secondaryBtnText: { color: colors.smoke[200], fontWeight: "600", fontSize: fontSize.base },
});
