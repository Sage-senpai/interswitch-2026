import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

interface SkeletonBoxProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
}

export default function SkeletonBox({ width, height, borderRadius = 8 }: SkeletonBoxProps) {
  const { isDark } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const backgroundColor = isDark
    ? 'rgba(179,157,219,0.15)'
    : 'rgba(236,64,122,0.1)';

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor,
        },
      ]}
    />
  );
}
