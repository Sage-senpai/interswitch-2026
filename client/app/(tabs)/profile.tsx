import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
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

// Per-item icon background colors
const MENU_COLORS: Record<string, string> = {
  wallet: '#7C8CF8',
  'chatbubble-ellipses': '#F06292',
  language: '#81C784',
  location: '#FFB74D',
  'information-circle': '#CE93D8',
  'sunny-outline': '#FFA726',
  'moon-outline': '#7986CB',
};

// Circular badge stat component
function StatBadge({
  value,
  label,
  color,
  delay,
}: {
  value: number;
  label: string;
  color: string;
  delay: number;
}) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        alignItems: 'center',
        flex: 1,
        opacity: fade,
        transform: [{ scale }],
      }}
    >
      <View
        style={{
          width: 68,
          height: 68,
          borderRadius: 34,
          backgroundColor: color + '1A',
          borderWidth: 2.5,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 6,
        }}
      >
        <Text
          style={{
            fontSize: FontSize.xl,
            fontWeight: '900',
            color,
            letterSpacing: -1,
          }}
        >
          {value}
        </Text>
      </View>
      <Text
        style={{
          fontSize: FontSize.xs,
          color: '#888',
          textAlign: 'center',
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

// Theme toggle switch with sun/moon
function ThemeSwitch({
  isDark,
  onToggle,
  colors,
}: {
  isDark: boolean;
  onToggle: () => void;
  colors: any;
}) {
  const knob = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(knob, {
      toValue: isDark ? 1 : 0,
      friction: 4,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [isDark]);

  const translateX = knob.interpolate({ inputRange: [0, 1], outputRange: [2, 26] });

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.85}
      style={{
        width: 56,
        height: 30,
        borderRadius: 15,
        backgroundColor: isDark ? colors.primaryDark : '#E0E0E0',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Animated.View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.18,
          shadowRadius: 3,
          elevation: 3,
          transform: [{ translateX }],
        }}
      >
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={14}
          color={isDark ? colors.primaryDark : '#FFA726'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// Badge ribbon item
function BadgeRibbonItem({ badge, index, colors }: { badge: string; index: number; colors: any }) {
  const isGold = index < 3;
  const goldColor = '#F5A623';
  const silverColor = '#A0A0A0';
  const badgeColor = isGold ? goldColor : silverColor;

  return (
    <View
      style={{
        alignItems: 'center',
        marginRight: Spacing.md,
        width: 80,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: badgeColor + '20',
          borderWidth: 2,
          borderColor: badgeColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 26 }}>🏅</Text>
      </View>
      <Text
        style={{
          fontSize: 10,
          color: badgeColor,
          fontWeight: '700',
          textAlign: 'center',
          lineHeight: 13,
        }}
        numberOfLines={2}
      >
        {badge}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, isDark, toggleTheme } = useTheme();
  const { isDesktop, contentMaxWidth } = useResponsive();
  const [profile, setProfile] = useState<any>(null);

  const headerSlide = useRef(new Animated.Value(-30)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    userAPI.getProfile()
      .then((res) => setProfile(res.data.data))
      .catch(() => setProfile(null));

    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, useNativeDriver: true } as any),
      Animated.timing(contentFade, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const ok = window.confirm('Are you sure you want to sign out?');
      if (ok) {
        dispatch(logout()).then(() => router.replace('/(auth)/welcome'));
      }
      return;
    }
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

  const badges: string[] = profile?.stats?.badges || [];
  const totalBadgeCount = 12; // total possible achievements
  const earnedCount = badges.length;
  const achievementPct = Math.round((earnedCount / totalBadgeCount) * 100);

  const statItems = [
    { value: profile?.stats?.completedLessons || 0, label: 'Lessons', color: colors.interswitch },
    { value: earnedCount, label: 'Badges', color: '#F5A623' },
    { value: profile?.stats?.activeSavingsGoals || 0, label: 'Goals', color: colors.primary },
    { value: profile?.stats?.wagsJoined || 0, label: 'WAGs', color: colors.success },
  ];

  const menuItems = [
    { icon: 'wallet', label: 'Transaction History', route: '/' },
    { icon: 'chatbubble-ellipses', label: 'AI Financial Advisor', route: '/ai/chat' },
    { icon: 'language', label: 'Language', value: profile?.language || 'EN' },
    { icon: 'location', label: 'State', value: profile?.state || 'Not set' },
    { icon: 'information-circle', label: 'About Purse', route: null },
  ];

  const s = useMemo(() => createStyles(colors, isDark, isDesktop), [colors, isDark, isDesktop]);

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[
        s.content,
        isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
      ]}
    >
      {/* Profile Header — gradient banner + overlapping avatar */}
      <Animated.View
        style={[s.bannerWrap, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}
      >
        <View style={s.banner}>
          {/* Decorative circles */}
          <View style={s.bannerCircle1} />
          <View style={s.bannerCircle2} />
          <View style={s.bannerCircle3} />
        </View>
        <View style={s.avatarOuter}>
          <View style={s.avatar}>
            <Ionicons name="person" size={42} color={colors.primary} />
          </View>
        </View>
        <View style={s.headerNames}>
          <Text style={s.name}>{profile?.name || 'User'}</Text>
          <Text style={s.phone}>{profile?.phone || ''}</Text>
          <View
            style={[
              s.kycBadge,
              {
                backgroundColor:
                  profile?.kycStatus === 'VERIFIED' ? colors.successLight : colors.warningLight,
              },
            ]}
          >
            <Ionicons
              name={profile?.kycStatus === 'VERIFIED' ? 'checkmark-circle' : 'alert-circle'}
              size={13}
              color={profile?.kycStatus === 'VERIFIED' ? colors.success : colors.warning}
            />
            <Text
              style={[
                s.kycText,
                { color: profile?.kycStatus === 'VERIFIED' ? colors.success : colors.warning },
              ]}
            >
              KYC: {profile?.kycStatus || 'PENDING'}
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: contentFade }}>
        {/* Stats — circular badge displays */}
        <View style={s.statsRow}>
          {statItems.map((st, i) => (
            <StatBadge
              key={st.label}
              value={st.value}
              label={st.label}
              color={st.color}
              delay={i * 60}
            />
          ))}
        </View>

        {/* Achievements section */}
        <View style={s.achievementsCard}>
          <View style={s.achievementsHeader}>
            <Text style={s.achievementsTitle}>Achievements</Text>
            <Text style={s.achievementsPct}>{achievementPct}% earned</Text>
          </View>
          <View style={s.achievementsBar}>
            <Animated.View
              style={[
                s.achievementsFill,
                {
                  width: `${achievementPct}%` as any,
                  backgroundColor: '#F5A623',
                },
              ]}
            />
          </View>
          <Text style={s.achievementsSub}>
            {earnedCount} of {totalBadgeCount} badges unlocked
          </Text>
        </View>

        {/* Badges ribbon */}
        {badges.length > 0 && (
          <View style={s.badgesSection}>
            <Text style={s.sectionTitle}>Earned Badges</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.badgesRibbon}
            >
              {badges.map((badge: string, i: number) => (
                <BadgeRibbonItem key={i} badge={badge} index={i} colors={colors} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Menu items */}
        <View style={s.menu}>
          <Text style={s.sectionTitle}>Settings</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.route ? () => router.push(item.route as any) : undefined}
              activeOpacity={item.route ? 0.75 : 1}
              style={s.menuItem}
            >
              <View
                style={[
                  s.menuIconBg,
                  { backgroundColor: (MENU_COLORS[item.icon] || colors.primary) + '22' },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={19}
                  color={MENU_COLORS[item.icon] || colors.primary}
                />
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              {item.value ? (
                <Text style={s.menuValue}>{item.value}</Text>
              ) : (
                <Ionicons name="chevron-forward" size={17} color={colors.textLight} />
              )}
            </TouchableOpacity>
          ))}

          {/* Theme Toggle */}
          {!isDesktop && (
            <View style={s.menuItem}>
              <View
                style={[
                  s.menuIconBg,
                  {
                    backgroundColor:
                      (MENU_COLORS[isDark ? 'moon-outline' : 'sunny-outline'] || colors.primary) +
                      '22',
                  },
                ]}
              >
                <Ionicons
                  name={isDark ? 'moon' : 'sunny'}
                  size={19}
                  color={MENU_COLORS[isDark ? 'moon-outline' : 'sunny-outline'] || colors.primary}
                />
              </View>
              <Text style={s.menuLabel}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
              <ThemeSwitch isDark={isDark} onToggle={toggleTheme} colors={colors} />
            </View>
          )}
        </View>

        {/* Logout button */}
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.8} style={s.logoutBtn}>
          <Ionicons name="log-out-outline" size={19} color={colors.danger} />
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Purse v1.0.0</Text>
          <Text style={s.footerText}>Powered by Interswitch</Text>
          <Text style={s.footerText}>Enyata x Interswitch Buildathon 2026</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function createStyles(colors: any, isDark: boolean, isDesktop: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      paddingBottom: Spacing.xxl,
      paddingHorizontal: isDesktop ? Spacing.xl : 0,
    },

    // Banner + Avatar
    bannerWrap: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    banner: {
      width: '100%',
      height: isDesktop ? 160 : 130,
      backgroundColor: colors.primary,
      overflow: 'hidden',
    },
    bannerCircle1: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(255,255,255,0.08)',
      top: -80,
      right: -50,
    },
    bannerCircle2: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(255,255,255,0.06)',
      bottom: -60,
      left: 30,
    },
    bannerCircle3: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.1)',
      top: 20,
      left: '40%',
    },
    avatarOuter: {
      width: 92,
      height: 92,
      borderRadius: 46,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -46,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 8,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerNames: {
      alignItems: 'center',
      paddingTop: Spacing.sm,
      paddingHorizontal: Spacing.md,
    },
    name: {
      fontSize: FontSize.xl,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: -0.5,
    },
    phone: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      marginTop: 3,
    },
    kycBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: BorderRadius.full,
    },
    kycText: {
      fontSize: FontSize.xs,
      fontWeight: '600',
    },

    // Stats
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: isDesktop ? Spacing.md : Spacing.lg,
      marginBottom: Spacing.lg,
    },

    // Achievements
    achievementsCard: {
      marginHorizontal: isDesktop ? Spacing.md : Spacing.md,
      marginBottom: Spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    achievementsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    achievementsTitle: {
      fontSize: FontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    achievementsPct: {
      fontSize: FontSize.sm,
      fontWeight: '700',
      color: '#F5A623',
    },
    achievementsBar: {
      height: 8,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
      marginBottom: Spacing.xs,
    },
    achievementsFill: {
      height: '100%',
      borderRadius: BorderRadius.full,
      minWidth: 8,
    },
    achievementsSub: {
      fontSize: FontSize.xs,
      color: colors.textLight,
      marginTop: 4,
    },

    // Badges ribbon
    badgesSection: {
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      fontSize: FontSize.lg,
      fontWeight: '800',
      color: colors.text,
      marginBottom: Spacing.md,
      paddingHorizontal: isDesktop ? Spacing.md : Spacing.md,
      letterSpacing: -0.3,
    },
    badgesRibbon: {
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing.sm,
    },

    // Menu
    menu: {
      marginBottom: Spacing.lg,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: 14,
      paddingHorizontal: Spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    menuIconBg: {
      width: 36,
      height: 36,
      borderRadius: BorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuLabel: {
      flex: 1,
      fontSize: FontSize.md,
      color: colors.text,
      fontWeight: '500',
    },
    menuValue: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
    },

    // Logout
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      marginHorizontal: isDesktop ? Spacing.md : Spacing.md,
      marginBottom: Spacing.lg,
      paddingVertical: 14,
      borderRadius: BorderRadius.lg,
      borderWidth: 1.5,
      borderColor: colors.danger,
    },
    logoutText: {
      fontSize: FontSize.md,
      fontWeight: '700',
      color: colors.danger,
    },

    // Footer
    footer: {
      alignItems: 'center',
      gap: 4,
      paddingBottom: Spacing.lg,
    },
    footerText: { fontSize: FontSize.xs, color: colors.textLight },
  });
}
