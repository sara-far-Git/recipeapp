import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import Button from "@/components/Button";
import ThemedText from "@/components/ThemedText";
import { colors, spacing } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileTabRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace(`/profile/${user.username}` as any);
    }
  }, [user, router]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.center}>
          <Ionicons name="person-circle-outline" size={64} color={colors.gray[300]} />
          <ThemedText variant="heading" center style={{ marginTop: 16 }}>
            ברוכים הבאים
          </ThemedText>
          <ThemedText variant="caption" center style={{ marginTop: 8, marginBottom: 24 }}>
            התחברו כדי לראות את הפרופיל שלכם
          </ThemedText>
          <Button
            title="התחברות"
            onPress={() => router.push("/login" as any)}
            style={{ width: 200, marginBottom: 12 }}
          />
          <Button
            title="הרשמה"
            variant="secondary"
            onPress={() => router.push("/register" as any)}
            style={{ width: 200 }}
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
