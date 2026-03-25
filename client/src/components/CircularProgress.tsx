import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0–100
  color?: string;
  trackColor?: string;
}

export default function CircularProgress({
  size = 70,
  strokeWidth = 6,
  progress,
  color,
  trackColor,
}: CircularProgressProps) {
  const { colors } = useTheme();

  const strokeColor = color ?? colors.primary;
  const bgStrokeColor = trackColor ?? colors.border;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const clampedProgress = Math.min(100, Math.max(0, progress));
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(clampedProgress, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedProgress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (animatedProgress.value / 100) * circumference;
    return { strokeDashoffset };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Track ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={bgStrokeColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          // rotate so it starts from 12 o'clock
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <Text
        style={{
          color: colors.text,
          fontSize: size * 0.2,
          fontWeight: '700',
          lineHeight: size * 0.25,
        }}
      >
        {Math.round(clampedProgress)}%
      </Text>
    </View>
  );
}
