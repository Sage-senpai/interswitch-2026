import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../src/components/Button';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
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
      Alert.alert('Goal Created!', res.data.data.message, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Failed to create goal');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>What are you saving for?</Text>

      <Text style={styles.label}>Goal Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Amina's school fees"
        placeholderTextColor={Colors.textLight}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.catCard, category === cat.key && styles.catSelected]}
            onPress={() => setCategory(cat.key)}
          >
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[styles.catLabel, category === cat.key && styles.catLabelSelected]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Target Amount (₦)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 50000"
        placeholderTextColor={Colors.textLight}
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
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  heading: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text,
  },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catCard: {
    width: '30%', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border, gap: 4,
  },
  catSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight + '08' },
  catIcon: { fontSize: 28 },
  catLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  catLabelSelected: { color: Colors.primary, fontWeight: '700' },
  createBtn: { marginTop: Spacing.xl },
});
