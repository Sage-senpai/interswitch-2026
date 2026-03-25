import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { userAPI } from '../../src/services/api';
import { formatNaira } from '../../src/utils/format';

// ─── Types ───────────────────────────────────────────────────

type TransactionType =
  | 'WALLET_FUNDING'
  | 'BILL_PAYMENT'
  | 'P2P_TRANSFER'
  | 'SAVINGS_DEPOSIT'
  | 'SAVINGS_WITHDRAWAL'
  | 'WAG_CONTRIBUTION'
  | 'REWARD';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

// ─── Mock Data ───────────────────────────────────────────────

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1',  type: 'WALLET_FUNDING',    amount: 5000,  description: 'Wallet funded via Interswitch', status: 'SUCCESS', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '2',  type: 'SAVINGS_DEPOSIT',   amount: 1000,  description: 'Saved to Education Goal',       status: 'SUCCESS', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '3',  type: 'BILL_PAYMENT',      amount: 2000,  description: 'MTN Airtime Purchase',          status: 'SUCCESS', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4',  type: 'REWARD',            amount: 50,    description: 'Lesson Completion Reward',      status: 'SUCCESS', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '5',  type: 'P2P_TRANSFER',      amount: 3000,  description: 'Sent to Amina Ibrahim',         status: 'SUCCESS', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: '6',  type: 'WAG_CONTRIBUTION',  amount: 500,   description: 'Iya Oloja Market Women',        status: 'SUCCESS', createdAt: new Date(Date.now() - 345600000).toISOString() },
  { id: '7',  type: 'WALLET_FUNDING',    amount: 10000, description: 'Wallet funded via Interswitch', status: 'SUCCESS', createdAt: new Date(Date.now() - 432000000).toISOString() },
  { id: '8',  type: 'BILL_PAYMENT',      amount: 5500,  description: 'DSTV Subscription',             status: 'SUCCESS', createdAt: new Date(Date.now() - 518400000).toISOString() },
  { id: '9',  type: 'SAVINGS_DEPOSIT',   amount: 2000,  description: 'Saved to Business Goal',        status: 'SUCCESS', createdAt: new Date(Date.now() - 604800000).toISOString() },
  { id: '10', type: 'REWARD',            amount: 75,    description: 'Quiz Perfect Score Bonus',      status: 'SUCCESS', createdAt: new Date(Date.now() - 691200000).toISOString() },
];

// ─── Transaction Config ──────────────────────────────────────

const TX_CONFIG: Record<TransactionType, { icon: string; color: string; isCredit: boolean }> = {
  WALLET_FUNDING:    { icon: 'card',          color: '#0066FF', isCredit: true  },
  BILL_PAYMENT:      { icon: 'receipt',       color: '#EC407A', isCredit: false },
  P2P_TRANSFER:      { icon: 'send',          color: '#7E57C2', isCredit: false },
  SAVINGS_DEPOSIT:   { icon: 'trending-up',   color: '#66BB6A', isCredit: false },
  SAVINGS_WITHDRAWAL:{ icon: 'trending-down', color: '#FFA726', isCredit: true  },
  WAG_CONTRIBUTION:  { icon: 'people',        color: '#0066FF', isCredit: false },
  REWARD:            { icon: 'gift',          color: '#FFD700', isCredit: true  },
};

// ─── Filter Pills ────────────────────────────────────────────

type FilterKey = 'All' | 'Credits' | 'Debits' | 'Savings' | 'Payments';

const FILTERS: FilterKey[] = ['All', 'Credits', 'Debits', 'Savings', 'Payments'];

// ─── Helpers ─────────────────────────────────────────────────

function glassBg(isDark: boolean) {
  return {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as any)
      : {}),
  };
}

function getDateLabel(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 6) return 'This Week';
  return 'Earlier';
}

