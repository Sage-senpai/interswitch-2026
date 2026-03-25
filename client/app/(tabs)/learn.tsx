import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  const { colors, isDark } = useTheme();
  const { isDesktop, contentMaxWidth, gridColumns } = useResponsive();
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => { fetchLessons(); }, [activeCategory]);

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
  const progressPct = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        { padding: isDesktop ? Spacing.xl : Spacing.md, paddingBottom: 80 },
        isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' },
      ]}
    >
      {/* ── Progress Hero ── */}
      <Animated.View style={{
        opacity: fadeAnim,
        transform: [{ translateY: headerSlide }],
        borderRadius: 20, overflow: 'hidden',
        marginBottom: Spacing.lg,
        backgroundColor: colors.walletBg,
        padding: Spacing.lg + 4,
      }}>
        <View style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500', marginBottom: 4 }}>Your Learning Journey</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 }}>
              {completedCount} / {lessons.length}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>lessons completed</Text>
          </View>
          {/* Circular progress */}
          <View style={{ width: 70, height: 70, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{
              width: 70, height: 70, borderRadius: 35,
              borderWidth: 6, borderColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <View style={{
                position: 'absolute', width: 70, height: 70, borderRadius: 35,
                borderWidth: 6, borderColor: '#FFD700',
                borderTopColor: progressPct > 25 ? '#FFD700' : 'transparent',
                borderRightColor: progressPct > 50 ? '#FFD700' : 'transparent',
                borderBottomColor: progressPct > 75 ? '#FFD700' : 'transparent',
                borderLeftColor: 'transparent',
                transform: [{ rotate: '-45deg' }],
              }} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>{Math.round(progressPct)}%</Text>
            </View>
          </View>
        </View>
        {/* Progress bar */}
        <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: Spacing.md, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${progressPct}%`, backgroundColor: '#FFD700', borderRadius: 3 }} />
        </View>
      </Animated.View>

      {/* ── Category Filter ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 16, paddingVertical: 10,
                borderRadius: 50, marginRight: 8,
                backgroundColor: active ? colors.primary : colors.surface,
                borderWidth: active ? 0 : 1, borderColor: colors.border,
                ...(active && Platform.OS === 'web' ? { boxShadow: `0 2px 12px ${colors.primary}40` } : {}),
              }}
            >
              <Ionicons name={cat.icon as any} size={15} color={active ? '#fff' : colors.textSecondary} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#fff' : colors.textSecondary }}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Lessons Grid ── */}
      <View style={[
        { gap: Spacing.sm },
        isDesktop && { flexDirection: 'row', flexWrap: 'wrap' },
      ]}>
        {lessons.map((lesson, idx) => {
          const catColor = CATEGORY_COLORS[lesson.category] || colors.primary;

          return (
            <TouchableOpacity
              key={lesson.id}
              onPress={() => router.push(`/lessons/${lesson.id}`)}
              activeOpacity={0.8}
              style={[
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
                  borderRadius: 16, padding: Spacing.md + 2,
                  borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                  borderLeftWidth: 4, borderLeftColor: catColor,
                  ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', transition: 'transform 0.2s, box-shadow 0.2s' } as any : {}),
                },
                isDesktop ? { width: `${100 / gridColumns - 2}%` as any } : undefined,
              ]}
            >
              {/* Top row: category + reward */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ backgroundColor: catColor + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 }}>
                  <Text style={{ fontSize: 10, color: catColor, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {lesson.category?.replace('_', ' ')}
                  </Text>
                </View>
                {lesson.reward > 0 && !lesson.completed && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="gift" size={12} color={colors.accent} />
                    <Text style={{ fontSize: 11, color: colors.accent, fontWeight: '700' }}>+N{lesson.reward}</Text>
                  </View>
                )}
              </View>

              {/* Title */}
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10, lineHeight: 22 }}>
                {lesson.title}
              </Text>

              {/* Meta */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="time-outline" size={13} color={colors.textLight} />
                  <Text style={{ fontSize: 12, color: colors.textLight }}>{lesson.duration} min</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="bar-chart-outline" size={13} color={colors.textLight} />
                  <Text style={{ fontSize: 12, color: colors.textLight }}>{DIFFICULTY_LABELS[lesson.difficulty]}</Text>
                </View>
              </View>

              {/* Badge */}
              {lesson.badge && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <Text style={{ fontSize: 13 }}>🏅</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500' }}>{lesson.badge}</Text>
                </View>
              )}

              {/* Completed */}
              {lesson.completed && (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6,
                  backgroundColor: colors.success + '12', paddingHorizontal: 10, paddingVertical: 5,
                  borderRadius: 50, alignSelf: 'flex-start',
                }}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={{ fontSize: 12, color: colors.success, fontWeight: '700' }}>Completed</Text>
                </View>
              )}

              {/* Start arrow */}
              {!lesson.completed && (
                <View style={{
                  position: 'absolute', bottom: 12, right: 12,
                  width: 30, height: 30, borderRadius: 15,
                  backgroundColor: catColor + '12',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name="play" size={14} color={catColor} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {lessons.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: colors.primary + '12',
            alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
          }}>
            <Ionicons name="book-outline" size={36} color={colors.primary} />
          </View>
          <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: colors.text, marginBottom: 6 }}>No lessons found</Text>
          <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, textAlign: 'center' }}>Try a different category filter</Text>
        </View>
      )}
    </ScrollView>
  );
}
