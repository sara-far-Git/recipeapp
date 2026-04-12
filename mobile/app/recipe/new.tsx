import { useState, useRef } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { recipesApi, scanApi, uploadApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ThemedText from "@/components/ThemedText";
import { colors, spacing, radius, fontSize } from "@/lib/theme";

interface Ingredient { amount: number; unit: string; name: string; }
interface Instruction { step: number; text: string; }

const DIFF_OPTS = [
  { value: "easy", label: "קל" },
  { value: "medium", label: "בינוני" },
  { value: "hard", label: "מאתגר" },
];

const KOSHER_OPTS = [
  { value: "", label: "לא רלוונטי" },
  { value: "meat", label: "בשרי" },
  { value: "dairy", label: "חלבי" },
  { value: "pareve", label: "פרווה" },
  { value: "non_kosher", label: "לא כשר" },
];

export default function NewRecipeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("4");
  const [difficulty, setDifficulty] = useState("medium");
  const [kosherType, setKosherType] = useState("");
  const [isScanned, setIsScanned] = useState(false);

  const [ingredients, setIngredients] = useState<Ingredient[]>([{ amount: 0, unit: "", name: "" }]);
  const [instructions, setInstructions] = useState<Instruction[]>([{ step: 1, text: "" }]);

  if (!user) {
    router.replace("/login" as any);
    return null;
  }

  const pickImage = async (forScan: boolean) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];

    if (forScan) {
      setScanning(true);
      try {
        const { data } = await scanApi.scan(asset.uri, asset.mimeType || "image/jpeg");
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.prep_time_minutes) setPrepTime(String(data.prep_time_minutes));
        if (data.cook_time_minutes) setCookTime(String(data.cook_time_minutes));
        if (data.servings) setServings(String(data.servings));
        if (data.difficulty) setDifficulty(data.difficulty);
        if (data.kosher_type) setKosherType(data.kosher_type);
        if (data.ingredients?.length) setIngredients(data.ingredients);
        if (data.instructions?.length) setInstructions(data.instructions);
        setIsScanned(true);
        Alert.alert("הצלחה", "המתכון פוענח! בדקו את השדות ותקנו אם צריך.");
      } catch {
        Alert.alert("שגיאה", "לא הצלחנו לפענח את התמונה");
      }
      setScanning(false);
    } else {
      setImageUploading(true);
      try {
        const { data } = await uploadApi.upload(asset.uri, asset.mimeType || "image/jpeg");
        setImageUrl(data.url);
      } catch {
        Alert.alert("שגיאה", "לא הצלחנו להעלות את התמונה");
      }
      setImageUploading(false);
    }
  };

  const takePhoto = async (forScan: boolean) => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert("נדרשת הרשאת מצלמה"); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];

    if (forScan) {
      setScanning(true);
      try {
        const { data } = await scanApi.scan(asset.uri, asset.mimeType || "image/jpeg");
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.prep_time_minutes) setPrepTime(String(data.prep_time_minutes));
        if (data.cook_time_minutes) setCookTime(String(data.cook_time_minutes));
        if (data.servings) setServings(String(data.servings));
        if (data.difficulty) setDifficulty(data.difficulty);
        if (data.kosher_type) setKosherType(data.kosher_type);
        if (data.ingredients?.length) setIngredients(data.ingredients);
        if (data.instructions?.length) setInstructions(data.instructions);
        setIsScanned(true);
      } catch {
        Alert.alert("שגיאה", "לא הצלחנו לפענח את התמונה");
      }
      setScanning(false);
    } else {
      setImageUploading(true);
      try {
        const { data } = await uploadApi.upload(asset.uri, asset.mimeType || "image/jpeg");
        setImageUrl(data.url);
      } catch {
        Alert.alert("שגיאה", "לא הצלחנו להעלות את התמונה");
      }
      setImageUploading(false);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, { amount: 0, unit: "", name: "" }]);
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: keyof Ingredient, value: any) => {
    const copy = [...ingredients];
    copy[i] = { ...copy[i], [field]: value };
    setIngredients(copy);
  };

  const addInstruction = () => setInstructions([...instructions, { step: instructions.length + 1, text: "" }]);
  const removeInstruction = (i: number) => {
    const filtered = instructions.filter((_, idx) => idx !== i);
    setInstructions(filtered.map((inst, idx) => ({ ...inst, step: idx + 1 })));
  };
  const updateInstruction = (i: number, text: string) => {
    const copy = [...instructions];
    copy[i] = { ...copy[i], text };
    setInstructions(copy);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert("שגיאה", "נדרשת כותרת למתכון"); return; }
    setSubmitting(true);
    try {
      const { data } = await recipesApi.create({
        title,
        description: description || null,
        image_url: imageUrl || null,
        prep_time_minutes: prepTime ? Number(prepTime) : null,
        cook_time_minutes: cookTime ? Number(cookTime) : null,
        servings: Number(servings) || 4,
        difficulty,
        kosher_type: kosherType || null,
        ingredients: ingredients.filter((i) => i.name.trim()),
        instructions: instructions.filter((i) => i.text.trim()),
        is_scanned: isScanned,
      });
      router.replace(`/recipe/${data.id}` as any);
    } catch (err: any) {
      Alert.alert("שגיאה", err.response?.data?.detail || "שגיאה ביצירת המתכון");
    }
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Scanning overlay */}
      <Modal visible={scanning} transparent animationType="fade">
        <View style={styles.scanOverlay}>
          <View style={styles.scanBox}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <ThemedText variant="heading" center style={{ marginTop: 16 }}>
              השף הדיגיטלי עובד
            </ThemedText>
            <ThemedText variant="caption" center style={{ marginTop: 8 }}>
              מפענח את המתכון מהתמונה...
            </ThemedText>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={22} color={colors.gray[600]} />
        </TouchableOpacity>
        <ThemedText variant="heading">מתכון חדש</ThemedText>
        <View style={{ width: 22 }} />
      </View>

      {/* Step indicators */}
      <View style={styles.stepRow}>
        {[1, 2, 3].map((s) => (
          <TouchableOpacity key={s} onPress={() => setStep(s)} style={[styles.stepBar, step >= s && styles.stepBarActive]} />
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* AI Scan banner */}
          {step === 1 && (
            <View style={styles.scanBanner}>
              <View style={{ flex: 1 }}>
                <ThemedText variant="label">השף הדיגיטלי</ThemedText>
                <ThemedText variant="caption">צלמו מתכון ונמלא את הכל אוטומטית</ThemedText>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity style={styles.scanBtn} onPress={() => takePhoto(true)}>
                  <Ionicons name="camera" size={20} color={colors.primary[500]} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.scanBtn} onPress={() => pickImage(true)}>
                  <Ionicons name="images" size={20} color={colors.primary[500]} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 1: Metadata */}
          {step === 1 && (
            <>
              <Input label="כותרת המתכון *" value={title} onChangeText={setTitle} placeholder="למשל: עוגת שוקולד" />
              <Input label="תיאור קצר" value={description} onChangeText={setDescription} placeholder="תיאור..." multiline numberOfLines={3} />

              {imageUrl ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                  <TouchableOpacity onPress={() => setImageUrl("")} style={styles.removeImage}>
                    <Ionicons name="trash" size={18} color={colors.red[500]} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageButtons}>
                  <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(false)} disabled={imageUploading}>
                    {imageUploading ? (
                      <ActivityIndicator color={colors.gray[400]} />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload-outline" size={24} color={colors.gray[400]} />
                        <ThemedText variant="caption">העלו תמונה</ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ flexDirection: "row-reverse", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Input label="הכנה (דק׳)" value={prepTime} onChangeText={setPrepTime} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="בישול (דק׳)" value={cookTime} onChangeText={setCookTime} keyboardType="numeric" />
                </View>
              </View>

              <Input label="סועדים" value={servings} onChangeText={setServings} keyboardType="numeric" />

              <ThemedText variant="label" style={{ marginBottom: 6 }}>רמת קושי</ThemedText>
              <View style={styles.toggleRow}>
                {DIFF_OPTS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setDifficulty(opt.value)}
                    style={[styles.toggleBtn, difficulty === opt.value && styles.toggleActive]}
                  >
                    <ThemedText
                      variant="caption"
                      color={difficulty === opt.value ? colors.white : colors.gray[700]}
                      bold
                    >
                      {opt.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedText variant="label" style={{ marginTop: 12, marginBottom: 6 }}>כשרות</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {KOSHER_OPTS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setKosherType(opt.value)}
                    style={[styles.chipBtn, kosherType === opt.value && styles.chipBtnActive]}
                  >
                    <ThemedText
                      variant="caption"
                      color={kosherType === opt.value ? colors.white : colors.gray[700]}
                      bold
                    >
                      {opt.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Button title="הבא — מצרכים" onPress={() => setStep(2)} disabled={!title.trim()} />
            </>
          )}

          {/* Step 2: Ingredients */}
          {step === 2 && (
            <>
              <ThemedText variant="heading" style={{ marginBottom: 12 }}>רשימת מצרכים</ThemedText>

              {ingredients.map((ing, i) => (
                <View key={i} style={styles.ingInputRow}>
                  <TextInput
                    placeholder="כמות"
                    value={ing.amount ? String(ing.amount) : ""}
                    onChangeText={(v) => updateIngredient(i, "amount", Number(v) || 0)}
                    keyboardType="numeric"
                    style={[styles.ingField, { flex: 0.8 }]}
                  />
                  <TextInput
                    placeholder="יחידה"
                    value={ing.unit}
                    onChangeText={(v) => updateIngredient(i, "unit", v)}
                    style={[styles.ingField, { flex: 1 }]}
                  />
                  <TextInput
                    placeholder="שם המצרך"
                    value={ing.name}
                    onChangeText={(v) => updateIngredient(i, "name", v)}
                    style={[styles.ingField, { flex: 2 }]}
                    textAlign="right"
                  />
                  {ingredients.length > 1 && (
                    <TouchableOpacity onPress={() => removeIngredient(i)} style={{ padding: 4 }}>
                      <Ionicons name="trash-outline" size={18} color={colors.gray[300]} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity onPress={addIngredient} style={styles.addRow}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary[500]} />
                <ThemedText variant="caption" color={colors.primary[500]}>הוספת מצרך</ThemedText>
              </TouchableOpacity>

              <View style={styles.navButtons}>
                <Button title="חזרה" variant="secondary" onPress={() => setStep(1)} style={{ flex: 1 }} />
                <Button title="הבא — הוראות" onPress={() => setStep(3)} style={{ flex: 1 }} />
              </View>
            </>
          )}

          {/* Step 3: Instructions */}
          {step === 3 && (
            <>
              <ThemedText variant="heading" style={{ marginBottom: 12 }}>שלבי הכנה</ThemedText>

              {instructions.map((inst, i) => (
                <View key={i} style={styles.instInputRow}>
                  <View style={styles.instInputBadge}>
                    <ThemedText bold color={colors.primary[600]}>{inst.step}</ThemedText>
                  </View>
                  <TextInput
                    value={inst.text}
                    onChangeText={(v) => updateInstruction(i, v)}
                    placeholder={`שלב ${inst.step}...`}
                    placeholderTextColor={colors.gray[400]}
                    multiline
                    style={styles.instField}
                    textAlign="right"
                  />
                  {instructions.length > 1 && (
                    <TouchableOpacity onPress={() => removeInstruction(i)} style={{ padding: 4 }}>
                      <Ionicons name="trash-outline" size={18} color={colors.gray[300]} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity onPress={addInstruction} style={styles.addRow}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary[500]} />
                <ThemedText variant="caption" color={colors.primary[500]}>הוספת שלב</ThemedText>
              </TouchableOpacity>

              <View style={styles.navButtons}>
                <Button title="חזרה" variant="secondary" onPress={() => setStep(2)} style={{ flex: 1 }} />
                <Button
                  title="פרסום מתכון"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={!title.trim()}
                  style={{ flex: 1 }}
                  icon={<Ionicons name="checkmark-circle" size={18} color={colors.white} />}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[200],
  },
  stepRow: { flexDirection: "row-reverse", gap: 6, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  stepBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.gray[200] },
  stepBarActive: { backgroundColor: colors.primary[500] },
  scrollContent: { padding: spacing.lg },
  scanBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: 12,
  },
  scanBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  scanOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanBox: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing["3xl"],
    alignItems: "center",
    width: 280,
  },
  imagePreview: { borderRadius: radius.lg, overflow: "hidden", marginBottom: spacing.md, position: "relative" },
  previewImage: { width: "100%", aspectRatio: 16 / 9 },
  removeImage: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.md,
    padding: 8,
  },
  imageButtons: { marginBottom: spacing.md },
  uploadBtn: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.gray[300],
    borderRadius: radius.lg,
    padding: spacing["2xl"],
    alignItems: "center",
    gap: 8,
  },
  toggleRow: { flexDirection: "row-reverse", gap: 8, marginBottom: spacing.md },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  toggleActive: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  chipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.gray[100],
    marginLeft: 6,
  },
  chipBtnActive: { backgroundColor: colors.primary[500] },
  ingInputRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: 8,
  },
  ingField: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: fontSize.sm,
    color: colors.gray[900],
  },
  addRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.gray[200],
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  navButtons: { flexDirection: "row-reverse", gap: 12, marginTop: 8 },
  instInputRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: 10,
    marginBottom: 8,
  },
  instInputBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  instField: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: fontSize.base,
    color: colors.gray[900],
    minHeight: 60,
    writingDirection: "rtl",
  },
});
