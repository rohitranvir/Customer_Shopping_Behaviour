import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for sensitive data stored in Keychain/Keystore
const KEYS = {
  GOOGLE_TOKEN: 'google_token',
} as const;

// Keys for non-sensitive settings stored in AsyncStorage
const ASYNC_KEYS = {
  AUTO_BACKUP: 'auto_backup',
  LAST_BACKUP: 'last_backup',
  THEME: 'theme',
} as const;

// ─── Secure Storage (iOS Keychain / Android Keystore) ────────────────────────

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.GOOGLE_TOKEN, token);
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(KEYS.GOOGLE_TOKEN);
}

export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.GOOGLE_TOKEN);
}

// ─── Non-sensitive Settings (AsyncStorage) ───────────────────────────────────

export async function setAutoBackup(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(ASYNC_KEYS.AUTO_BACKUP, enabled ? 'true' : 'false');
}

export async function getAutoBackup(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ASYNC_KEYS.AUTO_BACKUP);
  return val === 'true';
}

export async function setLastBackupTime(dateString: string): Promise<void> {
  await AsyncStorage.setItem(ASYNC_KEYS.LAST_BACKUP, dateString);
}

export async function getLastBackupTime(): Promise<string | null> {
  return await AsyncStorage.getItem(ASYNC_KEYS.LAST_BACKUP);
}

export async function setTheme(isDark: boolean): Promise<void> {
  await AsyncStorage.setItem(ASYNC_KEYS.THEME, isDark ? 'dark' : 'light');
}

export async function getTheme(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ASYNC_KEYS.THEME);
  return val === 'dark';
}
