import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../constants/theme';

interface NavItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  route: string;
}

const navItems: NavItem[] = [
  { label: 'Home', icon: 'home-outline', iconActive: 'home', route: '/(tabs)' },
  { label: 'Learn', icon: 'book-outline', iconActive: 'book', route: '/(tabs)/learn' },
  { label: 'Save', icon: 'wallet-outline', iconActive: 'wallet', route: '/(tabs)/savings' },
  { label: 'Community', icon: 'people-outline', iconActive: 'people', route: '/(tabs)/community' },
  { label: 'Profile', icon: 'person-outline', iconActive: 'person', route: '/(tabs)/profile' },
];

const quickActions: NavItem[] = [
  { label: 'Fund Wallet', icon: 'add-circle-outline', iconActive: 'add-circle', route: '/payments/fund' },
  { label: 'Pay Bills', icon: 'receipt-outline', iconActive: 'receipt', route: '/payments/bills' },
  { label: 'Send Money', icon: 'send-outline', iconActive: 'send', route: '/payments/transfer' },
  { label: 'AI Advisor', icon: 'chatbubble-ellipses-outline', iconActive: 'chatbubble-ellipses', route: '/ai/chat' },
];

export default function DesktopSidebar() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { sidebarWidth } = useResponsive();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === '/(tabs)') return pathname === '/' || pathname === '/(tabs)';
    return pathname.startsWith(route.replace('/(tabs)', ''));
  };

  return (
    <View
      style={[
        styles.sidebar,
        {
          width: sidebarWidth,
          backgroundColor: colors.surface,
          borderRightColor: colors.border,
        },
      ]}
    >
      {/* Brand */}
      <View style={styles.brand}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primaryDark }]}>
          <Ionicons name="wallet" size={22} color="#FFFFFF" />
        </View>
        <Text style={[styles.brandName, { color: colors.text }]}>Purse</Text>
      </View>

      {/* Main Nav */}
      <View style={styles.navSection}>
        <Text style={[styles.navLabel, { color: colors.textLight }]}>MENU</Text>
        {navItems.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.navItem,
                active && { backgroundColor: colors.accentLight },
              ]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={active ? item.iconActive : item.icon}
                size={20}
                color={active ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.navText,
                  { color: active ? colors.primary : colors.textSecondary },
                  active && styles.navTextActive,
                ]}
              >
                {item.label}
              </Text>
              {active && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Actions */}
      <View style={styles.navSection}>
        <Text style={[styles.navLabel, { color: colors.textLight }]}>QUICK ACTIONS</Text>
        {quickActions.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.navItem}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icon} size={20} color={colors.textSecondary} />
            <Text style={[styles.navText, { color: colors.textSecondary }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Theme Toggle */}
        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: colors.surfaceSecondary }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={18}
            color={colors.textSecondary}
          />
          <Text style={[styles.themeText, { color: colors.textSecondary }]}>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </TouchableOpacity>

        {/* Interswitch Badge */}
        <View style={[styles.iswBadge, { borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark" size={14} color={colors.interswitch} />
          <Text style={[styles.iswText, { color: colors.textLight }]}>
            Secured by Interswitch
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    borderRightWidth: 1,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'flex-start',
    ...(Platform.OS === 'web' ? { height: '100vh' as any, position: 'sticky' as any, top: 0 } : {}),
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  navSection: {
    marginBottom: Spacing.lg,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: 2,
    position: 'relative',
  },
  navText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    flex: 1,
  },
  navTextActive: {
    fontWeight: '700',
  },
  activeIndicator: {
    width: 3,
    height: 20,
    borderRadius: 2,
    position: 'absolute',
    right: 0,
  },
  bottomSection: {
    marginTop: 'auto',
    gap: Spacing.sm,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
  },
  themeText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  iswBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderTopWidth: 1,
    marginTop: Spacing.xs,
  },
  iswText: {
    fontSize: 11,
  },
});
