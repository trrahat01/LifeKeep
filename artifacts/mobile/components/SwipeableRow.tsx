import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Animated as RNAnimated,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  onDelete: () => void;
  children: React.ReactNode;
}

const THRESHOLD = 80;

export function SwipeableRow({ onDelete, children }: Props) {
  const { colors } = useTheme();
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const actionVisible = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dy) < Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) {
          translateX.setValue(Math.max(g.dx, -THRESHOLD - 20));
          if (g.dx < -THRESHOLD && !actionVisible.current) {
            actionVisible.current = true;
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -THRESHOLD) {
          RNAnimated.spring(translateX, {
            toValue: -THRESHOLD,
            useNativeDriver: true,
          }).start();
        } else {
          RNAnimated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          actionVisible.current = false;
        }
      },
    })
  ).current;

  const handleDelete = () => {
    RNAnimated.timing(translateX, {
      toValue: -400,
      duration: 250,
      useNativeDriver: true,
    }).start(onDelete);
  };

  if (Platform.OS === "web") {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.deleteBtn, { backgroundColor: colors.destructive }]}>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteInner}>
          <Feather name="trash-2" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <RNAnimated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </RNAnimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  deleteBtn: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: THRESHOLD,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  deleteInner: {
    width: THRESHOLD,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
