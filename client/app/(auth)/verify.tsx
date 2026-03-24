import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Animated, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { verifyOTP, clearError } from '../../src/store/authSlice';
import { RootState, AppDispatch } from '../../src/store';
import Button from '../../src/components/Button';
import AfricanPattern from '../../src/components/AfricanPattern';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';

export default function VerifyScreen() {
  const router = useRouter();
  const { phone, mode, name, otp: serverOtp } = useLocalSearchParams<{ phone: string; mode: string; name: string; otp: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const { colors, isDark } = useTheme();
  const { isDesktop } = useResponsive();

  const [otp, setOtp] = useState(() => {
    if (serverOtp && serverOtp.length === 6) return serverOtp.split('');
    return ['', '', '', '', '', ''];
  });
  const inputs = useRef<(TextInput | null)[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    const result = await dispatch(verifyOTP({
      phone: phone || '',
      code,
      name: name || undefined,
      isLogin: mode === 'login',
    }));
    if (verifyOTP.fulfilled.match(result)) router.replace('/(tabs)');
  };

  const isComplete = otp.every((d) => d !== '');

  const formContent = (
    <Animated.View style={[styles.formCard, { opacity: fadeAnim }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
        <Ionicons name="keypad" size={32} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Enter OTP</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        We sent a 6-digit code to{'\n'}
        <Text style={{ fontWeight: '700', color: colors.primary }}>{phone}</Text>
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputs.current[index] = ref; }}
            style={[
              styles.otpInput,
              { borderColor: digit ? colors.primary : colors.border, backgroundColor: digit ? colors.accentLight : colors.surfaceSecondary, color: colors.text },
            ]}
            value={digit}
            onChangeText={(v) => handleChange(v, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
          <Ionicons name="alert-circle" size={16} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      )}

      <Button
        title="Verify & Continue"
        onPress={handleVerify}
        loading={isLoading}
        disabled={!isComplete}
        size="lg"
        style={styles.button}
      />

      {serverOtp && (
        <View style={[styles.otpHintBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Ionicons name="information-circle" size={16} color={colors.primary} />
          <View>
            <Text style={[styles.otpHintLabel, { color: colors.textSecondary }]}>Your OTP code (auto-filled):</Text>
            <Text style={[styles.otpHintCode, { color: colors.primary }]}>{serverOtp}</Text>
          </View>
        </View>
      )}

      {!serverOtp && (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Enter <Text style={{ fontWeight: '800', color: colors.primary }}>000000</Text> to bypass for demo
        </Text>
      )}
    </Animated.View>
  );

  if (!isDesktop) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.mobileContent}>{formContent}</ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.desktopContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.leftPanel, { backgroundColor: isDark ? colors.surface : colors.primaryDark }]}>
        <AfricanPattern width="100%" height="100%" opacity={0.06} variant="kente" />
        <View style={styles.leftContent}>
          <Ionicons name="wallet" size={48} color="#FFFFFF" />
          <Text style={styles.leftTitle}>Almost there!</Text>
          <Text style={styles.leftSubtitle}>
            Verify your phone number to start saving, learning, and growing your finances with Purse.
          </Text>
          <View style={styles.steps}>
            {['Create account', 'Verify phone', 'Start saving'].map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={[styles.stepDot, i <= 1 && styles.stepDotActive]}>
                  {i < 1 ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : <Text style={styles.stepNum}>{i + 1}</Text>}
                </View>
                <Text style={[styles.stepText, i <= 1 && styles.stepTextActive]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <ScrollView style={styles.rightPanel} contentContainerStyle={styles.rightContent}>
        {formContent}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mobileContent: { padding: Spacing.lg, paddingTop: 60, alignItems: 'center' },
  desktopContainer: { flex: 1, flexDirection: 'row' },
  leftPanel: { width: '40%', position: 'relative', overflow: 'hidden', justifyContent: 'center', padding: Spacing.xxl },
  leftContent: { zIndex: 1 },
  leftTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFFFFF', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  leftSubtitle: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.75)', lineHeight: 24, marginBottom: Spacing.xl },
  steps: { gap: Spacing.md },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: '#FFFFFF' },
  stepNum: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '700' },
  stepText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.5)' },
  stepTextActive: { color: '#FFFFFF', fontWeight: '600' },
  rightPanel: { flex: 1 },
  rightContent: { justifyContent: 'center', padding: Spacing.xxl, minHeight: '100%' },
  formCard: { maxWidth: 420, width: '100%', alignSelf: 'center', alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 24 },
  otpContainer: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  otpInput: { width: 50, height: 58, borderWidth: 2, borderRadius: BorderRadius.md, textAlign: 'center', fontSize: FontSize.xl, fontWeight: '700' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.sm, borderRadius: BorderRadius.sm, marginBottom: Spacing.md, width: '100%' },
  errorText: { fontSize: FontSize.sm, flex: 1 },
  button: { width: '100%', marginBottom: Spacing.md },
  otpHintBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, width: '100%',
  },
  otpHintLabel: { fontSize: FontSize.xs },
  otpHintCode: { fontSize: FontSize.xl, fontWeight: '800', letterSpacing: 6 },
  hint: { fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.sm },
});