function groupTransactions(txs: Transaction[]): { label: string; data: Transaction[] }[] {
  const order = ['Today', 'Yesterday', 'This Week', 'Earlier'];
  const map: Record<string, Transaction[]> = {};
  txs.forEach((tx) => {
    const label = getDateLabel(tx.createdAt);
    if (!map[label]) map[label] = [];
    map[label].push(tx);
  });
  return order.filter((l) => map[l]).map((l) => ({ label: l, data: map[l] }));
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays === 0) return formatTime(dateStr);
  if (diffDays === 1) return `Yesterday ${formatTime(dateStr)}`;
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function filterTransactions(txs: Transaction[], filter: FilterKey): Transaction[] {
  switch (filter) {
    case 'Credits':
      return txs.filter((tx) => TX_CONFIG[tx.type]?.isCredit);
    case 'Debits':
      return txs.filter((tx) => !TX_CONFIG[tx.type]?.isCredit);
    case 'Savings':
      return txs.filter((tx) => tx.type === 'SAVINGS_DEPOSIT' || tx.type === 'SAVINGS_WITHDRAWAL');
    case 'Payments':
      return txs.filter((tx) => tx.type === 'BILL_PAYMENT' || tx.type === 'P2P_TRANSFER' || tx.type === 'WAG_CONTRIBUTION');
    default:
      return txs;
  }
}

// ─── FadeIn ──────────────────────────────────────────────────

