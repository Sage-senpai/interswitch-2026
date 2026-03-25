import React, { useRef } from 'react';
import {
  View,
  Text,
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
import { formatNaira } from '../../src/utils/format';

// ─── Types ───────────────────────────────────────────────────

interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget: number;
  spent: number;
}

// ─── Mock Data ───────────────────────────────────────────────

const BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: '1', name: 'Food & Groceries', icon: 'restaurant',    color: '#FF6B6B', budget: 30000, spent: 22500 },
  { id: '2', name: 'Transport',        icon: 'car',           color: '#4ECDC4', budget: 15000, spent: 12000 },
  { id: '3', name: 'Education',        icon: 'school',        color: '#7E57C2', budget: 25000, spent: 8000  },
  { id: '4', name: 'Health',           icon: 'medical',       color: '#FF6F61', budget: 10000, spent: 3500  },
  { id: '5', name: 'Business',         icon: 'briefcase',     color: '#0066FF', budget: 20000, spent: 18000 },
  { id: '6', name: 'Savings',          icon: 'wallet',        color: '#66BB6A', budget: 15000, spent: 15000 },
  { id: '7', name: 'Utilities',        icon: 'flash',         color: '#FFA726', budget: 8000,  spent: 6500  },
  { id: '8', name: 'Entertainment',    icon: 'musical-notes', color: '#EC407A', budget: 7000,  spent: 4200  },
];

const TOTAL_BUDGET = 130000;
const TOTAL_SPENT  = 89700;

// ─── Helpers ─────────────────────────────────────────────────

function glassBg(isDark: boolean) {
  return {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as any)
      : {}),
  };
}

function getProgressColor(pct: number, success: string, warning: string, danger: string): string {
  if (pct < 70)  return success;
  if (pct < 90)  return warning;
  return danger;
}

// ─── FadeIn ──────────────────────────────────────────────────

