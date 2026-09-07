import { useState } from "react";
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

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuth((s) => s.register);
  const [form, setForm] = useState({ username: "", email: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      await register(form);
      router.back();
    } catch (err: any) {
      setError(err.response?.data?.detail || "שגיאה בהרשמה");
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
              יצירת חשבון
            </ThemedText>
            <ThemedText variant="caption" center style={{ marginTop: 4 }}>
              הצטרפו לקהילת המתכונים
            </ThemedText>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          <Input
            label="שם מלא"
            value={form.full_name}
            onChangeText={update("full_name")}
            placeholder="השם שלך"
          />
          <Input
            label="שם משתמש"
            value={form.username}
            onChangeText={update("username")}
            placeholder="username"
            autoCapitalize="none"
            textAlign="left"
          />
          <Input
            label="אימייל"
            value={form.email}
            onChangeText={update("email")}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign="left"
          />
          <Input
            label="סיסמה"
            value={form.password}
            onChangeText={update("password")}
            placeholder="לפחות 8 תווים"
            secureTextEntry
            textAlign="left"
          />

          <Button title="הרשמה" onPress={handleRegister} loading={loading} size="lg" />

          <TouchableOpacity
            onPress={() => {
              router.back();
              setTimeout(() => router.push("/login" as any), 100);
            }}
            style={styles.linkRow}
          >
            <ThemedText variant="caption">כבר יש לך חשבון? </ThemedText>
            <ThemedText variant="caption" color={colors.primary[500]} bold>
              התחברות
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* Cream artwork on a light canvas, tinted to the ink colour. */
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
