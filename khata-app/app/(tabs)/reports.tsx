import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { formatINR } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';

interface ReportRow {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
}

export default function ReportsScreen() {
  const { business, summary, loadBusiness, refreshSummary } = useBusinessStore();
  const { customers, loadCustomers } = useCustomerStore();

  useEffect(() => {
    if (business) {
      loadCustomers(business.id);
      refreshSummary();
    }
  }, [business?.id]);

  const topDebtors = [...customers]
    .filter((c) => (c.balance ?? 0) < 0)
    .sort((a, b) => (a.balance ?? 0) - (b.balance ?? 0))
    .slice(0, 5);

  const topCreditors = [...customers]
    .filter((c) => (c.balance ?? 0) > 0)
    .sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0))
    .slice(0, 5);

  if (!summary) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const rows: ReportRow[] = [
    {
      label: 'Total Customers',
      value: summary.total_customers.toString(),
      icon: 'account-group',
      color: '#2563eb',
      bg: '#dbeafe',
    },
    {
      label: 'Total to Receive',
      value: formatINR(summary.total_credit),
      icon: 'arrow-down-circle',
      color: COLORS.credit,
      bg: COLORS.creditLight,
    },
    {
      label: 'Total to Pay',
      value: formatINR(summary.total_debit),
      icon: 'arrow-up-circle',
      color: COLORS.debit,
      bg: COLORS.debitLight,
    },
    {
      label: 'Net Balance',
      value: formatINR(Math.abs(summary.net_balance)),
      icon: 'scale-balance',
      color: COLORS.primary,
      bg: '#fff7ed',
    },
    {
      label: 'Overdue Accounts',
      value: summary.customers_with_due.toString(),
      icon: 'alert-circle',
      color: '#ca8a04',
      bg: '#fef9c3',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Reports</Text>
      <Text style={styles.bizName}>{business?.name}</Text>

      {/* Summary Cards */}
      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row.label} style={[styles.card, { borderTopColor: row.color }]}>
            <View style={[styles.cardIcon, { backgroundColor: row.bg }]}>
              <MaterialCommunityIcons name={row.icon as any} size={22} color={row.color} />
            </View>
            <Text style={styles.cardValue}>{row.value}</Text>
            <Text style={styles.cardLabel}>{row.label}</Text>
          </View>
        ))}
      </View>

      {/* Net Balance Hero */}
      <View style={[styles.heroCard, summary.net_balance >= 0 ? styles.heroCredit : styles.heroDebit]}>
        <Text style={styles.heroLabel}>Net Position</Text>
        <Text style={styles.heroValue}>
          {summary.net_balance >= 0 ? '↑ ' : '↓ '}
          {formatINR(Math.abs(summary.net_balance))}
        </Text>
        <Text style={styles.heroSub}>
          {summary.net_balance >= 0
            ? 'People owe you this amount'
            : 'You owe this amount to people'}
        </Text>
      </View>

      {/* Top Debtors */}
      {topDebtors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons name="arrow-up-circle" size={16} color={COLORS.debit} /> Top Debtors (owe you)
          </Text>
          {topDebtors.map((c) => (
            <View key={c.id} style={styles.rankRow}>
              <Text style={styles.rankName} numberOfLines={1}>{c.name}</Text>
              <Text style={[styles.rankAmount, { color: COLORS.debit }]}>
                {formatINR(Math.abs(c.balance ?? 0))}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Top Creditors */}
      {topCreditors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons name="arrow-down-circle" size={16} color={COLORS.credit} /> You Owe (to be paid)
          </Text>
          {topCreditors.map((c) => (
            <View key={c.id} style={styles.rankRow}>
              <Text style={styles.rankName} numberOfLines={1}>{c.name}</Text>
              <Text style={[styles.rankAmount, { color: COLORS.credit }]}>
                {formatINR(Math.abs(c.balance ?? 0))}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  content: { padding: 16, paddingTop: 56, paddingBottom: 48 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.ink },
  bizName: { fontSize: 14, color: COLORS.inkMuted, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  card: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderTopWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardValue: { fontSize: 18, fontWeight: '800', color: COLORS.ink },
  cardLabel: { fontSize: 12, color: COLORS.inkMuted, marginTop: 3, fontWeight: '500' },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroCredit: { backgroundColor: COLORS.creditLight },
  heroDebit: { backgroundColor: COLORS.debitLight },
  heroLabel: { fontSize: 13, fontWeight: '600', color: COLORS.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  heroValue: { fontSize: 32, fontWeight: '800', color: COLORS.ink, marginTop: 6 },
  heroSub: { fontSize: 13, color: COLORS.inkMuted, marginTop: 4 },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.ink, marginBottom: 12 },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rankName: { flex: 1, fontSize: 14, color: COLORS.ink, fontWeight: '500' },
  rankAmount: { fontSize: 14, fontWeight: '700' },
});
