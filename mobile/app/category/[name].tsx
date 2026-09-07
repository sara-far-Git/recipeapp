/**
 * One category's recipes, with the rest of the collection underneath.
 *
 * An empty category is a dead end unless it offers a way on, so when there is
 * nothing here it says so and lists the other categories — the same as the
 * website does.
 */
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { searchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RecipeCard from "@/components/RecipeCard";
import ThemedText from "@/components/ThemedText";
import Masthead from "@/components/Masthead";
import { CATEGORIES, CATEGORY_DESC } from "@/lib/categories";
import { colors, radius, spacing } from "@/lib/theme";

export default function CategoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { name: raw } = useLocalSearchParams<{ name: string }>();

  /* The name arrives decoded on some routes and percent-encoded on others. */
  const name = CATEGORIES.some((c) => c === raw)
    ? String(raw)
    : (() => {
        try {
          return decodeURIComponent(String(raw));
        } catch {
          return String(raw);
        }
      })();

  const others = CATEGORIES.filter((c) => c !== name);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    searchApi
      .search({ category: name, limit: 100 })
      .then((res) => alive && setRecipes(res.data || []))
      .catch(() => alive && setRecipes([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [name]);

  const Header = () => (
    <View style={{ paddingBottom: 6 }}>
      <Masthead
        eyebrow="קטגוריה"
        title={name}
        lead={CATEGORY_DESC[name] || "מתכונים לפי סוג מנה"}
      />
      {!loading && (
        <ThemedText variant="caption" style={{ marginTop: 8, marginBottom: 12 }}>
          {recipes.length === 0 ? "עדיין אין מתכונים כאן" : `${recipes.length} מתכונים`}
        </ThemedText>
      )}
    </View>
  );

  const MoreCategories = () => (
    <View style={{ marginTop: 22 }}>
      <ThemedText variant="caption" bold color={colors.bark[200]} style={{ marginBottom: 10 }}>
        עוד באוסף
      </ThemedText>
      {others.map((cat, i) => (
        <TouchableOpacity
          key={cat}
          onPress={() => router.push(`/category/${encodeURIComponent(cat)}` as any)}
          style={styles.otherRow}
        >
          <ThemedText variant="caption" color={colors.bark[100]}>
            {String(i + 1).padStart(2, "0")}
          </ThemedText>
          <ThemedText variant="heading" style={{ flex: 1 }}>
            {cat}
          </ThemedText>
          <Ionicons name="chevron-back" size={18} color={colors.bark[100]} />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center" }]} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="חזרה">
          <Ionicons name="arrow-forward" size={22} color={colors.bark[400]} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={Header}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText variant="heading">הפרק הזה עדיין ריק</ThemedText>
            <ThemedText variant="caption" style={{ marginTop: 8, marginBottom: 16, lineHeight: 20 }}>
              אפשר להתחיל במתכון ראשון, או לעבור לקטגוריה אחרת.
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push((user ? "/recipe/new" : "/login") as any)}
              style={styles.cta}
            >
              <ThemedText bold color={colors.white}>
                {user ? "כותבים מתכון" : "נכנסים כדי לכתוב"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={MoreCategories}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.page },
  topBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  empty: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: "rgba(39, 94, 80, 0.10)",
  },
  cta: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    height: 46,
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.primary[500],
  },
  otherRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39, 94, 80, 0.12)",
  },
});
