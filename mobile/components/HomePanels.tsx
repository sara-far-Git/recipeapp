/**
 * The home page's panels, as the site runs them.
 *
 * The site's home is not a list — it is a run of full-bleed panels that
 * alternate green and terracotta, each with one job. They scroll vertically
 * on a phone there, and they do here too; only the horizontal entrances are
 * left out, since a phone's own gesture is the vertical one.
 */
import { useEffect, useState } from "react";
import { Image, Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "@/components/ThemedText";
import { imageUri } from "@/lib/api";
import { CATEGORIES, CATEGORY_PHOTO } from "@/lib/categories";
import { colors, fonts, radius, spacing } from "@/lib/theme";

/** Where the book lives, for anyone you hand it to. */
const SITE_URL = "https://recipespace.co.il";

/* The four the site cycles through, in its order and its words. */
const SCENES = [
  { title: "מה נכין\nהיום?", prompt: "ספרי מה יש לך במטבח, למה יש לך חשק, או כמה זמן יש לך." },
  { title: "למתי את צריכה\nאת זה?", prompt: "ארוחת ערב בעוד שעה, או משהו שנשאר טרי עד שבת." },
  { title: "מה יש לך\nבמקרר?", prompt: "מצרך אחד מספיק. נמצא מה אפשר להכין ממנו כבר היום." },
  { title: "וזה נשאר\nאצלך", prompt: "כל מתכון ששמרת מחכה במקום אחד, גם בעוד שנה." },
];

const SCENE_MS = 7500;

const REASONS = [
  { t: "כל המתכונים במקום אחד", d: "בלי צילומי מסך, פתקים והודעות שנעלמות בדיוק כשצריך אותן." },
  { t: "חיפוש שמגיע מהר", d: "שם, קטגוריה, זמן, רמת קושי או מצרך — ומוצאים מה מתאים להיום." },
  { t: "רשימת קניות מתוך מתכון", d: "בוחרים מה חסר, מוסיפים לרשימה, ויוצאים לקנות מסודר." },
  { t: "מצב הכנה נוח", d: "המצרכים והשלבים נשארים ברורים בזמן הבישול, גם על מסך קטן." },
  { t: "הספר הולך איתכם", d: "שומרים מתכון פעם אחת וחוזרים אליו מהטלפון או מהמחשב." },
  { t: "קהילה שמבשלת באמת", d: "דירוגים, תגובות ורעיונות מאנשים שניסו, תיקנו וחזרו להכין." },
];

/** The opening panel: the headline changes on its own, as it does on the site. */
export function HeroPanel({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setScene((s) => (s + 1) % SCENES.length), SCENE_MS);
    return () => clearInterval(id);
  }, []);

  const current = SCENES[scene];

  return (
    <View style={[styles.panel, { backgroundColor: colors.panel.hero, paddingTop: 40 }]}>
      <ThemedText variant="display" onDark center style={styles.heroTitle}>
        {scene === 0 && signedIn ? "מה בא לך\nלבשל היום?" : current.title}
      </ThemedText>
      <ThemedText variant="body" onDark center style={styles.heroPrompt}>
        {current.prompt}
      </ThemedText>

      {/* Tapping it opens the search screen, which is where the typing
          belongs — the panel is an invitation, not a second search field. */}
      <TouchableOpacity
        onPress={() => router.push("/search" as any)}
        style={styles.composer}
        accessibilityRole="button"
        accessibilityLabel="חיפוש מתכון"
      >
        <Ionicons name="search" size={20} color={colors.bark[300]} />
        <ThemedText variant="body" style={{ flex: 1, color: colors.bark[300] }}>
          משהו מתוק ומהיר…
        </ThemedText>
        <View style={styles.composerBtn}>
          <Ionicons name="arrow-up" size={18} color={colors.white} />
        </View>
      </TouchableOpacity>

      <View style={styles.chips}>
        {["ארוחה ב-20 דקות", "יש לי עוף וירקות", "משהו מתוק לשבת"].map((q) => (
          <TouchableOpacity
            key={q}
            onPress={() => router.push(`/search?q=${encodeURIComponent(q)}` as any)}
            style={styles.chip}
          >
            <ThemedText variant="caption" onDark>
              {q}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/** Terracotta, with the site's own dish photographs and its numbering. */
export function CategoriesPanel() {
  const router = useRouter();
  return (
    <View style={[styles.panel, { backgroundColor: colors.panel.categories }]}>
      <ThemedText variant="display" style={{ color: colors.surface[100] }}>
        {"מה מבשלים\nהיום?"}
      </ThemedText>
      <ThemedText variant="body" style={styles.panelLead}>
        בחרו סוג מנה, קפצו ישר למתכונים, ותנו לרעב להחליט את השאר.
      </ThemedText>

      <View style={styles.tiles}>
        {CATEGORIES.map((name, i) => (
          <TouchableOpacity
            key={name}
            onPress={() => router.push(`/category/${encodeURIComponent(name)}` as any)}
            style={styles.tile}
          >
            <Image source={CATEGORY_PHOTO[name]} style={styles.tilePhoto} resizeMode="cover" />
            <ThemedText style={styles.tileNum}>{String(i + 1).padStart(2, "0")}</ThemedText>
            <ThemedText variant="heading" style={{ color: colors.bark[700] }}>
              {name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/** The heading above the recipes, which sit on the mid-green panel. */
export function RecipesPanelHeader() {
  return (
    <View style={[styles.panelFlush, { backgroundColor: colors.panel.recipes }]}>
      <ThemedText variant="display" onDark>
        {"מתכונים\nמהאוסף"}
      </ThemedText>
      <ThemedText variant="body" onDark style={{ marginTop: 10, opacity: 0.85 }}>
        רעיונות טובים לפתוח, לשמור או לשלוח לרשימת הקניות.
      </ThemedText>
    </View>
  );
}

/**
 * One recipe held up for the week — the newest, as the site picks it.
 *
 * A round photograph with the day of the week on it, and the name beside it.
 */
export function WeeklyPanel({ recipe }: { recipe: any }) {
  const router = useRouter();
  const [weekday, setWeekday] = useState("");

  useEffect(() => {
    /* Read on the device, not built in — otherwise it says Sunday forever. */
    setWeekday(new Date().toLocaleDateString("he-IL", { weekday: "long" }));
  }, []);

  if (!recipe) return null;

  return (
    <View style={[styles.panel, { backgroundColor: colors.panel.weekly, alignItems: "center" }]}>
      <TouchableOpacity
        onPress={() => router.push(`/recipe/${recipe.id}` as any)}
        style={styles.weeklyPhotoWrap}
        accessibilityRole="button"
        accessibilityLabel={`פתיחת ${recipe.title}`}
      >
        <Image
          source={recipe.image_url ? { uri: imageUri(recipe.image_url) } : CATEGORY_PHOTO["קינוחים"]}
          style={styles.weeklyPhoto}
          resizeMode="cover"
        />
        {weekday ? (
          <View style={styles.weekdayBadge}>
            <ThemedText variant="caption" bold style={{ color: colors.surface[100] }}>
              {weekday}
            </ThemedText>
          </View>
        ) : null}
      </TouchableOpacity>

      <ThemedText variant="eyebrow" style={{ color: colors.bark[700], marginTop: 22 }}>
        המתכון של השבוע
      </ThemedText>
      <ThemedText variant="display" center style={styles.weeklyTitle}>
        {recipe.title}
      </ThemedText>
      {recipe.description ? (
        <ThemedText variant="body" center numberOfLines={4} style={styles.weeklyDesc}>
          {recipe.description}
        </ThemedText>
      ) : null}
      <TouchableOpacity
        onPress={() => router.push(`/recipe/${recipe.id}` as any)}
        style={styles.weeklyBtn}
      >
        <ThemedText bold style={{ color: colors.bark[700] }}>
          פותחים את המתכון
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

/** Dark green, and the site's numbered reasons. */
export function WhyPanel() {
  return (
    <View style={[styles.panel, { backgroundColor: colors.panel.why }]}>
      <ThemedText variant="display" onDark>
        למה לשמור כאן?
      </ThemedText>
      <ThemedText variant="body" onDark style={{ marginTop: 10, marginBottom: 18, opacity: 0.85 }}>
        כי מתכון טוב לא צריך ללכת לאיבוד בין צילומי מסך, הודעות וקבצים ישנים.
      </ThemedText>

      {REASONS.map((r, i) => (
        <View key={r.t} style={styles.reason}>
          <ThemedText style={styles.reasonNum}>{String(i + 1).padStart(2, "0")}</ThemedText>
          <View style={{ flex: 1 }}>
            <ThemedText variant="heading" onDark>
              {r.t}
            </ThemedText>
            <ThemedText variant="caption" onDark style={{ marginTop: 3 }}>
              {r.d}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

/** The closing invitation. */
export function JoinPanel({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  return (
    <View style={[styles.panel, { backgroundColor: colors.panel.join, alignItems: "center" }]}>
      <ThemedText variant="eyebrow" style={{ color: colors.bark[700] }}>
        הספר שלך
      </ThemedText>
      <ThemedText variant="display" center style={styles.joinTitle}>
        {"יש מתכון\nששווה לשמור?"}
      </ThemedText>
      <ThemedText variant="body" center style={styles.joinLead}>
        כותבים פעם אחת — והוא נשאר מסודר, ברור ומוכן לבישול הבא.
      </ThemedText>
      <TouchableOpacity
        onPress={() => router.push((signedIn ? "/recipe/new" : "/register") as any)}
        style={styles.joinBtn}
      >
        <ThemedText bold style={{ color: colors.surface[100] }}>
          {signedIn ? "שומרים מתכון" : "פותחים ספר מתכונים"}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

/**
 * The closing footer, as the site has it.
 *
 * Without the site's install button: that button exists to get the app onto
 * a phone, and everyone reading this is already on one.
 */
export function FooterPanel() {
  return (
    <View style={[styles.panel, { backgroundColor: colors.bg.primary, alignItems: "center" }]}>
      <Image
        source={require("../assets/logo.png")}
        style={styles.footerMark}
        resizeMode="contain"
      />
      <ThemedText variant="body" onDark center style={styles.footerBlurb}>
        ספר המתכונים — המקום שבו המתכונים של הבית נשמרים, נמצאים, וחוזרים
        לשולחן.
      </ThemedText>

      <View style={styles.footerLinks}>
        <TouchableOpacity onPress={() => Linking.openURL(`${SITE_URL}/privacy`)}>
          <ThemedText variant="caption" bold onDark>
            מדיניות פרטיות
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(`${SITE_URL}/terms`)}>
          <ThemedText variant="caption" bold onDark>
            תנאי שימוש
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(`${SITE_URL}/accessibility`)}>
          <ThemedText variant="caption" bold onDark>
            נגישות
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedText variant="caption" onDark style={{ marginTop: 22, opacity: 0.7 }}>
        © 2026 ספר המתכונים — כל הזכויות שמורות
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Full-bleed: the panels run edge to edge, so their own padding is the
     only inset. */
  panel: { paddingHorizontal: spacing.lg, paddingVertical: 36 },
  panelFlush: { paddingHorizontal: spacing.lg, paddingTop: 36, paddingBottom: 20 },

  heroTitle: { fontSize: 46, lineHeight: 50 },
  heroPrompt: { marginTop: 14, opacity: 0.9, lineHeight: 22 },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 16,
    height: 58,
    borderRadius: radius.full,
    backgroundColor: colors.bg.card,
  },
  composerBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cinnamon[300],
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.onDark.line,
  },

  panelLead: { marginTop: 10, marginBottom: 20, color: colors.bark[700], opacity: 0.9 },
  tiles: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  tile: { width: "48%", alignItems: "center", marginBottom: 22 },
  tilePhoto: { width: 96, height: 96, borderRadius: radius.full, marginBottom: 8 },
  /* Terracotta on the terracotta panel disappears — the site sets everything
     in this panel to the dark green instead. */
  tileNum: { fontFamily: fonts.display, fontSize: 26, color: colors.bark[700], lineHeight: 28 },

  reason: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.onDark.line,
  },
  reasonNum: { fontFamily: fonts.display, fontSize: 22, color: colors.cinnamon[300], lineHeight: 26 },

  weeklyPhotoWrap: { width: 208, height: 208 },
  weeklyPhoto: {
    width: 208,
    height: 208,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(250, 248, 243, 0.25)",
  },
  weekdayBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.cinnamon[300],
  },
  weeklyTitle: { color: colors.surface[100], fontSize: 34, lineHeight: 38, marginTop: 8 },
  weeklyDesc: { color: colors.bark[700], marginTop: 12, opacity: 0.9 },
  weeklyBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    height: 48,
    justifyContent: "center",
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.bark[700],
  },

  footerMark: { width: 118, height: 42, marginBottom: 14 },
  footerBlurb: { opacity: 0.85, maxWidth: 320 },
  footerLinks: { flexDirection: "row", gap: 22, marginTop: 16 },

  joinTitle: { color: colors.bark[700], fontSize: 38, lineHeight: 42, marginTop: 8 },
  joinLead: { color: colors.bark[700], marginTop: 12, opacity: 0.9 },
  joinBtn: {
    marginTop: 22,
    paddingHorizontal: 28,
    height: 52,
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.bark[700],
  },
});
