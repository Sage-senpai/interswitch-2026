import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import AfricanPattern from '../../src/components/AfricanPattern';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';

const FEATURES = [
  { icon: 'book', title: 'Learn Finance', desc: 'Fun, bite-sized lessons on budgeting, saving & investing — in your language' },
  { icon: 'flag', title: 'Save Smart', desc: 'Set goals and auto-save daily with Interswitch AutoPay' },
  { icon: 'card', title: 'Pay & Transfer', desc: 'Bills, airtime, school fees — send money to anyone' },
  { icon: 'people', title: 'WAG Community', desc: 'Join Women Affinity Groups for collective savings' },
  { icon: 'chatbubble-ellipses', title: 'AI Advisor', desc: 'Get personalized financial guidance 24/7' },
  { icon: 'shield-checkmark', title: 'Blockchain Trust', desc: 'Every savings transaction verified on-chain' },
];

const STATS = [
  { value: '36M', label: 'Women financially excluded in Nigeria' },
  { value: '5M', label: 'Target beneficiaries under NFWP-SU' },
  { value: '26K+', label: 'WAGs formed, saving over ₦4.9B' },
  { value: '250K+', label: 'Women in EmpowerHER training' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { isDesktop, isTablet } = useResponsive();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const featureAnims = FEATURES.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    featureAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 400 + i * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const isWide = isDesktop || isTablet;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Theme Toggle — floating */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.themeToggle, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]}
        activeOpacity={0.7}
      >
        <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? colors.accent : colors.primaryDark} />
        <Text style={[styles.themeToggleText, { color: isDark ? colors.accent : colors.primaryDark }]}>
          {isDark ? 'Light' : 'Dark'}
        </Text>
      </TouchableOpacity>

      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: isDark ? colors.surface : colors.primaryDark }]}>
        <AfricanPattern width="100%" height="100%" opacity={isDark ? 0.06 : 0.1} variant="ankara" />
        <Animated.View
          style={[
            styles.heroContent,
            isWide && styles.heroContentWide,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Enyata x Interswitch Buildathon 2026</Text>
          </View>

          {/* Decorative glow */}
          <View style={[styles.heroGlow, { backgroundColor: colors.primary }]} />

          <Text style={[styles.heroTitle, isWide && styles.heroTitleWide]}>
            Her Money.{'\n'}Her Power.{'\n'}
            <Text style={{ color: isDark ? colors.accent : '#FFD700' }}>Her Future.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            AI-powered financial literacy, micro-savings, and secure payments — built for every Nigerian woman and girl ready to take control.
          </Text>

          {/* Trust indicators */}
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.trustText}>Interswitch Secured</Text>
            </View>
            <View style={styles.trustDot} />
            <View style={styles.trustItem}>
              <Ionicons name="cube" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.trustText}>Blockchain Verified</Text>
            </View>
            <View style={styles.trustDot} />
            <View style={styles.trustItem}>
              <Ionicons name="heart" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.trustText}>Free Forever</Text>
            </View>
          </View>

          <View style={[styles.heroCTA, isWide && styles.heroCTAWide]}>
            <Button
              title="Start Your Journey"
              onPress={() => router.push('/(auth)/login?mode=register')}
              size="lg"
              style={[styles.ctaPrimary, { backgroundColor: isDark ? colors.primary : '#FFD700' }]}
              textStyle={{ color: isDark ? colors.textInverse : '#1A1A2E', fontWeight: '700' }}
              icon={<Ionicons name="arrow-forward" size={18} color={isDark ? colors.textInverse : '#1A1A2E'} />}
            />
            <Button
              title="I Have an Account"
              onPress={() => router.push('/(auth)/login?mode=login')}
              variant="outline"
              size="lg"
              style={[styles.ctaOutline, { borderColor: 'rgba(255,255,255,0.35)' }]}
              textStyle={{ color: '#FFFFFF' }}
            />
          </View>
        </Animated.View>
      </View>

      {/* Impact Stats */}
      <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>THE PROBLEM</Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Millions of women are left behind
        </Text>
        <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
          {STATS.map((stat, i) => (
            <Animated.View
              key={i}
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  opacity: featureAnims[i] || fadeAnim,
                },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.primary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Features */}
      <View style={[styles.featuresSection, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>THE SOLUTION</Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Everything she needs in one app
        </Text>
        <View style={[styles.featuresGrid, isWide && styles.featuresGridWide]}>
          {FEATURES.map((feature, i) => (
            <Animated.View
              key={i}
              style={[
                styles.featureCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: featureAnims[i],
                  transform: [{ translateY: featureAnims[i].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                },
              ]}
            >
              <View style={[styles.featureIconBox, { backgroundColor: colors.accentLight }]}>
                <Ionicons name={feature.icon as any} size={24} color={colors.primary} />
              </View>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{feature.desc}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* CTA Section */}
      <View style={[styles.ctaSection, { backgroundColor: isDark ? colors.surface : colors.primaryDark }]}>
        <AfricanPattern width="100%" height="100%" opacity={0.05} variant="adire" />
        <Text style={styles.ctaTitle}>Start your financial journey today</Text>
        <Text style={styles.ctaSubtitle}>
          Join thousands of women building a brighter financial future. Free forever.
        </Text>
        <Button
          title="Create Free Account"
          onPress={() => router.push('/(auth)/login?mode=register')}
          size="lg"
          style={[styles.ctaButton, { backgroundColor: isDark ? colors.primary : '#FFD700' }]}
          textStyle={{ color: isDark ? colors.textInverse : '#1A1A2E', fontWeight: '700' }}
        />
      </View>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={[styles.footerContent, isWide && styles.footerContentWide]}>
          <View style={styles.footerBrand}>
            <Text style={[styles.footerLogo, { color: colors.primary }]}>Purse</Text>
            <Text style={[styles.footerTagline, { color: colors.textSecondary }]}>
              One saved naira at a time
            </Text>
          </View>
          <View style={styles.footerBadges}>
            <View style={[styles.badge, { borderColor: colors.border }]}>
              <Ionicons name="shield-checkmark" size={14} color={colors.interswitch} />
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Interswitch Secured</Text>
            </View>
            <View style={[styles.badge, { borderColor: colors.border }]}>
              <Ionicons name="cube" size={14} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Blockchain Verified</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.copyright, { color: colors.textLight }]}>
          Built for the Enyata x Interswitch Buildathon 2026
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // Theme toggle
  themeToggle: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50,
    right: 20,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  themeToggleText: { fontSize: FontSize.xs, fontWeight: '700' },

  // Hero glow
  heroGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.12,
    top: -80,
    right: -60,
  },

  // Trust row
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.xl,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.65)' },
  trustDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.3)' },

  // Hero
  hero: {
    position: 'relative',
    overflow: 'hidden',
    paddingTop: Platform.OS === 'web' ? 80 : 60,
    paddingBottom: 60,
    paddingHorizontal: Spacing.lg,
  },
  heroContent: { alignItems: 'center', zIndex: 1 },
  heroContentWide: { maxWidth: 700, alignSelf: 'center' },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  heroBadgeText: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.xs, fontWeight: '600' },
  heroTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: Spacing.md,
  },
  heroTitleWide: { fontSize: 52, lineHeight: 64 },
  heroSubtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 500,
    marginBottom: Spacing.xl,
  },
  heroCTA: { flexDirection: 'column', gap: Spacing.sm, width: '100%', maxWidth: 320 },
  heroCTAWide: { flexDirection: 'row', maxWidth: 400 },
  ctaPrimary: { flex: 1 },
  ctaOutline: { flex: 1 },

  // Stats
  statsSection: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 500,
  },
  statsGrid: { gap: Spacing.sm, width: '100%', maxWidth: 800 },
  statsGridWide: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  statCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 160,
    flex: 1,
  },
  statValue: { fontSize: FontSize.xxl, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, textAlign: 'center', marginTop: 4 },

  // Features
  featuresSection: { padding: Spacing.xl, alignItems: 'center' },
  featuresGrid: { gap: Spacing.sm, width: '100%', maxWidth: 900 },
  featuresGridWide: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  featureCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    minWidth: 250,
    flex: 1,
    maxWidth: 280,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  featureTitle: { fontSize: FontSize.md, fontWeight: '700', marginBottom: 4 },
  featureDesc: { fontSize: FontSize.sm, lineHeight: 20 },

  // CTA Section
  ctaSection: {
    position: 'relative',
    overflow: 'hidden',
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    zIndex: 1,
  },
  ctaSubtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 400,
    zIndex: 1,
  },
  ctaButton: { minWidth: 250, zIndex: 1 },

  // Footer
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerContent: { width: '100%', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  footerContentWide: { flexDirection: 'row', justifyContent: 'space-between' },
  footerBrand: { alignItems: 'center' },
  footerLogo: { fontSize: FontSize.xl, fontWeight: '800' },
  footerTagline: { fontSize: FontSize.xs, fontStyle: 'italic', marginTop: 2 },
  footerBadges: { flexDirection: 'row', gap: Spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  badgeText: { fontSize: FontSize.xs },
  copyright: { fontSize: 11, textAlign: 'center' },
});
