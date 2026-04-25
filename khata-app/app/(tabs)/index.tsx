import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { getInitials, getAvatarColor, formatINR, formatDate } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';
import { useThemeStore } from '../../store/useThemeStore';
import * as Haptics from 'expo-haptics';
import { Toast } from '../../components/Toast';
import EmptyState from '../../components/EmptyState';
import { TransactionListSkeleton } from '../../components/SkeletonLoader';

// ── Dark style tokens ─────────────────────────────────────────────────────────
const D = {
  bg:        '#0f172a',
  surface:   '#1e293b',
  border:    '#334155',
  text:      '#f1f5f9',
  muted:     '#94a3b8',
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { business, summary, recentTransactions, overdueCustomers, loadBusiness, refreshSummary } = useBusinessStore();
  const { loadCustomers } = useCustomerStore();
  const { isDark } = useThemeStore();
  const dk = isDark;

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (business) {
      loadCustomers(business.id);
    }
  }, [business?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (user) await loadBusiness(user.id);
      if (business) {
        await loadCustomers(business.id);
        await refreshSummary();
      }
    } catch {
      Toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  }, [user?.id, business?.id]);

  const shopName = business?.name ?? user?.name ?? 'My Shop';
  const ownerName = user?.name ?? 'Owner';
  const avatarColor = getAvatarColor(ownerName);
  const initials = getInitials(ownerName);

  return (
    <View style={[styles.container, dk && { backgroundColor: D.bg }]}>
      {/* Header */}
      <View style={[styles.header, dk && { backgroundColor: D.surface, borderBottomColor: D.border }]}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="storefront" size={24} color={COLORS.primary} />
          <Text style={[styles.shopName, dk && { color: D.text }]} numberOfLines={1}>{shopName}</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Summary Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryScroll}>
          <View style={[styles.summaryCard, dk ? { backgroundColor: '#1e3a5f', borderColor: '#1d4ed8' } : styles.redCard]}>
             <MaterialCommunityIcons name="arrow-down-circle" size={24} color="#ef4444" style={styles.cardIcon} />
             <Text style={[styles.cardLabel, { color: '#ef4444' }]}>Total Udhar</Text>
             <Text style={[styles.cardSub, dk && { color: D.muted }]}>(To Receive)</Text>
             <Text style={[styles.cardAmount, dk && { color: D.text }]}>{formatINR(summary?.total_credit || 0)}</Text>
          </View>
          <View style={[styles.summaryCard, dk ? { backgroundColor: '#14532d', borderColor: '#16a34a' } : styles.greenCard]}>
             <MaterialCommunityIcons name="arrow-up-circle" size={24} color="#22c55e" style={styles.cardIcon} />
             <Text style={[styles.cardLabel, { color: '#22c55e' }]}>Total Advance</Text>
             <Text style={[styles.cardSub, dk && { color: D.muted }]}>(You Owe)</Text>
             <Text style={[styles.cardAmount, dk && { color: D.text }]}>{formatINR(summary?.total_debit || 0)}</Text>
          </View>
          <View style={[styles.summaryCard, dk ? { backgroundColor: '#1e3a8a', borderColor: '#2563eb' } : styles.blueCard]}>
             <MaterialCommunityIcons name="account-group" size={24} color="#3b82f6" style={styles.cardIcon} />
             <Text style={[styles.cardLabel, { color: '#3b82f6' }]}>Customers</Text>
             <Text style={[styles.cardSub, dk && { color: D.muted }]}>(Total)</Text>
             <Text style={[styles.cardAmount, dk && { color: D.text }]}>{summary?.total_customers || 0}</Text>
          </View>
        </ScrollView>

        {/* Quick Action */}
        <TouchableOpacity style={styles.addBtn} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/customer/add');
        }}>
          <MaterialCommunityIcons name="account-plus" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Add Customer</Text>
        </TouchableOpacity>

        {/* Overdue Section */}
        {overdueCustomers && overdueCustomers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
               <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#ef4444" />
               <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Overdue Customers</Text>
            </View>
            <View style={styles.overdueList}>
              {overdueCustomers.map(customer => (
                <TouchableOpacity 
                  key={customer.id} 
                  style={[styles.overdueCard, dk && { backgroundColor: '#4c1d95', borderColor: '#7c3aed' }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push(`/customer/${customer.id}`);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.overdueInfo}>
                    <Text style={[styles.overdueName, dk && { color: '#f5d0fe' }]}>{customer.name}</Text>
                    <Text style={[styles.overdueSub, dk && { color: '#f0abfc' }]}>Pending payment</Text>
                  </View>
                  <Text style={[styles.overdueAmount, dk && { color: '#f5d0fe' }]}>{formatINR(customer.balance || 0)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitleDark, dk && { color: D.text }]}>Recent Transactions</Text>
          {refreshing && (!recentTransactions || recentTransactions.length === 0) ? (
            <View style={{ marginTop: 12 }}>
              <TransactionListSkeleton />
            </View>
          ) : recentTransactions && recentTransactions.length > 0 ? (
            <View style={styles.txList}>
              {recentTransactions.map(tx => {
                const isUdhar = tx.type === 'CREDIT'; // CREDIT in our logic means we gave Udhar (to receive)
                return (
                  <TouchableOpacity 
                    key={tx.id} 
                    style={[styles.txCard, dk && { backgroundColor: D.surface, borderColor: D.border }]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      router.push(`/customer/${tx.customer_id}`);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.txLeft}>
                      <View style={[styles.txIconWrap, isUdhar ? styles.txIconRed : styles.txIconGreen]}>
                        <MaterialCommunityIcons 
                          name={isUdhar ? 'arrow-down' : 'arrow-up'} 
                          size={18} 
                          color={isUdhar ? '#ef4444' : '#22c55e'} 
                        />
                      </View>
                      <View>
                        <Text style={[styles.txCustomer, dk && { color: D.text }]}>{tx.customer_name}</Text>
                        <Text style={[styles.txDate, dk && { color: D.muted }]}>{formatDate(tx.date)}</Text>
                      </View>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={[styles.txAmount, isUdhar ? styles.txtAmountRed : styles.txtAmountGreen]}>
                        {formatINR(tx.amount)}
                      </Text>
                      <Text style={[styles.txType, isUdhar ? styles.txTypeRed : styles.txTypeGreen]}>
                        {isUdhar ? 'Udhar Given' : 'Payment/Advance'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
             <EmptyState
               icon="receipt-text-outline"
               title="No recent transactions"
             />
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  shopName: { fontSize: 20, fontWeight: '800', color: COLORS.ink, flexShrink: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  content: { paddingBottom: 32 },
  summaryScroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, gap: 12 },
  summaryCard: {
    width: 140,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    elevation: 1,
  },
  redCard: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  greenCard: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  blueCard: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  cardIcon: { marginBottom: 8 },
  cardLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  cardSub: { fontSize: 11, color: COLORS.inkMuted, marginBottom: 12 },
  cardAmount: { fontSize: 18, fontWeight: '800', color: COLORS.ink },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionTitleDark: { fontSize: 18, fontWeight: '800', color: COLORS.ink, marginBottom: 12 },
  overdueList: { gap: 8 },
  overdueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 12,
    padding: 14,
  },
  overdueInfo: { flex: 1 },
  overdueName: { fontSize: 15, fontWeight: '700', color: '#9f1239' },
  overdueSub: { fontSize: 12, color: '#e11d48', marginTop: 2 },
  overdueAmount: { fontSize: 16, fontWeight: '800', color: '#e11d48' },
  txList: { gap: 8 },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  txIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  txIconRed: { backgroundColor: '#fee2e2' },
  txIconGreen: { backgroundColor: '#dcfce7' },
  txCustomer: { fontSize: 15, fontWeight: '700', color: COLORS.ink, marginBottom: 2 },
  txDate: { fontSize: 12, color: COLORS.inkMuted },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 15, fontWeight: '800' },
  txtAmountRed: { color: '#ef4444' },
  txtAmountGreen: { color: '#22c55e' },
  txType: { fontSize: 11, fontWeight: '600', marginTop: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  txTypeRed: { backgroundColor: '#fee2e2', color: '#ef4444' },
  txTypeGreen: { backgroundColor: '#dcfce7', color: '#22c55e' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  emptyText: { fontSize: 14, color: COLORS.inkMuted, marginTop: 8 },
});
