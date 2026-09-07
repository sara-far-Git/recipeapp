/**
 * The shopping list, which the site has had and the phone never did.
 *
 * The list is one JSON blob on the server and is replaced whole on every
 * change, so ticking a row means sending the whole list back. That is the
 * contract the site works to as well — this screen does not invent a
 * different one.
 */
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { shoppingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import ThemedText from "@/components/ThemedText";
import { colors, radius, spacing } from "@/lib/theme";

type Item = {
  name: string;
  amount?: number;
  unit?: string | null;
  checked?: boolean;
  from_recipe?: string;
};

export default function ShoppingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [listId, setListId] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [draft, setDraft] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await shoppingApi.list();
      /* No list yet on a new account — make the one the rest of the screen
         needs, rather than showing an empty state that can do nothing. */
      const rows = data.length ? data : [(await shoppingApi.create()).data];
      setLists(rows);
      /* Keep whichever list is open across a refresh; the holiday planner
         makes a second one, and landing back on the wrong list after every
         pull would be its own small bug. */
      const current = rows.find((l: any) => l.id === listId) || rows[0];
      setListId(current.id);
      setItems(current.items || []);
    } catch {
      Alert.alert("לא הצלחנו לטעון", "ייתכן שהשרת עדיין מתעורר. נסי לרענן בעוד רגע.");
    }
    setLoading(false);
    setRefreshing(false);
  }, [user, listId]);

  useEffect(() => {
    load();
  }, [load]);

  /* Tick straight away and send afterwards — waiting for the server before
     the box fills makes the list feel broken in a shop with poor signal. */
  const save = async (next: Item[]) => {
    const previous = items;
    setItems(next);
    if (!listId) return;
    setLists((rows) => rows.map((l) => (l.id === listId ? { ...l, items: next } : l)));
    try {
      await shoppingApi.updateItems(listId, next);
    } catch {
      setItems(previous);
      Alert.alert("לא נשמר", "השינוי לא הגיע לשרת. נסי שוב.");
    }
  };

  const openList = (list: any) => {
    setListId(list.id);
    setItems(list.items || []);
  };

  /* Something bought that no recipe asked for. */
  const addByHand = () => {
    const name = draft.trim();
    if (!name) return;
    setDraft("");
    save([...items, { name, checked: false }]);
  };

  const toggle = (i: number) =>
    save(items.map((it, n) => (n === i ? { ...it, checked: !it.checked } : it)));

  const remove = (i: number) => save(items.filter((_, n) => n !== i));

  const clearChecked = () => save(items.filter((it) => !it.checked));

  if (!user) {
    router.replace("/login" as any);
    return null;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const checkedCount = items.filter((it) => it.checked).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={22} color={colors.bark[400]} />
        </TouchableOpacity>
        <ThemedText variant="heading">רשימת קניות</ThemedText>
        {checkedCount > 0 ? (
          <TouchableOpacity onPress={clearChecked}>
            <ThemedText variant="caption" bold color={colors.cinnamon[600]}>
              נקה מסומנים
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      {lists.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          /* A horizontal ScrollView is still a flex child of the column, so
             without this it claims the rest of the screen and stretches each
             tab the full height of it. */
          style={styles.tabStrip}
          contentContainerStyle={styles.tabs}
        >
          {lists.map((l) => (
            <TouchableOpacity
              key={l.id}
              onPress={() => openList(l)}
              style={[styles.tab, l.id === listId && styles.tabOn]}
            >
              <ThemedText
                variant="caption"
                bold
                color={l.id === listId ? colors.white : colors.bark[300]}
              >
                {l.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.addRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={addByHand}
          returnKeyType="done"
          placeholder="להוסיף מצרך…"
          placeholderTextColor={colors.gray[400]}
          style={styles.addInput}
          textAlign="right"
        />
        <TouchableOpacity onPress={addByHand} disabled={!draft.trim()} hitSlop={8}>
          <Ionicons
            name="add-circle"
            size={30}
            color={draft.trim() ? colors.primary[500] : colors.surface[500]}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cart-outline" size={44} color={colors.bark[50]} />
            <ThemedText variant="caption" center style={{ marginTop: 12 }}>
              הרשימה ריקה. אפשר להוסיף אליה מצרכים ממתכון.
            </ThemedText>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => toggle(index)}
            style={styles.row}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: Boolean(item.checked) }}
          >
            <View style={[styles.box, item.checked && styles.boxOn]}>
              {item.checked && <Ionicons name="checkmark" size={14} color={colors.white} />}
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={item.checked ? styles.done : undefined}>
                {item.amount ? `${item.amount} ${item.unit || ""} ` : ""}
                {item.name}
              </ThemedText>
              {item.from_recipe && (
                <ThemedText variant="caption">{item.from_recipe}</ThemedText>
              )}
            </View>
            <TouchableOpacity
              onPress={() => remove(index)}
              hitSlop={10}
              accessibilityLabel={`הסרת ${item.name}`}
            >
              <Ionicons name="close" size={18} color={colors.bark[100]} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.page },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg.page },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  list: { padding: spacing.lg, gap: 8 },
  tabStrip: { flexGrow: 0, flexShrink: 0 },
  tabs: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingBottom: 10,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.surface[500],
    backgroundColor: colors.bg.card,
  },
  tabOn: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  addRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginHorizontal: spacing.lg,
    marginBottom: 4,
  },
  addInput: {
    flex: 1,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface[500],
    backgroundColor: colors.bg.card,
    color: colors.smoke[100],
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface[300],
    padding: spacing.md,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.surface[500],
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: colors.green[500], borderColor: colors.green[500] },
  done: { textDecorationLine: "line-through", color: colors.bark[200] },
  empty: { alignItems: "center", paddingTop: 80 },
});
