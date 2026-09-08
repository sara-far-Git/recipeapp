import { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { recipesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RecipeCard from "@/components/RecipeCard";
import {
  CategoriesPanel,
  HeroPanel,
  JoinPanel,
  RecipesPanelHeader,
  WhyPanel,
} from "@/components/HomePanels";
import { colors, spacing, fontSize, radius, fonts } from "@/lib/theme";

export default function FeedScreen() {
  const user = useAuth((s) => s.user);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (skip = 0) => {
    try {
      setError(null);
      const { data } = await recipesApi.list(skip);
      if (skip === 0) {
        setRecipes(data);
      } else {
        setRecipes((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 20);
    } catch (e: any) {
      setError(e?.message || "שגיאה בטעינת מתכונים");
    }
    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(0); };
  const onEndReached = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    load(recipes.length);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.fire[200]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        {/* The site keeps the shopping list one tap away in its header. */}
        {user && (
          <TouchableOpacity
            onPress={() => router.push("/shopping" as any)}
            style={{ marginRight: "auto", padding: 6 }}
            accessibilityLabel="רשימת קניות"
          >
            <Ionicons name="cart-outline" size={24} color={colors.bark[400]} />
          </TouchableOpacity>
        )}
        {!user && (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginBtnText}>כניסה</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => String(item.id)}
        /* The panels run edge to edge, so the list itself carries no padding
           — only the strip the recipe cards sit in does. */
        contentContainerStyle={recipes.length === 0 ? styles.listEmpty : undefined}
        ListHeaderComponent={
          <>
            <HeroPanel signedIn={Boolean(user)} />
            <CategoriesPanel />
            <RecipesPanelHeader />
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.cardStrip}>
            <RecipeCard recipe={item} />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.fire[200]}
            colors={[colors.fire[400]]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          <>
            {loadingMore && (
              <View style={{ backgroundColor: colors.panel.recipes, paddingVertical: 20 }}>
                <ActivityIndicator color={colors.onDark.display} />
              </View>
            )}
            {/* Closing the run the way the site does, rather than ending on a
                half-empty strip of cards. */}
            {recipes.length > 0 && (
              <>
                <View style={{ height: 24, backgroundColor: colors.panel.recipes }} />
                <WhyPanel />
                <JoinPanel signedIn={Boolean(user)} />
              </>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {error ? (
              <>
                <Text style={styles.emptyIcon}>⚠️</Text>
                <Text style={styles.emptyTitle}>שגיאת חיבור</Text>
                <Text style={styles.emptySubtitle}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
                  <Text style={styles.retryBtnText}>נסי שוב</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.emptyIcon}>🍽️</Text>
                <Text style={styles.emptyTitle}>ברוכים הבאים ל-RecipeApp</Text>
                <Text style={styles.emptySubtitle}>
                  שתפי מתכונים, גלי השראה, בישלי יחד
                </Text>
                {!user ? (
                  <View style={styles.authButtons}>
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => router.push("/register")}
                    >
                      <Text style={styles.primaryBtnText}>הצטרפי עכשיו</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={() => router.push("/login")}
                    >
                      <Text style={styles.secondaryBtnText}>כבר יש לי חשבון</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => router.push("/recipe/new")}
                  >
                    <Text style={styles.primaryBtnText}>+ הוסיפי מתכון ראשון</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg.primary },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.onDark.line,
  },
  /* The site's own mark. Its artwork is cream on transparent, so it reads
     against the dark bar without a plate behind it. */
  logo: { width: 96, height: 34 },
  loginBtn: {
    backgroundColor: colors.fire[400],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  loginBtnText: { color: colors.white, fontFamily: fonts.brandMedium, fontSize: fontSize.sm },
  cardStrip: { backgroundColor: colors.panel.recipes, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  listEmpty: { flexGrow: 1 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: spacing["3xl"],
  },
  emptyIcon: { fontSize: 64, marginBottom: spacing.lg },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.onDark.display,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.base,
    color: colors.smoke[300],
    textAlign: "center",
    marginBottom: spacing["3xl"],
    lineHeight: 22,
  },
  authButtons: { width: "100%", gap: spacing.md },
  primaryBtn: {
    backgroundColor: colors.fire[400],
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "center",
    width: "100%",
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: fontSize.lg,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.smoke[500],
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "center",
    width: "100%",
  },
  secondaryBtnText: {
    color: colors.smoke[200],
    fontWeight: "600",
    fontSize: fontSize.base,
  },
  retryBtn: {
    backgroundColor: colors.fire[400],
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  retryBtnText: { color: colors.white, fontWeight: "600" },
});
