import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { loadAuth } from '../src/store/authSlice';
import { RootState, AppDispatch } from '../src/store';
import { useTheme } from '../src/hooks/useTheme';
import AfricanPattern from '../src/components/AfricanPattern';
import { FontSize, Spacing } from '../src/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { colors, isDark } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    const init = async () => {
      await dispatch(loadAuth());
      setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/welcome');
        }
      }, 2000);
    };
    init();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : colors.primaryDark }]}>
      <AfricanPattern width="100%" height="100%" opacity={0.06} variant="ankara" />
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[styles.logoBox, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="wallet" size={48} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.title}>Purse</Text>
        <Text style={styles.subtitle}>Financial empowerment{'\n'}for Nigerian women</Text>
      </Animated.View>
      <Text style={styles.tagline}>One saved naira at a time</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { alignItems: 'center', zIndex: 1 },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  tagline: {
    position: 'absolute',
    bottom: 50,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
    zIndex: 1,
  },
});
