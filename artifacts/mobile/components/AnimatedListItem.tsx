import React, { useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface Props {
  index: number;
  children: React.ReactNode;
}

export function AnimatedListItem({ index, children }: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const delay = Math.min(index * 60, 400);
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) })
      );
      translateY.value = withDelay(
        delay,
        withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) })
      );
    }
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
