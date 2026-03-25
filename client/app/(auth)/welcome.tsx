import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated, Platform,
  TouchableOpacity, ImageBackground, Image, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import AfricanPattern from '../../src/components/AfricanPattern';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';

// Free Unsplash images — African women empowerment
const HERO_IMAGE = 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1400&q=80';
const ABOUT_IMAGE = 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=800&q=80';
const CTA_IMAGE = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1400&q=80';

const SERVICES = [
  { icon: 'book-outline', color: '#7E57C2', title: 'Financial Education', desc: 'Gamified lessons on budgeting, saving & investing — in English, Hausa, Yoruba, Igbo' },
  { icon: 'trending-up-outline', color: '#EC407A', title: 'Smart Savings', desc: 'Automated micro-savings with Interswitch AutoPay. Set goals and watch them grow' },
  { icon: 'card-outline', color: '#0066FF', title: 'Secure Payments', desc: 'Pay bills, buy airtime, transfer money — all powered by Interswitch payment rails' },
  { icon: 'people-outline', color: '#66BB6A', title: 'WAG Communities', desc: 'Join Women Affinity Groups for collective ajo savings and peer mentoring' },
  { icon: 'chatbubble-ellipses-outline', color: '#FFB74D', title: 'AI Financial Advisor', desc: 'Get personalized money advice, spending insights, and goal tracking 24/7' },
  { icon: 'shield-checkmark-outline', color: '#26C6DA', title: 'Blockchain Trust', desc: 'Every savings record verified on-chain. Transparent, immutable, auditable' },
];

const STATS = [
  { value: '36M+', label: 'Women Excluded', sub: 'from formal finance in Nigeria' },
  { value: '5M', label: 'Target Women', sub: 'under NFWP-SU World Bank program' },
  { value: '26K+', label: 'WAGs Formed', sub: 'saving over N4.9 billion collectively' },
  { value: '250K+', label: 'In Training', sub: 'via EmpowerHER initiative' },
];

