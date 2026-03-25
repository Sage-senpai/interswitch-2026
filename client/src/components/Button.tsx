import React, { useMemo } from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  // ── Spring scale animation ────────────────────────────────
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 10, stiffness: 300 });
  };

  const handlePress = () => {
    // ── Haptic feedback (no-op on web / unsupported devices) ──
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available on this platform — silently ignore
    }
    onPress();
  };

  // ── Theme-driven variant styles ───────────────────────────
  const themed = useMemo(
    () => ({
      primary:   { backgroundColor: colors.primary },
      secondary: { backgroundColor: colors.primaryDark },
      outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
      ghost:     { backgroundColor: 'transparent' },
      text_primary:   { color: colors.textInverse },
      text_secondary: { color: colors.textInverse },
      text_outline:   { color: colors.primary },
      text_ghost:     { color: colors.primary },
    }),
    [colors],
  );

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.base,
        themed[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? colors.primary
              : colors.textInverse
          }
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              themed[`text_${variant}`],
              styles[`textSize_${size}`],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  disabled: { opacity: 0.5 },
  size_sm: { paddingVertical: Spacing.sm,      paddingHorizontal: Spacing.md },
  size_md: { paddingVertical: Spacing.md - 2,  paddingHorizontal: Spacing.lg },
  size_lg: { paddingVertical: Spacing.md + 2,  paddingHorizontal: Spacing.xl },
  text:        { fontWeight: '600' },
  textSize_sm: { fontSize: FontSize.sm },
  textSize_md: { fontSize: FontSize.md },
  textSize_lg: { fontSize: FontSize.lg },
});
