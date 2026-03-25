import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../../src/components/ProgressBar';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { userAPI, aiAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

// ─── Constants ───────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: 'add-circle', label: 'Fund',    route: '/payments/fund',      color: '#7E57C2' },
  { icon: 'send',       label: 'Send',    route: '/payments/transfer',  color: '#EC407A' },
  { icon: 'receipt',    label: 'Bills',   route: '/payments/bills',     color: '#0066FF' },
  { icon: 'chatbubble-ellipses', label: 'Advisor', route: '/ai/chat',  color: '#66BB6A' },
];

const AFFIRMATIONS = [
  "You're building wealth, one step at a time",
  'Every naira saved is a seed planted',
  'Financial freedom looks good on you',
  'Your money goals are within reach',
  'Smart women save, wise women invest',
];

const MOCK_TRANSACTIONS = [
  { type: 'credit', desc: 'Lesson Reward',    amount:   50,  time: '2h ago', icon: 'school', color: '#7E57C2' },
  { type: 'credit', desc: 'Wallet Funded',    amount: 5000,  time: '1d ago', icon: 'card',   color: '#0066FF' },
  { type: 'debit',  desc: 'Airtime Purchase', amount: -200,  time: '2d ago', icon: 'call',   color: '#EC407A' },
];

// ─── Helpers ─────────────────────────────────────────────────

