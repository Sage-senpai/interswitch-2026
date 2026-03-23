import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { loadAuth } from '../src/store/authSlice';
import { RootState, AppDispatch } from '../src/store';
import { Colors, FontSize, Spacing } from '../src/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const init = async () => {
      await dispatch(loadAuth());
      // Short delay for splash branding
      setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/welcome');
        }
      }, 1500);
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.emoji}>👛</Text>
        <Text style={styles.title}>Purse</Text>
        <Text style={styles.subtitle}>
          Financial literacy & empowerment{'\n'}for Nigerian women
        </Text>
      </View>
      <Text style={styles.tagline}>One saved naira at a time</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.textInverse,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  tagline: {
    position: 'absolute',
    bottom: 60,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
  },
});
