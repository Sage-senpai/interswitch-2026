import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { wagAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

// Faux African kente-inspired pattern using repeating View shapes
function AfricanPatternBg({ color }: { color: string }) {
  const diamonds = Array.from({ length: 20 });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {diamonds.map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: 28,
            height: 28,
            borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,0.12)',
            transform: [{ rotate: '45deg' }],
            top: ((i * 47) % 130) - 14,
            left: ((i * 61) % 320) - 14,
          }}
        />
      ))}
      {/* Horizontal stripe accents */}
      <View style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <View style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
    </View>
  );
}

// Pulsing dot badge
function PulseBadge({ count, colors }: { count: number; colors: any }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.25, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.primary + '33',
          transform: [{ scale: pulse }],
        }}
      />
      <View style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 9, color: '#fff', fontWeight: '800' }}>{count}</Text>
      </View>
    </View>
  );
}

// Overlapping member avatar circles
function MemberAvatars({ count, colors }: { count: number; colors: any }) {
  const shown = Math.min(count, 4);
  const avatarColors = [colors.primary, colors.accent, colors.success, colors.warning];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {Array.from({ length: shown }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: avatarColors[i % avatarColors.length],
            borderWidth: 2,
            borderColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: i === 0 ? 0 : -10,
            zIndex: shown - i,
          }}
        >
          <Ionicons name="person" size={12} color="#fff" />
        </View>
      ))}
      {count > 4 && (
        <View style={{
          width: 28, height: 28, borderRadius: 14,
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 2, borderColor: colors.surface,
          alignItems: 'center', justifyContent: 'center',
          marginLeft: -10,
        }}>
          <Text style={{ fontSize: 8, color: colors.textSecondary, fontWeight: '700' }}>+{count - 4}</Text>
        </View>
      )}
    </View>
  );
}

// Shimmer-glow on the pool balance
function PoolBalanceGlow({
  value,
  colors,
}: {
  value: string;
  colors: any;
}) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <Animated.Text
      style={{
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: colors.primary,
        opacity,
        letterSpacing: -0.3,
      }}
    >
      {value}
    </Animated.Text>
  );
}

