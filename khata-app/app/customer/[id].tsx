import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { Transaction } from '../../db/repositories/transactionRepository';
import TransactionCard from '../../components/TransactionCard';
import AddTransactionModal from '../../components/AddTransactionModal';
import StatementModal from '../../components/StatementModal';
import { exportLedgerPDF } from '../../utils/pdf';
import { formatINR, getInitials, getAvatarColor } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../../store/useThemeStore';
import { Toast } from '../../components/Toast';
import EmptyState from '../../components/EmptyState';
import { TransactionListSkeleton } from '../../components/SkeletonLoader';

import { getThemeColors } from '../../utils/theme';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const customerId = parseInt(id ?? '0', 10);

  const { business } = useBusinessStore();
  const {
    selectedCustomer,
    transactions,
    isLoading,
    selectCustomer,
    loadTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useCustomerStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [statementModalVisible, setStatementModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const { isDark } = useThemeStore();
  const D = getThemeColors(isDark);
  const dk = isDark;

  useEffect(() => {
    if (customerId) {
      selectCustomer(customerId);
      loadTransactions(customerId);
    }
  }, [customerId]);

  useEffect(() => {
    if (selectedCustomer) {
      navigation.setOptions({ title: selectedCustomer.name });
    }
  }, [selectedCustomer?.name, navigation]);

  const txWithBalance = useMemo(() => {
    let running = selectedCustomer?.opening_balance ?? 0;
    // Transactions are ordered newest first initially.
    // Calculate running balance by playing them forward sequentially.
    const reversed = [...transactions].reverse();
    const mapped = reversed.map((tx) => {
      // CREDIT = Udhar given (+ balance), DEBIT = Payment taken (- balance)
      if (tx.type === 'CREDIT') {
        running += tx.amount;
      } else {
        running -= tx.amount;
      }
      return { ...tx, runningBalance: running };
    });
    return mapped.reverse();
  }, [transactions, selectedCustomer?.opening_balance]);

  const sectionedData = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    txWithBalance.forEach(tx => {
      const dateKey = new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(tx);
    });
    
    return Object.keys(grouped).map(date => ({
      title: date,
      data: grouped[date]
    }));
  }, [txWithBalance]);

  const handleTransactionSubmit = async (
    type: 'CREDIT' | 'DEBIT',
    amount: number,
    note: string,
    date: string,
    dueDate?: string,
    txId?: number
  ) => {
    try {
      if (txId) {
        await editTransaction(business?.id ?? 0, txId, customerId, amount, note, date, dueDate);
        Toast.success('Transaction updated');
      } else {
        await addTransaction(business?.id ?? 0, customerId, type, amount, note, date, dueDate);
        Toast.success('Transaction added');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Toast.error('Operation failed');
    }
  };

  const handleLongPress = (tx: Transaction) => {
    Alert.alert(
      'Transaction Actions',
      'Choose an action for this transaction',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Edit', 
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setEditingTx(tx);
            setModalType(tx.type);
            setModalVisible(true);
          }
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Confirm Delete', 'Are you sure you want to delete this transaction?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: async () => {
                try {
                  await removeTransaction(business?.id ?? 0, tx.id, customerId);
                  Toast.success('Transaction deleted');
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch {
                  Toast.error('Delete failed');
                }
              } }
            ]);
          },
        },
      ]
    );
  };

  const handleCall = () => {
    const phone = selectedCustomer?.phone || '9158000676';
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Error', 'Cannot open phone dialer.')
    );
  };

  const handleSMS = () => {
    const phone = selectedCustomer?.phone || '9158000676';
    const balanceAmt = selectedCustomer?.balance ?? selectedCustomer?.opening_balance ?? 0;
    const amount = formatINR(Math.abs(balanceAmt));
    const msg = `Hello ${selectedCustomer?.name}, your outstanding balance is ${amount} at ${business?.name}. Please clear when possible. Thank you!`;
    Linking.openURL(`sms:${phone}?body=${encodeURIComponent(msg)}`).catch(() =>
      Alert.alert('Error', 'Cannot open SMS app.')
    );
  };

  const handleSendReminder = () => {
    const rawPhone = selectedCustomer?.phone || '9158000676';
    const balanceAmt = selectedCustomer?.balance ?? selectedCustomer?.opening_balance ?? 0;
    const formattedPhone = rawPhone.replace(/[^0-9]/g, '');
    const amount = formatINR(Math.abs(balanceAmt));
    const msg = `Hello ${selectedCustomer?.name}, your outstanding balance is ${amount} at ${business?.name}. Please clear when possible. Thank you!`;
    const url = `whatsapp://send?phone=91${formattedPhone}&text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {
      Toast.error('WhatsApp is not installed.');
    });
  };

  const handleDownloadStatement = async (startDate?: string, endDate?: string) => {
    if (!selectedCustomer || !business) return;
    setStatementModalVisible(false);
    setExportLoading(true);
    try {
      // Small timeout to allow Modal to close on Android nicely before UI thread blocks
      setTimeout(async () => {
        try {
          await exportLedgerPDF(business.name, selectedCustomer, transactions, startDate, endDate);
          Toast.success('Statement downloaded!');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } finally {
          setExportLoading(false);
        }
      }, 150);
    } catch {
      setExportLoading(false);
      Toast.error('Could not generate PDF. Please try again.');
    }
  };

  if (isLoading && !selectedCustomer) {
    return (
      <View style={[styles.loading, dk && { backgroundColor: D.bg }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!selectedCustomer) {
    return (
      <View style={styles.loading}>
        <Text>Customer not found.</Text>
      </View>
    );
  }

  const balance = selectedCustomer.balance ?? selectedCustomer.opening_balance;
  const isUdhar = balance >= 0;

  return (
    <View style={[styles.container, dk && { backgroundColor: D.bg }]}>
      {/* Header Info */}
      <View style={[styles.header, dk && { backgroundColor: D.surface, borderBottomColor: D.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
             <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.ink} />
          </TouchableOpacity>
          <View style={[styles.avatar, { backgroundColor: getAvatarColor(selectedCustomer.name) }]}>
            <Text style={styles.avatarText}>{getInitials(selectedCustomer.name)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, dk && { color: D.text }]}>{selectedCustomer.name}</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionIcon} onPress={() => setStatementModalVisible(true)}>
            <MaterialCommunityIcons name="file-document-outline" size={24} color={COLORS.ink} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon} onPress={handleCall}>
            <MaterialCommunityIcons name="phone-outline" size={24} color={COLORS.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarIcons}>
          <TouchableOpacity style={styles.tbIconBtn} onPress={() => setStatementModalVisible(true)}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color={COLORS.primary} />
            <Text style={styles.tbIconLabel}>Statement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tbIconBtn} onPress={handleSMS}>
            <MaterialCommunityIcons name="message-text-outline" size={20} color={COLORS.primary} />
            <Text style={styles.tbIconLabel}>SMS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tbIconBtn} onPress={handleCall}>
            <MaterialCommunityIcons name="phone-outline" size={20} color={COLORS.primary} />
            <Text style={styles.tbIconLabel}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tbIconBtn} onPress={handleSendReminder}>
            <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
            <Text style={styles.tbIconLabel}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryLabel}>Balance {isUdhar ? 'Due' : 'Advance'}</Text>
        <View style={styles.summaryAmountWrap}>
           <Text style={[styles.summaryAmount, isUdhar ? styles.textRed : styles.textGreen]}>
             {formatINR(Math.abs(balance))}
           </Text>
           <MaterialCommunityIcons name="chevron-right" size={20} color={isUdhar ? '#ef4444' : '#22c55e'} />
        </View>
      </View>

      {/* Transaction List */}
      <View style={[styles.listContainer, dk && { backgroundColor: D.bg }]}>
        <SectionList
          sections={sectionedData}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.dateHeaderWrap}>
              <View style={styles.datePill}>
                <Text style={styles.datePillText}>{title}</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <TransactionCard 
              transaction={item} 
              runningBalance={item.runningBalance}
              onLongPress={handleLongPress}
            />
          )}
          ListEmptyComponent={
            isLoading ? (
              <TransactionListSkeleton />
            ) : (
              <EmptyState
                icon="receipt-text-outline"
                title="No Entries Yet"
                subtitle="Use the buttons above to record your first transaction."
              />
            )
          }
        />
      </View>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.actionBtnReceived}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setEditingTx(null);
            setModalType('DEBIT');
            setModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="arrow-down" size={20} color="#22c55e" />
          <Text style={styles.actionBtnTextReceived}>Received</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtnGiven}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setEditingTx(null);
            setModalType('CREDIT');
            setModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="arrow-up" size={20} color="#ef4444" />
          <Text style={styles.actionBtnTextGiven}>Given</Text>
        </TouchableOpacity>
      </View>

      {/* Reusable Modal */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleTransactionSubmit}
        defaultType={modalType}
        initialTransaction={editingTx}
        customerName={selectedCustomer.name}
      />

      <StatementModal
        visible={statementModalVisible}
        onClose={() => setStatementModalVisible(false)}
        onDownload={handleDownloadStatement}
        loading={exportLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: { marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: COLORS.ink },
  viewProfileText: { fontSize: 13, color: '#10b981', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 16 },
  actionIcon: { padding: 4 },
  
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginHorizontal: 8,
    marginTop: 8,
  },
  toolbarIcons: { flexDirection: 'row', gap: 8, flex: 1, justifyContent: 'space-around' },
  tbIconBtn: { alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6 },
  tbIconLabel: { fontSize: 11, fontWeight: '600', color: '#475569' },
  tbIcon: { backgroundColor: '#cbd5e1', padding: 6, borderRadius: 16, overflow: 'hidden' },

  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: { fontSize: 15, fontWeight: '600', color: '#475569' },
  summaryAmountWrap: { flexDirection: 'row', alignItems: 'center' },
  summaryAmount: { fontSize: 16, fontWeight: '700', marginRight: 4 },
  textRed: { color: '#ef4444' },
  textGreen: { color: '#22c55e' },

  listContainer: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  listContent: { paddingBottom: 100 },
  
  dateHeaderWrap: { alignItems: 'center', marginVertical: 12 },
  datePill: { backgroundColor: '#94a3b8', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  datePillText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  actionBtnReceived: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 24,
    paddingVertical: 12,
    gap: 8,
  },
  actionBtnGiven: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 24,
    paddingVertical: 12,
    gap: 8,
  },
  actionBtnTextReceived: { fontSize: 16, fontWeight: '700', color: '#22c55e' },
  actionBtnTextGiven: { fontSize: 16, fontWeight: '700', color: '#ef4444' },
});