function getDailyAffirmation(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Glassmorphism style helper ──────────────────────────────

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

// ─── Component ───────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isDesktop, contentMaxWidth } = useResponsive();

  const [profile, setProfile]     = useState<any>(null);
  const [insights, setInsights]   = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ── Data fetching (unchanged logic) ──────────────────────
  const fetchData = async () => {
    try {
      const [profileRes, insightsRes] = await Promise.all([
        userAPI.getProfile(),
        aiAPI.getInsights(),
      ]);
      setProfile(profileRes.data.data);
      setInsights(insightsRes.data.data || []);
    } catch {
      setProfile({
        name: 'User',
        wallet: { balance: 0 },
        stats: { completedLessons: 0, badges: [], activeSavingsGoals: 0, wagsJoined: 0, currentStreak: 0 },
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

  // ── Derived values ────────────────────────────────────────
  const walletBalance = profile?.wallet?.balance || 0;
  const stats = profile?.stats || {
    completedLessons: 0, badges: [], activeSavingsGoals: 0, wagsJoined: 0, currentStreak: 0,
  };
  const currentStreak: number = stats.currentStreak ?? 0;
  const greeting    = getGreeting();
  const affirmation = getDailyAffirmation();

  // Aurora gradient colors
  const gradientColors = isDark
    ? (['#4A148C', '#7E57C2', '#9C27B0'] as const)
    : (['#AD1457', '#EC407A', '#F48FB1'] as const);

  // ── Render ────────────────────────────────────────────────
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        { padding: isDesktop ? Spacing.xl : Spacing.md, paddingBottom: 80 },
        isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* ── Greeting (delay 0ms) ── */}
      <Animated.View
        entering={FadeInDown.delay(0).springify().damping(15)}
        style={{ marginBottom: Spacing.md, marginTop: Spacing.sm }}
      >
        <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, marginBottom: 2 }}>
          {greeting},
        </Text>

        {/* Name row with streak badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: isDesktop ? 30 : 24, fontWeight: '800', color: colors.text }}>
            {profile?.name || 'Queen'} {'\u{1F44B}'}
          </Text>

          {currentStreak > 0 && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 4,
              backgroundColor: '#FF6D00',
              paddingHorizontal: 10, paddingVertical: 4,
              borderRadius: BorderRadius.full,
            }}>
              <Ionicons name="flame" size={13} color="#fff" />
              <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>
                {currentStreak}
              </Text>
            </View>
          )}
        </View>

        {/* Daily affirmation */}
        <Text style={{
          fontSize: FontSize.sm, color: colors.textSecondary,
          marginTop: 6, fontStyle: 'italic',
        }}>
          {affirmation}
        </Text>
      </Animated.View>

      {/* ── Wallet Card — Aurora Gradient (delay 150ms) ── */}
      <Animated.View entering={FadeInDown.delay(150).springify().damping(15)}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            marginBottom: Spacing.md,
            padding: Spacing.lg + 4,
            ...(Platform.OS === 'web' ? { boxShadow: `0 8px 32px ${gradientColors[1]}55` } : {}),
          }}
        >
          {/* Decorative circles */}
          <View style={{
            position: 'absolute', top: -30, right: -30,
            width: 120, height: 120, borderRadius: 60,
            backgroundColor: 'rgba(255,255,255,0.08)',
          }} />
          <View style={{
            position: 'absolute', bottom: -20, left: -20,
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }} />

          {/* Top row */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 6,
          }}>
            <Text style={{ fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', fontWeight: '500' }}>
              Total Balance
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* Refresh button */}
              <TouchableOpacity
                onPress={onRefresh}
                activeOpacity={0.6}
                style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="refresh" size={14} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: 'rgba(255,255,255,0.12)',
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50,
              }}>
                <Ionicons name="shield-checkmark" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Secured</Text>
              </View>
            </View>
          </View>

          {/* Balance */}
          <Text style={{
            fontSize: isDesktop ? 44 : 38,
            fontWeight: '800', color: '#fff',
            marginBottom: Spacing.lg, letterSpacing: -1,
          }}>
            {formatNaira(walletBalance)}
          </Text>

          {/* Quick actions */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={{ alignItems: 'center', gap: 6 }}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 46, height: 46, borderRadius: 14,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={action.icon as any} size={22} color="#fff" />
                </View>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── Quick Stats (delay 300ms) ── */}
      <Animated.View
        entering={FadeInDown.delay(300).springify().damping(15)}
        style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg }}
      >
        {[
          { value: stats.completedLessons,    label: 'Lessons', icon: 'book',    color: '#7E57C2' },
          { value: stats.badges?.length ?? 0, label: 'Badges',  icon: 'ribbon',  color: '#FFB74D' },
          { value: stats.activeSavingsGoals,  label: 'Goals',   icon: 'flag',    color: '#EC407A' },
          { value: stats.wagsJoined,          label: 'WAGs',    icon: 'people',  color: '#66BB6A' },
        ].map((stat) => (
          <View
            key={stat.label}
            style={[
              {
                flex: 1, borderRadius: 14,
                padding: Spacing.sm + 4, alignItems: 'center',
              },
              glassBg(isDark),
            ]}
          >
            <View style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: stat.color + '18',
              alignItems: 'center', justifyContent: 'center', marginBottom: 6,
            }}>
              <Ionicons name={stat.icon as any} size={16} color={stat.color} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{stat.value}</Text>
            <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 1 }}>{stat.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* ── Daily Challenge Card (delay 450ms) ── */}
      <Animated.View entering={FadeInDown.delay(450).springify().damping(15)}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/learn')}
          style={[
            {
              borderRadius: 16, padding: Spacing.md,
              marginBottom: Spacing.lg,
              borderStyle: 'dashed',
            },
            glassBg(isDark),
            // override borderWidth so we can add dashed style
            { borderWidth: 1.5 },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="sparkles" size={20} color="#FFD700" />
              <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: colors.text }}>
                Daily Challenge
              </Text>
            </View>
            {/* +50 XP gold badge */}
            <View style={{
              backgroundColor: '#FFD700',
              paddingHorizontal: 10, paddingVertical: 3,
              borderRadius: BorderRadius.full,
            }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#5D4037' }}>+50 XP</Text>
            </View>
          </View>
          <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, lineHeight: 20 }}>
            Complete a lesson today and keep your streak alive
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Savings Goals (delay 600ms) ── */}
      {profile?.savingsGoals?.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(600).springify().damping(15)}
          style={{ marginBottom: Spacing.lg }}
        >
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: Spacing.sm,
          }}>
            <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: colors.text }}>
              Savings Goals
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/savings')}>
              <Text style={{ fontSize: FontSize.sm, color: colors.primary, fontWeight: '600' }}>See all</Text>
            </TouchableOpacity>
          </View>

          {profile.savingsGoals.slice(0, 3).map((goal: any) => (
            <TouchableOpacity
              key={goal.id}
              onPress={() => router.push(`/savings/${goal.id}`)}
              activeOpacity={0.8}
              style={[
                {
                  borderRadius: 14, padding: Spacing.md, marginBottom: Spacing.sm,
                  borderLeftWidth: 4,
                  borderLeftColor: goal.progress >= 100 ? colors.success : colors.primary,
                },
                glassBg(isDark),
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
                <Text style={{ fontSize: FontSize.md, fontWeight: '600', color: colors.text }}>
                  {goal.name}
                </Text>
                <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary }}>
                  {formatNaira(goal.current)} / {formatNaira(goal.target)}
                </Text>
              </View>
              <ProgressBar
                progress={goal.progress}
                color={goal.progress >= 100 ? colors.success : colors.primary}
              />
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* ── Recent Activity / Transaction Feed (delay 600ms, after goals) ── */}
      <Animated.View
        entering={FadeInDown.delay(600).springify().damping(15)}
        style={{ marginBottom: Spacing.lg }}
      >
        <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm }}>
          Recent Activity
        </Text>
        <View style={[{ borderRadius: 16, overflow: 'hidden' }, glassBg(isDark)]}>
          {MOCK_TRANSACTIONS.map((tx, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row', alignItems: 'center',
                padding: Spacing.md,
                borderBottomWidth: index < MOCK_TRANSACTIONS.length - 1 ? 1 : 0,
                borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                gap: Spacing.sm,
              }}
            >
              {/* Colored icon circle */}
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: tx.color + '20',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name={tx.icon as any} size={18} color={tx.color} />
              </View>

              {/* Description + time */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSize.sm, fontWeight: '600', color: colors.text }}>
                  {tx.desc}
                </Text>
                <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 2 }}>
                  {tx.time}
                </Text>
              </View>

              {/* Amount */}
              <Text style={{
                fontSize: FontSize.sm, fontWeight: '700',
                color: tx.type === 'credit' ? colors.success : colors.danger,
              }}>
                {tx.type === 'credit' ? '+' : '-'}{formatNaira(Math.abs(tx.amount))}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* ── AI Insights (delay 750ms) ── */}
      {insights.length > 0 && (
        <Animated.View entering={FadeInDown.delay(750).springify().damping(15)}>
          <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm }}>
            For You
          </Text>
          <View style={isDesktop ? { flexDirection: 'row', gap: Spacing.sm } : undefined}>
            {insights.slice(0, isDesktop ? 3 : 2).map((insight: any, index: number) => (
              <View
                key={index}
                style={[
                  {
                    borderRadius: 14, padding: Spacing.md, marginBottom: Spacing.sm,
                    ...(isDesktop ? { flex: 1 } : {}),
                  },
                  glassBg(isDark),
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <View style={{
                    width: 28, height: 28, borderRadius: 8,
                    backgroundColor: colors.primary + '15',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons name="bulb" size={14} color={colors.primary} />
                  </View>
                  <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: colors.primary, flex: 1 }}>
                    {insight.title}
                  </Text>
                </View>
                <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, lineHeight: 20 }}>
                  {insight.message}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* ── Interswitch Footer Badge ── */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 6, marginTop: Spacing.lg,
      }}>
        <Ionicons name="shield-checkmark" size={13} color={colors.interswitch} />
        <Text style={{ fontSize: 11, color: colors.textLight }}>Payments secured by Interswitch</Text>
      </View>
    </ScrollView>
  );
}
