import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';

// ─── Mock data ────────────────────────────────────────────────────────────────

const REFERRAL_CODE = 'DVYNE-2026';

const SHARE_MESSAGE =
  `Hey! I've been using Purse to save money and learn personal finance. Join me using my referral code ${REFERRAL_CODE} and we'll both earn ₦200! Download the app: https://getpurse.app`;

interface Referral {
  name: string;
  joined: string;
  earned: number | null;
  status: 'completed' | 'pending';
}

const MOCK_REFERRALS: Referral[] = [
  { name: 'Amina I.', joined: '2 days ago', earned: 200, status: 'completed' },
  { name: 'Blessing O.', joined: '5 days ago', earned: 200, status: 'completed' },
  { name: 'Fatima M.', joined: '1 week ago', earned: null, status: 'pending' },
];

const STEPS = [
  {
    number: '1',
    icon: 'share-social' as keyof typeof Ionicons.glyphMap,
    title: 'Share your code',
    desc: 'Send your unique code to friends and family',
  },
  {
    number: '2',
    icon: 'person-add' as keyof typeof Ionicons.glyphMap,
    title: 'Friend signs up',
    desc: 'They register and complete their first lesson',
  },
  {
    number: '3',
    icon: 'gift' as keyof typeof Ionicons.glyphMap,
    title: 'You both earn',
    desc: 'Get ₦200 reward deposited to your Purse wallet',
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ReferralScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { contentMaxWidth } = useResponsive();

  const [copied, setCopied] = useState(false);

  const totalEarned = MOCK_REFERRALS.filter((r) => r.earned).reduce(
    (sum, r) => sum + (r.earned ?? 0),
    0,
  );

  const handleCopy = () => {
    Clipboard.setString(REFERRAL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(SHARE_MESSAGE)}`;
    Linking.openURL(url).catch(() => {});
  };

  // Glassmorphism
  const glass = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    borderRadius: BorderRadius.lg,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any)
      : {}),
  };

  const glassDark = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    borderRadius: BorderRadius.md,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as any)
      : {}),
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } : null,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.accentLight }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Invite & Earn</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Hero */}
      <View style={[styles.heroCard, glass]}>
        <View style={[styles.heroIconBg, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="gift" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.heroHeadline, { color: colors.text }]}>
          Share Purse, Earn Rewards
        </Text>
        <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
          Invite friends and earn <Text style={{ color: colors.primary, fontWeight: '700' }}>₦200</Text>{' '}
          for every person who joins and completes their first lesson.
        </Text>

        {/* Referral code */}
        <View style={[styles.codeBox, glassDark, { borderColor: colors.primary + '50', borderStyle: 'dashed' }]}>
          <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>Your Referral Code</Text>
          <Text style={[styles.codeText, { color: colors.primary }]}>{REFERRAL_CODE}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: copied ? colors.success : colors.primary },
            ]}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={18}
              color={colors.textInverse}
            />
            <Text style={[styles.actionBtnText, { color: colors.textInverse }]}>
              {copied ? 'Copied!' : 'Copy Code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#25D366' }]}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Share via WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* How it works */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>How It Works</Text>

      <View style={[styles.stepsCard, glass]}>
        {STEPS.map((step, i) => (
          <View key={step.number}>
            <View style={styles.stepRow}>
              <View style={[styles.stepNumCircle, { backgroundColor: colors.primary }]}>
                <Text style={[styles.stepNum, { color: colors.textInverse }]}>{step.number}</Text>
              </View>
              <View style={[styles.stepIconWrap, { backgroundColor: colors.accentLight }]}>
                <Ionicons name={step.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>{step.desc}</Text>
              </View>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepConnector, { backgroundColor: colors.borderLight }]} />
            )}
          </View>
        ))}
      </View>

      {/* Total earned */}
      <View style={[styles.totalCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30', borderWidth: 1, borderRadius: BorderRadius.lg }]}>
        <View>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Rewards Earned</Text>
          <Text style={[styles.totalAmount, { color: colors.primary }]}>₦{totalEarned.toLocaleString()}</Text>
        </View>
        <View style={[styles.totalBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="trophy" size={20} color={colors.textInverse} />
        </View>
      </View>

      {/* Referrals list */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Referrals</Text>

      {MOCK_REFERRALS.map((ref, i) => (
        <View key={i} style={[styles.referralRow, glass, { marginBottom: Spacing.sm }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.avatarInitial, { color: colors.primary }]}>
              {ref.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.referralInfo}>
            <Text style={[styles.referralName, { color: colors.text }]}>{ref.name}</Text>
            <Text style={[styles.referralJoined, { color: colors.textLight }]}>
              Joined {ref.joined}
            </Text>
          </View>
          {ref.status === 'completed' ? (
            <View style={styles.earnedBadge}>
              <Text style={[styles.earnedText, { color: colors.success }]}>
                +₦{ref.earned?.toLocaleString()}
              </Text>
            </View>
          ) : (
            <View style={[styles.pendingBadge, { backgroundColor: colors.warningLight }]}>
              <Text style={[styles.pendingText, { color: colors.warning }]}>Pending</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },

  // Hero
  heroCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  heroIconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeadline: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroSub: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeBox: {
    width: '100%',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1.5,
    gap: Spacing.xs,
  },
  codeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeText: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    letterSpacing: 3,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 140,
  },
  actionBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // Steps
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  stepsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  stepNumCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '800',
  },
  stepIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: FontSize.xs,
    marginTop: 2,
    lineHeight: 18,
  },
  stepConnector: {
    width: 2,
    height: 12,
    borderRadius: 1,
    marginLeft: 10,
  },

  // Total
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  totalLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    marginTop: 2,
  },
  totalBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Referral rows
  referralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  referralJoined: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  earnedBadge: {
    alignItems: 'flex-end',
  },
  earnedText: {
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  pendingBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  pendingText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
