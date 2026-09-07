/**
 * How the site is doing, for whoever runs it.
 *
 * Counts only — nobody's recipes, addresses or messages appear here. The
 * endpoint answers 404 rather than 403 to anyone not named in the server's
 * configuration, so this screen cannot be used to discover that an admin area
 * exists at all.
 */
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import ThemedText from "@/components/ThemedText";
import { colors, radius, spacing } from "@/lib/theme";

type Stats = {
  users: {
    total: number;
    new_today: number;
    new_this_week: number;
    new_this_month: number;
    seen_today: number;
    seen_this_week: number;
    seen_this_month: number;
    never_signed_in: number;
  };
  recipes: { total: number; published: number; new_this_week: number };
  images: { count: number; bytes: number; quota_bytes_per_user: number };
};

const mb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

export default function AdminScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "denied" | "error">("loading");

  useEffect(() => {
    if (!user) {
      setState("denied");
      return;
    }
    adminApi
      .stats()
      .then(({ data }) => {
        setStats(data);
        setState("ready");
      })
      .catch((err) => setState(err?.response?.status === 404 ? "denied" : "error"));
  }, [user]);

  const Frame = ({ children }: { children: React.ReactNode }) => (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="חזרה">
          <Ionicons name="arrow-forward" size={22} color={colors.bark[400]} />
        </TouchableOpacity>
      </View>
      {children}
    </SafeAreaView>
  );

  if (state === "loading") {
    return (
      <Frame>
        <ActivityIndicator size="large" color={colors.primary[500]} style={{ marginTop: 60 }} />
      </Frame>
    );
  }

  if (state === "denied") {
    return (
      <Frame>
        <View style={styles.body}>
          <ThemedText variant="title">הדף לא נמצא</ThemedText>
          <ThemedText variant="caption" style={{ marginTop: 10, lineHeight: 20 }}>
            אם זה הדף שלך, ההגדרה ADMIN_EMAILS בשרת צריכה להכיל בדיוק את הכתובת
            שאיתה נכנסת:
          </ThemedText>
          {user?.email && (
            <View style={styles.emailBox}>
              <ThemedText bold style={{ writingDirection: "ltr" }}>
                {user.email}
              </ThemedText>
            </View>
          )}
        </View>
      </Frame>
    );
  }

  if (state === "error" || !stats) {
    return (
      <Frame>
        <View style={styles.body}>
          <ThemedText variant="title">לא הצלחנו לטעון</ThemedText>
          <ThemedText variant="caption" style={{ marginTop: 10 }}>
            ייתכן שהשרת עדיין מתעורר. נסי לרענן בעוד רגע.
          </ThemedText>
        </View>
      </Frame>
    );
  }

  const u = stats.users;

  return (
    <Frame>
      <ScrollView contentContainerStyle={styles.body}>
        <ThemedText variant="caption" bold color={colors.cinnamon[600]}>
          מאחורי הקלעים
        </ThemedText>
        <ThemedText variant="title" style={{ marginTop: 4, marginBottom: 22 }}>
          מספרי האתר
        </ThemedText>

        <Section icon="people-outline" title="אנשים">
          <Figure n={u.total} label="נרשמו בסך הכול" />
          <Figure n={u.seen_today} label="נכנסו היום" />
          <Figure n={u.seen_this_week} label="נכנסו השבוע" />
          <Figure n={u.seen_this_month} label="נכנסו החודש" />
          <Figure n={u.new_this_week} label="נרשמו השבוע" />
          <Figure n={u.never_signed_in} label="נרשמו ולא נכנסו" />
        </Section>

        <ThemedText variant="caption" style={styles.note}>
          כניסות נרשמות רק מהרגע שהתכונה הזאת עלתה לאוויר, אז מי שנכנס לפני כן
          ייספר כאן רק בכניסה הבאה שלו.
        </ThemedText>

        <Section icon="book-outline" title="מתכונים">
          <Figure n={stats.recipes.total} label="בסך הכול" />
          <Figure n={stats.recipes.published} label="מפורסמים" />
          <Figure n={stats.recipes.new_this_week} label="נוספו השבוע" />
        </Section>

        <Section icon="image-outline" title="תמונות">
          <Figure n={stats.images.count} label="תמונות שמורות" />
          <Figure text={`${mb(stats.images.bytes)}MB`} label="נפח שתופסות" />
          <Figure text={`${mb(stats.images.quota_bytes_per_user)}MB`} label="מכסה למשתמש" />
        </Section>
      </ScrollView>
    </Frame>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 26 }}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={16} color={colors.cinnamon[600]} />
        <ThemedText variant="heading">{title}</ThemedText>
      </View>
      <View style={styles.grid}>{children}</View>
    </View>
  );
}

function Figure({ n, text, label }: { n?: number; text?: string; label: string }) {
  return (
    <View style={styles.figure}>
      <ThemedText variant="title" color={colors.cinnamon[600]}>
        {text ?? n?.toLocaleString("he-IL")}
      </ThemedText>
      <ThemedText variant="caption" style={{ marginTop: 4 }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  topBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  body: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  sectionHead: { flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 12 },
  grid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 12 },
  figure: {
    flexGrow: 1,
    flexBasis: "45%",
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: "rgba(39, 94, 80, 0.10)",
  },
  note: { marginBottom: 26, lineHeight: 19 },
  emailBox: {
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: "rgba(39, 94, 80, 0.10)",
  },
});
