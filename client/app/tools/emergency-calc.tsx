import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const COVERAGE_OPTIONS = [3, 6, 9, 12];
const MOCK_CURRENT_SAVINGS = 15_000;
const MOCK_WEEKLY_SAVINGS = 2_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(value: number): string {
  return '₦' + Math.round(value).toLocaleString();
}

function calculateFund(
  monthlyExpenses: number,
  dependents: number,
  coverageMonths: number,
): number {
  return monthlyExpenses * coverageMonths * (1 + dependents * 0.15);
}

// ─── Stepper component ────────────────────────────────────────────────────────

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
  isDark: boolean;
}

function Stepper({ value, min, max, onChange, label, colors, isDark }: StepperProps) {
  const glass = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    borderRadius: BorderRadius.md,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } as any)
      : {}),
  };

  return (
    <View style={stepperStyles.wrap}>
      <Text style={[stepperStyles.label, { color: colors.text }]}>{label}</Text>
      <View style={[stepperStyles.row, glass]}>
        <TouchableOpacity
          style={[
            stepperStyles.btn,
            { opacity: value <= min ? 0.35 : 1 },
          ]}
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[stepperStyles.value, { color: colors.text }]}>{value}</Text>
        <TouchableOpacity
          style={[
            stepperStyles.btn,
            { opacity: value >= max ? 0.35 : 1 },
          ]}
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  wrap: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    height: 52,
  },
  btn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EmergencyCalcScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { contentMaxWidth } = useResponsive();

  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [dependents, setDependents] = useState(0);
  const [coverageMonths, setCoverageMonths] = useState(6);
  const [result, setResult] = useState<{
    recommended: number;
    gap: number;
    weeksToGoal: number;
  } | null>(null);

  // Glassmorphism helpers
  const glass = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    borderRadius: BorderRadius.lg,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any)
      : {}),
  };

  const glassInput = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: colors.text,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as any)
      : {}),
  };

  const handleCalculate = () => {
    const expenses = parseFloat(monthlyExpenses.replace(/,/g, ''));
    if (!expenses || isNaN(expenses) || expenses <= 0) return;

    const recommended = calculateFund(expenses, dependents, coverageMonths);
    const gap = Math.max(0, recommended - MOCK_CURRENT_SAVINGS);
    const weeksToGoal =
      gap > 0 ? Math.ceil(gap / MOCK_WEEKLY_SAVINGS) : 0;

    setResult({ recommended, gap, weeksToGoal });
  };

  const canCalculate = !!monthlyExpenses && parseFloat(monthlyExpenses) > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.container,
          contentMaxWidth
            ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }
            : null,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.accentLight }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Fund</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Calculate how much you need to stay protected from life's surprises.
        </Text>

        {/* Inputs card */}
        <View style={[styles.inputsCard, glass]}>
          {/* Monthly expenses */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Monthly Expenses (₦)</Text>
          <TextInput
            style={glassInput}
            placeholder="e.g. 80,000"
            placeholderTextColor={colors.textLight}
            value={monthlyExpenses}
            onChangeText={setMonthlyExpenses}
            keyboardType="numeric"
            returnKeyType="done"
          />

          {/* Dependents stepper */}
          <View style={{ marginTop: Spacing.md }}>
            <Stepper
              label="Number of Dependents"
              value={dependents}
              min={0}
              max={10}
              onChange={setDependents}
              colors={colors}
              isDark={isDark}
            />
          </View>

          {/* Coverage months */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Months of Coverage</Text>
          <View style={styles.coverageRow}>
            {COVERAGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.coverageChip,
                  {
                    backgroundColor:
                      coverageMonths === opt
                        ? colors.primary
                        : isDark
                        ? 'rgba(255,255,255,0.07)'
                        : 'rgba(255,255,255,0.6)',
                    borderColor:
                      coverageMonths === opt
                        ? colors.primary
                        : isDark
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(0,0,0,0.06)',
                    borderWidth: 1,
                  },
                ]}
                onPress={() => {
                  setCoverageMonths(opt);
                  setResult(null);
                }}
              >
                <Text
                  style={[
                    styles.coverageChipText,
                    {
                      color:
                        coverageMonths === opt ? colors.textInverse : colors.textSecondary,
                      fontWeight: coverageMonths === opt ? '700' : '500',
                    },
                  ]}
                >
                  {opt} mo
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Calculate button */}
          <TouchableOpacity
            style={[
              styles.calcBtn,
              {
                backgroundColor: canCalculate ? colors.primary : colors.borderLight,
                opacity: canCalculate ? 1 : 0.6,
              },
            ]}
            onPress={handleCalculate}
            disabled={!canCalculate}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calculator"
              size={18}
              color={canCalculate ? colors.textInverse : colors.textLight}
            />
            <Text
              style={[
                styles.calcBtnText,
                { color: canCalculate ? colors.textInverse : colors.textLight },
              ]}
            >
              Calculate
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results card */}
        {result && (
          <>
            <View style={[styles.resultsCard, glass]}>
              <View style={styles.resultsTitleRow}>
                <Ionicons name="shield-checkmark" size={20} color={colors.success} />
                <Text style={[styles.resultsTitle, { color: colors.text }]}>Your Results</Text>
              </View>

              {/* Recommended */}
              <View style={[styles.resultRow, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
                <View style={styles.resultLabelWrap}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                    Recommended Fund
                  </Text>
                  <Text style={[styles.resultFormula, { color: colors.textLight }]}>
                    ₦{parseFloat(monthlyExpenses).toLocaleString()} × {coverageMonths} mo
                    {dependents > 0 ? ` × (1 + ${dependents} × 0.15)` : ''}
                  </Text>
                </View>
                <Text style={[styles.resultValue, { color: colors.primary }]}>
                  {formatNaira(result.recommended)}
                </Text>
              </View>

              {/* Current savings */}
              <View style={[styles.resultRow, { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                  Current Savings
                </Text>
                <Text style={[styles.resultValue, { color: colors.success }]}>
                  {formatNaira(MOCK_CURRENT_SAVINGS)}
                </Text>
              </View>

              {/* Gap */}
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                  Gap to Goal
                </Text>
                <Text
                  style={[
                    styles.resultValue,
                    { color: result.gap === 0 ? colors.success : colors.danger },
                  ]}
                >
                  {result.gap === 0 ? 'Goal Reached!' : formatNaira(result.gap)}
                </Text>
              </View>

              {/* Timeline insight */}
              {result.gap > 0 && (
                <View
                  style={[
                    styles.timelineBox,
                    {
                      backgroundColor: colors.accentLight,
                      borderRadius: BorderRadius.md,
                    },
                  ]}
                >
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={[styles.timelineText, { color: colors.text }]}>
                    At your current savings rate (
                    <Text style={{ fontWeight: '700', color: colors.primary }}>
                      {formatNaira(MOCK_WEEKLY_SAVINGS)}/week
                    </Text>
                    ), you'll reach your goal in{' '}
                    <Text style={{ fontWeight: '700', color: colors.primary }}>
                      {result.weeksToGoal} week{result.weeksToGoal !== 1 ? 's' : ''}
                    </Text>
                    .
                  </Text>
                </View>
              )}

              {result.gap === 0 && (
                <View
                  style={[
                    styles.timelineBox,
                    { backgroundColor: colors.successLight, borderRadius: BorderRadius.md },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[styles.timelineText, { color: colors.text }]}>
                    You have already reached your emergency fund goal!
                  </Text>
                </View>
              )}
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/savings/new-goal')}
              activeOpacity={0.85}
            >
              <Ionicons name="wallet" size={20} color={colors.textInverse} />
              <Text style={[styles.ctaBtnText, { color: colors.textInverse }]}>
                Start Saving Toward This Goal
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Info footer */}
        <View style={[styles.infoCard, { backgroundColor: colors.accentLight, borderRadius: BorderRadius.md }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Financial experts recommend keeping 3–6 months of expenses in an emergency fund.
            Adjust for dependents and job stability.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: Spacing.sm,
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
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },

  // Inputs card
  inputsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },

  // Coverage chips
  coverageRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  coverageChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  coverageChipText: {
    fontSize: FontSize.sm,
  },

  // Calculate button
  calcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  calcBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },

  // Results card
  resultsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  resultsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  resultsTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: Spacing.md,
  },
  resultLabelWrap: {
    flex: 1,
    gap: 2,
  },
  resultLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  resultFormula: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  resultValue: {
    fontSize: FontSize.md,
    fontWeight: '800',
    flexShrink: 0,
    marginLeft: Spacing.sm,
  },
  timelineBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  timelineText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },

  // CTA
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  ctaBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },

  // Info footer
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
