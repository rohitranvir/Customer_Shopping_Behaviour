import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { COLORS } from '../../utils/constants';

export default function AddCustomerScreen() {
  const router = useRouter();
  const { business } = useBusinessStore();
  const { addCustomer } = useCustomerStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [balanceType, setBalanceType] = useState<'credit' | 'debit'>('credit');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter the customer name.');
      return;
    }
    if (!business) {
      Alert.alert('Error', 'Business not found. Please restart the app.');
      return;
    }

    setLoading(true);
    try {
      const balRaw = parseFloat(openingBalance || '0');
      const balance = balanceType === 'debit' ? -Math.abs(balRaw) : Math.abs(balRaw);
      const customerId = await addCustomer(business.id, name.trim(), phone.trim() || undefined, balance);
      router.push(`/customer/${customerId}`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not add customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Illustration */}
        <View style={styles.illustration}>
          <MaterialCommunityIcons name="account-plus" size={64} color={COLORS.primary} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Suresh Verma"
              placeholderTextColor={COLORS.inkLight}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor={COLORS.inkLight}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Opening Balance</Text>
          <Text style={styles.cardSub}>
            Set if this customer already has an existing balance
          </Text>

          {/* Balance type toggle */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, balanceType === 'credit' && styles.toggleActive]}
              onPress={() => setBalanceType('credit')}
            >
              <Text style={[styles.toggleText, balanceType === 'credit' && styles.toggleActiveText]}>
                They owe me (Credit)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, balanceType === 'debit' && styles.toggleDebitActive]}
              onPress={() => setBalanceType('debit')}
            >
              <Text style={[styles.toggleText, balanceType === 'debit' && styles.toggleActiveText]}>
                I owe them (Debit)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.amountWrap}>
            <Text style={styles.rupee}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={COLORS.inkLight}
              value={openingBalance}
              onChangeText={setOpeningBalance}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.disabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Add Customer</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  scroll: { padding: 16, paddingBottom: 48 },
  illustration: { alignItems: 'center', paddingVertical: 24 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.ink, marginBottom: 4 },
  cardSub: { fontSize: 13, color: COLORS.inkMuted, marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.inkMuted, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: COLORS.ink,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  toggleActive: { borderColor: COLORS.credit, backgroundColor: COLORS.creditLight },
  toggleDebitActive: { borderColor: COLORS.debit, backgroundColor: COLORS.debitLight },
  toggleText: { fontSize: 13, fontWeight: '600', color: COLORS.inkMuted },
  toggleActiveText: { color: COLORS.ink },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  rupee: { fontSize: 22, color: COLORS.inkMuted, marginRight: 4 },
  amountInput: { flex: 1, fontSize: 28, fontWeight: '700', color: COLORS.ink, paddingVertical: 10 },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  disabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
