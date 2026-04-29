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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exportDatabaseAsJSON } from '../db/backup';
import { uploadBackupToDrive } from '../utils/googleDrive';
import { useThemeStore } from '../store/useThemeStore';
import { COLORS } from '../utils/constants';
import { ToastHost } from '../components/Toast';
import * as SplashScreen from 'expo-splash-screen';
import { getAutoBackup, getToken, setLastBackupTime } from '../security/secureStorage';
import { requestNotificationPermission } from '../utils/notifications';

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
    const handleAppState = async (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        try {
          const auto = await getAutoBackup();
          const token = await getToken();
          if (auto && token) {
            console.log('Running silent auto-backup...');
            const json = await exportDatabaseAsJSON();
            await uploadBackupToDrive(token, json);
            await setLastBackupTime(new Date().toLocaleString());
          }
        } catch (e) {
          console.log('[AutoBackup Error]:', e);
        }
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, []);

  return (
    <PaperProvider theme={isDark ? darkPaperTheme : lightPaperTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={isDark ? '#0f172a' : COLORS.surfaceSecondary} />
      <View className={isDark ? 'dark flex-1' : 'flex-1'}>
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
        <ToastHost />
      </View>
    </PaperProvider>
  );
}
