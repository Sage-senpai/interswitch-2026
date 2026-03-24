import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, clearError } from '../../src/store/authSlice';
import { RootState, AppDispatch } from '../../src/store';
import Button from '../../src/components/Button';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const isLogin = mode === 'login';
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    let formattedPhone = phone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `+234${formattedPhone.slice(1)}`;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }
    const result = await dispatch(sendOTP({ phone: formattedPhone, isLogin }));
    if (sendOTP.fulfilled.match(result)) {
      const otp = result.payload.data?.otp || '';
      router.push({
        pathname: '/(auth)/verify',
        params: { phone: formattedPhone, mode: mode || 'register', name, otp },
      });
    }
  };

  const isValid = phone.length >= 11 && (isLogin || name.length >= 2);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
        <Text style={styles.subtitle}>
          {isLogin
            ? 'Enter your phone number to sign in'
            : 'Enter your details to get started'}
        </Text>

        {!isLogin && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Amina Ibrahim"
              placeholderTextColor={Colors.textLight}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 08012345678"
            placeholderTextColor={Colors.textLight}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={14}
          />
        </View>

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <Button
          title="Send OTP"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!isValid}
          size="lg"
          style={styles.button}
        />

        <Button
          title={isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          onPress={() => router.replace(`/(auth)/login?mode=${isLogin ? 'register' : 'login'}`)}
          variant="ghost"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: 80,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  error: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  button: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
});
