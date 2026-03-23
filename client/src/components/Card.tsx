import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius, Spacing, FontSize } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'accent';
}

export default function Card({ children, title, subtitle, onPress, style, variant = 'default' }: CardProps) {
  const { colors, isDark } = useTheme();
  const Wrapper = onPress ? TouchableOpacity : View;

  const themed = useMemo(() => ({
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    elevated: {
      backgroundColor: colors.surface,
      borderWidth: 0,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    accent: {
      backgroundColor: colors.walletBg,
      borderColor: colors.walletBg,
    },
    title: { color: variant === 'accent' ? colors.walletText : colors.text },
    subtitle: { color: variant === 'accent' ? colors.walletTextMuted : colors.textSecondary },
  }), [colors, isDark, variant]);

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.card,
        themed.card,
        variant === 'elevated' && themed.elevated,
        variant === 'accent' && themed.accent,
        style,
      ]}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={[styles.title, themed.title]}>{title}</Text>}
          {subtitle && <Text style={[styles.subtitle, themed.subtitle]}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  header: { marginBottom: Spacing.sm },
  title: { fontSize: FontSize.md, fontWeight: '700' },
  subtitle: { fontSize: FontSize.sm, marginTop: 2 },
});
