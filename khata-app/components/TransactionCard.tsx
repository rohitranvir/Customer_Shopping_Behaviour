import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Transaction } from '../db/queries';
import { formatINR, formatDate } from '../utils/formatters';
import { COLORS } from '../utils/constants';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../store/useThemeStore';

const D = { surface: '#1e293b', border: '#334155', text: '#f1f5f9', muted: '#94a3b8', bgSecondary: '#0f172a' };

interface TransactionCardProps {
  transaction: Transaction;
  runningBalance?: number;
  onLongPress?: (transaction: Transaction) => void;
}

function TransactionCard({ transaction, runningBalance, onLongPress }: TransactionCardProps) {
  const { isDark } = useThemeStore();
  const dk = isDark;
  // mapping: CREDIT = Udhar given (we will receive) = Red
  // DEBIT = Payment taken (we owe) = Green
  const isCredit = transaction.type === 'CREDIT';

  const amountColor = isCredit ? '#ef4444' : '#22c55e';
  const bgColor = isCredit ? '#fef2f2' : '#f0fdf4';
  const iconName = isCredit ? 'arrow-down' : 'arrow-up';

  return (
    <TouchableOpacity 
      style={[styles.card, dk && { backgroundColor: D.surface, borderBottomColor: D.border }]}
      onLongPress={() => {
        if (onLongPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onLongPress(transaction);
        }
      }}
      delayLongPress={300}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
          <MaterialCommunityIcons
            name={iconName}
            size={20}
            color={amountColor}
          />
        </View>
        
        <View style={styles.info}>
          <Text style={[styles.date, dk && { color: D.text }]}>{formatDate(transaction.date)}</Text>
          {!!transaction.note && (
             <Text style={[styles.note, dk && { color: D.muted }]} numberOfLines={1}>{transaction.note}</Text>
          )}
          {transaction.due_date && (
            <View style={[styles.dueBadge, dk && { backgroundColor: D.bgSecondary }]}>
              <MaterialCommunityIcons name="calendar-clock" size={12} color={dk ? D.muted : COLORS.inkMuted} />
              <Text style={[styles.dueText, dk && { color: D.muted }]}>Due {formatDate(transaction.due_date)}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {formatINR(transaction.amount)}
        </Text>
        
        {typeof runningBalance === 'number' && (
          <View style={[styles.runningBalanceWrap, dk && { backgroundColor: D.bgSecondary }]}>
            <Text style={[styles.runningBalanceText, dk && { color: D.muted }]}>
              Bal: {formatINR(Math.abs(runningBalance))}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(TransactionCard, (prev, next) => {
  return prev.transaction.id === next.transaction.id &&
         prev.runningBalance === next.runningBalance &&
         prev.transaction.amount === next.transaction.amount;
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {
    flexDirection: 'row',
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  date: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 2,
  },
  note: {
    fontSize: 13,
    color: COLORS.inkMuted,
    marginBottom: 4,
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dueText: {
    fontSize: 11,
    color: COLORS.inkMuted,
    marginLeft: 4,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  runningBalanceWrap: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  runningBalanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.inkMuted,
  },
});
