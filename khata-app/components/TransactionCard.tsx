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
  const iconName = isCredit ? 'arrow-up' : 'arrow-down';
  const alignStyle = isCredit ? { alignSelf: 'flex-start' as const } : { alignSelf: 'flex-end' as const };

  return (
    <TouchableOpacity 
      style={[styles.card, alignStyle, dk && { backgroundColor: D.surface, borderColor: D.border }]}
      onLongPress={() => {
        if (onLongPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onLongPress(transaction);
        }
      }}
      delayLongPress={300}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <MaterialCommunityIcons
          name={iconName}
          size={16}
          color={COLORS.ink}
          style={styles.arrowIcon}
        />
        <Text style={[styles.amount, dk && { color: D.text }]}>
          {formatINR(transaction.amount)}
        </Text>
        <Text style={[styles.time, dk && { color: D.muted }]}>
          {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <MaterialCommunityIcons name="check" size={16} color={COLORS.inkMuted} style={styles.checkIcon} />
      </View>
      
      <Text style={[styles.note, dk && { color: D.muted }]}>
        {transaction.note || `${formatINR(transaction.amount)} ${isCredit ? 'Advance' : 'Payment'}`}
      </Text>
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
    backgroundColor: COLORS.surface,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 160,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  arrowIcon: {
    marginRight: 6,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#94a3b8',
    marginRight: 4,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  note: {
    fontSize: 14,
    color: '#64748b',
  },
});
