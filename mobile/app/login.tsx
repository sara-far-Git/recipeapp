import { useState } from "react";
import { errorText } from "@/lib/api";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ThemedText from "@/components/ThemedText";
import { colors, spacing, radius } from "@/lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.back();
    } catch (err: any) {
      setError(errorText(err, "שגיאה בהתחברות"));
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.gray[500]} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Image source={require("../assets/logo.png")} style={styles.mark} resizeMode="contain" />
            <ThemedText variant="title" center style={{ marginTop: 12 }}>
              ברוכים הבאים
            </ThemedText>
            <ThemedText variant="caption" center style={{ marginTop: 4 }}>
              התחברו כדי לשתף מתכונים
            </ThemedText>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          <Input
            label="אימייל"
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign="left"
          />

          <Input
            label="סיסמה"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            textAlign="left"
          />

          <Button title="התחברות" onPress={handleLogin} loading={loading} size="lg" />

          <TouchableOpacity
            onPress={() => {
              router.back();
              setTimeout(() => router.push("/register" as any), 100);
            }}
            style={styles.linkRow}
          >
            <ThemedText variant="caption">אין לך חשבון? </ThemedText>
            <ThemedText variant="caption" color={colors.primary[500]} bold>
              הרשמה
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* The artwork is cream, drawn for the dark header. On the sand canvas it
     would be all but invisible, so it is tinted to the ink colour — the
     shape is one solid colour on transparent, which is exactly what
     tintColor can recolour cleanly. */
  mark: {
    width: 132,
    height: 46,
    alignSelf: "center",
    marginBottom: 6,
    tintColor: colors.smoke[100],
  },
  container: { flex: 1, backgroundColor: colors.bg.page },
  scroll: { padding: spacing["2xl"], paddingTop: spacing.lg },
  closeBtn: { alignSelf: "flex-start", padding: 4, marginBottom: 8 },
  header: { alignItems: "center", marginBottom: spacing["3xl"] },
  errorBox: {
    backgroundColor: colors.red[50],
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.red[500], fontSize: 13, textAlign: "center" },
  linkRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    marginTop: spacing.xl,
    gap: 4,
  },
});
