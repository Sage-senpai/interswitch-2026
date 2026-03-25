import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

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

  // Animated.Value drives the progress (0–100); a listener syncs it to state
  // so the SVG Circle re-renders with the correct strokeDashoffset.
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);

  useEffect(() => {
    const id = animatedProgress.addListener(({ value }) => {
      setStrokeDashoffset(circumference - (value / 100) * circumference);
    });
    return () => animatedProgress.removeListener(id);
  }, [circumference]);

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: clampedProgress,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // drives JS-side state, not a native prop
    }).start();
  }, [clampedProgress]);

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
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
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
