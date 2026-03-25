import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Animated, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../src/components/Card';
import ProgressBar from '../../src/components/ProgressBar';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { userAPI, aiAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

const QUICK_ACTIONS = [
  { icon: 'add-circle', label: 'Fund', route: '/payments/fund', color: '#7E57C2' },
  { icon: 'send', label: 'Send', route: '/payments/transfer', color: '#EC407A' },
  { icon: 'receipt', label: 'Bills', route: '/payments/bills', color: '#0066FF' },
  { icon: 'chatbubble-ellipses', label: 'Advisor', route: '/ai/chat', color: '#66BB6A' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isDesktop, contentMaxWidth } = useResponsive();
  const [profile, setProfile] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const cardAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;

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
        stats: { completedLessons: 0, badges: [], activeSavingsGoals: 0, wagsJoined: 0 },
        savingsGoals: [],
      });
    }
  };

  useEffect(() => {
    fetchData();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
    cardAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1, duration: 500, delay: 200 + i * 120, useNativeDriver: true,
      }).start();
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const walletBalance = profile?.wallet?.balance || 0;
  const stats = profile?.stats || { completedLessons: 0, badges: [], activeSavingsGoals: 0, wagsJoined: 0 };
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        { padding: isDesktop ? Spacing.xl : Spacing.md, paddingBottom: 80 },
        isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' },
      ]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* ── Greeting ── */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: Spacing.md, marginTop: Spacing.sm }}>
        <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, marginBottom: 2 }}>{greeting},</Text>
        <Text style={{ fontSize: isDesktop ? 30 : 24, fontWeight: '800', color: colors.text }}>
          {profile?.name || 'Queen'} {'\u{1F44B}'}
        </Text>
      </Animated.View>

      {/* ── Wallet Card ── */}
      <Animated.View style={{
        opacity: cardAnims[0],
        transform: [{ translateY: cardAnims[0].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
      }}>
        <View style={{
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: Spacing.md,
          backgroundColor: colors.walletBg,
          padding: Spacing.lg + 4,
          ...(Platform.OS === 'web' ? { boxShadow: `0 8px 32px ${colors.primary}30` } : {}),
        }}>
          {/* Decorative circles */}
          <View style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <View style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', fontWeight: '500' }}>Total Balance</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 }}>
              <Ionicons name="shield-checkmark" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Secured</Text>
            </View>
          </View>

          <Text style={{ fontSize: isDesktop ? 44 : 38, fontWeight: '800', color: '#fff', marginBottom: Spacing.lg, letterSpacing: -1 }}>
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
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* ── Quick Stats ── */}
      <Animated.View style={{
        opacity: cardAnims[1],
        transform: [{ translateY: cardAnims[1].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg,
      }}>
        {[
          { value: stats.completedLessons, label: 'Lessons', icon: 'book', color: '#7E57C2' },
          { value: stats.badges.length, label: 'Badges', icon: 'ribbon', color: '#FFB74D' },
          { value: stats.activeSavingsGoals, label: 'Goals', icon: 'flag', color: '#EC407A' },
          { value: stats.wagsJoined, label: 'WAGs', icon: 'people', color: '#66BB6A' },
        ].map((stat) => (
          <View key={stat.label} style={{
            flex: 1, backgroundColor: colors.surface, borderRadius: 14,
            padding: Spacing.sm + 4, alignItems: 'center',
            borderWidth: 1, borderColor: colors.border,
          }}>
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

      {/* ── Continue Learning CTA ── */}
      <Animated.View style={{
        opacity: cardAnims[2],
        transform: [{ translateY: cardAnims[2].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
      }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/learn')}
          style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: isDark ? colors.surface : colors.primary + '0D',
            borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.lg,
            borderWidth: 1, borderColor: isDark ? colors.border : colors.primary + '20',
            gap: Spacing.sm,
          }}
        >
          <View style={{
            width: 48, height: 48, borderRadius: 14,
            backgroundColor: colors.primary + '18',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="school" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: colors.text }}>Continue Learning</Text>
            <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 2 }}>
              {stats.completedLessons > 0
                ? `${stats.completedLessons} lessons done — keep the streak!`
                : 'Start your first lesson and earn rewards'}
            </Text>
          </View>
          <View style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: colors.primary,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Savings Goals ── */}
      {profile?.savingsGoals?.length > 0 && (
        <Animated.View style={{
          opacity: cardAnims[3],
          transform: [{ translateY: cardAnims[3].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
          marginBottom: Spacing.lg,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
            <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: colors.text }}>Savings Goals</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/savings')}>
              <Text style={{ fontSize: FontSize.sm, color: colors.primary, fontWeight: '600' }}>See all</Text>
            </TouchableOpacity>
          </View>
          {profile.savingsGoals.slice(0, 3).map((goal: any, i: number) => (
            <TouchableOpacity
              key={goal.id}
              onPress={() => router.push(`/savings/${goal.id}`)}
              activeOpacity={0.8}
              style={{
                backgroundColor: colors.surface, borderRadius: 14,
                padding: Spacing.md, marginBottom: Spacing.sm,
                borderWidth: 1, borderColor: colors.border,
                borderLeftWidth: 4,
                borderLeftColor: goal.progress >= 100 ? colors.success : colors.primary,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
                <Text style={{ fontSize: FontSize.md, fontWeight: '600', color: colors.text }}>{goal.name}</Text>
                <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary }}>
                  {formatNaira(goal.current)} / {formatNaira(goal.target)}
                </Text>
              </View>
              <ProgressBar progress={goal.progress} color={goal.progress >= 100 ? colors.success : colors.primary} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* ── AI Insights ── */}
      {insights.length > 0 && (
        <Animated.View style={{
          opacity: cardAnims[4],
          transform: [{ translateY: cardAnims[4].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        }}>
          <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm }}>
            For You
          </Text>
          <View style={isDesktop ? { flexDirection: 'row', gap: Spacing.sm } : undefined}>
            {insights.slice(0, isDesktop ? 3 : 2).map((insight: any, index: number) => (
              <View key={index} style={{
                backgroundColor: colors.surface, borderRadius: 14, padding: Spacing.md,
                borderWidth: 1, borderColor: colors.border,
                marginBottom: Spacing.sm, ...(isDesktop ? { flex: 1 } : {}),
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="bulb" size={14} color={colors.primary} />
                  </View>
                  <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: colors.primary, flex: 1 }}>{insight.title}</Text>
                </View>
                <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, lineHeight: 20 }}>{insight.message}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* ── Footer Badge ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: Spacing.lg }}>
        <Ionicons name="shield-checkmark" size={13} color={colors.interswitch} />
        <Text style={{ fontSize: 11, color: colors.textLight }}>Payments secured by Interswitch</Text>
      </View>
    </ScrollView>
  );
}
