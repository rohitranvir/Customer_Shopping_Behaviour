import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Entry point — decides where to redirect:
 *  1. Loading → spinner
 *  2. No user  → setup (onboarding)
 *  3. User exists but not authenticated → unlock (PIN)
 *  4. Authenticated → tabs (home)
 */
export default function Index() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    const checkAuthMethodAndRoute = async () => {
      if (!user) {
        router.replace('/(auth)/setup');
        return;
      }

      if (!isAuthenticated) {
        const authMethod = await AsyncStorage.getItem('auth_method');
        if (authMethod === 'google') {
          // Bypass unlock and trust the persistent Google session
          useAuthStore.getState().unlock();
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/unlock');
        }
      } else {
        router.replace('/(tabs)');
      }
    };

    checkAuthMethodAndRoute();
  }, [isLoading, user, isAuthenticated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
  },
});
