import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';

const PITCH = {
  problem: [
    '36 million Nigerian women remain financially excluded from formal banking systems.',
    'Rural women face limited banking access, low literacy, cultural barriers, and zero tailored financial tools.',
    'Existing fintech solutions were not designed for the unique needs of Nigerian women and girls.',
  ],
  solution: [
    'Purse is a mobile-first, AI-powered platform combining financial education with real micro-savings and secure payments.',
    'Designed specifically for women and girls in rural and underserved Nigeria.',
    'Every lesson unlocks real savings tools, every module completed builds a credit profile, every naira saved is secured on-chain.',
  ],
};

const TECH_STACK = [
  { name: 'React Native (Expo)', role: 'Cross-platform mobile app', icon: 'phone-portrait-outline' },
  { name: 'Node.js + Express', role: 'Backend REST API', icon: 'server-outline' },
  { name: 'Interswitch IPG + Quickteller', role: 'Payments, bills, transfers', icon: 'card-outline' },
  { name: 'Interswitch AutoPay', role: 'Recurring micro-savings', icon: 'repeat-outline' },
  { name: 'PostgreSQL + Redis', role: 'Data storage + caching', icon: 'layers-outline' },
  { name: 'Polygon L2 Blockchain', role: 'Transparent savings ledger', icon: 'cube-outline' },
  { name: 'TensorFlow Lite + OpenAI', role: 'AI financial advisor', icon: 'bulb-outline' },
  { name: 'Neon + Upstash', role: 'Cloud database + Redis', icon: 'cloud-outline' },
];

const FEATURES = [
  {
    title: 'Gamified Financial Education',
    items: ['12+ lessons: budgeting, saving, investing, digital safety', 'Quizzes with instant feedback', 'Badges and naira rewards for completion', 'Future: Hausa, Yoruba, Igbo language support'],
  },
  {
    title: 'AI Financial Advisor',
    items: ['Personalized savings advice based on income patterns', 'Smart nudges and spending insights', 'Goal tracking with visual dashboards', 'Works offline with TF Lite on-device models'],
  },
  {
    title: 'Micro-Savings & Goals',
    items: ['Set savings goals: education, business, health, emergency', 'Automated daily/weekly savings via Interswitch AutoPay', 'WAG group savings pots with blockchain verification', 'Round-up savings on every transaction'],
  },
  {
    title: 'Secure Payments (Interswitch)',
    items: ['IPG: Card collections, wallet funding', 'Quickteller: Bill payments, airtime, school fees', 'Transfers: P2P and interbank remittances', 'All transactions via Interswitch secure rails'],
  },
  {
    title: 'Blockchain Transparency',
    items: ['Savings records logged on Polygon L2', 'Immutable, auditable transaction history', 'WAG group contributions verifiable by all members', 'Financial proof for loan/grant applications'],
  },
  {
    title: 'Women Affinity Groups (WAGs)',
    items: ['Create/join savings groups (ajo/esusu style)', 'Rotating payouts or goal-based release', 'Peer mentoring and moderated forums', 'Aligned with NFWP-SU 26,000+ WAGs'],
  },
];

const ALIGNMENT = [
  { name: 'EmpowerHER Programme', desc: '250K+ women in financial literacy training. Purse extends this with practical digital tools.' },
  { name: 'NFWP Scale-Up (NFWP-SU)', desc: '$540M World Bank program targeting 5M women. Purse digitizes WAG savings management.' },
  { name: 'CBN NFIS', desc: 'Directly addresses the gender gap in financial inclusion for rural women.' },
  { name: 'We-FI Code', desc: 'Supports women entrepreneurs with credit-building and micro-business tools.' },
];

const TEAM = [
  { name: 'Member 1', role: 'Full-Stack Developer — Backend API, Interswitch integration, blockchain' },
  { name: 'Member 2', role: 'Frontend / Mobile — React Native app, UI/UX implementation' },
  { name: 'Member 3', role: 'AI / ML Engineer — Financial advisor model, NLP, recommendations' },
  { name: 'Member 4', role: 'Product & Design — UX research, wireframes, user testing' },
];

