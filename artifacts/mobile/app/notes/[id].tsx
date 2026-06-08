import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp, Note, ChecklistItem } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { ColorPicker } from "@/components/ColorPicker";
import { generateId } from "@/lib/utils";

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isNew = id === "new";
  const existing = isNew ? null : notes.find((n) => n.id === id);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [desc, setDesc] = useState(existing?.description ?? "");
  const [color, setColor] = useState(existing?.color ?? "purple");
  const [checklistMode, setChecklistMode] = useState(existing?.checklistMode ?? false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    existing?.checklistItems ?? []
  );
  const [newItemText, setNewItemText] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const handleSave = () => {
    const trimTitle = title.trim();
    if (!trimTitle && !desc.trim() && checklistItems.length === 0) {
      router.back();
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (isNew) {
      addNote({
        title: trimTitle || "Untitled",
        description: desc.trim(),
        color: color as any,
        favorite: false,
        category: "",
        pinned: false,
        checklistMode,
        checklistItems,
      });
    } else if (existing) {
      updateNote(existing.id, {
        title: trimTitle || "Untitled",
        description: desc.trim(),
        color: color as any,
        checklistMode,
        checklistItems,
      });
    }
    router.back();
  };

  const handleDelete = () => {
    if (isNew) { router.back(); return; }
    Alert.alert("Delete Note", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (existing) deleteNote(existing.id);
          router.back();
        },
      },
    ]);
  };

  const addChecklistItem = () => {
    if (!newItemText.trim()) return;
    setChecklistItems((prev) => [
      ...prev,
      { id: generateId(), text: newItemText.trim(), checked: false },
    ]);
    setNewItemText("");
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklistItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i))
    );
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeChecklistItem = (itemId: string) => {
    setChecklistItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.topBar,
          { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <TouchableOpacity onPress={handleSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            onPress={() => setShowColorPicker((v) => !v)}
            style={[styles.toolBtn, { backgroundColor: colors.muted }]}
          >
            <Feather name="droplet" size={16} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setChecklistMode((v) => !v)}
            style={[
              styles.toolBtn,
              { backgroundColor: checklistMode ? colors.primary : colors.muted },
            ]}
          >
            <Feather name="check-square" size={16} color={checklistMode ? "#FFF" : colors.foreground} />
          </TouchableOpacity>
          {!isNew && (
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.toolBtn, { backgroundColor: "#FF475722" }]}
            >
              <Feather name="trash-2" size={16} color={colors.destructive} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showColorPicker && (
        <View style={[styles.colorPickerWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ColorPicker selected={color} onSelect={(c) => { setColor(c); setShowColorPicker(false); }} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          style={[styles.titleInput, { color: colors.foreground }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={colors.mutedForeground}
          multiline
          returnKeyType="next"
          blurOnSubmit
        />

        {!checklistMode ? (
          <TextInput
            style={[styles.descInput, { color: colors.foreground }]}
            value={desc}
            onChangeText={setDesc}
            placeholder="Start writing..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlignVertical="top"
            autoFocus={isNew}
          />
        ) : (
          <View style={styles.checklist}>
            {checklistItems.map((item) => (
              <View key={item.id} style={styles.checklistRow}>
                <TouchableOpacity
                  onPress={() => toggleChecklistItem(item.id)}
                  style={[
                    styles.checkBox,
                    {
                      backgroundColor: item.checked ? colors.primary : "transparent",
                      borderColor: item.checked ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {item.checked && <Feather name="check" size={11} color="#FFF" />}
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.checkText,
                    {
                      color: colors.foreground,
                      textDecorationLine: item.checked ? "line-through" : "none",
                      opacity: item.checked ? 0.5 : 1,
                    },
                  ]}
                  value={item.text}
                  onChangeText={(t) =>
                    setChecklistItems((prev) =>
                      prev.map((i) => (i.id === item.id ? { ...i, text: t } : i))
                    )
                  }
                  placeholderTextColor={colors.mutedForeground}
                />
                <TouchableOpacity onPress={() => removeChecklistItem(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="x" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.checklistRow}>
              <View style={[styles.checkBox, { borderColor: colors.border }]} />
              <TextInput
                style={[styles.checkText, { color: colors.foreground }]}
                value={newItemText}
                onChangeText={setNewItemText}
                placeholder="Add item..."
                placeholderTextColor={colors.mutedForeground}
                onSubmitEditing={addChecklistItem}
                returnKeyType="done"
                blurOnSubmit={false}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topBarActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  toolBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 4,
  },
  saveBtnText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  colorPickerWrap: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  titleInput: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
    lineHeight: 34,
  },
  descInput: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
    minHeight: 300,
  },
  checklist: { gap: 12 },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
});
