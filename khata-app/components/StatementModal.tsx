import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface StatementModalProps {
  visible: boolean;
  onClose: () => void;
  onDownload: (startDate?: string, endDate?: string) => Promise<void>;
  loading: boolean;
}

type RangeType = 'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM';

export default function StatementModal({ visible, onClose, onDownload, loading }: StatementModalProps) {
  const [rangeType, setRangeType] = useState<RangeType>('THIS_MONTH');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    if (visible) {
      setRangeType('THIS_MONTH');
      setCustomStart('');
      setCustomEnd('');
    }
  }, [visible]);

  const handleDownload = () => {
    const now = new Date();
    
    if (rangeType === 'ALL') {
      onDownload(undefined, undefined);
    } else if (rangeType === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      onDownload(firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]);
    } else if (rangeType === 'LAST_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      onDownload(firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]);
    } else if (rangeType === 'CUSTOM') {
      onDownload(customStart || undefined, customEnd || undefined);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.content}>
          <View style={styles.header}>
             <MaterialCommunityIcons name="file-pdf-box" size={24} color={COLORS.primary} />
             <Text style={styles.title}>Download Statement</Text>
             <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={loading}>
               <MaterialCommunityIcons name="close" size={24} color={COLORS.inkMuted} />
             </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.optionsWrap}>
             {(['ALL', 'THIS_MONTH', 'LAST_MONTH', 'CUSTOM'] as RangeType[]).map((type) => {
               const labels: Record<RangeType, string> = {
                  ALL: 'All Time',
                  THIS_MONTH: 'This Month',
                  LAST_MONTH: 'Last Month',
                  CUSTOM: 'Custom Date Range',
               };
               const isActive = rangeType === type;
               return (
                 <TouchableOpacity 
                    key={type} 
                    style={[styles.optionRow, isActive && styles.optionActive]}
                    onPress={() => setRangeType(type)}
                 >
                    <View style={[styles.radio, isActive && styles.radioActive]}>
                       {isActive && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                      {labels[type]}
                    </Text>
                 </TouchableOpacity>
               )
             })}
          </View>

          {/* Custom Date Inputs */}
          {rangeType === 'CUSTOM' && (
            <View style={styles.customRow}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.inkLight}
                  value={customStart}
                  onChangeText={setCustomStart}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>End Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.inkLight}
                  value={customEnd}
                  onChangeText={setCustomEnd}
                />
              </View>
            </View>
          )}

          <TouchableOpacity 
             style={[styles.downloadBtn, loading && styles.disabled]} 
             onPress={handleDownload}
             disabled={loading}
          >
             <MaterialCommunityIcons name="download" size={20} color="#fff" />
             <Text style={styles.downloadText}>{loading ? 'Generating...' : 'Download PDF'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  content: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  optionsWrap: { marginBottom: 16 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  optionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.inkMuted,
  },
  optionTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  customRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputWrap: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.inkMuted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    color: COLORS.ink,
    fontSize: 14,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    gap: 8,
  },
  disabled: { opacity: 0.7 },
  downloadText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