export default function DocsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isDesktop } = useResponsive();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[s.section, { borderBottomColor: colors.border }]}>
      <Text style={[s.sectionTitle, { color: colors.primary }]}>{title}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView style={[s.container, { backgroundColor: colors.background }]} contentContainerStyle={[s.content, isDesktop && s.contentWide]}>
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <Text style={[s.backText, { color: colors.primary }]}>Back</Text>
      </TouchableOpacity>

      <View style={[s.hero, { backgroundColor: isDark ? colors.surface : colors.primaryDark }]}>
        <Ionicons name="wallet" size={36} color="#fff" style={{ marginBottom: 12 }} />
        <Text style={s.heroTitle}>Purse Documentation</Text>
        <Text style={s.heroSub}>AI-Powered Financial Literacy & Empowerment for Nigerian Women</Text>
        <View style={s.heroBadge}>
          <Text style={s.heroBadgeText}>Enyata x Interswitch Buildathon 2026</Text>
        </View>
      </View>

      {/* Problem */}
      <Section title="The Problem">
        {PITCH.problem.map((p, i) => (
          <View key={i} style={s.bulletRow}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={[s.bulletText, { color: colors.text }]}>{p}</Text>
          </View>
        ))}
      </Section>

      {/* Solution */}
      <Section title="Our Solution">
        {PITCH.solution.map((p, i) => (
          <View key={i} style={s.bulletRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={[s.bulletText, { color: colors.text }]}>{p}</Text>
          </View>
        ))}
      </Section>

      {/* Features */}
      <Section title="Key Features">
        <View style={[s.featGrid, isDesktop && s.featGridWide]}>
          {FEATURES.map((f, i) => (
            <View key={i} style={[s.featCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.featTitle, { color: colors.text }]}>{f.title}</Text>
              {f.items.map((item, j) => (
                <View key={j} style={s.featItem}>
                  <Text style={[s.featDot, { color: colors.primary }]}>*</Text>
                  <Text style={[s.featItemText, { color: colors.textSecondary }]}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Section>

      {/* Tech Stack */}
      <Section title="Tech Stack">
        <View style={[s.techGrid, isDesktop && s.techGridWide]}>
          {TECH_STACK.map((t, i) => (
            <View key={i} style={[s.techCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name={t.icon as any} size={22} color={colors.primary} />
              <Text style={[s.techName, { color: colors.text }]}>{t.name}</Text>
              <Text style={[s.techRole, { color: colors.textSecondary }]}>{t.role}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* National Alignment */}
      <Section title="National Programme Alignment">
        {ALIGNMENT.map((a, i) => (
          <View key={i} style={[s.alignCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.alignName, { color: colors.primary }]}>{a.name}</Text>
            <Text style={[s.alignDesc, { color: colors.textSecondary }]}>{a.desc}</Text>
          </View>
        ))}
      </Section>

      {/* Team */}
      <Section title="Team">
        {TEAM.map((m, i) => (
          <View key={i} style={s.teamRow}>
            <View style={[s.teamAvatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[s.teamInitial, { color: colors.primary }]}>{m.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.teamName, { color: colors.text }]}>{m.name}</Text>
              <Text style={[s.teamRole, { color: colors.textSecondary }]}>{m.role}</Text>
            </View>
          </View>
        ))}
      </Section>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={[s.footerText, { color: colors.textLight }]}>
          Built for the Enyata x Interswitch Buildathon 2026
        </Text>
        <View style={s.footerBadges}>
          <View style={s.footerBadge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.interswitch} />
            <Text style={[s.footerBadgeText, { color: colors.textLight }]}>Interswitch Secured</Text>
          </View>
          <View style={s.footerBadge}>
            <Ionicons name="cube" size={12} color={colors.primary} />
            <Text style={[s.footerBadgeText, { color: colors.textLight }]}>Blockchain Verified</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 60 },
  contentWide: { maxWidth: 900, alignSelf: 'center', width: '100%', paddingHorizontal: Spacing.xl },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md, paddingTop: Platform.OS === 'web' ? 16 : 50 },
  backText: { fontSize: FontSize.sm, fontWeight: '600' },
  hero: { borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.xl },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 6, maxWidth: 400 },
  heroBadge: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 50 },
  heroBadgeText: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  section: { marginBottom: Spacing.xl, paddingBottom: Spacing.xl, borderBottomWidth: 1 },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '800', marginBottom: Spacing.md },
  bulletRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  bulletText: { fontSize: FontSize.md, lineHeight: 24, flex: 1 },
  featGrid: { gap: 12 },
  featGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  featCard: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, flex: 1, minWidth: 260 },
  featTitle: { fontSize: FontSize.md, fontWeight: '700', marginBottom: 8 },
  featItem: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  featDot: { fontSize: 14, fontWeight: '800' },
  featItemText: { fontSize: FontSize.sm, lineHeight: 20, flex: 1 },
  techGrid: { gap: 10 },
  techGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  techCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: BorderRadius.md, borderWidth: 1, flex: 1, minWidth: 240 },
  techName: { fontSize: FontSize.sm, fontWeight: '700' },
  techRole: { fontSize: FontSize.xs },
  alignCard: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: 10 },
  alignName: { fontSize: FontSize.md, fontWeight: '700', marginBottom: 4 },
  alignDesc: { fontSize: FontSize.sm, lineHeight: 20 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  teamAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  teamInitial: { fontSize: 16, fontWeight: '800' },
  teamName: { fontSize: FontSize.md, fontWeight: '700' },
  teamRole: { fontSize: FontSize.sm },
  footer: { alignItems: 'center', paddingTop: Spacing.lg },
  footerText: { fontSize: FontSize.xs, marginBottom: 8 },
  footerBadges: { flexDirection: 'row', gap: 16 },
  footerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerBadgeText: { fontSize: 11 },
});
