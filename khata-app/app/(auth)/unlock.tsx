import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import PinPad from '../../components/PinPad';
import { COLORS } from '../../utils/constants';

export default function UnlockScreen() {
  const router = useRouter();
  const { user, verifyPin, unlock } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const shakeAnim = new Animated.Value(0);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePin = async (pin: string) => {
    const isValid = await verifyPin(pin);
    if (isValid) {
      setError(null);
      unlock();
      router.replace('/(tabs)');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      shake();
      setError(
        newAttempts >= 5
          ? 'Too many attempts. Are you sure about your PIN?'
          : 'Incorrect PIN. Please try again.'
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top branding */}
      <View style={styles.top}>
        <View style={styles.logoWrap}>
          <MaterialCommunityIcons name="book-account" size={36} color="#fff" />
        </View>
        <Text style={styles.appName}>Khata Book</Text>
        {user && <Text style={styles.bizName}>{user.name}</Text>}
      </View>

      {/* PIN Pad */}
      <Animated.View style={[styles.padWrap, { transform: [{ translateX: shakeAnim }] }]}>
        <PinPad
          title="Enter PIN"
          subtitle="Enter your 4-digit PIN to unlock"
          onComplete={handlePin}
          error={error}
        />
      </Animated.View>

      <Text style={styles.footer}>Your data is stored securely on this device</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'space-between',
    paddingVertical: 60,
    alignItems: 'center',
  },
  top: { alignItems: 'center' },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  appName: { fontSize: 26, fontWeight: '800', color: COLORS.ink },
  bizName: { fontSize: 14, color: COLORS.inkMuted, marginTop: 4 },
  padWrap: { width: '100%', alignItems: 'center' },
  footer: { fontSize: 12, color: COLORS.inkLight, textAlign: 'center' },
});
