import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: string;
  height?: number;
}

export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  color,
  height = 10,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const fillColor = color || colors.primary;

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
          {showPercentage && (
            <Text style={[styles.percentage, { color: colors.text }]}>{clampedProgress}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: colors.surfaceSecondary }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              backgroundColor: fillColor,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: { fontSize: FontSize.sm },
  percentage: { fontSize: FontSize.sm, fontWeight: '600' },
  track: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  fill: { borderRadius: BorderRadius.full },
});
