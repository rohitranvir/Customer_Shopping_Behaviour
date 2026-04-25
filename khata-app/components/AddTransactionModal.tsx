import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { todayISO } from '../utils/formatters';
import { Transaction } from '../db/queries';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    type: 'CREDIT' | 'DEBIT',
    amount: number,
    note: string,
    date: string,
    dueDate?: string,
    txId?: number
  ) => Promise<void>;
  defaultType: 'CREDIT' | 'DEBIT';
  initialTransaction?: Transaction | null;
  customerName: string;
}

export default function AddTransactionModal({
  visible,
  onClose,
  onSubmit,
  defaultType,
  initialTransaction,
  customerName,
}: AddTransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const amountRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      if (initialTransaction) {
        setAmount(initialTransaction.amount.toString());
        setNote(initialTransaction.note ?? '');
        setDate(initialTransaction.date);
        setDueDate(initialTransaction.due_date ?? '');
      } else {
        setAmount('');
        setNote('');
        setDate(todayISO());
        setDueDate('');
      }
      setTimeout(() => amountRef.current?.focus(), 100);
    }
  }, [visible, initialTransaction]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }
    setLoading(true);
    try {
      // Use defaultType for new and initialTransaction.type for edits
      const txType = initialTransaction ? initialTransaction.type : defaultType;
      await onSubmit(txType, numAmount, note.trim(), date, dueDate || undefined, initialTransaction?.id);
      handleClose();
    } catch {
      Alert.alert('Error', 'Could not save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isCredit = (initialTransaction ? initialTransaction.type : defaultType) === 'CREDIT';
  const color = isCredit ? '#ef4444' : '#22c55e'; // Red for Udhar(Credit), Green for Payment(Debit)

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.subtitle}>{customerName}</Text>
            <View style={styles.header}>
              <View style={[styles.typeBadge, { backgroundColor: isCredit ? '#fee2e2' : '#dcfce7' }]}>
                 <Text style={[styles.typeText, { color }]}>
                   {initialTransaction ? 'Edit ' : 'Add '}
                   {isCredit ? 'Udhar Diya' : 'Payment Liya'}
                 </Text>
              </View>
            </View>

            {/* Amount */}
            <View style={styles.amountContainer}>
              <Text style={[styles.rupeeSign, { color }]}>₹</Text>
              <TextInput
                ref={amountRef}
                style={[styles.amountInput, { color }]}
                placeholder="0"
                placeholderTextColor={COLORS.inkLight}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>

            {/* Note */}
            <View style={styles.field}>
              <MaterialCommunityIcons name="text-box-outline" size={20} color={COLORS.inkMuted} />
              <TextInput
                style={styles.input}
                placeholder="Note / Item details"
                placeholderTextColor={COLORS.inkLight}
                value={note}
                onChangeText={setNote}
              />
            </View>

            {/* Date */}
            <View style={styles.field}>
              <MaterialCommunityIcons name="calendar-today" size={20} color={COLORS.inkMuted} />
              <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor={COLORS.inkLight}
                value={date}
                onChangeText={setDate}
              />
            </View>

            {/* Due Date - Only highly relevant for Credit (Udhar) */}
            {isCredit && (
              <View style={styles.field}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.inkMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Optional Due Date (YYYY-MM-DD)"
                  placeholderTextColor={COLORS.inkLight}
                  value={dueDate}
                  onChangeText={setDueDate}
                />
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: color }, loading && styles.disabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.inkMuted,
    marginBottom: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  rupeeSign: {
    fontSize: 40,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    minWidth: 100,
    paddingVertical: 0,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 54,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.ink,
  },
  submitBtn: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabled: { opacity: 0.7 },
  submitText: { fontSize: 18, fontWeight: '700', color: '#fff' },
});
