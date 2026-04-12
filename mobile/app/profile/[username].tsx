import { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RecipeCard from "@/components/RecipeCard";
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

  const displayRecipes = activeTab === "saved" ? savedRecipes : recipes;

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
    backgroundColor: colors.white,
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
