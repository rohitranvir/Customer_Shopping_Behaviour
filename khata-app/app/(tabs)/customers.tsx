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
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { COLORS } from '../../utils/constants';
import CustomerCard from '../../components/CustomerCard';
import { Customer } from '../../db/repositories/customerRepository';
import { useThemeStore } from '../../store/useThemeStore';
import * as Haptics from 'expo-haptics';
import { CustomerListSkeleton } from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { getThemeColors } from '../../utils/theme';
import { Toast } from '../../components/Toast';

type FilterTab = 'All' | 'To Receive' | 'To Pay' | 'Overdue';
const TABS: FilterTab[] = ['All', 'To Receive', 'To Pay', 'Overdue'];

export default function CustomersScreen() {
  const router = useRouter();
  const { business } = useBusinessStore();
  const { isDark } = useThemeStore();
  const D = getThemeColors(isDark);
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
  const [segmentType, setSegmentType] = useState<'CUSTOMER' | 'SUPPLIER'>('CUSTOMER');
  const [isModalVisible, setModalVisible] = useState(false);

  // Add Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [isUdharGiven, setIsUdharGiven] = useState(true); // true = credit (they owe me), false = debit (i owe them)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load on mount and every time business changes
  useEffect(() => {
    if (business?.id) {
      loadCustomers(business.id);
    }
  }, [business?.id]);

  // Reload every time this tab is focused (fixes skeleton-forever bug)
  useFocusEffect(
    useCallback(() => {
      if (business?.id) {
        loadCustomers(business.id);
      }
    }, [business?.id])
  );

  const debouncedSearch = useDebounce((q: string) => {
    if (business) searchAndFilter(business.id, q);
  }, 300);

  const handleSearchChange = (q: string) => {
    setLocalQuery(q);
    debouncedSearch(q);
  };

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
      // Filter by Customer/Supplier toggle first
      if ((c.type || 'CUSTOMER') !== segmentType) return false;
      const bal = c.balance ?? c.opening_balance;
      if (filterTab === 'To Receive') return bal > 0;
      if (filterTab === 'To Pay') return bal < 0;
      if (filterTab === 'Overdue') return bal > 0 && c.is_overdue;
      return true;
    });
  }, [customers, filterTab, segmentType]);

  return (
    <View style={[styles.container, dk && { backgroundColor: D.bg }]}>
      {/* App Header (Screenshot 2 style) */}
      <View style={[styles.appHeader, dk && { backgroundColor: D.surface, borderBottomColor: D.border }]}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>R</Text>
          <View style={styles.avatarBadge} />
        </View>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity 
            style={styles.headerIconBtn}
            onPress={async () => {
              try {
                await Share.share({
                  message: 'Manage your daily ledger, Udhar, and payments easily with Khata Book! Download now.',
                });
              } catch (error: any) {
                Alert.alert('Error', error.message);
              }
            }}
          >
            <MaterialCommunityIcons name="share-variant" size={22} color={dk ? D.text : COLORS.ink} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIconBtn}
            onPress={() => Toast.info('No new notifications')}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={dk ? D.text : COLORS.ink} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setLocalQuery(' ')}>
            <MaterialCommunityIcons name="magnify" size={24} color={dk ? D.text : COLORS.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Optional Search Bar - shows if search is activated */}
      {localQuery !== '' && (
        <View style={[styles.searchBarContainer, dk && { backgroundColor: D.surface }]}>
          <View style={[styles.searchBar, dk && { backgroundColor: D.input, borderColor: D.border }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={dk ? D.muted : COLORS.inkMuted} />
            <TextInput
              style={[styles.searchInput, dk && { color: D.text }]}
              placeholder="Search by Name or Phone"
              value={localQuery.trim()}
              onChangeText={handleSearchChange}
              placeholderTextColor={dk ? D.muted : COLORS.inkLight}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setLocalQuery(''); debouncedSearch(''); }}>
              <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.inkLight} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Segmented Control (Customer | Supplier) */}
      <View style={[styles.segmentedWrap, dk && { backgroundColor: D.surface }]}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, segmentType === 'CUSTOMER' && styles.segmentActive]}
            onPress={() => setSegmentType('CUSTOMER')}
          >
            <Text style={[styles.segmentText, segmentType === 'CUSTOMER' && styles.segmentTextActive]}>Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, segmentType === 'SUPPLIER' && styles.segmentActive]}
            onPress={() => setSegmentType('SUPPLIER')}
          >
            <Text style={[styles.segmentText, segmentType === 'SUPPLIER' && styles.segmentTextActive]}>Supplier</Text>
          </TouchableOpacity>
        </View>
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
          // Go to existing Add Customer screen which now has Contacts Integration
          router.push('/customer/add');
        }}
      >
        <MaterialCommunityIcons name="account-plus" size={24} color={COLORS.ink} />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fbbf24', // yellow background
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  headerAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  avatarBadge: {
    position: 'absolute', right: -2, bottom: -2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#fff'
  },
  headerRightIcons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerIconBtn: { position: 'relative', backgroundColor: '#e2e8f0', padding: 8, borderRadius: 20 },
  notificationBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#ef4444', width: 16, height: 16, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff'
  },
  notificationBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  
  searchBarContainer: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#334155' },

  segmentedWrap: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  segmentedControl: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 24, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20 },
  segmentActive: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#10b981', elevation: 1 },
  segmentText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  segmentTextActive: { color: '#0f172a' },
  
  listContainer: { paddingBottom: 100 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.ink, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: COLORS.inkMuted, marginTop: 8, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
