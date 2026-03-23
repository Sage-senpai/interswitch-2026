import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { paymentAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export default function FundWalletScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFund = async () => {
    const numAmount = Number(amount);
    if (numAmount < 100) {
      Alert.alert('Invalid Amount', 'Minimum funding amount is ₦100');
      return;
    }

    setLoading(true);
    try {
      const res = await paymentAPI.fundWallet(numAmount);
      const data = res.data.data;

      Alert.alert(
        'Payment Initiated',
        `Transaction ref: ${data.transactionRef}\n\nIn production, you will be redirected to the Interswitch payment page to complete your card payment.`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Failed to initiate payment');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.iswBadge}>
          <Ionicons name="card" size={18} color={Colors.interswitch} />
          <Text style={styles.iswText}>Powered by Interswitch IPG</Text>
        </View>

        <Text style={styles.label}>Enter Amount</Text>
        <View style={styles.inputRow}>
          <Text style={styles.currency}>₦</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textLight}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.quickAmounts}>
          {QUICK_AMOUNTS.map((val) => (
            <Button
              key={val}
              title={formatNaira(val)}
              onPress={() => setAmount(val.toString())}
              variant={amount === val.toString() ? 'primary' : 'outline'}
              size="sm"
              style={styles.quickBtn}
            />
          ))}
        </View>

        <Button
          title={`Fund Wallet${amount ? ` — ${formatNaira(Number(amount))}` : ''}`}
          onPress={handleFund}
          loading={loading}
          disabled={!amount || Number(amount) < 100}
          size="lg"
          style={styles.fundBtn}
        />

        <Text style={styles.note}>
          You'll be redirected to Interswitch's secure payment page to enter your card details. Supports Verve, Mastercard, and Visa.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.md },
  card: { padding: Spacing.lg },
  iswBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.lg },
  iswText: { fontSize: FontSize.sm, color: Colors.interswitch, fontWeight: '600' },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  currency: { fontSize: 36, fontWeight: '800', color: Colors.text, marginRight: Spacing.sm },
  input: { flex: 1, fontSize: 36, fontWeight: '800', color: Colors.text },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  quickBtn: { minWidth: 90 },
  fundBtn: { marginBottom: Spacing.md },
  note: { fontSize: FontSize.xs, color: Colors.textLight, textAlign: 'center', lineHeight: 18 },
});
