import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { lessonAPI } from '../../src/services/api';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    lessonAPI.getOne(id!)
      .then((res) => setLesson(res.data.data))
      .catch(() => {});
  }, [id]);

  if (!lesson) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  const sections = lesson.content?.sections || [];
  const section = sections[currentSection];
  const isLast = currentSection === sections.length - 1;
  const isQuiz = section?.type === 'quiz';

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

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const totalQuizzes = sections.filter((s: any) => s.type === 'quiz').length;
      const finalScore = totalQuizzes > 0 ? Math.round((score / totalQuizzes) * 100) : 100;
      const res = await lessonAPI.complete(id!, finalScore);
      const data = res.data.data;

      Alert.alert(
        'Lesson Complete!',
        `Score: ${finalScore}%\n${data.badge ? `Badge earned: ${data.badge}` : ''}\n${data.rewardMessage || ''}`,
        [{ text: 'Continue', onPress: () => router.back() }],
      );
    } catch {
      Alert.alert('Done!', 'Great job completing this lesson!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
    setCompleting(false);
  };

  const renderSection = () => {
    if (!section) return null;

    switch (section.type) {
      case 'text':
        return <Text style={styles.sectionText}>{section.content}</Text>;

      case 'tip':
        return (
          <Card style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={20} color={Colors.accent} />
              <Text style={styles.tipLabel}>Tip</Text>
            </View>
            <Text style={styles.tipText}>{section.content}</Text>
          </Card>
        );

      case 'story':
        return (
          <Card style={styles.storyCard}>
            <View style={styles.tipHeader}>
              <Text style={{ fontSize: 20 }}>📖</Text>
              <Text style={styles.storyLabel}>Real Story</Text>
            </View>
            <Text style={styles.tipText}>{section.content}</Text>
          </Card>
        );

      case 'warning':
        return (
          <Card style={styles.warningCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="warning" size={20} color={Colors.danger} />
              <Text style={styles.warningLabel}>Important</Text>
            </View>
            <Text style={styles.tipText}>{section.content}</Text>
          </Card>
        );

      case 'example':
        return (
          <Card style={styles.exampleCard}>
            <Text style={styles.exampleLabel}>Example</Text>
            <Text style={styles.tipText}>{section.content}</Text>
          </Card>
        );

      case 'quiz':
        return (
          <View>
            <Text style={styles.quizQuestion}>{section.question}</Text>
            <View style={styles.quizOptions}>
              {section.options.map((option: string, index: number) => {
                let optionStyle: object = styles.quizOption;
                if (quizAnswered) {
                  if (index === section.answer) optionStyle = styles.quizCorrect;
                  else if (index === selectedAnswer) optionStyle = styles.quizWrong;
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.quizOption, quizAnswered && index === section.answer && styles.quizCorrect, quizAnswered && index === selectedAnswer && index !== section.answer && styles.quizWrong]}
                    onPress={() => handleAnswerQuiz(index)}
                    disabled={quizAnswered}
                  >
                    <Text style={styles.quizOptionText}>{option}</Text>
                    {quizAnswered && index === section.answer && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      default:
        return <Text style={styles.sectionText}>{section.content}</Text>;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.description}>{lesson.description}</Text>

      {/* Progress */}
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          Section {currentSection + 1} of {sections.length}
        </Text>
        <View style={styles.progressDots}>
          {sections.map((_: any, i: number) => (
            <View
              key={i}
              style={[styles.dot, i <= currentSection && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <View style={styles.sectionContainer}>
        {renderSection()}
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        {currentSection > 0 && (
          <Button
            title="Previous"
            onPress={() => {
              setCurrentSection((prev) => prev - 1);
              setSelectedAnswer(null);
              setQuizAnswered(false);
            }}
            variant="outline"
            style={{ flex: 1 }}
          />
        )}
        <Button
          title={isLast ? 'Complete Lesson' : 'Next'}
          onPress={handleNext}
          loading={completing}
          disabled={isQuiz && !quizAnswered}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textSecondary },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  description: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.md },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  progressText: { fontSize: FontSize.sm, color: Colors.textLight },
  progressDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary },
  sectionContainer: { marginBottom: Spacing.xl, minHeight: 200 },
  sectionText: { fontSize: FontSize.md, color: Colors.text, lineHeight: 26 },
  tipCard: { backgroundColor: Colors.accentLight + '15', borderColor: Colors.accent + '30' },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  tipLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.accent },
  tipText: { fontSize: FontSize.md, color: Colors.text, lineHeight: 24 },
  storyCard: { backgroundColor: Colors.primaryLight + '10', borderColor: Colors.primaryLight + '30' },
  storyLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  warningCard: { backgroundColor: Colors.dangerLight + '15', borderColor: Colors.danger + '30' },
  warningLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.danger },
  exampleCard: { backgroundColor: Colors.surfaceSecondary },
  exampleLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primaryDark, marginBottom: Spacing.sm },
  quizQuestion: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md, lineHeight: 28 },
  quizOptions: { gap: Spacing.sm },
  quizOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md,
  },
  quizCorrect: { borderColor: Colors.success, backgroundColor: Colors.successLight + '15' },
  quizWrong: { borderColor: Colors.danger, backgroundColor: Colors.dangerLight + '15' },
  quizOptionText: { fontSize: FontSize.md, color: Colors.text, flex: 1 },
  navRow: { flexDirection: 'row', gap: Spacing.sm },
});
