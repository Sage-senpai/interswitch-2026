import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { wagAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';
import { timeAgo } from '../../src/utils/format';

export default function WAGDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [wag, setWag] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [contributing, setContributing] = useState(false);

  const fetchWAG = async () => {
    try {
      const res = await wagAPI.getDetails(id!);
      setWag(res.data.data);
    } catch {}
  };

  useEffect(() => { fetchWAG(); }, [id]);

  const handleContribute = async () => {
    if (!amount || Number(amount) < 50) return;
    setContributing(true);
    try {
      const res = await wagAPI.contribute(id!, Number(amount));
      Alert.alert('Contributed!', res.data.data.message);
      setAmount('');
      fetchWAG();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Contribution failed');
    }
    setContributing(false);
  };

  if (!wag) {
    return (
      <View style={styles.loading}>
        <Text>Loading group...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{wag.name}</Text>
      {wag.description && <Text style={styles.description}>{wag.description}</Text>}
      <Text style={styles.meta}>{wag.state} · {wag.members.length} members · {wag.myRole}</Text>

      {/* Pool Balance */}
      <Card variant="accent" style={styles.poolCard}>
        <Text style={styles.poolLabel}>Group Pool Balance</Text>
        <Text style={styles.poolAmount}>{formatNaira(Number(wag.poolBalance))}</Text>
        {wag.contractAddress && (
          <View style={styles.verifiedRow}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.accentLight} />
            <Text style={styles.verifiedText}>Blockchain verified</Text>
          </View>
        )}
      </Card>

      {/* Contribute */}
      <Card title="Contribute to Pool" style={styles.contributeCard}>
        <View style={styles.contributeRow}>
          <TextInput
            style={styles.contributeInput}
            placeholder="Amount (min ₦50)"
            placeholderTextColor={Colors.textLight}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Button
            title="Contribute"
            onPress={handleContribute}
            loading={contributing}
            disabled={!amount || Number(amount) < 50}
            size="md"
          />
        </View>
      </Card>

      {/* Members */}
      <Text style={styles.sectionTitle}>Members ({wag.members.length})</Text>
      {wag.members.map((member: any) => (
        <View key={member.id} style={styles.memberRow}>
          <View style={styles.memberAvatar}>
            <Ionicons name="person" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.memberName}>{member.name}</Text>
          {member.role === 'ADMIN' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>
      ))}

      {/* Recent Contributions */}
      {wag.recentContributions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Contributions</Text>
          {wag.recentContributions.map((c: any) => (
            <View key={c.id} style={styles.contributionRow}>
              <Text style={styles.contributionAmount}>{formatNaira(Number(c.amount))}</Text>
              <Text style={styles.contributionDate}>{timeAgo(c.createdAt)}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  description: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4 },
  meta: { fontSize: FontSize.sm, color: Colors.textLight, marginTop: 4, marginBottom: Spacing.md },
  poolCard: { padding: Spacing.lg, marginBottom: Spacing.md },
  poolLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  poolAmount: { fontSize: 32, fontWeight: '800', color: Colors.textInverse, marginTop: 4 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  verifiedText: { fontSize: FontSize.xs, color: Colors.accentLight },
  contributeCard: { marginBottom: Spacing.lg },
  contributeRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  contributeInput: {
    flex: 1, backgroundColor: Colors.surfaceSecondary, borderRadius: BorderRadius.md,
    padding: Spacing.sm, fontSize: FontSize.md, color: Colors.text,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight + '15', alignItems: 'center', justifyContent: 'center' },
  memberName: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  adminBadge: { backgroundColor: Colors.accent + '20', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  adminText: { fontSize: 10, color: Colors.accent, fontWeight: '700' },
  contributionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  contributionAmount: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  contributionDate: { fontSize: FontSize.sm, color: Colors.textLight },
});
