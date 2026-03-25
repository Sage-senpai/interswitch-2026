import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { useTheme } from '../../src/hooks/useTheme';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { paymentAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

// Load Interswitch inline checkout script on web
function loadInterswitchCheckout(): Promise<void> {
  if (Platform.OS !== 'web') return Promise.resolve();

  return new Promise((resolve, reject) => {
    if ((window as any).webpayCheckout) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://newwebpay.qa.interswitchng.com/inline-checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Interswitch checkout'));
    document.head.appendChild(script);
  });
}

export default function FundWalletScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFund = async () => {
    const numAmount = Number(amount);
    if (numAmount < 100) {
      const msg = 'Minimum funding amount is N100';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Invalid Amount', msg);
      return;
    }

    setLoading(true);
    try {
      const res = await paymentAPI.fundWallet(numAmount);
      const data = res.data.data;

      if (Platform.OS === 'web') {
        // Use Interswitch inline checkout on web
        try {
          await loadInterswitchCheckout();
          const config = data.checkoutConfig || data.paymentData;

          (window as any).webpayCheckout({
            merchant_code: config.merchant_code,
            pay_item_id: config.pay_item_id,
            txn_ref: config.txn_ref || data.transactionRef,
            amount: typeof config.amount === 'string' ? parseInt(config.amount) : config.amount,
            currency: config.currency || 566,
            cust_email: 'user@purse-app.com',
            cust_id: config.cust_id,
            site_redirect_url: config.site_redirect_url,
            mode: 'TEST',
            onComplete: async (response: any) => {
              // Send result to our server to credit wallet
              try {
                await paymentAPI.processCallback({
                  resp: response.resp || response.ResponseCode,
                  txnref: data.transactionRef,
                  payRef: response.payRef || response.PaymentReference,
                  apprAmt: response.apprAmt || String(numAmount * 100),
                });
              } catch (e) {
                console.error('Callback processing error:', e);
              }

              if (response.resp === '00' || response.ResponseCode === '00') {
                alert(`Payment successful! N${numAmount} added to your wallet.`);
              } else {
                alert(`Payment was not completed. Code: ${response.resp || response.ResponseCode}`);
              }
              router.back();
            },
            onClose: () => {
              console.log('Payment window closed');
            },
          });
        } catch (e) {
          // Fallback if inline checkout fails
          alert(`Payment initiated! Ref: ${data.transactionRef}\n\nIn sandbox mode, use test card:\n5060990580000217499\nExpiry: 03/50, CVV: 111, PIN: 1111`);
          router.back();
        }
      } else {
        // Mobile: show info + deep link would go here in production
        Alert.alert(
          'Payment Initiated',
          `Transaction ref: ${data.transactionRef}\n\nUse Interswitch test card:\n5060990580000217499\nExpiry: 03/50\nCVV: 111, PIN: 1111`,
          [{ text: 'OK', onPress: () => router.back() }],
        );
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to initiate payment';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <View style={styles.iswBadge}>
          <Ionicons name="card" size={18} color={colors.interswitch} />
          <Text style={[styles.iswText, { color: colors.interswitch }]}>Powered by Interswitch IPG</Text>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Enter Amount</Text>
        <View style={styles.inputRow}>
          <Text style={[styles.currency, { color: colors.text }]}>N</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="0"
            placeholderTextColor={colors.textLight}
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

        <View style={[styles.testInfo, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.testTitle, { color: colors.primary }]}>Sandbox Test Card</Text>
          <Text style={[styles.testText, { color: colors.textSecondary }]}>
            Card: 5060990580000217499{'\n'}
            Expiry: 03/50 | CVV: 111 | PIN: 1111{'\n'}
            OTP: 123456 (if prompted)
          </Text>
        </View>

        <Text style={[styles.note, { color: colors.textLight }]}>
          Secure payment via Interswitch. Supports Verve, Mastercard, and Visa.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md },
  card: { padding: Spacing.lg },
  iswBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.lg },
  iswText: { fontSize: FontSize.sm, fontWeight: '600' },
  label: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  currency: { fontSize: 36, fontWeight: '800', marginRight: Spacing.sm },
  input: { flex: 1, fontSize: 36, fontWeight: '800' },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  quickBtn: { minWidth: 90 },
  fundBtn: { marginBottom: Spacing.md },
  testInfo: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  testTitle: { fontSize: FontSize.sm, fontWeight: '700', marginBottom: 4 },
  testText: { fontSize: FontSize.xs, lineHeight: 20, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  note: { fontSize: FontSize.xs, textAlign: 'center', lineHeight: 18 },
});
