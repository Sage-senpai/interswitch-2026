import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';

// ─── Factor definitions ───────────────────────────────────────────────────────

interface Factor {
  key: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  score: number;
  weight: number;
  detail: string;
}

const FACTORS: Factor[] = [
  {
    key: 'savings',
    name: 'Savings Consistency',
    icon: 'trending-up',
    score: 72,
    weight: 0.3,
    detail: 'You save regularly',
  },
  {
    key: 'literacy',
    name: 'Financial Literacy',
    icon: 'school',
    score: 25,
    weight: 0.2,
    detail: '3 of 12 lessons completed',
  },
  {
    key: 'budget',
    name: 'Budget Discipline',
    icon: 'calculator',
    score: 69,
    weight: 0.2,
    detail: '69% of budget used wisely',
  },
  {
    key: 'emergency',
    name: 'Emergency Fund',
    icon: 'shield-checkmark',
    score: 45,
    weight: 0.15,
    detail: '₦15,000 saved for emergencies',
  },
  {
    key: 'community',
    name: 'Community Engagement',
    icon: 'people',
    score: 60,
    weight: 0.15,
    detail: 'Active in 1 WAG group',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeOverallScore(factors: Factor[]): number {
  return Math.round(
    factors.reduce((acc, f) => acc + f.score * f.weight, 0),
  );
}

function scoreColor(score: number, colors: ReturnType<typeof useTheme>['colors']): string {
  if (score <= 40) return colors.danger;
  if (score <= 60) return colors.warning;
  if (score <= 80) return colors.success;
  return '#F9A825'; // gold
}

function scoreLabel(score: number): string {
  if (score <= 40) return 'Needs Work';
  if (score <= 60) return 'Getting There';
  if (score <= 80) return 'Good';
  return 'Excellent';
}

const TIPS = [
  {
    icon: 'book-outline' as keyof typeof Ionicons.glyphMap,
    text: 'Complete 3 more lessons to boost your Financial Literacy score.',
  },
  {
    icon: 'shield-outline' as keyof typeof Ionicons.glyphMap,
    text: 'Add ₦5,000 to your emergency fund this week.',
  },
  {
    icon: 'people-outline' as keyof typeof Ionicons.glyphMap,
    text: 'Join one more WAG group to strengthen your community score.',
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HealthScoreScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { contentMaxWidth } = useResponsive();

  const overallScore = computeOverallScore(FACTORS);
  const color = scoreColor(overallScore, colors);
  const label = scoreLabel(overallScore);

  // Animated count-up for score display
  const animatedScore = useRef(new Animated.Value(0)).current;
  const displayScore = useRef(0);
  const scoreTextRef = useRef<Text>(null);

  useEffect(() => {
    Animated.timing(animatedScore, {
      toValue: overallScore,
      duration: 1400,
      useNativeDriver: false,
    }).start();

    animatedScore.addListener(({ value }) => {
      displayScore.current = Math.round(value);
      scoreTextRef.current?.setNativeProps({ text: String(Math.round(value)) });
    });

    return () => animatedScore.removeAllListeners();
  }, []);

  // Animated progress bars
  const barAnims = useRef(FACTORS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = FACTORS.map((factor, i) =>
      Animated.timing(barAnims[i], {
        toValue: factor.score / 100,
        duration: 900 + i * 120,
        useNativeDriver: false,
      }),
    );
    Animated.stagger(100, animations).start();
  }, []);

  // Glassmorphism
  const glass = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    borderRadius: BorderRadius.lg,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any)
      : {}),
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } : null,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.accentLight }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Financial Health</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Score circle */}
      <View style={styles.scoreSection}>
        <View style={[styles.scoreRing, { borderColor: color + '30' }]}>
          <View style={[styles.scoreRingInner, { borderColor: color + '80' }]}>
            <View style={[styles.scoreCircle, glass, { shadowColor: color }]}>
              <Text
                ref={scoreTextRef}
                style={[styles.scoreNumber, { color }]}
              >
                0
              </Text>
              <Text style={[styles.scoreMax, { color: colors.textLight }]}>/100</Text>
              <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Factor cards */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Score Breakdown</Text>

      {FACTORS.map((factor, i) => {
        const fColor = scoreColor(factor.score, colors);
        const widthInterp = barAnims[i].interpolate({
          inputRange: [0, 1],
          outputRange: ['0%', '100%'],
        });

        return (
          <View key={factor.key} style={[styles.factorCard, glass]}>
            <View style={styles.factorTop}>
              <View style={[styles.factorIconWrap, { backgroundColor: fColor + '20' }]}>
                <Ionicons name={factor.icon} size={20} color={fColor} />
              </View>
              <View style={styles.factorInfo}>
                <Text style={[styles.factorName, { color: colors.text }]}>{factor.name}</Text>
                <Text style={[styles.factorDetail, { color: colors.textSecondary }]}>
                  {factor.detail}
                </Text>
              </View>
              <Text style={[styles.factorScore, { color: fColor }]}>{factor.score}</Text>
            </View>

            {/* Progress bar */}
            <View style={[styles.barTrack, { backgroundColor: colors.borderLight }]}>
              <Animated.View
                style={[
                  styles.barFill,
                  { backgroundColor: fColor, width: widthInterp },
                ]}
              />
            </View>
          </View>
        );
      })}

      {/* Tips to Improve */}
      <View style={[styles.tipsCard, glass]}>
        <View style={styles.tipsTitleRow}>
          <Ionicons name="bulb" size={18} color={colors.warning} />
          <Text style={[styles.tipsTitle, { color: colors.text }]}>Tips to Improve</Text>
        </View>
        {TIPS.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={[styles.tipIconWrap, { backgroundColor: colors.accentLight }]}>
              <Ionicons name={tip.icon} size={16} color={colors.primary} />
            </View>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip.text}</Text>
          </View>
        ))}
      </View>

      {/* AI Insight */}
      <View style={[styles.aiCard, { borderColor: colors.primary + '40', backgroundColor: colors.accentLight }]}>
        <View style={styles.aiHeader}>
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={[styles.aiLabel, { color: colors.primary }]}>AI Insight</Text>
        </View>
        <Text style={[styles.aiText, { color: colors.text }]}>
          Based on your activity, focusing on completing more lessons could boost your score by{' '}
          <Text style={{ fontWeight: '700', color: colors.primary }}>15 points</Text>.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },

  // Score circle
  scoreSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  scoreRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingInner: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  scoreNumber: {
    fontSize: 52,
    fontWeight: '900',
    lineHeight: 56,
  },
  scoreMax: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginTop: -2,
  },
  scoreLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: Spacing.xs,
    letterSpacing: 0.5,
  },

  // Factors
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  factorCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  factorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  factorIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorInfo: {
    flex: 1,
  },
  factorName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  factorDetail: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  factorScore: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Tips
  tipsCard: {
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tipsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tipsTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  tipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },

  // AI insight
  aiCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  aiLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  aiText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
