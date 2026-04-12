import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import Button from "@/components/Button";
import ThemedText from "@/components/ThemedText";
import { colors, spacing } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewTabRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    router.replace("/recipe/new" as any);
  }, [user, router]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.gray[300]} />
          <ThemedText variant="heading" center style={{ marginTop: 16 }}>
            נדרשת התחברות
          </ThemedText>
          <ThemedText variant="caption" center style={{ marginTop: 8 }}>
            התחברו כדי ליצור מתכונים חדשים
          </ThemedText>
          <Button
            title="התחברות"
            onPress={() => router.push("/login" as any)}
            style={{ marginTop: 24, width: 200 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
});
