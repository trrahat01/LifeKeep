import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Note } from "@/context/AppContext";
import { ITEM_COLORS, truncate, formatShortDate } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  note: Note;
  onPress: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
}

export function NoteCard({ note, onPress, onToggleFavorite, onTogglePin }: Props) {
  const { colors, isDark } = useTheme();
  const colorData = ITEM_COLORS[note.color] ?? ITEM_COLORS.purple;
  const bg = isDark ? colorData.dark : colorData.light;
  const accent = colorData.gradient[0];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bg, borderColor: accent + "44" }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.colorBar, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.badges}>
            {note.pinned && (
              <View style={[styles.badge, { backgroundColor: accent + "33" }]}>
                <Feather name="bookmark" size={10} color={accent} />
              </View>
            )}
            {note.checklistMode && (
              <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                <Feather
                  name="check-square"
                  size={10}
                  color={colors.mutedForeground}
                />
              </View>
            )}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onTogglePin} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather
                name="bookmark"
                size={15}
                color={note.pinned ? accent : colors.mutedForeground}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onToggleFavorite}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ marginLeft: 10 }}
            >
              <Feather
                name="heart"
                size={15}
                color={note.favorite ? "#FF4757" : colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {note.title || "Untitled"}
        </Text>
        {note.checklistMode ? (
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {note.checklistItems.filter((i) => i.checked).length}/
            {note.checklistItems.length} items
          </Text>
        ) : (
          <Text
            style={[styles.desc, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
            {truncate(note.description || "No content", 80)}
          </Text>
        )}
        <Text style={[styles.date, { color: accent }]}>
          {formatShortDate(note.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  badges: {
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginBottom: 8,
  },
  meta: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  date: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
