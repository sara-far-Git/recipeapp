import { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { searchApi } from "@/lib/api";
import RecipeCard from "@/components/RecipeCard";
import ThemedText from "@/components/ThemedText";
import { colors, spacing, radius, fontSize } from "@/lib/theme";

const DIFFICULTY = [
  { value: "", label: "הכל" },
  { value: "easy", label: "קל" },
  { value: "medium", label: "בינוני" },
  { value: "hard", label: "מאתגר" },
];

const KOSHER = [
  { value: "", label: "הכל" },
  { value: "meat", label: "בשרי" },
  { value: "dairy", label: "חלבי" },
  { value: "pareve", label: "פרווה" },
];

const TIME = [
  { value: 0, label: "הכל" },
  { value: 15, label: "עד 15 דק׳" },
  { value: 30, label: "עד 30 דק׳" },
  { value: 60, label: "עד שעה" },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [kosherType, setKosherType] = useState("");
  const [maxTime, setMaxTime] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params: any = {};
      if (query) params.q = query;
      if (difficulty) params.difficulty = difficulty;
      if (kosherType) params.kosher_type = kosherType;
      if (maxTime > 0) params.max_prep_time = maxTime;
      const { data } = await searchApi.search(params);
      setResults(data);
    } catch {}
    setLoading(false);
  }, [query, difficulty, kosherType, maxTime]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.length >= 2 || difficulty || kosherType || maxTime > 0) doSearch();
    }, 400);
    return () => clearTimeout(t);
  }, [query, difficulty, kosherType, maxTime, doSearch]);

  const ChipRow = ({
    items,
    selected,
    onSelect,
  }: {
    items: { value: string | number; label: string }[];
    selected: string | number;
    onSelect: (v: any) => void;
  }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
      {items.map((it) => (
        <TouchableOpacity
          key={String(it.value)}
          onPress={() => onSelect(it.value)}
          style={[styles.chip, selected === it.value && styles.chipActive]}
        >
          <ThemedText
            style={[styles.chipText, selected === it.value && styles.chipTextActive]}
          >
            {it.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color={colors.gray[400]} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="חפשו מתכון..."
          placeholderTextColor={colors.gray[400]}
          style={styles.searchInput}
          textAlign="right"
        />
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Ionicons
            name="options-outline"
            size={22}
            color={showFilters ? colors.primary[500] : colors.gray[400]}
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filters}>
          <ThemedText variant="label">רמת קושי</ThemedText>
          <ChipRow items={DIFFICULTY} selected={difficulty} onSelect={setDifficulty} />
          <ThemedText variant="label" style={{ marginTop: 8 }}>כשרות</ThemedText>
          <ChipRow items={KOSHER} selected={kosherType} onSelect={setKosherType} />
          <ThemedText variant="label" style={{ marginTop: 8 }}>זמן הכנה</ThemedText>
          <ChipRow items={TIME} selected={maxTime} onSelect={setMaxTime} />
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <ThemedText variant="caption" center>
                {searched ? "לא נמצאו מתכונים" : "הקלידו לפחות 2 תווים"}
              </ThemedText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 80 },
  searchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.white,
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: fontSize.base,
    color: colors.gray[900],
    writingDirection: "rtl",
  },
  filters: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  chipScroll: { marginTop: 6, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.gray[100],
    marginLeft: 6,
  },
  chipActive: { backgroundColor: colors.primary[500] },
  chipText: { fontSize: fontSize.xs, color: colors.gray[600], fontWeight: "500" },
  chipTextActive: { color: colors.white },
  list: { padding: spacing.lg },
});
