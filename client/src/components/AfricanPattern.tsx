import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, Pattern as SvgPattern } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

interface AfricanPatternProps {
  width?: number | string;
  height?: number | string;
  opacity?: number;
  variant?: 'adire' | 'ankara' | 'kente';
}

export default function AfricanPattern({
  width = '100%',
  height = 200,
  opacity = 0.08,
  variant = 'adire',
}: AfricanPatternProps) {
  const { colors } = useTheme();
  const color = colors.primary;

  if (variant === 'adire') {
    return (
      <View style={[styles.container, { width: width as any, height: height as any, opacity }]}>
        <Svg width="100%" height="100%" viewBox="0 0 400 200">
          <Defs>
            <SvgPattern id="adire" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <Circle cx="20" cy="20" r="8" fill="none" stroke={color} strokeWidth="1.5" />
              <Circle cx="0" cy="0" r="4" fill={color} />
              <Circle cx="40" cy="0" r="4" fill={color} />
              <Circle cx="0" cy="40" r="4" fill={color} />
              <Circle cx="40" cy="40" r="4" fill={color} />
              <Path d="M20 0 L20 12 M0 20 L12 20 M28 20 L40 20 M20 28 L20 40" stroke={color} strokeWidth="1" />
            </SvgPattern>
          </Defs>
          <Rect width="400" height="200" fill="url(#adire)" />
        </Svg>
      </View>
    );
  }

  if (variant === 'ankara') {
    return (
      <View style={[styles.container, { width: width as any, height: height as any, opacity }]}>
        <Svg width="100%" height="100%" viewBox="0 0 400 200">
          <Defs>
            <SvgPattern id="ankara" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <Path d="M30 0 Q45 15 30 30 Q15 15 30 0Z" fill={color} />
              <Path d="M0 30 Q15 45 0 60" fill="none" stroke={color} strokeWidth="2" />
              <Path d="M60 30 Q45 45 60 60" fill="none" stroke={color} strokeWidth="2" />
              <Circle cx="30" cy="30" r="3" fill={color} />
              <Path d="M15 15 L45 45 M45 15 L15 45" stroke={color} strokeWidth="0.5" opacity="0.5" />
            </SvgPattern>
          </Defs>
          <Rect width="400" height="200" fill="url(#ankara)" />
        </Svg>
      </View>
    );
  }

  // kente
  return (
    <View style={[styles.container, { width: width as any, height: height as any, opacity }]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 200">
        <Defs>
          <SvgPattern id="kente" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <Rect x="0" y="0" width="25" height="12" fill={color} opacity="0.6" />
            <Rect x="25" y="12" width="25" height="12" fill={color} opacity="0.4" />
            <Rect x="0" y="24" width="25" height="12" fill={color} opacity="0.3" />
            <Rect x="25" y="36" width="25" height="12" fill={color} opacity="0.6" />
            <Path d="M12.5 0 L12.5 50" stroke={color} strokeWidth="1" opacity="0.2" />
            <Path d="M37.5 0 L37.5 50" stroke={color} strokeWidth="1" opacity="0.2" />
          </SvgPattern>
        </Defs>
        <Rect width="400" height="200" fill="url(#kente)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
});
