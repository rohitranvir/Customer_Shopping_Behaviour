import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { COLORS } from '../../utils/constants';
import CustomerCard from '../../components/CustomerCard';
import { Customer } from '../../db/queries';
import { useThemeStore } from '../../store/useThemeStore';
import * as Haptics from 'expo-haptics';
import { CustomerListSkeleton } from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import { Toast } from '../../components/Toast';

const D = {
  bg: '#0f172a', surface: '#1e293b', border: '#334155',
  text: '#f1f5f9', muted: '#94a3b8', input: '#0f172a',
};

type FilterTab = 'All' | 'To Receive' | 'To Pay' | 'Overdue';
const TABS: FilterTab[] = ['All', 'To Receive', 'To Pay', 'Overdue'];

export default function CustomersScreen() {
  const router = useRouter();
  const { business } = useBusinessStore();
  const { isDark } = useThemeStore();
  const dk = isDark;
  const { 
    customers, 
    isLoading, 
    loadCustomers, 
    searchAndFilter, 
    searchQuery, 
    removeCustomer,
    addCustomer 
  } = useCustomerStore();

  const [localQuery, setLocalQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('All');
  const [isModalVisible, setModalVisible] = useState(false);

  // Add Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [isUdharGiven, setIsUdharGiven] = useState(true); // true = credit (they owe me), false = debit (i owe them)
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (business) {
      loadCustomers(business.id);
    }
  }, [business?.id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (business) searchAndFilter(business.id, localQuery);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [localQuery, business?.id]);

  const onRefresh = useCallback(() => {
    if (business) loadCustomers(business.id);
  }, [business?.id]);

  const handleDelete = (customer: Customer) => {
    Alert.alert(
      '🗑 Delete Customer',
      `Are you sure you want to delete "${customer.name}"? All their transactions will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await removeCustomer(customer.id);
              Toast.success(`"${customer.name}" deleted.`);
            } catch {
              Toast.error('Failed to delete customer.');
            }
          },
        },
      ]
    );
  };

  const handleAddSubmit = async () => {
    if (!newName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.error('Customer name is required');
      return;
    }
    if (!business) return;

    setIsSubmitting(true);
    let initialBal = parseFloat(newAmount) || 0;
    if (!isUdharGiven && initialBal > 0) initialBal = -initialBal;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const newId = await addCustomer(business.id, newName.trim(), newPhone.trim(), initialBal);
      setModalVisible(false);
      setNewName(''); setNewPhone(''); setNewAmount(''); setIsUdharGiven(true);
      Toast.success(`"${newName}" added successfully!`);
      router.push(`/customer/${newId}`);
    } catch {
      Toast.error('Failed to add customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = useMemo(() => {
    return customers.filter(c => {
      const bal = c.balance ?? c.opening_balance;
      if (filterTab === 'To Receive') return bal > 0;
      if (filterTab === 'To Pay') return bal < 0;
      if (filterTab === 'Overdue') return bal > 0 && c.is_overdue;
      return true;
    });
  }, [customers, filterTab]);

  return (
    <View style={[styles.container, dk && { backgroundColor: D.bg }]}>
      {/* Search Header */}
      <View style={[styles.header, dk && { backgroundColor: D.surface, borderBottomColor: D.border }]}>
        <View style={[styles.searchBar, dk && { backgroundColor: D.input, borderColor: D.border }]}>
          <MaterialCommunityIcons name="magnify" size={24} color={dk ? D.muted : COLORS.inkMuted} />
          <TextInput
            style={[styles.searchInput, dk && { color: D.text }]}
            placeholder="Search by Name or Phone"
            value={localQuery}
            onChangeText={setLocalQuery}
            placeholderTextColor={dk ? D.muted : COLORS.inkLight}
          />
          {localQuery.length > 0 && (
            <TouchableOpacity onPress={() => setLocalQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.inkLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {TABS.map(tab => {
            const isActive = filterTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, isActive && styles.tabActive, dk && !isActive && { backgroundColor: D.surface, borderColor: D.border }]}
                onPress={() => setFilterTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive, dk && !isActive && { color: D.muted }]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {isLoading ? (
        <CustomerListSkeleton />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          renderItem={({ item }) => (
            <CustomerCard 
              customer={item} 
              onPress={(id) => router.push(`/customer/${id}`)}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="account-group-outline"
              title="No Customers Yet"
              subtitle="Tap the + button below to add your first customer and start tracking."
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.9}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setModalVisible(true);
        }}
      >
        <MaterialCommunityIcons name="account-plus" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Add Customer Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContent, dk && { backgroundColor: D.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, dk && { color: D.text }]}>Add New Customer</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={isSubmitting}>
                <MaterialCommunityIcons name="close" size={24} color={dk ? D.muted : COLORS.ink} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, dk && { color: D.muted }]}>Customer Name *</Text>
              <TextInput
                style={[styles.input, dk && { backgroundColor: D.input, borderColor: D.border, color: D.text }]}
                placeholder="Enter name"
                placeholderTextColor={dk ? D.muted : COLORS.inkLight}
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, dk && { color: D.muted }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, dk && { backgroundColor: D.input, borderColor: D.border, color: D.text }]}
                placeholder="Enter 10-digit number"
                placeholderTextColor={dk ? D.muted : COLORS.inkLight}
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Opening Balance (Optional)</Text>
              <View style={styles.balanceInputWrap}>
                <Text style={styles.rupeeSymbol}>₹</Text>
                <TextInput
                  style={styles.balanceInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={newAmount}
                  onChangeText={setNewAmount}
                />
              </View>
            </View>

            {/* Toggle Balance Type */}
            {parseFloat(newAmount) > 0 && (
              <View style={styles.toggleRow}>
                <TouchableOpacity 
                  style={[styles.toggleBtn, isUdharGiven && styles.toggleBtnActiveRed]}
                  onPress={() => setIsUdharGiven(true)}
                >
                  <Text style={[styles.toggleText, isUdharGiven && styles.toggleTextActiveRed]}>They Owe You</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleBtn, !isUdharGiven && styles.toggleBtnActiveGreen]}
                  onPress={() => setIsUdharGiven(false)}
                >
                  <Text style={[styles.toggleText, !isUdharGiven && styles.toggleTextActiveGreen]}>You Owe Them</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleAddSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitBtnText}>{isSubmitting ? 'Adding...' : 'Save Customer'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 16,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: COLORS.ink },
  tabsContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.inkMuted },
  tabTextActive: { color: '#fff' },
  listContainer: { paddingBottom: 100 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.ink, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: COLORS.inkMuted, marginTop: 8, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.ink },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.inkMuted, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
    color: COLORS.ink,
  },
  balanceInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
  },
  rupeeSymbol: { fontSize: 18, color: COLORS.ink, marginRight: 8, fontWeight: '600' },
  balanceInput: { flex: 1, fontSize: 18, color: COLORS.ink, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  toggleBtnActiveRed: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
  toggleBtnActiveGreen: { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
  toggleText: { fontSize: 14, fontWeight: '600', color: COLORS.inkMuted },
  toggleTextActiveRed: { color: '#ef4444' },
  toggleTextActiveGreen: { color: '#22c55e' },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
