import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
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
      Alert.alert('Success', 'Bill payment successful!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Payment failed');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.iswCard}>
        <Ionicons name="receipt" size={18} color={Colors.interswitch} />
        <Text style={styles.iswText}>Pay bills via Interswitch Quickteller</Text>
      </Card>

      {/* Bill Type Selection */}
      <Text style={styles.label}>Select Bill Type</Text>
      <View style={styles.grid}>
        {BILL_TYPES.map((bill) => (
          <Card
            key={bill.code}
            onPress={() => setSelectedBill(bill.code)}
            style={[styles.billCard, selectedBill === bill.code ? styles.billSelected : undefined]}
          >
            <Ionicons
              name={bill.icon as any}
              size={28}
              color={selectedBill === bill.code ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.billLabel, selectedBill === bill.code && styles.billLabelSelected]}>
              {bill.label}
            </Text>
          </Card>
        ))}
      </View>

      {selectedBill && (
        <>
          <Text style={styles.label}>Customer ID / Meter Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1234567890"
            placeholderTextColor={Colors.textLight}
            value={customerId}
            onChangeText={setCustomerId}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 08012345678"
            placeholderTextColor={Colors.textLight}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Amount (₦)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5000"
            placeholderTextColor={Colors.textLight}
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
            style={styles.payBtn}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  billCard: { width: '30%', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  billSelected: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: Colors.primaryLight + '08' },
  billLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  billLabelSelected: { color: Colors.primary, fontWeight: '700' },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text,
  },
  payBtn: { marginTop: Spacing.lg },
});
