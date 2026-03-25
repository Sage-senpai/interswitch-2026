import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { wagAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';
import { timeAgo } from '../../src/utils/format';

export default function WAGDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
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
      const msg = res.data.data.message;
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Contributed!', msg);
      }
      setAmount('');
      fetchWAG();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Contribution failed';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    }
    setContributing(false);
  };

  // Shared glass styles (computed once per render with current theme)
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
    flex: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: FontSize.md,
    color: colors.text,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' } as any)
      : {}),
  };

  if (!wag) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSecondary }}>Loading group...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}
    >
      <Text style={{ fontSize: FontSize.xxl, fontWeight: '800', color: colors.text }}>
        {wag.name}
      </Text>
      {wag.description && (
        <Text style={{ fontSize: FontSize.md, color: colors.textSecondary, marginTop: 4 }}>
          {wag.description}
        </Text>
      )}
      <Text style={{ fontSize: FontSize.sm, color: colors.textLight, marginTop: 4, marginBottom: Spacing.md }}>
        {wag.state} · {wag.members.length} members · {wag.myRole}
      </Text>

      {/* Pool Balance — accent gradient card */}
      <Card
        variant="accent"
        style={[
          {
            padding: Spacing.lg,
            marginBottom: Spacing.md,
            borderRadius: 20,
            ...(Platform.OS === 'web'
              ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any)
              : {}),
          },
        ]}
      >
        <Text style={{ fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' }}>
          Group Pool Balance
        </Text>
        <Text style={{ fontSize: 32, fontWeight: '800', color: colors.textInverse, marginTop: 4 }}>
          {formatNaira(Number(wag.poolBalance))}
        </Text>
        {wag.contractAddress && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm }}>
            <Ionicons name="shield-checkmark" size={14} color={colors.accentLight} />
            <Text style={{ fontSize: FontSize.xs, color: colors.accentLight }}>
              Blockchain verified
            </Text>
          </View>
        )}
      </Card>

      {/* Contribute */}
      <Card
        title="Contribute to Pool"
        style={[{ marginBottom: Spacing.lg, padding: Spacing.md }, glassCard]}
      >
        <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
          <TextInput
            style={glassInput}
            placeholder="Amount (min ₦50)"
            placeholderTextColor={colors.textLight}
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
      <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md }}>
        Members ({wag.members.length})
      </Text>
      {wag.members.map((member: any) => (
        <View
          key={member.id}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.sm,
              paddingVertical: Spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            },
          ]}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            }}
          >
            <Ionicons name="person" size={18} color={colors.primary} />
          </View>
          <Text style={{ flex: 1, fontSize: FontSize.md, color: colors.text }}>
            {member.name}
          </Text>
          {member.role === 'ADMIN' && (
            <View
              style={{
                backgroundColor: colors.accent + '20',
                paddingHorizontal: Spacing.sm,
                paddingVertical: 2,
                borderRadius: BorderRadius.full,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              }}
            >
              <Text style={{ fontSize: 10, color: colors.accent, fontWeight: '700' }}>Admin</Text>
            </View>
          )}
        </View>
      ))}

      {/* Recent Contributions */}
      {wag.recentContributions.length > 0 && (
        <>
          <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md }}>
            Recent Contributions
          </Text>
          {wag.recentContributions.map((c: any) => (
            <View
              key={c.id}
              style={[
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: Spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                },
              ]}
            >
              <Text style={{ fontSize: FontSize.md, fontWeight: '600', color: colors.text }}>
                {formatNaira(Number(c.amount))}
              </Text>
              <Text style={{ fontSize: FontSize.sm, color: colors.textLight }}>
                {timeAgo(c.createdAt)}
              </Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
