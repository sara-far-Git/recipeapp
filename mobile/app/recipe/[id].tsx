import { useEffect, useState, useMemo } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { recipesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Button from "@/components/Button";
import ThemedText from "@/components/ThemedText";
import { colors, spacing, radius, fontSize } from "@/lib/theme";

const diffLabels: Record<string, string> = { easy: "קל", medium: "בינוני", hard: "מאתגר" };
const kosherLabels: Record<string, string> = { meat: "בשרי", dairy: "חלבי", pareve: "פרווה", non_kosher: "לא כשר" };

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);

  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [cookingMode, setCookingMode] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await recipesApi.get(Number(id));
        setRecipe(data);
        setLiked(data.is_liked);
        setLikesCount(data.likes_count);
        setSaved(data.is_saved);
        const { data: c } = await recipesApi.getComments(Number(id));
        setComments(c);
      } catch {
        router.back();
      }
      setLoading(false);
    })();
  }, [id, router]);

  // Wake Lock
  useEffect(() => {
    if (cookingMode) {
      activateKeepAwakeAsync("cooking");
    } else {
      deactivateKeepAwake("cooking");
    }
    return () => { deactivateKeepAwake("cooking"); };
  }, [cookingMode]);

  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];
    return recipe.ingredients.map((ing: any) => ({
      ...ing,
      amount: Math.round(ing.amount * servingMultiplier * 100) / 100,
    }));
  }, [recipe, servingMultiplier]);

  const changeServings = (delta: number) => {
    if (!recipe) return;
    const cur = recipe.servings * servingMultiplier;
    const next = Math.max(1, cur + delta);
    setServingMultiplier(next / recipe.servings);
  };

  const toggleLike = async () => {
    if (!user) { router.push("/login" as any); return; }
    const { data } = await recipesApi.toggleLike(recipe.id);
    setLiked(data.liked);
    setLikesCount(data.likes_count);
  };

  const toggleSave = async () => {
    if (!user) { router.push("/login" as any); return; }
    const { data } = await recipesApi.toggleSave(recipe.id);
    setSaved(data.saved);
  };

  const toggleStep = (step: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.has(step) ? next.delete(step) : next.add(step);
      return next;
    });
  };

  const handleComment = async () => {
    if (!newComment.trim() || !user) return;
    setSendingComment(true);
    try {
      const { data } = await recipesApi.addComment(recipe.id, newComment.trim());
      setComments((prev) => [data, ...prev]);
      setNewComment("");
    } catch {}
    setSendingComment(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!recipe) return null;

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const currentServings = Math.round(recipe.servings * servingMultiplier);

  // ===== Cooking Mode =====
  if (cookingMode) {
    return (
      <Modal visible animationType="slide">
        <SafeAreaView style={styles.cookingContainer}>
          <View style={styles.cookingHeader}>
            <ThemedText variant="heading" numberOfLines={1} style={{ flex: 1 }}>
              {recipe.title}
            </ThemedText>
            <TouchableOpacity onPress={() => setCookingMode(false)}>
              <Ionicons name="close-circle" size={28} color={colors.gray[400]} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
            <ThemedText variant="heading" style={{ marginBottom: 12 }}>
              מצרכים ({currentServings} סועדים)
            </ThemedText>
            {scaledIngredients.map((ing: any, i: number) => (
              <View key={i} style={styles.cookIngRow}>
                <ThemedText style={styles.cookIngAmount}>
                  {ing.amount} {ing.unit || ""}
                </ThemedText>
                <ThemedText style={styles.cookIngName}>{ing.name}</ThemedText>
              </View>
            ))}

            <ThemedText variant="heading" style={{ marginTop: 24, marginBottom: 12 }}>
              שלבי הכנה
            </ThemedText>
            {recipe.instructions.map((inst: any) => {
              const done = completedSteps.has(inst.step);
              return (
                <TouchableOpacity
                  key={inst.step}
                  onPress={() => toggleStep(inst.step)}
                  style={[styles.cookStep, done && styles.cookStepDone]}
                >
                  <View style={[styles.stepBadge, done && styles.stepBadgeDone]}>
                    {done ? (
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    ) : (
                      <ThemedText style={styles.stepNum}>{inst.step}</ThemedText>
                    )}
                  </View>
                  <ThemedText
                    style={[
                      styles.cookStepText,
                      done && { textDecorationLine: "line-through", color: colors.gray[400] },
                    ]}
                  >
                    {inst.text}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  // ===== Regular Detail View =====
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }} edges={["top"]}>
      <ScrollView>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={colors.gray[600]} />
        </TouchableOpacity>

        {/* Image */}
        <View style={styles.imageContainer}>
          {recipe.image_url ? (
            <Image source={{ uri: recipe.image_url }} style={styles.heroImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="restaurant-outline" size={56} color={colors.gray[300]} />
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Author & actions */}
          <View style={styles.authorRow}>
            <TouchableOpacity
              onPress={() => router.push(`/profile/${recipe.author.username}` as any)}
              style={styles.authorInfo}
            >
              <View style={styles.avatar}>
                <ThemedText bold color={colors.primary[600]}>
                  {recipe.author.username[0].toUpperCase()}
                </ThemedText>
              </View>
              <View>
                <ThemedText variant="label">{recipe.author.full_name || recipe.author.username}</ThemedText>
                <ThemedText variant="caption">@{recipe.author.username}</ThemedText>
              </View>
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity onPress={toggleLike} style={styles.actionBtn}>
                <Ionicons name={liked ? "heart" : "heart-outline"} size={22} color={liked ? colors.red[500] : colors.gray[500]} />
              </TouchableOpacity>
              <ThemedText variant="caption">{likesCount}</ThemedText>
              <TouchableOpacity onPress={toggleSave} style={styles.actionBtn}>
                <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={22} color={saved ? colors.primary[500] : colors.gray[500]} />
              </TouchableOpacity>
            </View>
          </View>

          <ThemedText variant="title" style={{ marginBottom: 4 }}>{recipe.title}</ThemedText>
          {recipe.description && (
            <ThemedText variant="body" color={colors.gray[600]} style={{ marginBottom: 12 }}>
              {recipe.description}
            </ThemedText>
          )}

          {/* Info chips */}
          <View style={styles.chips}>
            {totalTime > 0 && (
              <View style={styles.chip}>
                <Ionicons name="time-outline" size={14} color={colors.gray[600]} />
                <ThemedText variant="caption">{totalTime} דק׳</ThemedText>
              </View>
            )}
            <View style={styles.chip}>
              <Ionicons name="people-outline" size={14} color={colors.gray[600]} />
              <ThemedText variant="caption">{recipe.servings} סועדים</ThemedText>
            </View>
            <View style={styles.chip}>
              <ThemedText variant="caption">{diffLabels[recipe.difficulty] || recipe.difficulty}</ThemedText>
            </View>
            {recipe.kosher_type && (
              <View style={styles.chip}>
                <ThemedText variant="caption">{kosherLabels[recipe.kosher_type]}</ThemedText>
              </View>
            )}
          </View>

          {/* Cooking mode button */}
          <Button
            title="מצב בישול"
            onPress={() => setCookingMode(true)}
            size="lg"
            icon={<Ionicons name="flame-outline" size={20} color={colors.white} />}
            style={{ marginBottom: spacing["2xl"] }}
          />

          {/* Ingredients */}
          <View style={styles.section}>
            <View style={styles.servingsRow}>
              <ThemedText variant="heading">מצרכים</ThemedText>
              <View style={styles.servingsControl}>
                <TouchableOpacity onPress={() => changeServings(-1)} style={styles.servingsBtn}>
                  <Ionicons name="remove" size={18} color={colors.gray[700]} />
                </TouchableOpacity>
                <ThemedText variant="label" style={{ minWidth: 80, textAlign: "center" }}>
                  {currentServings} סועדים
                </ThemedText>
                <TouchableOpacity onPress={() => changeServings(1)} style={styles.servingsBtn}>
                  <Ionicons name="add" size={18} color={colors.gray[700]} />
                </TouchableOpacity>
              </View>
            </View>
            {scaledIngredients.map((ing: any, i: number) => (
              <View key={i} style={styles.ingRow}>
                <ThemedText style={styles.ingAmount}>{ing.amount} {ing.unit || ""}</ThemedText>
                <ThemedText style={styles.ingName}>{ing.name}</ThemedText>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <ThemedText variant="heading" style={{ marginBottom: 12 }}>שלבי הכנה</ThemedText>
            {recipe.instructions.map((inst: any) => (
              <View key={inst.step} style={styles.instRow}>
                <View style={styles.instBadge}>
                  <ThemedText bold color={colors.primary[600]} style={{ fontSize: 13 }}>{inst.step}</ThemedText>
                </View>
                <ThemedText style={styles.instText}>{inst.text}</ThemedText>
              </View>
            ))}
          </View>

          {/* Comments */}
          <View style={styles.section}>
            <ThemedText variant="heading" style={{ marginBottom: 12 }}>
              תגובות ({comments.length})
            </ThemedText>

            {user && (
              <View style={styles.commentInput}>
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="הוסיפו תגובה..."
                  placeholderTextColor={colors.gray[400]}
                  style={styles.commentField}
                  textAlign="right"
                  multiline
                />
                <TouchableOpacity onPress={handleComment} disabled={sendingComment}>
                  {sendingComment ? (
                    <ActivityIndicator size="small" color={colors.primary[500]} />
                  ) : (
                    <Ionicons name="send" size={20} color={colors.primary[500]} />
                  )}
                </TouchableOpacity>
              </View>
            )}

            {comments.map((c: any) => (
              <View key={c.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <ThemedText variant="label">@{c.author.username}</ThemedText>
                  <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
                    <ThemedText variant="caption">
                      {new Date(c.created_at).toLocaleDateString("he-IL")}
                    </ThemedText>
                    {user && (
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert("דיווח", "לדווח על תגובה פוגענית?", [
                            { text: "ביטול" },
                            { text: "דיווח", onPress: () => recipesApi.reportComment(recipe.id, c.id) },
                          ]);
                        }}
                      >
                        <Ionicons name="flag-outline" size={14} color={colors.gray[300]} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <ThemedText variant="body">{c.content}</ThemedText>
              </View>
            ))}

            {comments.length === 0 && (
              <ThemedText variant="caption" center style={{ paddingVertical: 20 }}>
                אין תגובות עדיין
              </ThemedText>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: {
    position: "absolute",
    top: 8,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.full,
    padding: 8,
  },
  imageContainer: { aspectRatio: 16 / 9, backgroundColor: colors.gray[100] },
  heroImage: { width: "100%", height: "100%" },
  placeholderImage: { flex: 1, justifyContent: "center", alignItems: "center" },
  body: { padding: spacing.lg },
  authorRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  authorInfo: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  actions: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  actionBtn: { padding: 4 },
  chips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, marginBottom: spacing.lg },
  chip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  section: { marginBottom: spacing["2xl"] },
  servingsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  servingsControl: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.gray[100],
    borderRadius: radius.lg,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  servingsBtn: { padding: 6 },
  ingRow: {
    flexDirection: "row-reverse",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[100],
  },
  ingAmount: {
    fontWeight: "600",
    color: colors.primary[600],
    minWidth: 80,
    textAlign: "left",
  },
  ingName: { flex: 1, textAlign: "right" },
  instRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[100],
    marginBottom: 8,
  },
  instBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  instText: { flex: 1, lineHeight: 22, textAlign: "right" },
  commentInput: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.md,
  },
  commentField: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSize.base,
    color: colors.gray[900],
    writingDirection: "rtl",
  },
  commentCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: spacing.md,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  // Cooking mode
  cookingContainer: { flex: 1, backgroundColor: colors.white },
  cookingHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[200],
  },
  cookIngRow: {
    flexDirection: "row-reverse",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[100],
  },
  cookIngAmount: {
    fontWeight: "600",
    color: colors.primary[600],
    minWidth: 80,
    textAlign: "left",
    fontSize: fontSize.lg,
  },
  cookIngName: { flex: 1, textAlign: "right", fontSize: fontSize.lg },
  cookStep: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 12,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  cookStepDone: { borderColor: colors.green[400], backgroundColor: colors.green[50] },
  cookStepText: { flex: 1, fontSize: fontSize.lg, lineHeight: 28, textAlign: "right" },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  stepBadgeDone: { backgroundColor: colors.green[500] },
  stepNum: { fontWeight: "700", color: colors.primary[600] },
});
