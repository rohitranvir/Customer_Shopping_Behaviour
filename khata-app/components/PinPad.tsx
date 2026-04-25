import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, PIN_LENGTH } from '../utils/constants';

interface PinPadProps {
  title?: string;
  subtitle?: string;
  onComplete: (pin: string) => void;
  onForgot?: () => void;
  error?: string | null;
}

const KEYS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '', '0', 'DEL',
];

export default function PinPad({
  title = 'Enter PIN',
  subtitle,
  onComplete,
  onForgot,
  error,
}: PinPadProps) {
  const [pin, setPin] = useState('');

  const handleKey = (key: string) => {
    if (key === '') return;
    if (key === 'DEL') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= PIN_LENGTH) return;

    const newPin = pin + key;
    setPin(newPin);

    if (newPin.length === PIN_LENGTH) {
      Vibration.vibrate(50);
      setTimeout(() => {
        onComplete(newPin);
        setPin('');
      }, 150);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* PIN dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < pin.length && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Keypad */}
      <View style={styles.grid}>
        {KEYS.map((key, idx) => {
          if (key === '') {
            return <View key={idx} style={styles.emptyKey} />;
          }
          if (key === 'DEL') {
            return (
              <TouchableOpacity
                key={idx}
                style={styles.key}
                onPress={() => handleKey('DEL')}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="backspace-outline"
                  size={22}
                  color={COLORS.ink}
                />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={idx}
              style={styles.key}
              onPress={() => handleKey(key)}
              activeOpacity={0.7}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {onForgot && (
        <TouchableOpacity onPress={onForgot} style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Forgot PIN?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 32 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.inkMuted,
    marginBottom: 32,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.inkLight,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dotError: {
    borderColor: COLORS.debit,
  },
  errorText: {
    color: COLORS.debit,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 270,
    marginTop: 24,
    gap: 12,
  },
  key: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  emptyKey: { width: 78, height: 78 },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.ink,
  },
  forgotBtn: { marginTop: 28 },
  forgotText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
