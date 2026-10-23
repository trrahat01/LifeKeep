import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { StatCard } from "@/components/StatCard";
import { getGreeting, formatShortDate, getDaysUntilBirthday } from "@/lib/utils";

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { notes, todos, shoppingItems, birthdays, bookmarks, importantInfo } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const greeting = getGreeting();
  const completedTodos = todos.filter((t) => t.completed).length;
  const upcomingBirthday = useMemo(() => {
    if (!birthdays.length) return null;
    return [...birthdays].sort(
      (a, b) => getDaysUntilBirthday(a.date) - getDaysUntilBirthday(b.date)
    )[0];
  }, [birthdays]);

  const recentItems = useMemo(() => {
    const all = [
      ...notes.map((n) => ({ ...n, _type: "note" as const })),
      ...todos.map((t) => ({ ...t, _type: "todo" as const })),
      ...bookmarks.map((b) => ({ ...b, _type: "bookmark" as const })),
    ]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 6);
    return all;
  }, [notes, todos, bookmarks]);

  const topPad =
    insets.top + (Platform.OS === "web" ? 67 : 0);

  const quickActions = [
    { icon: "file-text" as const, label: "Note", route: "/(tabs)/notes", color: "#A29BFE" },
    { icon: "check-circle" as const, label: "Task", route: "/(tabs)/tasks", color: "#55EFC4" },
    { icon: "gift" as const, label: "Birthday", route: "/(tabs)/vault", color: "#FD79A8" },
    { icon: "bookmark" as const, label: "Bookmark", route: "/(tabs)/vault", color: "#74B9FF" },
    { icon: "shield" as const, label: "Vault", route: "/(tabs)/vault", color: "#FDCB6E" },
    { icon: "search" as const, label: "Search", route: "/search", color: "#81ECEC" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 170 }}
      >
        <LinearGradient
          colors={
            isDark
              ? ["#1A1A2E", "#16213E", "#0D0D1A"]
              : ["#EEF0FF", "#F4F4FF", colors.background]
          }
          style={[styles.header, { paddingTop: topPad + 16 }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
                {greeting}
              </Text>
              <Text style={[styles.appName, { color: colors.foreground }]}>
                LifeKeep
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/search")}
              style={[
                styles.searchBtn,
                { backgroundColor: colors.primary + "22" },
              ]}
            >
              <Feather name="search" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {upcomingBirthday && (
            <View
              style={[
                styles.banner,
                { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" },
              ]}
            >
              <Feather name="gift" size={16} color={colors.primary} />
              <Text style={[styles.bannerText, { color: colors.primary }]}>
                {upcomingBirthday.title}'s birthday in{" "}
                {getDaysUntilBirthday(upcomingBirthday.date)} days
              </Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Overview
          </Text>
          <View style={styles.statsRow}>
            <StatCard
              label="Notes"
              value={notes.length}
              icon="file-text"
              gradient={["#A29BFE", "#6C5CE7"]}
              onPress={() => router.push("/(tabs)/notes")}
              index={0}
            />
            <StatCard
              label="Tasks"
              value={todos.length}
              icon="check-circle"
              gradient={["#55EFC4", "#00B894"]}
              onPress={() => router.push("/(tabs)/tasks")}
              index={1}
            />
            <StatCard
              label="Birthdays"
              value={birthdays.length}
              icon="gift"
              gradient={["#FD79A8", "#E84393"]}
              onPress={() => router.push("/(tabs)/vault")}
              index={2}
            />
          </View>
          <View style={[styles.statsRow, { marginTop: 10 }]}>
            <StatCard
              label="Shopping"
              value={shoppingItems.length}
              icon="shopping-cart"
              gradient={["#74B9FF", "#0984E3"]}
              onPress={() => router.push("/(tabs)/tasks")}
              index={3}
            />
            <StatCard
              label="Bookmarks"
              value={bookmarks.length}
              icon="bookmark"
              gradient={["#FDCB6E", "#E17055"]}
              onPress={() => router.push("/(tabs)/vault")}
              index={4}
            />
            <StatCard
              label="Vault"
              value={importantInfo.length}
              icon="shield"
              gradient={["#81ECEC", "#00CEC9"]}
              onPress={() => router.push("/(tabs)/vault")}
              index={5}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Quick Actions
          </Text>
          <View style={styles.quickGrid}>
            {quickActions.map((a) => (
              <TouchableOpacity
                key={a.label}
                style={[
                  styles.quickBtn,
                  {
                    backgroundColor: a.color + (isDark ? "22" : "18"),
                    borderColor: a.color + "44",
                  },
                ]}
                onPress={() => router.push(a.route as never)}
              >
                <View
                  style={[styles.quickIcon, { backgroundColor: a.color + "33" }]}
                >
                  <Feather name={a.icon} size={18} color={a.color} />
                </View>
                <Text style={[styles.quickLabel, { color: colors.foreground }]}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {recentItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Recent
            </Text>
            {recentItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.recentItem,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {
                  if (item._type === "note")
                    router.push(`/notes/${item.id}` as never);
                  else if (item._type === "todo")
                    router.push("/(tabs)/tasks");
                  else router.push("/(tabs)/vault");
                }}
              >
                <View
                  style={[
                    styles.recentIcon,
                    {
                      backgroundColor:
                        item._type === "note"
                          ? "#A29BFE22"
                          : item._type === "todo"
                          ? "#55EFC422"
                          : "#74B9FF22",
                    },
                  ]}
                >
                  <Feather
                    name={
                      item._type === "note"
                        ? "file-text"
                        : item._type === "todo"
                        ? "check-circle"
                        : "bookmark"
                    }
                    size={16}
                    color={
                      item._type === "note"
                        ? "#A29BFE"
                        : item._type === "todo"
                        ? "#55EFC4"
                        : "#74B9FF"
                    }
                  />
                </View>
                <View style={styles.recentContent}>
                  <Text
                    style={[styles.recentTitle, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {item.title || "Untitled"}
                  </Text>
                  <Text
                    style={[styles.recentMeta, { color: colors.mutedForeground }]}
                  >
                    {formatShortDate(item.updatedAt)}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {todos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Tasks Progress
              </Text>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                {completedTodos}/{todos.length}
              </Text>
            </View>
            <View
              style={[styles.progressTrack, { backgroundColor: colors.muted }]}
            >
              <LinearGradient
                colors={["#55EFC4", "#00B894"]}
                style={[
                  styles.progressFill,
                  { width: `${(completedTodos / todos.length) * 100}%` },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  appName: { fontSize: 30, fontFamily: "Inter_700Bold", marginTop: 2 },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  statsRow: { flexDirection: "row", gap: 10 },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickBtn: {
    width: "30%",
    flexGrow: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recentContent: { flex: 1 },
  recentTitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  recentMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
});
