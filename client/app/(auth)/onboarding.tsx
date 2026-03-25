import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ListRenderItemInfo,
  Platform,
  StatusBar,
  Animated as RNAnimated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'school',
    iconColor: '#B39DDB',
    iconBg: 'rgba(179,157,219,0.15)',
    title: 'Learn About Money',
    subtitle: 'Short, fun lessons about saving and spending',
  },
  {
    id: '2',
    icon: 'wallet',
    iconColor: '#EC407A',
    iconBg: 'rgba(236,64,122,0.12)',
    title: 'Save Small-Small',
    subtitle: 'Start with just ₦100. Watch your money grow',
  },
  {
    id: '3',
    icon: 'people',
    iconColor: '#66BB6A',
    iconBg: 'rgba(102,187,106,0.15)',
    title: 'Grow Together',
    subtitle: 'Join your group. Support each other',
  },
];

// ─── Dot component using RN Animated ─────────────────────────────────────────

function Dot({ index, currentIndex }: { index: number; currentIndex: number }) {
  const { colors } = useTheme();
  const width = useRef(new RNAnimated.Value(index === 0 ? 24 : 8)).current;
  const opacity = useRef(new RNAnimated.Value(index === 0 ? 1 : 0.35)).current;

  useEffect(() => {
    const isActive = currentIndex === index;
    RNAnimated.parallel([
      RNAnimated.spring(width, {
        toValue: isActive ? 24 : 8,
        damping: 15,
        stiffness: 180,
        useNativeDriver: false,
      }),
      RNAnimated.timing(opacity, {
        toValue: isActive ? 1 : 0.35,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentIndex]);

  return (
    <RNAnimated.View
      style={[
        styles.dot,
        { width, opacity, backgroundColor: colors.primary },
      ]}
    />
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Next button background color animation
  const btnColorProgress = useRef(new RNAnimated.Value(0)).current;

  const isLast = currentIndex === SLIDES.length - 1;

  useEffect(() => {
    RNAnimated.timing(btnColorProgress, {
      toValue: isLast ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isLast]);

  const btnBackgroundColor = btnColorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary, SLIDES[2].iconColor],
  });

  const handleSkip = () => {
    router.replace('/(auth)/login?mode=register' as any);
  };

  const handleNext = () => {
    if (isLast) {
      router.replace('/(auth)/login?mode=register' as any);
      return;
    }
    const nextIndex = currentIndex + 1;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  };

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: ListRenderItemInfo<OnboardingSlide>) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      {/* Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={56} color={item.iconColor} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.flatList}
      />

      {/* Bottom area */}
      <View style={styles.bottomArea}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} currentIndex={currentIndex} />
          ))}
        </View>

        {/* Next / Get Started button */}
        <RNAnimated.View style={[styles.nextBtn, { backgroundColor: btnBackgroundColor }]}>
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={styles.nextBtnInner}
          >
            <Text style={styles.nextBtnText}>
              {isLast ? 'Get Started' : 'Next'}
            </Text>
            {!isLast && (
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
            )}
          </TouchableOpacity>
        </RNAnimated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0,
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 52,
    right: 24,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 14,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    maxWidth: 280,
  },
  bottomArea: {
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
