import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../src/components/Button';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroSection}>
        <Text style={styles.emoji}>👛</Text>
        <Text style={styles.title}>Welcome to Purse</Text>
        <Text style={styles.subtitle}>
          Your smart companion for financial literacy, savings, and secure payments
        </Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '📚', title: 'Learn Finance', desc: 'Fun, bite-sized lessons on budgeting, saving & investing' },
          { icon: '🎯', title: 'Save Smart', desc: 'Set goals and auto-save with Interswitch AutoPay' },
          { icon: '💸', title: 'Pay & Transfer', desc: 'Bills, airtime, and send money — all in one app' },
          { icon: '👥', title: 'WAG Community', desc: 'Join Women Affinity Groups for group savings' },
          { icon: '🤖', title: 'AI Advisor', desc: 'Get personalized financial advice anytime' },
        ].map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          title="Create Account"
          onPress={() => router.push('/(auth)/login?mode=register')}
          size="lg"
        />
        <Button
          title="I Already Have an Account"
          onPress={() => router.push('/(auth)/login?mode=login')}
          variant="outline"
          size="lg"
        />
      </View>

      <Text style={styles.powered}>Powered by Interswitch</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: 60,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  features: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  featureDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  powered: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginBottom: Spacing.xl,
  },
});
