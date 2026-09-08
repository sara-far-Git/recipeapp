import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "./ThemedText";
import { colors, radius, spacing, fontSize } from "@/lib/theme";
import { imageUri, recipesApi } from "@/lib/api";
import { categoryTone } from "@/lib/categories";
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
          <Image source={{ uri: imageUri(recipe.image_url) }} style={styles.image} />
        ) : (
          /* The site does not leave this space empty either: a recipe with no
             picture gets a panel that carries its name, rather than a lone
             icon floating in a large blank. */
          <View style={styles.fallback}>
            <View style={styles.fallbackInner}>
              <ThemedText variant="heading" numberOfLines={3} style={styles.fallbackTitle}>
                {recipe.title}
              </ThemedText>
            </View>
          </View>
        )}

        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={18}
            color={saved ? colors.cinnamon[500] : colors.bark[300]}
          />
        </TouchableOpacity>

        {recipe.category && (
          <View style={[styles.categoryTab, { backgroundColor: categoryTone(recipe.category) }]}>
            <ThemedText style={styles.categoryText}>{recipe.category}</ThemedText>
          </View>
        )}

        {recipe.is_published === false && (
          <View style={styles.draftBadge}>
            <ThemedText style={styles.draftText}>טיוטה</ThemedText>
          </View>
        )}

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

        {/* When there is no picture the panel above already carries the name,
            and the site does not repeat it here either. */}
        {recipe.image_url && (
          <ThemedText variant="heading" numberOfLines={1} style={styles.title}>
            {recipe.title}
          </ThemedText>
        )}

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
  /* The site's card-surface: cream, a faint green edge, and no drop shadow —
     the shadow was taken off the site's cards deliberately and the phone had
     kept a brown one, which is why a card read as white paper on cream. */
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(39, 94, 80, 0.10)",
  },
  imageContainer: { aspectRatio: 4 / 3, backgroundColor: colors.surface[200] },
  image: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  fallback: { flex: 1, padding: 14 },
  fallbackInner: {
    flex: 1,
    /* Ends level with the name: the two top corners belong to the save
       button and the kosher badge, so nothing decorative goes up there. */
    justifyContent: "flex-end",
    padding: 14,
    /* The category tab and the draft badge sit along the bottom of the
       picture area; leave them their band so the name clears both. */
    paddingBottom: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(39, 94, 80, 0.14)",
  },
  fallbackTitle: { textAlign: "auto" },
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
  /* Along the bottom of the picture, clear of the save button and the kosher
     badge that already hold the two top corners. */
  categoryTab: {
    position: "absolute",
    bottom: 10,
    right: 10,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: { fontSize: fontSize.xs, fontWeight: "700", color: colors.white },
  draftBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  draftText: { fontSize: fontSize.xs, fontWeight: "700", color: colors.bark[300] },
  content: { padding: spacing.lg },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  title: { marginBottom: 2, textAlign: "auto" },
  desc: { marginBottom: spacing.sm, textAlign: "auto" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  likeCount: { marginRight: 2 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
});
