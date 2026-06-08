import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  colors?: [string, string];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  glass?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function GradientCard({ colors: gradColors, onPress, style, children, glass }: Props) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const inner = gradColors ? (
    <LinearGradient
      colors={gradColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  ) : (
    <View
      style={[
        styles.plain,
        {
          backgroundColor: glass
            ? isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(255,255,255,0.85)"
            : colors.card,
          borderColor: colors.border,
          borderWidth: glass ? 1 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return <View style={animStyle}>{inner}</View>;

  return (
    <AnimatedTouchable
      style={animStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      {inner}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
  },
  plain: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
  },
});
