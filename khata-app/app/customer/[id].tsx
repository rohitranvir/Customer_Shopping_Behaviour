import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { Transaction } from '../../db/queries';
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

const D = { bg: '#0f172a', surface: '#1e293b', border: '#334155', text: '#f1f5f9', muted: '#94a3b8' };

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
        await editTransaction(txId, customerId, amount, note, date, dueDate);
        Toast.success('Transaction updated');
      } else {
        await addTransaction(customerId, type, amount, note, date, dueDate);
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
                  await removeTransaction(tx.id, customerId);
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
    if (selectedCustomer?.phone) {
      Linking.openURL(`tel:${selectedCustomer.phone}`);
    } else {
      Alert.alert('No Phone', 'No phone number saved for this customer.');
    }
  };

  const handleSendReminder = () => {
    if (!selectedCustomer?.phone) {
      Alert.alert('No Phone', 'No phone number saved for this customer.');
      return;
    }
    const balanceAmt = selectedCustomer.balance ?? selectedCustomer.opening_balance;
    const formattedPhone = selectedCustomer.phone.replace(/[^0-9]/g, '');
    const amount = formatINR(Math.abs(balanceAmt));
    const msg = `Hello ${selectedCustomer.name}, your outstanding balance is ${amount} at ${business?.name}. Please clear when possible. Thank you!`;
    const url = `whatsapp://send?phone=91${formattedPhone}&text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).then(() => {
      Toast.success('Opening WhatsApp...');
    }).catch(() => {
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
          <View style={[styles.avatar, { backgroundColor: getAvatarColor(selectedCustomer.name) }]}>
            <Text style={styles.avatarText}>{getInitials(selectedCustomer.name)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, dk && { color: D.text }]}>{selectedCustomer.name}</Text>
            {!!selectedCustomer.phone && (
              <Text style={[styles.phone, dk && { color: D.muted }]}>{selectedCustomer.phone}</Text>
            )}
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionIcon} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleCall();
          }}>
            <MaterialCommunityIcons name="phone" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Massive Balance Area */}
      <View style={styles.balanceArea}>
        <Text style={[styles.bigBalance, isUdhar ? styles.textRed : styles.textGreen]}>
          {formatINR(Math.abs(balance))}
        </Text>
        <Text style={[styles.balanceLabel, dk && { color: D.muted }]}>
          {isUdhar ? '🔴 You will receive (Udhar)' : '🟢 You will pay (Advance)'}
        </Text>
      </View>

      {/* CTA Buttons */}
      <View style={styles.ctaRow}>
        <TouchableOpacity 
          style={styles.btnRed}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setEditingTx(null);
            setModalType('CREDIT');
            setModalVisible(true);
          }}
        >
          <Text style={styles.btnText}>Udhar Diya</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.btnGreen}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setEditingTx(null);
            setModalType('DEBIT');
            setModalVisible(true);
          }}
        >
          <Text style={styles.btnText}>Payment Liya</Text>
        </TouchableOpacity>
      </View>

      {/* Utilities Row - WhatsApp Reminder & PDF Statement */}
      <View style={styles.utilitiesRow}>
         <TouchableOpacity style={[styles.utilityBtn, dk && { backgroundColor: D.surface }]} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleSendReminder();
         }}>
            <MaterialCommunityIcons name="whatsapp" size={20} color={dk ? D.text : "#fff"} />
            <Text style={[styles.utilityBtnText, dk && { color: D.text }]}>Send Reminder</Text>
         </TouchableOpacity>
         <TouchableOpacity style={[styles.utilityBtn, dk && { backgroundColor: D.surface }]} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setStatementModalVisible(true);
         }}>
            {exportLoading ? (
               <ActivityIndicator size="small" color={dk ? D.text : "#fff"} />
            ) : (
               <MaterialCommunityIcons name="file-pdf-box" size={20} color={dk ? D.text : "#fff"} />
            )}
            <Text style={[styles.utilityBtnText, dk && { color: D.text }]}>{exportLoading ? 'Generating...' : 'Statement'}</Text>
         </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <View style={[styles.listContainer, dk && { backgroundColor: D.bg }]}>
        <FlatList
          data={txWithBalance}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          maxToRenderPerBatch={15}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
          ListHeaderComponent={
             <Text style={[styles.historyTitle, dk && { color: D.text }]}>Ledger History</Text>
          }
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
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.ink },
  phone: { fontSize: 13, color: COLORS.inkMuted, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 16 },
  actionIcon: { padding: 4 },
  balanceArea: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigBalance: { fontSize: 44, fontWeight: '800' },
  textRed: { color: '#ef4444' },
  textGreen: { color: '#22c55e' },
  balanceLabel: { fontSize: 14, fontWeight: '600', color: COLORS.inkMuted, marginTop: 4 },
  ctaRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  btnRed: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  btnGreen: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  btnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  utilitiesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  utilityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  utilityBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: { flex: 1, backgroundColor: COLORS.surface },
  listContent: { paddingBottom: 60 },
  historyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.inkMuted, margin: 16 },
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 12, fontSize: 15, color: COLORS.inkMuted },
});
