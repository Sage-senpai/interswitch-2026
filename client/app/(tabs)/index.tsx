import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../src/components/Card';
import ProgressBar from '../../src/components/ProgressBar';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { userAPI, aiAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isDesktop, contentMaxWidth } = useResponsive();
  const [profile, setProfile] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, insightsRes] = await Promise.all([
        userAPI.getProfile(),
        aiAPI.getInsights(),
      ]);
      setProfile(profileRes.data.data);
      setInsights(insightsRes.data.data || []);
    } catch (err) {
      setProfile({
        name: 'User',
        wallet: { balance: 0 },
        stats: { completedLessons: 0, badges: [], activeSavingsGoals: 0, wagsJoined: 0 },
        savingsGoals: [],
      });
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const walletBalance = profile?.wallet?.balance || 0;
  const stats = profile?.stats || { completedLessons: 0, badges: [], activeSavingsGoals: 0, wagsJoined: 0 };

  const s = useMemo(() => createStyles(colors, isDark, isDesktop), [colors, isDark, isDesktop]);

  return (
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
      {/* Greeting */}
      <View style={s.greetingRow}>
        <View>
          <Text style={s.greeting}>Hello, {profile?.name || 'there'}</Text>
          <Text style={s.greetingSub}>Welcome back to Purse</Text>
        </View>
        {isDesktop && (
          <View style={s.desktopBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.interswitch} />
            <Text style={s.desktopBadgeText}>Interswitch Secured</Text>
          </View>
        )}
      </View>

      {/* Wallet Card */}
      <Card variant="accent" style={s.walletCard}>
        <Text style={s.walletLabel}>Wallet Balance</Text>
        <Text style={s.walletAmount}>{formatNaira(walletBalance)}</Text>
        <View style={s.walletActions}>
          {[
            { icon: 'add-circle', label: 'Fund', route: '/payments/fund' },
            { icon: 'send', label: 'Send', route: '/payments/transfer' },
            { icon: 'receipt', label: 'Bills', route: '/payments/bills' },
            { icon: 'chatbubble-ellipses', label: 'Advisor', route: '/ai/chat' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={s.walletBtn}
              onPress={() => router.push(action.route as any)}
            >
              <View style={s.walletBtnIcon}>
                <Ionicons name={action.icon as any} size={20} color={colors.walletText} />
              </View>
              <Text style={s.walletBtnText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Quick Stats */}
      <View style={[s.statsRow, isDesktop && s.statsRowDesktop]}>
        {[
          { value: stats.completedLessons, label: 'Lessons', icon: 'book' },
          { value: stats.badges.length, label: 'Badges', icon: 'ribbon' },
          { value: stats.activeSavingsGoals, label: 'Goals', icon: 'flag' },
          { value: stats.wagsJoined, label: 'WAGs', icon: 'people' },
        ].map((stat) => (
          <View key={stat.label} style={s.statBox}>
            <Ionicons name={stat.icon as any} size={18} color={colors.primary} style={{ marginBottom: 4 }} />
            <Text style={s.statNumber}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Savings Goals Preview */}
      {profile?.savingsGoals?.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Savings Goals</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/savings')}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {profile.savingsGoals.slice(0, 3).map((goal: any) => (
            <Card key={goal.id} onPress={() => router.push(`/savings/${goal.id}`)} style={s.goalCard}>
              <View style={s.goalHeader}>
                <Text style={s.goalName}>{goal.name}</Text>
                <Text style={s.goalAmount}>
                  {formatNaira(goal.current)} / {formatNaira(goal.target)}
                </Text>
              </View>
              <ProgressBar
                progress={goal.progress}
                color={goal.progress >= 100 ? colors.success : colors.primary}
              />
            </Card>
          ))}
        </View>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>For You</Text>
          <View style={isDesktop ? s.insightsGrid : undefined}>
            {insights.slice(0, isDesktop ? 3 : 2).map((insight: any, index: number) => (
              <Card key={index} style={[s.insightCard, isDesktop ? s.insightCardDesktop : undefined]}>
                <Text style={s.insightTitle}>{insight.title}</Text>
                <Text style={s.insightMessage}>{insight.message}</Text>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* Mobile-only Interswitch Badge */}
      {!isDesktop && (
        <View style={s.poweredBy}>
          <Ionicons name="shield-checkmark" size={14} color={colors.interswitch} />
          <Text style={s.poweredText}>Payments secured by Interswitch</Text>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(colors: any, isDark: boolean, isDesktop: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      padding: isDesktop ? Spacing.xl : Spacing.md,
      paddingBottom: Spacing.xxl,
    },
    greetingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
      marginTop: Spacing.sm,
    },
    greeting: {
      fontSize: isDesktop ? FontSize.xxl : FontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    greetingSub: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    desktopBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: Spacing.sm + 2,
      paddingVertical: Spacing.xs + 2,
      borderRadius: BorderRadius.full,
    },
    desktopBadgeText: {
      fontSize: FontSize.xs,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    walletCard: {
      marginBottom: Spacing.md,
      padding: Spacing.lg,
    },
    walletLabel: {
      fontSize: FontSize.sm,
      color: colors.walletTextMuted,
      marginBottom: Spacing.xs,
    },
    walletAmount: {
      fontSize: isDesktop ? 42 : 36,
      fontWeight: '800',
      color: colors.walletText,
      marginBottom: Spacing.md,
    },
    walletActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    walletBtn: {
      alignItems: 'center',
      gap: 6,
    },
    walletBtnIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    walletBtnText: {
      fontSize: FontSize.xs,
      color: colors.walletTextMuted,
      fontWeight: '600',
    },
    statsRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    statsRowDesktop: {
      gap: Spacing.md,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm + 2,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: FontSize.xl,
      fontWeight: '800',
      color: colors.primary,
    },
    statLabel: {
      fontSize: FontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    section: { marginBottom: Spacing.lg },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    sectionTitle: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    seeAll: {
      fontSize: FontSize.sm,
      color: colors.primary,
      fontWeight: '600',
    },
    goalCard: { marginBottom: Spacing.sm },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    goalName: { fontSize: FontSize.md, fontWeight: '600', color: colors.text },
    goalAmount: { fontSize: FontSize.sm, color: colors.textSecondary },
    insightsGrid: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    insightCard: { marginBottom: Spacing.sm },
    insightCardDesktop: { flex: 1, marginBottom: 0 },
    insightTitle: {
      fontSize: FontSize.md,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    insightMessage: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    poweredBy: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
      marginTop: Spacing.md,
    },
    poweredText: { fontSize: FontSize.xs, color: colors.textLight },
  });
}
