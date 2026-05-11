import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useAuthStore } from '../store/useAuthStore';
import { useBusinessStore } from '../store/useBusinessStore';
import { initDatabase } from '../db/database';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { COLORS } from '../utils/constants';
import { ToastHost } from '../components/Toast';
import AppLockWrapper from '../components/AppLockWrapper';
import * as SplashScreen from 'expo-splash-screen';
import { requestNotificationPermission } from '../utils/notifications';
import { useGoogleDriveStore } from '../store/useGoogleDriveStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep splash visible until DB + user loaded
SplashScreen.preventAutoHideAsync();

const lightPaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.credit,
    background: COLORS.surfaceSecondary,
    surface: COLORS.surface,
    error: COLORS.debit,
  },
};

const darkPaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60a5fa',
    secondary: '#4ade80',
    background: '#0f172a',
    surface: '#1e293b',
    error: '#f87171',
  },
};

export default function RootLayout() {
  const { loadUser, user } = useAuthStore();
  const { loadBusiness } = useBusinessStore();
  const { isDark, loadTheme } = useThemeStore();

  useEffect(() => {
    (async () => {
      await initDatabase();
      await loadUser();
      await loadTheme();
      await requestNotificationPermission();
      await useGoogleDriveStore.getState().init();
      // Safe to hide splash now
      await SplashScreen.hideAsync();
    })();
  }, []);

  useEffect(() => {
    if (user) {
      loadBusiness(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    const checkDailyBackup = async () => {
      try {
        const driveStore = useGoogleDriveStore.getState();
        if (driveStore.isSignedIn && driveStore.isAutoBackupEnabled) {
          const lastBackupStr = await AsyncStorage.getItem('last_daily_backup_timestamp');
          const now = Date.now();
          // Check if 24 hours (86400000 ms) have passed
          if (!lastBackupStr || (now - parseInt(lastBackupStr, 10)) > 86400000) {
            console.log('Running daily silent auto-backup...');
            await driveStore.backup(true);
            await AsyncStorage.setItem('last_daily_backup_timestamp', now.toString());
          }
        }
      } catch (e) {
        // Silent
      }
    };

    // Run on mount (app open)
    checkDailyBackup();

    // Also run on app foregrounding
    const handleAppState = async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        checkDailyBackup();
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, []);

  return (
    <PaperProvider theme={isDark ? darkPaperTheme : lightPaperTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={isDark ? '#0f172a' : COLORS.surfaceSecondary} />
      <View className={isDark ? 'dark flex-1' : 'flex-1'}>
        <AppLockWrapper>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)/setup" />
            <Stack.Screen name="(auth)/unlock" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="customer/[id]"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: isDark ? '#1e293b' : COLORS.surface },
                headerShadowVisible: false,
                headerTintColor: COLORS.primary,
                title: 'Ledger',
              }}
            />
            <Stack.Screen
              name="customer/add"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: isDark ? '#1e293b' : COLORS.surface },
                headerShadowVisible: false,
                headerTintColor: COLORS.primary,
                title: 'Add Customer',
              }}
            />
          </Stack>
        </AppLockWrapper>
        <ToastHost />
      </View>
    </PaperProvider>
  );
}
