import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { transferAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

export default function TransferScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
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
      if (Platform.OS === 'web') {
        alert('Could not verify account. Please check the details.');
      } else {
        Alert.alert('Error', 'Could not verify account. Please check the details.');
      }
    }
    setVerifying(false);
  };

  const handleSend = async () => {
    if (!verified || !amount) return;

    const numAmount = Number(amount);
    const confirmMsg = `Send ${formatNaira(numAmount)} to ${recipientName}?\n\nFee: ₦25\nTotal: ${formatNaira(numAmount + 25)}`;

    const doSend = async () => {
      setSending(true);
      try {
        const res = await transferAPI.send({
          bankCode,
          accountNumber,
          amount: numAmount,
          recipientName,
          narration,
        });
        const successMsg = res.data.data.message;
        if (Platform.OS === 'web') {
          alert(successMsg);
          router.back();
        } else {
          Alert.alert('Success', successMsg, [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }
      } catch (err: any) {
        const msg = err.response?.data?.error?.message || 'Transfer failed';
        if (Platform.OS === 'web') {
          alert(msg);
        } else {
          Alert.alert('Error', msg);
        }
      }
      setSending(false);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        await doSend();
      }
    } else {
      Alert.alert(
        'Confirm Transfer',
        confirmMsg,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send', onPress: doSend },
        ],
      );
    }
  };

  const glassCard = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    borderRadius: 16,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any)
      : {}),
  };

  const glassInput = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: colors.text,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' } as any)
      : {}),
  };

  const labelStyle = {
    fontSize: FontSize.sm,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}
    >
      {/* Interswitch banner */}
      <Card style={[{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg, padding: Spacing.md }, glassCard]}>
        <Ionicons name="send" size={18} color={colors.interswitch} />
        <Text style={{ fontSize: FontSize.sm, color: colors.interswitch, fontWeight: '600' }}>
          Transfer via Interswitch
        </Text>
      </Card>

      <Text style={labelStyle}>Bank Code</Text>
      <TextInput
        style={glassInput}
        placeholder="e.g. 058 (GTBank)"
        placeholderTextColor={colors.textLight}
        value={bankCode}
        onChangeText={(v) => { setBankCode(v); setVerified(false); }}
      />

      <Text style={labelStyle}>Account Number</Text>
      <TextInput
        style={glassInput}
        placeholder="10-digit account number"
        placeholderTextColor={colors.textLight}
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
          style={{ marginTop: Spacing.md }}
        />
      ) : (
        <Card
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.sm,
              marginTop: Spacing.md,
              padding: Spacing.md,
            },
            glassCard,
            {
              backgroundColor: isDark ? 'rgba(129,199,132,0.12)' : colors.successLight,
              borderColor: colors.success + '30',
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: colors.success }}>
            {recipientName}
          </Text>
        </Card>
      )}

      {verified && (
        <>
          <Text style={labelStyle}>Amount (₦)</Text>
          <TextInput
            style={glassInput}
            placeholder="e.g. 5000"
            placeholderTextColor={colors.textLight}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <Text style={labelStyle}>Narration (optional)</Text>
          <TextInput
            style={glassInput}
            placeholder="e.g. School fees for Amina"
            placeholderTextColor={colors.textLight}
            value={narration}
            onChangeText={setNarration}
          />

          <Text style={{ fontSize: FontSize.sm, color: colors.textLight, marginTop: Spacing.sm }}>
            Transfer fee: ₦25
          </Text>

          <Button
            title="Send Money"
            onPress={handleSend}
            loading={sending}
            disabled={!amount || Number(amount) < 50}
            size="lg"
            style={{ marginTop: Spacing.lg }}
          />
        </>
      )}
    </ScrollView>
  );
}
