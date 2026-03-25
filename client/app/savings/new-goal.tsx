import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../src/components/Button';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { savingsAPI } from '../../src/services/api';

const CATEGORIES = [
  { key: 'EDUCATION', icon: '📚', label: 'Education' },
  { key: 'BUSINESS', icon: '💼', label: 'Business' },
  { key: 'HEALTH', icon: '🏥', label: 'Health' },
  { key: 'EMERGENCY', icon: '🆘', label: 'Emergency' },
  { key: 'FAMILY', icon: '👨‍👩‍👧‍👦', label: 'Family' },
  { key: 'CUSTOM', icon: '🎯', label: 'Custom' },
];

export default function NewGoalScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !category || !target) return;

    setLoading(true);
    try {
      const res = await savingsAPI.createGoal({
        name,
        category,
        target: Number(target),
      });
      if (Platform.OS === 'web') {
        alert(res.data.data.message);
        router.back();
      } else {
        Alert.alert('Goal Created!', res.data.data.message, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      if (Platform.OS === 'web') {
        alert(err.response?.data?.error?.message || 'Failed to create goal');
      } else {
        Alert.alert('Error', err.response?.data?.error?.message || 'Failed to create goal');
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
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: colors.text,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any)
      : {}),
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}
    >
      <Text style={[styles.heading, { color: colors.text }]}>What are you saving for?</Text>

      <Text style={[styles.label, { color: colors.text }]}>Goal Name</Text>
      <TextInput
        style={glassInput}
        placeholder="e.g. Amina's school fees"
        placeholderTextColor={colors.textLight}
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.label, { color: colors.text }]}>Category</Text>
      <View style={styles.categories}>
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.catCard,
                glassCard,
                isSelected && {
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.catLabel,
                  { color: colors.textSecondary },
                  isSelected && { color: colors.primary, fontWeight: '700' },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Target Amount (₦)</Text>
      <TextInput
        style={glassInput}
        placeholder="e.g. 50000"
        placeholderTextColor={colors.textLight}
        value={target}
        onChangeText={setTarget}
        keyboardType="numeric"
      />

      <Button
        title="Create Savings Goal"
        onPress={handleCreate}
        loading={loading}
        disabled={!name || !category || !target || Number(target) < 100}
        size="lg"
        style={styles.createBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: FontSize.xl, fontWeight: '800', marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm, marginTop: Spacing.md },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catCard: {
    width: '30%',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 4,
  },
  catIcon: { fontSize: 28 },
  catLabel: { fontSize: FontSize.xs, fontWeight: '500' },
  createBtn: { marginTop: Spacing.xl },
});
