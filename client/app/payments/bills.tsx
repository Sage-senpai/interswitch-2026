import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { paymentAPI } from '../../src/services/api';

const BILL_TYPES = [
  { icon: 'phone-portrait', label: 'Airtime', code: 'AIRTIME_001' },
  { icon: 'flash', label: 'Electricity', code: 'ELECTRICITY_001' },
  { icon: 'tv', label: 'Cable TV', code: 'CABLE_001' },
  { icon: 'water', label: 'Water', code: 'WATER_001' },
  { icon: 'school', label: 'School Fees', code: 'EDUCATION_001' },
  { icon: 'wifi', label: 'Internet', code: 'INTERNET_001' },
];

export default function BillsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayBill = async () => {
    if (!selectedBill || !customerId || !amount) return;

    setLoading(true);
    try {
      await paymentAPI.payBill({
        paymentCode: selectedBill,
        customerId,
        customerMobile: phone || '08000000000',
        amount: Number(amount),
      });
      if (Platform.OS === 'web') {
        alert('Bill payment successful!');
        router.back();
      } else {
        Alert.alert('Success', 'Bill payment successful!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Payment failed';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    }
    setLoading(false);
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}
    >
      {/* Interswitch banner */}
      <Card style={[{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg, padding: Spacing.md }, glassCard]}>
        <Ionicons name="receipt" size={18} color={colors.interswitch} />
        <Text style={{ fontSize: FontSize.sm, color: colors.interswitch, fontWeight: '600' }}>
          Pay bills via Interswitch Quickteller
        </Text>
      </Card>

      {/* Bill Type Selection */}
      <Text style={{ fontSize: FontSize.sm, fontWeight: '600', color: colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md }}>
        Select Bill Type
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        {BILL_TYPES.map((bill) => {
          const isSelected = selectedBill === bill.code;
          return (
            <Card
              key={bill.code}
              onPress={() => setSelectedBill(bill.code)}
              style={[
                {
                  width: '30%',
                  alignItems: 'center',
                  padding: Spacing.md,
                  gap: Spacing.sm,
                },
                glassCard,
                isSelected && {
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
            >
              <Ionicons
                name={bill.icon as any}
                size={28}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
              <Text
                style={{
                  fontSize: FontSize.xs,
                  color: isSelected ? colors.primary : colors.textSecondary,
                  textAlign: 'center',
                  fontWeight: isSelected ? '700' : '400',
                }}
              >
                {bill.label}
              </Text>
            </Card>
          );
        })}
      </View>

      {selectedBill && (
        <>
          <Text style={{ fontSize: FontSize.sm, fontWeight: '600', color: colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md }}>
            Customer ID / Meter Number
          </Text>
          <TextInput
            style={glassInput}
            placeholder="e.g. 1234567890"
            placeholderTextColor={colors.textLight}
            value={customerId}
            onChangeText={setCustomerId}
          />

          <Text style={{ fontSize: FontSize.sm, fontWeight: '600', color: colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md }}>
            Phone Number
          </Text>
          <TextInput
            style={glassInput}
            placeholder="e.g. 08012345678"
            placeholderTextColor={colors.textLight}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={{ fontSize: FontSize.sm, fontWeight: '600', color: colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md }}>
            Amount (₦)
          </Text>
          <TextInput
            style={glassInput}
            placeholder="e.g. 5000"
            placeholderTextColor={colors.textLight}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <Button
            title="Pay Bill"
            onPress={handlePayBill}
            loading={loading}
            disabled={!customerId || !amount}
            size="lg"
            style={{ marginTop: Spacing.lg }}
          />
        </>
      )}
    </ScrollView>
  );
}
