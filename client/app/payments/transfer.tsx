import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { transferAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

export default function TransferScreen() {
  const router = useRouter();
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerifyAccount = async () => {
    if (!bankCode || accountNumber.length !== 10) return;

    setVerifying(true);
    try {
      const res = await transferAPI.nameEnquiry(bankCode, accountNumber);
      setRecipientName(res.data.data.accountName);
      setVerified(true);
    } catch {
      Alert.alert('Error', 'Could not verify account. Please check the details.');
    }
    setVerifying(false);
  };

  const handleSend = async () => {
    if (!verified || !amount) return;

    const numAmount = Number(amount);
    Alert.alert(
      'Confirm Transfer',
      `Send ${formatNaira(numAmount)} to ${recipientName}?\n\nFee: ₦25\nTotal: ${formatNaira(numAmount + 25)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setSending(true);
            try {
              const res = await transferAPI.send({
                bankCode,
                accountNumber,
                amount: numAmount,
                recipientName,
                narration,
              });
              Alert.alert('Success', res.data.data.message, [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error?.message || 'Transfer failed');
            }
            setSending(false);
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.iswCard}>
        <Ionicons name="send" size={18} color={Colors.interswitch} />
        <Text style={styles.iswText}>Transfer via Interswitch</Text>
      </Card>

      <Text style={styles.label}>Bank Code</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 058 (GTBank)"
        placeholderTextColor={Colors.textLight}
        value={bankCode}
        onChangeText={(v) => { setBankCode(v); setVerified(false); }}
      />

      <Text style={styles.label}>Account Number</Text>
      <TextInput
        style={styles.input}
        placeholder="10-digit account number"
        placeholderTextColor={Colors.textLight}
        value={accountNumber}
        onChangeText={(v) => { setAccountNumber(v); setVerified(false); }}
        keyboardType="numeric"
        maxLength={10}
      />

      {!verified ? (
        <Button
          title="Verify Account"
          onPress={handleVerifyAccount}
          loading={verifying}
          disabled={!bankCode || accountNumber.length !== 10}
          variant="outline"
          style={styles.verifyBtn}
        />
      ) : (
        <Card style={styles.verifiedCard}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          <Text style={styles.verifiedName}>{recipientName}</Text>
        </Card>
      )}

      {verified && (
        <>
          <Text style={styles.label}>Amount (₦)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5000"
            placeholderTextColor={Colors.textLight}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Narration (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. School fees for Amina"
            placeholderTextColor={Colors.textLight}
            value={narration}
            onChangeText={setNarration}
          />

          <Text style={styles.fee}>Transfer fee: ₦25</Text>

          <Button
            title="Send Money"
            onPress={handleSend}
            loading={sending}
            disabled={!amount || Number(amount) < 50}
            size="lg"
            style={styles.sendBtn}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  iswCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg, padding: Spacing.md },
  iswText: { fontSize: FontSize.sm, color: Colors.interswitch, fontWeight: '600' },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text,
  },
  verifyBtn: { marginTop: Spacing.md },
  verifiedCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md,
    backgroundColor: Colors.successLight + '15', borderColor: Colors.success + '30', padding: Spacing.md,
  },
  verifiedName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.success },
  fee: { fontSize: FontSize.sm, color: Colors.textLight, marginTop: Spacing.sm },
  sendBtn: { marginTop: Spacing.lg },
});
