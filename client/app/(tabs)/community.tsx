import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { wagAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

export default function CommunityScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isDesktop, contentMaxWidth } = useResponsive();
  const [wags, setWags] = useState<any[]>([]);
  const [joinId, setJoinId] = useState('');
  const [joining, setJoining] = useState(false);

  const fetchWAGs = async () => {
    try {
      const res = await wagAPI.getMyWAGs();
      setWags(res.data.data || []);
    } catch {
      setWags([]);
    }
  };

  useEffect(() => { fetchWAGs(); }, []);

  const handleJoin = async () => {
    if (!joinId.trim()) return;
    setJoining(true);
    try {
      await wagAPI.join(joinId.trim());
      setJoinId('');
      fetchWAGs();
      Alert.alert('Success', 'You have joined the WAG!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Could not join WAG');
    }
    setJoining(false);
  };

  const s = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[
        s.content,
        isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
      ]}
    >
      {/* Header Info */}
      <Card style={s.infoCard}>
        <Text style={s.infoTitle}>Women Affinity Groups</Text>
        <Text style={s.infoText}>
          WAGs are community savings groups where women support each other financially.
          Create or join a group, contribute weekly, and watch your collective savings grow.
        </Text>
      </Card>

      {/* Actions */}
      <View style={s.actions}>
        <Button
          title="Create a WAG"
          onPress={() => router.push('/wag/create')}
          icon={<Ionicons name="add-circle" size={20} color={colors.textInverse} />}
          style={{ flex: 1 }}
        />
      </View>

      {/* Join WAG */}
      <View style={s.joinRow}>
        <TextInput
          style={s.joinInput}
          placeholder="Enter WAG ID to join"
          placeholderTextColor={colors.textLight}
          value={joinId}
          onChangeText={setJoinId}
        />
        <Button title="Join" onPress={handleJoin} loading={joining} size="sm" />
      </View>

      {/* My WAGs */}
      {wags.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>👥</Text>
          <Text style={s.emptyTitle}>No groups yet</Text>
          <Text style={s.emptyText}>
            Create a WAG with your community or join one using a group ID
          </Text>
        </View>
      ) : (
        <View style={s.wagList}>
          <Text style={s.sectionTitle}>My Groups</Text>
          <View style={isDesktop ? s.wagGrid : undefined}>
            {wags.map((wag) => (
              <Card
                key={wag.id}
                onPress={() => router.push(`/wag/${wag.id}`)}
                style={[s.wagCard, isDesktop ? s.wagCardDesktop : undefined]}
              >
                <View style={s.wagHeader}>
                  <View style={s.wagAvatar}>
                    <Ionicons name="people" size={24} color={colors.primary} />
                  </View>
                  <View style={s.wagInfo}>
                    <Text style={s.wagName}>{wag.name}</Text>
                    <Text style={s.wagMeta}>
                      {wag.memberCount}/{wag.maxMembers} members  ·  {wag.state}
                    </Text>
                  </View>
                  <View style={s.roleBadge}>
                    <Text style={s.roleText}>{wag.myRole}</Text>
                  </View>
                </View>

                <View style={s.wagStats}>
                  <View style={s.wagStat}>
                    <Text style={s.wagStatValue}>{formatNaira(Number(wag.poolBalance))}</Text>
                    <Text style={s.wagStatLabel}>Pool Balance</Text>
                  </View>
                  <View style={s.wagStat}>
                    <Text style={s.wagStatValue}>{wag.totalContributions}</Text>
                    <Text style={s.wagStatLabel}>Contributions</Text>
                  </View>
                </View>

                {wag.contractAddress && (
                  <View style={s.verifiedRow}>
                    <Ionicons name="shield-checkmark" size={14} color={colors.success} />
                    <Text style={s.verifiedText}>Blockchain verified</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(colors: any, isDesktop: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: isDesktop ? Spacing.xl : Spacing.md, paddingBottom: Spacing.xxl },
    infoCard: {
      marginBottom: Spacing.md,
      backgroundColor: colors.accentLight,
      borderColor: colors.border,
    },
    infoTitle: { fontSize: FontSize.md, fontWeight: '700', color: colors.primary, marginBottom: 4 },
    infoText: { fontSize: FontSize.sm, color: colors.textSecondary, lineHeight: 20 },
    actions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
    joinRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, alignItems: 'center' },
    joinInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      fontSize: FontSize.sm,
      color: colors.text,
    },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm },
    emptyText: { fontSize: FontSize.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm },
    wagList: { gap: Spacing.sm },
    wagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    wagCard: { padding: Spacing.md },
    wagCardDesktop: { width: '48.5%' },
    wagHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
    wagAvatar: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.accentLight,
      alignItems: 'center', justifyContent: 'center',
    },
    wagInfo: { flex: 1 },
    wagName: { fontSize: FontSize.md, fontWeight: '700', color: colors.text },
    wagMeta: { fontSize: FontSize.xs, color: colors.textLight, marginTop: 2 },
    roleBadge: {
      backgroundColor: colors.accentLight,
      paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full,
    },
    roleText: { fontSize: 10, color: colors.primary, fontWeight: '700' },
    wagStats: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.sm },
    wagStat: {},
    wagStatValue: { fontSize: FontSize.md, fontWeight: '800', color: colors.text },
    wagStatLabel: { fontSize: FontSize.xs, color: colors.textLight },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    verifiedText: { fontSize: FontSize.xs, color: colors.success, fontWeight: '500' },
  });
}
