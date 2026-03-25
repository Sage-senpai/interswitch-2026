import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import ProgressBar from '../../src/components/ProgressBar';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { savingsAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

const CATEGORY_ICONS: Record<string, string> = {
  EDUCATION: '📚',
  BUSINESS: '💼',
  HEALTH: '🏥',
  EMERGENCY: '🆘',
  FAMILY: '👨‍👩‍👧‍👦',
  CUSTOM: '🎯',
};

const CATEGORY_COLORS: Record<string, string> = {
  EDUCATION: '#7C8CF8',
  BUSINESS: '#F06292',
  HEALTH: '#81C784',
  EMERGENCY: '#FFB74D',
  FAMILY: '#CE93D8',
  CUSTOM: '#F48FB1',
};

// Circular progress ring drawn with Views + rotation trick (no SVG dep)
function CircleProgress({ progress, size, color }: { progress: number; size: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(100, progress),
      duration: 1100,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeWidth = size * 0.085;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // We fake the ring with two half-circle clips (pure View approach)
  const halfSize = size / 2;
  const pct = Math.min(100, progress) / 100;
  const rightDeg = pct >= 0.5 ? 180 : pct * 360;
  const leftDeg = pct > 0.5 ? (pct - 0.5) * 360 : 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Track */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: halfSize,
          borderWidth: strokeWidth,
          borderColor: 'rgba(150,150,150,0.15)',
        }}
      />
      {/* Right fill */}
      <View style={{
        position: 'absolute', width: size, height: size,
        overflow: 'hidden',
        left: 0, top: 0,
      }}>
        <View style={{ width: size, height: size, overflow: 'hidden', left: halfSize }}>
          <Animated.View style={{
            width: size,
            height: size,
            borderRadius: halfSize,
            borderWidth: strokeWidth,
            borderColor: color,
            position: 'absolute',
            left: -halfSize,
            transform: [{ rotate: `${rightDeg}deg` }],
          }} />
        </View>
      </View>
      {/* Left fill (only shown past 50%) */}
      {pct > 0.5 && (
        <View style={{
          position: 'absolute', width: size, height: size,
          overflow: 'hidden',
          left: 0, top: 0,
        }}>
          <View style={{ width: size, height: size, overflow: 'hidden', right: halfSize, left: 0 }}>
            <Animated.View style={{
              width: size,
              height: size,
              borderRadius: halfSize,
              borderWidth: strokeWidth,
              borderColor: color,
              position: 'absolute',
              left: 0,
              transform: [{ rotate: `${leftDeg}deg` }],
            }} />
          </View>
        </View>
      )}
      {/* Center content */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: size * 0.2, fontWeight: '800', color }}>
          {Math.round(Math.min(100, progress))}%
        </Text>
      </View>
    </View>
  );
}

