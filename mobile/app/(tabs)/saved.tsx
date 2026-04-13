import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RecipeCard from "@/components/RecipeCard";
import { colors, spacing, fontSize } from "@/lib/theme";

export default function SavedScreen() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await usersApi.getSaved(user.username);
      setRecipes(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.fire[200]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>השמורים שלי</Text>
      </View>
      <FlatList
        data={recipes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.fire[200]}
            colors={[colors.fire[400]]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={styles.emptyText}>אין מתכונים שמורים עדיין</Text>
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
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: colors.smoke[600],
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: "700", color: colors.smoke[100] },
  list: { padding: spacing.lg, gap: spacing.md },
  empty: { paddingTop: 100, alignItems: "center" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: fontSize.base, color: colors.smoke[300], textAlign: "center" },
});
