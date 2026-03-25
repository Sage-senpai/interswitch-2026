import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface SkeletonBoxProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
}

export default function SkeletonBox({ width, height, borderRadius = 8 }: SkeletonBoxProps) {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const backgroundColor = isDark
    ? 'rgba(179,157,219,0.15)'
    : 'rgba(236,64,122,0.1)';

  return (
    <Animated.View
      style={[
        {
          opacity,
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor,
        },
      ]}
    />
  );
}