function FadeIn({ delay = 0, children, style }: { delay?: number; children: React.ReactNode; style?: any }) {
  const opacity   = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 16,   useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

// ─── Circular Progress ───────────────────────────────────────

function CircularProgress({
  size,
  strokeWidth,
  progress,
  color,
  children,
}: {
  size: number;
  strokeWidth: number;
  progress: number; // 0–100
  color: string;
  children?: React.ReactNode;
}) {
  // Pure RN/web — draw with View borders for a simple ring approximation.
  // We use a thin outer ring + an arc overlay using rotation tricks.
  const radius     = (size - strokeWidth) / 2;
  const clipped    = Math.max(0, Math.min(100, progress));
  const rotation   = (clipped / 100) * 360;

  // Split into two halves to allow 0–360 coverage
  const firstHalf  = Math.min(rotation, 180);
  const secondHalf = Math.max(0, rotation - 180);

  const trackColor = '#00000020';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Track ring */}
      <View style={{
        position: 'absolute',
        width: size, height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: trackColor,
      }} />

      {/* Left half clip */}
      <View style={{
        position: 'absolute',
        width: size, height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
      }}>
        {/* First 180° */}
        <View style={{
          position: 'absolute',
          width: size / 2, height: size,
          right: 0,
          overflow: 'hidden',
        }}>
          <View style={{
            position: 'absolute',
            width: size, height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            transform: [{ rotate: `${firstHalf - 180}deg` }],
          }} />
        </View>

        {/* Second 180° — only shown if progress > 50% */}
        {secondHalf > 0 && (
          <View style={{
            position: 'absolute',
            width: size / 2, height: size,
            left: 0,
            overflow: 'hidden',
          }}>
            <View style={{
              position: 'absolute',
              right: 0,
              width: size, height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              transform: [{ rotate: `${secondHalf}deg` }],
            }} />
          </View>
        )}
      </View>

      {/* Center content */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}

// ─── Linear Progress Bar ─────────────────────────────────────

function ProgressBar({
  progress,
  color,
  height = 6,
}: {
  progress: number;
  color: string;
  height?: number;
}) {
  const clipped = Math.max(0, Math.min(100, progress));
  return (
    <View style={{
      height,
      borderRadius: height / 2,
      backgroundColor: 'rgba(128,128,128,0.15)',
      overflow: 'hidden',
    }}>
      <View style={{
        height,
        width: `${clipped}%`,
        borderRadius: height / 2,
        backgroundColor: color,
      }} />
    </View>
  );
}

// ─── Component ───────────────────────────────────────────────

export default function BudgetTrackerScreen() {
  const router   = useRouter();
  const { colors, isDark } = useTheme();
  const { isDesktop, isTablet, contentMaxWidth } = useResponsive();

  const overallPct     = Math.round((TOTAL_SPENT / TOTAL_BUDGET) * 100);
  const totalRemaining = TOTAL_BUDGET - TOTAL_SPENT;
  const overallColor   = getProgressColor(overallPct, colors.success, colors.warning, colors.danger);

  const useGrid = isDesktop || isTablet;

  // ── Render category card ──────────────────────────────────

  const renderCategoryCard = (cat: BudgetCategory, index: number) => {
    const pct       = Math.round((cat.spent / cat.budget) * 100);
    const remaining = cat.budget - cat.spent;
    const barColor  = getProgressColor(pct, colors.success, colors.warning, colors.danger);
    const isOver    = cat.spent >= cat.budget;

    return (
      <FadeIn
        key={cat.id}
        delay={400 + index * 60}
        style={useGrid ? { width: '48%' } : undefined}
      >
        <View style={[
          {
            borderRadius: BorderRadius.md,
            padding: Spacing.md,
            marginBottom: Spacing.sm,
            ...(isOver ? { borderLeftWidth: 3, borderLeftColor: colors.danger } : {}),
          },
          glassBg(isDark),
        ]}>
          {/* Header row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
            <View style={{
              width: 38, height: 38, borderRadius: 12,
              backgroundColor: cat.color + '20',
              alignItems: 'center', justifyContent: 'center',
              marginRight: Spacing.sm,
            }}>
              <Ionicons name={cat.icon as any} size={18} color={cat.color} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSize.sm, fontWeight: '700', color: colors.text }}>
                {cat.name}
              </Text>
              <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 1 }}>
                {pct}% used
                {isOver && (
                  <Text style={{ color: colors.danger }}> · Over budget!</Text>
                )}
              </Text>
            </View>

            {/* Pct badge */}
            <View style={{
              paddingHorizontal: 8, paddingVertical: 3,
              borderRadius: BorderRadius.full,
              backgroundColor: barColor + '20',
            }}>
              <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: barColor }}>
                {pct}%
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <ProgressBar progress={pct} color={barColor} height={7} />

          {/* Amount row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm - 2 }}>
            <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary }}>
              Spent: <Text style={{ fontWeight: '700', color: colors.text }}>{formatNaira(cat.spent)}</Text>
            </Text>
            <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary }}>
              {remaining >= 0 ? 'Left: ' : 'Over: '}
              <Text style={{ fontWeight: '700', color: remaining >= 0 ? colors.success : colors.danger }}>
                {formatNaira(Math.abs(remaining))}
              </Text>
            </Text>
          </View>
        </View>
      </FadeIn>
    );
  };

  // ── Main render ───────────────────────────────────────────
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        { padding: isDesktop ? Spacing.xl : Spacing.md, paddingBottom: 100 },
        isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' },
      ]}
    >
      {/* ── Header ── */}
      <FadeIn delay={0} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, marginTop: Spacing.sm }}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{
            width: 40, height: 40, borderRadius: 12,
            alignItems: 'center', justifyContent: 'center',
            marginRight: Spacing.sm,
            ...glassBg(isDark),
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: isDesktop ? FontSize.xxl : FontSize.xl, fontWeight: '800', color: colors.text }}>
            Budget Tracker
          </Text>
          <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 1 }}>
            March 2026
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            paddingHorizontal: Spacing.sm + 4, paddingVertical: Spacing.sm - 2,
            borderRadius: BorderRadius.full,
            backgroundColor: colors.primary + '18',
            borderWidth: 1, borderColor: colors.primary + '30',
          }}
        >
          <Ionicons name="calendar-outline" size={14} color={colors.primary} />
          <Text style={{ fontSize: FontSize.xs, fontWeight: '600', color: colors.primary }}>
            Monthly
          </Text>
        </TouchableOpacity>
      </FadeIn>

      {/* ── Monthly Overview Card ── */}
      <FadeIn delay={150} style={{ marginBottom: Spacing.lg }}>
        <View style={[
          {
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            overflow: 'hidden',
          },
          glassBg(isDark),
        ]}>
          {/* Decorative accent blob */}
          <View style={{
            position: 'absolute', top: -40, right: -40,
            width: 140, height: 140, borderRadius: 70,
            backgroundColor: overallColor + '10',
          }} />

          <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: colors.text, marginBottom: Spacing.md }}>
            Monthly Overview
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.lg }}>
            {/* Circular progress */}
            <CircularProgress
              size={isDesktop ? 130 : 110}
              strokeWidth={10}
              progress={overallPct}
              color={overallColor}
            >
              <Text style={{ fontSize: isDesktop ? FontSize.xl : FontSize.lg, fontWeight: '800', color: overallColor }}>
                {overallPct}%
              </Text>
              <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary }}>used</Text>
            </CircularProgress>

            {/* Stats column */}
            <View style={{ flex: 1, gap: Spacing.sm }}>
              {/* Total budget */}
              <View>
                <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>Total Budget</Text>
                <Text style={{ fontSize: FontSize.lg, fontWeight: '800', color: colors.text }}>
                  {formatNaira(TOTAL_BUDGET)}
                </Text>
              </View>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />

              {/* Spent / Remaining row */}
              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>Spent</Text>
                  <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: colors.danger }}>
                    {formatNaira(TOTAL_SPENT)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>Remaining</Text>
                  <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: colors.success }}>
                    {formatNaira(totalRemaining)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Overall progress bar */}
          <View style={{ marginTop: Spacing.md }}>
            <ProgressBar progress={overallPct} color={overallColor} height={8} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary }}>₦0</Text>
              <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary }}>
                {formatNaira(TOTAL_BUDGET)}
              </Text>
            </View>
          </View>
        </View>
      </FadeIn>

      {/* ── Section title ── */}
      <FadeIn delay={300} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
        <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: colors.text }}>
          Categories
        </Text>
        <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary }}>
          {BUDGET_CATEGORIES.length} categories
        </Text>
      </FadeIn>

      {/* ── Category Cards Grid ── */}
      <View style={useGrid
        ? { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }
        : undefined
      }>
        {BUDGET_CATEGORIES.map((cat, i) => renderCategoryCard(cat, i))}
      </View>

      {/* ── Set Budget Button ── */}
      <FadeIn delay={400 + BUDGET_CATEGORIES.length * 60} style={{ marginTop: Spacing.md }}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            borderRadius: BorderRadius.md,
            paddingVertical: Spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: Spacing.sm,
            backgroundColor: colors.primary,
            ...(Platform.OS === 'web'
              ? { boxShadow: `0 4px 20px ${colors.primary}55` } as any
              : {}),
          }}
        >
          <Ionicons name="settings-outline" size={18} color={colors.textInverse} />
          <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: colors.textInverse }}>
            Set Budget
          </Text>
        </TouchableOpacity>
      </FadeIn>

      {/* ── Footer tip ── */}
      <FadeIn delay={500 + BUDGET_CATEGORIES.length * 60}>
        <View style={[
          {
            flexDirection: 'row', alignItems: 'flex-start',
            gap: Spacing.sm,
            borderRadius: BorderRadius.md,
            padding: Spacing.md,
            marginTop: Spacing.md,
          },
          glassBg(isDark),
        ]}>
          <View style={{
            width: 30, height: 30, borderRadius: 9,
            backgroundColor: '#FFD700' + '25',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 1,
          }}>
            <Ionicons name="bulb" size={15} color="#FFD700" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: FontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 3 }}>
              Budget Tip
            </Text>
            <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, lineHeight: 18 }}>
              You've used <Text style={{ fontWeight: '700', color: overallColor }}>{overallPct}%</Text> of
              your monthly budget. Your Business category is at{' '}
              <Text style={{ fontWeight: '700', color: colors.warning }}>90%</Text> — consider reducing
              spending there to stay on track.
            </Text>
          </View>
        </View>
      </FadeIn>
    </ScrollView>
  );
}