function WAGCard({
  wag,
  index,
  colors,
  onPress,
  isDesktop,
}: {
  wag: any;
  index: number;
  colors: any;
  onPress: () => void;
  isDesktop: boolean;
}) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const s = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 480,
        delay: index * 90,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 480,
        delay: index * 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        isDesktop ? s.wagCardDesktop : undefined,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.82}
        style={s.wagCard}
      >
        {/* Header row */}
        <View style={s.wagHeader}>
          <View style={s.wagAvatarWrap}>
            <Ionicons name="people" size={22} color={colors.primary} />
          </View>
          <View style={s.wagInfo}>
            <Text style={s.wagName}>{wag.name}</Text>
            <Text style={s.wagState}>{wag.state}</Text>
          </View>
          <View style={s.roleBadge}>
            <Text style={s.roleText}>{wag.myRole}</Text>
          </View>
        </View>

        {/* Member avatars + count badge */}
        <View style={s.wagMembersRow}>
          <MemberAvatars count={wag.memberCount} colors={colors} />
          <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
            <Text style={s.wagMemberCount}>
              {wag.memberCount} of {wag.maxMembers} members
            </Text>
          </View>
          <PulseBadge count={wag.memberCount} colors={colors} />
        </View>

        {/* Stats */}
        <View style={s.wagStats}>
          <View style={s.wagStatBox}>
            <PoolBalanceGlow
              value={formatNaira(Number(wag.poolBalance))}
              colors={colors}
            />
            <Text style={s.wagStatLabel}>Pool Balance</Text>
          </View>
          <View style={s.wagDivider} />
          <View style={s.wagStatBox}>
            <Text style={s.wagStatNumber}>{wag.totalContributions}</Text>
            <Text style={s.wagStatLabel}>Contributions</Text>
          </View>
        </View>

        {/* Blockchain verified */}
        {wag.contractAddress && (
          <View style={s.verifiedRow}>
            <Ionicons name="shield-checkmark" size={13} color={colors.success} />
            <Text style={s.verifiedText}>Blockchain verified</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isDesktop, contentMaxWidth } = useResponsive();
  const [wags, setWags] = useState<any[]>([]);
  const [joinId, setJoinId] = useState('');
  const [joining, setJoining] = useState(false);

  const heroBounce = useRef(new Animated.Value(0)).current;
  const heroFade = useRef(new Animated.Value(0)).current;

  const fetchWAGs = async () => {
    try {
      const res = await wagAPI.getMyWAGs();
      setWags(res.data.data || []);
    } catch {
      setWags([]);
    }
  };

  useEffect(() => {
    fetchWAGs();
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(heroBounce, { toValue: 0, useNativeDriver: true, from: -24 } as any),
    ]).start();
  }, []);

  const handleJoin = async () => {
    if (!joinId.trim()) return;
    setJoining(true);
    try {
      await wagAPI.join(joinId.trim());
      setJoinId('');
      fetchWAGs();
      if (Platform.OS === 'web') {
        alert('You have joined the WAG!');
      } else {
        Alert.alert('Success', 'You have joined the WAG!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Could not join WAG';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    }
    setJoining(false);
  };

  const s = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[
        s.content,
        isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
      ]}
    >
      {/* Hero Banner */}
      <Animated.View style={[s.heroBanner, { opacity: heroFade }]}>
        <AfricanPatternBg color={colors.primary} />
        <View style={s.heroContent}>
          <View style={s.heroBadge}>
            <Ionicons name="people" size={13} color="#fff" />
            <Text style={s.heroBadgeText}>Women Affinity Groups</Text>
          </View>
          <Text style={s.heroTitle}>Stronger{'\n'}Together</Text>
          <Text style={s.heroSub}>
            Save as a community, grow as one — pooling wealth across Nigeria.
          </Text>
        </View>
        {/* Bottom fade */}
        <View style={s.heroBannerFade} />
      </Animated.View>

      {/* Create WAG Button */}
      <View style={s.actions}>
        <Button
          title="Create a WAG"
          onPress={() => router.push('/wag/create')}
          icon={<Ionicons name="add-circle" size={20} color={colors.textInverse} />}
          style={{ flex: 1 }}
        />
      </View>

      {/* Join WAG — inline card */}
      <View style={s.joinCard}>
        <View style={s.joinIllustration}>
          <Ionicons name="link" size={26} color={colors.primary} />
        </View>
        <View style={s.joinBody}>
          <Text style={s.joinTitle}>Have a WAG ID?</Text>
          <Text style={s.joinSub}>Paste the code below to join your group</Text>
        </View>
        <View style={s.joinInputRow}>
          <TextInput
            style={s.joinInput}
            placeholder="Enter WAG ID"
            placeholderTextColor={colors.textLight}
            value={joinId}
            onChangeText={setJoinId}
          />
          <Button title="Join" onPress={handleJoin} loading={joining} size="sm" />
        </View>
      </View>

      {/* My WAGs */}
      {wags.length === 0 ? (
        <Animated.View style={[s.emptyState, { opacity: heroFade }]}>
          <View style={s.emptyCircle}>
            <Text style={s.emptyEmoji}>👑</Text>
          </View>
          <Text style={s.emptyTitle}>No groups yet</Text>
          <Text style={s.emptyText}>
            Start or join a Women Affinity Group to save collectively and lift each other financially.
          </Text>
        </Animated.View>
      ) : (
        <View style={s.wagSection}>
          <Text style={s.sectionTitle}>My Groups</Text>
          <View style={[isDesktop ? s.wagGrid : undefined]}>
            {wags.map((wag, i) => (
              <WAGCard
                key={wag.id}
                wag={wag}
                index={i}
                colors={colors}
                isDesktop={isDesktop}
                onPress={() => router.push(`/wag/${wag.id}`)}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(colors: any, isDesktop: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: Spacing.xxl },

    // Hero Banner
    heroBanner: {
      height: isDesktop ? 220 : 180,
      backgroundColor: colors.primary,
      overflow: 'hidden',
      marginBottom: Spacing.lg,
    },
    heroContent: {
      padding: isDesktop ? Spacing.xl : Spacing.lg,
      paddingTop: isDesktop ? Spacing.xl : Spacing.lg,
      flex: 1,
      justifyContent: 'flex-end',
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: BorderRadius.full,
      marginBottom: Spacing.sm,
    },
    heroBadgeText: { fontSize: FontSize.xs, color: '#fff', fontWeight: '700' },
    heroTitle: {
      fontSize: isDesktop ? 44 : 34,
      fontWeight: '900',
      color: '#fff',
      lineHeight: isDesktop ? 50 : 40,
      letterSpacing: -1,
    },
    heroSub: {
      fontSize: FontSize.sm,
      color: 'rgba(255,255,255,0.8)',
      marginTop: Spacing.xs,
      lineHeight: 20,
    },
    heroBannerFade: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 40,
      backgroundColor: 'transparent',
    },

    // Section padding
    actions: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
      paddingHorizontal: isDesktop ? Spacing.xl : Spacing.md,
    },

    // Join Card
    joinCard: {
      marginHorizontal: isDesktop ? Spacing.xl : Spacing.md,
      marginBottom: Spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 3,
    },
    joinIllustration: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    joinBody: { marginBottom: Spacing.sm },
    joinTitle: {
      fontSize: FontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    joinSub: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    joinInputRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      alignItems: 'center',
    },
    joinInput: {
      flex: 1,
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Platform.OS === 'ios' ? 10 : Spacing.sm,
      fontSize: FontSize.sm,
      color: colors.text,
    },

    // Empty State
    emptyState: {
      alignItems: 'center',
      paddingVertical: Spacing.xxl,
      paddingHorizontal: Spacing.lg,
    },
    emptyCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
    },
    emptyEmoji: { fontSize: 50 },
    emptyTitle: {
      fontSize: FontSize.xl,
      fontWeight: '800',
      color: colors.text,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },

    // WAG section
    wagSection: {
      paddingHorizontal: isDesktop ? Spacing.xl : Spacing.md,
      gap: Spacing.sm,
    },
    sectionTitle: {
      fontSize: FontSize.lg,
      fontWeight: '800',
      color: colors.text,
      marginBottom: Spacing.md,
      letterSpacing: -0.3,
    },
    wagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    wagCard: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 3,
    },
    wagCardDesktop: { width: '48.5%' },

    wagHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    wagAvatarWrap: {
      width: 46,
      height: 46,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    wagInfo: { flex: 1 },
    wagName: {
      fontSize: FontSize.md,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.2,
    },
    wagState: {
      fontSize: FontSize.xs,
      color: colors.textLight,
      marginTop: 2,
      textTransform: 'capitalize',
    },
    roleBadge: {
      backgroundColor: colors.accentLight,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.full,
    },
    roleText: { fontSize: 10, color: colors.primary, fontWeight: '700' },

    wagMembersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    wagMemberCount: {
      fontSize: FontSize.xs,
      color: colors.textSecondary,
    },

    wagStats: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      marginBottom: Spacing.sm,
      gap: Spacing.sm,
    },
    wagStatBox: { flex: 1, alignItems: 'center' },
    wagDivider: {
      width: 1,
      height: 32,
      backgroundColor: colors.border,
    },
    wagStatNumber: {
      fontSize: FontSize.lg,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    wagStatLabel: {
      fontSize: FontSize.xs,
      color: colors.textLight,
      marginTop: 2,
    },

    verifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    verifiedText: {
      fontSize: FontSize.xs,
      color: colors.success,
      fontWeight: '500',
    },
  });
}
