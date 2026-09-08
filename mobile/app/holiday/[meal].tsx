/**
 * One meal: pick a single dish for each course.
 *
 * Options come from a search per course — by category where the site's plan
 * names one, by free text for the fish course, which is not a category of its
 * own. Tapping the dish already chosen clears it, so a course can be left out.
 */
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { imageUri, searchApi } from "@/lib/api";
import ThemedText from "@/components/ThemedText";
import { colors, radius, spacing } from "@/lib/theme";
import {
  HOLIDAY_COURSES,
  emptyPlan,
  getMeal,
  loadHolidayPlan,
  mealPickCount,
  saveHolidayPlan,
  toPick,
  type HolidayPlan,
} from "@/lib/holidayPlan";

const OPTIONS = 4;

export default function HolidayMealScreen() {
  const router = useRouter();
  const { meal: mealParam } = useLocalSearchParams<{ meal: string }>();
  const meal = getMeal(String(mealParam || ""));

  const [plan, setPlan] = useState<HolidayPlan | null>(null);
  const [options, setOptions] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHolidayPlan().then(setPlan);
  }, []);

  useEffect(() => {
    if (!meal) return;
    let cancelled = false;
    setLoading(true);
    Promise.all(
      HOLIDAY_COURSES.map(async (course) => {
        try {
          const seen = new Set<number>();
          const rows: any[] = [];
          const searches = course.queries?.length
            ? course.queries.map((q) => searchApi.search({ q, limit: 20 }))
            : [searchApi.search({ category: course.category, limit: 20 })];
          const results = await Promise.all(searches);
          for (const res of results) {
            for (const recipe of res.data || []) {
              if (seen.has(recipe.id)) continue;
              seen.add(recipe.id);
              rows.push(recipe);
              if (rows.length >= OPTIONS) break;
            }
            if (rows.length >= OPTIONS) break;
          }
          return [course.id, rows] as const;
        } catch {
          return [course.id, []] as const;
        }
      }),
    ).then((rows) => {
      if (cancelled) return;
      setOptions(Object.fromEntries(rows));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [meal?.id]);

  const choose = (courseId: string, recipe: any) => {
    if (!plan || !meal) return;
    const current = plan.picks[meal.id]?.[courseId];
    const next: HolidayPlan = {
      picks: {
        ...plan.picks,
        [meal.id]: {
          ...plan.picks[meal.id],
          // Tapping the chosen dish again takes it off the table.
          [courseId]: current?.id === recipe.id ? null : toPick(recipe),
        },
      },
    };
    setPlan(next);
    saveHolidayPlan(next);
  };

  if (!meal) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.body}>
          <ThemedText variant="body" onDark>הסעודה הזאת לא קיימת.</ThemedText>
          <TouchableOpacity onPress={() => router.replace("/holiday" as any)} style={{ marginTop: 14 }}>
            <ThemedText bold color={colors.cinnamon[600]}>
              חזרה לראש השנה
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filled = plan ? mealPickCount(plan, meal.id) : 0;

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
          {meal.name}
        </ThemedText>
        <ThemedText variant="caption" onDark style={{ marginTop: 8 }}>
          {meal.when === "night" ? "סעודת לילה" : "סעודת יום"}
          {plan ? ` · ${filled} מתוך ${HOLIDAY_COURSES.length}` : ""}
        </ThemedText>

        {loading || !plan ? (
          <ActivityIndicator size="large" color={colors.primary[500]} style={{ marginTop: 60 }} />
        ) : (
          HOLIDAY_COURSES.map((course, index) => {
            const recipes = options[course.id] || [];
            const selectedId = plan.picks[meal.id]?.[course.id]?.id;
            return (
              <View key={course.id} style={{ marginTop: 26 }}>
                <View style={styles.courseHead}>
                  <ThemedText variant="title" onDark style={{ fontSize: 20, opacity: 0.5 }}>
                    {String(index + 1).padStart(2, "0")}
                  </ThemedText>
                  <ThemedText variant="heading" onDark>{course.name}</ThemedText>
                </View>

                {recipes.length === 0 ? (
                  <ThemedText variant="caption" onDark style={{ marginTop: 8 }}>
                    עוד אין כאן מתכונים. אפשר להוסיף מהספר ואז לבחור.
                  </ThemedText>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                    {recipes.map((recipe) => {
                      const selected = selectedId === recipe.id;
                      return (
                        <TouchableOpacity
                          key={recipe.id}
                          onPress={() => choose(course.id, recipe)}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          style={[styles.choice, selected && styles.choiceOn]}
                        >
                          <View style={styles.photo}>
                            {recipe.image_url ? (
                              <Image
                                source={{ uri: imageUri(recipe.image_url) }}
                                style={{ width: "100%", height: "100%" }}
                              />
                            ) : (
                              <ThemedText variant="title" color={colors.bark[50]}>
                                {recipe.title.slice(0, 1)}
                              </ThemedText>
                            )}
                            {selected && (
                              <View style={styles.tick}>
                                <Ionicons name="checkmark" size={14} color={colors.white} />
                              </View>
                            )}
                          </View>
                          <ThemedText variant="caption" bold numberOfLines={2} style={styles.choiceTitle}>
                            {recipe.title}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.holiday },
  topBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  body: { paddingHorizontal: spacing.lg, paddingBottom: 44 },
  courseHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  choice: {
    width: 132,
    marginLeft: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(39, 94, 80, 0.12)",
    backgroundColor: colors.bg.card,
    overflow: "hidden",
  },
  choiceOn: { borderColor: colors.primary[500], borderWidth: 2 },
  photo: {
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface[200],
  },
  tick: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[500],
  },
  choiceTitle: { padding: 10, textAlign: "auto" },
});
