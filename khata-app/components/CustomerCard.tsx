import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Customer } from '../db/queries';
import { formatINR, getInitials, getAvatarColor, formatDate } from '../utils/formatters';
import { COLORS } from '../utils/constants';
import { useThemeStore } from '../store/useThemeStore';
import * as Haptics from 'expo-haptics';

const D = { surface: '#1e293b', border: '#334155', text: '#f1f5f9', muted: '#94a3b8' };

interface CustomerCardProps {
  customer: Customer;
  onPress: (id: number) => void;
  onDelete?: (customer: Customer) => void;
}

function CustomerCard({ customer, onPress, onDelete }: CustomerCardProps) {
  const { isDark } = useThemeStore();
  const dk = isDark;
  const balance = customer.balance ?? customer.opening_balance;
  
  // Logic based on screenshot:
  // > 0: Red, "Due"
  // == 0: Green, "Due"
  // < 0: Green, "Advance"
  const isDue = balance >= 0;
  const isZero = balance === 0;
  const amountColorStyle = (balance > 0) ? styles.redText : styles.greenText;
  const amountLabel = isDue ? 'Due' : 'Advance';
  
  const initials = getInitials(customer.name);
  const avatarColor = getAvatarColor(customer.name);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    if (!onDelete) return null;

    return (
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onDelete(customer);
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialCommunityIcons name="delete-outline" size={26} color="#fff" />
        </Animated.View>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity
        style={[styles.card, dk && { backgroundColor: D.surface, borderBottomColor: D.border }]}
        onPress={() => {
          Haptics.selectionAsync();
          onPress(customer.id);
        }}
        activeOpacity={0.9}
      >
        {/* Avatar Container */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {customer.is_overdue ? (
            <View style={styles.overdueIndicator}>
              <MaterialCommunityIcons name="exclamation-thick" size={12} color="#fff" />
            </View>
          ) : null}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.name, dk && { color: D.text }]} numberOfLines={1}>{customer.name}</Text>
          <View style={styles.subRow}>
            <MaterialCommunityIcons name="check" size={14} color={COLORS.inkMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.dateText, dk && { color: D.muted }]} numberOfLines={1}>
              {customer.last_tx_date ? `₹${formatINR(Math.abs(balance))} Payment Added on ${formatDate(customer.last_tx_date)}` : 'No transactions yet'}
            </Text>
          </View>
        </View>

        {/* Balance */}
        <View style={styles.balanceWrap}>
          <Text style={[styles.balance, amountColorStyle]}>
            {formatINR(Math.abs(balance))}
          </Text>
          <Text style={[styles.balanceLabel, dk && { color: D.muted }]}>
            {amountLabel}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

export default React.memo(CustomerCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  overdueIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, paddingRight: 8 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.ink, marginBottom: 4 },
  subRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 13, color: COLORS.inkMuted, flexShrink: 1 },
  balanceWrap: { alignItems: 'flex-end', justifyContent: 'center' },
  balance: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  redText: { color: '#ef4444' },
  greenText: { color: '#22c55e' },
  balanceLabel: { fontSize: 13, fontWeight: '500', color: COLORS.inkMuted },
  deleteButton: {
    backgroundColor: '#ef4444',
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
