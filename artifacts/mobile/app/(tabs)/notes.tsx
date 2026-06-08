import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { SearchBar } from "@/components/SearchBar";
import { NoteCard } from "@/components/NoteCard";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { AnimatedListItem } from "@/components/AnimatedListItem";

type Filter = "all" | "pinned" | "favorites" | "checklist";

export default function NotesScreen() {
  const { colors } = useTheme();
  const { notes, updateNote, deleteNote } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let list = [...notes];
    if (filter === "pinned") list = list.filter((n) => n.pinned);
    else if (filter === "favorites") list = list.filter((n) => n.favorite);
    else if (filter === "checklist") list = list.filter((n) => n.checklistMode);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, filter, search]);

  const filters: { key: Filter; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: "all", label: "All", icon: "grid" },
    { key: "pinned", label: "Pinned", icon: "bookmark" },
    { key: "favorites", label: "Favorites", icon: "heart" },
    { key: "checklist", label: "Lists", icon: "check-square" },
  ];

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const renderNote = useCallback(
    ({ item, index }: { item: (typeof notes)[0]; index: number }) => (
      <AnimatedListItem index={index}>
        <NoteCard
          note={item}
          onPress={() => router.push(`/notes/${item.id}` as never)}
          onToggleFavorite={() => updateNote(item.id, { favorite: !item.favorite })}
          onTogglePin={() => updateNote(item.id, { pinned: !item.pinned })}
        />
      </AnimatedListItem>
    ),
    [notes]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Notes</Text>
        <SearchBar value={search} onChangeText={setSearch} />
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filter === f.key
                      ? colors.primary
                      : colors.primary + "18",
                  borderColor:
                    filter === f.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Feather
                name={f.icon}
                size={12}
                color={filter === f.key ? "#FFFFFF" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.filterLabel,
                  {
                    color:
                      filter === f.key ? "#FFFFFF" : colors.mutedForeground,
                  },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderNote}
        contentContainerStyle={[
          styles.list,
          filtered.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="file-text"
            title="No notes yet"
            subtitle="Tap the + button to create your first note"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB onPress={() => router.push("/notes/new" as never)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
});
