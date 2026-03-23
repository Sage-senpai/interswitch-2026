import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../src/components/Card';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { lessonAPI } from '../../src/services/api';

const CATEGORIES = [
  { key: '', label: 'All', icon: 'grid' },
  { key: 'BUDGETING', label: 'Budget', icon: 'calculator' },
  { key: 'SAVING', label: 'Saving', icon: 'wallet' },
  { key: 'INVESTING', label: 'Invest', icon: 'trending-up' },
  { key: 'ENTREPRENEURSHIP', label: 'Business', icon: 'briefcase' },
  { key: 'DIGITAL_SAFETY', label: 'Safety', icon: 'shield-checkmark' },
  { key: 'DEBT_MANAGEMENT', label: 'Debt', icon: 'card' },
];

const DIFFICULTY_LABELS = ['', 'Beginner', 'Easy', 'Medium', 'Advanced', 'Expert'];
const CATEGORY_COLORS: Record<string, string> = {
  BUDGETING: '#3B82F6',
  SAVING: '#10B981',
  INVESTING: '#F59E0B',
  ENTREPRENEURSHIP: '#8B5CF6',
  DIGITAL_SAFETY: '#EF4444',
  DEBT_MANAGEMENT: '#EC4899',
};

export default function LearnScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isDesktop, contentMaxWidth, gridColumns } = useResponsive();
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    fetchLessons();
  }, [activeCategory]);

  const fetchLessons = async () => {
    try {
      const res = await lessonAPI.getAll(activeCategory || undefined);
      setLessons(res.data.data || []);
    } catch {
      setLessons([
        { id: '1', title: 'What is a Budget?', category: 'BUDGETING', difficulty: 1, duration: 5, completed: false, badge: 'Budget Starter', reward: 50 },
        { id: '2', title: 'Why Save Money?', category: 'SAVING', difficulty: 1, duration: 5, completed: false, badge: 'Savings Champion', reward: 100 },
        { id: '3', title: 'Protecting Your Money Online', category: 'DIGITAL_SAFETY', difficulty: 1, duration: 6, completed: false, badge: 'Safety Shield', reward: 75 },
      ]);
    }
  };

  const completedCount = lessons.filter((l) => l.completed).length;
  const s = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[
        s.content,
        isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
      ]}
    >
      {/* Progress Banner */}
      <Card variant="accent" style={s.progressCard}>
        <Text style={s.progressTitle}>Your Learning Journey</Text>
        <Text style={s.progressCount}>
          {completedCount} / {lessons.length} lessons completed
        </Text>
        <View style={s.progressBar}>
          <View
            style={[
              s.progressFill,
              { width: `${lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0}%` },
            ]}
          />
        </View>
      </Card>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.categories}>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                s.categoryChip,
                active && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={active ? colors.textInverse : colors.textSecondary}
              />
              <Text style={[s.categoryText, active && { color: colors.textInverse }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lessons Grid */}
      <View style={[s.lessonsGrid, isDesktop && { flexDirection: 'row', flexWrap: 'wrap' }]}>
        {lessons.map((lesson) => (
          <Card
            key={lesson.id}
            onPress={() => router.push(`/lessons/${lesson.id}`)}
            style={[
              s.lessonCard,
              isDesktop ? { width: `${100 / gridColumns - 2}%` } : undefined,
            ]}
          >
            <View style={[s.categoryBadge, { backgroundColor: CATEGORY_COLORS[lesson.category] || colors.primary }]}>
              <Text style={s.categoryBadgeText}>{lesson.category.replace('_', ' ')}</Text>
            </View>

            <Text style={s.lessonTitle}>{lesson.title}</Text>

            <View style={s.lessonMeta}>
              <View style={s.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textLight} />
                <Text style={s.metaText}>{lesson.duration} min</Text>
              </View>
              <View style={s.metaItem}>
                <Ionicons name="bar-chart-outline" size={14} color={colors.textLight} />
                <Text style={s.metaText}>{DIFFICULTY_LABELS[lesson.difficulty]}</Text>
              </View>
            </View>

            {lesson.badge && (
              <View style={s.badgeRow}>
                <Text style={s.badgeIcon}>🏅</Text>
                <Text style={s.badgeText}>{lesson.badge}</Text>
              </View>
            )}

            {lesson.completed && (
              <View style={s.completedBadge}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={s.completedText}>Completed</Text>
              </View>
            )}

            {lesson.reward > 0 && !lesson.completed && (
              <Text style={s.rewardText}>Earn ₦{lesson.reward} on completion</Text>
            )}
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

function createStyles(colors: any, isDesktop: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: isDesktop ? Spacing.xl : Spacing.md, paddingBottom: Spacing.xxl },
    progressCard: { marginBottom: Spacing.md, padding: Spacing.lg },
    progressTitle: { fontSize: FontSize.md, color: colors.walletTextMuted, marginBottom: 4 },
    progressCount: { fontSize: FontSize.xl, fontWeight: '800', color: colors.walletText, marginBottom: Spacing.sm },
    progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: BorderRadius.full, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: BorderRadius.full },
    categories: { marginBottom: Spacing.md },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: Spacing.sm,
      gap: 6,
    },
    categoryText: { fontSize: FontSize.sm, color: colors.textSecondary, fontWeight: '500' },
    lessonsGrid: { gap: Spacing.sm },
    lessonCard: { padding: Spacing.md },
    categoryBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.sm,
      marginBottom: Spacing.sm,
    },
    categoryBadgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '700', textTransform: 'uppercase' },
    lessonTitle: { fontSize: FontSize.md, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm },
    lessonMeta: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: FontSize.xs, color: colors.textLight },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    badgeIcon: { fontSize: 14 },
    badgeText: { fontSize: FontSize.xs, color: colors.accent, fontWeight: '600' },
    completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    completedText: { fontSize: FontSize.sm, color: colors.success, fontWeight: '600' },
    rewardText: { fontSize: FontSize.xs, color: colors.accent, fontWeight: '600', marginTop: 4 },
  });
}
