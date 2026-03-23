import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../src/components/Button';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { wagAPI } from '../../src/services/api';

export default function CreateWAGScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !state) return;

    setLoading(true);
    try {
      const res = await wagAPI.create({ name, description, state });
      Alert.alert('WAG Created!', res.data.data.message, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Failed to create WAG');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Create a Women Affinity Group</Text>
      <Text style={styles.subheading}>
        Start a community savings group. Members contribute regularly, and the pool grows together.
      </Text>

      <Text style={styles.label}>Group Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Ogun State Market Women"
        placeholderTextColor={Colors.textLight}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="What is this group about?"
        placeholderTextColor={Colors.textLight}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>State</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Lagos"
        placeholderTextColor={Colors.textLight}
        value={state}
        onChangeText={setState}
      />

      <Button
        title="Create WAG"
        onPress={handleCreate}
        loading={loading}
        disabled={!name || !state}
        size="lg"
        style={styles.createBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  heading: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subheading: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  createBtn: { marginTop: Spacing.xl },
});
