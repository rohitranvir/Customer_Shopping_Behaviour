import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  configureGoogleSignIn,
  signInWithGoogle,
  signOutGoogle,
  getGoogleAccessToken,
  uploadBackupToDrive,
  listBackupsFromDrive,
  downloadBackupFromDrive,
  DriveFile,
} from '../utils/googleDrive';
import { exportDatabaseAsJSON, importDatabaseFromJSON } from '../db/backup';

const LAST_BACKUP_KEY = 'last_drive_backup_time';
const AUTO_BACKUP_ENABLED_KEY = 'auto_backup_enabled';
const BACKUP_FREQUENCY_KEY = 'backup_frequency';

export type BackupFrequency = 'TRANSACTION' | 'DAILY' | 'WEEKLY';

// ─── State Shape ──────────────────────────────────────────────────────────────
interface GoogleDriveState {
  isSignedIn: boolean;
  accessToken: string | null;
  lastBackup: string | null;
  backupFiles: DriveFile[];
  isLoading: boolean;
  error: string | null;

  isAutoBackupEnabled: boolean;
  backupFrequency: BackupFrequency;

  // Actions
  init: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  backup: (silent?: boolean) => Promise<void>;
  listBackups: () => Promise<void>;
  restore: (fileId: string) => Promise<void>;
  clearError: () => void;
  setAutoBackupEnabled: (enabled: boolean) => Promise<void>;
  setBackupFrequency: (freq: BackupFrequency) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useGoogleDriveStore = create<GoogleDriveState>((set, get) => ({
  isSignedIn: false,
  accessToken: null,
  lastBackup: null,
  backupFiles: [],
  isLoading: false,
  error: null,

  isAutoBackupEnabled: false,
  backupFrequency: 'TRANSACTION',

  // ── Init: configure GoogleSignin + check if user is already signed in ────────
  init: async () => {
    configureGoogleSignIn();
    try {
      const token = await getGoogleAccessToken();
      const lastBackup = await AsyncStorage.getItem(LAST_BACKUP_KEY);
      const autoEnabled = await AsyncStorage.getItem(AUTO_BACKUP_ENABLED_KEY);
      const freq = await AsyncStorage.getItem(BACKUP_FREQUENCY_KEY);

      set({
        isAutoBackupEnabled: autoEnabled === 'true',
        backupFrequency: (freq as BackupFrequency) || 'TRANSACTION',
      });

      if (token) {
        set({ isSignedIn: true, accessToken: token, lastBackup });
      } else {
        set({ isSignedIn: false, accessToken: null, lastBackup });
      }
    } catch {
      set({ isSignedIn: false, accessToken: null });
    }
  },

  // ── Auto Backup Settings ─────────────────────────────────────────────────────
  setAutoBackupEnabled: async (enabled: boolean) => {
    await AsyncStorage.setItem(AUTO_BACKUP_ENABLED_KEY, enabled ? 'true' : 'false');
    set({ isAutoBackupEnabled: enabled });
  },

  setBackupFrequency: async (freq: BackupFrequency) => {
    await AsyncStorage.setItem(BACKUP_FREQUENCY_KEY, freq);
    set({ backupFrequency: freq });
  },

  // ── Sign In ──────────────────────────────────────────────────────────────────
  signIn: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await signInWithGoogle();
      const lastBackup = await AsyncStorage.getItem(LAST_BACKUP_KEY);
      // Auto enable backup on fresh sign in to mimic WhatsApp behaviour
      await AsyncStorage.setItem(AUTO_BACKUP_ENABLED_KEY, 'true');
      
      set({ 
        isSignedIn: true, 
        accessToken: token, 
        lastBackup, 
        isAutoBackupEnabled: true,
        isLoading: false 
      });
    } catch (e: any) {
      const msg =
        e?.code === '12501'
          ? 'Sign-in cancelled.'
          : e?.message ?? 'Google Sign-In failed. Please try again.';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  // ── Sign Out ─────────────────────────────────────────────────────────────────
  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOutGoogle();
      set({
        isSignedIn: false,
        accessToken: null,
        backupFiles: [],
        isLoading: false,
      });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Sign-out failed.' });
    }
  },

  // ── Backup: export DB as JSON, upload to Drive ───────────────────────────────
  backup: async (silent = false) => {
    const token = await getGoogleAccessToken();
    if (!token) throw new Error('Not signed in to Google.');
    
    // Update local token
    set({ accessToken: token });

    if (!silent) set({ isLoading: true, error: null });
    try {
      const jsonContent = await exportDatabaseAsJSON();
      await uploadBackupToDrive(token, jsonContent);
      const dateStr = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      await AsyncStorage.setItem(LAST_BACKUP_KEY, dateStr);
      set({ lastBackup: dateStr });
      if (!silent) set({ isLoading: false });
    } catch (e: any) {
      const msg = e?.message ?? 'Backup failed. Please try again.';
      if (!silent) set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  // ── List Backups from Drive ──────────────────────────────────────────────────
  listBackups: async () => {
    const token = await getGoogleAccessToken();
    if (!token) return;
    set({ accessToken: token, isLoading: true, error: null });
    try {
      const files = await listBackupsFromDrive(token);
      set({ backupFiles: files, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Could not list backups.' });
    }
  },

  // ── Restore: download JSON from Drive, import into DB ───────────────────────
  restore: async (fileId: string) => {
    const token = await getGoogleAccessToken();
    if (!token) throw new Error('Not signed in to Google.');
    set({ accessToken: token, isLoading: true, error: null });
    try {
      const jsonContent = await downloadBackupFromDrive(token, fileId);
      await importDatabaseFromJSON(jsonContent);
      set({ isLoading: false });
    } catch (e: any) {
      const msg = e?.message ?? 'Restore failed. The file may be corrupt.';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  // ── Clear error ──────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));
