import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, AppState, AppStateStatus, Modal, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getLockSettings, hashPin, authenticateWithBiometrics, LockSettings } from "@/lib/security";
import { useTheme } from "@/context/ThemeContext";

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isLocked, setIsLocked] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settings, setSettings] = useState<LockSettings | null>(null);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const appState = useRef(AppState.currentState);

  const triggerBio = async (s: LockSettings) => {
    const ok = await authenticateWithBiometrics("Unlock LifeKeep");
    if (ok) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsLocked(false);
      setEnteredPin("");
    }
  };

  const check = useCallback(async () => {
    const s = await getLockSettings();
    setSettings(s);
    if (s.enabled) {
      setIsLocked(true);
      if (s.useBiometrics) triggerBio(s);
    } else {
      setIsLocked(false);
    }
    setSettingsLoaded(true);
  }, []);

  useEffect(() => {
    check();
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === "active") check();
      appState.current = next;
    });
    return () => sub.remove();
  }, [check]);

  const handleKey = async (val: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPinError(false);
    if (val === "DEL") { setEnteredPin((p) => p.slice(0, -1)); return; }
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + val;
      setEnteredPin(nextPin);
      if (nextPin.length === 4) {
        if (!settings?.pinHash) { setIsLocked(false); return; }
        const inputHash = await hashPin(nextPin);
        if (inputHash === settings.pinHash) {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setIsLocked(false);
          setEnteredPin("");
        } else {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setPinError(true);
          setTimeout(() => setEnteredPin(""), 400);
        }
      }
    }
  };

  if (!settingsLoaded) return null;
  if (!isLocked) return <>{children}</>;

  return (
    <View style={{ flex: 1 }}>
      {children}
      <Modal visible={isLocked} animationType="fade" transparent={false}>
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.header}>
            <View style={[styles.circle, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="lock" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>LifeKeep Locked</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Enter PIN or use biometrics</Text>
          </View>
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: pinError ? colors.destructive : enteredPin.length > i ? colors.primary : colors.muted,
                    borderColor: pinError ? colors.destructive : enteredPin.length > i ? colors.primary : colors.border,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.keypad}>
            {[["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["BIO", "0", "DEL"]].map((row, r) => (
              <View key={r} style={styles.row}>
                {row.map((btn) => {
                  if (btn === "BIO") {
                    if (!settings?.useBiometrics) return <View key={btn} style={styles.btnPlaceholder} />;
                    return (
                      <TouchableOpacity key={btn} style={[styles.btn, { backgroundColor: colors.primary + "18" }]} onPress={() => settings && triggerBio(settings)}>
                        <Feather name="shield" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    );
                  }
                  if (btn === "DEL") {
                    return (
                      <TouchableOpacity key={btn} style={[styles.btn, { backgroundColor: colors.muted }]} onPress={() => handleKey("DEL")}>
                        <Feather name="delete" size={22} color={colors.foreground} />
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity key={btn} style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => handleKey(btn)}>
                      <Text style={[styles.btnText, { color: colors.foreground }]}>{btn}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24 },
  header: { alignItems: "center", marginTop: 20 },
  circle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  dotsRow: { flexDirection: "row", gap: 16, marginVertical: 30 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  keypad: { width: "100%", maxWidth: 300, gap: 16, marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  btn: { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  btnPlaceholder: { width: 70, height: 70 },
  btnText: { fontSize: 24, fontFamily: "Inter_600SemiBold" },
});
