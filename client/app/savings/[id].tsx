import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import ProgressBar from '../../src/components/ProgressBar';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { savingsAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

export default function SavingsGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const [goals, setGoals] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await savingsAPI.getGoals();
      setGoals(res.data.data || []);
    } catch {}
  };

  useEffect(() => { fetchGoals(); }, []);

  const goal = goals.find((g) => g.id === id);

  const handleDeposit = async () => {
    if (!amount || Number(amount) < 50) return;
    setLoading(true);
    try {
      const res = await savingsAPI.deposit(id!, Number(amount));
      if (Platform.OS === 'web') {
        alert(res.data.data.message);
      } else {
        Alert.alert('Saved!', res.data.data.message);
      }
      setAmount('');
      fetchGoals();
    } catch (err: any) {
      if (Platform.OS === 'web') {
        alert(err.response?.data?.error?.message || 'Deposit failed');
      } else {
        Alert.alert('Error', err.response?.data?.error?.message || 'Deposit failed');
      }
    }
    setLoading(false);
  };

  const glassCard = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    borderRadius: 20,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any)
      : {}),
  };

  const glassInput = {
    flex: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: FontSize.md,
    color: colors.text,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any)
      : {}),
  };

  if (!goal) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: colors.textSecondary }}>Loading goal...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}
    >
      <Text style={[styles.title, { color: colors.text }]}>{goal.name}</Text>
      <Text style={[styles.category, { color: colors.textSecondary }]}>{goal.category}</Text>

      {/* Progress Card */}
      <Card variant="elevated" style={[styles.progressCard, glassCard]}>
        <Text style={[styles.amountSaved, { color: colors.text }]}>{formatNaira(goal.current)}</Text>
        <Text style={[styles.amountTarget, { color: colors.textSecondary }]}>
          of {formatNaira(goal.target)} target
        </Text>
        <ProgressBar
          progress={goal.progress}
          color={goal.progress >= 100 ? colors.success : colors.primary}
          height={12}
        />
        {goal.progress >= 100 && (
          <View style={styles.celebrationRow}>
            <Text style={[styles.celebration, { color: colors.accent }]}>
              🎉 Goal reached! Congratulations!
            </Text>
          </View>
        )}
      </Card>

      {/* Quick Deposit */}
      <Card title="Add to Savings" style={[styles.depositCard, glassCard]}>
        <View style={styles.depositRow}>
          <TextInput
            style={glassInput}
            placeholder="Amount"
            placeholderTextColor={colors.textLight}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Button
            title="Save"
            onPress={handleDeposit}
            loading={loading}
            disabled={!amount || Number(amount) < 50}
            size="md"
          />
        </View>
      </Card>

      {/* AutoPay Status */}
      <Card style={[styles.autoPayCard, glassCard]}>
        <View style={styles.autoPayRow}>
          <Ionicons
            name="repeat"
            size={22}
            color={goal.hasAutoPay ? colors.success : colors.textLight}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.autoPayTitle, { color: colors.text }]}>
              AutoPay {goal.hasAutoPay ? 'Active' : 'Inactive'}
            </Text>
            <Text style={[styles.autoPayDesc, { color: colors.textSecondary }]}>
              {goal.hasAutoPay
                ? `${formatNaira(goal.autoAmount)} ${goal.frequency?.toLowerCase()}`
                : 'Set up automatic savings via Interswitch'}
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: '800' },
  category: { fontSize: FontSize.sm, marginBottom: Spacing.md, textTransform: 'capitalize' },
  progressCard: { padding: Spacing.lg, marginBottom: Spacing.md },
  amountSaved: { fontSize: 36, fontWeight: '800' },
  amountTarget: { fontSize: FontSize.sm, marginBottom: Spacing.md },
  celebrationRow: { marginTop: Spacing.sm },
  celebration: { fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  depositCard: { marginBottom: Spacing.md },
  depositRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  autoPayCard: { marginBottom: Spacing.md, padding: Spacing.md },
  autoPayRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  autoPayTitle: { fontSize: FontSize.md, fontWeight: '700' },
  autoPayDesc: { fontSize: FontSize.sm, marginTop: 2 },
});
