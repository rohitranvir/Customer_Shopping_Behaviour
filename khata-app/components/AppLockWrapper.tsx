import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import PinPad from './PinPad';
import { COLORS } from '../utils/constants';

/**
 * AppLockWrapper
 *
 * Wraps the entire navigation tree. When the app returns from background
 * and the user has a PIN lock enabled (auth_method !== 'google'), this
 * component renders a full-screen overlay requesting PIN re-entry.
 *
 * For Google-authenticated users the overlay is skipped entirely.
 */
export default function AppLockWrapper({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, verifyPin, unlock } = useAuthStore();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (
        (prevState === 'background' || prevState === 'inactive') &&
        nextState === 'active'
      ) {
        // App came back to foreground
        if (!user) return; // Not logged in, nothing to lock

        const authMethod = await AsyncStorage.getItem('auth_method');
        if (authMethod === 'google') {
          // Google users never see the PIN lock
          return;
        }

        // PIN users need to re-authenticate
        setLocked(true);
        setError(null);
        setAttempts(0);
      }
    });

    return () => subscription.remove();
  }, [user]);

  // If the auth store says authenticated transitions to false externally, show lock
  useEffect(() => {
    if (!isAuthenticated && user) {
      AsyncStorage.getItem('auth_method').then((method) => {
        if (method !== 'google') {
          setLocked(true);
        }
      });
    }
  }, [isAuthenticated, user]);

  const handlePin = async (pin: string) => {
    const isValid = await verifyPin(pin);
    if (isValid) {
      unlock();
      setLocked(false);
      setError(null);
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      shake();
      setError(
        newAttempts >= 5
          ? 'Too many failed attempts. Please try again carefully.'
          : `Incorrect PIN. ${5 - newAttempts} attempts remaining.`
      );
    }
  };

  if (!locked) {
    return <>{children}</>;
  }

  return (
    <View style={styles.overlay}>
      {/* Branding */}
      <View style={styles.top}>
        <View style={styles.logoWrap}>
          <MaterialCommunityIcons name="shield-lock" size={40} color="#fff" />
        </View>
        <Text style={styles.appName}>Khata Book</Text>
        {user && <Text style={styles.userName}>{user.name}</Text>}
        <Text style={styles.subtitle}>App was locked for security</Text>
      </View>

      {/* PIN Pad */}
      <Animated.View style={[styles.padWrap, { transform: [{ translateX: shakeAnim }] }]}>
        <PinPad
          title="Enter PIN to Continue"
          subtitle="Your data is protected with a PIN"
          onComplete={handlePin}
          error={error}
        />
      </Animated.View>

      <Text style={styles.footer}>🔒 Your data is stored securely on this device</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surfaceSecondary,
    zIndex: 9999,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  top: {
    alignItems: 'center',
  },
  logoWrap: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: -0.5,
  },
  userName: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.inkMuted,
    marginTop: 6,
  },
  padWrap: {
    width: '100%',
  },
  footer: {
    fontSize: 12,
    color: COLORS.inkLight,
    textAlign: 'center',
  },
});
