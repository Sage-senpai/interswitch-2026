import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import ProgressBar from '../../src/components/ProgressBar';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { savingsAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

export default function SavingsGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
      Alert.alert('Saved!', res.data.data.message);
      setAmount('');
      fetchGoals();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Deposit failed');
    }
    setLoading(false);
  };

  if (!goal) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading goal...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{goal.name}</Text>
      <Text style={styles.category}>{goal.category}</Text>

      <Card variant="elevated" style={styles.progressCard}>
        <Text style={styles.amountSaved}>{formatNaira(goal.current)}</Text>
        <Text style={styles.amountTarget}>of {formatNaira(goal.target)} target</Text>
        <ProgressBar
          progress={goal.progress}
          color={goal.progress >= 100 ? Colors.success : Colors.primary}
          height={12}
        />
        {goal.progress >= 100 && (
          <View style={styles.celebrationRow}>
            <Text style={styles.celebration}>🎉 Goal reached! Congratulations!</Text>
          </View>
        )}
      </Card>

      {/* Quick Deposit */}
      <Card title="Add to Savings" style={styles.depositCard}>
        <View style={styles.depositRow}>
          <TextInput
            style={styles.depositInput}
            placeholder="Amount"
            placeholderTextColor={Colors.textLight}
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
      <Card style={styles.autoPayCard}>
        <View style={styles.autoPayRow}>
          <Ionicons name="repeat" size={22} color={goal.hasAutoPay ? Colors.success : Colors.textLight} />
          <View style={{ flex: 1 }}>
            <Text style={styles.autoPayTitle}>
              AutoPay {goal.hasAutoPay ? 'Active' : 'Inactive'}
            </Text>
            <Text style={styles.autoPayDesc}>
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
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textSecondary },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  category: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md, textTransform: 'capitalize' },
  progressCard: { padding: Spacing.lg, marginBottom: Spacing.md },
  amountSaved: { fontSize: 36, fontWeight: '800', color: Colors.text },
  amountTarget: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  celebrationRow: { marginTop: Spacing.sm },
  celebration: { fontSize: FontSize.md, color: Colors.accent, fontWeight: '700', textAlign: 'center' },
  depositCard: { marginBottom: Spacing.md },
  depositRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  depositInput: {
    flex: 1, backgroundColor: Colors.surfaceSecondary, borderRadius: BorderRadius.md,
    padding: Spacing.sm, fontSize: FontSize.md, color: Colors.text,
  },
  autoPayCard: { marginBottom: Spacing.md, padding: Spacing.md },
  autoPayRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  autoPayTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  autoPayDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
});
