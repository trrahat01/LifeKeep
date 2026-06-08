import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { AnimatedListItem } from "@/components/AnimatedListItem";
import { formatShortDate } from "@/lib/utils";

type ResultType = "note" | "todo" | "shopping" | "birthday" | "info" | "bookmark";

interface Result {
  id: string;
  title: string;
  subtitle: string;
  type: ResultType;
  updatedAt: string;
}

const TYPE_CONFIG: Record<
  ResultType,
  { icon: keyof typeof Feather.glyphMap; color: string; label: string }
> = {
  note: { icon: "file-text", color: "#A29BFE", label: "Note" },
  todo: { icon: "check-circle", color: "#55EFC4", label: "Task" },
  shopping: { icon: "shopping-cart", color: "#74B9FF", label: "Shopping" },
  birthday: { icon: "gift", color: "#FD79A8", label: "Birthday" },
  info: { icon: "shield", color: "#FDCB6E", label: "Info" },
  bookmark: { icon: "bookmark", color: "#81ECEC", label: "Bookmark" },
};

export default function SearchScreen() {
  const { colors } = useTheme();
  const { notes, todos, shoppingItems, birthdays, importantInfo, bookmarks } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ResultType | "all">("all");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const results = useMemo<Result[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const all: Result[] = [
      ...notes
        .filter((n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q))
        .map((n) => ({ id: n.id, title: n.title || "Untitled", subtitle: n.description, type: "note" as ResultType, updatedAt: n.updatedAt })),
      ...todos
        .filter((t) => t.title.toLowerCase().includes(q))
        .map((t) => ({ id: t.id, title: t.title, subtitle: t.priority + " priority", type: "todo" as ResultType, updatedAt: t.updatedAt })),
      ...shoppingItems
        .filter((s) => s.title.toLowerCase().includes(q))
        .map((s) => ({ id: s.id, title: s.title, subtitle: s.quantity ? `Qty: ${s.quantity}` : "", type: "shopping" as ResultType, updatedAt: s.updatedAt })),
      ...birthdays
        .filter((b) => b.title.toLowerCase().includes(q))
        .map((b) => ({ id: b.id, title: b.title, subtitle: b.date, type: "birthday" as ResultType, updatedAt: b.updatedAt })),
      ...importantInfo
        .filter((i) => i.title.toLowerCase().includes(q))
        .map((i) => ({ id: i.id, title: i.title, subtitle: i.category, type: "info" as ResultType, updatedAt: i.updatedAt })),
      ...bookmarks
        .filter((bk) => bk.title.toLowerCase().includes(q) || bk.description.toLowerCase().includes(q))
        .map((bk) => ({ id: bk.id, title: bk.title, subtitle: bk.description, type: "bookmark" as ResultType, updatedAt: bk.updatedAt })),
    ];

    if (activeFilter === "all") return all;
    return all.filter((r) => r.type === activeFilter);
  }, [query, activeFilter, notes, todos, shoppingItems, birthdays, importantInfo, bookmarks]);

  const handlePress = (r: Result) => {
    if (r.type === "note") {
      router.push(`/notes/${r.id}` as never);
    } else if (r.type === "todo" || r.type === "shopping") {
      router.push("/(tabs)/tasks");
    } else {
      router.push("/(tabs)/vault");
    }
  };

  const filters: Array<{ key: ResultType | "all"; label: string }> = [
    { key: "all", label: "All" },
    { key: "note", label: "Notes" },
    { key: "todo", label: "Tasks" },
    { key: "birthday", label: "Birthdays" },
    { key: "info", label: "Vault" },
    { key: "bookmark", label: "Links" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Search</Text>
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search everything..." />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(i) => i.key}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeFilter === f.key ? colors.primary : colors.muted,
                  borderColor: activeFilter === f.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: activeFilter === f.key ? "#FFF" : colors.mutedForeground },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 0 }}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(i) => `${i.type}_${i.id}`}
        renderItem={({ item, index }) => {
          const cfg = TYPE_CONFIG[item.type];
          return (
            <AnimatedListItem index={index}>
              <TouchableOpacity
                style={[styles.result, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handlePress(item)}
                activeOpacity={0.8}
              >
                <View style={[styles.typeIcon, { backgroundColor: cfg.color + "22" }]}>
                  <Feather name={cfg.icon} size={16} color={cfg.color} />
                </View>
                <View style={styles.resultContent}>
                  <View style={styles.resultTop}>
                    <Text style={[styles.resultTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={[styles.typeBadge, { backgroundColor: cfg.color + "22" }]}>
                      <Text style={[styles.typeLabel, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                  {item.subtitle ? (
                    <Text style={[styles.resultSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                  <Text style={[styles.resultDate, { color: colors.mutedForeground }]}>
                    {formatShortDate(item.updatedAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            </AnimatedListItem>
          );
        }}
        contentContainerStyle={[
          styles.list,
          results.length === 0 && query.length > 0 && { flex: 1 },
          results.length === 0 && query.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={
          query.length === 0 ? (
            <EmptyState icon="search" title="Search your vault" subtitle="Notes, tasks, birthdays, bookmarks, and more" />
          ) : (
            <EmptyState icon="inbox" title="No results found" subtitle={`Nothing matches "${query}"`} />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  result: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  typeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  resultContent: { flex: 1 },
  resultTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resultTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 8 },
  typeLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  resultSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  resultDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3 },
});
