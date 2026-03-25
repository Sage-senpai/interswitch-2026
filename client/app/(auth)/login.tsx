import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Animated, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { sendOTP, clearError } from '../../src/store/authSlice';
import { RootState, AppDispatch } from '../../src/store';
import Button from '../../src/components/Button';
import AfricanPattern from '../../src/components/AfricanPattern';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';

const AUTH_TESTIMONIALS = [
  { text: "Since I started using Purse, I've saved N50,000 for my daughter's school fees. The lessons taught me how to budget properly.", name: 'Mama Blessing', role: 'Market Woman, Ogun State' },
  { text: "Our WAG group of 15 women saved over N2 million in 6 months. Purse made it easy to track everything.", name: 'Hajiya Fatima', role: 'WAG Leader, Kebbi State' },
  { text: "I never knew I could invest with just N1,000. The AI advisor helped me start small and stay consistent.", name: 'Chidinma O.', role: 'University Student, Enugu' },
  { text: "The bill payment feature saves me time every week. I pay my children's school fees right from my phone.", name: 'Mrs. Adebayo', role: 'Teacher, Lagos State' },
  { text: "I used to keep money under my mattress. Now I have a savings goal and I can see my progress every day.", name: 'Amina Yusuf', role: 'Seamstress, Kano State' },
  { text: "Purse helped our cooperative group become transparent. Every member can verify contributions on the blockchain.", name: 'Sister Grace', role: 'Cooperative Secretary, Rivers State' },
  { text: "The financial literacy lessons changed my life. I now understand interest rates and I negotiated a better loan for my shop.", name: 'Ngozi Eze', role: 'Shop Owner, Anambra State' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const { colors, isDark } = useTheme();
  const { isDesktop } = useResponsive();

  const isLogin = mode === 'login';
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const testimonialFade = useRef(new Animated.Value(1)).current;
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // Rotate testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(testimonialFade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setTestimonialIndex((prev) => (prev + 1) % AUTH_TESTIMONIALS.length);
        Animated.timing(testimonialFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const formContent = (
    <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {!isDesktop && (
        <View style={styles.mobileHeader}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primaryDark }]}>
            <Ionicons name="wallet" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.logoText, { color: colors.primary }]}>Purse</Text>
        </View>
      )}

      <Text style={[styles.title, { color: colors.text }]}>
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {isLogin ? 'Sign in to continue your journey' : 'Start your financial empowerment journey'}
      </Text>

      {!isLogin && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Your Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. Amina Ibrahim"
            placeholderTextColor={colors.textLight}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g. 08012345678"
          placeholderTextColor={colors.textLight}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={14}
        />
      </View>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
          <Ionicons name="alert-circle" size={16} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      )}

      <Button
        title={isLogin ? 'Sign In' : 'Create Account'}
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

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.textLight }]}>or use demo</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      <Text style={[styles.demoHint, { color: colors.textSecondary }]}>
        Use OTP code <Text style={{ fontWeight: '800', color: colors.primary }}>000000</Text> to bypass verification
      </Text>
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

  // Desktop: Split layout
  return (
    <View style={[styles.desktopContainer, { backgroundColor: colors.background }]}>
      {/* Left Panel — Branding */}
      <View style={[styles.leftPanel, { backgroundColor: isDark ? colors.surface : colors.primaryDark }]}>
        <AfricanPattern width="100%" height="100%" opacity={isDark ? 0.05 : 0.08} variant="adire" />
        <View style={styles.leftContent}>
          <View style={styles.leftBrand}>
            <View style={[styles.logoCircleLg, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name="wallet" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.leftTitle}>Purse</Text>
            <Text style={styles.leftSubtitle}>Financial literacy & empowerment for Nigerian women</Text>
          </View>

          <Animated.View style={[styles.testimonial, { opacity: testimonialFade }]}>
            <Ionicons name="chatbox-ellipses" size={20} color="rgba(255,255,255,0.25)" style={{ marginBottom: 8 }} />
            <Text style={styles.quoteText}>
              "{AUTH_TESTIMONIALS[testimonialIndex].text}"
            </Text>
            <View style={styles.quoteAuthor}>
              <View style={styles.quoteAvatar}>
                <Text style={styles.quoteInitial}>{AUTH_TESTIMONIALS[testimonialIndex].name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.quoteName}>{AUTH_TESTIMONIALS[testimonialIndex].name}</Text>
                <Text style={styles.quoteRole}>{AUTH_TESTIMONIALS[testimonialIndex].role}</Text>
              </View>
            </View>
            <View style={styles.quoteDots}>
              {AUTH_TESTIMONIALS.map((_, i) => (
                <View key={i} style={[styles.quoteDot, i === testimonialIndex && styles.quoteDotActive]} />
              ))}
            </View>
          </Animated.View>

          <View style={styles.leftBadges}>
            <View style={styles.leftBadge}>
              <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.leftBadgeText}>Interswitch Secured</Text>
            </View>
            <View style={styles.leftBadge}>
              <Ionicons name="cube" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.leftBadgeText}>Blockchain Verified</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Right Panel — Form */}
      <ScrollView style={styles.rightPanel} contentContainerStyle={styles.rightContent}>
        {formContent}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mobileContent: { padding: Spacing.lg, paddingTop: 60 },
  mobileHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  logoCircle: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: FontSize.xl, fontWeight: '800' },

  // Desktop split
  desktopContainer: { flex: 1, flexDirection: 'row' },
  leftPanel: {
    width: '45%',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  leftContent: { zIndex: 1, justifyContent: 'space-between', flex: 1 },
  leftBrand: { marginTop: 60 },
  logoCircleLg: { width: 64, height: 64, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  leftTitle: { fontSize: 42, fontWeight: '800', color: '#FFFFFF', marginBottom: Spacing.sm },
  leftSubtitle: { fontSize: FontSize.lg, color: 'rgba(255,255,255,0.75)', lineHeight: 26, maxWidth: 350 },

  testimonial: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.xl,
  },
  quoteText: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.9)', lineHeight: 24, fontStyle: 'italic', marginBottom: Spacing.md },
  quoteAuthor: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  quoteAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  quoteInitial: { fontSize: FontSize.sm, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  quoteName: { fontSize: FontSize.sm, fontWeight: '700', color: '#FFFFFF' },
  quoteRole: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)' },
  quoteDots: { flexDirection: 'row', gap: 5, justifyContent: 'center' },
  quoteDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  quoteDotActive: { backgroundColor: 'rgba(255,255,255,0.7)', width: 18 },

  leftBadges: { flexDirection: 'row', gap: Spacing.md },
  leftBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leftBadgeText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)' },

  rightPanel: { flex: 1 },
  rightContent: { justifyContent: 'center', padding: Spacing.xxl, minHeight: '100%' },

  // Form
  formCard: { maxWidth: 420, width: '100%', alignSelf: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, marginBottom: Spacing.xl },
  inputGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  errorText: { fontSize: FontSize.sm, flex: 1 },
  button: { marginTop: Spacing.md, marginBottom: Spacing.sm },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.md },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: FontSize.xs },
  demoHint: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});
