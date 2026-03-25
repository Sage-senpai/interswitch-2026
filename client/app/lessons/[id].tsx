import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, useWindowDimensions, Platform, Animated as RNAnimated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { useTheme } from '../../src/hooks/useTheme';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { lessonAPI } from '../../src/services/api';

// ─── FadeIn helper ────────────────────────────────────────────────────────────

function FadeIn({ delay = 0, children, style }: { delay?: number; children: React.ReactNode; style?: any }) {
  const opacity = useRef(new RNAnimated.Value(0)).current;
  const translateY = useRef(new RNAnimated.Value(20)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      RNAnimated.parallel([
        RNAnimated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        RNAnimated.spring(translateY, { toValue: 0, damping: 15, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);
  return (
    <RNAnimated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </RNAnimated.View>
  );
}

// ─── Slide-in helper (replaces FadeInRight) ───────────────────────────────────

function SlideInRight({ animKey, children }: { animKey: string | number; children: React.ReactNode }) {
  const opacity = useRef(new RNAnimated.Value(0)).current;
  const translateX = useRef(new RNAnimated.Value(30)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateX.setValue(30);
    RNAnimated.parallel([
      RNAnimated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      RNAnimated.timing(translateX, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [animKey]);

  return (
    <RNAnimated.View style={{ opacity, transform: [{ translateX }] }}>
      {children}
    </RNAnimated.View>
  );
}

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [lesson, setLesson] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Celebration animation values
  const celebrationOpacity = useRef(new RNAnimated.Value(0)).current;
  const celebrationScale = useRef(new RNAnimated.Value(0.7)).current;

  const speakText = async (text: string) => {
    try {
      if (isSpeaking) {
        await Speech.stop();
        setIsSpeaking(false);
        return;
      }
      setIsSpeaking(true);
      Speech.speak(text, {
        language: 'en-NG',
        rate: 0.85,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
    } catch {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    lessonAPI.getOne(id!)
      .then((res) => setLesson(res.data.data))
      .catch(() => {});
    return () => { Speech.stop(); };
  }, [id]);

  // Animate celebration card in when showCelebration becomes true
  useEffect(() => {
    if (showCelebration) {
      celebrationOpacity.setValue(0);
      celebrationScale.setValue(0.7);
      RNAnimated.parallel([
        RNAnimated.timing(celebrationOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        RNAnimated.spring(celebrationScale, { toValue: 1, damping: 12, useNativeDriver: true }),
      ]).start();
    }
  }, [showCelebration]);

  if (!lesson) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading lesson...</Text>
      </View>
    );
  }

  // Handle both formats: flat array or { sections: [...] }
  const rawContent = lesson.content;
  const sections: any[] = Array.isArray(rawContent)
    ? rawContent
    : rawContent?.sections || [];

  const section = sections[currentSection];
  const isLast = currentSection === sections.length - 1;
  const isQuiz = section?.type === 'quiz';
  const totalSections = sections.length;
  const progress = totalSections > 0 ? ((currentSection + 1) / totalSections) * 100 : 0;

  const handleAnswerQuiz = (index: number) => {
    if (quizAnswered) return;
    setSelectedAnswer(index);
    setQuizAnswered(true);
    if (index === section.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLast) {
      handleComplete();
      return;
    }
    setCurrentSection((prev) => prev + 1);
    setSelectedAnswer(null);
    setQuizAnswered(false);
  };

  const handlePrev = () => {
    setCurrentSection((prev) => prev - 1);
    setSelectedAnswer(null);
    setQuizAnswered(false);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const totalQuizzes = sections.filter((s: any) => s.type === 'quiz').length;
      const finalScore = totalQuizzes > 0 ? Math.round((score / totalQuizzes) * 100) : 100;
      const res = await lessonAPI.complete(id!, finalScore);
      const data = res.data.data;

      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        if (Platform.OS === 'web') {
          alert(`Lesson Complete! Score: ${finalScore}%${data?.badge ? ` - Badge: ${data.badge}` : ''}`);
          router.back();
        } else {
          Alert.alert(
            'Lesson Complete!',
            `Score: ${finalScore}%\n${data?.badge ? `Badge earned: ${data.badge}` : ''}\n${data?.rewardMessage || ''}`,
            [{ text: 'Continue', onPress: () => router.back() }],
          );
        }
      }, 2000);
    } catch {
      if (Platform.OS === 'web') {
        alert('Great job completing this lesson!');
        router.back();
      } else {
        Alert.alert('Done!', 'Great job completing this lesson!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    }
    setCompleting(false);
  };

  // Get text content from either .body or .content field
  const getSectionText = (s: any) => s?.body || s?.content || '';

  const renderSection = () => {
    if (!section) return <Text style={{ color: colors.textSecondary }}>No content available</Text>;

    switch (section.type) {
      case 'text':
        return (
          <SlideInRight animKey={`s-${currentSection}`}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Text style={[styles.sectionText, { color: colors.text, flex: 1 }]}>
                {getSectionText(section)}
              </Text>
              <TouchableOpacity
                onPress={() => speakText(getSectionText(section))}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: colors.primary + '15',
                  alignItems: 'center', justifyContent: 'center', marginTop: 2,
                }}
                accessibilityLabel="Read aloud"
                accessibilityRole="button"
              >
                <Ionicons name={isSpeaking ? 'stop' : 'volume-high'} size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </SlideInRight>
        );

      case 'tip':
        return (
          <SlideInRight animKey={`s-${currentSection}`}>
            <View style={[styles.specialCard, { backgroundColor: colors.accent + '12', borderColor: colors.accent + '30' }]}>
              <View style={styles.specialHeader}>
                <Ionicons name="bulb" size={22} color={colors.accent} />
                <Text style={[styles.specialLabel, { color: colors.accent }]}>Tip</Text>
              </View>
              <Text style={[styles.specialText, { color: colors.text }]}>{getSectionText(section)}</Text>
            </View>
          </SlideInRight>
        );

      case 'quiz':
        return (
          <SlideInRight animKey={`s-${currentSection}`}>
            <View style={[styles.quizBadge, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="help-circle" size={18} color={colors.primary} />
              <Text style={[styles.quizBadgeText, { color: colors.primary }]}>Quiz Time</Text>
            </View>
            <Text style={[styles.quizQuestion, { color: colors.text }]}>{section.question}</Text>
            <View style={styles.quizOptions}>
              {section.options?.map((option: string, index: number) => {
                const isCorrect = quizAnswered && index === section.answer;
                const isWrong = quizAnswered && index === selectedAnswer && index !== section.answer;
                const isSelected = index === selectedAnswer;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.quizOption,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isCorrect ? colors.success : isWrong ? colors.danger : isSelected ? colors.primary : colors.border,
                        ...(isCorrect && { backgroundColor: colors.success + '12' }),
                        ...(isWrong && { backgroundColor: colors.danger + '12' }),
                      },
                    ]}
                    onPress={() => handleAnswerQuiz(index)}
                    disabled={quizAnswered}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.optionLetter,
                      {
                        backgroundColor: isCorrect ? colors.success : isWrong ? colors.danger : isSelected ? colors.primary : colors.border,
                      },
                    ]}>
                      <Text style={styles.optionLetterText}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={[styles.quizOptionText, { color: colors.text }]}>{option}</Text>
                    {isCorrect && <Ionicons name="checkmark-circle" size={22} color={colors.success} />}
                    {isWrong && <Ionicons name="close-circle" size={22} color={colors.danger} />}
                  </TouchableOpacity>
                );
              })}
            </View>
            {quizAnswered && (
              <SlideInRight animKey={`feedback-${currentSection}`}>
                <View style={[
                  styles.quizFeedback,
                  { backgroundColor: selectedAnswer === section.answer ? colors.success + '12' : colors.danger + '12' },
                ]}>
                  <Ionicons
                    name={selectedAnswer === section.answer ? 'checkmark-circle' : 'information-circle'}
                    size={20}
                    color={selectedAnswer === section.answer ? colors.success : colors.danger}
                  />
                  <Text style={[styles.quizFeedbackText, { color: colors.text }]}>
                    {selectedAnswer === section.answer
                      ? 'Correct! Well done!'
                      : `The correct answer is ${String.fromCharCode(65 + section.answer)}. Keep learning!`}
                  </Text>
                </View>
              </SlideInRight>
            )}
          </SlideInRight>
        );

      default:
        return (
          <Text style={[styles.sectionText, { color: colors.text }]}>
            {getSectionText(section)}
          </Text>
        );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}
    >
      {/* Header */}
      <View style={styles.lessonHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.categoryText, { color: colors.primary }]}>
            {lesson.category?.replace('_', ' ')}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{lesson.duration} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>Difficulty {lesson.difficulty}/5</Text>
          </View>
          {lesson.reward > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="gift-outline" size={14} color={colors.accent} />
              <Text style={[styles.metaText, { color: colors.accent }]}>+N{lesson.reward}</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{lesson.title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{lesson.description}</Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
          {currentSection + 1} of {totalSections}
        </Text>
      </View>

      {/* Content Section */}
      <View style={styles.sectionContainer}>
        {renderSection()}
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { borderColor: colors.border, opacity: currentSection > 0 ? 1 : 0.4 },
          ]}
          onPress={handlePrev}
          disabled={currentSection === 0}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
          <Text style={[styles.navButtonText, { color: colors.text }]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            {
              backgroundColor: colors.primary,
              opacity: isQuiz && !quizAnswered ? 0.5 : 1,
            },
          ]}
          onPress={handleNext}
          disabled={(isQuiz && !quizAnswered) || completing}
        >
          <Text style={[styles.navButtonText, { color: '#fff' }]}>
            {completing ? 'Completing...' : isLast ? 'Complete' : 'Next'}
          </Text>
          <Ionicons name={isLast ? 'checkmark' : 'chevron-forward'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Celebration Overlay ── */}
      {showCelebration && (
        <RNAnimated.View
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center', justifyContent: 'center', zIndex: 999,
            opacity: celebrationOpacity,
          }}
        >
          <RNAnimated.View style={{
            backgroundColor: colors.surface, borderRadius: 24, padding: 40,
            alignItems: 'center', maxWidth: 300,
            transform: [{ scale: celebrationScale }],
            ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } as any : {}),
          }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' }}>
              Lesson Complete!
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
              Amazing work! You're one step closer to financial freedom.
            </Text>
          </RNAnimated.View>
        </RNAnimated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  contentDesktop: { maxWidth: 720, alignSelf: 'center', width: '100%', paddingHorizontal: Spacing.xl },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lessonHeader: { marginBottom: Spacing.md },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  categoryText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  metaRow: { flexDirection: 'row', gap: Spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.xs },
  title: { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: 6, lineHeight: 36 },
  description: { fontSize: FontSize.md, lineHeight: 24, marginBottom: Spacing.lg },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: FontSize.xs, minWidth: 50, textAlign: 'right' },
  sectionContainer: { marginBottom: Spacing.xl, minHeight: 200 },
  sectionText: { fontSize: 16, lineHeight: 28 },
  specialCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  specialHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  specialLabel: { fontSize: FontSize.sm, fontWeight: '700' },
  specialText: { fontSize: FontSize.md, lineHeight: 26 },
  quizBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  quizBadgeText: { fontSize: FontSize.sm, fontWeight: '700' },
  quizQuestion: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.lg, lineHeight: 28 },
  quizOptions: { gap: Spacing.sm },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
  quizOptionText: { fontSize: FontSize.md, flex: 1 },
  quizFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  quizFeedbackText: { fontSize: FontSize.sm, flex: 1 },
  navRow: { flexDirection: 'row', gap: Spacing.sm },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  navButtonPrimary: { borderWidth: 0 },
  navButtonText: { fontSize: FontSize.md, fontWeight: '600' },
});
