import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "./ThemedText";
import { colors, radius, spacing, fontSize } from "@/lib/theme";
import { recipesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

const difficultyLabels: Record<string, string> = { easy: "קל", medium: "בינוני", hard: "מאתגר" };
const kosherLabels: Record<string, string> = { meat: "בשרי", dairy: "חלבי", pareve: "פרווה", non_kosher: "לא כשר" };

interface Props {
  recipe: any;
}

export default function RecipeCard({ recipe }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [liked, setLiked] = useState(recipe.is_liked);
  const [likesCount, setLikesCount] = useState(recipe.likes_count);
  const [saved, setSaved] = useState(recipe.is_saved);

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  const handleLike = async () => {
    if (!user) { router.push("/login" as any); return; }
    const { data } = await recipesApi.toggleLike(recipe.id);
    setLiked(data.liked);
    setLikesCount(data.likes_count);
  };

  const handleSave = async () => {
    if (!user) { router.push("/login" as any); return; }
    const { data } = await recipesApi.toggleSave(recipe.id);
    setSaved(data.saved);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/recipe/${recipe.id}` as any)}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        {recipe.image_url ? (
          <Image source={{ uri: recipe.image_url }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="restaurant-outline" size={40} color={colors.bark[100]} />
          </View>
        )}

        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={18}
            color={saved ? colors.cinnamon[500] : colors.bark[300]}
          />
        </TouchableOpacity>

        {recipe.kosher_type && (
          <View style={styles.kosherBadge}>
            <ThemedText style={styles.kosherText}>
              {kosherLabels[recipe.kosher_type] || recipe.kosher_type}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <ThemedText variant="caption">@{recipe.author.username}</ThemedText>
          <ThemedText variant="caption"> · </ThemedText>
          <ThemedText variant="caption">
            {difficultyLabels[recipe.difficulty] || recipe.difficulty}
          </ThemedText>
        </View>

        <ThemedText variant="heading" numberOfLines={1} style={styles.title}>
          {recipe.title}
        </ThemedText>

        {recipe.description && (
          <ThemedText variant="caption" numberOfLines={2} style={styles.desc}>
            {recipe.description}
          </ThemedText>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLike} style={styles.likeBtn}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={18}
              color={liked ? colors.error : colors.bark[200]}
            />
            <ThemedText variant="caption" style={styles.likeCount}>{likesCount}</ThemedText>
          </TouchableOpacity>

          {totalTime > 0 && (
            <View style={styles.timeRow}>
              <ThemedText variant="caption">{totalTime} דק׳</ThemedText>
              <Ionicons name="time-outline" size={14} color={colors.bark[200]} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surface[300],
    shadowColor: "#6e3c14",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: { aspectRatio: 4 / 3, backgroundColor: colors.surface[200] },
  image: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  saveBtn: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.full,
    padding: 8,
  },
  kosherBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  kosherText: { fontSize: fontSize.xs, fontWeight: "500" },
  content: { padding: spacing.lg },
  metaRow: { flexDirection: "row-reverse", alignItems: "center", marginBottom: 4 },
  title: { marginBottom: 2, textAlign: "right" },
  desc: { marginBottom: spacing.sm, textAlign: "right" },
  footer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  likeBtn: { flexDirection: "row-reverse", alignItems: "center", gap: 4 },
  likeCount: { marginRight: 2 },
  timeRow: { flexDirection: "row-reverse", alignItems: "center", gap: 4 },
});
