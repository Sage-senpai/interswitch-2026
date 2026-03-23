import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { userAPI } from '../../src/services/api';
import { logout } from '../../src/store/authSlice';
import { AppDispatch } from '../../src/store';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, isDark, toggleTheme } = useTheme();
  const { isDesktop, contentMaxWidth } = useResponsive();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    userAPI.getProfile()
      .then((res) => setProfile(res.data.data))
      .catch(() => setProfile(null));
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logout());
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const s = useMemo(() => createStyles(colors, isDark, isDesktop), [colors, isDark, isDesktop]);

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[
        s.content,
        isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
      ]}
    >
      {/* Profile Header */}
      <View style={s.header}>
        <View style={s.avatar}>
          <Ionicons name="person" size={36} color={colors.primary} />
        </View>
        <Text style={s.name}>{profile?.name || 'User'}</Text>
        <Text style={s.phone}>{profile?.phone || ''}</Text>
        <View style={s.kycBadge}>
          <Ionicons
            name={profile?.kycStatus === 'VERIFIED' ? 'checkmark-circle' : 'alert-circle'}
            size={14}
            color={profile?.kycStatus === 'VERIFIED' ? colors.success : colors.warning}
          />
          <Text style={s.kycText}>KYC: {profile?.kycStatus || 'PENDING'}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsGrid}>
        {[
          { value: profile?.stats?.completedLessons || 0, label: 'Lessons Done' },
          { value: profile?.stats?.badges?.length || 0, label: 'Badges' },
          { value: profile?.stats?.activeSavingsGoals || 0, label: 'Goals' },
          { value: profile?.stats?.wagsJoined || 0, label: 'WAGs' },
        ].map((stat) => (
          <Card key={stat.label} style={s.statCard}>
            <Text style={s.statNumber}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      {/* Badges */}
      {profile?.stats?.badges?.length > 0 && (
        <Card title="Earned Badges" style={s.badgesCard}>
          <View style={s.badgesList}>
            {profile.stats.badges.map((badge: string, i: number) => (
              <View key={i} style={s.badgeItem}>
                <Text style={s.badgeEmoji}>🏅</Text>
                <Text style={s.badgeName}>{badge}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Menu Items */}
      <View style={s.menu}>
        {[
          { icon: 'wallet', label: 'Transaction History', route: '/' },
          { icon: 'chatbubble-ellipses', label: 'AI Financial Advisor', route: '/ai/chat' },
          { icon: 'language', label: 'Language', value: profile?.language || 'EN' },
          { icon: 'location', label: 'State', value: profile?.state || 'Not set' },
          { icon: 'information-circle', label: 'About Purse', route: null },
        ].map((item, index) => (
          <Card
            key={index}
            onPress={item.route ? () => router.push(item.route as any) : undefined}
            style={s.menuItem}
          >
            <View style={s.menuRow}>
              <Ionicons name={item.icon as any} size={22} color={colors.primary} />
              <Text style={s.menuLabel}>{item.label}</Text>
              {item.value ? (
                <Text style={s.menuValue}>{item.value}</Text>
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              )}
            </View>
          </Card>
        ))}

        {/* Theme Toggle — visible on mobile (desktop has it in sidebar) */}
        {!isDesktop && (
          <Card style={s.menuItem}>
            <TouchableOpacity style={s.menuRow} onPress={toggleTheme} activeOpacity={0.7}>
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={22}
                color={colors.primary}
              />
              <Text style={s.menuLabel}>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </Card>
        )}
      </View>

      {/* Logout */}
      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="outline"
        style={s.logoutBtn}
      />

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>Purse v1.0.0</Text>
        <Text style={s.footerText}>Powered by Interswitch</Text>
        <Text style={s.footerText}>Enyata x Interswitch Buildathon 2026</Text>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: any, isDark: boolean, isDesktop: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: isDesktop ? Spacing.xl : Spacing.md, paddingBottom: Spacing.xxl },
    header: { alignItems: 'center', marginBottom: Spacing.lg, marginTop: Spacing.md },
    avatar: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: colors.accentLight,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    name: { fontSize: FontSize.xl, fontWeight: '800', color: colors.text },
    phone: { fontSize: FontSize.sm, color: colors.textSecondary, marginTop: 2 },
    kycBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      marginTop: Spacing.sm,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: Spacing.sm, paddingVertical: 4,
      borderRadius: BorderRadius.full,
    },
    kycText: { fontSize: FontSize.xs, color: colors.textSecondary, fontWeight: '500' },
    statsGrid: {
      flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg,
    },
    statCard: { flex: 1, minWidth: '45%', alignItems: 'center', padding: Spacing.md },
    statNumber: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.primary },
    statLabel: { fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 4 },
    badgesCard: { marginBottom: Spacing.lg },
    badgesList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    badgeItem: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: colors.accentLight,
      paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full,
    },
    badgeEmoji: { fontSize: 14 },
    badgeName: { fontSize: FontSize.xs, color: colors.accent, fontWeight: '600' },
    menu: { gap: Spacing.xs, marginBottom: Spacing.lg },
    menuItem: { padding: Spacing.md },
    menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    menuLabel: { flex: 1, fontSize: FontSize.md, color: colors.text },
    menuValue: { fontSize: FontSize.sm, color: colors.textSecondary },
    logoutBtn: { marginBottom: Spacing.lg },
    footer: { alignItems: 'center', gap: 4 },
    footerText: { fontSize: FontSize.xs, color: colors.textLight },
  });
}