function FadeIn({ delay = 0, children, style }: { delay?: number; children: React.ReactNode; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 16, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

// ─── Component ───────────────────────────────────────────────

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isDesktop, contentMaxWidth } = useResponsive();

  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [refreshing, setRefreshing] = useState(false);

  // ── Derived ───────────────────────────────────────────────
  const filtered = filterTransactions(transactions, activeFilter);
  const grouped  = groupTransactions(filtered);

  const totalCredits = transactions.reduce((sum, tx) =>
    TX_CONFIG[tx.type]?.isCredit ? sum + tx.amount : sum, 0);
  const totalDebits = transactions.reduce((sum, tx) =>
    !TX_CONFIG[tx.type]?.isCredit ? sum + tx.amount : sum, 0);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await userAPI.getTransactions();
      const data = res.data?.data;
      if (Array.isArray(data) && data.length > 0) setTransactions(data);
    } catch {
      // keep mock data on error
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, [fetchTransactions]);

  // ── Render helpers ────────────────────────────────────────

  const renderSummaryCards = () => (
    <FadeIn
      delay={150}
      style={[
        { gap: Spacing.sm, marginBottom: Spacing.lg },
        isDesktop ? { flexDirection: 'row' } : { flexDirection: 'row' },
      ]}
    >
      {/* Credits card */}
      <View style={[
        { flex: 1, borderRadius: BorderRadius.md, padding: Spacing.md },
        glassBg(isDark),
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <View style={{
            width: 32, height: 32, borderRadius: 10,
            backgroundColor: colors.success + '20',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="arrow-down-circle" size={18} color={colors.success} />
          </View>
          <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Total In
          </Text>
        </View>
        <Text style={{ fontSize: isDesktop ? FontSize.xl : FontSize.lg, fontWeight: '800', color: colors.success }}>
          {formatNaira(totalCredits)}
        </Text>
      </View>

      {/* Debits card */}
      <View style={[
        { flex: 1, borderRadius: BorderRadius.md, padding: Spacing.md },
        glassBg(isDark),
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <View style={{
            width: 32, height: 32, borderRadius: 10,
            backgroundColor: colors.danger + '20',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="arrow-up-circle" size={18} color={colors.danger} />
          </View>
          <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Total Out
          </Text>
        </View>
        <Text style={{ fontSize: isDesktop ? FontSize.xl : FontSize.lg, fontWeight: '800', color: colors.danger }}>
          {formatNaira(totalDebits)}
        </Text>
      </View>
    </FadeIn>
  );

  const renderFilterPills = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.md }}
    >
      {FILTERS.map((f) => {
        const active = activeFilter === f;
        return (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.75}
            style={{
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm - 2,
              borderRadius: BorderRadius.full,
              backgroundColor: active
                ? colors.primary
                : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
              borderWidth: 1,
              borderColor: active
                ? colors.primary
                : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            }}
          >
            <Text style={{
              fontSize: FontSize.sm,
              fontWeight: '600',
              color: active ? colors.textInverse : colors.textSecondary,
            }}>
              {f}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderTransactionRow = (tx: Transaction, isLast: boolean) => {
    const cfg = TX_CONFIG[tx.type] ?? { icon: 'ellipse', color: colors.primary, isCredit: false };
    const amountColor = cfg.isCredit ? colors.success : colors.danger;
    const prefix      = cfg.isCredit ? '+' : '-';

    return (
      <View
        key={tx.id}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: Spacing.sm + 2,
          paddingHorizontal: Spacing.md,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          gap: Spacing.sm,
        }}
      >
        {/* Icon circle */}
        <View style={{
          width: 44, height: 44, borderRadius: 14,
          backgroundColor: cfg.color + '20',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
        </View>

        {/* Description + date */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{ fontSize: FontSize.sm, fontWeight: '600', color: colors.text }}
          >
            {tx.description}
          </Text>
          <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 2 }}>
            {formatDate(tx.createdAt)}
          </Text>
        </View>

        {/* Amount */}
        <Text style={{ fontSize: FontSize.sm, fontWeight: '700', color: amountColor, flexShrink: 0 }}>
          {prefix}{formatNaira(tx.amount)}
        </Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={{ alignItems: 'center', paddingVertical: Spacing.xxl }}>
      <View style={{
        width: 64, height: 64, borderRadius: 20,
        backgroundColor: colors.accentLight,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.md,
      }}>
        <Ionicons name="receipt-outline" size={30} color={colors.textLight} />
      </View>
      <Text style={{ fontSize: FontSize.md, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 }}>
        No transactions found
      </Text>
      <Text style={{ fontSize: FontSize.sm, color: colors.textLight, textAlign: 'center' }}>
        Transactions matching this filter{'\n'}will appear here.
      </Text>
    </View>
  );

  // ── Main render ───────────────────────────────────────────
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        { padding: isDesktop ? Spacing.xl : Spacing.md, paddingBottom: 80 },
        isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* ── Header ── */}
      <FadeIn delay={0} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, marginTop: Spacing.sm }}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{
            width: 40, height: 40, borderRadius: 12,
            alignItems: 'center', justifyContent: 'center',
            marginRight: Spacing.sm,
            ...glassBg(isDark),
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: isDesktop ? FontSize.xxl : FontSize.xl, fontWeight: '800', color: colors.text }}>
            Transaction History
          </Text>
          <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 1 }}>
            {transactions.length} transactions
          </Text>
        </View>
      </FadeIn>

      {/* ── Summary Cards ── */}
      {renderSummaryCards()}

      {/* ── Filter Pills ── */}
      <FadeIn delay={250}>
        {renderFilterPills()}
      </FadeIn>

      {/* ── Transaction Groups ── */}
      {grouped.length === 0 ? (
        <FadeIn delay={300}>
          <View style={[{ borderRadius: BorderRadius.lg, overflow: 'hidden' }, glassBg(isDark)]}>
            {renderEmpty()}
          </View>
        </FadeIn>
      ) : (
        grouped.map((group, gi) => (
          <FadeIn key={group.label} delay={300 + gi * 80} style={{ marginBottom: Spacing.md }}>
            {/* Date group label */}
            <Text style={{
              fontSize: FontSize.xs, fontWeight: '700',
              color: colors.textLight,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: Spacing.sm,
              marginLeft: 2,
            }}>
              {group.label}
            </Text>

            {/* Transaction cards */}
            <View style={[{ borderRadius: BorderRadius.md, overflow: 'hidden' }, glassBg(isDark)]}>
              {group.data.map((tx, i) => renderTransactionRow(tx, i === group.data.length - 1))}
            </View>
          </FadeIn>
        ))
      )}

      {/* ── Footer badge ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: Spacing.lg }}>
        <Ionicons name="shield-checkmark" size={13} color={colors.interswitch} />
        <Text style={{ fontSize: 11, color: colors.textLight }}>Secured by Interswitch</Text>
      </View>
    </ScrollView>
  );
}
