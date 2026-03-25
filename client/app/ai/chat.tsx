import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../src/components/Card';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { aiAPI } from '../../src/services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'How can I start saving?',
  'Help me make a budget',
  'Tips for starting a business',
  'How to avoid scams',
];

export default function AIChatScreen() {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        "Hello! I'm your Purse financial advisor. I'm here to help you with savings tips, budgeting advice, and financial questions. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(text.trim());
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.data.message,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Try again in a moment!",
        },
      ]);
    }

    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Glassmorphism helpers
  const glassBase = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any)
      : {}),
  };

  const glassInputStyle = {
    flex: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: colors.text,
    maxHeight: 100,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any)
      : {}),
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.bubble,
              { borderRadius: BorderRadius.lg },
              msg.role === 'user'
                ? {
                    backgroundColor: colors.primary,
                    alignSelf: 'flex-end',
                    borderBottomRightRadius: 4,
                  }
                : [
                    glassBase,
                    {
                      alignSelf: 'flex-start' as const,
                      borderBottomLeftRadius: 4,
                      borderRadius: BorderRadius.lg,
                    },
                  ],
            ]}
          >
            {msg.role === 'assistant' && (
              <View style={styles.aiHeader}>
                <Text style={[styles.aiLabel, { color: colors.primary }]}>🤖 Purse Advisor</Text>
              </View>
            )}
            <Text
              style={[
                styles.bubbleText,
                { color: colors.text },
                msg.role === 'user' && { color: colors.textInverse },
              ]}
            >
              {msg.content}
            </Text>
          </View>
        ))}

        {loading && (
          <View
            style={[
              styles.bubble,
              glassBase,
              { alignSelf: 'flex-start', borderRadius: BorderRadius.lg, borderBottomLeftRadius: 4 },
            ]}
          >
            <Text style={[styles.typing, { color: colors.textLight }]}>Thinking...</Text>
          </View>
        )}

        {/* Quick prompts (only show at start) */}
        {messages.length <= 1 && (
          <View style={styles.quickPrompts}>
            <Text style={[styles.quickLabel, { color: colors.textSecondary }]}>Quick questions:</Text>
            {QUICK_PROMPTS.map((prompt, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.quickBtn,
                  glassBase,
                  {
                    borderColor: colors.primary + '40',
                    borderRadius: BorderRadius.full,
                  },
                ]}
                onPress={() => sendMessage(prompt)}
              >
                <Text style={[styles.quickBtnText, { color: colors.primary }]}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          glassBase,
          {
            borderTopWidth: 1,
            borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            // override the all-side border from glassBase so it only shows on top
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: 0,
          },
        ]}
      >
        <TextInput
          style={glassInputStyle}
          placeholder="Ask about savings, budgeting, investing..."
          placeholderTextColor={colors.textLight}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: colors.primary },
            (!input.trim() || loading) && styles.sendDisabled,
          ]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={20} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messages: { flex: 1 },
  messagesContent: { padding: Spacing.md, paddingBottom: Spacing.md },
  bubble: {
    maxWidth: '85%',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  aiHeader: { marginBottom: 4 },
  aiLabel: { fontSize: FontSize.xs, fontWeight: '700' },
  bubbleText: { fontSize: FontSize.md, lineHeight: 22 },
  typing: { fontSize: FontSize.sm, fontStyle: 'italic' },
  quickPrompts: { marginTop: Spacing.md, gap: Spacing.sm },
  quickLabel: { fontSize: FontSize.sm, marginBottom: 4 },
  quickBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
  },
  quickBtnText: { fontSize: FontSize.sm, fontWeight: '500' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});
