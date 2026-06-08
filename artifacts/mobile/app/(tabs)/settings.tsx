import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Share,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme, AccentKey, ACCENT_PRIMARIES } from "@/context/ThemeContext";
import { useApp } from "@/context/AppContext";
import { exportAllData } from "@/lib/storage";

const AnimTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function SettingRow({
  icon,
  label,
  subtitle,
  right,
  onPress,
  destructive,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimTouchable
      style={[
        styles.row,
        style,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98, { damping: 12 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: destructive ? "#FF475722" : colors.primary + "22" },
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={destructive ? colors.destructive : colors.primary}
        />
      </View>
      <View style={styles.rowContent}>
        <Text
          style={[
            styles.rowLabel,
            { color: destructive ? colors.destructive : colors.foreground },
          ]}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (
        onPress ? <Feather name="chevron-right" size={16} color={colors.mutedForeground} /> : null
      )}
    </AnimTouchable>
  );
}

function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();
  const offset = useSharedValue(isDark ? 24 : 0);
  const trackStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  const handleToggle = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    offset.value = withSpring(isDark ? 0 : 24, { damping: 14 });
    toggleTheme();
  };

  return (
    <TouchableOpacity
      style={[styles.toggle, { backgroundColor: isDark ? colors.primary : colors.muted, borderColor: colors.border }]}
      onPress={handleToggle}
      activeOpacity={0.85}
    >
      <Animated.View style={[styles.toggleThumb, trackStyle, { backgroundColor: isDark ? "#FFF" : colors.mutedForeground }]} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { colors, isDark, accentKey, setAccentKey } = useTheme();
  const { notes, todos, shoppingItems, birthdays, importantInfo, bookmarks, resetAllData } = useApp();
  const insets = useSafeAreaInsets();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const totalItems = notes.length + todos.length + shoppingItems.length + birthdays.length + importantInfo.length + bookmarks.length;

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      if (Platform.OS === "web") {
        Alert.alert("Exported", "Data exported to console.");
        console.log(data);
      } else {
        await Share.share({ message: data, title: "LifeVault Export" });
      }
    } catch {
      Alert.alert("Export failed");
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset All Data",
      "This will permanently delete all your data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetAllData();
            if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const accentOptions: AccentKey[] = ["purple", "coral", "blue", "green", "orange"];
  const accentLabels: Record<AccentKey, string> = {
    purple: "Indigo",
    coral: "Pink",
    blue: "Blue",
    green: "Teal",
    orange: "Amber",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        </View>

        <LinearGradient
          colors={isDark ? ["#1A1A2E", "#16213E"] : ["#EEF0FF", "#F4F4FF"]}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.vaultIcon, { backgroundColor: colors.primary + "33" }]}>
            <Feather name="shield" size={28} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileTitle, { color: colors.foreground }]}>LifeVault</Text>
            <Text style={[styles.profileSub, { color: colors.mutedForeground }]}>
              {totalItems} items · Stored locally
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>APPEARANCE</Text>
          <SettingRow
            icon={isDark ? "moon" : "sun"}
            label="Dark Mode"
            subtitle={isDark ? "Dark theme active" : "Light theme active"}
            right={<ThemeToggle />}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCENT COLOR</Text>
          <View style={[styles.accentGrid, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {accentOptions.map((key) => {
              const p = isDark ? ACCENT_PRIMARIES[key].dark : ACCENT_PRIMARIES[key].light;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.accentDot, { backgroundColor: p, borderWidth: accentKey === key ? 3 : 0, borderColor: "#FFF" }]}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                    setAccentKey(key);
                  }}
                >
                  {accentKey === key && <Feather name="check" size={12} color="#FFF" />}
                </TouchableOpacity>
              );
            })}
            {accentOptions.map((key) => (
              <Text
                key={`l${key}`}
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_400Regular",
                  color: accentKey === key ? colors.primary : colors.mutedForeground,
                  textAlign: "center",
                  width: 44,
                }}
              >
                {accentLabels[key]}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DATA</Text>
          <SettingRow icon="download" label="Export Data" subtitle="Share your data as JSON" onPress={handleExport} />
          <SettingRow icon="info" label="About" subtitle="LifeVault v1.0 · Offline-first personal organizer" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DANGER ZONE</Text>
          <SettingRow
            icon="trash-2"
            label="Reset All Data"
            subtitle="Permanently delete everything"
            onPress={handleReset}
            destructive
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    gap: 16,
  },
  vaultIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  profileInfo: { flex: 1 },
  profileTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  profileSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 20, gap: 8 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  rowIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  rowSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
    borderWidth: 1,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  accentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "space-around",
  },
  accentDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
});
