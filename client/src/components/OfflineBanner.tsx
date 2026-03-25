import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface OfflineBannerProps {
  isOffline: boolean;
}

export default function OfflineBanner({ isOffline }: OfflineBannerProps) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOffline ? 0 : -60,
      damping: 18,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  }, [isOffline]);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: colors.warning,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents={isOffline ? 'auto' : 'none'}
    >
      <View style={styles.inner}>
        <Text style={styles.dot}>●</Text>
        <Text style={styles.text}>
          You're offline. Changes will sync when connected.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 8,
  },
  text: {
    color: '#1A1A1A',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
