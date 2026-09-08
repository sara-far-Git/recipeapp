/**
 * The four meals of Rosh Hashanah, and what has been chosen for each.
 *
 * The plan itself lives on the device; the only thing that leaves it is the
 * shopping list, and only when asked for.
 */
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { shoppingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import ThemedText from "@/components/ThemedText";
import { colors, radius, spacing } from "@/lib/theme";
import {
  HOLIDAY_COURSES,
  HOLIDAY_MEALS,
  allPickedRecipes,
  emptyPlan,
  loadHolidayPlan,
  mealPickCount,
  mealPicks,
  type HolidayPlan,
} from "@/lib/holidayPlan";

const LIST_NAME = "קניות לראש השנה";

export default function HolidayScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [plan, setPlan] = useState<HolidayPlan>(emptyPlan());
  const [shopping, setShopping] = useState(false);

  /* Re-read on every visit: the meal screen writes the plan, and coming back
     to a stale summary would show choices that were already made. */
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadHolidayPlan().then((p) => alive && setPlan(p));
      return () => {
        alive = false;
      };
    }, []),
  );

  const picked = useMemo(() => allPickedRecipes(plan), [plan]);

  const sendToShopping = async () => {
    if (!user) {
      router.push("/login" as any);
      return;
    }
    if (picked.length === 0 || shopping) return;
    setShopping(true);
    try {
      const { data: lists } = await shoppingApi.list();
      /* Reuse the holiday's own list rather than piling the whole festival
         onto whatever was already on the everyday one. */
      const existing = lists.find((l: { name?: string }) => l.name === LIST_NAME);
      const list = existing || (await shoppingApi.create(LIST_NAME)).data;
      for (const recipe of picked) {
        await shoppingApi.addRecipe(list.id, recipe.id, 1);
      }
      router.push("/shopping" as any);
    } catch {
      Alert.alert("לא הצלחנו לבנות את הרשימה", "נסי שוב בעוד רגע.");
    }
    setShopping(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="חזרה">
          <Ionicons name="arrow-forward" size={22} color={colors.onDark.body} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <ThemedText variant="eyebrow" onDark>
          ראש השנה
        </ThemedText>
        <ThemedText variant="display" onDark style={{ marginTop: 6 }}>
          ארבע סעודות
        </ThemedText>
        <ThemedText variant="body" onDark style={styles.lead}>
          שתיים בלילה, שתיים ביום. נכנסים לסעודה, בוחרים מנה אחת מכל סוג, ואז
          אוספים קניות לכל השולחנות.
        </ThemedText>

        {(["night", "day"] as const).map((when) => (
          <View key={when} style={{ marginTop: 26 }}>
            <ThemedText variant="eyebrow" onDark>
              {when === "night" ? "לילה" : "יום"}
            </ThemedText>
            {HOLIDAY_MEALS.filter((m) => m.when === when).map((meal, i) => {
              const count = mealPickCount(plan, meal.id);
              const titles = mealPicks(plan, meal.id).map((p) => p.title);
              const num = String(when === "night" ? i + 1 : i + 3).padStart(2, "0");
              return (
                <TouchableOpacity
                  key={meal.id}
                  onPress={() => router.push(`/holiday/${meal.id}` as any)}
                  style={styles.row}
                >
                  <ThemedText variant="title" onDark style={{ fontSize: 22, opacity: 0.5 }}>
                    {num}
                  </ThemedText>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="heading" onDark>{meal.name}</ThemedText>
                    <ThemedText variant="caption" onDark numberOfLines={2}>
                      {titles.length === 0 ? "השולחן עדיין ריק" : titles.join(" · ")}
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption" bold color={colors.cinnamon[300]}>
                    {count}/{HOLIDAY_COURSES.length}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <View style={styles.shop}>
          <ThemedText variant="heading">קניות לכל החג</ThemedText>
          <ThemedText variant="caption" style={{ marginTop: 4, marginBottom: 14 }}>
            {picked.length === 0
              ? "אחרי שבוחרים מנות, כל המצרכים מתאספים לרשימה אחת."
              : `${picked.length} מתכונים מוכנים לרשימה.`}
          </ThemedText>
          <TouchableOpacity
            onPress={sendToShopping}
            disabled={picked.length === 0 || shopping}
            style={[styles.shopBtn, (picked.length === 0 || shopping) && styles.shopBtnOff]}
          >
            {shopping ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="cart-outline" size={18} color={colors.white} />
                <ThemedText bold color={colors.white}>
                  רשימת קניות
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.holiday },
  topBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  body: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  lead: { marginTop: 8, lineHeight: 22 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.onDark.line,
  },
  shop: {
    marginTop: 30,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: "rgba(39, 94, 80, 0.10)",
  },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: radius.full,
    backgroundColor: colors.primary[500],
  },
  shopBtnOff: { opacity: 0.45 },
});
