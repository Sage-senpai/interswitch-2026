import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../src/components/Button';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { wagAPI } from '../../src/services/api';

export default function CreateWAGScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !state) return;

    setLoading(true);
    try {
      const res = await wagAPI.create({ name, description, state });
      const msg = res.data.data.message;
      if (Platform.OS === 'web') {
        alert(msg);
        router.back();
      } else {
        Alert.alert('WAG Created!', msg, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to create WAG';
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
    borderRadius: 20,
    padding: Spacing.lg,
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
      <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: colors.text, marginBottom: 4 }}>
        Create a Women Affinity Group
      </Text>
      <Text style={{ fontSize: FontSize.md, color: colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg }}>
        Start a community savings group. Members contribute regularly, and the pool grows together.
      </Text>

      {/* Form card */}
      <View style={glassCard}>
        <Text style={labelStyle}>Group Name</Text>
        <TextInput
          style={glassInput}
          placeholder="e.g. Ogun State Market Women"
          placeholderTextColor={colors.textLight}
          value={name}
          onChangeText={setName}
        />

        <Text style={labelStyle}>Description (optional)</Text>
        <TextInput
          style={[glassInput, { height: 80, textAlignVertical: 'top' }]}
          placeholder="What is this group about?"
          placeholderTextColor={colors.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Text style={labelStyle}>State</Text>
        <TextInput
          style={glassInput}
          placeholder="e.g. Lagos"
          placeholderTextColor={colors.textLight}
          value={state}
          onChangeText={setState}
        />
      </View>

      <Button
        title="Create WAG"
        onPress={handleCreate}
        loading={loading}
        disabled={!name || !state}
        size="lg"
        style={{ marginTop: Spacing.xl }}
      />
    </ScrollView>
  );
}
