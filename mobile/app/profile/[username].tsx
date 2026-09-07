import { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RecipeCard from "@/components/RecipeCard";
import { CATEGORIES } from "@/lib/categories";
import Button from "@/components/Button";
import ThemedText from "@/components/ThemedText";
import { colors, spacing, radius } from "@/lib/theme";

export default function ProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { user: currentUser, logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"recipes" | "saved">("recipes");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwn = currentUser?.username === username;

  const load = useCallback(async () => {
    try {
      const { data: p } = await usersApi.getProfile(username!);
      setProfile(p);
      const { data: r } = await usersApi.getRecipes(username!);
      setRecipes(r);

      if (isOwn) {
        try {
          const { data: s } = await usersApi.getSaved(username!);
          setSavedRecipes(s);
        } catch {}
      }

      if (currentUser && !isOwn) {
        const { data: fg } = await usersApi.getFollowing(currentUser.username);
        setIsFollowing(fg.some((u: any) => u.username === username));
      }
    } catch {}
    setLoading(false);
  }, [username, currentUser, isOwn]);

  useEffect(() => { load(); }, [load]);

  const handleFollow = async () => {
    const { data } = await usersApi.toggleFollow(username!);
    setIsFollowing(data.following);
    setProfile((prev: any) => ({
      ...prev,
      followers_count: prev.followers_count + (data.following ? 1 : -1),
    }));
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/" as any);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <ThemedText variant="caption">משתמש לא נמצא</ThemedText>
      </View>
    );
  }

  const shownList = activeTab === "saved" ? savedRecipes : recipes;
  const displayRecipes = categoryFilter
    ? shownList.filter((r: any) => r.category === categoryFilter)
    : shownList;

  /* Only offer a category that something here is actually filed under —
     a filter that always empties the list is just a dead end. */
  const presentCategories = CATEGORIES.filter((name) =>
    shownList.some((r: any) => r.category === name),
  );

  const HeaderComponent = () => (
    <>
      {/* Back / Logout */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={22} color={colors.gray[600]} />
        </TouchableOpacity>
        {isOwn && (
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Profile info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarCircle}>
          {profile.avatar_url ? (
            <View />
          ) : (
            <Ionicons name="person" size={36} color={colors.primary[400]} />
          )}
        </View>

        <ThemedText variant="title" center>{profile.full_name || profile.username}</ThemedText>
        <ThemedText variant="caption" center>@{profile.username}</ThemedText>
        {profile.bio && (
          <ThemedText variant="body" center color={colors.gray[600]} style={{ marginTop: 8 }}>
            {profile.bio}
          </ThemedText>
        )}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <ThemedText bold>{profile.recipes_count}</ThemedText>
            <ThemedText variant="caption">מתכונים</ThemedText>
          </View>
          <View style={styles.stat}>
            <ThemedText bold>{profile.followers_count}</ThemedText>
            <ThemedText variant="caption">עוקבים</ThemedText>
          </View>
          <View style={styles.stat}>
            <ThemedText bold>{profile.following_count}</ThemedText>
            <ThemedText variant="caption">נעקבים</ThemedText>
          </View>
        </View>

        {currentUser && !isOwn && (
          <Button
            title={isFollowing ? "עוקב/ת" : "מעקב"}
            variant={isFollowing ? "secondary" : "primary"}
            size="sm"
            onPress={handleFollow}
            style={{ alignSelf: "center", marginTop: 12, width: 140 }}
          />
        )}
      </View>

      {/* The pages the site keeps in its header, which the tab bar has no
          room for. Only on your own profile — and ניהול only for whoever the
          server says runs the site. */}
      {isOwn && (
        <View style={styles.menu}>
          <MenuRow
            icon="sparkles-outline"
            label="תכנון חג"
            onPress={() => router.push("/holiday" as any)}
          />
          <MenuRow
            icon="cart-outline"
            label="רשימת קניות"
            onPress={() => router.push("/shopping" as any)}
          />
          {currentUser?.is_admin && (
            <MenuRow
              icon="stats-chart-outline"
              label="ניהול"
              onPress={() => router.push("/admin" as any)}
            />
          )}
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab("recipes")}
          style={[styles.tab, activeTab === "recipes" && styles.tabActive]}
        >
          <ThemedText
            variant="label"
            color={activeTab === "recipes" ? colors.primary[500] : colors.gray[500]}
          >
            המתכונים ({recipes.length})
          </ThemedText>
        </TouchableOpacity>
        {isOwn && (
          <TouchableOpacity
            onPress={() => setActiveTab("saved")}
            style={[styles.tab, activeTab === "saved" && styles.tabActive]}
          >
            <ThemedText
              variant="label"
              color={activeTab === "saved" ? colors.primary[500] : colors.gray[500]}
            >
              השמורים ({savedRecipes.length})
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {presentCategories.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            onPress={() => setCategoryFilter("")}
            style={[styles.filterChip, !categoryFilter && styles.filterChipActive]}
          >
            <ThemedText variant="caption" bold color={!categoryFilter ? colors.white : colors.gray[700]}>
              הכול
            </ThemedText>
          </TouchableOpacity>
          {presentCategories.map((name) => (
            <TouchableOpacity
              key={name}
              onPress={() => setCategoryFilter(categoryFilter === name ? "" : name)}
              style={[styles.filterChip, categoryFilter === name && styles.filterChipActive]}
            >
              <ThemedText
                variant="caption"
                bold
                color={categoryFilter === name ? colors.white : colors.gray[700]}
              >
                {name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={displayRecipes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        ListHeaderComponent={HeaderComponent}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <ThemedText variant="caption" center>
              {activeTab === "saved" ? "אין מתכונים שמורים" : "אין מתכונים עדיין"}
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuRow}>
      <Ionicons name={icon} size={19} color={colors.cinnamon[600]} />
      <ThemedText style={{ flex: 1 }}>{label}</ThemedText>
      <Ionicons name="chevron-back" size={17} color={colors.bark[100]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  profileSection: {
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.bg.card,
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.gray[100],
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row-reverse",
    gap: 32,
    marginTop: 16,
  },
  stat: { alignItems: "center" },
  menu: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: "rgba(39, 94, 80, 0.10)",
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39, 94, 80, 0.08)",
  },
  filterRow: { flexDirection: "row-reverse", gap: 8, paddingHorizontal: spacing.lg, paddingBottom: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.smoke[500],
    backgroundColor: colors.bg.card,
  },
  filterChipActive: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  tabsRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: colors.primary[500] },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  emptyList: { paddingTop: 60 },
});
