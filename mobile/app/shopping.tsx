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
  StyleSheet,
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
  const [listId, setListId] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await shoppingApi.list();
      /* No list yet on a new account — make the one the rest of the screen
         needs, rather than showing an empty state that can do nothing. */
      const list = data[0] || (await shoppingApi.create()).data;
      setListId(list.id);
      setItems(list.items || []);
    } catch {
      Alert.alert("לא הצלחנו לטעון", "ייתכן שהשרת עדיין מתעורר. נסי לרענן בעוד רגע.");
    }
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  /* Tick straight away and send afterwards — waiting for the server before
     the box fills makes the list feel broken in a shop with poor signal. */
  const save = async (next: Item[]) => {
    const previous = items;
    setItems(next);
    if (!listId) return;
    try {
      await shoppingApi.updateItems(listId, next);
    } catch {
      setItems(previous);
      Alert.alert("לא נשמר", "השינוי לא הגיע לשרת. נסי שוב.");
    }
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
  container: { flex: 1, backgroundColor: colors.bg.primary },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg.primary },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  list: { padding: spacing.lg, gap: 8 },
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
