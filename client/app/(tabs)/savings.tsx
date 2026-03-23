import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
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

export default function SavingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isDesktop, contentMaxWidth } = useResponsive();
  const [goals, setGoals] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await savingsAPI.getGoals();
      setGoals(res.data.data || []);
    } catch {
      setGoals([]);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGoals();
    setRefreshing(false);
  };

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target), 0);
  const s = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[
        s.content,
        isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
      ]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Summary Card */}
      <Card variant="accent" style={s.summaryCard}>
        <Text style={s.summaryLabel}>Total Saved</Text>
        <Text style={s.summaryAmount}>{formatNaira(totalSaved)}</Text>
        {totalTarget > 0 && (
          <>
            <Text style={s.summaryTarget}>of {formatNaira(totalTarget)} target</Text>
            <View style={s.summaryBar}>
              <View
                style={[
                  s.summaryFill,
                  { width: `${Math.min(100, (totalSaved / totalTarget) * 100)}%` },
                ]}
              />
            </View>
          </>
        )}
      </Card>

      {/* Create Goal Button */}
      <Button
        title="Create New Savings Goal"
        onPress={() => router.push('/savings/new-goal')}
        icon={<Ionicons name="add-circle" size={20} color={colors.textInverse} />}
        style={s.createBtn}
      />

      {/* Goals List */}
      {goals.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>🎯</Text>
          <Text style={s.emptyTitle}>No savings goals yet</Text>
          <Text style={s.emptyText}>
            Create your first goal and start building your financial future. Even ₦100 is a great start!
          </Text>
        </View>
      ) : (
        <View style={[s.goalsList, isDesktop && s.goalsGrid]}>
          {goals.map((goal) => (
            <Card
              key={goal.id}
              onPress={() => router.push(`/savings/${goal.id}`)}
              style={[s.goalCard, isDesktop ? s.goalCardDesktop : undefined]}
            >
              <View style={s.goalHeader}>
                <Text style={s.goalIcon}>{CATEGORY_ICONS[goal.category] || '🎯'}</Text>
                <View style={s.goalInfo}>
                  <Text style={s.goalName}>{goal.name}</Text>
                  <Text style={s.goalCategory}>{goal.category}</Text>
                </View>
                {goal.hasAutoPay && (
                  <View style={s.autoPayBadge}>
                    <Ionicons name="repeat" size={12} color={colors.success} />
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
                color={goal.progress >= 100 ? colors.success : colors.primary}
              />

              {goal.progress >= 100 && (
                <View style={s.goalReached}>
                  <Ionicons name="trophy" size={16} color={colors.accent} />
                  <Text style={s.goalReachedText}>Goal reached!</Text>
                </View>
              )}
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(colors: any, isDesktop: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: isDesktop ? Spacing.xl : Spacing.md, paddingBottom: Spacing.xxl },
    summaryCard: { marginBottom: Spacing.md, padding: Spacing.lg },
    summaryLabel: { fontSize: FontSize.sm, color: colors.walletTextMuted },
    summaryAmount: { fontSize: isDesktop ? 42 : 36, fontWeight: '800', color: colors.walletText, marginTop: 4 },
    summaryTarget: { fontSize: FontSize.sm, color: colors.walletTextMuted, marginTop: 4, marginBottom: Spacing.sm },
    summaryBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: BorderRadius.full, overflow: 'hidden' },
    summaryFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: BorderRadius.full },
    createBtn: { marginBottom: Spacing.lg },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm },
    emptyText: { fontSize: FontSize.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.lg },
    goalsList: { gap: Spacing.sm },
    goalsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    goalCard: { padding: Spacing.md },
    goalCardDesktop: { width: '48.5%', marginBottom: Spacing.sm },
    goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
    goalIcon: { fontSize: 28 },
    goalInfo: { flex: 1 },
    goalName: { fontSize: FontSize.md, fontWeight: '700', color: colors.text },
    goalCategory: { fontSize: FontSize.xs, color: colors.textLight, textTransform: 'capitalize' },
    autoPayBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: colors.successLight,
      paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full,
    },
    autoPayText: { fontSize: 10, color: colors.success, fontWeight: '700' },
    goalAmounts: { flexDirection: 'row', alignItems: 'baseline', marginBottom: Spacing.sm },
    goalCurrent: { fontSize: FontSize.xl, fontWeight: '800', color: colors.text },
    goalTarget: { fontSize: FontSize.sm, color: colors.textLight, marginLeft: 4 },
    goalReached: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
    goalReachedText: { fontSize: FontSize.sm, color: colors.accent, fontWeight: '700' },
  });
}
