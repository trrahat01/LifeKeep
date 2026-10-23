import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useApp, Birthday, ImportantInfo, Bookmark } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { AnimatedListItem } from "@/components/AnimatedListItem";
import { SwipeableRow } from "@/components/SwipeableRow";
import {
  getDaysUntilBirthday,
  getAge,
  formatShortDate,
  INFO_CATEGORIES,
  ITEM_COLORS,
} from "@/lib/utils";

type Section = "birthdays" | "info" | "bookmarks";

function BirthdayCard({ item, onDelete }: { item: Birthday; onDelete: () => void }) {
  const { colors, isDark } = useTheme();
  const days = getDaysUntilBirthday(item.date);
  const age = getAge(item.date);
  const isToday = days === 0;
  const colorData = ITEM_COLORS[item.color] ?? ITEM_COLORS.pink;

  return (
    <SwipeableRow onDelete={onDelete}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <LinearGradient
          colors={colorData.gradient as [string, string]}
          style={styles.avatarCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>{item.title.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
            {formatShortDate(item.date)} · Age {age + (days === 0 ? 0 : 0)}
          </Text>
          {item.description ? (
            <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <View style={[styles.countdownBadge, { backgroundColor: isToday ? "#FD79A8" : colors.primary + "22" }]}>
          <Text style={[styles.countdownNum, { color: isToday ? "#FFF" : colors.primary }]}>
            {isToday ? "Today!" : `${days}d`}
          </Text>
        </View>
      </View>
    </SwipeableRow>
  );
}

function InfoCard({ item, onDelete }: { item: ImportantInfo; onDelete: () => void }) {
  const { colors } = useTheme();
  const [revealed, setRevealed] = useState(false);
  const cat = INFO_CATEGORIES.find((c) => c.key === item.category) ?? INFO_CATEGORIES[4];

  return (
    <SwipeableRow onDelete={onDelete}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.infoIcon, { backgroundColor: colors.primary + "22" }]}>
          <Feather name={cat.icon as keyof typeof Feather.glyphMap} size={18} color={colors.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {revealed ? item.description : "•".repeat(Math.min(item.description.length, 16))}
          </Text>
          <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>{cat.label}</Text>
        </View>
        <TouchableOpacity onPress={() => setRevealed((v) => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name={revealed ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </SwipeableRow>
  );
}

function BookmarkCard({ item, onDelete, onToggleFavorite }: { item: Bookmark; onDelete: () => void; onToggleFavorite: () => void }) {
  const { colors } = useTheme();

  const handleOpen = () => {
    const url = item.description.startsWith("http") ? item.description : `https://${item.description}`;
    Linking.openURL(url).catch(() => Alert.alert("Cannot open link"));
  };

  return (
    <SwipeableRow onDelete={onDelete}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.infoIcon, { backgroundColor: "#74B9FF22" }]}>
          <Feather name="bookmark" size={18} color="#74B9FF" />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.cardDesc, { color: "#74B9FF" }]} numberOfLines={1}>
            {item.description}
          </Text>
          {item.category ? (
            <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>{item.category}</Text>
          ) : null}
        </View>
        <View style={styles.bookmarkActions}>
          <TouchableOpacity onPress={onToggleFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="heart" size={16} color={item.favorite ? "#FF4757" : colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpen} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginLeft: 12 }}>
            <Feather name="external-link" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>
    </SwipeableRow>
  );
}

export default function VaultScreen() {
  const { colors } = useTheme();
  const { birthdays, addBirthday, deleteBirthday, importantInfo, addImportantInfo, deleteImportantInfo, bookmarks, addBookmark, deleteBookmark, updateBookmark } = useApp();
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState<Section>("birthdays");
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const sections: { key: Section; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: "birthdays", label: "Birthdays", icon: "gift" },
    { key: "info", label: "Info", icon: "shield" },
    { key: "bookmarks", label: "Bookmarks", icon: "bookmark" },
  ];

  const sortedBirthdays = useMemo(
    () => [...birthdays].sort((a, b) => getDaysUntilBirthday(a.date) - getDaysUntilBirthday(b.date)),
    [birthdays]
  );

  const handleAdd = () => {
    if (!form.title?.trim()) return;
    if (section === "birthdays") {
      addBirthday({ title: form.title.trim(), description: form.desc ?? "", date: form.date ?? new Date().toISOString(), favorite: false, category: "", color: "pink" });
    } else if (section === "info") {
      addImportantInfo({ title: form.title.trim(), description: form.desc ?? "", favorite: false, category: form.category ?? "other", color: "purple" });
    } else {
      addBookmark({ title: form.title.trim(), description: form.url ?? "", favorite: false, category: form.category ?? "", color: "blue" });
    }
    setForm({});
    setModalVisible(false);
  };

  const renderContent = () => {
    if (section === "birthdays") {
      return (
        <FlatList
          data={sortedBirthdays}
          keyExtractor={(i) => i.id}
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <BirthdayCard item={item} onDelete={() => deleteBirthday(item.id)} />
            </AnimatedListItem>
          )}
          contentContainerStyle={[styles.list, sortedBirthdays.length === 0 && { flex: 1 }]}
          ListEmptyComponent={<EmptyState icon="gift" title="No birthdays added" subtitle="Never forget a birthday again" />}
          showsVerticalScrollIndicator={false}
        />
      );
    }
    if (section === "info") {
      return (
        <FlatList
          data={importantInfo}
          keyExtractor={(i) => i.id}
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <InfoCard item={item} onDelete={() => deleteImportantInfo(item.id)} />
            </AnimatedListItem>
          )}
          contentContainerStyle={[styles.list, importantInfo.length === 0 && { flex: 1 }]}
          ListEmptyComponent={<EmptyState icon="shield" title="Vault is empty" subtitle="Store important documents securely offline" />}
          showsVerticalScrollIndicator={false}
        />
      );
    }
    return (
      <FlatList
        data={bookmarks}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }) => (
          <AnimatedListItem index={index}>
            <BookmarkCard item={item} onDelete={() => deleteBookmark(item.id)} onToggleFavorite={() => updateBookmark(item.id, { favorite: !item.favorite })} />
          </AnimatedListItem>
        )}
        contentContainerStyle={[styles.list, bookmarks.length === 0 && { flex: 1 }]}
        ListEmptyComponent={<EmptyState icon="bookmark" title="No bookmarks" subtitle="Save links and access them offline" />}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Vault</Text>
        <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
          {sections.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.tabBtn, section === s.key && { backgroundColor: colors.primary }]}
              onPress={() => setSection(s.key)}
            >
              <Feather name={s.icon} size={13} color={section === s.key ? "#FFF" : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: section === s.key ? "#FFF" : colors.mutedForeground }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {renderContent()}
      <FAB onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                {section === "birthdays" ? "Add Birthday" : section === "info" ? "Add Info" : "Add Bookmark"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder={section === "birthdays" ? "Name" : section === "info" ? "Label" : "Title"}
              placeholderTextColor={colors.mutedForeground}
              value={form.title ?? ""}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
              autoFocus
            />
            {section === "birthdays" && (
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor={colors.mutedForeground}
                value={form.date ?? ""}
                onChangeText={(v) => setForm((f) => ({ ...f, date: v }))}
              />
            )}
            {section === "info" && (
              <>
                <TextInput
                  style={[styles.input, styles.multiline, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Information (stored locally)"
                  placeholderTextColor={colors.mutedForeground}
                  value={form.desc ?? ""}
                  onChangeText={(v) => setForm((f) => ({ ...f, desc: v }))}
                  multiline
                />
                <View style={styles.catRow}>
                  {INFO_CATEGORIES.map((c) => (
                    <TouchableOpacity
                      key={c.key}
                      style={[styles.catChip, { backgroundColor: form.category === c.key ? colors.primary : colors.muted, borderColor: colors.border }]}
                      onPress={() => setForm((f) => ({ ...f, category: c.key }))}
                    >
                      <Text style={{ color: form.category === c.key ? "#FFF" : colors.mutedForeground, fontSize: 11, fontFamily: "Inter_500Medium" }}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            {section === "bookmarks" && (
              <>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="URL (https://...)"
                  placeholderTextColor={colors.mutedForeground}
                  value={form.url ?? ""}
                  onChangeText={(v) => setForm((f) => ({ ...f, url: v }))}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <TextInput
                  style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Category (optional)"
                  placeholderTextColor={colors.mutedForeground}
                  value={form.category ?? ""}
                  onChangeText={(v) => setForm((f) => ({ ...f, category: v }))}
                />
              </>
            )}
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
              <Text style={styles.addBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  tabRow: { flexDirection: "row", borderRadius: 14, padding: 4, gap: 2 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 10, borderRadius: 10 },
  tabLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 170 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  avatarCircle: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFF" },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  cardMeta: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 },
  countdownBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, flexShrink: 0 },
  countdownNum: { fontSize: 13, fontFamily: "Inter_700Bold" },
  infoIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bookmarkActions: { flexDirection: "row", alignItems: "center" },
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    gap: 12,
  },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sheetTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  addBtn: { padding: 16, borderRadius: 14, alignItems: "center", marginTop: 4 },
  addBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