function GoalCard({
  goal,
  index,
  colors,
  onPress,
  isDesktop,
}: {
  goal: any;
  index: number;
  colors: any;
  onPress: () => void;
  isDesktop: boolean;
}) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const borderColor = CATEGORY_COLORS[goal.category] || '#F48FB1';
  const s = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  return (
    <Animated.View
      style={[
        isDesktop ? s.goalCardDesktop : undefined,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.82}
        style={[s.goalCard, { borderLeftColor: borderColor, borderLeftWidth: 4 }]}
      >
        <View style={s.goalHeader}>
          <View style={[s.goalIconWrap, { backgroundColor: borderColor + '22' }]}>
            <Text style={s.goalIcon}>{CATEGORY_ICONS[goal.category] || '🎯'}</Text>
          </View>
          <View style={s.goalInfo}>
            <Text style={s.goalName}>{goal.name}</Text>
            <Text style={[s.goalCategory, { color: borderColor }]}>{goal.category}</Text>
          </View>
          {goal.hasAutoPay && (
            <View style={s.autoPayBadge}>
              <Ionicons name="repeat" size={11} color={colors.success} />
              <Text style={s.autoPayText}>Auto</Text>
            </View>
          )}
        </View>

        <View style={s.goalAmounts}>
          <Text style={s.goalCurrent}>{formatNaira(goal.current)}</Text>
          <Text style={s.goalTarget}>/ {formatNaira(goal.target)}</Text>
        </View>

        <ProgressBar
          progress={goal.progress}
          color={goal.progress >= 100 ? colors.success : borderColor}
        />

        {goal.progress >= 100 && (
          <View style={s.goalReached}>
            <Ionicons name="trophy" size={15} color={colors.accent} />
            <Text style={s.goalReachedText}>Goal reached!</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SavingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isDesktop, contentMaxWidth } = useResponsive();
  const [goals, setGoals] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mount animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const fabScale = useRef(new Animated.Value(0)).current;

  const fetchGoals = async () => {
    try {
      const res = await savingsAPI.getGoals();
      setGoals(res.data.data || []);
    } catch {
      setGoals([]);
    }
  };

  useEffect(() => {
    fetchGoals();
    Animated.parallel([
      Animated.spring(headerFade, { toValue: 1, useNativeDriver: true, delay: 50 }),
      Animated.spring(headerSlide, { toValue: 0, useNativeDriver: true, delay: 50 }),
      Animated.spring(fabScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true, delay: 600 }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGoals();
    setRefreshing(false);
  };

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const s = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  return (
    <View style={s.wrapper}>
      <ScrollView
        style={s.container}
        contentContainerStyle={[
          s.content,
          isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Summary Card */}
        <Animated.View style={{ opacity: headerFade, transform: [{ translateY: headerSlide }] }}>
          <View style={s.summaryCard}>
            {/* Decorative blobs */}
            <View style={s.blobTL} />
            <View style={s.blobBR} />

            <View style={s.summaryInner}>
              {/* Ring */}
              <CircleProgress
                progress={overallProgress}
                size={isDesktop ? 120 : 100}
                color="#fff"
              />
              {/* Text */}
              <View style={s.summaryText}>
                <Text style={s.summaryLabel}>Total Saved</Text>
                <Text style={s.summaryAmount}>{formatNaira(totalSaved)}</Text>
                {totalTarget > 0 && (
                  <Text style={s.summaryTarget}>of {formatNaira(totalTarget)} target</Text>
                )}
                {goals.length > 0 && (
                  <View style={s.summaryPill}>
                    <Ionicons name="flag" size={11} color="rgba(255,255,255,0.9)" />
                    <Text style={s.summaryPillText}>{goals.length} active {goals.length === 1 ? 'goal' : 'goals'}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Goals List */}
        {goals.length === 0 ? (
          <Animated.View style={[s.emptyState, { opacity: headerFade }]}>
            <View style={s.emptyIconWrap}>
              <Text style={s.emptyIconBg}>✨</Text>
              <Text style={s.emptyIconMain}>🎯</Text>
            </View>
            <Text style={s.emptyTitle}>Your journey starts here</Text>
            <Text style={s.emptyText}>
              Set your first savings goal and let Purse help you get there — one naira at a time.
            </Text>
            <Button
              title="Create My First Goal"
              onPress={() => router.push('/savings/new-goal')}
              icon={<Ionicons name="add-circle" size={20} color={colors.textInverse} />}
              style={s.emptyBtn}
            />
          </Animated.View>
        ) : (
          <View style={s.goalsSection}>
            <Text style={s.sectionTitle}>Your Goals</Text>
            <View style={[s.goalsList, isDesktop && s.goalsGrid]}>
              {goals.map((goal, i) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  index={i}
                  colors={colors}
                  isDesktop={isDesktop}
                  onPress={() => router.push(`/savings/${goal.id}`)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      {goals.length > 0 && (
        <Animated.View style={[s.fab, { transform: [{ scale: fabScale }] }]}>
          <TouchableOpacity
            style={s.fabInner}
            onPress={() => router.push('/savings/new-goal')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

function createStyles(colors: any, isDesktop: boolean) {
  return StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: isDesktop ? Spacing.xl : Spacing.md, paddingBottom: Spacing.xxl },

    // Summary Card
    summaryCard: {
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.primary,
      marginBottom: Spacing.lg,
      overflow: 'hidden',
      padding: Spacing.lg,
      minHeight: 140,
      justifyContent: 'center',
      // Shadow
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 20,
      elevation: 10,
    },
    blobTL: {
      position: 'absolute',
      width: 130,
      height: 130,
      borderRadius: 65,
      backgroundColor: 'rgba(255,255,255,0.08)',
      top: -40,
      left: -30,
    },
    blobBR: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255,255,255,0.06)',
      bottom: -30,
      right: -20,
    },
    summaryInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
    },
    summaryText: { flex: 1 },
    summaryLabel: {
      fontSize: FontSize.sm,
      color: 'rgba(255,255,255,0.75)',
      fontWeight: '500',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    summaryAmount: {
      fontSize: isDesktop ? 36 : 30,
      fontWeight: '900',
      color: '#fff',
      marginTop: 2,
      letterSpacing: -0.5,
    },
    summaryTarget: {
      fontSize: FontSize.sm,
      color: 'rgba(255,255,255,0.72)',
      marginTop: 4,
    },
    summaryPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: Spacing.sm,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: BorderRadius.full,
    },
    summaryPillText: {
      fontSize: FontSize.xs,
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '600',
    },

    // Empty State
    emptyState: {
      alignItems: 'center',
      paddingVertical: Spacing.xxl,
      paddingHorizontal: Spacing.lg,
    },
    emptyIconWrap: {
      width: 110,
      height: 110,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
    },
    emptyIconBg: {
      fontSize: 80,
      position: 'absolute',
      opacity: 0.18,
    },
    emptyIconMain: { fontSize: 64 },
    emptyTitle: {
      fontSize: FontSize.xl,
      fontWeight: '800',
      color: colors.text,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: Spacing.lg,
    },
    emptyBtn: { width: '100%', maxWidth: 280 },

    // Goals
    goalsSection: { flex: 1 },
    sectionTitle: {
      fontSize: FontSize.lg,
      fontWeight: '800',
      color: colors.text,
      marginBottom: Spacing.md,
      letterSpacing: -0.3,
    },
    goalsList: { gap: Spacing.sm },
    goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    goalCard: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 3,
      marginBottom: 0,
    },
    goalCardDesktop: { width: '48.5%' },
    goalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
      gap: Spacing.sm,
    },
    goalIconWrap: {
      width: 46,
      height: 46,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalIcon: { fontSize: 24 },
    goalInfo: { flex: 1 },
    goalName: {
      fontSize: FontSize.md,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.2,
    },
    goalCategory: {
      fontSize: FontSize.xs,
      fontWeight: '600',
      marginTop: 2,
      textTransform: 'capitalize',
    },
    autoPayBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.successLight,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: BorderRadius.full,
    },
    autoPayText: { fontSize: 10, color: colors.success, fontWeight: '700' },
    goalAmounts: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: Spacing.sm,
    },
    goalCurrent: {
      fontSize: FontSize.xl,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.5,
    },
    goalTarget: { fontSize: FontSize.sm, color: colors.textLight, marginLeft: 4 },
    goalReached: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: Spacing.sm,
    },
    goalReachedText: {
      fontSize: FontSize.sm,
      color: colors.accent,
      fontWeight: '700',
    },

    // FAB
    fab: {
      position: 'absolute',
      bottom: 28,
      right: 24,
    },
    fabInner: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 14,
      elevation: 12,
    },
  });
}
