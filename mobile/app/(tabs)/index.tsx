import { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { recipesApi } from "@/lib/api";
import RecipeCard from "@/components/RecipeCard";
import ThemedText from "@/components/ThemedText";
import { colors, spacing } from "@/lib/theme";

export default function FeedScreen() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (skip = 0, isRefresh = false) => {
    try {
      const { data } = await recipesApi.list(skip);
      if (skip === 0) {
        setRecipes(data);
      } else {
        setRecipes((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 20);
    } catch {}
    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(0, true);
  };

  const onEndReached = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    load(recipes.length);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <ThemedText variant="title">RecipeApp</ThemedText>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ padding: 20 }} color={colors.primary[500]} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText variant="body" color={colors.gray[400]} center>
              עדיין אין מתכונים
            </ThemedText>
            <ThemedText variant="caption" center>
              היו הראשונים לשתף מתכון!
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  list: { padding: spacing.lg },
  empty: { paddingTop: 100, alignItems: "center" },
});
