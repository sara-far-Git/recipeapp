import { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { recipesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RecipeCard from "@/components/RecipeCard";
import { colors, spacing, fontSize, radius } from "@/lib/theme";

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
        <Text style={styles.logo}>🍳 RecipeApp</Text>
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
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        contentContainerStyle={[
          styles.list,
          recipes.length === 0 && styles.listEmpty,
        ]}
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
          loadingMore ? (
            <ActivityIndicator style={{ padding: 20 }} color={colors.fire[200]} />
          ) : null
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
    borderBottomWidth: 0.5,
    borderBottomColor: colors.smoke[600],
  },
  logo: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.fire[200],
  },
  loginBtn: {
    backgroundColor: colors.fire[400],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  loginBtnText: { color: colors.white, fontWeight: "600", fontSize: fontSize.sm },
  list: { padding: spacing.lg, gap: spacing.md },
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
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.smoke[100],
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
