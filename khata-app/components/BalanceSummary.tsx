import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BusinessSummary } from '../db/queries';
import { formatINR } from '../utils/formatters';
import { COLORS } from '../utils/constants';

interface BalanceSummaryProps {
  summary: BusinessSummary;
}

export default function BalanceSummary({ summary }: BalanceSummaryProps) {
  const netPositive = summary.net_balance >= 0;

  return (
    <View style={styles.container}>
      {/* Net Balance Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Total Balance</Text>
        <Text style={[styles.heroAmount, netPositive ? styles.creditText : styles.debitText]}>
          {netPositive ? '' : '-'}{formatINR(Math.abs(summary.net_balance))}
        </Text>
        <Text style={styles.heroSub}>
          {netPositive ? '↑ You will receive' : '↓ You will pay'}
        </Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.creditStatCard]}>
          <MaterialCommunityIcons name="arrow-down-circle" size={20} color={COLORS.credit} />
          <Text style={styles.statLabel}>You'll Receive</Text>
          <Text style={[styles.statValue, styles.creditText]}>
            {formatINR(summary.total_credit)}
          </Text>
        </View>
        <View style={[styles.statCard, styles.debitStatCard]}>
          <MaterialCommunityIcons name="arrow-up-circle" size={20} color={COLORS.debit} />
          <Text style={styles.statLabel}>You'll Pay</Text>
          <Text style={[styles.statValue, styles.debitText]}>
            {formatINR(summary.total_debit)}
          </Text>
        </View>
      </View>

      {/* Customers & overdue */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="account-group" size={16} color={COLORS.inkMuted} />
          <Text style={styles.metaText}>{summary.total_customers} Customers</Text>
        </View>
        {summary.customers_with_due > 0 && (
          <View style={[styles.metaItem, styles.dueAlert]}>
            <MaterialCommunityIcons name="alert-circle" size={16} color="#ca8a04" />
            <Text style={styles.dueText}>{summary.customers_with_due} overdue</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  hero: { alignItems: 'center', marginBottom: 20 },
  heroLabel: { fontSize: 13, color: COLORS.inkMuted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroAmount: { fontSize: 36, fontWeight: '800', marginTop: 6 },
  creditText: { color: COLORS.credit },
  debitText: { color: COLORS.debit },
  heroSub: { fontSize: 13, color: COLORS.inkMuted, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  creditStatCard: { backgroundColor: COLORS.creditLight },
  debitStatCard: { backgroundColor: COLORS.debitLight },
  statLabel: { fontSize: 12, color: COLORS.inkMuted, fontWeight: '500' },
  statValue: { fontSize: 16, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: COLORS.inkMuted },
  dueAlert: {
    backgroundColor: '#fef9c3',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dueText: { fontSize: 13, color: '#ca8a04', fontWeight: '600' },
});