const TESTIMONIALS = [
  {
    text: 'Since I started using Purse, I have saved N50,000 for my daughter\'s school fees. The lessons taught me how to budget properly.',
    name: 'Mama Blessing',
    role: 'Market Woman, Ogun State',
  },
  {
    text: 'Our WAG group of 15 women saved over N2 million in 6 months. Purse made it easy to track everything.',
    name: 'Hajiya Fatima',
    role: 'WAG Leader, Kebbi State',
  },
  {
    text: 'I never knew I could invest with just N1,000. The AI advisor helped me start small and stay consistent.',
    name: 'Chidinma O.',
    role: 'University Student, Enugu',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Account', desc: 'Sign up with just your phone number. No bank account needed to start.' },
  { step: '02', title: 'Learn at Your Pace', desc: 'Complete bite-sized financial lessons. Earn badges and real naira rewards.' },
  { step: '03', title: 'Save & Grow', desc: 'Set savings goals, enable auto-save, and join WAG group savings.' },
  { step: '04', title: 'Pay & Transact', desc: 'Fund your wallet, pay bills, and transfer money — all via Interswitch.' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { isDesktop, isTablet } = useResponsive();
  const { width } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  const isWide = isDesktop || isTablet;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>

      {/* ═══ NAVBAR ═══ */}
      <View style={[styles.navbar, { backgroundColor: isDark ? colors.surface + 'F0' : '#FFFFFFEF', borderBottomColor: colors.border }]}>
        <View style={[styles.navInner, isWide && { maxWidth: 1200 }]}>
          <View style={styles.navBrand}>
            <View style={[styles.navLogo, { backgroundColor: colors.primary }]}>
              <Ionicons name="wallet" size={18} color="#fff" />
            </View>
            <Text style={[styles.navTitle, { color: colors.text }]}>Purse</Text>
          </View>
          <View style={styles.navActions}>
            <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/login?mode=login')}>
              <Text style={[styles.navLink, { color: colors.textSecondary }]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navCta, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(auth)/login?mode=register')}
            >
              <Text style={styles.navCtaText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ═══ HERO ═══ */}
      <View style={styles.heroOuter}>
        <ImageBackground
          source={{ uri: HERO_IMAGE }}
          style={styles.heroBg}
          resizeMode="cover"
        >
          <View style={[styles.heroOverlay, { backgroundColor: isDark ? 'rgba(10,10,15,0.82)' : 'rgba(26,26,46,0.75)' }]} />
          <AfricanPattern width="100%" height="100%" opacity={0.04} variant="ankara" />

          <Animated.View style={[
            styles.heroContent,
            isWide && styles.heroContentWide,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
            <View style={styles.heroBadge}>
              <View style={[styles.heroBadgeDot, { backgroundColor: '#66BB6A' }]} />
              <Text style={styles.heroBadgeText}>Enyata x Interswitch Buildathon 2026</Text>
            </View>

            <Text style={[styles.heroTitle, isWide && styles.heroTitleWide]}>
              Her Money.{'\n'}Her Power.{'\n'}
              <Text style={{ color: '#FFD700' }}>Her Future.</Text>
            </Text>

            <Text style={styles.heroSubtitle}>
              AI-powered financial literacy, micro-savings, and secure payments — built for every Nigerian woman ready to take control of her finances.
            </Text>

            <View style={[styles.heroCTA, isWide && styles.heroCTAWide]}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => router.push('/(auth)/login?mode=register')}
                activeOpacity={0.85}
              >
                <Text style={styles.heroBtnText}>Start Your Journey</Text>
                <Ionicons name="arrow-forward" size={18} color="#1A1A2E" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroBtnOutline}
                onPress={() => router.push('/(auth)/login?mode=login')}
                activeOpacity={0.85}
              >
                <Ionicons name="play-circle-outline" size={20} color="#fff" />
                <Text style={styles.heroBtnOutlineText}>Watch Demo</Text>
              </TouchableOpacity>
            </View>

            {/* Trust strip */}
            <View style={styles.trustStrip}>
              {[
                { icon: 'shield-checkmark', text: 'Interswitch Secured' },
                { icon: 'cube', text: 'Blockchain Verified' },
                { icon: 'heart', text: 'Free Forever' },
              ].map((t, i) => (
                <View key={i} style={styles.trustItem}>
                  <Ionicons name={t.icon as any} size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.trustText}>{t.text}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </ImageBackground>
      </View>

      {/* ═══ STATS BAR ═══ */}
      <View style={[styles.statsBar, { backgroundColor: colors.primary }]}>
        <View style={[styles.statsInner, isWide && styles.statsInnerWide]}>
          {STATS.map((s, i) => (
            <View key={i} style={[styles.statItem, i < STATS.length - 1 && styles.statBorder]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ═══ ABOUT SECTION ═══ */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={[styles.sectionInner, isWide && styles.aboutRow]}>
          {isWide && (
            <View style={styles.aboutImageWrap}>
              <Image source={{ uri: ABOUT_IMAGE }} style={styles.aboutImage} resizeMode="cover" />
              <View style={[styles.aboutImageAccent, { backgroundColor: colors.primary }]} />
            </View>
          )}
          <View style={[styles.aboutText, isWide && { flex: 1, paddingLeft: 40 }]}>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>ABOUT PURSE</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Bridging the financial{'\n'}inclusion gap for women
            </Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              36 million Nigerian women remain financially excluded. Purse is the digital bridge — combining AI-powered education with real banking tools to bring every woman into the formal economy.
            </Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary, marginTop: 12 }]}>
              Aligned with the National Financial Women Programme (NFWP-SU), EmpowerHER, and CBN's financial inclusion strategy, Purse digitizes Women Affinity Groups and makes financial literacy accessible in local languages.
            </Text>
            <View style={styles.aboutBadges}>
              {['NFWP-SU Aligned', 'EmpowerHER Compatible', 'CBN NFIS'].map((b, i) => (
                <View key={i} style={[styles.aboutBadge, { backgroundColor: colors.accentLight, borderColor: colors.primary + '30' }]}>
                  <Text style={[styles.aboutBadgeText, { color: colors.primary }]}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* ═══ SERVICES / FEATURES ═══ */}
      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <View style={styles.sectionInner}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>WHAT WE DO</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Everything she needs{'\n'}in one powerful app
            </Text>
          </View>
          <View style={[styles.servicesGrid, isWide && styles.servicesGridWide]}>
            {SERVICES.map((svc, i) => (
              <View
                key={i}
                style={[styles.serviceCard, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }]}
              >
                <View style={[styles.serviceIcon, { backgroundColor: svc.color + '15' }]}>
                  <Ionicons name={svc.icon as any} size={28} color={svc.color} />
                </View>
                <Text style={[styles.serviceTitle, { color: colors.text }]}>{svc.title}</Text>
                <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>{svc.desc}</Text>
                <TouchableOpacity style={styles.serviceLink}>
                  <Text style={[styles.serviceLinkText, { color: colors.primary }]}>Learn more</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ═══ HOW IT WORKS ═══ */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionInner}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>HOW IT WORKS</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Get started in 4 simple steps
            </Text>
          </View>
          <View style={[styles.stepsGrid, isWide && styles.stepsGridWide]}>
            {HOW_IT_WORKS.map((step, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                {isWide && i < HOW_IT_WORKS.length - 1 && (
                  <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
                )}
                <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ═══ TESTIMONIALS ═══ */}
      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <View style={styles.sectionInner}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>TESTIMONIALS</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Hear from our women
            </Text>
          </View>
          <View style={[styles.testimonialGrid, isWide && styles.testimonialGridWide]}>
            {TESTIMONIALS.map((t, i) => (
              <View key={i} style={[styles.testimonialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="chatbox-ellipses" size={24} color={colors.primary + '40'} style={{ marginBottom: 12 }} />
                <Text style={[styles.testimonialText, { color: colors.text }]}>"{t.text}"</Text>
                <View style={styles.testimonialAuthor}>
                  <View style={[styles.testimonialAvatar, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.testimonialInitial, { color: colors.primary }]}>
                      {t.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.testimonialName, { color: colors.text }]}>{t.name}</Text>
                    <Text style={[styles.testimonialRole, { color: colors.textSecondary }]}>{t.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ═══ CTA SECTION ═══ */}
      <ImageBackground source={{ uri: CTA_IMAGE }} style={styles.ctaBg} resizeMode="cover">
        <View style={[styles.ctaOverlay, { backgroundColor: isDark ? 'rgba(10,10,15,0.88)' : 'rgba(194,24,91,0.88)' }]} />
        <AfricanPattern width="100%" height="100%" opacity={0.05} variant="adire" />
        <View style={[styles.ctaContent, { zIndex: 2 }]}>
          <Text style={styles.ctaTitle}>Ready to take control of your finances?</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of Nigerian women building a brighter financial future. It's completely free.
          </Text>
          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={[styles.heroBtn, { minWidth: 220 }]}
              onPress={() => router.push('/(auth)/login?mode=register')}
            >
              <Text style={styles.heroBtnText}>Create Free Account</Text>
              <Ionicons name="arrow-forward" size={18} color="#1A1A2E" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      {/* ═══ FOOTER ═══ */}
      <View style={[styles.footer, { backgroundColor: isDark ? colors.surface : '#1A1A2E' }]}>
        <View style={[styles.footerInner, isWide && styles.footerInnerWide]}>
          <View style={styles.footerBrand}>
            <View style={styles.footerLogoRow}>
              <View style={[styles.navLogo, { backgroundColor: colors.primary }]}>
                <Ionicons name="wallet" size={16} color="#fff" />
              </View>
              <Text style={styles.footerLogoText}>Purse</Text>
            </View>
            <Text style={styles.footerTagline}>
              AI-powered financial literacy & empowerment{'\n'}for Nigerian women
            </Text>
          </View>
          <View style={styles.footerLinks}>
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>Product</Text>
              <Text style={styles.footerLink}>Financial Lessons</Text>
              <Text style={styles.footerLink}>Smart Savings</Text>
              <Text style={styles.footerLink}>WAG Groups</Text>
              <Text style={styles.footerLink}>AI Advisor</Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>Powered By</Text>
              <Text style={styles.footerLink}>Interswitch Payments</Text>
              <Text style={styles.footerLink}>Polygon Blockchain</Text>
              <Text style={styles.footerLink}>OpenAI</Text>
            </View>
          </View>
        </View>
        <View style={[styles.footerBottom, { borderTopColor: 'rgba(255,255,255,0.1)' }]}>
          <Text style={styles.footerCopyright}>
            Built for the Enyata x Interswitch Buildathon 2026
          </Text>
          <View style={styles.footerBadges}>
            <View style={styles.footerBadge}>
              <Ionicons name="shield-checkmark" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.footerBadgeText}>Interswitch Secured</Text>
            </View>
            <View style={styles.footerBadge}>
              <Ionicons name="cube" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.footerBadgeText}>Blockchain Verified</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // ─── Navbar ────────────────
  navbar: {
    position: Platform.OS === 'web' ? ('sticky' as any) : 'relative',
    top: 0,
    zIndex: 1000,
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  navInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    alignSelf: 'center',
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navLogo: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 20, fontWeight: '800' },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  navLink: { fontSize: 14, fontWeight: '600' },
  navCta: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 },
  navCtaText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // ─── Hero ──────────────────
  heroOuter: { width: '100%' },
  heroBg: {
    minHeight: Platform.OS === 'web' ? 580 : 500,
    justifyContent: 'center',
  },
  heroOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  heroContent: { zIndex: 2, alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 60 },
  heroContentWide: { maxWidth: 750, alignSelf: 'center' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3 },
  heroBadgeText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  heroTitle: { fontSize: 40, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 50, marginBottom: 16 },
  heroTitleWide: { fontSize: 56, lineHeight: 68 },
  heroSubtitle: { fontSize: 17, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 26, maxWidth: 520, marginBottom: 32 },
  heroCTA: { flexDirection: 'column', gap: 12, alignItems: 'center' },
  heroCTAWide: { flexDirection: 'row' },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 10,
  },
  heroBtnText: { color: '#1A1A2E', fontSize: 16, fontWeight: '700' },
  heroBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroBtnOutlineText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  trustStrip: { flexDirection: 'row', gap: 20, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustText: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },

  // ─── Stats Bar ─────────────
  statsBar: { paddingVertical: 20, paddingHorizontal: Spacing.md },
  statsInner: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  statsInnerWide: { maxWidth: 1000, alignSelf: 'center', width: '100%' },
  statItem: { alignItems: 'center', flex: 1, minWidth: 120, paddingVertical: 8 },
  statBorder: { borderRightWidth: Platform.OS === 'web' ? 1 : 0, borderRightColor: 'rgba(255,255,255,0.2)' },
  statValue: { fontSize: 28, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // ─── Shared Section ────────
  section: { paddingVertical: 60, paddingHorizontal: Spacing.md },
  sectionInner: { maxWidth: 1100, alignSelf: 'center', width: '100%' },
  sectionHeader: { alignItems: 'center', marginBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  sectionTitle: { fontSize: 30, fontWeight: '800', textAlign: 'center', lineHeight: 40 },
  sectionDesc: { fontSize: 16, lineHeight: 26 },

  // ─── About ─────────────────
  aboutRow: { flexDirection: 'row', alignItems: 'center' },
  aboutImageWrap: { width: '40%', position: 'relative' },
  aboutImage: { width: '100%', height: 400, borderRadius: 16 },
  aboutImageAccent: { position: 'absolute', width: 60, height: '80%', borderRadius: 12, right: -12, top: '10%', zIndex: -1 },
  aboutText: {},
  aboutBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  aboutBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 50, borderWidth: 1 },
  aboutBadgeText: { fontSize: 12, fontWeight: '700' },

  // ─── Services ──────────────
  servicesGrid: { gap: 16 },
  servicesGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  serviceCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minWidth: 300,
    maxWidth: Platform.OS === 'web' ? 350 : undefined,
  },
  serviceIcon: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  serviceTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  serviceDesc: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  serviceLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serviceLinkText: { fontSize: 14, fontWeight: '600' },

  // ─── How It Works ──────────
  stepsGrid: { gap: 24 },
  stepsGridWide: { flexDirection: 'row' },
  stepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  stepNumber: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  stepNumberText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  stepLine: { position: 'absolute', height: 2, width: '60%', top: 24, right: '-30%', zIndex: -1 },
  stepTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  stepDesc: { fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 220 },

  // ─── Testimonials ──────────
  testimonialGrid: { gap: 16 },
  testimonialGridWide: { flexDirection: 'row' },
  testimonialCard: { flex: 1, padding: 24, borderRadius: 16, borderWidth: 1, minWidth: 280 },
  testimonialText: { fontSize: 15, lineHeight: 24, fontStyle: 'italic', marginBottom: 20 },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testimonialAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  testimonialInitial: { fontSize: 16, fontWeight: '800' },
  testimonialName: { fontSize: 14, fontWeight: '700' },
  testimonialRole: { fontSize: 12 },

  // ─── CTA ───────────────────
  ctaBg: { minHeight: 350, justifyContent: 'center' },
  ctaOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  ctaContent: { alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 50 },
  ctaTitle: { fontSize: 30, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 12, zIndex: 2 },
  ctaSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', maxWidth: 450, marginBottom: 28, zIndex: 2 },
  ctaButtons: { zIndex: 2 },

  // ─── Footer ────────────────
  footer: { paddingTop: 48, paddingBottom: 24, paddingHorizontal: Spacing.lg },
  footerInner: { maxWidth: 1100, alignSelf: 'center', width: '100%', marginBottom: 32 },
  footerInnerWide: { flexDirection: 'row', justifyContent: 'space-between' },
  footerBrand: { marginBottom: 24 },
  footerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  footerLogoText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  footerTagline: { fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 20 },
  footerLinks: { flexDirection: 'row', gap: 48 },
  footerCol: { gap: 8 },
  footerColTitle: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  footerLink: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  footerBottom: { borderTopWidth: 1, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 1100, alignSelf: 'center', width: '100%' },
  footerCopyright: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  footerBadges: { flexDirection: 'row', gap: 16 },
  footerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerBadgeText: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
});
