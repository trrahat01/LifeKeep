import React, { useState, useMemo, useRef } from "react";
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
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useApp, Todo, ShoppingItem } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { SwipeableRow } from "@/components/SwipeableRow";
import { EmptyState } from "@/components/EmptyState";
import { FAB } from "@/components/FAB";
import { AnimatedListItem } from "@/components/AnimatedListItem";
import { PRIORITY_COLORS, generateId, now } from "@/lib/utils";

type Tab = "todos" | "shopping";

function TodoItemRow({ item, onToggle, onDelete }: { item: Todo; onToggle: () => void; onDelete: () => void }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const pc = PRIORITY_COLORS[item.priority];

  const handleToggle = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(withSpring(1.2, { damping: 8 }), withSpring(1, { damping: 12 }));
    onToggle();
  };

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <SwipeableRow onDelete={onDelete}>
      <View style={[styles.todoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Animated.View style={checkStyle}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              {
                backgroundColor: item.completed ? colors.primary : "transparent",
                borderColor: item.completed ? colors.primary : colors.border,
              },
            ]}
            onPress={handleToggle}
          >
            {item.completed && <Feather name="check" size={12} color="#FFF" />}
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.todoContent}>
          <Text
            style={[
              styles.todoTitle,
              { color: colors.foreground, textDecorationLine: item.completed ? "line-through" : "none", opacity: item.completed ? 0.5 : 1 },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text style={[styles.todoDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: pc.bg }]}>
          <Text style={[styles.priorityText, { color: pc.text }]}>{pc.label}</Text>
        </View>
      </View>
    </SwipeableRow>
  );
}

function ShoppingItemRow({ item, onToggle, onDelete }: { item: ShoppingItem; onToggle: () => void; onDelete: () => void }) {
  const { colors } = useTheme();

  return (
    <SwipeableRow onDelete={onDelete}>
      <View style={[styles.todoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            {
              backgroundColor: item.checked ? "#55EFC4" : "transparent",
              borderColor: item.checked ? "#55EFC4" : colors.border,
            },
          ]}
          onPress={onToggle}
        >
          {item.checked && <Feather name="check" size={12} color="#FFF" />}
        </TouchableOpacity>
        <View style={styles.todoContent}>
          <Text
            style={[
              styles.todoTitle,
              { color: colors.foreground, textDecorationLine: item.checked ? "line-through" : "none", opacity: item.checked ? 0.5 : 1 },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.quantity ? (
            <Text style={[styles.todoDesc, { color: colors.mutedForeground }]}>
              Qty: {item.quantity}
            </Text>
          ) : null}
        </View>
      </View>
    </SwipeableRow>
  );
}

export default function TasksScreen() {
  const { colors, isDark } = useTheme();
  const { todos, addTodo, updateTodo, deleteTodo, shoppingItems, addShoppingItem, updateShoppingItem, deleteShoppingItem } = useApp();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("todos");
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newQty, setNewQty] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const completedCount = todos.filter((t) => t.completed).length;

  const sortedTodos = useMemo(
    () =>
      [...todos].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }),
    [todos]
  );

  const sortedShopping = useMemo(
    () =>
      [...shoppingItems].sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [shoppingItems]
  );

  const checkedShop = shoppingItems.filter((s) => s.checked).length;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    if (activeTab === "todos") {
      addTodo({
        title: newTitle.trim(),
        description: newDesc.trim(),
        favorite: false,
        category: "",
        color: "purple",
        completed: false,
        priority: newPriority,
      });
    } else {
      addShoppingItem({
        title: newTitle.trim(),
        description: "",
        favorite: false,
        category: "",
        color: "blue",
        checked: false,
        quantity: newQty.trim(),
      });
    }
    setNewTitle("");
    setNewDesc("");
    setNewQty("");
    setNewPriority("medium");
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Tasks</Text>
        <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
          {(["todos", "shopping"] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.tabBtn,
                activeTab === t && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab(t)}
            >
              <Feather
                name={t === "todos" ? "check-circle" : "shopping-cart"}
                size={14}
                color={activeTab === t ? "#FFF" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === t ? "#FFF" : colors.mutedForeground },
                ]}
              >
                {t === "todos" ? "To-Do" : "Shopping"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "todos" && todos.length > 0 && (
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
              {completedCount}/{todos.length} completed
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.primary, width: `${(completedCount / todos.length) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}
        {activeTab === "shopping" && shoppingItems.length > 0 && (
          <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
            {checkedShop}/{shoppingItems.length} items checked
          </Text>
        )}
      </View>

      {activeTab === "todos" ? (
        <FlatList
          data={sortedTodos}
          keyExtractor={(i) => i.id}
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <TodoItemRow
                item={item}
                onToggle={() => updateTodo(item.id, { completed: !item.completed })}
                onDelete={() => deleteTodo(item.id)}
              />
            </AnimatedListItem>
          )}
          contentContainerStyle={[styles.list, sortedTodos.length === 0 && { flex: 1 }]}
          ListEmptyComponent={
            <EmptyState icon="check-circle" title="No tasks yet" subtitle="Add tasks to stay organized" />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={sortedShopping}
          keyExtractor={(i) => i.id}
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <ShoppingItemRow
                item={item}
                onToggle={() => updateShoppingItem(item.id, { checked: !item.checked })}
                onDelete={() => deleteShoppingItem(item.id)}
              />
            </AnimatedListItem>
          )}
          contentContainerStyle={[styles.list, sortedShopping.length === 0 && { flex: 1 }]}
          ListEmptyComponent={
            <EmptyState icon="shopping-cart" title="Shopping list is empty" subtitle="Add items to your shopping list" />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {activeTab === "todos" ? "New Task" : "Add Item"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder={activeTab === "todos" ? "Task title..." : "Item name..."}
              placeholderTextColor={colors.mutedForeground}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            {activeTab === "todos" ? (
              <>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="Description (optional)"
                  placeholderTextColor={colors.mutedForeground}
                  value={newDesc}
                  onChangeText={setNewDesc}
                />
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Priority</Text>
                <View style={styles.priorityRow}>
                  {(["low", "medium", "high"] as const).map((p) => {
                    const pc = PRIORITY_COLORS[p];
                    return (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.priorityOption,
                          { backgroundColor: newPriority === p ? pc.bg : colors.muted, borderColor: newPriority === p ? pc.bg : colors.border },
                        ]}
                        onPress={() => setNewPriority(p)}
                      >
                        <Text style={{ color: newPriority === p ? pc.text : colors.mutedForeground, fontSize: 13, fontFamily: "Inter_500Medium" }}>
                          {pc.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Quantity (optional)"
                placeholderTextColor={colors.mutedForeground}
                value={newQty}
                onChangeText={setNewQty}
                keyboardType="numeric"
              />
            )}
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={handleAdd}
            >
              <Text style={styles.addBtnText}>Add</Text>
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
  tabRow: { flexDirection: "row", borderRadius: 14, padding: 4, gap: 4 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  progressRow: { gap: 6 },
  progressText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 170 },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  todoContent: { flex: 1 },
  todoTitle: { fontSize: 15, fontFamily: "Inter_500Medium" },
  todoDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  priorityText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalSheet: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    gap: 14,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  priorityRow: { flexDirection: "row", gap: 10 },
  priorityOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  addBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  addBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
